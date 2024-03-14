<script setup lang="ts">
import { ref } from 'vue'
import { Form, Field } from 'vant'

export interface BackgroundSettingData {
  title: string
  time: string
  address: string
  background: string
}

export interface BackgroundSettingProps {
  data?: BackgroundSettingData
}

const props = withDefaults(defineProps<BackgroundSettingProps>(), {
  data: () => ({
    title: '',
    time: '',
    address: '',
    background: ''
  })
})

const backgroundSettingData = ref<BackgroundSettingData>({...props.data})

defineExpose({
  backgroundSettingData
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
