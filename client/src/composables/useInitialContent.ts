import axios from "axios";
import { storeToRefs } from 'pinia';
import { useApiHandling } from '../stores/apiHandling';

export const useInitialContent = () => {
  const apiStore = useApiHandling();
  const { apiLoadFn, apiSuccessFn, apiErrorFn } = apiStore;
  const { loading, apiError, data } = storeToRefs(apiStore);
  const serverURL = import.meta.env.VITE_BACKEND_URL;

  const getInitialContent = async () => {
    apiLoadFn();

    try {
      const response = await axios.get(`${serverURL}/initial-content`);
      apiSuccessFn(response.data);
    } catch (error) {
      console.error("Failed to fetch initial content:", error);
      apiErrorFn(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return {
    getInitialContent,
    loading,
    apiError,
    data
  };
};