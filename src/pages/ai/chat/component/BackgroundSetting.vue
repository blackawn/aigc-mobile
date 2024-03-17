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

const backgroundSettingDataToStr = computed(() => {
  return `时间：${backgroundSettingData.value?.time}；地点：${backgroundSettingData.value?.address}；背景：${backgroundSettingData.value?.background}`
})

watchEffect(() => {
  if (props.data) {
    backgroundSettingData.value = extractBackgroundSetting(props.data)
  }
})

defineExpose({
  content: backgroundSettingDataToStr
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
