rm ./www/ -rf
rm ./dist/ -rf
npm run prebuild
ng build --base-href ./ --prod
mv ./www/electron.js ./www/index.js
cp ./package.json ./www
sed -i '18d' ./www/package.json
electron-builder