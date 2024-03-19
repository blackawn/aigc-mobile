<script setup lang="ts">
import { ref } from 'vue'
import { Form, Field } from 'vant'
import { isEmpty, some } from 'lodash'
import { watchEffect } from 'vue'

export interface BackgroundData {
  title: string
  time: string
  address: string
  background: string
}

export interface BackgroundModifyProps {
  data?: string
}

const props = withDefaults(defineProps<BackgroundModifyProps>(), {
  data: ''
})

const backgroundData = ref<BackgroundData>({
  title: '',
  time: '',
  address: '',
  background: ''
})

// 提取背景描述
const extractBackgroundData = (content: string) => {
  const regex = /故事背景\d+：\n时间：([^\n]+)\n地点：([^\n]+)\n背景：([\s\S]+)(?=\n\n|$)/

  const match = content.match(regex)

  return {
    title: match ? match[0].split('：')[0] : '',
    time: match ? match[1] : '',
    address: match ? match[2] : '',
    background: match ? match[3].trim() : ''
  }
}

const formatBackgroundData = () => {
  const content = `时间：${backgroundData.value?.time}\n地点：${backgroundData.value?.address}\n背景：${backgroundData.value?.background}`
  return {
    titleContent: `${backgroundData.value.title}：\n${content}`,
    content: content
  }
}

const isVacancy = () => {
  return !some(backgroundData.value, isEmpty)
}

watchEffect(() => {
  if (props.data) {
    backgroundData.value = extractBackgroundData(props.data)
  }
})

defineExpose({
  isVacancy,
  getContent: formatBackgroundData
})

</script>
<template>
  <Form autocomplete="off">
    <Field
      v-model="backgroundData.time"
      label-align="top"
      label="时间:"
      clearable
      placeholder="请输入时间"
      :rules="[{ required: true, message: '请输入时间' }]"
    />
    <Field
      v-model="backgroundData.address"
      label-align="top"
      label="地点:"
      clearable
      placeholder="请输入地点"
      :rules="[{ required: true, message: '请输入地点' }]"
    />
    <Field
      v-model="backgroundData.background"
      label-align="top"
      rows="3"
      autosize
      label="背景:"
      type="textarea"
      placeholder="请输入背景故事"
      :rules="[{ required: true, message: '请输入背景故事' }]"
    />
  </Form>
</template>
<style></style>
