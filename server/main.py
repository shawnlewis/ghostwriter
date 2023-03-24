#!/usr/local/bin/python3

from flask import Flask, abort, jsonify, request
from flask_cors import CORS, cross_origin

import hf_model

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

model = hf_model.HfModel('gpt2')

@app.route("/generate", methods=['POST'])
@cross_origin()
def get_gen():
    data = request.get_json()

    if 'text' not in data or len(data['text']) == 0:
        abort(400)
    else:
        text = data['text']
        return jsonify({'result': model.gen(text)})

@app.route('/', methods=['GET'])
def root():
    return 'ok'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9911)