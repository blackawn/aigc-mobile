<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { Icon } from '@iconify/vue'
import { Button, showToast } from 'vant'
import { useBaseDialog } from '@/composables/useBaseDialog'
import { isEmpty } from 'lodash'
import { NativeEventSource, } from 'event-source-polyfill'

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

const mutual = reactive({
  generate: false
})

const chapterContent = ref(props.data)

const lastChapterContent = ref(props.lastData)

const chapterNum = ref(props.chapter)

const { openDialog } = useBaseDialog()

const esp = ref<EventSource | null>(null)

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
      chapterContent.value = ''
      break
    case 1:
      chapterContent.value = lastChapterContent.value || ''
      break
    case 2:
      chapterNum.value += 1
      chapterContent.value += '\n\n'
      break
  }

  const apiUrl = import.meta.env.VITE_APP_API_URL.replace(/\/$/, '')

  const url = `${apiUrl}/novel/generate/content?novel_id=${props.novelId}&chapter=${chapterNum.value}&message_id=1`

  esp.value = new NativeEventSource(url)

  esp.value.addEventListener('message', (message) => {
    chapterContent.value += JSON.parse(message.data).content
  })

  esp.value.addEventListener('error', () => {
    esp.value?.close()
    esp.value = null
    lastChapterContent.value = chapterContent.value
    mutual.generate = false
  })
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

onMounted(() => {
  if (isEmpty(props.data)) {
    generateChapterContent(0)
  }
})

</script>
<template>
  <div class="rounded-md bg-white p-3 text-sm shadow-sm">
    <div class="mb-2">
      <span>小说生成</span>
    </div>
    <div class="whitespace-pre-wrap rounded bg-neutral-100 p-2 text-justify text-sm">
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
