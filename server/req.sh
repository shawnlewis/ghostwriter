echo "{\"text\": \"$@\"}"
curl -d "{\"text\": \"$@\"}" \
    -H 'Content-Type: application/json' \
    -X POST \
    http://localhost:5000/generate
