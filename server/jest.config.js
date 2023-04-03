import dotenv from 'dotenv';

const env = dotenv.config().parsed || {};

export default {
    globals: {
        env
    },
    maxWorkers: 1, // got conflicts due to concurrent connections! Setting maxWorkers to 1 thus.
};
