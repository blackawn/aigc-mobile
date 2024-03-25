<script setup lang="ts">
import { onMounted } from 'vue'
import Main from './main/index.vue'
import Api from '@/api'
import { storeConfig } from '@/store/config'
import { setToastDefaultOptions } from 'vant'

const configStore = storeConfig()

const getConfigList = async () => {
  const res = await Api.config.getConfig()
  configStore.modifyConfigList(res.data.list)
}

setToastDefaultOptions({ 
  className: 'custom'
})

onMounted(() => {
  getConfigList()
})

</script>
<template>
  <div class="flex h-dvh flex-col overflow-hidden">
    <Main />
  </div>
</template>
<style></style>
