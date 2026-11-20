import axios, { type AxiosResponse } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import Home from '../views/Home.vue'
import allRolesData from '../mocks/allRolesData.json'
import filterOptions from '../mocks/filterOpportunities.json'
import staticContent from '../mocks/getStaticContent.json'
import { useFilterOpportunitiesStore } from '../stores/filterOpportunities'
import { useJobListingsStore } from '../stores/jobListings'
import { useSavedRolesStore } from '../stores/savedRoles'
import type { JobListing, JobListingsPage } from '../types/jobListing'

describe('Home', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
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

  it('renders filter groups with checkbox options', async () => {
    const pinia = createPinia()
    useJobListingsStore(pinia).setJobListings(allRolesData)
    useFilterOpportunitiesStore(pinia).setFilterOpportunities(filterOptions)
    const wrapper = mount(Home, {
      global: { plugins: [pinia] },
    })
    const filterPanel = wrapper.get(
      'section[aria-labelledby="filter-opportunities-heading"]',
    )
    const expectedOptionCount =
      filterOptions.workMode.length +
      filterOptions.location.length +
      filterOptions.roleType.length +
      filterOptions.parentCategories.length +
      filterOptions.salaryRange.length
    const filterSidebar = wrapper.get('aside[aria-label="Opportunity filters"]')
    const listingsSection = wrapper.get('section[aria-label="Job listings"]')

    expect(filterSidebar.element.nextElementSibling).toBe(listingsSection.element)
    expect(listingsSection.find('input[type="search"]').exists()).toBe(true)
    expect(listingsSection.find('select#sort-by').exists()).toBe(true)
    expect(filterPanel.get('h2').text()).toBe(
      staticContent.filterOpportunities.label,
    )
    expect(filterPanel.findAll('input[type="checkbox"]')).toHaveLength(
      expectedOptionCount,
    )
    expect(filterPanel.text()).toContain(
      staticContent.filterOpportunities.workModeLabel,
    )
    expect(filterPanel.text()).toContain(
      staticContent.filterOpportunities.locationLabel,
    )
    expect(filterPanel.text()).toContain(
      staticContent.filterOpportunities.roleTypeLabel,
    )
    expect(filterPanel.text()).toContain(
      staticContent.filterOpportunities.parentCategoriesLabel,
    )
    expect(filterPanel.text()).toContain(
      staticContent.filterOpportunities.salaryRange,
    )

    const remoteCheckbox = filterPanel.get('input[type="checkbox"][value="Remote"]')
    await remoteCheckbox.setValue(true)

    expect((remoteCheckbox.element as HTMLInputElement).checked).toBe(true)
  })

  it('searches all API filter fields with case-insensitive any-word matching', async () => {
    const firstListing = allRolesData[0]
    if (!firstListing) {
      throw new Error('Mock job listings must contain at least one listing.')
    }

    const location = filterOptions.location[0]
    const workMode = filterOptions.workMode[0]
    const roleType = filterOptions.roleType[0]
    const parentCategory = filterOptions.parentCategories[0]
    const salary = filterOptions.salaryRange.find(
      (option) => option !== 'Not Disclosed',
    )
    const category = filterOptions.categories.find((option) =>
      option.includes('-'),
    )
    if (
      !location ||
      !workMode ||
      !roleType ||
      !parentCategory ||
      !salary ||
      !category
    ) {
      throw new Error('Search options must include values for every filter field.')
    }

    const pinia = createPinia()
    useJobListingsStore(pinia).setJobListings([
      {
        ...firstListing,
        title: 'Unrelated title',
        companyName: 'Unrelated company',
        location,
        workMode,
        roleType,
        parentCategories: [parentCategory],
        categories: [category],
        minSalary: salary,
        maxSalary: salary,
      },
    ])
    useFilterOpportunitiesStore(pinia).setFilterOpportunities(filterOptions)
    const wrapper = mount(Home, {
      global: { plugins: [pinia] },
    })
    const searchInput = wrapper.get('input[type="search"]')

    for (const option of [location, workMode, roleType, parentCategory, salary]) {
      await searchInput.setValue(option.toUpperCase())
      expect(wrapper.findAll('article')).toHaveLength(1)
    }

    const queryWithSpecialCharacters = `missing ${category.toUpperCase()}!`
    await searchInput.setValue(queryWithSpecialCharacters)

    expect((searchInput.element as HTMLInputElement).value).toBe(
      queryWithSpecialCharacters.replace(/[^\p{L}\p{N}\s]/gu, ''),
    )
    expect(wrapper.findAll('article')).toHaveLength(1)
  })

  it('filters the current jobs by the selected role types', async () => {
    const firstListing = allRolesData[0]
    const firstRoleType = filterOptions.roleType[0]
    const secondRoleType = filterOptions.roleType[1]
    if (!firstListing || !firstRoleType || !secondRoleType) {
      throw new Error('Mock data must include at least two role types.')
    }

    const pinia = createPinia()
    useJobListingsStore(pinia).setJobListings([
      {
        ...firstListing,
        id: 501,
        title: 'Intern role',
        roleType: firstRoleType,
      },
      {
        ...firstListing,
        id: 502,
        title: 'Full-time role',
        roleType: secondRoleType,
      },
    ])
    useFilterOpportunitiesStore(pinia).setFilterOpportunities(filterOptions)
    const wrapper = mount(Home, {
      global: { plugins: [pinia] },
    })

    await wrapper.get(`input#filter-roleType-0`).setValue(true)
    expect(wrapper.findAll('article h2').map((heading) => heading.text())).toEqual([
      'Intern role',
    ])

    await wrapper.get(`input#filter-roleType-1`).setValue(true)
    expect(wrapper.findAll('article h2').map((heading) => heading.text())).toEqual([
      'Intern role',
      'Full-time role',
    ])

    await wrapper.get(`input#filter-roleType-0`).setValue(false)
    expect(wrapper.findAll('article h2').map((heading) => heading.text())).toEqual([
      'Full-time role',
    ])
  })

  it('combines selected filters against the currently loaded jobs', async () => {
    const firstListing = allRolesData[0]
    if (!firstListing) {
      throw new Error('Mock job listings must contain at least one listing.')
    }
    const lpaSalary = filterOptions.salaryRange.find((salary) =>
      salary.endsWith('LPA'),
    )
    const usdSalary = filterOptions.salaryRange.find((salary) =>
      salary.startsWith('USD '),
    )
    if (!lpaSalary || !usdSalary) {
      throw new Error('Filter options must include LPA and USD salaries.')
    }

    const listings: JobListing[] = [
      {
        ...firstListing,
        id: 901,
        title: 'Remote software role',
        location: 'Bangalore',
        workMode: 'Remote',
        minSalary: lpaSalary,
        maxSalary: '0.2 LPA',
        parentCategories: ['Developer'],
      },
      {
        ...firstListing,
        id: 902,
        title: 'On-site software role',
        location: 'Other',
        workMode: 'On-Site',
        minSalary: 'Not Disclosed',
        maxSalary: usdSalary,
        parentCategories: ['Developer'],
      },
      {
        ...firstListing,
        id: 903,
        title: 'Undisclosed salary role',
        location: 'Remote India',
        workMode: 'Hybrid',
        minSalary: 'Not Disclosed',
        maxSalary: 'Not Disclosed',
        parentCategories: ['Developer'],
      },
    ]
    const pinia = createPinia()
    useJobListingsStore(pinia).setJobListings(listings)
    useFilterOpportunitiesStore(pinia).setFilterOpportunities(filterOptions)
    const wrapper = mount(Home, {
      global: { plugins: [pinia] },
    })

    await wrapper.get('input[type="checkbox"][value="Remote"]').setValue(true)
    await wrapper.get('input[type="checkbox"][value="On-Site"]').setValue(true)
    await wrapper.get('input[type="checkbox"][value="Hybrid"]').setValue(true)
    await wrapper.get('input[type="checkbox"][value="Bangalore"]').setValue(true)
    await wrapper.get('input[type="checkbox"][value="Other"]').setValue(true)
    await wrapper.get('input[type="checkbox"][value="Remote India"]').setValue(true)
    await wrapper.get('input[type="checkbox"][value="Developer"]').setValue(true)
    const salaryIndex = (salary: string) =>
      filterOptions.salaryRange.indexOf(salary)
    await wrapper
      .get(`input#filter-salaryRange-${salaryIndex(lpaSalary)}`)
      .setValue(true)
    await wrapper
      .get(`input#filter-salaryRange-${salaryIndex(usdSalary)}`)
      .setValue(true)
    await wrapper
      .get(
        `input#filter-salaryRange-${salaryIndex('Not Disclosed')}`,
      )
      .setValue(true)

    expect(wrapper.findAll('article')).toHaveLength(3)

    await wrapper.get('input[type="checkbox"][value="Developer"]').setValue(false)
    await wrapper.get('input[type="checkbox"][value="Data Science"]').setValue(true)

    expect(wrapper.findAll('article')).toHaveLength(0)
    expect(wrapper.text()).toContain(
      staticContent.filterOpportunities.noResults.title,
    )
    expect(wrapper.text()).toContain(
      staticContent.filterOpportunities.noResults.suggestions,
    )
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

  it('sorts by salary after converting USD to LPA', async () => {
    const firstListing = allRolesData[0]
    if (!firstListing) {
      throw new Error('Mock job listings must contain at least one listing.')
    }

    vi.spyOn(axios, 'get').mockResolvedValue({
      data: { rates: { INR: 100 } },
    } as AxiosResponse<{ rates: { INR: number } }>)

    const listings: JobListing[] = [
      {
        ...firstListing,
        id: 901,
        title: '1 LPA role',
        minSalary: '1 LPA',
        maxSalary: '1 LPA',
        pubDate: 100,
      },
      {
        ...firstListing,
        id: 902,
        title: 'USD role',
        minSalary: 'Not Disclosed',
        maxSalary: 'USD 100',
        pubDate: 300,
      },
      {
        ...firstListing,
        id: 903,
        title: '2 LPA role',
        minSalary: '2 LPA',
        maxSalary: '2 LPA',
        pubDate: 200,
      },
      {
        ...firstListing,
        id: 904,
        title: 'Undisclosed role',
        minSalary: 'Not Disclosed',
        maxSalary: 'Not Disclosed',
        pubDate: 400,
      },
    ]
    const pinia = createPinia()
    useJobListingsStore(pinia).setJobListings(listings)
    const wrapper = mount(Home, {
      global: { plugins: [pinia] },
    })
    const sortSelector = wrapper.get('select#sort-by')
    const renderedTitles = () =>
      wrapper.findAll('article h2').map((heading) => heading.text())

    expect(renderedTitles()).toEqual([
      'Undisclosed role',
      'USD role',
      '2 LPA role',
      '1 LPA role',
    ])

    await sortSelector.setValue(2)
    await flushPromises()
    expect(axios.get).toHaveBeenCalledExactlyOnceWith(
      'https://api.frankfurter.dev/v1/latest?from=USD&to=INR',
      { timeout: 10_000 },
    )
    expect(renderedTitles()).toEqual([
      '2 LPA role',
      '1 LPA role',
      'USD role',
      'Undisclosed role',
    ])

    await sortSelector.setValue(3)
    expect(renderedTitles()).toEqual([
      'USD role',
      '1 LPA role',
      '2 LPA role',
      'Undisclosed role',
    ])
  })

  it('shows a retry option when the live exchange rate cannot be loaded', async () => {
    const firstListing = allRolesData[0]
    if (!firstListing) {
      throw new Error('Mock job listings must contain at least one listing.')
    }

    const request = vi
      .spyOn(axios, 'get')
      .mockRejectedValue(new Error('Network unavailable'))
    const pinia = createPinia()
    useJobListingsStore(pinia).setJobListings([firstListing])
    const wrapper = mount(Home, {
      global: { plugins: [pinia] },
    })

    await wrapper.get('select#sort-by').setValue(2)
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain(
      'The live USD to INR exchange rate is unavailable.',
    )

    await wrapper.get('[role="alert"] button').trigger('click')
    await flushPromises()
    expect(request).toHaveBeenCalledTimes(2)
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

  it('requests and renders the selected API page', async () => {
    vi.stubEnv('VITE_USE_MOCK', 'false')
    const firstListing = allRolesData[0]
    if (!firstListing) {
      throw new Error('Mock job listings must contain at least one listing.')
    }

    const listings: JobListing[] = Array.from({ length: 300 }, (_, index) => ({
      ...firstListing,
      id: index + 1,
      title: `Role ${index + 1}`,
    }))
    const pageFiveListings = listings.slice(80, 100)
    const response: AxiosResponse<JobListingsPage> = {
      data: {
        jobs: pageFiveListings,
        page: 5,
        pageSize: 20,
        totalJobs: 300,
        totalPages: 15,
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: {} as AxiosResponse<JobListingsPage>['config']['headers'],
      },
    }
    const request = vi.spyOn(axios, 'get').mockResolvedValue(response)
    const pinia = createPinia()
    useJobListingsStore(pinia).setJobListings(listings.slice(0, 20), 15)
    const wrapper = mount(Home, {
      global: { plugins: [pinia] },
    })
    const pagination = wrapper.get(
      `nav[aria-label="${staticContent.pagination.navigationLabel}"]`,
    )

    expect(pagination.findAll('button')).toHaveLength(17)

    await pagination.get('button[aria-label="Go to page 5"]').trigger('click')
    await flushPromises()

    expect(request).toHaveBeenCalledExactlyOnceWith(
      'http://api.test/fresherFriend/jobs-listing?page=5',
    )
    expect(wrapper.findAll('article')).toHaveLength(20)
    expect(wrapper.get('article h2').text()).toBe('Role 81')
    expect(wrapper.get('[aria-current="page"]').text()).toBe('5')
  })
})
