import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useSavedRolesStore = defineStore('savedRoles', () => {
  const savedRoleIds = ref<number[]>([])
  const savedRoleCount = computed(() => savedRoleIds.value.length)

  function isSaved(roleId: number) {
    return savedRoleIds.value.includes(roleId)
  }

  function toggleSavedRole(roleId: number) {
    if (isSaved(roleId)) {
      savedRoleIds.value = savedRoleIds.value.filter((id) => id !== roleId)
      return
    }

    savedRoleIds.value.push(roleId)
  }

  return { savedRoleIds, savedRoleCount, isSaved, toggleSavedRole }
})
