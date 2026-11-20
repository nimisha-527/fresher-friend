import axios from 'axios'
import { storeToRefs } from 'pinia'
import allRolesData from '../mocks/allRolesData.json'
import { useJobListingsStore } from '../stores/jobListings'
import type { JobListing } from '../types/jobListing'

export const JOBS_PER_PAGE = 20
export const DEMO_JOB_COUNT = 300
export const DEMO_PAGE_COUNT = Math.ceil(DEMO_JOB_COUNT / JOBS_PER_PAGE)

export const useJobListingApi = () => {
  const jobListingsStore = useJobListingsStore()
  const { jobListings, loading, error } = storeToRefs(jobListingsStore)
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

      const params: {
        country: string
        exclude_worldwide: boolean
        sort: string
        page?: number
      } = {
        country: 'IN',
        exclude_worldwide: true,
        sort: 'recent',
      }
      if (page > 1) {
        params.page = page
      }

      const pageQuery =
        params.page === undefined ? '' : `&page=${params.page}`
      const response = await axios.get<JobListing[]>(
        `${serverURL}/jobs-listing?country=IN&exclude_worldwide=true&sort=recent${pageQuery}`,
      )
      if (!Array.isArray(response.data)) {
        throw new Error('Jobs listing API returned an invalid response.')
      }

      jobListingsStore.setJobListings(response.data)
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Unknown error'
      console.error('Failed to fetch job listings:', requestError)
      jobListingsStore.setError(message)
    } finally {
      jobListingsStore.loading = false
    }
  }

  return { getJobListings, jobListings, loading, error, isMockMode }
}
