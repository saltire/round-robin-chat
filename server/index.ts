import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';

import routes from './routes';
import { run } from './lib/chat';


const app = express();
app.use(morgan('dev'));

app.use('/', routes);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).send(err.message);
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log('Listening on port', port));

// Run a round, as a test.
run(1)
  .catch(err => console.error(err.message));
