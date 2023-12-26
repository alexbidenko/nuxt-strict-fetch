import {StrictFetchConstructor} from "../common/base";
import {useNuxtApp} from "#app";
import type {IStrictFetch} from "../common/types";

export const StrictFetch: IStrictFetch = new StrictFetchConstructor(useNuxtApp);
