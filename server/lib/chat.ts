import { promises as fs } from 'fs';
import { ChatCompletionRequestMessage } from 'openai';
import { v4 as uuid } from 'uuid';

import getCompletion from './openai';
import { range, series, sleep } from './utils';
import defaultEntities from './entities/dnd1.json';
import { Entity, Response, Session } from './types';


const defaultSession: Session = {
  sessionId: uuid(),
  entities: defaultEntities,
  responses: [],
};

const getSession = async (sessionId: string): Promise<Session> => {
  console.log(`Restoring session ${sessionId}...`);

  return fs.readFile(`${sessionId}.json`, { encoding: 'utf-8' })
    .then(dataStr => {
      const data = JSON.parse(dataStr);
      console.log('Restored session.');
      return data;
    })
    .catch(err => {
      console.log('Error restoring session:', err.message);
      return defaultSession;
    });
};

export const getResponse = async (entity: Entity, responses: Response[]) => {
  console.log(`--- Getting response for ${entity.name}...`);

  const responseText = await getCompletion([
    {
      role: 'system',
      content: entity.prompt,
    },
    ...responses.map((response): ChatCompletionRequestMessage => (
      response.name === entity.name ? {
        role: 'assistant',
        content: response.content,
      } : {
        role: 'user',
        content: `${response.name} says:\n\n${response.content}`,
      })),
  ]);

  if (responseText) {
    console.log(`--- [${entity.name}]\n\n${responseText}\n\n`);
    return {
      name: entity.name,
      content: responseText,
    };
  }

  return null;
};

// Push onto responses in place.
export const round = async (entities: Entity[], responses: Response[]) => series(entities,
  async entity => {
    const response = await getResponse(entity, responses);
    if (response) {
      responses.push(response);
    }
    await sleep(1000);
  });

export const run = async (rounds?: number) => {
  const { sessionId, entities, responses } = process.env.SESSION_ID
    ? await getSession(process.env.SESSION_ID) : defaultSession;

  await series(range(rounds || 2), () => round(entities, responses));

  console.log('--- Saving...');
  await fs.writeFile(`${sessionId}.json`,
    JSON.stringify({ sessionId, entities, responses }, null, 2));
};
