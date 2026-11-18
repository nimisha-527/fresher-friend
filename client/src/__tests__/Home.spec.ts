import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Home from '../views/Home.vue'
import staticContent from '../mocks/getStaticContent.json'

describe('Home', () => {
  it('renders the All Roles heading, description, search input, and sort options', () => {
    const wrapper = mount(Home)

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
})
