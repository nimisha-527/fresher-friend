import axios, { type AxiosResponse } from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useFilterOpportunitiesApi } from '../composables/useFilterOpportunitiesApi'
import filterOpportunitiesMock from '../mocks/filterOpportunities.json'
import { useFilterOpportunitiesStore } from '../stores/filterOpportunities'
import type { FilterOpportunities } from '../types/filterOpportunities'

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}))

function makeResponse(data: FilterOpportunities): AxiosResponse<FilterOpportunities> {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {
      headers: {} as AxiosResponse<FilterOpportunities>['config']['headers'],
    },
  }
}

describe('useFilterOpportunitiesApi', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
    vi.useRealTimers()
    vi.unstubAllEnvs()
    vi.stubEnv('VITE_BACKEND_URL', 'http://api.test/fresherFriend')
  })

  it('loads mock filter options when VITE_USE_MOCK is true', async () => {
    vi.stubEnv('VITE_USE_MOCK', 'true')
    const { getFilterOpportunities, filterOpportunities } =
      useFilterOpportunitiesApi()

    await getFilterOpportunities()

    expect(axios.get).not.toHaveBeenCalled()
    expect(filterOpportunities.value).toEqual(filterOpportunitiesMock)
  })

  it('requests and stores filter options from the API', async () => {
    vi.stubEnv('VITE_USE_MOCK', 'false')
    vi.mocked(axios.get).mockResolvedValue(
      makeResponse(filterOpportunitiesMock),
    )
    const { getFilterOpportunities, filterOpportunities } =
      useFilterOpportunitiesApi()

    await getFilterOpportunities()

    expect(axios.get).toHaveBeenCalledExactlyOnceWith(
      'http://api.test/fresherFriend/filter-opportunities',
    )
    expect(filterOpportunities.value).toEqual(filterOpportunitiesMock)
  })

  it('shows the AI capacity message after 10 seconds without cancelling the filter request', async () => {
    vi.stubEnv('VITE_USE_MOCK', 'false')
    vi.useFakeTimers()
    let resolveRequest!: (response: AxiosResponse<FilterOpportunities>) => void
    vi.mocked(axios.get).mockReturnValue(
      new Promise<AxiosResponse<FilterOpportunities>>((resolve) => {
        resolveRequest = resolve
      }),
    )
    const { getFilterOpportunities, error } = useFilterOpportunitiesApi()
    const request = getFilterOpportunities()

    await vi.advanceTimersByTimeAsync(10_000)

    expect(error.value).toBe(
      'The free AI model is currently experiencing high demand.',
    )

    resolveRequest(makeResponse(filterOpportunitiesMock))
    await request
    expect(error.value).toBeNull()
    vi.useRealTimers()
  })

  it('exposes filter API errors through the store', async () => {
    vi.stubEnv('VITE_USE_MOCK', 'false')
    vi.mocked(axios.get).mockRejectedValue(new Error('Request failed'))
    const { getFilterOpportunities, error, loading } =
      useFilterOpportunitiesApi()

    await getFilterOpportunities()

    expect(error.value).toBe('Request failed')
    expect(loading.value).toBe(false)
    expect(useFilterOpportunitiesStore().error).toBe('Request failed')
  })

  it('shows the API response error message when the request fails', async () => {
    vi.stubEnv('VITE_USE_MOCK', 'false')
    vi.mocked(axios.get).mockRejectedValue({
      message: 'Request failed with status code 502',
      response: {
        status: 502,
        data: { error: 'AI service is unavailable', status: 503 },
      },
    })
    const { getFilterOpportunities, error } = useFilterOpportunitiesApi()

    await getFilterOpportunities()

    expect(error.value).toBe('AI service is unavailable')
  })

  it('uses the rate-limit message when the upstream response status is 429', async () => {
    vi.stubEnv('VITE_USE_MOCK', 'false')
    vi.mocked(axios.get).mockRejectedValue({
      message: 'Request failed with status code 502',
      response: {
        status: 502,
        data: { error: 'Upstream error', status: 429 },
      },
    })
    const { getFilterOpportunities, error } = useFilterOpportunitiesApi()

    await getFilterOpportunities()

    expect(error.value).toBe('Rate limit exceeded. Please try again later.')
  })
})
