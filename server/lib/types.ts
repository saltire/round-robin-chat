export type Entity = {
  name: string,
  prompt: string,
  reminder?: string,
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
