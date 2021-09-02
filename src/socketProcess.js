import redis from 'store';
import { generateId } from 'utils';

const KEY = process.env.REDIS_KEY;

const server = (io, socket) => {
  socket.on('create-room', async () => {
    const id = await generateId();

    socket.join(id);
    socket.emit('create-room', id);
  });

  socket.on('join-room', async (id) => {
    const userInRoom = socket.rooms.has(id);

    if (!userInRoom) {
      const roomExists = await redis.sismember(KEY, id);

      if (roomExists) {
        socket.join(id);
        socket.emit('join-room', true, id);
      } else {
        socket.emit('join-room', false, id);
      }
    }

    socket.emit('join-room', true, id);
  });

  socket.on('leave-room', async (id) => {
    socket.leave(id);
  });

  socket.on('disconnecting', () => {
    const [, ...rooms] = [...socket.rooms];
    const existingRooms = io.sockets.adapter.rooms;

    rooms.forEach((room) => {
      const roomIsEmpty = existingRooms.get(room).size <= 1;

      if (roomIsEmpty) {
        redis.srem(KEY, room);
      }
    });
  });
};

export default server;
