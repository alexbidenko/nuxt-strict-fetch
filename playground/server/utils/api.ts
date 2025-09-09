type JokeType = {
  id: number;
  setup: string;
  punchline: string;
};

export const ServerAPI = {
  joke: StrictFetch.prepare<JokeType>({
    url: 'random_joke',
  }),
};
