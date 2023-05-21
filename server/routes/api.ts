import Router from 'express-promise-router';

import { getResponse } from '../lib/chat';
import defaultEntities from '../lib/entities/dnd1.json';


const router = Router();

router.get('/defaults', async (req, res) => {
  res.json({ entities: defaultEntities });
});

router.post('/response', async (req, res) => {
  const { entity, responses } = req.body;
  res.json({ response: await getResponse(entity, responses) });
});

export default router;
