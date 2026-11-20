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

const route = useRoute()
const savedRoles = useSavedRolesStore()
const { savedRoleCount: savedRolesCount } = storeToRefs(savedRoles)
</script>

<template>
  <header
    class="flex w-full items-center justify-between gap-4 border-b border-[#E5E7EB] bg-white px-6 py-4 text-[#111111]"
  >
    <RouterLink
      :to="routePaths.home"
      class="whitespace-nowrap text-xl font-bold tracking-tight hover:text-[#EAB308] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FACC15]"
    >
      {{ staticContent.fresherFriendLabel }}
    </RouterLink>

    <RouterLink
      :to="routePaths.savedJobs"
      :aria-current="route.path === routePaths.savedJobs ? 'page' : undefined"
      :class="[
        'inline-flex items-center gap-2 whitespace-nowrap rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
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
