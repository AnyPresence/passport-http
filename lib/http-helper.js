'use strict';

var interpolate     = require('./interpolate'),
    _               = require('lodash'),
    request         = require('request');

var mimes = {
    'json': 'application/json',
    'xml': 'application/xml',
    'form_encoded': 'application/x-www-form-urlencoded'
};

function acceptableStatus(statusCode) {
    return statusCode >= 200 && statusCode < 300;
}

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
    var params = interpolate(this.strategy.parameters, this.context);
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

    request(params, function(err, response, result) {
        if (err) return cb(err);
        if (!acceptableStatus(response.statusCode)) {
            err = new Error('Recieved status code ' + response.statusCode + ' from remote source. ' + response.body);
        }

        if (self.strategy.format.toLowerCase() === 'json' && !_.isEmpty(result)) {
            result = JSON.parse(result);
        }

        cb(err, response, result);
    });
};

module.exports =  HttpHelper;