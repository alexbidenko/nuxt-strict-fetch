import { array, boolean, object, string } from 'yup';

const createItemBodySchema = object()
  .required()
  .shape({
    name: string().required().min(2),
  });

const createItemQuerySchema = object().required().shape({
  test: boolean().required(),
});

const itemSchema = object().required().shape({
  id: string().required(),
  name: string().required(),
});

const listSchema = array().required().of(itemSchema);

const jokeSchema = object().required().shape({
  id: string().required(),
  type: string().required(),
  setup: string().required(),
  punchline: string().required(),
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
