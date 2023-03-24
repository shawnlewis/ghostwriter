echo "{\"text\": \"$@\"}"
curl -d "{\"text\": \"$@\"}" \
    -H 'Content-Type: application/json' \
    -X POST \
    http://34.120.249.194/generate
