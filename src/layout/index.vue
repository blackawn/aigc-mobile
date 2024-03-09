<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import Header from './header/index.vue'
import Main from './main/index.vue'
import { onMounted } from 'vue'

const route = useRoute()

const showHeader = ref(true)

watch(() => route.name, (n, o) => {
  const routeName = n as string
  showHeader.value = !['mine'].includes(routeName)
}, { immediate: true })

</script>
<template>
  <div class="flex h-screen w-screen flex-col overflow-hidden">
    <Header v-show="showHeader" />
    <div class="flex-1">
      <Main />
    </div>
  </div>
</template>
<style></style>
