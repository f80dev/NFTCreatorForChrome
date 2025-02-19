docker exec -it ipfs ipfs config --json Addresses.API '"/ip4/0.0.0.0/tcp/5001"'
docker exec -it ipfs ipfs config --json Addresses.Gateway '"/ip4/0.0.0.0/tcp/8080"'
docker exec -it ipfs ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
docker exec -it ipfs ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST"]'
