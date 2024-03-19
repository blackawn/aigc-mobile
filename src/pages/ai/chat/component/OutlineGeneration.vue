<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { Icon } from '@iconify/vue'
import { Button, showToast } from 'vant'
import { isEmpty } from 'lodash'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { useBaseDialog } from '@/composables/useBaseDialog'
import OutlineModify from './OutlineModify.vue'
import { watchEffect } from 'vue'
import { h } from 'vue'

interface OutlineGenerationProps {
  data?: string
  novelId?: number
}

const props = withDefaults(defineProps<OutlineGenerationProps>(), {
  data: '',
  novelId: -1
})

const emit = defineEmits<{
  (e: 'edit-confirm', content: string): void
  (e: 'confirm', content: string): void
}>()

const mutual = reactive({
  generate: false
})
const { openDialog, closeDialog } = useBaseDialog()

const outlineContent = ref(props.data)

const esp = ref<EventSourcePolyfill | null>(null)

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
    esp.value?.close()
    esp.value = null
    mutual.generate = false
  })
}

const handleAfreshClick = () => {
  openDialog({
    message: '确定重新生成?',
    onConfirm() {
      generateOutlineContent()
    },
  })
}

const handleEditOutlineClick = () => {

  const outlineModifyRef = ref<InstanceType<typeof OutlineModify> | null>(null)

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
      emit('edit-confirm', content)
      closeDialog()
    }
  })
}

const handleConfirmClick = () => {
  emit('confirm', outlineContent.value)
}

onMounted(() => {
  if (isEmpty(props.data)) {
    generateOutlineContent()
  }
})

watchEffect(() => {
  if (!isEmpty(props.data)) {
    outlineContent.value = props.data
  }
})

</script>
<template>
  <div class="rounded-md bg-white p-3 text-sm shadow-sm">
    <div class="mb-2">
      <span>大纲生成</span>
    </div>
    <div class="mt-2 whitespace-pre-wrap rounded bg-neutral-100 p-2 text-justify text-sm">
      {{ outlineContent }}
    </div>
    <div
      v-if="(!mutual.generate)"
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
