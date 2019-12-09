FROM gcr.io/ghostwrite/gpt2:v1

RUN pip install flask flask_cors

RUN mkdir /app
WORKDIR /app
ADD . /app

ENTRYPOINT sh run-prod.sh
