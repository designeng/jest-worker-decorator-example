const _ = require('lodash');
const { checkIsHttpToken } = require('./rules-latest');

module.exports = function normalizeCookies(cookies) {
    if(_.isString(cookies)) {
        return cookies;
    } else if(_.isObject(cookies)){
        const validCookie = _.reduce(cookies, (result, value, key) => {
            if(checkIsHttpToken(value) && checkIsHttpToken(key)) {
                result[key] = value;
            }
            return result;
        }, {})

        return _.map(validCookie, (value, key) => {
            return key + '=' + value;
        }).join(';');
    }
}
