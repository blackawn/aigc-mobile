<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted, watchEffect, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
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

enum CreationType {
  '小说生成' = 1,
  '小说续写' = 2,
  '小说扩写' = 3
}

type ChatDialogType = 0 | CreationType

interface ChatDialogData {
  type: ChatDialogType
  dialog: Array<DialogData>
}

const chatDialogData = ref<ChatDialogData>({
  type: 0,
  dialog: []
})

const mutualData = reactive<{
  novelGeneration: Array<SummaryData>
}>({
  novelGeneration: []
})

const lastChatDialogType = computed(() => last(chatDialogData.value.dialog)?.type || '')

const userInput = ref('')

const novelId = ref<number | null>(null)

const scrollElem = ref<HTMLDivElement | null>(null)

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
    chatDialogData.value.dialog.push({
      avatar: 'icon_avatar',
      time: parseTime(),
      ...opt
    })
  }, time)
}

// 生成背景
const generationBackgroundContent = (value?: string) => {

  // 清空内容
  if (backgroundGenerationTempRef.value?.elRef) {
    (backgroundGenerationTempRef.value?.elRef as HTMLDivElement).textContent = ''
  }

  // 如果存在已生成的背景数据就删除掉
  if (chatDialogData.value.dialog[chatDialogData.value.dialog.length - 1].type === 'backgroundGeneration') {
    chatDialogData.value.dialog.pop()
  }

  if (value) {
    backgroundGeneration.lastKeyword = value
  }

  let esp: EventSourcePolyfill | null = new EventSourcePolyfill(`https://api.novel.kafan321.com/api/v1/novel/generate/background?novel_id=${novelId.value}&content=${backgroundGeneration.lastKeyword}`)

  backgroundGeneration.connected = true

  esp.addEventListener('message', (message) => {
    // 临时打印生成的内容, 只操作dom
    (backgroundGenerationTempRef.value?.elRef as HTMLDivElement).textContent += JSON.parse(message.data).content
    requestAnimationFrame(() => scrollElToBottom())
    
  })

  esp.addEventListener('error', () => {
    // 连接终止时再插入数据渲染组件
    chatDialogData.value.dialog.push({
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

  setTimeout(() => {
    chatDialogData.value.dialog.push({
      avatar: 'icon_avatar',
      time: parseTime(),
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
  }, 500)
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
  if (chatDialogData.value.dialog[chatDialogData.value.dialog.length - 1].type === 'outlineGeneration') {
    chatDialogData.value.dialog.pop()
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
    requestIdleCallback(() => scrollElToBottom())
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
  generationOutlineContent()
}

// 聊天框按钮交互点击
const handleChatInfoMutualButtonClick = async (data: Pick<DialogData, 'type' | 'content'>) => {

  // 辅助功能
  if (data.type === 'introduction') {
    chatDialogData.value.dialog.push({
      avatar: 'icon_avatar',
      time: parseTime(),
      content: data.content,
      role: 'user',
      type: 'introductionAnswer'
    })

    chatDialogData.value.type = CreationType[data.content as unknown as number] as unknown as ChatDialogType

  }

  // 小说生成
  if (data.type === 'introduction') {
    if (chatDialogData.value.type === 1) {

      addDialog({
        content: '好的！请告诉我您希望的小说背景是什么样的，我将会依据此为您生成小说的世界观。请随意描述您希望的背景设定。',
        role: 'gpt',
        type: 'theme'
      })
    }
  }

  // 小说生成 - 主题选择
  if (data.type === 'theme') {
    chatDialogData.value.dialog.push({
      avatar: 'icon_avatar',
      time: parseTime(),
      content: data.content,
      role: 'user',
      type: 'themeAnswer'
    })

    if (!novelId.value) {
      const res = await Api.novel.createNovel({
        title: data.content,
        type: 1
      })
      console.log('创建会话成功')
      novelId.value = res.data.novel_id
    }

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

  // 小说生成 - 情节选择
  if (data.type === 'plot') {
    chatDialogData.value.dialog.push({
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

    addDialog({
      content: '选择您想要的文风。',
      role: 'gpt',
      type: 'writingStyle'
    })
  }

  // 小说生成 - 文风
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
  // 功能选择禁用
  return (type === 'introduction' && lastChatDialogType.value !== 'introduction') ||
    // 小说生成 - 主题选择禁用
    (type === 'theme' && !['theme', 'background'].includes(lastChatDialogType.value)) ||
    // 小说生成 - 情节
    (type === 'plot' && lastChatDialogType.value !== 'plot') ||
    // 小说生成 - 文风
    (type === 'writingStyle' && lastChatDialogType.value !== 'writingStyle')
}

// 用户发送
const handleSendClick = async () => {

  const value = userInput.value

  userInput.value = ''

  // 生成背景
  if (chatDialogData.value.type === 1 && lastChatDialogType.value !== 'introductionAnswer') {
    addDialog({
      content: value,
      role: 'user',
      type: 'backgroundAnswer'
    }, 0)

    setTimeout(() => {
      generationBackgroundContent(value)
    }, 500)
  }

}

// 初始化对话框
const initChatDialogData = () => {
  chatDialogData.value.dialog.push({
    avatar: 'icon_avatar',
    time: parseTime(),
    content: '你好呀\r\n我是未未，你的创作助手\r\n无论你是遇到创作瓶颈，还是需要灵感激发，我都在这里帮助你。一起来创作吧！现在你需要什么帮助呢？',
    role: 'gpt',
    type: 'introduction'
  })
}

// 滚动到底部
const scrollElToBottom = () => {
  if (scrollElem.value) {
    scrollElem.value.scrollTop = scrollElem.value.scrollHeight
  }
}

watchEffect(() => {
  if (chatDialogData.value.dialog.length) {
    requestAnimationFrame(() => scrollElToBottom())
  }
})

onMounted(() => {
  initChatDialogData()
})

</script>
<template>
  <div class="flex h-full flex-col bg-neutral-100">
    <div
      ref="scrollElem"
      class="flex-1 overflow-x-hidden"
    >
      <div class="flex flex-col gap-y-5 p-4">
        <template
          v-for="dialog in chatDialogData.dialog"
          :key="dialog.time"
        >
          <ChatInfoMutual
            v-if="(['introduction', 'theme', 'background', 'plot', 'writingStyle'].includes(dialog.type) && dialog.role === 'gpt')"
            :data="dialog"
            :button-props="{
              disabled: getChatInfoMutual(dialog.type)
            }"
            @button="handleChatInfoMutualButtonClick"
          />
          <ChatInfo
            v-else-if="(['introductionAnswer', 'themeAnswer', 'backgroundAnswer', 'plotAnswer', 'writingStyleAnswer'].includes(dialog.type))"
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
            @add="scrollElToBottom"
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
      </div>
    </div>
    <div
      class="flex items-center bg-neutral-50 py-2.5 shadow-md"
      :class="{
        'pointer-events-none': (lastChatDialogType !== 'background')
      }"
    >
      <div class="flex px-4 py-1.5 active:text-neutral-400">
        <Icon
          icon="oui:ml-create-single-metric-job"
          class="text-xl"
        />
      </div>
      <div class="flex-1 rounded-md bg-neutral-200/50 px-2 py-1">
        <div class="relative flex-1 overflow-hidden">
          <textarea
            v-model="userInput"
            class="absolute left-0 top-0 m-0 inline-block size-full min-w-0 resize-none whitespace-pre-wrap break-words bg-transparent p-0 align-bottom"
            rows="1"
            @input="e => userInput = (e.target as HTMLInputElement).value"
          />
          <div
            class="pointer-events-none invisible static m-0 inline-block size-full max-h-24 min-h-6 resize-none overflow-hidden whitespace-pre-wrap break-words p-0 align-bottom"
          >
            {{ userInput }}
          </div>
        </div>
      </div>
      <div
        class="flex px-4 py-1.5 active:text-neutral-400"
        @click="handleSendClick"
      >
        <Icon
          icon="streamline:send-email"
          class="text-lg"
        />
      </div>
    </div>
  </div>
</template>
<style></style>
