<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import JobCard from '../components/JobCard.vue'
import staticContent from '../mocks/getStaticContent.json'
import { routePaths } from '../router/paths'
import { useSavedRolesStore } from '../stores/savedRoles'

defineOptions({
  name: 'SavedRolesPage',
})

const savedRolesStore = useSavedRolesStore()
const { savedRoles } = storeToRefs(savedRolesStore)
const savedRolesMessage = computed(() =>
  staticContent.savedRolesData.savedRolesMessage.replace(
    '{{ savedRoles.length }}',
    String(savedRoles.value.length),
  ),
)
</script>

<template>
  <section class="w-full bg-[#FAFAFA] px-4 py-10 text-left text-[#111111] sm:px-6 sm:py-14">
    <div class="mx-auto max-w-7xl">
      <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
        {{ staticContent.savedRolesData.savedRolesLabel }}
      </h1>

      <div
        v-if="savedRoles.length"
        class="mt-8"
        aria-label="Saved roles"
      >
        <p class="mb-5 text-sm text-[#52525B]">{{ savedRolesMessage }}</p>
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <JobCard
            v-for="job in savedRoles"
            :key="job.id"
            :job="job"
            :saved="true"
            @toggle-saved="savedRolesStore.toggleSavedRole"
          />
        </div>
      </div>

      <div
        v-else
        class="mt-8 rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center shadow-sm sm:p-12"
        role="status"
      >
        <h2 class="text-xl font-semibold text-[#111111]">
          {{ staticContent.savedRolesData.noSavedRolesLabel }}
        </h2>
        <p class="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#52525B]">
          {{ staticContent.savedRolesData.noSavedRolesDescription }}
        </p>
        <RouterLink
          :to="routePaths.home"
          class="mt-6 inline-flex items-center justify-center rounded-lg bg-[#FACC15] px-5 py-3 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#EAB308] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111]"
        >
          {{ staticContent.savedRolesData.noSavedRolesButtonLabel }}
        </RouterLink>
      </div>
    </div>
  </section>
</template>
