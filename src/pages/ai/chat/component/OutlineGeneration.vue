<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { Icon } from '@iconify/vue'
import { Button, showToast } from 'vant'
import { isEmpty } from 'lodash'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { useBaseDialog } from '@/composables/useBaseDialog'
import { watchEffect } from 'vue'
import { compile } from 'vue'
import { computed } from 'vue'

interface OutlineGenerationProps {
  data?: string
  novelId?: number
}

const props = withDefaults(defineProps<OutlineGenerationProps>(),{
  data: '',
  novelId: -1
})

const emit = defineEmits<{
  (e: 'confirm'): void
}>()

const mutual = reactive({
  connect: false
})
const { openDialog } = useBaseDialog()

const outlineContent = ref(props.data)


const outlineList = computed(()=>{
  return outlineContent.value.match(/第\d+章[\s\S]*?(?=第\d+章|$)/g) || []
})

const esp = ref<EventSourcePolyfill | null>(null)

const generateOutlineContent = ()=>{

  if ((props.novelId < 0)) {
    showToast('背景生成参数不足')
    return
  }

  esp.value?.close()

  mutual.connect = true

  outlineContent.value = ''

  const url = `${import.meta.env.VITE_APP_API_URL.replace(/\/$/, '')}/novel/generate/outline?novel_id=${props.novelId}&message_id=1`

  esp.value = new EventSourcePolyfill(url)

  esp.value.addEventListener('message', (message) => {
    outlineContent.value += JSON.parse(message.data).content
  })

  esp.value.addEventListener('error', () => {
    esp.value?.close()
    esp.value = null
    mutual.connect = false
  })
}

const handleAfreshClick = ()=>{
  openDialog({
    message: '确定重新生成?',
    onConfirm() {
      generateOutlineContent()
    },
  })
}

const handleConfirmClick = ()=>{
  // emit('confirm')
}

onMounted(()=>{
  generateOutlineContent()
})

</script>
<template>
  <div class="rounded-md bg-white p-3 text-sm shadow-sm">
    <div class="mb-2">
      <span>大纲生成</span>
    </div>
    <div
      class="mt-2 whitespace-pre-wrap rounded bg-neutral-100 p-2 text-justify text-sm"
    >
      {{ outlineContent }}
    </div>
    <div
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
        >
          &nbsp;&nbsp;&nbsp;编辑大纲&nbsp;&nbsp;&nbsp;
        </Button>
        <Button
          type="primary"
          round
          size="small"
          @click="handleConfirmClick"
        >
          &nbsp;&nbsp;&nbsp;&nbsp;立即生成小说&nbsp;&nbsp;&nbsp;&nbsp;
        </Button>
      </div>
    </div>
  </div>
</template>
<style>
</style>
