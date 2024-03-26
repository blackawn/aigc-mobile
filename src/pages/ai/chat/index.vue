<script setup lang="ts">
import { ref, onMounted, provide, computed, watchEffect, reactive } from 'vue'
import type { DialogData, SummaryData } from './component/types'
import NovelGeneration from './NovelGeneration.vue'
import NovelContinueWrite from './NovelContinueWrite.vue'
import NovelExpandWrite from './NovelExpandWrite.vue'
import ChatInfoMutual from './component/ChatInfoMutual.vue'
import ChatInfo from './component/ChatInfo.vue'
import InputBox from './component/InputBox.vue'
import Api from '@/api'
import { provideScrollElemToBottom, provideModifyInputBoxStatus } from '@/provide'
import { parseTime } from '@/utils/format'
import { useRoute } from 'vue-router'
import { router } from '@/router'
import { isRealEmpty } from '@/utils/is'

interface ChatDialogData {
  type: number
  guide: Array<DialogData>
  dialog: Array<DialogData>,
  summaryList: Array<SummaryData>
}

const chatDialogData = ref<ChatDialogData>({
  type: -1,
  guide: [],
  dialog: [],
  summaryList: []
})

const route = useRoute()

const novelId = ref<number>(-1)

const scrollElem = ref<HTMLDivElement | null>(null)

const novelGenerationRef = ref<InstanceType<typeof NovelGeneration> | null>(null)

const novelContinueWriteRef = ref<InstanceType<typeof NovelContinueWrite> | null>(null)

const novelExpandWriteRef = ref<InstanceType<typeof NovelExpandWrite> | null>(null)

const disabledInputBox = computed(() => {

  switch (chatDialogData.value.type) {
    case 1:
      return !['background', 'backgroundAnswer', 'themeAnswer'].includes(novelGenerationRef.value?.lastDialog?.type as string)
    case 2:
      return mutual.inputBoxStatus
    case 3:
      return (novelExpandWriteRef.value?.lastDialog?.type !== 'expandWrite' || mutual.inputBoxStatus)
    default:
      return true
  }
})

const mutual = reactive({
  autoScroll: false,
  inputBoxStatus: false,
})

let lastScrollTop = 0

let isAutoScroll = true

// 请求获取会话框信息
const getChatDialogListData = async (id: number) => {
  const res = await Api.novel.getChatDialogList({
    novel_id: id
  })

  novelId.value = id
  chatDialogData.value.guide = res.data.content.guide || []
  chatDialogData.value.dialog = res.data.content.dialog || []
  chatDialogData.value.summaryList = res.data.content.summaryList || []
}

// 初始化会话框
const initChatDialog = () => {
  chatDialogData.value.guide.push({
    avatar: 'icon_avatar',
    time: parseTime(),
    content: '你好呀！\r\n我是未未，你的创作助手\r\n无论你是遇到创作瓶颈，还是需要灵感激发，我都在这里帮助你。一起来创作吧！现在你需要什么帮助呢？',
    role: 'gpt',
    type: 'guide'
  })

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
        chatDialogData.value.dialog.push(newDialog)
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
        content: '好的！我可以根据您提供的情节和要求，进行创作性的续写。我能灵活运用语言和情节的发展，保持故事的连贯性和吸引力，使得读者能够沉浸其中。请您输入您目前的小说内容及续写需求，方便我帮您续写。',
        role: 'gpt',
        type: 'continueWrite'
      },
      3: {
        content: '好的！我具备强大的语言理解和生成能力，可以为作者提供创意灵感、角色设定、情节发展等方面的建议。请您选择扩写的类型，方便我就能更好地理解你的要求并进行小说的续写了。',
        role: 'gpt',
        type: 'expandWriteGuide'
      }
    }

    const dialog = dialogMap[type]

    if (dialog) {
      await addDialog(dialog)
      switch (type) {
        case 1:
          novelGenerationRef.value?.savaChatDialogList()
          break
        case 2:
          novelContinueWriteRef.value?.savaChatDialogList()
          break
        case 3:
          novelExpandWriteRef.value?.savaChatDialogList()
          break
      }
    }

    router.options.history.push(`/client/ai/chat/${type}/${novelId.value}`)
  }
}

// 输入框发生
const onInputSend = (value: string) => {
  switch (chatDialogData.value.type) {
    case 1:
      novelGenerationRef.value?.inputBackgroundAnswer(value)
      break
    case 2:
      novelContinueWriteRef.value?.inputContinueWriteAnswer(value)
      break
    case 3:
      novelExpandWriteRef.value?.inputContinueWriteAnswer(value)
  }

}

// 修改输入框可可用状态
const modifyInputBoxStatus = (status: boolean) => {
  mutual.inputBoxStatus = status
}

// 在有内容加载的时候, 允许往上滚动, 直到滚动到低才会继续执行自动滚动
const onElScroll = (e: Event) => {
  const target = (e.target as HTMLElement)

  if (target.scrollTop < lastScrollTop) {
    isAutoScroll = false
  }

  if (((target.scrollHeight - target.scrollTop) - 10) < target.clientHeight) {
    isAutoScroll = true
  }

  lastScrollTop = target.scrollTop
}

// 滚动到底部
const scrollElToBottom: (behavior?: 'auto' | 'instant' | 'smooth', auto?: boolean) => void = (behavior = 'smooth', auto = false) => {

  if (!isAutoScroll && !auto) return

  requestAnimationFrame(() => {
    if (scrollElem.value) {
      scrollElem.value.scrollTo({
        top: scrollElem.value.scrollHeight,
        behavior: behavior
      })
    }
  })
}

watchEffect(() => {
  const type = Number(route.params.type)
  const id = Number(route.params.id)

  if ((type > 0) && (id > 0)) {
    chatDialogData.value.type = type
    getChatDialogListData(id)
  } 

})

provide(provideScrollElemToBottom, (behavior) => scrollElToBottom(behavior))
provide(provideModifyInputBoxStatus, modifyInputBoxStatus)

onMounted(() => {
  console.log('render-chat')
  initChatDialog()
})

</script>
<template>
  <div class="flex h-full flex-col bg-neutral-100">
    <div
      ref="scrollElem"
      class="flex-1 overflow-x-hidden"
      @scroll="onElScroll"
    >
      <div class="flex flex-col gap-y-5 p-4">
        <ChatInfoMutual
          :data="chatDialogData.guide[0]"
          :button-props="{
            disabled: !isRealEmpty(chatDialogData.guide[1])
          }"
          @button="handleGuideButtonClick"
        />
        <ChatInfo
          v-if="!isRealEmpty(chatDialogData.guide[1])"
          :data="chatDialogData.guide[1]"
        />
        <NovelGeneration
          v-if="(chatDialogData.type === 1)"
          :key="novelId"
          ref="novelGenerationRef"
          :data="chatDialogData.dialog"
          :guide="chatDialogData.guide"
          :summary-list="chatDialogData.summaryList"
          :novel-id="novelId"
        />
        <NovelContinueWrite
          v-else-if="(chatDialogData.type === 2)"
          ref="novelContinueWriteRef"
          :data="chatDialogData.dialog"
          :guide="chatDialogData.guide"
          :novel-id="novelId"
        />
        <NovelExpandWrite
          v-else-if="(chatDialogData.type === 3)"
          ref="novelExpandWriteRef"
          :data="chatDialogData.dialog"
          :guide="chatDialogData.guide"
          :novel-id="novelId"
        />
      </div>
    </div>
    <InputBox
      :disabled="disabledInputBox"
      @send="onInputSend"
    />
  </div>
</template>
<style></style>
