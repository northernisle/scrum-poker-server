import Redis from 'ioredis';

const { REDIS_PORT, HOST } = process.env;

const redis = new Redis(REDIS_PORT, HOST);

export default redis;
