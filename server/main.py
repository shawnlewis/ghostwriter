#!/usr/local/bin/python3

from flask import Flask, abort, jsonify, request
from flask_cors import CORS, cross_origin

import textmodel

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.before_first_request
def init():
    print('INIT CALLED')
    textmodel.start()


@app.route("/generate", methods=['POST'])
@cross_origin()
def get_gen():
    data = request.get_json()

    if 'text' not in data or len(data['text']) == 0:
        abort(400)
    else:
        text = data['text']
        return jsonify({'result': textmodel.gen_sample(text)})

if __name__ == '__main__':
    app.run()