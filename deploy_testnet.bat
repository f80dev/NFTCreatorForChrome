git commit -a -m "commit pour publication devnet"
copy .\src\CNAME_testnet .\src\CNAME
copy .\src\index_testnet.html .\src\index.html
copy .\src\environments\settings_testnet.ts .\src\environments\settings.ts
copy .\src\manifest-testnet.webmanifest .\src\manifest.webmanifest
call ng build --aot --output-hashing=all --source-map=false --optimization=true --configuration development
call gh-pages -d ./dist --repo https://github.com/f80dev/NFTNowTestnet.git -f -t true -b master -m \"update from testnet\"",
