import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { JobListing } from '../types/jobListing'

export const useJobListingsStore = defineStore('jobListings', () => {
  const jobListings = ref<JobListing[]>([])
  const totalPages = ref(1)
  const loading = ref(false)
  const error = ref<string | null>(null)

  function setJobListings(listings: JobListing[], pageCount?: number) {
    jobListings.value = listings
    totalPages.value =
      pageCount ?? Math.max(1, Math.ceil(listings.length / 20))
    error.value = null
  }

  function setError(message: string) {
    error.value = message
  }

  return {
    jobListings,
    totalPages,
    loading,
    error,
    setJobListings,
    setError,
  }
})
