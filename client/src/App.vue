<script setup lang="ts">
import { computed, onBeforeMount } from 'vue'
import { RouterView } from 'vue-router'
import InfoModal from './components/modals/Info.vue'
import ErrorModal from './components/modals/Error.vue'
import { useFilterOpportunitiesApi } from './composables/useFilterOpportunitiesApi'
import { useInitialContent } from './composables/useInitialContent.ts'
import { useJobListingApi } from './composables/useJobListingApi'
import staticContent from './mocks/getStaticContent.json'

const { getInitialContent, loading, apiError } = useInitialContent()
const {
  getJobListings,
  error: jobListingError,
  loading: jobListingsLoading,
} = useJobListingApi()
const {
  getFilterOpportunities,
  error: filterOpportunitiesError,
  loading: filterOpportunitiesLoading,
} = useFilterOpportunitiesApi()

const apiFailure = computed(
  () =>
    apiError.value ??
    (jobListingError.value !== staticContent.error.timeoutMessage
      ? jobListingError.value
      : null) ??
    (filterOpportunitiesError.value !== staticContent.error.timeoutMessage
      ? filterOpportunitiesError.value
      : null),
)
const showSlowRequestNotice = computed(
  () =>
    !apiFailure.value &&
    ((jobListingError.value === staticContent.error.timeoutMessage &&
      jobListingsLoading.value) ||
      (filterOpportunitiesError.value === staticContent.error.timeoutMessage &&
        filterOpportunitiesLoading.value)),
)
const displayedError = computed(
  () =>
    apiFailure.value ??
    (showSlowRequestNotice.value
      ? `${staticContent.error.timeoutMessage} ${staticContent.error.timeoutDescription}`
      : null),
)
const displayedTitle = computed(() =>
  showSlowRequestNotice.value ? staticContent.error.timeoutTitle : undefined,
)

const retryPage = () => window.location.reload()
const clearErrors = () => {
  apiError.value = null
  jobListingError.value = null
  filterOpportunitiesError.value = null
}

onBeforeMount(async () => {
  await Promise.all([
    getInitialContent(),
    (async () => {
      await getJobListings()
      if (!jobListingError.value) {
        await getFilterOpportunities()
      }
    })(),
  ])
})
</script>

<template>
  <main id="root">
    <InfoModal v-if="loading" />
    <ErrorModal
      v-else-if="displayedError"
      :title="displayedTitle"
      :message="displayedError"
      :show-retry="!showSlowRequestNotice"
      @close="clearErrors"
      @retry="retryPage"
    />
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
