import JestWorker from 'jest-worker';

export default function worker(workerPath, workerOptions = {}, additionalOptions = { destroyAfterUsage: false }) {
    return (target, name, description) => {
        let worker;
        return {
            value: {
                create: {
                    module: (workerPath, workerOptions) => {
                        const { forkOptions } = workerOptions;
                        worker = new JestWorker(require.resolve(workerPath), workerOptions);

                        if(forkOptions && forkOptions.silent === false) {
                            let data = '';

                            const readableStream = worker.getStdout();

                            readableStream.on('data', (chunk) => {
                                console.log('chunk...', chunk);
                                data += chunk;
                            })

                            readableStream.on('end', () => {
                                console.log(data);
                            });

                            readableStream.on('error', (error) => {
                                console.error('[JestWorker error]', error);
                            });
                        }

                        return worker;
                    },
                    args: [
                        workerPath,
                        workerOptions
                    ]
                },
                destroy: () => {
                    if (additionalOptions.destroyAfterUsage) worker.end();
                }
            }
        }
    }
}
