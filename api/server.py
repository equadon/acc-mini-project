#!/usr/bin/python3

from flask import Flask, request, jsonify
import json
import time
import functools

app = Flask(__name__)

mockstate = {"running": False, "servers": 0}


def success(data):
    """Success response."""
    return jsonify({
        'status': 'success',
        'data': data,
    })

def fail(data):
    """Problem with the submitted data, or some pre-condition of the API call wasn't satisfied."""
    return jsonify({
        'status': 'fail',
        'data': data,
    })

def error(message, code=None, data=None):
    """Error occurred in processing the request, i.e. an exception was thrown."""
    response = {
        'status': 'error',
        'message': message,
    }
    if code:
        response['code'] = code
    if data:
        response['data'] = data
    return jsonify(response)


# === ERROR HANDLING === #

class ServerNotStarted(Exception):
    pass


def server_started_guard(f):
    @functools.wraps(f)
    def wrapper(*args, **kwargs):
        if not mockstate["running"]:
            raise ServerNotStarted
        else:
            return f(*args, **kwargs)

    return wrapper


@app.errorhandler(ValueError)
def handle_value_error(e):
    return fail('invalid data'), 400


@app.errorhandler(ServerNotStarted)
def handle_server_not_started(e):
    return error('server not started'), 400


# === API ENDPOINTS === #


@app.route('/api/start', methods=['POST', 'GET'])
def start():
    num_servers = request.data or 5
    time.sleep(5)
    mockstate['running'] = True
    mockstate['servers'] = num_servers

    return success(None)


@app.route('/api/status', methods=['GET'])
def status():
    return success(mockstate)


@app.route('/api/resize', methods=['POST'])
@server_started_guard
def resize():
    data = request.get_json()
    print(data)
    if not data:
        return fail('no data recieved')
    # if data[0] == '+' or data[0] == '-':
    #     mockstate['servers'] += int(data)
    # else:
    #     mockstate['servers'] = int(data)
    time.sleep(3)
    return success(None)


@app.route('/api/inject', methods=['POST'])
@server_started_guard
def inject():
    files = request.files
    print(request.get_data())
    print(files)
    for name, content in files.items():
        f = open("recieved_files/" + name, "w+b")
        # .seek and .truncate is to overwrite the previous content
        f.seek(0)
        f.write(content.read())
        f.truncate()
    return success(None)


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
