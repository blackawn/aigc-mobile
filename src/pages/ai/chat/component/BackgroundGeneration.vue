<script setup lang="ts">
import { computed, ref, h, onMounted } from 'vue'
import { Button, showToast } from 'vant'
import { useBaseDialog } from '@/composables/useBaseDialog'
import BackgroundSetting, { type BackgroundSettingData } from './BackgroundSetting.vue'
import { isEmpty } from 'lodash'
import { Icon } from '@iconify/vue'

export interface BackgroundGenerationProps {
  data?: string
  selected?: number,
  allowMutual?: boolean
}

const props = withDefaults(defineProps<BackgroundGenerationProps>(), {
  data: '',
  selected: -1,
  allowMutual: false
})

const emit = defineEmits<{
  (e: 'backgroundSelect'): void
  (e: 'afresh'): void
  (e: 'confirm', content: string): void
  (e: 'mount', el: HTMLDivElement): void
}>()

const { openDialog, closeDialog } = useBaseDialog()

const tempElemRef = ref<HTMLDivElement | null>(null)

const selected = ref(props.selected)

// 选择背景点击
const handleSelectBackgroundClick = (index: number) => {

  if (!props.allowMutual) return

  selected.value = selected.value === index ? -1 : index
  emit('backgroundSelect')
}

const backgroundListData = computed(() => {
  return !isEmpty(props.data) ? props.data.split(/(?=故事背景\d+：)/) : []
})

// 重新生成
const handleAfreshClick = () => {
  openDialog({
    message: '确定重新生成?',
    onConfirm() {
      selected.value = -1
      emit('afresh')
      closeDialog()
    },
  })

}

// 确定背景
const handleConfirmClick = () => {

  if (selected.value < 0) {
    showToast('请选择背景!')
    return
  }

  const backgroundSettingInst = ref<InstanceType<typeof BackgroundSetting> | null>(null)

  openDialog({
    title: '背景设定',
    message: () => h(BackgroundSetting, {
      data: backgroundListData.value[selected.value],
      ref: backgroundSettingInst
    }),

    onConfirm() {
      emit('confirm', (backgroundSettingInst.value?.content || ''))
    }
  })

}

onMounted(() => {
  emit('mount', (tempElemRef.value as HTMLDivElement))
})

</script>
<template>
  <div class="rounded-md bg-white p-3 text-sm shadow-sm">
    <div class="mb-2">
      <span>你想选择以下哪个片段作为小说的背景？</span>
    </div>
    <div class="flex flex-col gap-y-2">
      <div
        v-for="(item, index) in backgroundListData"
        :key="index"
        class="whitespace-pre-wrap rounded bg-neutral-100 p-2 text-justify text-sm "
        :class="{
          'outline outline-primary': (selected === index)
        }"
        @click="handleSelectBackgroundClick(index)"
      >
        {{ item.replace(/\n+$/, '') }}
      </div>
    </div>
    <div
      v-show="isEmpty(props.data)"
      ref="tempElemRef"
      class="whitespace-pre-wrap text-justify text-sm"
    />
    <div
      v-if="props.allowMutual"
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
