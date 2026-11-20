import axios from 'axios'
import { storeToRefs } from 'pinia'
import allRolesData from '../mocks/allRolesData.json'
import { useJobListingsStore } from '../stores/jobListings'
import type { JobListingsPage } from '../types/jobListing'

export const JOBS_PER_PAGE = 20

export const useJobListingApi = () => {
  const jobListingsStore = useJobListingsStore()
  const { jobListings, totalPages, loading, error } =
    storeToRefs(jobListingsStore)
  const isMockMode = import.meta.env.VITE_USE_MOCK === 'true'

  const getJobListings = async (page = 1) => {
    if (!Number.isSafeInteger(page) || page < 1) {
      jobListingsStore.setError('Page must be a positive integer.')
      return
    }

    jobListingsStore.loading = true
    jobListingsStore.error = null

    try {
      if (isMockMode) {
        jobListingsStore.setJobListings(allRolesData)
        return
      }

      const serverURL = import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, '')
      if (!serverURL) {
        throw new Error(
          'VITE_BACKEND_URL is required when mock job data is disabled.',
        )
      }

      const response = await axios.get<JobListingsPage>(
        `${serverURL}/jobs-listing?page=${page}`,
      )
      const data = response.data
      if (
        !data ||
        typeof data !== 'object' ||
        !Array.isArray(data.jobs) ||
        typeof data.totalPages !== 'number' ||
        !Number.isSafeInteger(data.totalPages) ||
        data.totalPages < 0
      ) {
        throw new Error('Jobs listing API returned an invalid response.')
      }

      jobListingsStore.setJobListings(
        data.jobs,
        data.totalPages,
      )
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Unknown error'
      console.error('Failed to fetch job listings:', requestError)
      jobListingsStore.setError(message)
    } finally {
      jobListingsStore.loading = false
    }
  }

  return {
    getJobListings,
    jobListings,
    totalPages,
    loading,
    error,
    isMockMode,
  }
}
