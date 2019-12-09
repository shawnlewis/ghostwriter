npm run build

BUCKET="ghostwrite.ai"

gsutil -m cp -R ./build/* gs://${BUCKET}