<template>
  <div
    class="fixed inset-0 z-[1000] grid place-items-center bg-black/45 p-6"
    @keydown.esc="$emit('close')"
  >
    <section
      class="relative w-full max-w-md rounded-lg border-t-4 border-[#DC2626] bg-white p-6 text-center text-[#111111] shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="error-modal-title"
      aria-describedby="error-modal-message"
    >
      <button
        type="button"
        class="absolute right-3 top-3 grid size-8 place-items-center rounded-full text-2xl leading-none text-[#52525B] transition hover:bg-[#F3F4F6] hover:text-[#111111]"
        aria-label="Close error"
        @click="$emit('close')"
      >
        <span aria-hidden="true">&times;</span>
      </button>

      <div
        class="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-[#FEE2E2] text-2xl font-bold text-[#B91C1C]"
        aria-hidden="true"
      >
        !
      </div>

      <h2 id="error-modal-title" class="text-xl font-bold">
        {{ title }}
      </h2>
      <p id="error-modal-message" class="mt-3 leading-6 text-[#52525B]">
        {{ message || staticContent.error.description }}
      </p>

      <button
        v-if="showRetry"
        type="button"
        class="mt-5 rounded-md bg-[#DC2626] px-5 py-2.5 font-semibold text-white transition hover:bg-[#B91C1C] focus:outline-none focus:ring-2 focus:ring-[#F87171] focus:ring-offset-2"
        @click="$emit('retry')"
      >
        {{ staticContent.error.retryButtonLabel }}
      </button>
    </section>
  </div>
</template>

<script lang="ts" setup>
import staticContent from '../../mocks/getStaticContent.json'

defineOptions({
  name: 'ErrorModal',
})

withDefaults(
  defineProps<{
    message?: string | null
    showRetry?: boolean
    title?: string
  }>(),
  {
    showRetry: true,
    title: staticContent.error.title,
  },
)

defineEmits<{
  close: []
  retry: []
}>()
</script>