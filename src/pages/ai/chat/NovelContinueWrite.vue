<script setup lang="ts">
import { ref, inject, computed, watchEffect, watch,nextTick } from 'vue'
import type { DialogData, DialogType } from './component/types'
import ChatInfo from './component/ChatInfo.vue'
import ContentGeneration from './component/ContentGeneration.vue'
import Api from '@/api'
import { parseTime } from '@/utils/format'
import { last } from 'lodash'
import { provideScrollElemToBottom } from '@/provide'
import { isRealEmpty } from '@/utils/is'

interface NovelGeContinueWriteProps {
  guide: Array<DialogData>
  data: Array<DialogData>
  novelId: number
}

const props = withDefaults(defineProps<NovelGeContinueWriteProps>(), {
  guide: () => [],
  data: () => [],
  novelId: -1
})

const injectScrollElemToBottom = inject(provideScrollElemToBottom, null)

const chatDialogData = ref<Array<DialogData>>([...props.data])

const novelId = ref<number>(props.novelId)

const lastDialog = computed(() => last(chatDialogData.value))

// 更改会话内容
const modifyDialog = (type: DialogType, data: Partial<DialogData>, index?: number) => {

  if (!isRealEmpty(chatDialogData.value)) {
    // 如果提供了索引参数，则只修改特定索引位置的对象
    if (typeof index === 'number' && index >= 0 && index < chatDialogData.value.length) {
      chatDialogData.value[index] = {
        ...chatDialogData.value[index],
        ...data
      }
    } else {

      // 否则，遍历数组，修改所有符合条件的对象
      chatDialogData.value = chatDialogData.value.map((item) => {
        if (item.type === type) {
          return {
            ...item,
            ...data
          }
        }
        return item
      })
    }
  }
}

// 添加会话
const addDialog = async (opt: DialogData, time = 500, callback?: () => void) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const newDialog = {
        avatar: 'icon_avatar',
        time: parseTime(),
        ...opt
      }

      try {
        chatDialogData.value.push(newDialog)
        if (callback) {
          callback()
        }
        resolve(newDialog)
      } catch (error) {
        reject(error)
      }
    }, time)
  })
}

// 保存会话信息
const savaChatDialogList = () => {

  const data = {
    guide: props.guide,
    dialog: chatDialogData.value
  }

  Api.novel.saveChatDialogList({
    novel_id: novelId.value,
    content: JSON.stringify(data),
    type: 'sys'
  })
}

// 输入续写内容
const inputContinueWriteAnswer = async (value: string) => {

  if (lastDialog.value?.type === 'continueWriteGeneration') {
    chatDialogData.value.pop()
  }

  if (novelId.value) {
    await addDialog({
      content: value,
      role: 'user',
      type: 'continueWriteAnswer'
    }, 0)

    await Api.novel.editNovelContent({
      content: value,
      type: 9,
      novel_id: novelId.value
    })

    await addDialog({
      content: '',
      role: 'gpt',
      novelId: novelId.value,
      type: 'continueWriteGeneration'
    })

    savaChatDialogList()
  }

}

// 保存生成的续写内容
const doneContinueWrite = (content: string) => {

  modifyDialog('continueWriteGeneration', {
    content
  })

  savaChatDialogList()
}

watchEffect(() => {
  chatDialogData.value = [...props.data]
  novelId.value = props.novelId
})

watch(() => chatDialogData.value, (n, o) => {
  nextTick(() => injectScrollElemToBottom?.((isRealEmpty(o.length) ? 'auto' : 'smooth')))
},{ deep: true })

defineExpose({
  inputContinueWriteAnswer,
  savaChatDialogList
})
</script>
<template>
  <template
    v-for="dialog in chatDialogData"
    :key="dialog.time"
  >
    <ChatInfo
      v-if="(['continueWrite', 'continueWriteAnswer'].includes(dialog.type))"
      :data="dialog"
    />
    <ContentGeneration
      v-else-if="(dialog.type === 'continueWriteGeneration')"
      :disabled="(lastDialog?.type !== 'continueWriteGeneration')"
      :novel-id="novelId"
      :data="dialog.content"
      api-map="/novel/continue"
      title="续写生成"
      @done="doneContinueWrite"
    />
  </template>
</template>
<style></style>
