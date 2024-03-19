<script setup lang="ts">
import { ref } from 'vue'
import DrawInfo from './component/DrawInfo.vue'

</script>
<template>
  <div class="flex h-full flex-col bg-neutral-100">
    <div
      ref="scrollElem"
      class="flex-1 overflow-x-hidden"
    >
      <DrawInfo />
    </div>
  </div>
</template>
<style>
</style>
