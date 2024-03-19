<script setup lang="ts">
import { computed, ref, h, onMounted, reactive } from 'vue'
import { Button, showToast } from 'vant'
import { useBaseDialog } from '@/composables/useBaseDialog'
import BackgroundModify from './BackgroundModify.vue'
import { isEmpty } from 'lodash'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { Icon } from '@iconify/vue'
import { watchEffect } from 'vue'

export interface BackgroundGenerationProps {
  data?: string
  selected?: number
  novelId?: number
  disabled?: boolean
  keyword?: string
}

const props = withDefaults(defineProps<BackgroundGenerationProps>(), {
  data: '',
  selected: -1,
  novelId: -1,
  keyword: '',
  disabled: true
})

const emit = defineEmits<{
  (e: 'update'): void
  (e: 'confirm', data: { allContent: string, content: string, selected: number }): void
}>()

const { openDialog, closeDialog } = useBaseDialog()

const backgroundContent = ref(props.data)

const backgroundList = computed(() => {
  return backgroundContent.value.split(/(?=故事背景\d+：)/)
})

const esp = ref<EventSourcePolyfill | null>(null)

const selected = ref(props.selected)

const mutual = reactive({
  generate: false
})

// 生成背景
const generateBackground = () => {

  if ((props.novelId < 0) || isEmpty(props.keyword)) {
    showToast('背景生成参数不足')
    return
  }

  esp.value?.close()

  mutual.generate = true

  backgroundContent.value = ''

  const apiUrl = import.meta.env.VITE_APP_API_URL.replace(/\/$/, '')

  const url = `${apiUrl}/novel/generate/background?novel_id=${props.novelId}&content=${props.keyword}`

  esp.value = new EventSourcePolyfill(url)

  esp.value.addEventListener('message', (message) => {
    backgroundContent.value += JSON.parse(message.data).content
    emit('update')
  })

  esp.value.addEventListener('error', () => {
    esp.value?.close()
    esp.value = null
    mutual.generate = false
  })

}

// 选择背景点击
const handleSelectBackgroundClick = (index: number) => {

  // 没有生成行为 和 props.data 没有内容
  if (mutual.generate || props.disabled) return

  selected.value = selected.value === index ? -1 : index
}

// 重新生成
const handleAfreshClick = () => {
  openDialog({
    message: '确定重新生成?',
    onConfirm() {
      selected.value = -1
      generateBackground()
    },
  })

}

// 确定背景
const handleConfirmClick = () => {

  if (selected.value < 0) {
    showToast('请选择背景!')
    return
  }

  const backgroundModifyRef = ref<InstanceType<typeof BackgroundModify> | null>(null)

  openDialog({
    title: '背景设定',
    message: () => h(BackgroundModify, {
      data: backgroundList.value[selected.value],
      ref: backgroundModifyRef
    }),

    onConfirm: async () => {

      if (!backgroundModifyRef.value?.isVacancy()) {
        showToast('请填写完整内容')
        return
      }

      let content = backgroundModifyRef.value?.getContent().titleContent
      if (selected.value !== backgroundList.value.length - 1) {
        content += '\n\n'
      }
      backgroundList.value[selected.value] = content || ''

      emit('confirm', {
        allContent: backgroundList.value.join(''),
        content: backgroundModifyRef.value?.getContent().content || '',
        selected: selected.value
      })
      closeDialog()
    }
  })

}

onMounted(() => {
  if (isEmpty(props.data)) {
    generateBackground()
  }
})

watchEffect(() => {

  if (!isEmpty(props.data)) {
    backgroundContent.value = props.data
  }

  selected.value = props.selected
})

</script>
<template>
  <div class="rounded-md bg-white p-3 text-sm shadow-sm">
    <div>
      <span>你想选择以下哪个片段作为小说的背景？</span>
    </div>
    <div
      v-if="!isEmpty(backgroundList)"
      class="mt-2 flex flex-col gap-y-2"
    >
      <div
        v-for="(item, index) in backgroundList"
        :key="index"
        class="whitespace-pre-wrap rounded bg-neutral-100 p-2 text-justify text-sm "
        :class="{
          'outline outline-primary': (selected === index),
          '!outline-primary/50': props.disabled
        }"
        @click="handleSelectBackgroundClick(index)"
      >
        {{ item.replace(/\n+$/, '') }}
      </div>
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
      <Button
        type="primary"
        round
        size="small"
        @click="handleConfirmClick"
      >
        &nbsp;&nbsp;&nbsp;&nbsp;确认&nbsp;&nbsp;&nbsp;&nbsp;
      </Button>
    </div>
  </div>
</template>
<style></style>
