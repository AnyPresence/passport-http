'use strict';

var _           = require('lodash'),
    HttpHelper  = require('./http-helper'),
    passport    = require('passport-strategy'),
    util        = require('util');

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

util.inherits(Strategy, passport.Strategy);

Strategy.prototype.verified = function(err, user) {
    if (err) return this.error(err);
    if (!user) return this.fail('Invalid or missing user.');
    this.success(user);
};

Strategy.prototype.authenticate = function(req, options) {
    var self = this;
    var context = req.context || {};
    options = options || {};

    var helper = new HttpHelper(self, context);

    helper.makeRequest(function(err, response, result) {
        if (err) return self.error(err);
        self.responseHandler(response, result, function(err, user) {
            if (err) return self.error(err);
            if (self.passReqToCallback) {
                self._verify(req, user, self.verified.bind(self));
            } else {
                self._verify(user, self.verified.bind(self));
            }
        });
    });

    return;
};

module.exports = Strategy;