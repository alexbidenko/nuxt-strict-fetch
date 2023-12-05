<script setup lang="ts">
const { data } = useAsyncData(() => CommonAPI.list());

const name = ref('');

const { execute, isValid, isLoading } = useRequest(CommonAPI.createItem, () => ({
  body: { name: name.value },
}));

const onSubmit = () => {
  execute()?.then((item) => {
    name.value = '';

    data.value?.push(item);
  }).catch((e) => {
    alert(e.message);
  });
};
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
  </div>
</template>
