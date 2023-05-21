export type Entity = {
  name: string,
  prompt: string,
};

export type Response = {
  name: string,
  content: string,
};

export type Session = {
  sessionId: string,
  entities: Entity[],
  responses: Response[],
};
