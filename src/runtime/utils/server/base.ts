import { CommonStrictFetch } from '../common/base';
import type { IStrictFetch } from '../common/types';

class ServerStrictFetch extends CommonStrictFetch {}

export const StrictFetch: IStrictFetch = new ServerStrictFetch();
