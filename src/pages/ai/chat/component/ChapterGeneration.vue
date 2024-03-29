<script setup lang="ts">
import { ref, onMounted, reactive, onBeforeUnmount, inject } from 'vue'
import { Icon } from '@iconify/vue'
import { Button, showToast } from 'vant'
import { provideScrollElemToBottom } from '@/provide'
import { useBaseDialog } from '@/composables/useBaseDialog'
import { isRealEmpty } from '@/utils/is'
import { router } from '@/router'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { useClipboard } from '@vueuse/core'
import Api from '@/api'

interface OutlineGenerationProps {
  data?: string
  lastData?: string
  novelId?: number
  chapter?: number
}

const props = withDefaults(defineProps<OutlineGenerationProps>(), {
  data: '',
  lastData: '',
  novelId: -1,
  chapter: -1
})

const emit = defineEmits<{
  (e: 'done', data: { content: string, lastContent: string, chapter: number }): void
}>()

const injectScrollElemToBottom = inject(provideScrollElemToBottom, null)

const { copy, copied, isSupported } = useClipboard({
  legacy: true
})

const mutual = reactive({
  generate: false
})

const chapterContent = ref(props.data)

const lastChapterContent = ref(props.lastData)

const chapterNum = ref(props.chapter)

const { openDialog } = useBaseDialog()

const esp = ref<EventSourcePolyfill | null>(null)

// 生成章节
const generateChapterContent = (type?: number) => {

  if (mutual.generate) return

  if ((props.novelId < 0) || (props.chapter < 0)) {
    showToast('背景生成参数不足')
    return
  }

  mutual.generate = true

  esp.value?.close()

  switch (type) {
    case 0:
      chapterNum.value = 1
      chapterContent.value = lastChapterContent.value = ''
      break
    case 1:
      if (chapterNum.value === 1) {
        chapterContent.value = lastChapterContent.value = ''
      } else {
        chapterContent.value = lastChapterContent.value
      }
      break
    case 2:
      chapterNum.value += 1
      chapterContent.value += '\n\n'
      lastChapterContent.value = chapterContent.value
      break
  }

  const apiUrl = import.meta.env.VITE_APP_API_URL.replace(/\/$/, '')

  const url = `${apiUrl}/novel/generate/content?novel_id=${props.novelId}&chapter=${chapterNum.value}&message_id=1`

  esp.value = new EventSourcePolyfill(url)

  esp.value.addEventListener('message', (message) => {

    if (JSON.parse(message.data).code === 10004) {
      showToast('次数不足，请充值')
      setTimeout(() => {
        router.push('/client/buy-package')
      }, 1000)
    }

    chapterContent.value += JSON.parse(message.data).content
  })

  esp.value.addEventListener('error', () => {

    Api.novel.editNovelContent({
      type: 1,
      content: chapterContent.value,
      chatper: chapterNum.value,
      novel_id: props.novelId
    })

    emit('done', {
      content: chapterContent.value,
      lastContent: lastChapterContent.value,
      chapter: chapterNum.value
    })

    esp.value?.close()
    esp.value = null
    mutual.generate = false
  })

  let timer = setInterval(() => {
    if (!mutual.generate) {
      clearInterval(timer)
    }
    injectScrollElemToBottom?.('smooth', true)
  }, 1000)
}

// 重新生成所有
const handleRegenerateChapter = () => {
  openDialog({
    message: '重新生成小说?',
    onConfirm: () => {
      generateChapterContent(0)
    }
  })
}

// 重新生成当前
const handleRegenerateCurrentChapter = () => {
  openDialog({
    message: '重新生成当前章?',
    onConfirm: () => {
      generateChapterContent(1)
    }
  })
}

// 生成下一章
const handleGenerateNextChapter = () => {
  generateChapterContent(2)
}

// 复制内容
const handleCopyClick = async () => {
  await copy(chapterContent.value)
  if (copied.value) {
    showToast('复制成功')
  }
}

onMounted(() => {
  if (isRealEmpty(props.data)) {
    generateChapterContent(0)
  }
})

onBeforeUnmount(() => {
  esp.value?.close()
})
</script>
<template>
  <div class="rounded-md bg-white p-3 text-sm shadow-sm">
    <div class="flex items-center justify-between">
      <span>小说生成</span>
      <div
        v-show="(!mutual.generate && isSupported)"
        class="p-0.5 active:text-neutral-400"
        @click="handleCopyClick"
      >
        <Icon
          icon="uiw:copy"
          class="text-base"
        />
      </div>
    </div>
    <div
      v-show="!isRealEmpty(chapterContent)"
      class="mt-2 whitespace-pre-wrap rounded bg-neutral-100 p-2 text-justify text-sm"
    >
      {{ chapterContent }}
    </div>

    <div
      v-if="!mutual.generate"
      class="mt-3 flex justify-between"
    >
      <div
        class="mr-2 flex shrink-0 items-center px-2 text-primary active:text-neutral-400"
        @click="handleRegenerateChapter"
      >
        <Icon
          icon="tabler:refresh"
          class="text-xl"
        />
        <span class="ml-2 text-sm">重新生成</span>
      </div>
      <div class="flex items-center gap-x-2">
        <Button
          size="small"
          round
          type="default"
          @click="handleRegenerateCurrentChapter"
        >
          &nbsp;&nbsp;重新生成当前章&nbsp;&nbsp;
        </Button>
        <Button
          type="primary"
          round
          size="small"
          @click="handleGenerateNextChapter"
        >
          &nbsp;&nbsp;生成下一章&nbsp;&nbsp;
        </Button>
      </div>
    </div>
  </div>
</template>
<style></style>
