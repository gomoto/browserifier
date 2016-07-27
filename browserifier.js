"use strict";
var browserify = require('browserify');
var fs = require('fs');
var objectAssign = require('object-assign');
var Browserifier = (function () {
    function Browserifier(entries, output, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        var browserifyOptions = {};
        if (options.watchify) {
            objectAssign(browserifyOptions, {
                cache: {},
                packageCache: {}
            });
        }
        if (options.debug) {
            objectAssign(browserifyOptions, {
                debug: true
            });
        }
        var b = browserify(entries, browserifyOptions);
        if (options.watchify) {
            b.plugin(require('watchify'));
            b.on('update', function (ids) {
                console.log(ids);
                _this.bundle(options.watchifyCallback);
            });
            b.on('log', console.log);
        }
        if (options.tsify) {
            var tsifyOptions = typeof options.tsify === 'object' ? options.tsify : { project: 'tsconfig.json' };
            b.plugin(require('tsify'), tsifyOptions);
        }
        if (options.uglifyify) {
            b.transform(require('uglifyify'));
        }
        this.b = b;
        this.output = output;
    }
    Browserifier.prototype.bundle = function (callback) {
        if (callback === void 0) { callback = function () { }; }
        this.b
            .bundle()
            .pipe(fs.createWriteStream(this.output))
            .on('error', function (error) {
            console.error(error.toString());
        })
            .on('close', function () {
            callback();
        });
    };
    return Browserifier;
}());
module.exports = Browserifier;
