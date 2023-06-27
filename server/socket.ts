import { Server } from 'socket.io';

import defaultEntities from './lib/entities/dnd1.json';
import { getResponse } from './lib/chat';
import { Entity, Response } from './lib/types';


const setupServer = (io: Server) => {
  io.on('connection', socket => {
    socket.emit('defaults', { entities: defaultEntities });

    socket.on('getResponse', async (data: { entity: Entity, responses: Response[] }) => {
      socket.emit('response', await getResponse(data.entity, data.responses));
    });
  });
};
export default setupServer;
