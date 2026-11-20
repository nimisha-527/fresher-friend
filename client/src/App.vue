<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { RouterView } from 'vue-router'
import InfoModal from './components/modals/Info.vue'
import { useFilterOpportunitiesApi } from './composables/useFilterOpportunitiesApi'
import { useInitialContent } from './composables/useInitialContent.ts'
import { useJobListingApi } from './composables/useJobListingApi'

const { getInitialContent, loading, apiError } = useInitialContent()
const { getJobListings } = useJobListingApi()
const { getFilterOpportunities } = useFilterOpportunitiesApi()

onBeforeMount(async () => {
  await Promise.all([
    getInitialContent(),
    (async () => {
      await getJobListings()
      await getFilterOpportunities()
    })(),
  ])
})
</script>

<template>
  <main id="root">
    <InfoModal v-if="loading" />
    <p v-else-if="apiError">{{ apiError }}</p>
    <div v-else class="flex flex-col justify-center gap-4">
      <!-- <h1 class="text-3xl font-bold underline">{{ data?.title }}</h1>
      <p>{{ data?.description }}</p>
      <p>
        Visit
        <a
          class="text-sky-500 hover:text-sky-700"
          href="https://vuejs.org/"
          target="_blank"
          rel="noopener"
          >vuejs.org</a
        >
        to read the documentation
      </p> -->
      <RouterView />
    </div>
  </main>
</template>

<style scoped>
#root {
  margin: 0 auto;
  text-align: center;
}
</style>
