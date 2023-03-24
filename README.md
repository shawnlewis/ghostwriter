# Run server

```
$ cd server
$ pyenv virtualenv 3.9.9 ghostwrite
$ pyenv local ghostwrite
$ pip install -r requirements.txt
$ python main.py
```

# Run a test request

```
$ cd server
$ sh req.sh "AI has come a long way..."
```

# Run frontend

```
$ cd frontend
$ npm install
$ npm start
```
