rm ./www/ -rf
rm ./dist/ -rf
npm run prebuild
ng build --base-href ./ --prod
mv ./www/electron.js ./www/index.js
cp ./package.json ./www
sed -i '/postinstall/d' ./www/package.json
cd ./www
electron-builder
cd ..