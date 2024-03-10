<script setup lang="ts">
import { ConfigProvider } from 'vant'
import { themeVars, themeVarsDark, themeVarsLight } from '@/theme'

</script>

<template>
  <ConfigProvider
    :theme-vars="themeVars"
    :theme-vars-dark="themeVarsDark"
    :theme-vars-light="themeVarsLight"
  >
    <RouterView />
  </ConfigProvider>
</template>

<style scoped></style>
