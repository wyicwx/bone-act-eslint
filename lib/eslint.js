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
        if (result.errorCount || result.warningCount) {
            result.messages.forEach(function(message) {
                if (message.severity < 2) {
                    bone.log.log('bone-act-eslint', message.message);
                } else {
                    output.push(`
[eslint] File: ${result.filePath}\r\n
In line: ${message.line} column: ${message.column}! [${message.message}] source: ${message.source}
                    `);
                }
            });
        }
    });

    if (output.length) {
        output = output.join('\r\n');

        output = output.replace(/\'|\"/g, function(match) {
            return '\\' + match;
        });

        bone.log.warn('bone-act-eslint', output);

        if (bone.status.watch && options.consoleError) {
            var outputBuffer = new Buffer(`;(function() {
                console.error(\`${output}\`);
            })();`);

            var buf = Buffer.concat([buffer, outputBuffer], buffer.length + outputBuffer.length);
            return callback(null, buf);
        }
    }

    callback(null, buffer);
};

exports.filter = {
    ext: ['.js', '.jsx']
};
