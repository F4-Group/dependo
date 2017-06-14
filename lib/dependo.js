'use strict';

var madge = require('madge');
var sha1 = require('sha-1');

function Dependo(targetPath, options) {
    this.config = options || {};

    this.basePath = options.basePath;
    this.config.format = String(options.format || 'amd').toLowerCase();
    this.config.exclude = options.exclude || null;
    this.identification = sha1(targetPath + JSON.stringify(this.config)) || ~~(Math.random()*999999999);
    this.title = options.title || 'dependo';

    if (this.config.format==='json') {
        this.dependencies = this.config.directDeps;
        this._postprocessDependencies();
    } else {
        this.madge = madge(targetPath, this.config);
    }
}

Dependo.prototype.generateHtml = function (cb) {
    if (!this.dependencies && this.madge) {
        this.madge.then((res) => {
            this.dependencies = res.obj();
            this._postprocessDependencies();
            this._generateHtmlWithDependencies(cb);
        })
    } else {
        this._generateHtmlWithDependencies(cb);
    }
};

Dependo.prototype._postprocessDependencies = function () {
    if (this.config.transform && typeof (this.config.transform) == 'function') {
        this.dependencies = this.config.transform(this.dependencies);
    }
}

Dependo.prototype._generateHtmlWithDependencies = function (cb) {
    cb(require('./html').output(this.basePath, this.dependencies, this.identification, this.title));
}

module.exports = Dependo;
