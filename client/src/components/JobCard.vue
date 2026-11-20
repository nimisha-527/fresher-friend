<script setup lang="ts">
import { computed, ref } from 'vue'
import { Bookmark, MapPin } from '@lucide/vue'
import staticContent from '../mocks/getStaticContent.json'
import type { JobListing } from '../types/jobListing'

defineOptions({
  name: 'JobCard',
})

const props = defineProps<{
  job: JobListing
  saved: boolean
}>()

const emit = defineEmits<{
  toggleSaved: [jobId: JobListing['id']]
}>()

const imageFailed = ref(false)

const salary = computed(() => {
  const { minSalary, maxSalary, salaryPeriod } = props.job
  if (
    !minSalary ||
    !maxSalary ||
    !salaryPeriod ||
    minSalary === 'Not Disclosed' ||
    maxSalary === 'Not Disclosed'
  ) {
    return null
  }

  if (minSalary === maxSalary) {
    return `₹${maxSalary} ${salaryPeriod}`
  }

  return `₹${minSalary} ${salaryPeriod} – ₹${maxSalary} ${salaryPeriod}`
})

const formattedExpiryDate = computed(() => {
  const timestamp = props.job.expiryDate
  if (typeof timestamp !== 'number' || !Number.isFinite(timestamp)) {
    return null
  }

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(timestamp * 1000))
})

const applyBeforeLabel = computed(() => {
  if (!formattedExpiryDate.value) {
    return null
  }

  return staticContent.card.applyBeforeLabel.replace(
    '{{date}}',
    formattedExpiryDate.value,
  )
})

const applicationLink = computed(() => props.job.applicationLink.trim())
</script>

<template>
  <article
    class="flex h-full flex-col rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
  >
    <header class="flex min-w-0 items-center gap-3">
      <img
        v-if="job.companyLogo && !imageFailed"
        :src="job.companyLogo"
        :alt="
          staticContent.card.companyLogoAltLabel.replace(
            '{{company}}',
            job.companyName,
          )
        "
        class="size-12 shrink-0 rounded-xl border border-[#E5E7EB] bg-white object-contain p-1"
        loading="lazy"
        @error="imageFailed = true"
      />
      <div
        v-else
        aria-hidden="true"
        class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#FEF9C3] text-lg font-bold text-[#111111]"
      >
        {{ job.companyName.slice(0, 1).toUpperCase() }}
      </div>

      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-semibold text-[#111111]">
          {{ job.companyName }}
        </p>
        <span
          class="mt-1 inline-flex rounded-full bg-[#F4F4F5] px-2.5 py-1 text-xs font-medium text-[#52525B]"
        >
          {{ job.roleType }}
        </span>
      </div>

      <button
        type="button"
        :aria-label="
          saved
            ? staticContent.card.removeSavedRoleLabel
            : staticContent.card.saveRoleLabel
        "
        :aria-pressed="saved"
        :class="[
          'inline-flex size-10 shrink-0 items-center justify-center rounded-lg border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FACC15]',
          saved
            ? 'border-[#FACC15] bg-[#FACC15] text-[#111111]'
            : 'border-[#E5E7EB] bg-white text-[#52525B] hover:bg-[#FEF9C3] hover:text-[#111111]',
        ]"
        @click="emit('toggleSaved', job.id)"
      >
        <Bookmark :size="19" :fill="saved ? 'currentColor' : 'none'" aria-hidden="true" />
      </button>
    </header>

    <div class="mt-5 flex-1">
      <h2 class="text-lg font-semibold leading-6 text-[#111111]">
        {{ job.title }}
      </h2>
      <div class="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-[#52525B]">
        <span class="inline-flex items-center gap-1.5">
          <MapPin :size="16" aria-hidden="true" />
          {{ job.location }}
        </span>
        <span aria-hidden="true">·</span>
        <span>{{ job.workMode }}</span>
        <template v-if="salary">
          <span aria-hidden="true">·</span>
          <span>{{ salary }}</span>
        </template>
      </div>

      <ul
        v-if="job.skills.length"
        class="mt-4 flex flex-wrap gap-2"
        :aria-label="staticContent.card.skillsLabel"
      >
        <li
          v-for="skill in job.skills"
          :key="skill"
          class="rounded-full bg-[#F4F4F5] px-3 py-1.5 text-xs font-medium text-[#3F3F46]"
        >
          {{ skill }}
        </li>
      </ul>
    </div>

    <footer
      class="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E7EB] pt-4"
    >
      <p v-if="applyBeforeLabel" class="text-sm text-[#52525B]">
        {{ applyBeforeLabel }}
      </p>
      <a
        v-if="applicationLink"
        :href="applicationLink"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center justify-center rounded-lg bg-[#FACC15] px-4 py-2.5 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#EAB308] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111]"
      >
        {{ staticContent.card.applyButtonLabel }}
      </a>
      <button
        v-else
        type="button"
        disabled
        class="inline-flex cursor-not-allowed items-center justify-center rounded-lg bg-[#FACC15] px-4 py-2.5 text-sm font-semibold text-[#111111] opacity-50"
      >
        {{ staticContent.card.applyButtonLabel }}
      </button>
    </footer>
  </article>
</template>
