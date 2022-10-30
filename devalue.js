import { uneval } from 'devalue';
import glob from 'glob';
import fs from 'fs';
import YAML from 'js-yaml';

const [node, prog, src, tgt] = process.argv;
console.log({ node, prog, src, tgt });

glob(`${src}/*.yml`, (err, files) => {
	files.forEach((file) => {
		fs.readFile(file, 'utf8', (err, data) => {
			const outFile = file.replace(src, tgt).replace('.yml', '.js');
			const obj = YAML.load(data);
			fs.writeFile(outFile, 'export default ' + uneval(obj), (err) => {
				console.log(`${outFile} <== ${file}`);
			});
		});
	});
});
