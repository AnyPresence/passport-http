'use strict';

var interpolate     = require('./interpolate'),
    _               = require('lodash'),
    request         = require('request');

var mimes = {
    'json': 'application/json',
    'xml': 'application/xml',
    'form-encoded': 'application/x-www-form-urlencoded'
};

function HttpHelper(strategy, context) {
    this.strategy = strategy;
    this.context = context || {};
}

HttpHelper.prototype.constructHeaders = function() {
    var headers = {};
    headers['Content-Type'] = headers['Accept'] = mimes[this.strategy.format];

    if (this.strategy.username && this.strategy.password) {
        var buffer = new Buffer(this.strategy.username + ':' + this.strategy.password);
        headers['Authorization'] = 'Basic ' + buffer.toString('base64');
    }

    headers = _.merge(headers, _.cloneDeep(this.strategy.headers) || {});

    return interpolate(headers, this.context);
};

HttpHelper.prototype.constructBody = function() {
    if (!this.strategy.bodyTemplate || this.strategy.bodyTemplate === '') return '';
    return interpolate(this.strategy.bodyTemplate, this.context);
};

HttpHelper.prototype.constructUrl = function() {
    if (_.isEmpty(this.strategy.parameters)) return this.strategy.url;
    var params = interpolate(this.strategy.parameters);
    var paramString = '?';
    _.keys(params).forEach(function(key) {
        if (paramString === '?') {
            paramString += (key + '=' + params[key]);
        } else {
            paramString += ('&' + key + '=' + params[key]);
        }
    });
    return this.strategy.url + paramString;
};

HttpHelper.prototype.makeRequest = function(cb) {
    var self = this;

    var params = {
        url: self.constructUrl(),
        headers: self.constructHeaders(),
        method: self.strategy.verb,
        body: this.constructBody()
    };

    request(params, cb);
};

module.exports =  HttpHelper;