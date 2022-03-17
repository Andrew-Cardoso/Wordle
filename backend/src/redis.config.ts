import {createClient} from 'redis';

const url = 'redis://0.0.0.0:6543';
const redisClient = createClient({url});
redisClient.on('error', console.log);

export const startRedis = () => redisClient.connect();

export const redis = redisClient;
