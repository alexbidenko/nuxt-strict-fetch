import {HTTPMethod} from "../../src/runtime/utils/request/types";
import {array, object, string} from "yup";

const createItemBodySchema = object().required().shape({
  name: string().required(),
});

const itemSchema = object().required().shape({
  id: string().required(),
  name: string().required(),
});

const listSchema = array().required().of(itemSchema);

export const CommonAPI = {
  list: StrictFetch.prepare({
    url: 'list',
    schemas: { response: listSchema },
  }),
  createItem: StrictFetch.prepare({
    url: 'list',
    method: HTTPMethod.post,
    schemas: { response: itemSchema, body: createItemBodySchema },
  }),
};
