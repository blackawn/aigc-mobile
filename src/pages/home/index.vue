<script setup lang="ts">

import api from '@/api'
import { onMounted } from 'vue'

onMounted(async () => {
  const res = await api.config.getConfig()
  console.log(res.data)

})

</script>
<template>
  <div />
</template>
<style></style>
