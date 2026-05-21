<template>
  <CrudResourceCrudPage :config="resourceConfig" />
</template>

<script setup lang="ts">
import { adminCrudResources } from '~/app/config/adminCrudResources'

const resourceConfig = adminCrudResources.notifications!
</script>
