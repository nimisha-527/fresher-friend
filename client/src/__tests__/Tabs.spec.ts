import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import Tabs from '../components/Tabs.vue'
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
  it('renders the requested navigation and initial saved roles count', async () => {
    const router = createTestRouter()
    await router.push(routePaths.home)
    await router.isReady()
    const wrapper = mount(Tabs, {
      global: { plugins: [router, createPinia()] },
    })

    expect(wrapper.text()).toContain('fresherFriend')
    expect(wrapper.text()).toContain('All Roles')
    expect(wrapper.text()).toContain('Internships')
    expect(wrapper.text()).toContain('Fresher Jobs')
    expect(wrapper.text()).toContain('My Applications')
    expect(wrapper.text()).toContain('Saved Roles')
    expect(wrapper.text()).toContain('0')
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('links to home and the saved jobs page without creating either page', async () => {
    const router = createTestRouter()
    await router.push(routePaths.home)
    await router.isReady()
    const wrapper = mount(Tabs, {
      global: { plugins: [router, createPinia()] },
    })

    expect(wrapper.get(`a[href="${routePaths.home}"]`).attributes('href')).toBe(routePaths.home)
    expect(wrapper.get(`a[href="${routePaths.savedJobs}"]`).attributes('href')).toBe(
      routePaths.savedJobs,
    )
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
    useSavedRolesStore(pinia).toggleSavedRole(1)
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
