<script setup lang="ts">
import { ref } from 'vue'
import { Tabs, Tab,Button } from 'vant'


</script>
<template>
  <Tabs
    swipeable
    animated
    swipe-threshold="4"
    line-height="0"
  >
    <Tab title="小说题材">
      <div class="flex flex-wrap justify-center gap-2 py-3" />
    </Tab>
    <Tab title="背景设定">
      <div class="flex flex-wrap justify-center gap-2 py-3" />
    </Tab>
    <Tab title="角色">
      <div class="flex flex-wrap justify-center gap-2 py-3" />
    </Tab>
    <Tab title="情节">
      <div class="flex flex-wrap justify-center gap-2 py-3" />
    </Tab>
    <Tab title="文风">
      <div class="flex flex-wrap justify-center gap-2 py-3" />
    </Tab>
  </Tabs>
</template>
<style></style>
