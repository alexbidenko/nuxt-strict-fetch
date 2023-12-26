type JokeType = {
  id: number;
  setup: string;
  punchline: string;
};

export const ServerAPI = {
  joke: StrictFetch.prepare<JokeType>({
    url: 'https://official-joke-api.appspot.com/random_joke',
  }),
};
