import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { JobListing } from '../types/jobListing'

export const useSavedRolesStore = defineStore('savedRoles', () => {
  const savedRoles = ref<JobListing[]>([])
  const savedRoleIds = computed(() => savedRoles.value.map((role) => role.id))
  const savedRoleCount = computed(() => savedRoles.value.length)

  function isSaved(roleId: number) {
    return savedRoleIds.value.includes(roleId)
  }

  function toggleSavedRole(role: JobListing) {
    if (isSaved(role.id)) {
      savedRoles.value = savedRoles.value.filter(
        (savedRole) => savedRole.id !== role.id,
      )
      return
    }

    savedRoles.value.push(role)
  }

  return {
    savedRoles,
    savedRoleIds,
    savedRoleCount,
    isSaved,
    toggleSavedRole,
  }
})
