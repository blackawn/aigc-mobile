<script setup lang="ts">
import { ref, computed, watchEffect, inject, watch, nextTick } from 'vue'
import type { DialogData, DialogType, SummaryData, RoleStyleInfoData } from './component/types'
import ChatInfo from './component/ChatInfo.vue'
import ChatInfoMutual from './component/ChatInfoMutual.vue'
import ChatInfoMutualMultiple from './component/ChatInfoMutualMultiple.vue'
import BackgroundGeneration from './component/BackgroundGeneration.vue'
import RoleGeneration from './component/RoleGeneration.vue'
import SummaryInfo from './component/SummaryInfo.vue'
import OutlineGeneration from './component/OutlineGeneration.vue'
import ChapterGeneration from './component/ChapterGeneration.vue'
import { provideScrollElemToBottom } from '@/provide'
import Api from '@/api'
import { parseTime } from '@/utils/format'
import { nanoid } from 'nanoid'
import { last } from 'lodash'
import { isRealEmpty } from '@/utils/is'

interface NovelGenerationProps {
  guide: Array<DialogData>
  data: Array<DialogData>
  summaryList: Array<SummaryData>
  novelId: number
}

const props = withDefaults(defineProps<NovelGenerationProps>(), {
  guide: () => [],
  data: () => [],
  summaryList: () => [],
  novelId: -1
})

const injectScrollElemToBottom = inject(provideScrollElemToBottom, null)

const chatDialogData = ref<Array<DialogData>>([...props.data])

const summaryList = ref<Array<SummaryData>>([...props.summaryList])

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

// 输入背景
const inputBackgroundAnswer = async (value: string) => {

  if (novelId.value) {
    await addDialog({
      content: value,
      role: 'user',
      type: 'backgroundAnswer'
    }, 0)

    addDialog({
      content: '',
      role: 'gpt',
      keyword: value,
      novelId: novelId.value,
      type: 'backgroundGeneration'
    })
  }

}

// 保存背景
const doneBackgroundContent = (data: { allContent: string, content: string, selected: number }) => {

  modifyDialog('backgroundGeneration', {
    selected: data.selected,
    content: data.allContent
  })

  savaChatDialogList()
}

// 确认背景
const handleConfirmBackgroundContentClick = async (data: { allContent: string, content: string, selected: number }) => {

  summaryList.value.push({
    title: '背景设定',
    id: 'background',
    content: data.content
  })

  await addDialog({
    content: '好的，请告诉我您想要设定的主要角色名称、年龄、性别以及他们的角色特征。',
    role: 'gpt',
    type: 'role',
    roleStyleInfo: [{
      id: nanoid(10),
      name: '',
      sex: '男',
      age: '青少年',
      character: []
    }]
  })

  doneBackgroundContent(data)

}

// 确认角色
const handleConfirmRoleListClick = async (data: Array<RoleStyleInfoData>) => {
  let content = ''

  data.forEach((role) => {
    content += `姓名：${role.name}；性别：${role.sex}；年龄：${role.age}；角色特征：${role.character}；`
  })

  modifyDialog('role', {
    roleStyleInfo: data
  })

  summaryList.value.push({
    title: '角色',
    id: 'role',
    content: content.slice(0, -1)
  })

  await addDialog({
    content: '好的！请告诉我您想要的情节背景、主要事件或冲突，以及您希望故事发展的方向。',
    role: 'gpt',
    type: 'plot'
  })

  savaChatDialogList()

}

// 确认汇总信息
const handleConfirmSummaryInfoClick = () => {

  addDialog({
    content: '',
    role: 'gpt',
    type: 'outlineGeneration',
    novelId: novelId.value
  })
}

// 保存大纲信息
const doneOutlineContent = (content: string) => {

  modifyDialog('outlineGeneration', {
    content
  })

  savaChatDialogList()
}

// 保存生成的小说
const doneChapterContent = (data: { content: string, lastContent: string, chapter: number }) => {

  modifyDialog('chapterGeneration', data)

  savaChatDialogList()
}

// 生成小说
const handleConfirmChapterGenerationClick = (content: string) => {

  doneOutlineContent(content)

  addDialog({
    content: '',
    role: 'gpt',
    type: 'chapterGeneration',
    chapter: 1,
    novelId: novelId.value
  })
}

// 聊天框按钮交互点击
const handleChatMutualButtonClick = async (data: Pick<DialogData, 'type' | 'content'>) => {

  // 主题选择
  if (data.type === 'theme') {
    chatDialogData.value.push({
      avatar: 'icon_avatar',
      time: parseTime(),
      content: data.content,
      role: 'user',
      type: 'themeAnswer'
    })

    // 更新标题
    Api.novel.modifyNovelHistory({
      novel_id: novelId.value,
      title: `小说生成 - ${data.content}`
    })

    summaryList.value[0] = {
      title: '小说题材',
      id: 'theme',
      content: data.content
    }

    // 背景选择
    await addDialog({
      content: '好的！请告诉我您希望的小说背景是什么样的，我将会依据此为您生成小说的世界观。请随意描述您希望的背景设定。',
      role: 'gpt',
      type: 'background'
    })

  }

  // 文风
  if (data.type === 'writingStyle') {
    await addDialog({
      content: data.content,
      role: 'user',
      type: 'writingStyleAnswer'
    }, 0)

    summaryList.value.push({
      title: '文风',
      id: 'writingStyle',
      content: data.content
    })

    // 大纲
    await addDialog({
      content: '',
      role: 'gpt',
      type: 'summary',
      outline: true,
      summaryList: summaryList.value
    })
  }

  savaChatDialogList()
}

