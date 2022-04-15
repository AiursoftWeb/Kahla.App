rm ./package-lock.json

currentBranch=$(git branch --show-current)
echo Current branch is: $currentBranch
if [ "$currentBranch" == "master" ]; then
   serversProvider="https://www.kahla.app"
else
   serversProvider="https://staging.kahla.app"
fi

echo Using serversProvider: $serversProvider

json="export const environment = { production: true, serversProvider: '$serversProvider' };"

echo Writting JSON: \"$json\"
echo $json > ./src/environments/environment.prod.ts

if [ "$currentBranch" == "master" ]; then
   echo 'building production PWA App'
else
   sed -i  "s/Kahla/Kahla Staging/g" ./src/manifest.json
fi

