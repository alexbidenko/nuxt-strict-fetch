import { ZodType } from 'zod';

type SchemasType<R, B = undefined, P = undefined, Q = undefined> = {
  response?: ZodType<R>;
  body?: ZodType<B>;
  params?: ZodType<P>;
  query?: ZodType<Q>;
};

declare module '#strict-fetch' {
  interface PrepareRequestSettings<R, B, P, Q> {
    schemas?: SchemasType<R, B, P, Q>;
  }
}

export {};
