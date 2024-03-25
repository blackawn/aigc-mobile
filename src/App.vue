<script setup lang="ts">
import { ConfigProvider } from 'vant'
import { themeVars, themeVarsDark, themeVarsLight } from '@/theme'

</script>

<template>
  <ConfigProvider
    :theme-vars="themeVars"
    :theme-vars-dark="themeVarsDark"
    :theme-vars-light="themeVarsLight"
    class="h-full"
  >
    <RouterView v-slot="{ Component, route }">
      <Transition :name="String(route.meta.transition)">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </ConfigProvider>
</template>

<style scoped>
</style>