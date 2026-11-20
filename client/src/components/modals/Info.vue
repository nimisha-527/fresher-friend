<template>
  <div class="fixed inset-0 z-[1000] grid place-items-center bg-black/45 p-6">
    <section
      class="w-full max-w-md rounded-lg border-t-4 border-[#FACC15] bg-white p-6 text-center text-[#111111] shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-modal-message"
    >
      <p id="info-modal-message" class="leading-6">
        <span class="font-bold text-[#854D0E]">Thank you for your patience!</span> <br /> <br />We are currently fetching the initial content from the API. This may take a few moments, so please bear with us. Your experience is important to us, and we appreciate your understanding as we ensure everything is set up correctly.
      </p>
    </section>
  </div>
</template>

<script lang="ts" setup>
 defineOptions({
   name: 'InfoModal'
 })
</script>
