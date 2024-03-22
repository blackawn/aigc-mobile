<script setup lang="ts">
import { ref, onMounted, reactive, onBeforeUnmount, watchEffect, inject } from 'vue'
import { Icon } from '@iconify/vue'
import { Button, showToast } from 'vant'
import { provideScrollElemToBottom, provideModifyInputBoxStatus } from '@/provide'
import { isRealEmpty } from '@/utils/is'
import { NativeEventSource, EventSourcePolyfill } from 'event-source-polyfill'
import { useBaseDialog } from '@/composables/useBaseDialog'
import { useClipboard } from '@vueuse/core'
import Api from '@/api'

interface contentGenerationProps {
  data?: string
  novelId?: number
  disabled?: boolean
  apiMap?: string
  title?: string
  type?: number
}

const props = withDefaults(defineProps<contentGenerationProps>(), {
  data: '',
  novelId: -1,
  disabled: true,
  apiMap: '/novel/continue',
  title: '',
  type: 9
})

const emit = defineEmits<{
  (e: 'done', content: string): void
}>()

const injectScrollElemToBottom = inject(provideScrollElemToBottom, null)
const injectModifyInputBoxStatus = inject(provideModifyInputBoxStatus, null)

const { copy, copied, isSupported } = useClipboard({
  legacy: true
})

const mutual = reactive({
  generate: false
})
const { openDialog, closeDialog } = useBaseDialog()

const baseContent = ref(props.data)

const esp = ref<EventSourcePolyfill | EventSource |null>(null)

const generateBaseContent = () => {

  if (mutual.generate) return

  if ((props.novelId < 0)) {
    showToast('背景生成参数不足')
    return
  }

  esp.value?.close()

  mutual.generate = true

  baseContent.value = ''

  const apiUrl = import.meta.env.VITE_APP_API_URL.replace(/\/$/, '')

  const url = `${apiUrl}${props.apiMap}?novel_id=${props.novelId}&message_id=1`

  esp.value = new NativeEventSource(url)

  injectModifyInputBoxStatus?.(true)

  esp.value.addEventListener('message', (message) => {
    baseContent.value += JSON.parse(message.data).content
  })

  esp.value.addEventListener('error', () => {

    Api.novel.editNovelContent({
      novel_id: props.novelId,
      content: baseContent.value,
      type: props.type
    })

    emit('done', baseContent.value)
    injectModifyInputBoxStatus?.(false)
    esp.value?.close()
    esp.value = null
    mutual.generate = false

    console.log('error')
  })

  let timer = setInterval(() => {
    if (!mutual.generate) {
      clearInterval(timer)
    }
    injectScrollElemToBottom?.()
  }, 1000)
}

// 重新生成
const handleAfreshClick = () => {
  openDialog({
    message: '确定重新生成?',
    onConfirm() {
      generateBaseContent()
    },
  })
}

// 复制内容
const handleCopyClick = async () => {
  await copy(baseContent.value)
  if (copied.value) {
    showToast('复制成功')
  }
}

// watchEffect(() => {
//   if (!isRealEmpty(props.data)) {
//     outlineContent.value = props.data
//   }
// })

onMounted(() => {
  if (isRealEmpty(props.data)) {
    generateBaseContent()
  }
})

onBeforeUnmount(() => {
  esp.value?.close()
})

</script>
<template>
  <div class="rounded-md bg-white p-3 text-sm shadow-sm">
    <div class="flex items-center justify-between">
      <span>{{ title }}</span>
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
      v-show="!isRealEmpty(baseContent)"
      class="mt-2 whitespace-pre-wrap rounded bg-neutral-100 p-2 text-justify text-sm"
    >
      {{ baseContent }}
    </div>
    <div
      v-if="(!mutual.generate && !props.disabled)"
      class="mt-3 flex justify-between"
    >
      <div
        class="mr-2 flex shrink-0 items-center px-2 text-primary active:text-neutral-400"
        @click="handleAfreshClick"
      >
        <Icon
          icon="tabler:refresh"
          class="text-xl"
        />
        <span class="ml-2 text-sm">重新生成</span>
      </div>
    </div>
  </div>
</template>
<style></style>
