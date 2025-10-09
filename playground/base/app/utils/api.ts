type ItemType = {
  id: string;
  name: string;
};

export const CommonAPI = {
  list: StrictFetch.prepare<ItemType[]>({
    url: 'list',
  }),
};
