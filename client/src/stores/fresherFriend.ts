import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useFresherFriendStore = defineStore('fresherFriend', () => {
  const posts = ref(0)
  function increment() {
    posts.value++
  }

  return { posts, increment }
})
