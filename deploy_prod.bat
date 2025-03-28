copy .\src\CNAME_prod .\src\CNAME
copy .\src\index_prod.html .\src\index.html
copy .\src\manifest-production.webmanifest .\src\manifest.webmanifest
copy .\src\environments\settings_prod.ts .\src\environments\settings.ts
git commit -a -m "commit pour publication production"
call npm version patch
call ng build --aot --output-hashing=all --source-map=false --optimization=true --configuration production
call gh-pages -d ./dist --repo https://github.com/f80dev/NFTNow.git -f -t true -b master -m \"update from production\"
