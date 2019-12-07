# Run server

Using the gpt-2 docker container, run the server.

```
~/bin/docker-gpt2

$ cd /repo
$ pip install flask flask_cors
$ sh run.sh
```

Get another Docker terminal and send a request

```
sudo docker container ls
sudo docker exec -it <container_id_from_above> /bin/bash

$ cd /repo
$ sh req.sh "some text to try"
```


