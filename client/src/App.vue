<script setup lang="ts">
import { onMounted } from 'vue'
import Portal from './components/Portal.vue'
import { useInitialContent } from './composables/useInitialContent.ts'

const { getInitialContent, loading, apiError, data } = useInitialContent()

onMounted(async () => {
  await getInitialContent()
})
</script>

<template>
  <main id="root">
    <h3 v-if="loading">Loading initial content</h3>
    <p v-else-if="apiError">{{ apiError }}</p>
    <div v-else>
      <h1>{{ data?.title }}</h1>
      <p>{{ data?.description }}</p>
      <p>
        Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the
        documentation
      </p>
      <Portal />
    </div>
  </main>
</template>

<style scoped>
#root {
  margin: 0 auto;
  text-align: center;
}
</style>
