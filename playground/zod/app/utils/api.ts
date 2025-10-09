import { array, boolean, object, string } from 'zod';

const createItemBodySchema = object({
  name: string().min(2),
});

const createItemQuerySchema = object({
  test: boolean(),
});

const itemSchema = object({
  id: string(),
  name: string(),
});

const listSchema = array(itemSchema);

const jokeSchema = object({
  id: string(),
  type: string(),
  setup: string(),
  punchline: string(),
});

export const CommonAPI = {
  list: StrictFetch.prepare({
    url: 'list',
    schemas: { response: listSchema },
  }),
  createItem: StrictFetch.prepare({
    url: 'list',
    method: HTTPMethod.POST,
    schemas: { response: itemSchema, body: createItemBodySchema, query: createItemQuerySchema },
  }),
  details: StrictFetch.prepare<number[], null, { id: number }, { filter?: boolean }>({
    url: ({ id }) => `list/${id}`,
  }),
  joke: StrictFetch.prepare({
    url: 'joke',
    schemas: { response: jokeSchema },
    options: { selfInterrupted: true },
  }),
  checkExpired: StrictFetch.prepare<{ status: boolean }>({
    url: 'authorized',
    options: {
      onRequest(context) {
        const expiredAt = localStorage.getItem('expired_at');
        if (expiredAt) context.options.headers.set('x-expired-at', expiredAt);
      },
      catch(error): Promise<any> {
        if (error.context?.response?.status === 401) {
          const expiredAt = new Date();
          expiredAt.setSeconds(expiredAt.getSeconds() + 5);
          localStorage.setItem('expired_at', expiredAt.toISOString());

          return CommonAPI.checkExpired();
        }

        throw error;
      },
    },
  }),
};
