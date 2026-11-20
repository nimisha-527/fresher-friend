import axios, { type AxiosResponse } from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useJobListingApi } from '../composables/useJobListingApi'
import allRolesData from '../mocks/allRolesData.json'
import type { JobListing } from '../types/jobListing'

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
    const response: AxiosResponse<JobListing[]> = {
      data: allRolesData,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: {} as AxiosResponse<JobListing[]>['config']['headers'],
      },
    }
    vi.mocked(axios.get).mockResolvedValue(response)
    const { getJobListings, jobListings } = useJobListingApi()

    await getJobListings()

    expect(axios.get).toHaveBeenCalledWith(
      'http://api.test/fresherFriend/jobs-listing?country=IN&exclude_worldwide=true&sort=recent',
    )
    expect(jobListings.value).toEqual(allRolesData)
  })

  it('passes numeric pages and omits the page param for page one', async () => {
    vi.stubEnv('VITE_USE_MOCK', 'false')
    const response: AxiosResponse<JobListing[]> = {
      data: allRolesData,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: {} as AxiosResponse<JobListing[]>['config']['headers'],
      },
    }
    vi.mocked(axios.get).mockResolvedValue(response)
    const { getJobListings } = useJobListingApi()

    await getJobListings(1)
    await getJobListings(2)

    expect(axios.get).toHaveBeenNthCalledWith(
      1,
      'http://api.test/fresherFriend/jobs-listing?country=IN&exclude_worldwide=true&sort=recent',
    )
    expect(axios.get).toHaveBeenNthCalledWith(
      2,
      'http://api.test/fresherFriend/jobs-listing?country=IN&exclude_worldwide=true&sort=recent&page=2',
    )
    expect(vi.mocked(axios.get).mock.calls[1]?.[0]).toMatch(
      /(?:\?|&)page=\d+$/,
    )
  })

  it('rejects non-integer page values without making a request', async () => {
    vi.stubEnv('VITE_USE_MOCK', 'false')
    const { getJobListings, error } = useJobListingApi()

    await getJobListings(2.5)

    expect(axios.get).not.toHaveBeenCalled()
    expect(error.value).toBe('Page must be a positive integer.')
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
