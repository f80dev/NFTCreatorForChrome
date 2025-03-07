git commit -a -m "commit pour publication devnet"
copy .\src\CNAME_devnet .\src\CNAME
copy .\src\index_devnet.html .\src\index.html
copy .\src\manifest-devnet.webmanifest .\src\manifest.webmanifest
call ng build --aot --output-hashing=none --source-map=false --optimization=true --configuration development
call gh-pages -d ./dist --repo https://github.com/f80dev/nftfactory_devnet.git -f -t true -b gh-pages -m \"update from main\"",
