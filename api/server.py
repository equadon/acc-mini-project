#!/usr/bin/python3

from flask import Flask, request
import json
import time
import functools

app = Flask(__name__)

mockstate = {"running": False, "servers": 0}


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
    return "invlid data", 400


@app.errorhandler(ServerNotStarted)
def handle_server_not_started(e):
    return "server not started", 400


# === API ENDPOINTS === #


@app.route('/start', methods=['POST', 'GET'])
def start():
    num_servers = request.data or 5
    time.sleep(5)
    mockstate["running"] = True
    mockstate["servers"] = num_servers
    return "success"


@app.route('/status', methods=['GET'])
def status():
    return json.dumps(mockstate)


@app.route('/resize', methods=['POST'])
@server_started_guard
def resize():
    data = request.get_data(as_text=True)
    print(data)
    if not data:
        return "no data recieved"
    if data[0] == '+' or data[0] == "-":
        mockstate["servers"] += int(data)
    else:
        mockstate["servers"] = int(data)
    time.sleep(3)
    return "success"


@app.route('/inject', methods=['POST'])
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
    return "success"


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
