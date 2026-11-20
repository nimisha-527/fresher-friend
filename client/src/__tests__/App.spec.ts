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
    vi.unstubAllEnvs()
  })

  it('shows the info modal while initial content is loading', () => {
    vi.stubEnv('VITE_BACKEND_URL', 'http://api.test/fresherFriend')
    vi.stubEnv('VITE_USE_MOCK', 'false')
    vi.spyOn(axios, 'get').mockReturnValue(new Promise<AxiosResponse>(() => {}))

    const wrapper = mount(App, {
      global: {
        plugins: [createPinia()],
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
})
