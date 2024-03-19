<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { Tabs, Tab, Form, Field } from 'vant'
import { isEmpty, some } from 'lodash'

interface OutlineData {
  chapter: string
  title: string
  outline: string
}

interface OutlineModifyProps {
  data?: string
}

const props = withDefaults(defineProps<OutlineModifyProps>(), {
  data: ''
})

const outlineList = ref<Array<OutlineData>>([])

// 提取背景描述
const extractOutlineData = (content: string) => {
  const pattern = /第(\d+)章\s*标题：(.+)\s*大纲：(.+)/g
  const matches = [...content.matchAll(pattern)]
  return matches.map(match => ({
    chapter: `第${match[1]}章`,
    title: match[2],
    outline: match[3]
  }))
}

const isVacancy = () => {
  return !some(outlineList.value, obj => {
    return some(obj, value => value === '')
  })
}

const formatOutlineListData = () => {

  const match = props.data.match(/^小说的标题：《([^》]+)》/)

  let novelTitle = ''
  if (match) {
    novelTitle = match[0]
  }

  let content = ''
  outlineList.value.forEach((item) => {
    content += `${item.chapter}\n  标题：${item.title}\n  大纲：${item.outline}\n\n`
  })

  let modifiedNovelContent = content
  if (modifiedNovelContent.endsWith('\n\n')) {
    modifiedNovelContent = modifiedNovelContent.slice(0, -2)
  }

  return `${novelTitle}\n\n${modifiedNovelContent}`
}

watchEffect(() => {
  if (props.data) {
    outlineList.value = extractOutlineData(props.data)
  }
})

defineExpose({
  isVacancy,
  getContent: formatOutlineListData
})

</script>
<template>
  <Form autocomplete="off">
    <Tabs
      swipeable
      animated
      swipe-threshold="4"
      line-height="0"
    >
      <Tab
        v-for="item in outlineList"
        :key="item.chapter"
        :title="item.chapter"
      >
        <Field
          v-model="item.title"
          label-align="top"
          label="标题:"
          clearable
          placeholder="请输入标题"
          :rules="[{ required: true, message: '请输入标题' }]"
        />
        <Field
          v-model="item.outline"
          label-align="top"
          rows="3"
          autosize
          label="大纲:"
          type="textarea"
          placeholder="请输入大纲内容"
          :rules="[{ required: true, message: '请输入大纲内容' }]"
        />
      </Tab>
    </Tabs>
  </Form>
</template>
<style></style>
