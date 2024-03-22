<script setup lang="ts">
import { ref, inject, computed, watchEffect, watch, nextTick } from 'vue'
import type { DialogData, DialogType } from './component/types'
import ChatInfo from './component/ChatInfo.vue'
import ChatInfoMutual from './component/ChatInfoMutual.vue'
import ContentGeneration from './component/ContentGeneration.vue'
import Api from '@/api'
import { parseTime } from '@/utils/format'
import { last } from 'lodash'
import { provideScrollElemToBottom } from '@/provide'
import { isRealEmpty } from '@/utils/is'

interface NovelExpandWriteProps {
  guide: Array<DialogData>
  data: Array<DialogData>
  novelId: number
}

const props = withDefaults(defineProps<NovelExpandWriteProps>(), {
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

// 输入扩写内容
const inputContinueWriteAnswer = async (value: string) => {

  if (lastDialog.value?.type === 'continueWriteGeneration') {
    chatDialogData.value.pop()
  }

  if (novelId.value) {
    await addDialog({
      content: value,
      role: 'user',
      type: 'expandWriteAnswer'
    }, 0)

    await Api.novel.editNovelContent({
      content: value,
      novel_id: novelId.value
    })

    await addDialog({
      content: '',
      role: 'gpt',
      novelId: novelId.value,
      type: 'expandWriteGeneration'
    })

    savaChatDialogList()
  }

}


// 保存生成的扩写内容会话
const doneExpandWrite = (content: string) => {

  modifyDialog('expandWriteGeneration', {
    content
  })

  savaChatDialogList()
}

// 聊天框按钮交互点击
const handleChatMutualButtonClick = async (data: Pick<DialogData, 'type' | 'content'>) => {

  // 扩写选择
  if (data.type === 'expandWriteGuide') {
    chatDialogData.value.push({
      avatar: 'icon_avatar',
      time: parseTime(),
      content: data.content,
      role: 'user',
      type: 'expandWriteSelect'
    })

    // 更新标题
    Api.novel.modifyNovelHistory({
      novel_id: novelId.value,
      title: `小说扩写 - ${data.content}`
    })

    // 扩写内容
    await addDialog({
      content: `好的！您希望我对${data.content.substring(0, 2)}进行扩写，让故事更加跌宕有趣，请输入您目前的小说内容。`,
      role: 'gpt',
      type: 'expandWrite'
    })
  }

  savaChatDialogList()
}

// 可以交互的按钮
const getDialogMutualStatus = (type: DialogType) => {
  // 扩写引导
  return (type === 'expandWriteGuide' && !['expandWriteGuide'].includes((lastDialog.value?.type as string)))
}

watchEffect(() => {
  chatDialogData.value = [...props.data]
  novelId.value = props.novelId
})

watch(() => chatDialogData.value, (n, o) => {
  nextTick(() => injectScrollElemToBottom?.((isRealEmpty(o.length) ? 'auto' : 'smooth')))
}, { deep: true })

defineExpose({
  inputContinueWriteAnswer,
  savaChatDialogList,
  lastDialog
})
</script>
<template>
  <template
    v-for="dialog in chatDialogData"
    :key="dialog.time"
  >
    <ChatInfoMutual
      v-if="(['expandWriteGuide'].includes(dialog.type))"
      :data="dialog"
      :button-props="{
        disabled: getDialogMutualStatus(dialog.type)
      }"
      @button="handleChatMutualButtonClick"
    />
    <ChatInfo
      v-else-if="(['expandWriteSelect', 'expandWrite', 'expandWriteAnswer'].includes(dialog.type))"
      :data="dialog"
    />
    <ContentGeneration
      v-else-if="(dialog.type === 'expandWriteGeneration')"
      :disabled="(lastDialog?.type !== 'expandWriteGeneration')"
      :novel-id="novelId"
      :data="dialog.content"
      title="扩写生成"
      api-map="/novel/expand"
      :type="10"
      @done="doneExpandWrite"
    />
  </template>
</template>
<style></style>
