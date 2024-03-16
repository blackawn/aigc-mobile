<script setup lang="ts">
import { ref, reactive, computed, watchEffect } from 'vue'
import type { DialogData, DialogType, SummaryData, RoleStyleInfoData } from './component/types'
import ChatInfo from './component/ChatInfo.vue'
import ChatInfoMutual from './component/ChatInfoMutual.vue'
import BackgroundGeneration from './component/BackgroundGeneration.vue'
import TempGeneration from './component/TempGeneration.vue'
import RoleGeneration from './component/RoleGeneration.vue'
import OutlineInfo from './component/OutlineInfo.vue'
import OutlineGeneration from './component/OutlineGeneration.vue'
import Api from '@/api'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { parseTime } from '@/utils/format'
import { nanoid } from 'nanoid'
import { last } from 'lodash'

interface NovelGenerationProps {
  data: Array<DialogData>
  novelId: number
}

const props = withDefaults(defineProps<NovelGenerationProps>(), {
  data: () => [],
  novelId: -1
})

const emit = defineEmits<{
  (e: 'update'): void
}>()

const chatDialogData = ref<Array<DialogData>>(props.data)

const mutualData = reactive<{
  novelGeneration: Array<SummaryData>
}>({
  novelGeneration: []
})

const lastChatDialogType = computed(() => last(chatDialogData.value)?.type || '')

const novelId = ref<number>(props.novelId)

/**
 * backgroundGeneration
 */

const backgroundGenerationTempRef = ref<InstanceType<typeof TempGeneration> | null>(null)

const backgroundGeneration = reactive<{
  connected: boolean
  lastKeyword: string
}>({
  connected: false,
  lastKeyword: '',
})

/**
 * outlineGeneration
 */
const outlineGenerationTempRef = ref<InstanceType<typeof TempGeneration> | null>(null)

const outlineGeneration = reactive<{
  connected: boolean
}>({
  connected: false
})

// 添加会话
const addDialog = (opt: DialogData, time = 500) => {
  setTimeout(() => {
    chatDialogData.value.push({
      avatar: 'icon_avatar',
      time: parseTime(),
      ...opt
    })
  }, time)
}

const inputBackgroundAnswer = (value: string) => {

  addDialog({
    content: value,
    role: 'user',
    type: 'backgroundAnswer'
  }, 0)

  setTimeout(() => {
    generationBackgroundContent(value)
  }, 500)
}

// 生成背景
const generationBackgroundContent = (value?: string) => {

  // 清空内容
  if (backgroundGenerationTempRef.value?.elRef) {
    (backgroundGenerationTempRef.value?.elRef as HTMLDivElement).textContent = ''
  }

  // 如果存在已生成的背景数据就删除掉
  if (chatDialogData.value[chatDialogData.value.length - 1].type === 'backgroundGeneration') {
    chatDialogData.value.pop()
  }

  if (value) {
    backgroundGeneration.lastKeyword = value
  }

  let esp: EventSourcePolyfill | null = new EventSourcePolyfill(`https://api.novel.kafan321.com/api/v1/novel/generate/background?novel_id=${novelId.value}&content=${backgroundGeneration.lastKeyword}`)

  backgroundGeneration.connected = true

  esp.addEventListener('message', (message) => {
    // 临时打印生成的内容, 只操作dom
    (backgroundGenerationTempRef.value?.elRef as HTMLDivElement).textContent += JSON.parse(message.data).content
  })

  esp.addEventListener('error', () => {
    // 连接终止时再插入数据渲染组件
    chatDialogData.value.push({
      avatar: 'icon_avatar',
      time: parseTime(),
      content: (backgroundGenerationTempRef.value?.elRef as HTMLDivElement).textContent || '',
      role: 'gpt',
      type: 'backgroundGeneration'
    })

    backgroundGeneration.connected = false
    esp = null
  })

}

