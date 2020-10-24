#!/usr/bin/python3

from flask import Flask, request, jsonify
# from ansible_runner import interface
import subprocess
import time
import functools
import re

app = Flask(__name__)


def run_ans(n, extra_vars=[]):
    arguments = ["ansible-playbook",
                 "../ansible/launch_cluster_ansible.yml",
                 "--extra-vars",
                 f'"count={n} {" ".join(extra_vars)}"']
    call = subprocess.run(
            arguments,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE)
    print(call.stdout, call.stderr)
    return call.returncode


SPARK_LINE_REGEX = re.compile(r'(\d{3}\.\d{3}\.\d{2,3}\.\d{2,3}) spark_node\d+')


def get_spark_ips():
    f = open('/etc/hosts', 'r')
    lines = f.readlines()
    ips = []
    for line in lines:
        match = SPARK_LINE_REGEX.match(line)
        if match:
            ips.append(match.group(1))
    return ips


def check_status():
    f = open('/etc/hosts', 'r')
    lines = f.readlines()
    server_count = len(list(filter(lambda line: SPARK_LINE_REGEX.match(line), lines)))
    f.close()
    return {'running': server_count != 0, 'servers': server_count}


def clean_hosts_file():
    subprocess.Popen(['sudo', 'sed', '-i', '/spark_node/d', '/etc/hosts'])


def success(data):
    """Success response."""
    return jsonify({
        'status': 'success',
        'data': data,
    })


def fail(data):
    """Problem with the submitted data,
    or some pre-condition of the API call wasn't satisfied."""
    return jsonify({
        'status': 'fail',
        'data': data,
    })


def error(message, code=None, data=None):
    """Error occurred in processing the request,
    i.e. an exception was thrown."""
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
        status = check_status()
        if not status['running']:
            raise ServerNotStarted
        else:
            return f(status, **kwargs)

    return wrapper


@app.errorhandler(ValueError)
def handle_value_error(e):
    print(e)
    return fail('invalid data'), 400


@app.errorhandler(ServerNotStarted)
def handle_server_not_started(e):
    return error('server not started'), 400


# === API ENDPOINTS === #

@app.route('/api/start', methods=['POST', 'GET'])
def start():
    num_servers = int(request.get_data()) or 2
    returncode = run_ans(num_servers)
    if returncode == 0:
        return success(check_status())
    else:
        return fail("Ansible exited with code 1")


@app.route('/api/shutdown', methods=['POST', 'GET'])
@server_started_guard
def shutdown(status):
    print(status)
    run_ans(status["servers"], extra_vars=["cluster_state=absent"])
    clean_hosts_file()

    return success(None)


@app.route('/api/status', methods=['GET'])
def status():
    return success(check_status())


@app.route('/api/resize', methods=['POST'])
@server_started_guard
def resize(status):
    data = request.get_data()
    print(data)
    if not data:
        return fail('no data recieved')

    run_ans(status + int(data))
    return success(None)


@app.route('/api/inject', methods=['POST'])
@server_started_guard
def inject(*args):
    files = request.files
    ips = get_spark_ips()
    for name, content in files.items():
        f = open("recieved_files/" + name, "w+b")
        # .seek and .truncate is to overwrite the previous content
        f.seek(0)
        f.write(content.read())
        f.truncate()
        for ip in ips:
            subprocess.Popen(
                    ['scp',
                        '-o', 'StrictHostKeyChecking=no',
                        '-o', 'UserKnownHostsFile=/dev/null',
                        f'recieved_files/{name}', f'ubuntu@{ip}:~/'])
    return success(None)


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
