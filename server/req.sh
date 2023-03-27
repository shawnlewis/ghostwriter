echo "{\"text\": \"$@\"}"
curl -d "{\"text\": \"$@\"}" \
    -H 'Content-Type: application/json' \
    -X POST \
    http://127.0.0.1:9911/generate
