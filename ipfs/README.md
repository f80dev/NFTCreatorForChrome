# Install IPFS

pour effacer le répertoire :
    rm -r /root/ipfs
    docker rm -f ipfs_host

voir https://docs.ipfs.tech/install/run-ipfs-inside-docker/
et https://ismdeep.com/posts/2024-03-19-deploy-ipfs-with-nginx-in-docker.html

    mkdir /root/ipfs
    mkdir /root/ipfs/data
    docker-compose up -d
    ufw allow 5001
    ufw allow 4001
    
    docker exec -it ipfs ipfs daemon    
    docker exec -it ipfs ipfs config --json Addresses.API '"/ip4/0.0.0.0/tcp/5001"'
    docker exec -it ipfs ipfs config --json Addresses.Gateway '"/ip4/0.0.0.0/tcp/8080"' 
    docker exec -it ipfs ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '*'
    docker exec -it ipfs ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST"]'


Parametrage du docker IPFS : /ip4/93.127.202.181/tcp/5001

Pour le server F80: 
    certbot certonly --standalone --email hhoareau@gmail.com -d ipfs.f80.fr
    cp /etc/letsencrypt/live/ipfs.f80.fr/* /root/ipfs

Si l'on veut sécuriser l'accès au serveur on ajout dans le default.conf
    
    auth_basic           "Administrator’s Area";
    auth_basic_user_file /htpasswd;
