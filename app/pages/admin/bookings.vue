<template>
  <CrudResourceCrudPage :config="resourceConfig" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { adminCrudResources } from '~/config/adminCrudResources'
import { useAuth } from '~/composables/useAuth'

const auth = useAuth()

// Trainers see a read-only, self-scoped bookings view; staff get the full admin
// bookings module with status actions.
const resourceConfig = computed(() =>
  auth.isTrainer.value && !auth.isAdmin.value
    ? adminCrudResources.trainerBookings!
    : adminCrudResources.bookings!,
)
</script>
