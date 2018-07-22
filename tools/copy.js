const fs = require('fs');

(function main() {
    // package.json
    let tempFile = fs.createReadStream('package.json').pipe(fs.createWriteStream('dist/package.json'));
    tempFile.on('close', () => {
        // Удалить лишнее из package.json
        const packageJson = JSON.parse(fs.readFileSync('./dist/package.json').toString());
        delete packageJson.devDependencies;
        delete packageJson.scripts;
        fs.writeFileSync('./dist/package.json', JSON.stringify(packageJson, null, 2));
    });

})();
