import axios from 'axios'
import type { AxiosResponse } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import Home from '../views/Home.vue'
import allRolesData from '../mocks/allRolesData.json'
import staticContent from '../mocks/getStaticContent.json'
import { useJobListingsStore } from '../stores/jobListings'
import { useSavedRolesStore } from '../stores/savedRoles'
import type { JobListing } from '../types/jobListing'

describe('Home', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.stubEnv('VITE_BACKEND_URL', 'http://api.test/fresherFriend')
    vi.stubEnv('VITE_USE_MOCK', 'true')
  })

  it('renders the All Roles heading, description, search input, and sort options', () => {
    const pinia = createPinia()
    useJobListingsStore(pinia).setJobListings(allRolesData)
    const wrapper = mount(Home, {
      global: { plugins: [pinia] },
    })

    expect(wrapper.get('h1').text()).toBe(staticContent.allRoles.heading)
    expect(wrapper.text()).toContain(staticContent.allRoles.description)
    expect(wrapper.get('input[type="search"]').attributes('placeholder')).toBe(
      staticContent.searchPlaceholder,
    )
    expect(wrapper.element.querySelector('svg')).not.toBeNull()
    expect(wrapper.get('label[for="sort-by"]').text()).toBe(staticContent.sortBy.label)

    const renderedSortOptions = wrapper.findAll('select option').map((option) => option.text())
    expect(renderedSortOptions).toEqual(staticContent.sortBy.options.map((option) => option.label))
  })

  it('shows at most 20 jobs and toggles saved roles', async () => {
    const pinia = createPinia()
    useJobListingsStore(pinia).setJobListings(allRolesData)
    const wrapper = mount(Home, {
      global: { plugins: [pinia] },
    })
    const savedRoles = useSavedRolesStore(pinia)

    expect(wrapper.findAll('article')).toHaveLength(Math.min(allRolesData.length, 20))
    expect(savedRoles.savedRoleCount).toBe(0)

    await wrapper.get('button[aria-label="Save role"]').trigger('click')

    expect(savedRoles.savedRoleCount).toBe(1)
    expect(wrapper.get('button[aria-label="Remove saved role"]').attributes('aria-pressed')).toBe(
      'true',
    )

    await wrapper.get('button[aria-label="Remove saved role"]').trigger('click')

    expect(savedRoles.savedRoleCount).toBe(0)
  })

  it('renders pagination based on the 20-job page size', () => {
    const pinia = createPinia()
    useJobListingsStore(pinia).setJobListings(allRolesData)
    const wrapper = mount(Home, {
      global: { plugins: [pinia] },
    })
    const pagination = wrapper.get(
      `nav[aria-label="${staticContent.pagination.navigationLabel}"]`,
    )

    expect(pagination.findAll('button')).toHaveLength(3)
    expect(pagination.get('[aria-current="page"]').text()).toBe('1')
    expect(pagination.find('button[aria-label="Previous page"]').attributes('disabled')).toBeDefined()
    expect(pagination.find('button[aria-label="Next page"]').attributes('disabled')).toBeDefined()
  })

  it('shows 15 API pages and requests the selected page number', async () => {
    vi.stubEnv('VITE_USE_MOCK', 'false')
    const pinia = createPinia()
    useJobListingsStore(pinia).setJobListings(allRolesData)
    const response: AxiosResponse<JobListing[]> = {
      data: allRolesData,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: {} as AxiosResponse<JobListing[]>['config']['headers'],
      },
    }
    const request = vi
      .spyOn(axios, 'get')
      .mockResolvedValue(response)
    const wrapper = mount(Home, {
      global: { plugins: [pinia] },
    })
    const pagination = wrapper.get(
      `nav[aria-label="${staticContent.pagination.navigationLabel}"]`,
    )

    expect(pagination.findAll('button')).toHaveLength(17)

    await pagination.get('button[aria-label="Go to page 5"]').trigger('click')
    await flushPromises()

    expect(request).toHaveBeenCalledWith(
      'http://api.test/fresherFriend/jobs-listing?country=IN&exclude_worldwide=true&sort=recent&page=5',
    )
    expect(request.mock.calls[0]?.[0]).toMatch(/(?:\?|&)page=\d+$/)
    expect(wrapper.findAll('article')).toHaveLength(
      Math.min(allRolesData.length, 20),
    )
    expect(wrapper.get('[aria-current="page"]').text()).toBe('5')
  })
})
