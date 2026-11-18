<script setup lang="ts">
import { useRoute } from 'vue-router'
import Home from '../views/Home.vue'
import Tabs from './Tabs.vue'
import { routePaths } from '../router/paths'

defineOptions({
  name: 'PortalDisplay',
})

const route = useRoute()
</script>

<template>
  <div class="min-h-screen bg-[#FAFAFA]">
    <Tabs />
    <Home v-if="route.path === routePaths.home" />
  </div>
</template>