// 聊天框按钮多选交互点击
const handleChatMutualMultipleConfirmClick = async (data: Pick<DialogData, 'type' | 'content'>) => {

  // 情节选择
  if (data.type === 'plot') {
    await addDialog({
      content: data.content,
      role: 'user',
      type: 'plotAnswer'
    })

    summaryList.value.push({
      title: '情节',
      id: 'plot',
      content: data.content
    })

    // 文风选择
    await addDialog({
      content: '选择您想要的文风。',
      role: 'gpt',
      type: 'writingStyle'
    })

    savaChatDialogList()
  }
}

// 可以交互的按钮
const getDialogMutualStatus = (type: DialogType) => {
  // 主题选择禁用
  return (type === 'theme' && !['theme', 'background', 'themeAnswer'].includes((lastDialog.value?.type as string))) ||
    // 情节
    (type === 'plot' && !['plot', 'plotAnswer'].includes(lastDialog.value?.type as string)) ||
    // 文风
    (type === 'writingStyle' && !['writingStyleAnswer', 'writingStyle'].includes(lastDialog.value?.type as string))
}

// 保存会话信息
const savaChatDialogList = () => {

  const data = {
    guide: props.guide,
    dialog: chatDialogData.value,
    summaryList: summaryList.value
  }

  Api.novel.saveChatDialogList({
    novel_id: novelId.value,
    content: JSON.stringify(data),
    type: 'sys'
  })
}

watchEffect(() => {
  chatDialogData.value = [...props.data]
  summaryList.value = [...props.summaryList]
  novelId.value = props.novelId
})

watch(() => chatDialogData.value, (n, o) => {
  injectScrollElemToBottom?.((isRealEmpty(o?.length) ? 'auto' : 'smooth'))
}, { deep: true, immediate: true })

defineExpose({
  inputBackgroundAnswer,
  lastDialog,
  savaChatDialogList
})
</script>
<template>
  <template
    v-for="dialog in chatDialogData"
    :key="dialog.time"
  >
    <ChatInfoMutual
      v-if="(['theme', 'writingStyle'].includes(dialog.type))"
      :key="dialog.time"
      :data="dialog"
      :button-props="{
        disabled: getDialogMutualStatus(dialog.type)
      }"
      @button="handleChatMutualButtonClick"
    />
    <ChatInfo
      v-else-if="(['background', 'themeAnswer', 'backgroundAnswer', 'plotAnswer', 'writingStyleAnswer'].includes(dialog.type))"
      :data="dialog"
    />
    <BackgroundGeneration
      v-else-if="(dialog.type === 'backgroundGeneration')"
      :data="dialog.content"
      :selected="dialog.selected"
      :novel-id="dialog.novelId"
      :keyword="dialog.keyword"
      :disabled="(lastDialog?.type !== 'backgroundGeneration')"
      @done="doneBackgroundContent"
      @confirm="handleConfirmBackgroundContentClick"
    />
    <RoleGeneration
      v-else-if="(dialog.type === 'role')"
      :disabled="(lastDialog?.type !== 'role')"
      :data="dialog.roleStyleInfo"
      @confirm="handleConfirmRoleListClick"
    />
    <SummaryInfo
      v-else-if="(dialog.type === 'summary')"
      :data="dialog.summaryList"
      :allow-mutual="(lastDialog?.type === 'summary')"
      :novel-id="novelId"
      @confirm="handleConfirmSummaryInfoClick"
    />
    <OutlineGeneration
      v-else-if="(dialog.type === 'outlineGeneration')"
      :data="dialog.content"
      :novel-id="dialog.novelId"
      :disabled="(lastDialog?.type !== 'outlineGeneration')"
      @done="doneOutlineContent"
      @edit="doneOutlineContent"
      @confirm="handleConfirmChapterGenerationClick"
    />
    <ChatInfoMutualMultiple
      v-else-if="(dialog.type === 'plot')"
      :data="dialog"
      :button-props="{
        disabled: getDialogMutualStatus(dialog.type)
      }"
      @confirm="handleChatMutualMultipleConfirmClick"
    />
    <ChapterGeneration
      v-else-if="(dialog.type === 'chapterGeneration')"
      :data="dialog.content"
      :last-data="dialog.lastContent"
      :chapter="dialog.chapter"
      :novel-id="dialog.novelId"
      @done="doneChapterContent"
    />
  </template>
</template>
<style></style>
