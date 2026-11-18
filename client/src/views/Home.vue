<script setup lang="ts">
import { ref } from 'vue'
import SearchInput from '../components/SearchInput.vue'
import SortSelector from '../components/SortSelector.vue'
import staticContent from '../mocks/getStaticContent.json'

defineOptions({
  name: 'HomePage',
})

const searchQuery = ref('')
const initialSortOption = staticContent.sortBy.options[0]

if (!initialSortOption) {
  throw new Error('At least one sort option is required.')
}

const selectedSortOption = ref(initialSortOption.id)
</script>

<template>
  <section class="w-full bg-[#FAFAFA] px-4 py-10 text-left text-[#111111] sm:px-6 sm:py-14">
    <div class="mx-auto max-w-7xl">
      <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
        {{ staticContent.allRoles.heading }}
      </h1>
      <p class="mt-3 max-w-3xl text-base leading-7 text-[#52525B]">
        {{ staticContent.allRoles.description }}
      </p>

      <div class="mt-8 flex flex-col gap-4 md:flex-row md:items-center">
        <SearchInput v-model="searchQuery" class="min-w-0 flex-1" />
        <SortSelector v-model="selectedSortOption" />
      </div>
    </div>
  </section>
</template>
