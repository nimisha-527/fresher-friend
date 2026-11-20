<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import staticContent from '../mocks/getStaticContent.json'
import { useFilterOpportunitiesStore } from '../stores/filterOpportunities'
import type { JobListingFilters } from '../types/jobListing'

defineOptions({
  name: 'FilterOpportunities',
})

const selectedFilters = defineModel<JobListingFilters>('filters', {
  required: true,
})

const filterStore = useFilterOpportunitiesStore()
const { filterOpportunities, loading, error } = storeToRefs(filterStore)
const filterGroups = computed(() => [
  {
    id: 'workMode',
    label: staticContent.filterOpportunities.workModeLabel,
    options: filterOpportunities.value.workMode,
  },
  {
    id: 'roleType',
    label: staticContent.filterOpportunities.roleTypeLabel,
    options: filterOpportunities.value.roleType,
  },
  {
    id: 'location',
    label: staticContent.filterOpportunities.locationLabel,
    options: filterOpportunities.value.location,
  },
  {
    id: 'parentCategories',
    label: staticContent.filterOpportunities.parentCategoriesLabel,
    options: filterOpportunities.value.parentCategories,
  },
  {
    id: 'salaryRange',
    label: staticContent.filterOpportunities.salaryRange,
    options: filterOpportunities.value.salaryRange,
  },
] as const)
</script>

<template>
  <section
    aria-labelledby="filter-opportunities-heading"
    class="max-h-[70vh] overflow-y-auto rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)]"
  >
    <h2
      id="filter-opportunities-heading"
      class="mb-5 text-lg font-semibold text-[#111111]"
    >
      {{ staticContent.filterOpportunities.label }}
    </h2>
    <p v-if="loading" class="mb-4 text-sm text-[#52525B]" role="status">
      {{ staticContent.loading.title }}
    </p>
    <p v-else-if="error" class="mb-4 text-sm text-[#B91C1C]" role="alert">
      {{ error }}
    </p>
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
      <fieldset v-for="group in filterGroups" :key="group.id" class="min-w-0">
        <legend class="mb-3 text-sm font-semibold text-[#111111]">
          {{ group.label }}
        </legend>
        <div class="flex flex-col gap-2.5">
          <label
            v-for="(option, index) in group.options"
            :key="option"
            :for="`filter-${group.id}-${index}`"
            class="flex cursor-pointer items-start gap-2.5 text-sm text-[#52525B]"
          >
            <input
              :id="`filter-${group.id}-${index}`"
              v-model="selectedFilters[group.id]"
              :value="option"
              type="checkbox"
              class="mt-0.5 size-4 shrink-0 accent-[#FACC15] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FACC15]"
            />
            <span>{{ option }}</span>
          </label>
        </div>
      </fieldset>
    </div>
  </section>
</template>
