var handlebars  = require('handlebars'),
    _           = require('lodash');

function interpolate(source, context) {
    if (typeof source !== 'string') return source;
    if(source.indexOf('{{') === -1) return source;

    var template = handlebars.compile(source);
    return template(context);
}

module.exports = function(payload, context) {
    if (typeof context === 'undefined' || context === null) return payload;
    if (typeof payload === 'string') {
      return payload.replace(/{{\s*[\w\.]+\s*}}/g, function(match, offset) {
        var m = match.slice(2, -2),
            _context = context,
        m = m.split('.');
        for(var i=0; i<m.length; i++) {
          _context = _context ? _context[m[i]] : undefined;
        }
        return _context ? encodeURIComponent(_context) : '';
      });
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
