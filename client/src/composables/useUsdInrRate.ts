import axios from 'axios'
import { ref } from 'vue'

interface ExchangeRateResponse {
  rates?: {
    INR?: number
  }
}

const exchangeRateUrl = 'https://api.frankfurter.dev/v1/latest?from=USD&to=INR'

export function useUsdInrRate() {
  const inrPerUsd = ref<number | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function getUsdInrRate() {
    if (loading.value || inrPerUsd.value !== null) {
      return
    }

    loading.value = true
    error.value = null

    try {
      const response = await axios.get<ExchangeRateResponse>(exchangeRateUrl, {
        timeout: 10_000,
      })
      const rate = response.data?.rates?.INR
      if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) {
        throw new Error('Exchange-rate API returned an invalid USD to INR rate.')
      }

      inrPerUsd.value = rate
    } catch (requestError) {
      console.error('Failed to fetch the USD to INR exchange rate:', requestError)
      error.value =
        'The live USD to INR exchange rate is unavailable. Salary sorting is paused; jobs remain in their current order.'
    } finally {
      loading.value = false
    }
  }

  return {
    inrPerUsd,
    loading,
    error,
    getUsdInrRate,
  }
}
