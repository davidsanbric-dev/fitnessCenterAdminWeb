<template>
  <CrudResourceCrudPage :config="resourceConfig" />
</template>

<script setup lang="ts">
import { adminCrudResources } from '~/config/crudResources'

const resourceConfig = adminCrudResources.disciplines!
</script>
