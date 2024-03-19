<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import type { DialogData } from './component/types'
import NovelGeneration from './NovelGeneration.vue'
import ChatInfoMutual from './component/ChatInfoMutual.vue'
import ChatInfo from './component/ChatInfo.vue'
import InputBox from './component/InputBox.vue'
import Api from '@/api'
import { parseTime } from '@/utils/format'
import { useRoute } from 'vue-router'
import { isEmpty } from 'lodash'
import { customAlphabet } from 'nanoid'

interface ChatDialogData {
  type: number
  guide: Array<DialogData>
  dialog: Array<DialogData>
}

const chatDialogData = ref<ChatDialogData>({
  type: -1,
  guide: [],
  dialog: []
})

const route = useRoute()

const novelId = ref<number>(-1)

const scrollElem = ref<HTMLDivElement | null>(null)

const novelGenerationRef = ref<InstanceType<typeof NovelGeneration> | null>(null)

const allowInputBox = computed(() => {
  return (!['background', 'backgroundAnswer'].includes(novelGenerationRef.value?.lastDialog?.type || ''))
})

const getChatDialogList = async (id: number) => {
  const res = await Api.novel.getChatDialogList({
    novel_id: id
  })

  novelId.value = id
  chatDialogData.value.guide = res.data.content.guide || []
  chatDialogData.value.dialog = res.data.content.dialog || []
}

const initChatDialog = () => {
  chatDialogData.value.guide.push({
    avatar: 'icon_avatar',
    time: parseTime(),
    content: '你好呀\r\n我是未未，你的创作助手\r\n无论你是遇到创作瓶颈，还是需要灵感激发，我都在这里帮助你。一起来创作吧！现在你需要什么帮助呢？',
    role: 'gpt',
    type: 'guide'
  })
}

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

// 引导按钮点击
const handleGuideButtonClick = async (data: Pick<DialogData, 'type' | 'content'>) => {

  const typeMapping: Record<string, number> = {
    '小说生成': 1,
    '小说续写': 2,
    '小说扩写': 3
  }

  const type = typeMapping[data.content] || 0

  const res = await Api.novel.createNovel({
    title: data.content,
    type
  })

  if (res.code === 0) {

    novelId.value = res.data.novel_id

    chatDialogData.value.guide.push({
      avatar: 'icon_avatar',
      time: parseTime(),
      content: data.content,
      type: 'guideAnswer',
      role: 'user'
    })

    chatDialogData.value.type = type

    const dialogMap: Record<number, DialogData> = {
      1: {
        content: '好的！请告诉我您希望的小说背景是什么样的，我将会依据此为您生成小说的世界观。请随意描述您希望的背景设定。',
        role: 'gpt',
        type: 'theme'
      },
      2: {
        content: '好的！请告诉我您希望的小说背景是什么样的',
        role: 'gpt',
        type: 'background'
      },
      3: {
        content: '好的！',
        role: 'gpt',
        type: 'summary'
      }
    }

    const dialog = dialogMap[type]

    if (dialog) {
      addDialog(dialog)
    }
  }
}

// 用户发送
const onInputSend = (value: string) => {
  if (chatDialogData.value.type === 1) {
    novelGenerationRef.value?.inputBackgroundAnswer(value)
  }
}

// 滚动到底部
const scrollElToBottom = () => {
  if (scrollElem.value) {
    scrollElem.value.scrollTop = scrollElem.value.scrollHeight
  }
}

watch(() => route.query, (n, o) => {
  const newId = Number(n.id)
  const newType = Number(n.type)

  const oldId = Number(o?.id)
  const oldType = Number(o?.type)

  if ((!newId && !newType) && (oldId && oldType)) {
    
  // novelGenerationRef.value?.modifyMutualInitStatus(false)

    chatDialogData.value.guide = []
    chatDialogData.value.dialog = []
    chatDialogData.value.type = -1
    novelId.value = -1

    initChatDialog()
  } else if ((newId > 0) && (newType > 0)) {
    chatDialogData.value.type = newType
    getChatDialogList(newId)
  }

}, { immediate: true })

onMounted(() => {
  initChatDialog()
})

</script>
<template>
  <div
    ref="xRef"
    class="flex h-full flex-col bg-neutral-100"
  >
    <div
      ref="scrollElem"
      class="flex-1 overflow-x-hidden"
    >
      <div class="flex flex-col gap-y-5 p-4">
        <ChatInfoMutual
          :data="chatDialogData.guide[0]"
          :button-props="{
            disabled: !isEmpty(chatDialogData.guide[1])
          }"
          @button="handleGuideButtonClick"
        />
        <ChatInfo
          v-if="!isEmpty(chatDialogData.guide[1])"
          :data="chatDialogData.guide[1]"
        />
        <NovelGeneration
          v-if="(chatDialogData.type === 1)"
          :key="novelId"
          ref="novelGenerationRef"
          :data="chatDialogData.dialog"
          :guide="chatDialogData.guide"
          :novel-id="novelId"
          @update="scrollElToBottom"
        />
      </div>
    </div>
    <InputBox
      :disabled="allowInputBox"
      @send="onInputSend"
    />
  </div>
</template>
<style></style>
