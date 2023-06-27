import express, { json, Request, Response, NextFunction } from 'express';
import http from 'http';
import morgan from 'morgan';
import { Server } from 'socket.io';

import routes from './routes';
import setupServer from './socket';


const app = express();
const server = http.createServer(app);
app.use(json());
app.use(morgan('dev'));

app.use('/', routes);

const io = new Server(server);
setupServer(io);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).send(err.message);
});

const port = process.env.PORT || 3001;
server.listen(port, () => console.log('Listening on port', port));
