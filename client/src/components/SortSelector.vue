<script setup lang="ts">
import staticContent from '../mocks/getStaticContent.json'

defineOptions({
  name: 'SortSelector',
})

const selectedSortOption = defineModel<number>({ required: true })
</script>

<template>
  <div class="flex shrink-0 items-center gap-3">
    <label for="sort-by" class="whitespace-nowrap text-sm font-medium text-[#52525B]">
      {{ staticContent.sortBy.label }}
    </label>
    <select
      id="sort-by"
      v-model="selectedSortOption"
      class="min-w-44 rounded-lg border border-[#E5E7EB] bg-white px-3 py-3 text-sm font-medium text-[#111111] outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/30"
    >
      <option
        v-for="option in staticContent.sortBy.options"
        :key="option.id"
        :value="option.id"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>
