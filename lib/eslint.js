var CLIEngine = require("eslint").CLIEngine;
var cli = new CLIEngine();

exports.act = function(buffer, encoding, callback) {
    var options = this.options({});
    var code = buffer.toString();
    var bone = this.bone;
    var source = this.source;
    var output = [];

    this.cacheable();

    var report = cli.executeOnFiles(this.getDependency());

    report.results.forEach(function(result) {
        output.push(`[eslint] File: ${result.filePath}`);

        output.push(`\r\n`);
        result.messages.forEach(function(message) {
            output.push(`In line: ${message.line} column: ${message.column}! [${message.message}] source: ${message.source}`);
        });
        output.push(`\r\n`);
    });

    var fixes = CLIEngine.outputFixes(report);

    output = output.join('\r\n');

    output = output.replace(/\'|\"/g, function(match) {
        return '\\' + match;
    });

    bone.log.warn('bone-act-eslint', output);

    if (options.consoleError) {
        var outputBuffer = new Buffer(`;(function() {
            console.error(\`${output}\`);
        })();`);

        var buf = Buffer.concat([buffer, outputBuffer], buffer.length + outputBuffer.length);
        callback(null, buf);
    } else {
        callback(null, buffer);
    }
};

exports.filter = {
    ext: ['.js', '.jsx']
};