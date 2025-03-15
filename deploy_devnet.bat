git commit -a -m "commit pour publication devnet"
copy .\src\CNAME_devnet .\src\CNAME
copy .\src\index_devnet.html .\src\index.html
copy .\src\environments\settings_devnet.ts .\src\environments\settings.ts
copy .\src\manifest-devnet.webmanifest .\src\manifest.webmanifest
call ng build --aot --output-hashing=all --source-map=false --optimization=true --configuration development
call gh-pages -d ./dist --repo https://github.com/f80dev/NFTNowDevnet.git -f -t true -b master -m \"update from devnet\"",
