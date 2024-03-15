<script setup lang="ts">
import { ref } from 'vue'

const bgGenerationTempElemRef = ref<HTMLDivElement | null>(null)

defineExpose({
  elRef: bgGenerationTempElemRef
})
</script>
<template>
  <div class="w-max max-w-[80vw] rounded-md bg-white p-3 text-sm shadow-sm">
    <div class="mb-2">
      <span>正在生成背景...</span>
    </div>
    <div ref="bgGenerationTempElemRef" />
  </div>
</template>
<style>
</style>
