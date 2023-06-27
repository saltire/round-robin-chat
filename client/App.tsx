import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { v4 as uuid } from 'uuid';

import './App.scss';
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

  return (
    <div className='App'>
      <header>
        <h1>Round Robin Chat</h1>
      </header>
      <main>
        <div className='entities'>
          {!entities ? <p>Loading...</p> : (entities.map(entity => (
            <div key={entity.id}>
              <input
                type='text'
                value={entity.name}
                onChange={e => updateEntity(entity.id, { name: e.target.value })}
              />
              <textarea
                value={entity.prompt}
                onChange={e => updateEntity(entity.id, { prompt: e.target.value })}
              />
              <textarea
                value={entity.reminder}
                onChange={e => updateEntity(entity.id, { reminder: e.target.value })}
              />
            </div>
          )))}
        </div>

        <div className='responses'>
          {responses.map(response => (
            <p key={response.id}>
              <strong>{response.name}:</strong><br />
              {response.content}
            </p>
          ))}

          {loading && <p>Loading...</p>}
        </div>

        <div className='controls'>
          <button type='button' disabled={loading} onClick={getNext}>Next</button>
        </div>
      </main>
    </div>
  );
}
