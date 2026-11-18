<script setup lang="ts">
import { Search } from '@lucide/vue'
import staticContent from '../mocks/getStaticContent.json'

defineOptions({
  name: 'SearchInput',
})

const searchQuery = defineModel<string>({ required: true })
</script>

<template>
  <div class="relative w-full">
    <Search
      :size="20"
      aria-hidden="true"
      class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#52525B]"
    />
    <input
      v-model="searchQuery"
      type="search"
      :aria-label="staticContent.searchPlaceholder"
      :placeholder="staticContent.searchPlaceholder"
      class="w-full rounded-lg border border-[#E5E7EB] bg-white py-3 pl-12 pr-4 text-[#111111] outline-none transition focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/30"
    />
  </div>
</template>
