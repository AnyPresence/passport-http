'use strict';

var _ = require('lodash');

var _allowedOptions = ['url', 'verb', 'username', 'password', 'parameters',
                       'headers', 'bodyTemplate', 'responseHandler', 'format',
                       'passReqToCallback'];

function Strategy(options, verify) {
    if (!verify || typeof verify !== 'function')
        throw new Error('HttpStrategy requires a verify callback!');

    var self = this;

    // assign all options to instance, i.e. self.url = options.url
    _allowedOptions.forEach(function(key) {
        self[key] = options[key];
    });

    this._verify = verify;
}

Strategy.prototype.authenticate = function(req, options) {
    var context = req.context || {};



    return;
};

module.exports = Strategy;