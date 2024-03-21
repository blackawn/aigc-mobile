<script setup lang="ts">
import { ref } from 'vue'
import DrawInfo from './DrawInfo.vue'
import DrawResult from './DrawResult.vue'

const toggleDrawInterface = ref(true)

</script>
<template>
  <div class="flex h-full flex-col bg-neutral-100">
    <div
      ref="scrollElem"
      class="flex-1 overflow-x-hidden"
    >
      <DrawInfo
        v-show="!toggleDrawInterface"
        @toggle="(v) => (toggleDrawInterface = v)"
      />
      <DrawResult
        v-show="toggleDrawInterface"
        @toggle="(v) => (toggleDrawInterface = v)"
      />
    </div>
  </div>
</template>
<style>
</style>
