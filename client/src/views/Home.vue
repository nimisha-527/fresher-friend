<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import FilterOpportunities from '../components/FilterOpportunities.vue'
import JobCard from '../components/JobCard.vue'
import SearchInput from '../components/SearchInput.vue'
import SortSelector from '../components/SortSelector.vue'
import staticContent from '../mocks/getStaticContent.json'
import {
  JOBS_PER_PAGE,
  useJobListingApi,
} from '../composables/useJobListingApi'
import { useUsdInrRate } from '../composables/useUsdInrRate'
import { useFilterOpportunitiesStore } from '../stores/filterOpportunities'
import { useSavedRolesStore } from '../stores/savedRoles'
import type { JobListing, JobListingFilters } from '../types/jobListing'

defineOptions({
  name: 'HomePage',
})

const searchQuery = ref('')
const initialSortOption = staticContent.sortBy.options[0]

if (!initialSortOption) {
  throw new Error('At least one sort option is required.')
}

const defaultSortOptionId = initialSortOption.id
const selectedSortOption = ref<number | ''>(defaultSortOptionId)
const currentPage = ref(1)
const selectedFilters = ref<JobListingFilters>({
  workMode: [],
  location: [],
  roleType: [],
  parentCategories: [],
  salaryRange: [],
})
const filterOpportunitiesStore = useFilterOpportunitiesStore()
const { filterOpportunities } = storeToRefs(filterOpportunitiesStore)
const {
  inrPerUsd,
  loading: exchangeRateLoading,
  error: exchangeRateError,
  getUsdInrRate,
} = useUsdInrRate()
const {
  getJobListings,
  jobListings,
  totalPages: apiTotalPages,
  loading: jobsLoading,
  error: jobsError,
  isMockMode,
} = useJobListingApi()
const totalPages = computed(() =>
  isMockMode
    ? Math.max(1, Math.ceil(jobListings.value.length / JOBS_PER_PAGE))
    : Math.max(1, apiTotalPages.value),
)
const pageNumbers = computed(() =>
  Array.from({ length: totalPages.value }, (_, index) => index + 1),
)
const jobs = computed(() => {
  if (!isMockMode) {
    return jobListings.value
  }

  const start = (currentPage.value - 1) * JOBS_PER_PAGE
  return jobListings.value.slice(start, start + JOBS_PER_PAGE)
})
const hasSelectedFilters = computed(() =>
  Object.values(selectedFilters.value).some((values) => values.length > 0),
)
const hasActiveSearchSortOrFilter = computed(
  () =>
    searchQuery.value.trim() !== '' ||
    selectedSortOption.value !== defaultSortOptionId ||
    hasSelectedFilters.value,
)

function clearSearchSortAndFilters() {
  searchQuery.value = ''
  selectedSortOption.value = defaultSortOptionId
  selectedFilters.value = {
    workMode: [],
    location: [],
    roleType: [],
    parentCategories: [],
    salaryRange: [],
  }
}

function normalizeSearchValue(value: string): string {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '')
}

const searchTerms = computed(() =>
  searchQuery.value
    .split(/\s+/)
    .map(normalizeSearchValue)
    .filter((term) => term !== ''),
)
const searchableFilterOptions = computed(
  () =>
    new Set(
      [
        ...filterOpportunities.value.location,
        ...filterOpportunities.value.workMode,
        ...filterOpportunities.value.roleType,
        ...filterOpportunities.value.parentCategories,
        ...filterOpportunities.value.salaryRange,
        ...filterOpportunities.value.categories,
      ]
        .map(normalizeSearchValue)
        .filter((option) => option !== ''),
    ),
)

function matchesSelectedValue(selectedValues: string[], value: string): boolean {
  const normalizedValue = value.trim().toLowerCase()
  return selectedValues.some(
    (selectedValue) => selectedValue.trim().toLowerCase() === normalizedValue,
  )
}

function getSalaryFilterValue(minSalary: string, maxSalary: string): string {
  const isDisclosed = (salary: string) =>
    salary.trim() !== "" && salary.trim().toLowerCase() !== "not disclosed"
  if (isDisclosed(minSalary)) {
    return minSalary.trim()
  }

  if (isDisclosed(maxSalary)) {
    return maxSalary.trim()
  }

  return 'Not Disclosed'
}

function matchesSearchQuery(job: JobListing): boolean {
  if (searchTerms.value.length === 0) {
    return true
  }

  const jobOptionValues = [
    job.location,
    job.workMode,
    job.roleType,
    ...job.parentCategories,
    ...job.categories,
    getSalaryFilterValue(job.minSalary, job.maxSalary),
  ]
    .map(normalizeSearchValue)
    .filter((value) => searchableFilterOptions.value.has(value))

  return searchTerms.value.some((term) =>
    jobOptionValues.some((option) => option.includes(term)),
  )
}

function matchesSalaryOption(
  minSalary: string,
  maxSalary: string,
  selectedValue: string,
): boolean {
  return matchesSelectedValue(
    [getSalaryFilterValue(minSalary, maxSalary)],
    selectedValue,
  )
}

