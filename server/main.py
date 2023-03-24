#!/usr/local/bin/python3

from flask import Flask, abort, jsonify, request
from flask_cors import CORS, cross_origin

from handle_request import handle_request
from model_provider import multi_model

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
        username = data.get('username', '') or '-'
        session_id = data.get('sessionId', '') or '-'
        model_id = data.get('modelId', 'gpt2') or 'gpt2'
        result = handle_request(model_id=model_id, 
                                text=text,
                                username=username,
                                session_id=session_id,
                                max_length=50)
        return jsonify({'result': result})
    
@app.route('/models', methods=['POST'])
def models():
    return multi_model.get_model_meta()

@app.route('/', methods=['GET'])
def root():
    return 'ok'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9911)