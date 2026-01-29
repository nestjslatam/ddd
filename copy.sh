mkdir -p ./dist/libs/ddd
cp -r ./libs/ddd/dist/* ./dist/libs/ddd/
cp ./libs/ddd/package.json ./dist/libs/ddd
cp ./libs/ddd/README.md ./dist/libs/ddd
cp ./libs/ddd/LICENSE ./dist/libs/ddd

# Remove build scripts and clean dependencies from distributed package.json
node -e "const fs=require('fs');const pkg=JSON.parse(fs.readFileSync('./dist/libs/ddd/package.json'));delete pkg.scripts;delete pkg.dependencies['@nestjslatam/ddd-lib'];delete pkg.devDependencies;fs.writeFileSync('./dist/libs/ddd/package.json',JSON.stringify(pkg,null,2));"
