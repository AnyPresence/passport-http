var handlebars  = require('handlebars'),
    _           = require('lodash');

function interpolate(source, context) {
    if (typeof source !== 'string') return source;
    if(source.indexOf('{{') === -1) return source;

    var template = handlebars.compile(source, { noEscape: true });
    return template(context);
}

module.exports = function(payload, context, headers) {
    if (typeof context === 'undefined' || context === null) return payload;
    if (typeof payload === 'string') {
        if (headers && headers['Content-Type'] && headers['Content-Type'] === 'application/x-www-form-urlencoded') {
            cloneContext = _.cloneDeep(context);

            (function fn(o) {
                _.keys(o).forEach(function(key) {
                    if (typeof o[key] === 'object') fn(o[key]);
                    if (typeof o[key] === 'string') {
                        o[key] = encodeURIComponent(interpolate(o[key], context));
                    }
                })
            })(cloneContext);

            var result = interpolate(payload, cloneContext);
            return result;
        }
        return interpolate(payload, context);
    }     

    var res;
    if (_.isArray(payload)) {
        res = [];
        payload.forEach(function(source) {
            res.push(interpolate(source, context));
        });
        return res;
    }
    if(_.isObject(payload)) {
        res = {};
        _.keys(payload).forEach(function(key) {
            res[key] = interpolate(payload[key], context);
        });
        return res;
    }
};