const filteredJobs = computed(() =>
  jobs.value.filter(
    (job) =>
      matchesSearchQuery(job) &&
      (!selectedFilters.value.workMode.length ||
        matchesSelectedValue(selectedFilters.value.workMode, job.workMode)) &&
      (!selectedFilters.value.location.length ||
        matchesSelectedValue(selectedFilters.value.location, job.location)) &&
      (!selectedFilters.value.roleType.length ||
        matchesSelectedValue(selectedFilters.value.roleType, job.roleType)) &&
      (!selectedFilters.value.parentCategories.length ||
        job.parentCategories.some((category) =>
          matchesSelectedValue(selectedFilters.value.parentCategories, category),
        )) &&
      (!selectedFilters.value.salaryRange.length ||
        selectedFilters.value.salaryRange.some((range) =>
          matchesSalaryOption(job.minSalary, job.maxSalary, range),
        )),
  ),
)
const salarySortSelected = computed(
  () => selectedSortOption.value === 2 || selectedSortOption.value === 3,
)

watch(selectedSortOption, (sortOption) => {
  if (sortOption === 2 || sortOption === 3) {
    void getUsdInrRate()
  }
})

function getSalaryAmountInLpa(job: JobListing): number | null {
  const salary = getSalaryFilterValue(job.minSalary, job.maxSalary)
  if (salary.toLowerCase() === 'not disclosed') {
    return null
  }

  const isUsd = /^USD\b/i.test(salary)
  const isLpa = /LPA$/i.test(salary)
  if (!isUsd && !isLpa) {
    return null
  }

  const amountText = salary
    .replace(/^USD\s*/i, '')
    .replace(/\s*LPA$/i, '')
    .replace(/,/g, '')
    .trim()
  const amount = Number(amountText)
  if (!Number.isFinite(amount)) {
    return null
  }

  if (isUsd) {
    return inrPerUsd.value === null
      ? null
      : (amount * inrPerUsd.value) / 100_000
  }

  return amount
}

const sortedJobs = computed(() => {
  const sortOption = selectedSortOption.value
  if (sortOption === '') {
    return filteredJobs.value
  }

  if (sortOption === 1) {
    return [...filteredJobs.value].sort(
      (left, right) => right.pubDate - left.pubDate,
    )
  }

  if ((sortOption === 2 || sortOption === 3) && inrPerUsd.value === null) {
    return filteredJobs.value
  }

  if (sortOption !== 2 && sortOption !== 3) {
    return filteredJobs.value
  }

  const direction = sortOption === 2 ? -1 : 1
  return [...filteredJobs.value].sort((left, right) => {
    const leftSalary = getSalaryAmountInLpa(left)
    const rightSalary = getSalaryAmountInLpa(right)

    if (leftSalary === null) {
      return rightSalary === null ? 0 : 1
    }
    if (rightSalary === null) {
      return -1
    }

    return direction * (leftSalary - rightSalary)
  })
})
const savedRoles = useSavedRolesStore()

async function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) {
    return
  }

  if (!isMockMode) {
    await getJobListings(page)
    if (jobsError.value) {
      return
    }
  }

  currentPage.value = page
}
</script>

<template>
  {{jobsError}}
  <section class="w-full bg-[#FAFAFA] px-4 py-10 text-left text-[#111111] sm:px-6 sm:py-14">
    <div class="mx-auto max-w-7xl">
      <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
        {{ staticContent.allRoles.heading }}
      </h1>
      <p class="mt-3 max-w-3xl text-base leading-7 text-[#52525B]">
        {{ staticContent.allRoles.description }}
      </p>

      <div class="mt-8 grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
        <aside aria-label="Opportunity filters" class="min-w-0">
          <FilterOpportunities v-model:filters="selectedFilters" />
        </aside>

        <section aria-label="Job listings" class="min-w-0">
          <div class="flex flex-col gap-4 md:flex-row md:items-center">
            <SearchInput v-model="searchQuery" class="min-w-0 flex-1" />
            <SortSelector v-model="selectedSortOption" />
          </div>

          <div v-if="hasActiveSearchSortOrFilter" class="mt-4">
            <button
              type="button"
              class="rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#52525B] transition-colors hover:bg-[#FEF9C3] hover:text-[#111111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FACC15]"
              @click="clearSearchSortAndFilters"
            >
              {{ staticContent.clearFiltersLabel }}
            </button>
          </div>

          <div
            v-if="salarySortSelected && exchangeRateLoading"
            class="mt-4 text-sm text-[#52525B]"
            role="status"
          >
            {{ staticContent.sortBy.rateLoading }}
          </div>
          <div
            v-if="salarySortSelected && exchangeRateError"
            class="mt-4 flex flex-wrap items-center gap-3 text-sm text-[#B91C1C]"
            role="alert"
          >
            <span>{{ exchangeRateError }}</span>
            <button
              type="button"
              class="font-semibold underline"
              @click="getUsdInrRate"
            >
              {{ staticContent.sortBy.retryRate }}
            </button>
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
            v-else-if="jobListings.length === 0 && !hasSelectedFilters"
            class="mt-8 rounded-xl border border-[#E5E7EB] bg-white p-6 text-[#52525B]"
            role="status"
          >
            <p class="font-semibold text-[#111111]">{{ staticContent.noResults.title }}</p>
            <p class="mt-2">{{ staticContent.noResults.description }}</p>
          </div>
          <div
            v-else-if="filteredJobs.length === 0"
            class="mt-8 rounded-xl border border-[#E5E7EB] bg-white p-6 text-[#52525B]"
            role="status"
          >
            <p class="font-semibold text-[#111111]">
              {{ staticContent.filterOpportunities.noResults.title }}
            </p>
            <p class="mt-2">
              {{ staticContent.filterOpportunities.noResults.description }}
            </p>
            <p class="mt-2">
              {{ staticContent.filterOpportunities.noResults.suggestions }}
            </p>
          </div>
          <div v-else class="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <JobCard
              v-for="job in sortedJobs"
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
        </section>
      </div>
    </div>
  </section>
</template>
