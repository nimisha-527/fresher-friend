import axios from 'axios'
import { storeToRefs } from 'pinia'
import { useApiHandling } from '../stores/apiHandling'
import { getApiErrorMessage } from '../utils/apiError'

export const useInitialContent = () => {
  const apiStore = useApiHandling()
  const { apiLoadFn, apiSuccessFn, apiErrorFn } = apiStore
  const { loading, apiError, data } = storeToRefs(apiStore)
  const serverURL = import.meta.env.VITE_BACKEND_URL

  const getInitialContent = async () => {
    apiLoadFn()

    try {
      const response = await axios.get(`${serverURL}/initial-content`)
      apiSuccessFn(response.data)
    } catch (error) {
      console.error('Failed to fetch initial content:', error)
      apiErrorFn(getApiErrorMessage(error))
    }
  }

  return {
    getInitialContent,
    loading,
    apiError,
    data,
  }
}
