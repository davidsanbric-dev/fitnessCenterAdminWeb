<template>
  <CrudResourceCrudPage :config="resourceConfig" />
</template>

<script setup lang="ts">
import { adminCrudResources } from '~/config/adminCrudResources'

const resourceConfig = adminCrudResources.disciplines!
</script>
