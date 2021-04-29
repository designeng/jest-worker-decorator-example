process.on('uncaughtException', function(error) {
    var today = new Date();
    today.toISOString().substring(0, 10);
    console.error("ERROR: ", today, error.stack);
})

var fs = require('fs');

var babelrc = fs.readFileSync('./.babelrc');
var config;

try {
    config = JSON.parse(babelrc);
} catch (err) {
    console.error('==>     ERROR: Error parsing your .babelrc.');
    console.error(err);
}

require('@babel/polyfill');
require('@babel/register')(config);
