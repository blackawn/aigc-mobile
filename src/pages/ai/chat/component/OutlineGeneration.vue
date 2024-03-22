<script setup lang="ts">
import { ref, onMounted, reactive, onBeforeUnmount, h, watchEffect, inject } from 'vue'
import { Icon } from '@iconify/vue'
import { Button, showToast } from 'vant'
import { provideScrollElemToBottom } from '@/provide'
import { isRealEmpty } from '@/utils/is'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { useBaseDialog } from '@/composables/useBaseDialog'
import OutlineModify from './OutlineModify.vue'
import { useClipboard } from '@vueuse/core'
import Api from '@/api'

interface OutlineGenerationProps {
  data?: string
  novelId?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<OutlineGenerationProps>(), {
  data: '',
  novelId: -1,
  disabled: true
})

const emit = defineEmits<{
  (e: 'done', content: string): void
  (e: 'update', content: string): void
  (e: 'confirm', content: string): void
}>()

const injectScrollElemToBottom = inject(provideScrollElemToBottom, null)

const { copy, copied, isSupported } = useClipboard({
  legacy: true
})

const mutual = reactive({
  generate: false
})

const { openDialog, closeDialog } = useBaseDialog()

const outlineContent = ref(props.data)

const esp = ref<EventSourcePolyfill | null>(null)

const outlineModifyRef = ref<InstanceType<typeof OutlineModify> | null>(null)

// 生成大纲内容
const generateOutlineContent = () => {

  if (mutual.generate) return

  if ((props.novelId < 0)) {
    showToast('背景生成参数不足')
    return
  }

  esp.value?.close()

  mutual.generate = true

  outlineContent.value = ''

  const apiUrl = import.meta.env.VITE_APP_API_URL.replace(/\/$/, '')

  const url = `${apiUrl}/novel/generate/outline?novel_id=${props.novelId}&message_id=1`

  esp.value = new EventSourcePolyfill(url)

  esp.value.addEventListener('message', (message) => {
    outlineContent.value += JSON.parse(message.data).content
  })

  esp.value.addEventListener('error', () => {
    saveOutlineContent(props.novelId, outlineContent.value)
    emit('done', outlineContent.value)
    esp.value?.close()
    esp.value = null
    mutual.generate = false
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
      generateOutlineContent()
    },
  })
}

// 保存大纲内容
const saveOutlineContent = (novelId: number, content: string) => {
  Api.novel.editNovelContent({
    novel_id: novelId,
    content,
    type: 3
  })
}

// 编辑
const handleEditOutlineClick = () => {

  openDialog({
    title: '编辑大纲',
    message: () => h(OutlineModify, {
      ref: outlineModifyRef,
      data: outlineContent.value
    }),
    onConfirm: async () => {
      if (!outlineModifyRef.value?.isVacancy()) {
        showToast('请输入完整内容')
        return
      }
      const content = outlineModifyRef.value?.getContent() || ''
      outlineContent.value = content
      emit('update', outlineContent.value)
      closeDialog()
    }
  })
}

const handleConfirmClick = () => {
  saveOutlineContent(props.novelId, outlineContent.value)
  emit('confirm', outlineContent.value)
}

// 复制内容
const handleCopyClick = async () => {
  await copy(outlineContent.value)
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
    generateOutlineContent()
  }
})

onBeforeUnmount(() => {
  esp.value?.close()
})

</script>
<template>
  <div class="rounded-md bg-white p-3 text-sm shadow-sm">
    <div class="flex items-center justify-between">
      <span>大纲生成</span>
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
      v-show="!isRealEmpty(outlineContent)"
      class="mt-2 whitespace-pre-wrap rounded bg-neutral-100 p-2 text-justify text-sm"
    >
      {{ outlineContent }}
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
      <div class="flex items-center gap-x-2">
        <Button
          size="small"
          round
          type="default"
          @click="handleEditOutlineClick"
        >
          &nbsp;&nbsp;&nbsp;编辑大纲&nbsp;&nbsp;&nbsp;
        </Button>
        <Button
          type="primary"
          round
          size="small"
          @click="handleConfirmClick"
        >
          &nbsp;&nbsp;立即生成小说&nbsp;&nbsp;
        </Button>
      </div>
    </div>
  </div>
</template>
<style></style>
