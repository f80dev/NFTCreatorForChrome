# Install IPFS

pour effacer le répertoire :
    rm -r /root/ipfs
    docker rm -f ipfs_host

voir https://docs.ipfs.tech/install/run-ipfs-inside-docker/

    mkdir /root/ipfs
    mkdir /root/ipfs/staging
    mkdir /root/ipfs/data
    export ipfs_staging=/root/ipfs/staging
    export ipfs_data=/root/ipfs/data
    docker run --name ipfs_host -v $ipfs_staging:/export -v $ipfs_data:/data/ipfs -p 4001:4001 -p 4001:4001/udp -p 0.0.0.0:8080:8080 -p 0.0.0.0:5001:5001 ipfs/kubo:v0.33.2  
    ufw allow 5001
    ufw allow 4001
    
    docker exec -it ipfs_host ipfs daemon    
    docker exec -it ipfs_host ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '*'
    docker exec -it ipfs_host ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST"]'

    docker logs -f ipfs_host

Parametrage du docker IPFS : /ip4/93.127.202.181/tcp/5001

