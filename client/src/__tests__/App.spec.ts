import axios, { type AxiosResponse } from 'axios'
import { createPinia } from 'pinia'
import { beforeEach, describe, it, expect, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import App from '../App.vue'
import allRolesData from '../mocks/allRolesData.json'
import filterOpportunities from '../mocks/filterOpportunities.json'

function makeResponse(data: unknown): AxiosResponse {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: { headers: {} as AxiosResponse['config']['headers'] },
  }
}

describe('App', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
    vi.unstubAllEnvs()
  })

  it('shows the info modal while initial content is loading', () => {
    vi.stubEnv('VITE_BACKEND_URL', 'http://api.test/fresherFriend')
    vi.stubEnv('VITE_USE_MOCK', 'false')
    vi.spyOn(axios, 'get').mockReturnValue(new Promise<AxiosResponse>(() => {}))

    const wrapper = mount(App, {
      global: {
        plugins: [createPinia()],
        stubs: {
          RouterView: { template: '<div data-testid="router-view" />' },
        },
      },
    })

    expect(wrapper.get('[role="dialog"]').text().replace(/\s+/g, ' ').trim()).toBe(
      'Thank you for your patience! We are currently fetching the initial content from the API. This may take a few moments, so please bear with us. Your experience is important to us, and we appreciate your understanding as we ensure everything is set up correctly.',
    )
    expect(wrapper.find('button').exists()).toBe(false)
    expect(axios.get).toHaveBeenCalledWith(
      'http://api.test/fresherFriend/initial-content',
    )
    expect(axios.get).toHaveBeenCalledWith(
      'http://api.test/fresherFriend/jobs-listing?page=1',
    )
    expect(axios.get).not.toHaveBeenCalledWith(
      'http://api.test/fresherFriend/filter-opportunities',
    )
  })

  it('shows the rate-limit message and retry button when initial content returns 429', async () => {
    vi.stubEnv('VITE_BACKEND_URL', 'http://api.test/fresherFriend')
    vi.stubEnv('VITE_USE_MOCK', 'false')
    vi.spyOn(axios, 'get')
      .mockRejectedValueOnce({
        message: 'Request failed with status code 429',
        response: {
          status: 429,
          data: { error: 'Too many requests' },
        },
      })
      .mockReturnValue(new Promise<AxiosResponse>(() => {}))

    const wrapper = mount(App, {
      global: {
        plugins: [createPinia()],
        stubs: {
          RouterView: { template: '<div data-testid="router-view" />' },
        },
      },
    })
    await flushPromises()

    const dialog = wrapper.get('[role="dialog"]')
    expect(dialog.text()).toContain('Oops! Something went wrong.')
    expect(dialog.text()).toContain('Rate limit exceeded. Please try again later.')
    expect(
      dialog.find('button[aria-label="Close error"]').exists(),
    ).toBe(true)
    expect(dialog.text()).toContain('Retry')
  })

  it('shows a no-retry slow-request notice after 10 seconds and hides it when the jobs request succeeds', async () => {
    vi.stubEnv('VITE_BACKEND_URL', 'http://api.test/fresherFriend')
    vi.stubEnv('VITE_USE_MOCK', 'false')
    let resolveInitialContent!: (response: AxiosResponse) => void
    let resolveJobs!: (response: AxiosResponse) => void
    const initialContentRequest = new Promise<AxiosResponse>((resolve) => {
      resolveInitialContent = resolve
    })
    const jobsRequest = new Promise<AxiosResponse>((resolve) => {
      resolveJobs = resolve
    })
    vi.spyOn(axios, 'get')
      .mockReturnValueOnce(initialContentRequest)
      .mockReturnValueOnce(jobsRequest)
      .mockResolvedValueOnce(makeResponse(filterOpportunities))

    vi.useFakeTimers()
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia()],
        stubs: {
          RouterView: { template: '<div data-testid="router-view" />' },
        },
      },
    })
    await flushPromises()

    expect(wrapper.get('[role="dialog"]').text()).toContain(
      'Thank you for your patience!',
    )
    expect(wrapper.find('[role="dialog"]').text()).not.toContain(
      'free AI model',
    )
    await vi.advanceTimersByTimeAsync(10_000)

    resolveInitialContent(makeResponse({}))
    await flushPromises()
    const dialog = wrapper.get('[role="dialog"]')
    expect(dialog.text()).toContain(
      'Request is taking longer than expected',
    )
    expect(dialog.text()).toContain(
      "No need to worry—we're continuing to process your request on the backend.",
    )
    expect(dialog.find('button:not([aria-label="Close error"])').exists()).toBe(
      false,
    )

    resolveJobs(
      makeResponse({
        jobs: allRolesData,
        page: 1,
        pageSize: 20,
        totalJobs: allRolesData.length,
        totalPages: 1,
      }),
    )
    await flushPromises()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    vi.useRealTimers()
  })

  it('shows the AI capacity error after the filter request is slow without cancelling it', async () => {
    vi.useFakeTimers()
    vi.stubEnv('VITE_BACKEND_URL', 'http://api.test/fresherFriend')
    vi.stubEnv('VITE_USE_MOCK', 'false')
    let resolveFilterRequest!: (response: AxiosResponse) => void
    const filterRequest = new Promise<AxiosResponse>((resolve) => {
      resolveFilterRequest = resolve
    })
    vi.spyOn(axios, 'get')
      .mockResolvedValueOnce(makeResponse({}))
      .mockResolvedValueOnce(
        makeResponse({
          jobs: allRolesData,
          page: 1,
          pageSize: 20,
          totalJobs: allRolesData.length,
          totalPages: 1,
        }),
      )
      .mockReturnValueOnce(filterRequest)

    const wrapper = mount(App, {
      global: {
        plugins: [createPinia()],
        stubs: {
          RouterView: { template: '<div data-testid="router-view" />' },
        },
      },
    })
    await flushPromises()
    await vi.advanceTimersByTimeAsync(10_000)

    const dialog = wrapper.get('[role="dialog"]')
    expect(dialog.text()).toContain(
      'Request is taking longer than expected',
    )
    expect(dialog.text()).toContain(
      "No need to worry—we're continuing to process your request on the backend.",
    )
    expect(dialog.find('button:not([aria-label="Close error"])').exists()).toBe(
      false,
    )
    expect(axios.get).toHaveBeenLastCalledWith(
      'http://api.test/fresherFriend/filter-opportunities',
    )

    resolveFilterRequest(makeResponse(filterOpportunities))
    await flushPromises()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    vi.useRealTimers()
  })

  it('loads filter opportunities after job listings', async () => {
    vi.stubEnv('VITE_BACKEND_URL', 'http://api.test/fresherFriend')
    vi.stubEnv('VITE_USE_MOCK', 'false')
    const request = vi
      .spyOn(axios, 'get')
      .mockReturnValueOnce(new Promise<AxiosResponse>(() => {}))
      .mockResolvedValueOnce(
        makeResponse({
          jobs: allRolesData,
          page: 1,
          pageSize: 20,
          totalJobs: allRolesData.length,
          totalPages: 1,
        }),
      )
      .mockResolvedValueOnce(makeResponse(filterOpportunities))

    mount(App, {
      global: {
        plugins: [createPinia()],
      },
    })
    await flushPromises()

    expect(request.mock.calls.map(([url]) => url)).toEqual([
      'http://api.test/fresherFriend/initial-content',
      'http://api.test/fresherFriend/jobs-listing?page=1',
      'http://api.test/fresherFriend/filter-opportunities',
    ])
  })

  it('does not request filter opportunities when job listings fail', async () => {
    vi.stubEnv('VITE_BACKEND_URL', 'http://api.test/fresherFriend')
    vi.stubEnv('VITE_USE_MOCK', 'false')
    const request = vi
      .spyOn(axios, 'get')
      .mockResolvedValueOnce(makeResponse({}))
      .mockRejectedValueOnce(new Error('Jobs request failed'))

    mount(App, {
      global: {
        plugins: [createPinia()],
      },
    })
    await flushPromises()

    expect(request.mock.calls.map(([url]) => url)).toEqual([
      'http://api.test/fresherFriend/initial-content',
      'http://api.test/fresherFriend/jobs-listing?page=1',
    ])
  })
})
