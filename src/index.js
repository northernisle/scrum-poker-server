import cluster from 'cluster';
import net from 'net';
import os from 'os';
import express from 'express';

import socketIO from 'socket.io';
import redisAdapter from 'socket.io-redis';
import farmhash from 'farmhash';

import socketProcess from './socketProcess';

const PORT = 8000;
const REDIS_PORT = 6379;
const STICKY_SESSION = 'sticky-session:connection';

const threadCount = os.cpus().length;

const spawnWorker = () => {
  const worker = cluster.fork();

  worker.on('exit', () => {
    spawnWorker(worker);
  });

  return worker;
};

const getWorker = (workers, ip) => {
  const index = farmhash.fingerprint32(ip) % threadCount;
  return workers[index];
};

if (cluster.isMaster) {
  const workers = [];

  for (let i = 0; i < threadCount; i++) {
    workers.push(spawnWorker());
  }

  const server = net.createServer({ pauseOnConnect: true }, (socket) => {
    const worker = getWorker(workers, socket.remoteAddress);
    worker.send(STICKY_SESSION, socket);
  });

  server.listen(PORT);
} else {
  const app = express();
  const server = app.listen(0, 'localhost');
  const io = socketIO(server);

  io.adapter(redisAdapter({ host: 'localhost', port: REDIS_PORT }));

  io.on('connection', (socket) => {
    socketProcess(io, socket);
  });

  process.on('message', (msg, connection) => {
    if (msg !== STICKY_SESSION) {
      return;
    }

    server.emit('connection', connection);

    connection.resume();
  });
}
