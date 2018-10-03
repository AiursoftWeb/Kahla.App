#!/bin/bash

rm -rf ./www/
rm -rf ./dist/
npm run prebuild
ng build --base-href ./ --prod
mv ./www/electron.js ./www/index.js
cp ./package.json ./www

if [[ "$OSTYPE" == "darwin"* ]]
then
    sed -i '' '/postinstall/d' ./www/package.json
else
    sed -i '/postinstall/d' ./www/package.json
fi

cd ./www

if ! [ -x "$(command -v electron-builder)" ]
then
    ../node_modules/.bin/electron-builder
else
    electron-builder
fi

cd ..
