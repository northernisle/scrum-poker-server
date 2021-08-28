import crypto from 'crypto';
import redis from 'store';

const KEY = process.env.REDIS_KEY;

const generateId = async () => {
  let unique = false;
  let id = null;

  while (!unique) {
    id = crypto.randomBytes(4).toString('hex');

    // eslint-disable-next-line no-await-in-loop
    unique = !(await redis.sismember(KEY, id));
  }

  await redis.sadd(KEY, id);

  return id;
};

export default generateId;
