import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { FilterOpportunities } from '../types/filterOpportunities'

export const useFilterOpportunitiesStore = defineStore(
  'filterOpportunities',
  () => {
    const filterOpportunities = ref<FilterOpportunities>({
      location: [],
      workMode: [],
      roleType: [],
      parentCategories: [],
      salaryRange: [],
      categories: [],
    })
    const loading = ref(false)
    const error = ref<string | null>(null)

    function setFilterOpportunities(options: FilterOpportunities) {
      filterOpportunities.value = options
      error.value = null
    }

    function setError(message: string) {
      error.value = message
    }

    return {
      filterOpportunities,
      loading,
      error,
      setFilterOpportunities,
      setError,
    }
  },
)
