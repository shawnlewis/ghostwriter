#!/usr/local/bin/python3

from flask import Flask, abort, jsonify, request
from flask_cors import CORS, cross_origin

from handle_request import handle_request

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


@app.route("/generate", methods=['POST'])
@cross_origin()
def get_gen():
    data = request.get_json()

    if 'text' not in data or len(data['text']) == 0:
        abort(400)
    else:
        text = data['text']
        username = data.get('username', '')
        session_id = data.get('sessionId', '')
        model_id = data.get('modelId', 'gpt2-vanilla') or 'gpt2-vanilla'
        result = handle_request(model_id=model_id, 
                                text=text,
                                username=username,
                                session_id=session_id,
                                max_length=50)
        return jsonify({'result': result})

@app.route('/', methods=['GET'])
def root():
    return 'ok'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9911)