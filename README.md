# Install IPFS

voir https://docs.ipfs.tech/install/run-ipfs-inside-docker/

    mkdir /root/ipfs
    mkdir /root/ipfs/staging
    mkdir /root/ipfs/data
    export ipfs_staging=/root/ipfs/staging
    export ipfs_data=/root/ipfs/data
    docker run -d --name ipfs_host -v $ipfs_staging:/export -v $ipfs_data:/data/ipfs -p 4001:4001 -p 4001:4001/udp -p 127.0.0.1:8080:8080 -p 127.0.0.1:5001:5001 ipfs/kubo:v0.33.2
    ufw allow 5001
    ufw allow 4001
    docker logs -f ipfs_host

Parametrage du docker IPFS : /ip4/93.127.202.181/tcp/5001
