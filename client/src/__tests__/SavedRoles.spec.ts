import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it } from 'vitest'
import Portal from '../components/Portal.vue'
import allRolesData from '../mocks/allRolesData.json'
import staticContent from '../mocks/getStaticContent.json'
import { routePaths } from '../router/paths'
import { useSavedRolesStore } from '../stores/savedRoles'

const createTestRouter = () =>
  createRouter({
    history: createMemoryHistory(),
    routes: Object.values(routePaths).map((path) => ({
      path,
      component: path === routePaths.savedJobs ? Portal : { template: '<div />' },
    })),
  })

describe('SavedRoles page', () => {
  it('shows the saved job card and removes a role when it is unbookmarked', async () => {
    const job = allRolesData[0]
    if (!job) {
      throw new Error('Mock job listings must contain at least one listing.')
    }

    const pinia = createPinia()
    const savedRoles = useSavedRolesStore(pinia)
    savedRoles.toggleSavedRole(job)
    const router = createTestRouter()
    await router.push(routePaths.savedJobs)
    await router.isReady()
    const wrapper = mount(Portal, {
      global: { plugins: [pinia, router] },
    })

    const card = wrapper.get('article')
    expect(card.text()).toContain(job.title)
    expect(card.text()).toContain(job.companyName)
    expect(card.text()).toContain(job.roleType)
    expect(
      card.get('button[aria-label="Remove saved role"]').attributes('aria-pressed'),
    ).toBe('true')
    expect(wrapper.text()).toContain('Showing 1 saved roles')

    await card.get('button[aria-label="Remove saved role"]').trigger('click')

    expect(savedRoles.savedRoleCount).toBe(0)
    expect(wrapper.get('[role="status"]').text()).toContain(
      staticContent.savedRolesData.noSavedRolesLabel,
    )
  })

  it('shows the empty panel and explores roles back to the home page', async () => {
    const router = createTestRouter()
    await router.push(routePaths.savedJobs)
    await router.isReady()
    const wrapper = mount(Portal, {
      global: { plugins: [createPinia(), router] },
    })

    const emptyPanel = wrapper.get('[role="status"]')
    expect(emptyPanel.text()).toContain(
      staticContent.savedRolesData.noSavedRolesLabel,
    )
    expect(emptyPanel.text()).toContain(
      staticContent.savedRolesData.noSavedRolesDescription,
    )
    const exploreRolesLink = wrapper
      .findAll('a')
      .find(
        (link) =>
          link.text().trim() ===
          staticContent.savedRolesData.noSavedRolesButtonLabel,
      )
    if (!exploreRolesLink) {
      throw new Error('Saved roles empty state must include an Explore Roles link.')
    }

    await exploreRolesLink.trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe(routePaths.home)
    expect(wrapper.text()).toContain(staticContent.allRoles.heading)
  })
})
