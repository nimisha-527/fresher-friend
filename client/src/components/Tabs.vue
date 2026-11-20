<script setup lang="ts">
import { Bookmark } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { RouterLink, useRoute } from 'vue-router'
import staticContent from '../mocks/getStaticContent.json'
import { routePaths } from '../router/paths'
import { useSavedRolesStore } from '../stores/savedRoles'

defineOptions({
  name: 'TabsNavigation',
})

const tabRoutes: Record<string, string> = {
  'All Roles': routePaths.home,
  Internships: routePaths.internships,
  'Fresher Jobs': routePaths.fresherJobs,
  'My Applications': routePaths.myApplications,
}

const tabs = staticContent.tabs.map((tab) => {
  const to = tabRoutes[tab.label]
  if (!to) {
    throw new Error(`Missing route for tab "${tab.label}".`)
  }

  return { ...tab, to }
})

const route = useRoute()
const savedRoles = useSavedRolesStore()
const { savedRoleCount: savedRolesCount } = storeToRefs(savedRoles)
</script>

<template>
  <header
    class="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-[#E5E7EB] bg-white px-6 py-4 text-[#111111] max-md:grid-cols-[1fr_auto]"
  >
    <RouterLink
      :to="routePaths.home"
      class="justify-self-start whitespace-nowrap text-xl font-bold tracking-tight hover:text-[#EAB308] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FACC15]"
    >
      {{ staticContent.fresherFriendLabel }}
    </RouterLink>

    <nav
      aria-label="Main navigation"
      class="flex items-center justify-center gap-1 max-md:col-span-2 max-md:row-start-2 max-md:justify-start max-md:overflow-x-auto"
    >
      <RouterLink
        v-for="tab in tabs"
        :key="tab.id"
        :to="tab.to"
        :class="[
          'whitespace-nowrap rounded-t-md border-b-2 px-3 py-2 text-sm font-medium transition-colors hover:text-[#111111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FACC15]',
          route.path === tab.to
            ? 'border-[#FACC15] bg-[#FEF9C3] text-[#111111]'
            : 'border-transparent text-[#52525B]',
        ]"
      >
        {{ tab.label }}
      </RouterLink>
    </nav>

    <RouterLink
      :to="routePaths.savedJobs"
      :aria-current="route.path === routePaths.savedJobs ? 'page' : undefined"
      :class="[
        'inline-flex items-center justify-self-end gap-2 whitespace-nowrap rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
        route.path === routePaths.savedJobs
          ? 'border-[#FACC15] bg-[#FACC15] text-[#111111] hover:bg-[#EAB308] focus-visible:outline-[#111111]'
          : 'border-[#111111] bg-[#111111] text-[#FAFAFA] hover:bg-[#52525B] focus-visible:outline-[#FACC15]',
      ]"
    >
      <Bookmark :size="18" aria-hidden="true" />
      <span>{{ staticContent.savedRolesData.savedRolesLabel }}</span>
      <span
        :class="
          route.path === routePaths.savedJobs
            ? 'rounded-full bg-[#111111] px-2 py-0.5 text-xs font-bold text-white'
            : 'rounded-full bg-[#FACC15] px-2 py-0.5 text-xs font-bold text-[#111111]'
        "
      >
        {{ savedRolesCount }}
      </span>
    </RouterLink>
  </header>
</template>
