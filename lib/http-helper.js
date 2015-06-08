'use strict';

var interpolate    = require('./interpolate'),
    _               = require('lodash');

var mimes = {
    'json': 'application/json',
    'xml': 'application/xml',
    'form-encoded': 'application/x-www-form-urlencoded'
};

function HttpHelper(strategy, context) {
    this.strategy = strategy;
    this.context = context;
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

HttpHelper.prototype.makeRequest = function() {

};

module.exports =  HttpHelper;