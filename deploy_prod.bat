copy .\src\CNAME_prod .\src\CNAME
copy .\src\index_prod.html .\src\index.html
copy .\src\manifest-prod.webmanifest .\src\manisfest.webmanifest
git commit -a -m "commit pour publication production"
call npm version patch
call ng build --aot --output-hashing=none --source-map=false --optimization=true --configuration production
call gh-pages -d ./dist --repo https://github.com/f80dev/NFTCreatorForChrome.git -f -t true -b gh-pages -m \"update from main\"
