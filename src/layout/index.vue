<script setup lang="ts">
import Main from './main/index.vue'
import Api from '@/api'
import { storeConfig } from '@/store/config'
import { onMounted } from 'vue'

const configStore = storeConfig()

const getConfigList = async () => {
  const res = await Api.config.getConfig()
  configStore.modifyConfigList(res.data.list)
}

onMounted(() => {
  getConfigList()
})

</script>
<template>
  <div class="flex h-screen w-screen flex-col overflow-hidden">
    <Main />
  </div>
</template>
<style></style>