// 确认背景
const handleConfirmBackgroundContentClick = (content: string) => {
  mutualData.novelGeneration.push({
    title: '背景设定',
    id: 'background',
    content: content
  })

  addDialog({
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

}

// 确认角色
const handleConfirmRoleListClick = (data: Array<RoleStyleInfoData>) => {
  let content = ''

  data.forEach((role) => {
    content += `姓名：${role.name}；性别：${role.sex}；年龄：${role.age}；角色特征：${role.character}；`
  })

  mutualData.novelGeneration.push({
    title: '角色',
    id: 'role',
    content: content.slice(0, -1)
  })

  addDialog({
    content: '好的！请告诉我您想要的情节背景、主要事件或冲突，以及您希望故事发展的方向。',
    role: 'gpt',
    type: 'plot',
    roleStyleInfo: [{
      id: nanoid(10),
      name: '',
      sex: '男',
      age: '青少年',
      character: []
    }]
  })

}

// 生成大纲
const generationOutlineContent = () => {

  // 清空内容
  if (outlineGenerationTempRef.value?.elRef) {
    (outlineGenerationTempRef.value?.elRef as HTMLDivElement).textContent = ''
  }

  // 如果存在已生成的背景数据就删除掉
  if (chatDialogData.value[chatDialogData.value.length - 1].type === 'outlineGeneration') {
    chatDialogData.value.pop()
  }

  let content = ''
  mutualData.novelGeneration.forEach((item) => {
    content += `${item.title}：${item.content}；`
  })

  let esp: EventSourcePolyfill | null = new EventSourcePolyfill(`https://api.novel.kafan321.com/api/v1/novel/generate/outline?novel_id=${novelId.value}&content=${content}`)

  outlineGeneration.connected = true

  esp.addEventListener('message', (message) => {
    // 临时打印生成的内容, 只操作dom
    (outlineGenerationTempRef.value?.elRef as HTMLDivElement).textContent += JSON.parse(message.data).content
  })

  esp.addEventListener('error', () => {
    // 连接终止时再插入数据渲染组件
    addDialog({
      content: (outlineGenerationTempRef.value?.elRef as HTMLDivElement).textContent || '',
      role: 'gpt',
      type: 'outlineGeneration'
    })

    outlineGeneration.connected = false
    esp = null
  })

}

// 确认大纲信息
const handleConfirmOutlineContentClick = () => {

}

// 聊天框按钮交互点击
const handleChatInfoMutualButtonClick = async (data: Pick<DialogData, 'type' | 'content'>) => {

  // 主题选择
  if (data.type === 'theme') {
    chatDialogData.value.push({
      avatar: 'icon_avatar',
      time: parseTime(),
      content: data.content,
      role: 'user',
      type: 'themeAnswer'
    })

    Api.novel.modifyNovelHistory({
      novel_id: novelId.value,
      title: `小说生成 - ${data.content}`
    })

    mutualData.novelGeneration[0] = {
      title: '小说题材',
      id: 'theme',
      content: data.content
    }

    // 背景选择
    addDialog({
      content: '好的！请告诉我您希望的小说背景是什么样的，我将会依据此为您生成小说的世界观。请随意描述您希望的背景设定。',
      role: 'gpt',
      type: 'background'
    })

  }

  // 情节选择
  if (data.type === 'plot') {
    chatDialogData.value.push({
      avatar: 'icon_avatar',
      time: parseTime(),
      content: data.content,
      role: 'user',
      type: 'plotAnswer'
    })

    mutualData.novelGeneration.push({
      title: '情节',
      id: 'plot',
      content: data.content
    })

    // 文风选择
    addDialog({
      content: '选择您想要的文风。',
      role: 'gpt',
      type: 'writingStyle'
    })
  }

  // 文风
  if (data.type === 'writingStyle') {
    addDialog({
      content: data.content,
      role: 'user',
      type: 'writingStyleAnswer'
    }, 0)

    mutualData.novelGeneration.push({
      title: '文风',
      id: 'writingStyle',
      content: data.content
    })

    // 大纲
    addDialog({
      content: '',
      role: 'gpt',
      type: 'summary',
      outline: true,
      summaryList: mutualData.novelGeneration
    })
  }
}

// 可以交互的按钮
const getChatInfoMutual = (type: DialogType) => {
  // 主题选择禁用
  return (type === 'theme' && !['theme', 'background'].includes(lastChatDialogType.value)) ||
    // 情节
    (type === 'plot' && lastChatDialogType.value !== 'plot') ||
    // 文风
    (type === 'writingStyle' && lastChatDialogType.value !== 'writingStyle')
}

watchEffect(() => {
  chatDialogData.value = props.data
  novelId.value = props.novelId
})

watchEffect(() => {
  if (chatDialogData.value.length) {
    requestAnimationFrame(() => emit('update'))
  }
})

defineExpose({
  inputBackgroundAnswer,
  lastChatDialogType
})

</script>
<template>
  <template
    v-for="dialog in chatDialogData"
    :key="dialog.time"
  >
    <ChatInfoMutual
      v-if="(['theme', 'background', 'plot', 'writingStyle'].includes(dialog.type) && dialog.role === 'gpt')"
      :data="dialog"
      :button-props="{
        disabled: getChatInfoMutual(dialog.type)
      }"
      @button="handleChatInfoMutualButtonClick"
    />
    <ChatInfo
      v-else-if="(['themeAnswer', 'backgroundAnswer', 'plotAnswer', 'writingStyleAnswer'].includes(dialog.type))"
      :data="dialog"
    />
    <BackgroundGeneration
      v-else-if="(dialog.type === 'backgroundGeneration' && !backgroundGeneration.connected)"
      :data="dialog.content"
      :allow-mutual="(!backgroundGeneration.connected && lastChatDialogType === 'backgroundGeneration')"
      @afresh="generationBackgroundContent"
      @confirm="handleConfirmBackgroundContentClick"
    />
    <RoleGeneration
      v-else-if="(dialog.type === 'role')"
      :allow-mutual="(lastChatDialogType === 'role')"
      :data="dialog.roleStyleInfo"
      @next="handleConfirmRoleListClick"
    />
    <OutlineInfo
      v-else-if="(dialog.type === 'summary')"
      :data="dialog.summaryList"
      :allow-mutual="(lastChatDialogType === 'summary')"
      @confirm="handleConfirmOutlineContentClick"
    />
    <OutlineGeneration
      v-else-if="(dialog.type === 'outlineGeneration')"
      :data="dialog.content"
      :allow-mutual="(lastChatDialogType === 'outlineGeneration')"
      @afresh="generationOutlineContent"
    />
  </template>
  <TempGeneration
    v-if="backgroundGeneration.connected"
    ref="backgroundGenerationTempRef"
    title="正在生成背景..."
  />
  <TempGeneration
    v-if="outlineGeneration.connected"
    ref="outlineGenerationTempRef"
    title="正在生成大纲..."
  />
</template>
<style></style>
