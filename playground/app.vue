<script setup lang="ts">
const { data } = await useAsyncData(() => CommonAPI.list());

const name = ref('');

const { execute, isValid, isLoading } = useRequest(CommonAPI.createItem, () => ({
  body: { name: name.value },
  query: { test: true },
}));

const onSubmit = () => {
  execute()?.then((item) => {
    name.value = '';

    data.value?.push(item);
  }).catch((e) => {
    alert(e.message);
  });
};

const randomJoke = () => {
  CommonAPI.joke().then((joke) => {
    alert(joke.setup + '\n\n' + joke.punchline);
  })
};

const checkExpired = () => CommonAPI.checkExpired();
</script>

<template>
  <div>
    Nuxt module playground!

    <ul>
      <li
        v-for="item in data"
        :key="item.id"
      >
        {{ item.name }}
      </li>
    </ul>

    <form @submit.prevent="onSubmit">
      <input
        v-model="name"
        placeholder="Text"
      >
      <button
        type="submit"
        :disabled="!isValid || isLoading"
      >
        {{ isLoading ? 'Loading...' : 'Submit' }}
      </button>
    </form>

    <hr>

    <button @click="randomJoke">
      Joke!
    </button>

    <button @click="checkExpired">
      Check expired
    </button>
  </div>
</template>
