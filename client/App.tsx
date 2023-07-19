import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { v4 as uuid } from 'uuid';

import { Entity, Response } from '../server/lib/types';


type WithId<T> = T & {
  id: string,
};

export default function App() {
  const [entities, setEntities] = useState<WithId<Entity>[] | null>(null);
  const updateEntity = (id: string, update: Partial<Entity>) => setEntities(prev => prev
    && prev.map(e => (e.id === id ? { ...e, ...update } : e)));
  const [index, setIndex] = useState(0);

  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<WithId<Response>[]>([]);

  const socket = useRef(io());

  useEffect(() => {
    socket.current.on('defaults', (data: { entities: Entity[] }) => setEntities(
      data.entities.map(entity => ({ ...entity, id: uuid() }))));
  }, [socket]);

  const onResponse = useCallback((response: Response) => {
    setResponses(prev => [...prev, { ...response, id: uuid() }]);
    if (entities) {
      setIndex(prev => (prev + 1) % entities.length);
    }
    setLoading(false);
  }, [entities]);

  useEffect(() => {
    socket.current.on('response', onResponse);
    return () => {
      socket.current.off('response', onResponse);
    };
  }, [onResponse]);

  const getNext = useCallback(() => {
    if (entities) {
      setLoading(true);
      socket.current.emit('getResponse', {
        entity: entities[index],
        responses,
      });
    }
  }, [entities, index, responses]);

  const formClass = 'w-full px-2 py-1 ring-1 ring-zinc-500 rounded-sm';
  const inputClass = `${formClass}`;
  const textareaClass = `${formClass} min-h-[8rem]`;

  return (
    <div className='App'>
      <header className='mb-8 py-2 bg-zinc-300 text-center'>
        <h1 className='text-3xl font-bold'>Round Robin Chat</h1>
      </header>
      <main className='max-w-screen-lg m-auto'>
        {!entities ? <p className='my-4 italic text-center'>Loading...</p> : (
          <div className='grid grid-cols-[2fr_3fr_3fr] grid-rows-fr'>
            <div className='mx-4 mb-4'>
              <strong>Name</strong><br />
              <em>The name of the bot.</em>
            </div>
            <div className='mx-4 mb-4'>
              <strong>Initial prompt</strong><br />
              <em>Given to the bot at the start of the conversation.</em>
            </div>
            <div className='mx-4 mb-4'>
              <strong>Reminder prompt</strong><br />
              <em>
                Given to the bot after the conversation history and before asking for a reply.
              </em>
            </div>

            {entities.map(entity => (
              <Fragment key={entity.id}>
                <div className='mx-2 mb-4'>
                  <input
                    className={inputClass}
                    type='text'
                    value={entity.name}
                    onChange={e => updateEntity(entity.id, { name: e.target.value })}
                  />
                </div>
                <div className='mx-2 mb-4'>
                  <textarea
                    className={textareaClass}
                    value={entity.prompt}
                    onChange={e => updateEntity(entity.id, { prompt: e.target.value })}
                  />
                </div>
                <div className='mx-2 mb-4'>
                  <textarea
                    className={textareaClass}
                    value={entity.reminder}
                    onChange={e => updateEntity(entity.id, { reminder: e.target.value })}
                  />
                </div>
              </Fragment>
            ))}
          </div>
        )}

        <div className='whitespace-pre-line'>
          {responses.map(response => (
            <p key={response.id} className='mx-2 my-6 px-3 py-2 ring-1 ring-zinc-300 rounded-sm'>
              <strong className='block mb-3 pb-2 border-b border-zinc-300 border-dashed'>
                {response.name}:
              </strong>
              {response.content}
            </p>
          ))}

          {loading && <p className='my-4 italic text-center'>Loading...</p>}
        </div>

        <div className='mb-8 text-center'>
          <button
            className='px-4 py-2 bg-zinc-300 rounded-sm disabled:opacity-50'
            type='button'
            disabled={loading}
            onClick={getNext}
          >
            Next
          </button>
        </div>
      </main>
    </div>
  );
}
