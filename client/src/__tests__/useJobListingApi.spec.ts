import axios, { type AxiosResponse } from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useJobListingApi } from '../composables/useJobListingApi'
import allRolesData from '../mocks/allRolesData.json'
import type { JobListingsPage } from '../types/jobListing'

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}))

describe('useJobListingApi', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
    vi.unstubAllEnvs()
    vi.stubEnv('VITE_BACKEND_URL', 'http://api.test/fresherFriend')
  })

  it('loads mock jobs when VITE_USE_MOCK is true', async () => {
    vi.stubEnv('VITE_USE_MOCK', 'true')
    const { getJobListings, jobListings } = useJobListingApi()

    await getJobListings()

    expect(axios.get).not.toHaveBeenCalled()
    expect(jobListings.value).toEqual(allRolesData)
  })

  it('requests jobs from the API when mock mode is disabled', async () => {
    vi.stubEnv('VITE_USE_MOCK', 'false')
    const response: AxiosResponse<JobListingsPage> = {
      data: {
        jobs: allRolesData,
        page: 1,
        pageSize: 20,
        totalJobs: 300,
        totalPages: 15,
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} as AxiosResponse<JobListingsPage>['config']['headers'] },
    }
    vi.mocked(axios.get).mockResolvedValue(response)
    const { getJobListings, jobListings, totalPages } = useJobListingApi()

    await getJobListings()

    expect(axios.get).toHaveBeenCalledExactlyOnceWith(
      'http://api.test/fresherFriend/jobs-listing?page=1',
    )
    expect(jobListings.value).toEqual(allRolesData)
    expect(totalPages.value).toBe(15)
  })

  it('requests the selected page from the cached listing API', async () => {
    vi.stubEnv('VITE_USE_MOCK', 'false')
    const response: AxiosResponse<JobListingsPage> = {
      data: {
        jobs: allRolesData,
        page: 2,
        pageSize: 20,
        totalJobs: 300,
        totalPages: 15,
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} as AxiosResponse<JobListingsPage>['config']['headers'] },
    }
    vi.mocked(axios.get).mockResolvedValue(response)
    const { getJobListings } = useJobListingApi()

    await getJobListings(2)

    expect(axios.get).toHaveBeenCalledExactlyOnceWith(
      'http://api.test/fresherFriend/jobs-listing?page=2',
    )
  })

  it('exposes API errors to the page state', async () => {
    vi.stubEnv('VITE_USE_MOCK', 'false')
    vi.mocked(axios.get).mockRejectedValue(new Error('Request failed'))
    const { getJobListings, error, loading } = useJobListingApi()

    await getJobListings()

    expect(error.value).toBe('Request failed')
    expect(loading.value).toBe(false)
  })
})
