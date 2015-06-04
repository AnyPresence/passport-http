'use strict';

var _ = require('lodash');

var _allowedOptions = ['url', 'verb', 'basicAuth', 'parameters', 'headers', 'responseHandler'];

function Strategy(options, verify) {
    var self = this;
    // assign all options to instance, i.e. self.url = options.url
    _allowedOptions.forEach(function(key) {
        self[key] = options[key];
    });

    this.verify = verify;
}

Strategy.prototype.authenticate = function(req, options) {
    return;
};

module.exports = Strategy;