import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useApiHandling = defineStore('apiHandling', () => {
  const loading = ref(false)
  const apiError = ref<string | null>(null)
  const data = ref<any>(null)

  function apiLoadFn() {
    loading.value = true
    apiError.value = null
  }

  function apiErrorFn(message?: string) {
    loading.value = false
    apiError.value = message ?? 'Something went wrong'
  }

  function apiSuccessFn(payload: any) {
    loading.value = false
    data.value = payload
    apiError.value = null
  }

  return {
    loading,
    apiError,
    data,
    apiLoadFn,
    apiErrorFn,
    apiSuccessFn
  }
})