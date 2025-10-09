<script setup lang="ts">
const { data } = await useAsyncData(() => CommonAPI.list());
</script>

<template>
  <div>
    Nuxt module playground!

    <ul>
      <li v-for="item in data" :key="item.id">
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>
