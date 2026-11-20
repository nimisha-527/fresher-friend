import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { JobListing } from '../types/jobListing'

export const useJobListingsStore = defineStore('jobListings', () => {
  const jobListings = ref<JobListing[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  function setJobListings(listings: JobListing[]) {
    jobListings.value = listings
    error.value = null
  }

  function setError(message: string) {
    error.value = message
  }

  return { jobListings, loading, error, setJobListings, setError }
})
