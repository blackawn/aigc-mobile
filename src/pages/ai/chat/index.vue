<script setup lang="ts">
import { ref, watch } from 'vue'
import { Icon, _api } from '@iconify/vue'
import { Button } from 'vant'
import ChatDialog from './component/ChatDialog.vue'
import BackgroundGeneration, { BackgroundType } from './component/BackgroundGeneration.vue'
import RoleGeneration from './component/RoleGeneration.vue'
import { DialogType } from './component/types'
import { onMounted } from 'vue'
import { useEventSource } from '@/composables/useEventSource'
import Api, { CreateNovelParams, CreateNovelBackgroundRes } from '@/api'
import { watchEffect } from 'vue'
import { reactive } from 'vue'
import { EventSourcePolyfill } from 'event-source-polyfill'

const userInput = ref('')

const novelId = ref<number | null>(null)

interface NovelGenerationProcess {
  step: number
  dialog: Array<DialogType>
}

const delayMutual = ref(false)

const scrollEl = ref<HTMLDivElement | null>(null)

const backgroundInst = ref<EventSource | null>(null)

const background = reactive({
  content: '',
  pervGenerationKeyword: '',
  connected: false
})

const novelGenerationProcessData = ref<NovelGenerationProcess>({
  step: 0,
  dialog: []
})

// 初始化小说生成开头
const initNovelGenerationProcess = () => {
  novelGenerationProcessData.value.dialog.push({
    role: 'gtp',
    content: '嗨！我是专门为作者提供创作帮助的AI助手，我具备强大的理解和生成能力，可以为作者提供创意灵感、角色设定、情节发展等方面的建议。我可以与作者进行对话，帮助他们解决问题，充实情节，提升故事的吸引力。</br></br> 无论你是需要构思情节，塑造角色，还是需要一些创意技巧，我都会尽力帮助你。请告诉我你想写什么题材的小说？',
    time: '',
    type: 'theme',
    mutual: {
      type: 0,
      buttonList: ['玄幻仙侠', '言情甜宠', '武侠古典', '奇幻异世', '悬疑推理', '科幻未来', '都市生活', '古诗古文', '随机盲盒']
    }
  })
}

// 主题选择
const themeSelect = async (value: string) => {

  delayMutual.value = true

  // 第一次要选择交互，创建历史记录, 返回id
  if (!novelId.value) {
    const res = await Api.novel.createNovel({
      title: value,
      type: 1
    }).finally(() => delayMutual.value = false)

    novelId.value = res.data.novel_id
  }

  novelGenerationProcessData.value.dialog.push({
    role: 'user',
    content: value,
    time: '',
    type: 'theme'
  })

  setTimeout(() => {

    novelGenerationProcessData.value.dialog.push({
      role: 'gtp',
      content: '好的！请告诉我您希望的小说背景是什么样的，我将会依据此为您生成小说的世界观。请随意描述您希望的背景设定。',
      time: '',
      type: 'theme'
    })

    delayMutual.value = false

    novelGenerationProcessData.value.step = 1

  }, 500)
}

// 滚动到底部
const scrollElToBottom = () => {
  if (scrollEl.value) {
    scrollEl.value.scrollTop = scrollEl.value.scrollHeight
  }
}

// 生成背景
const handleGenerationBackground = () => {

  background.connected = true

  background.content = ''

  if (userInput.value) {
    background.pervGenerationKeyword = userInput.value
  }

  const keyword = userInput.value || background.pervGenerationKeyword

  backgroundInst.value = new EventSourcePolyfill(`https://api.novel.kafan321.com/api/v1/novel/generate/background?novel_id=${novelId.value}&content=${keyword}`)

  backgroundInst.value.addEventListener('message', (message) => {
    background.content += JSON.parse(message.data).content
    requestIdleCallback(() => scrollElToBottom())
  })

  backgroundInst.value.addEventListener('error', () => {
    background.connected = false
  })

}

const handleConfirmBackground = (data: BackgroundType) => {
  novelGenerationProcessData.value.step = 3
}

// 用户输入
const handleUserInputSend = async () => {
  novelGenerationProcessData.value.dialog.push({
    role: 'user',
    content: userInput.value,
    time: '',
    type: 'theme'
  })

  handleGenerationBackground()

  userInput.value = ''

  novelGenerationProcessData.value.step = 2

}

watchEffect(() => {
  if (novelGenerationProcessData.value.dialog.length) {
    requestIdleCallback(() => scrollElToBottom())
  }
})

onMounted(() => {
  initNovelGenerationProcess()
})

</script>
<template>
  <div class="flex h-full flex-col bg-neutral-100">
    <div
      ref="scrollEl"
      class="flex-1 overflow-x-hidden"
    >
      <div class="p-4">
        <div class="flex flex-col gap-y-5">
          <ChatDialog
            v-for="data in novelGenerationProcessData.dialog"
            :key="data.time"
            :data="data"
            :button-props="{
              disabled: delayMutual
            }"
            @button="v => themeSelect(v)"
          />
          <BackgroundGeneration
            
            :data="background.content"
            :allow-mutual="(!background.connected)"
            @afresh="handleGenerationBackground"
            @confirm="handleConfirmBackground"
          />
          <RoleGeneration />
        </div>
      </div>
    </div>
    <div
      class="flex items-center bg-neutral-50 py-2.5 shadow-md"
      :class="{
        'pointer-events-none': (novelGenerationProcessData.step !== 1)
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
        @click="handleUserInputSend"
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
