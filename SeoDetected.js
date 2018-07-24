const cheerio = require('cheerio');
const fs = require('fs');
const echoEol = "\r\n";
const fileEncode = 'utf8';

module.exports = SeoDetected;
function SeoDetected() {
	this.result = '';
	this.isFinish = true;
	this.funcPool = [];
}

// Read from file
SeoDetected.prototype.readFile = readFile;
function readFile(path) {
	var source = fs.readFileSync(path, fileEncode);
	this.$ = cheerio.load(source);

	return this;
}

// Read from stream
SeoDetected.prototype.readStream = readStream;
function readStream(readable) {
	var data = '';
	var parent = this;
	var tmpFuncName = '';
	var tmpParam = [];

	parent.isFinish = false;
	readable.setEncoding(fileEncode);

	// Get the content
	readable.on('data', function(chunk) {
		data += chunk;
	});

	// Execute the function from pool
	readable.on('end', function(chunk) {
		parent.isFinish = true;
		parent.$ = cheerio.load(data);

		parent.funcPool.forEach(function (element) {
			if (Array.isArray(element) === true) {
				tmpFuncName = element[0];
				tmpParam = element[1];
				parent[tmpFuncName](tmpParam);
			} else {
				tmpFuncName = element;
				parent[tmpFuncName]();
			}
		});
	});
	return this;
}

// Detect if any <img /> tag without alt attribute
SeoDetected.prototype.detectedImgWithoutAlt = detectedImgWithoutAlt;
function detectedImgWithoutAlt() {
	if (this.isFinish === true) {
		var tagName = 'img';
		var tagAttr = 'alt';
		this.countTagWithoutAttr(tagName, tagAttr);
	} else {
		this.funcPool.push('detectedImgWithoutAlt');
	}

	return this;
}

// Detect if any <a /> tag without rel attribute
SeoDetected.prototype.detectedAWithoutRel = detectedAWithoutRel;
function detectedAWithoutRel() {
	if (this.isFinish === true) {
		var tagName = 'a';
		var tagAttr = 'rel';
		this.countTagWithoutAttr(tagName, tagAttr);
	} else {
		this.funcPool.push('detectedAWithoutRel');
	}

	return this;
}

// In <head> tag
// i. Detect if header doesn’t have <title> tag
// ii. Detect if header doesn’t have <meta name=“descriptions” ... /> tag
// iii. Detect if header doesn’t have <meta name=“keywords” ... /> tag
SeoDetected.prototype.detectedHeader = detectedHeader;
function detectedHeader() {
	if (this.isFinish === true) {
		var tagName = 'head';
		var parent = this;
		var target = parent.$(tagName);
		var childrenName = '';
		var childrenCount = 0;
		var metaNames = [];
		var tagDesc = '';

		// Detect if header doesn’t have <title> tag
		childrenName = 'title';
		childrenCount = target.find(childrenName).length;
		tagDesc = childrenName;
		parent.setDetectedHeaderResult(childrenCount, tagDesc);

		// Detect if header doesn’t have <meta name=“descriptions” ... /> tag
		// Detect if header doesn’t have <meta name=“keywords” ... /> tag
		childrenName = 'meta';
		metaNames = ['descriptions', 'keywords'];
		metaNames.forEach(function(metaName) {
			childrenCount = target.find(childrenName + '[name=' + metaName + ']').length;
			tagDesc = childrenName + ' name="' + metaName;
			parent.setDetectedHeaderResult(childrenCount, tagDesc);
		});
	} else {
		this.funcPool.push('detectedHeader');
	}	

	return this;
}

// Detect if there’re more than 15 <strong> tag in HTML (15 is a value should be configurable by user)
SeoDetected.prototype.detectedStrongOver = detectedStrongOver;
function detectedStrongOver(limit = 0) {
	if (this.isFinish === true) {
		var tagName = 'strong';
		this.isTagOverThen(tagName, limit);
	} else {
		this.funcPool.push(['detectedStrongOver', limit]);
	}

	return this;
}

// Detect if a HTML have more than one <H1> tag.
SeoDetected.prototype.detectedH1OverOne = detectedH1OverOne;
function detectedH1OverOne() {
	if (this.isFinish === true) {
		var tagName = 'H1';
		var limit = 1;

		this.isTagOverThen(tagName, limit);
	} else {
		this.funcPool.push('detectedH1OverOne');
	}

	return this;
}

// Output a file (User is able to config the output destination)
SeoDetected.prototype.saveToFile = saveToFile;
function saveToFile(path) {
	if (this.isFinish === true) {
		var result = 'Save to ' + path;
			
		fs.writeFileSync(path, this.result, fileEncode);

		console.log(result);
	} else {
		this.funcPool.push(['saveToFile', path]);
	}
}

// Output as writable stream
SeoDetected.prototype.writeStream = writeStream;
function writeStream(path) {
	if (this.isFinish === true) {
		var result = 'Output by writable stream to ' + path;
		var writable = fs.createWriteStream(path);

		writable.write(this.result, fileEncode);
		writable.end();

		console.log(result);
	} else {
		this.funcPool.push(['writeStream', path]);
	}
}

// Output on Console
SeoDetected.prototype.display = display;
function display() {
	if (this.isFinish === true) {
		console.log(this.result);
	} else {
		this.funcPool.push('display');
	}

	return this;
}





// Count the tag without attribute
SeoDetected.prototype.countTagWithoutAttr = countTagWithoutAttr;
function countTagWithoutAttr(tagName, tagAttr)
{
	var parent = this;
	var target = parent.$(tagName);
	var matchCount = 0;

	target.each(function (index, element) {
		if (typeof parent.$(this).attr(tagAttr) === 'undefined') {
			matchCount++;
		}
	});
	this.setResult('There are ' + matchCount + ' <' + tagName + '> tag without ' + tagAttr + ' attribute');
}

// Check if tag over then xx
SeoDetected.prototype.isTagOverThen = isTagOverThen;
function isTagOverThen(tagName, limit = 0)
{
	var tagCount = this.$(tagName).length;
	var intLimit = parseInt(limit);

	if (isNaN(intLimit) === true) {
		intLimit = 0;
	}

	if (tagCount > intLimit) {
		this.setResult('This HTML have more than ' + intLimit + ' <' + tagName + '> tag');
	} else {
		this.setResult('This HTML doesn’t have more than ' + intLimit + ' <' + tagName + '> tag');
	}
}

// Set the detected header result
SeoDetected.prototype.setDetectedHeaderResult = setDetectedHeaderResult;
function setDetectedHeaderResult(count, tagName)
{
	if (count === 0) {
		this.setResult('The header doesn\'t have <' + tagName + '"> tag');
	} else {
		this.setResult('The header have <' + tagName + '"> tag');
	}
}

// Set the result
SeoDetected.prototype.setResult = setResult;
function setResult(content)
{
	this.result += content + echoEol;
}