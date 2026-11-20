<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import JobCard from '../components/JobCard.vue'
import SearchInput from '../components/SearchInput.vue'
import SortSelector from '../components/SortSelector.vue'
import staticContent from '../mocks/getStaticContent.json'
import {
  DEMO_PAGE_COUNT,
  JOBS_PER_PAGE,
  useJobListingApi,
} from '../composables/useJobListingApi'
import { useSavedRolesStore } from '../stores/savedRoles'

defineOptions({
  name: 'HomePage',
})

const searchQuery = ref('')
const initialSortOption = staticContent.sortBy.options[0]

if (!initialSortOption) {
  throw new Error('At least one sort option is required.')
}

const selectedSortOption = ref(initialSortOption.id)
const currentPage = ref(1)
const {
  getJobListings,
  jobListings,
  loading: jobsLoading,
  error: jobsError,
  isMockMode,
} = useJobListingApi()
const totalPages = computed(() =>
  isMockMode
    ? Math.max(1, Math.ceil(jobListings.value.length / JOBS_PER_PAGE))
    : DEMO_PAGE_COUNT,
)
const pageNumbers = computed(() =>
  Array.from({ length: totalPages.value }, (_, index) => index + 1),
)
const jobs = computed(() => {
  const start = isMockMode ? (currentPage.value - 1) * JOBS_PER_PAGE : 0
  return jobListings.value.slice(start, start + JOBS_PER_PAGE)
})
const savedRoles = useSavedRolesStore()

async function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) {
    return
  }

  currentPage.value = page
  await getJobListings(page)
}
</script>

<template>
  <section class="w-full bg-[#FAFAFA] px-4 py-10 text-left text-[#111111] sm:px-6 sm:py-14">
    <div class="mx-auto max-w-7xl">
      <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
        {{ staticContent.allRoles.heading }}
      </h1>
      <p class="mt-3 max-w-3xl text-base leading-7 text-[#52525B]">
        {{ staticContent.allRoles.description }}
      </p>

      <div class="mt-8 flex flex-col gap-4 md:flex-row md:items-center">
        <SearchInput v-model="searchQuery" class="min-w-0 flex-1" />
        <SortSelector v-model="selectedSortOption" />
      </div>

      <p v-if="jobsLoading" class="mt-8 text-sm text-[#52525B]" role="status">
        {{ staticContent.loading.title }}
        {{ staticContent.loading.description }}
      </p>
      <div
        v-else-if="jobsError"
        class="mt-8 rounded-xl border border-[#E5E7EB] bg-white p-6 text-[#52525B]"
        role="alert"
      >
        <p class="font-semibold text-[#111111]">{{ staticContent.error.title }}</p>
        <p class="mt-2">{{ staticContent.error.description }}</p>
      </div>
      <div
        v-else-if="jobListings.length === 0"
        class="mt-8 rounded-xl border border-[#E5E7EB] bg-white p-6 text-[#52525B]"
        role="status"
      >
        <p class="font-semibold text-[#111111]">{{ staticContent.noResults.title }}</p>
        <p class="mt-2">{{ staticContent.noResults.description }}</p>
      </div>
      <div v-else class="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <JobCard
          v-for="job in jobs"
          :key="job.id"
          :job="job"
          :saved="savedRoles.isSaved(job.id)"
          @toggle-saved="savedRoles.toggleSavedRole"
        />
      </div>

      <nav
        v-if="!jobsLoading && !jobsError && jobListings.length > 0"
        :aria-label="staticContent.pagination.navigationLabel"
        class="mt-8 flex items-center justify-center gap-2"
      >
        <button
          type="button"
          :aria-label="staticContent.pagination.previousPageLabel"
          :disabled="currentPage === 1"
          class="inline-flex size-10 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#111111] transition-colors hover:bg-[#FEF9C3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FACC15] disabled:cursor-not-allowed disabled:opacity-50"
          @click="goToPage(currentPage - 1)"
        >
          <ChevronLeft :size="18" aria-hidden="true" />
        </button>
        <button
          v-for="page in pageNumbers"
          :key="page"
          type="button"
          :aria-label="
            staticContent.pagination.goToPageLabel.replace(
              '{{page}}',
              String(page),
            )
          "
          :aria-current="currentPage === page ? 'page' : undefined"
          :class="[
            'inline-flex size-10 items-center justify-center rounded-lg border text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FACC15]',
            currentPage === page
              ? 'border-[#FACC15] bg-[#FACC15] text-[#111111]'
              : 'border-[#E5E7EB] bg-white text-[#52525B] hover:bg-[#FEF9C3] hover:text-[#111111]',
          ]"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
        <button
          type="button"
          :aria-label="staticContent.pagination.nextPageLabel"
          :disabled="currentPage === totalPages"
          class="inline-flex size-10 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#111111] transition-colors hover:bg-[#FEF9C3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FACC15] disabled:cursor-not-allowed disabled:opacity-50"
          @click="goToPage(currentPage + 1)"
        >
          <ChevronRight :size="18" aria-hidden="true" />
        </button>
      </nav>
    </div>
  </section>
</template>
