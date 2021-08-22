import { generateId } from 'utils';

const server = (io, socket) => {
  socket.on('create-room', async () => {
    const id = await generateId();

    socket.join(id);
    socket.emit('create-room', id);
  });
};

export default server;
