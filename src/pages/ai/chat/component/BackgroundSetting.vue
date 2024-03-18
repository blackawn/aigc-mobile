<script setup lang="ts">
import { ref } from 'vue'
import { Form, Field } from 'vant'
import { compile } from 'vue'
import { computed } from 'vue'
import { watchEffect } from 'vue'

export interface BackgroundSettingData {
  title: string
  time: string
  address: string
  background: string
}

export interface BackgroundSettingProps {
  data?: string
}

const props = withDefaults(defineProps<BackgroundSettingProps>(), {
  data: ''
})

// 提取背景描述
const extractBackgroundSetting = (content: string) => {
  const regex = /故事背景\d+：\n时间：([^\n]+)\n地点：([^\n]+)\n背景：([\s\S]+)(?=\n\n|$)/

  const match = content.match(regex)

  return {
    title: match ? match[0].split('：')[0] : '',
    time: match ? match[1] : '',
    address: match ? match[2] : '',
    background: match ? match[3].trim() : ''
  }
}

const backgroundSettingData = ref<BackgroundSettingData>({
  title: '',
  time: '',
  address: '',
  background: ''
})

const formatBackgroundSettingData = computed(() => {
  const content = `时间：${backgroundSettingData.value?.time}\n地点：${backgroundSettingData.value?.address}\n背景：${backgroundSettingData.value?.background}`
  return {
    titleContent: `${backgroundSettingData.value.title}：\n${content}`,
    content: content
  }
})

watchEffect(() => {
  if (props.data) {
    backgroundSettingData.value = extractBackgroundSetting(props.data)
  }
})

defineExpose({
  data: formatBackgroundSettingData
})

</script>
<template>
  <div>
    <Form>
      <Field
        v-model="backgroundSettingData.time"
        label-align="top"
        label="时间:"
        clearable
        placeholder="请输入时间"
      />
      <Field
        v-model="backgroundSettingData.address"
        label-align="top"
        label="地点:"
        clearable
        placeholder="请输入地点"
      />
      <Field
        v-model="backgroundSettingData.background"
        label-align="top"
        rows="3"
        autosize
        label="背景:"
        type="textarea"
        placeholder="请输入背景故事"
      />
    </Form>
  </div>
</template>
<style></style>
