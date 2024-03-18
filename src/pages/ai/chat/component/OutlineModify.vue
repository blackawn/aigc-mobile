<script setup lang="ts">
import { ref } from 'vue'
import { Tabs, Tab, Button, datePickerProps } from 'vant'

interface OutlineModifyProps {
  data?: Array<string>
}

const props = withDefaults(defineProps<OutlineModifyProps>(), {
  data: () => []
})

// 提取背景描述
const extractOutlineSetting = (content: string) => {
  const regex = /故事背景\d+：\n时间：([^\n]+)\n地点：([^\n]+)\n背景：([\s\S]+)(?=\n\n|$)/

  const match = content.match(regex)

  return {
    title: match ? match[0].split('：')[0] : '',
    time: match ? match[1] : '',
    address: match ? match[2] : '',
    background: match ? match[3].trim() : ''
  }
}

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
  </Tabs>
</template>
<style></style>
