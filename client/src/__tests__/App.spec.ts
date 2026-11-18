import axios, { type AxiosResponse } from 'axios'
import { createPinia } from 'pinia'
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('shows the info modal while initial content is loading', () => {
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
  })
})
