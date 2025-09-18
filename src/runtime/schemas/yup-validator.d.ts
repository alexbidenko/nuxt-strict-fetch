import { Schema } from 'yup';

type SchemasType<R, B = undefined, P = undefined, Q = undefined> = {
  response?: Schema<R>;
  body?: Schema<B>;
  params?: Schema<P>;
  query?: Schema<Q>;
};

declare module '#strict-fetch' {
  interface PrepareRequestSettings<R, B, P, Q> {
    schemas?: SchemasType<R, B, P, Q>;
  }
}

export {};
