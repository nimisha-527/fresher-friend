import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import Tabs from '../components/Tabs.vue'
import allRolesData from '../mocks/allRolesData.json'
import staticContent from '../mocks/getStaticContent.json'
import { routePaths } from '../router/paths'
import { useSavedRolesStore } from '../stores/savedRoles'

const testRoutes = [
  ...Object.values(routePaths),
].map((path) => ({
  path,
  component: { template: '<div />' },
}))

const createTestRouter = () =>
  createRouter({
    history: createMemoryHistory(),
    routes: testRoutes,
  })

describe('Tabs', () => {
  it('renders the home brand link and Saved Roles link without tabs', async () => {
    const router = createTestRouter()
    await router.push(routePaths.home)
    await router.isReady()
    const wrapper = mount(Tabs, {
      global: { plugins: [router, createPinia()] },
    })

    expect(wrapper.text()).toContain(staticContent.fresherFriendLabel)
    expect(wrapper.text()).not.toContain('All Roles')
    expect(wrapper.text()).not.toContain('Internships')
    expect(wrapper.text()).not.toContain('Fresher Jobs')
    expect(wrapper.text()).not.toContain('My Applications')
    expect(wrapper.text()).toContain(staticContent.savedRolesData.savedRolesLabel)
    expect(wrapper.text()).toContain('0')
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.find('nav').exists()).toBe(false)
    expect(wrapper.findAll('a')).toHaveLength(2)
  })

  it('keeps the home brand link on the left and Saved Roles on the right', async () => {
    const router = createTestRouter()
    await router.push(routePaths.home)
    await router.isReady()
    const wrapper = mount(Tabs, {
      global: { plugins: [router, createPinia()] },
    })

    const header = wrapper.get('header')
    const homeLink = wrapper.get(`a[href="${routePaths.home}"]`)
    const savedRolesLink = wrapper.get(`a[href="${routePaths.savedJobs}"]`)
    expect(homeLink.text()).toBe(staticContent.fresherFriendLabel)
    expect(header.element.firstElementChild).toBe(homeLink.element)
    expect(header.element.lastElementChild).toBe(savedRolesLink.element)
  })

  it('uses the primary color and contrasting text when the saved jobs route is active', async () => {
    const router = createTestRouter()
    await router.push(routePaths.home)
    await router.isReady()
    const wrapper = mount(Tabs, {
      global: { plugins: [router, createPinia()] },
    })
    const savedRolesLink = wrapper.get(`a[href="${routePaths.savedJobs}"]`)

    expect(savedRolesLink.classes()).toContain('bg-[#111111]')
    await savedRolesLink.trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe(routePaths.savedJobs)
    expect(savedRolesLink.classes()).toContain('bg-[#FACC15]')
    expect(savedRolesLink.classes()).toContain('text-[#111111]')
    expect(savedRolesLink.attributes('aria-current')).toBe('page')
    expect(savedRolesLink.get('span:last-child').classes()).toContain('bg-[#111111]')
    expect(savedRolesLink.get('span:last-child').classes()).toContain('text-white')
  })

  it('displays the current saved roles count', async () => {
    const router = createTestRouter()
    const pinia = createPinia()
    const firstJob = allRolesData[0]
    if (!firstJob) {
      throw new Error('Mock job listings must contain at least one listing.')
    }
    useSavedRolesStore(pinia).toggleSavedRole(firstJob)
    await router.push(routePaths.home)
    await router.isReady()
    const wrapper = mount(Tabs, {
      global: { plugins: [router, pinia] },
    })

    expect(wrapper.get(`a[href="${routePaths.savedJobs}"]`).get('span:last-child').text()).toBe(
      '1',
    )
  })
})
