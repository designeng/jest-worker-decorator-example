import http from 'http';
import _ from 'lodash';

const normalizeCookies = require('./utils/normalizeCookies');

export function makeRequest(route, commonOptions, accessToken) {
        return new Promise((resolve, reject) => {
            var options = _.clone(commonOptions);

            if(route.method) {
                _.assign(options, { method:  route.method });
            }


            if(route.accessToken && !route.url.match(/\?/)) route.url += `?`;
            var path = route.url + (route.accessToken ? `&access_token=${accessToken}` : '');

            _.assign(options, { path });

            const headers = {};

            if(_.isObject(route.cookies)) {
                var cook = normalizeCookies(route.cookies);
                _.assign(headers, { 'Cookie': cook });
            }

            var data;
            if(route.data) {
                data = querystring.stringify(route.data);
                _.assign(headers, {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(data)
                });
            }

            _.assign(options, { headers });

            var content = [];
            const req = http.request(options, (response) => {
                response.setEncoding('utf8');
                response.on('data', (chunk) => {
                    content.push(chunk);
                }).on('end', () => {
                    _.assign(route, { content: content.join('') });

                    resolve({
                        route,
                        error: null,
                        pid: process.pid
                    });
                });
            });

            req.setTimeout(45000, () => {
                req.abort();
                resolve({
                    route,
                    error: 'timeout',
                    pid: process.pid
                });
            });

            req.on('error', (e) => {
                console.log('ERROR in request:', e);
                reject(e)
            })

            if(data) req.write(data);
            req.end();
        })
    }
