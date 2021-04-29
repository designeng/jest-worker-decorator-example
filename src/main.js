import when from 'when';
import chalk from 'chalk';
import _ from 'lodash';
import createContext, { decorators } from 'lightwire.js';

import worker from './decorators/worker';
import routes from './sampleRoutes';

const args = decorators.args;

const BASE_URL = 'https://www.drive.ru';

let REQUEST_OPTIONS = {
    hostname: process.env.HOST || 'localhost',
    port: process.env.PORT || 3000,
    method: 'GET',
    agent: false
};

const start = new Date()

createContext({
    @args()
    routes: () => routes,

    @args()
    PIDS: () => [],

    @worker(__dirname + '/workers/runner.js', {
        // enableWorkerThreads: true, /* with `enableWorkerThreads = true` worker process pid has a single value */
        exposedMethods: ['makeRequest'],
        numWorkers: 4,
        maxRetries: 5,
        forkOptions: {
            silent: false
        }
    }, { destroyAfterUsage: true })
    requestWorker: {},

    @args(
        {$ref: 'requestWorker'},
        {$ref: 'routes'},
        {$ref: 'PIDS'}
    )
    runTests: (worker, routes, PIDS) => {
        let options = _.clone(REQUEST_OPTIONS);

        let testsCount = routes.length;

        const doRequest = async (i) => {
            const route = routes[i];
            const result = await worker.makeRequest(route, options, null);
            console.log(result.route.url, result.pid);

            if(!PIDS.includes(result.pid)) PIDS.push(result.pid);
            return result;
        }

        return when.iterate(
            i => i + 1,
            i => i === testsCount,
            doRequest,
            0
        ).then(res => {
            console.log(chalk.green('DONE!'), chalk.blue(process.pid), chalk.green(new Date - start));
            return res;
        }).catch(err => {
            console.log('ERROR', err);
            return worker;
        })
    }
}).then(context => {
    const { PIDS } = context;
    console.log('WROKERS PIDS: ', PIDS);

    context.destroy().then(_ => {
        process.exit();
    })
}).catch(error => {
    console.log('ERROR', error);
    process.exit();
})
