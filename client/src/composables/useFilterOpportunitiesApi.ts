import axios from 'axios'
import { storeToRefs } from 'pinia'
import filterOpportunitiesMock from '../mocks/filterOpportunities.json'
import staticContent from '../mocks/getStaticContent.json'
import { useFilterOpportunitiesStore } from '../stores/filterOpportunities'
import type { FilterOpportunities } from '../types/filterOpportunities'
import { getApiErrorMessage } from '../utils/apiError'

const FILTER_OPPORTUNITIES_SLOW_REQUEST_MS = 10_000

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isFilterOpportunities(value: unknown): value is FilterOpportunities {
  return (
    !!value &&
    typeof value === 'object' &&
    'location' in value &&
    isStringArray(value.location) &&
    'workMode' in value &&
    isStringArray(value.workMode) &&
    'roleType' in value &&
    isStringArray(value.roleType) &&
    'parentCategories' in value &&
    isStringArray(value.parentCategories) &&
    'salaryRange' in value &&
    isStringArray(value.salaryRange) &&
    'categories' in value &&
    isStringArray(value.categories)
  )
}

export const useFilterOpportunitiesApi = () => {
  const filterStore = useFilterOpportunitiesStore()
  const { filterOpportunities, loading, error } = storeToRefs(filterStore)
  const isMockMode = import.meta.env.VITE_USE_MOCK === 'true'

  const getFilterOpportunities = async () => {
    filterStore.loading = true
    filterStore.error = null
    let slowRequestTimer: ReturnType<typeof setTimeout> | undefined

    try {
      if (isMockMode) {
        filterStore.setFilterOpportunities(filterOpportunitiesMock)
        return
      }

      const serverURL = import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, '')
      if (!serverURL) {
        throw new Error(
          'VITE_BACKEND_URL is required when mock filter data is disabled.',
        )
      }

      slowRequestTimer = setTimeout(() => {
        filterStore.setError(staticContent.error.timeoutMessage)
      }, FILTER_OPPORTUNITIES_SLOW_REQUEST_MS)

      const response = await axios.get<unknown>(
        `${serverURL}/filter-opportunities`,
      )
      if (!isFilterOpportunities(response.data)) {
        throw new Error(
          'Filter opportunities API returned an invalid response.',
        )
      }

      filterStore.setFilterOpportunities(response.data)
    } catch (requestError) {
      console.error('Failed to fetch filter opportunities:', requestError)
      filterStore.setError(getApiErrorMessage(requestError))
    } finally {
      if (slowRequestTimer) {
        clearTimeout(slowRequestTimer)
      }
      filterStore.loading = false
    }
  }

  return {
    getFilterOpportunities,
    filterOpportunities,
    loading,
    error,
    isMockMode,
  }
}
