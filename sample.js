const fs = require('fs');

var sd = require('./SeoDetected.js');
var source = 'Sample.html';

// Read by file path and output as file and console
var shopbackFile = new sd();
shopbackFile.readFile(source)
	.detectedImgWithoutAlt()
	.detectedAWithoutRel()
    .detectedHeader()
    .detectedStrongOver(2)
    .detectedH1OverOne()
	.display()
    .saveToFile('output.txt');


// Reade by readable stream and output by writable stream and console
var shopbackStream = new sd();
var writable = shopbackStream.readStream(fs.createReadStream(source))
	.detectedImgWithoutAlt()
	.detectedAWithoutRel()
    .detectedHeader()
    .detectedStrongOver(2)
    .detectedH1OverOne()
	.display()
	.writeStream('streamOutput.txt');
