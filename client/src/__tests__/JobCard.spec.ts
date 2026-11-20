import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import JobCard from '../components/JobCard.vue'
import allRolesData from '../mocks/allRolesData.json'
import staticContent from '../mocks/getStaticContent.json'

describe('JobCard', () => {
  it('renders job details and formats the expiry timestamp in IST', () => {
    const job = {
      ...allRolesData[0]!,
      workMode: 'On-Site',
      expiryDate: 1800147907,
    }
    const wrapper = mount(JobCard, {
      props: {
        job,
        saved: false,
      },
    })

    expect(wrapper.text()).toContain('RMgX')
    expect(wrapper.text()).toContain('Internship')
    expect(wrapper.text()).toContain('Intern – Java')
    expect(wrapper.text()).toContain('On-Site')
    expect(wrapper.text()).toContain('₹0.2 LPA monthly – ₹0.3 LPA monthly')
    expect(wrapper.text()).toContain('Apply before: 17 Jan 2027')
    expect(wrapper.text()).toContain('Spring Boot')
  })

  it('hides undisclosed salary and disables apply when no link is available', () => {
    const job = allRolesData.find((role) => role.minSalary === 'Not Disclosed')!
    const wrapper = mount(JobCard, {
      props: {
        job: { ...job, applicationLink: '' },
        saved: false,
      },
    })

    expect(wrapper.text()).not.toContain('₹')
    expect(wrapper.find('button:disabled').exists()).toBe(true)
    expect(wrapper.text()).toContain(staticContent.card.applyButtonLabel)
  })

  it('shows only max salary when the salary range endpoints match', () => {
    const job = allRolesData.find(
      (role) =>
        role.minSalary !== 'Not Disclosed' && role.minSalary === role.maxSalary,
    )!
    const wrapper = mount(JobCard, {
      props: {
        job,
        saved: false,
      },
    })

    expect(wrapper.text()).toContain(`₹${job.maxSalary} ${job.salaryPeriod}`)
    expect(wrapper.text()).not.toContain(`₹${job.minSalary} ${job.salaryPeriod} –`)
  })
})
