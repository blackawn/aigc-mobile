<script setup lang="ts">
import { computed, ref, h, onMounted } from 'vue'
import { Button, showToast } from 'vant'
import { useBaseDialog } from '@/composables/useBaseDialog'
import BackgroundSetting, { type BackgroundSettingData } from './BackgroundSetting.vue'
import { isEmpty } from 'lodash'
import { Icon } from '@iconify/vue'

export interface BackgroundGenerationProps {
  data?: string
  allowMutual?: boolean
}

const props = withDefaults(defineProps<BackgroundGenerationProps>(), {
  data: '',
  allowMutual: false
})

const emit = defineEmits<{
  (e: 'backgroundSelect'): void
  (e: 'afresh'): void
  (e: 'confirm', content: string): void
  (e: 'render', el: HTMLDivElement): void
}>()

const { openDialog, closeDialog } = useBaseDialog()

const tempElemRef = ref<HTMLDivElement | null>(null)

const selected = ref(-1)

const backgroundSettingInst = ref<InstanceType<typeof BackgroundSetting> | null>(null)

const handleSelectBackgroundClick = (index: number) => {

  if (!props.allowMutual) return

  selected.value = selected.value === index ? -1 : index
  emit('backgroundSelect')
}

const backgroundList = computed<Array<BackgroundSettingData>>(() => {

  let storiesArray = []

  // 分割
  let regex = /故事背景\d+：\n时间：([^\n]+)\n地点：([^\n]+)\n背景：([^\n]+)(?=\n\n|$)/g
  let matches

  while ((matches = regex.exec(props.data)) !== null) {
    let [, time, addr, background] = matches
    storiesArray.push({
      title: matches[0].split('：')[0],
      time: time.trim(),
      address: addr.trim(),
      background: background.trim()
    })
  }
  return storiesArray
})

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

const handleConfirmClick = () => {

  if (selected.value < 0) {
    showToast('请选择背景!')
    return
  }

  openDialog({
    title: '背景设定',
    message: () => h(BackgroundSetting, {
      data: backgroundList.value[selected.value],
      ref: backgroundSettingInst
    }),

    onConfirm() {
      emit('confirm', (backgroundSettingInst.value?.content || ''))
    }
  })

}

onMounted(()=>{
  emit('render', (tempElemRef.value as HTMLDivElement))
})

</script>
<template>
  <div class="rounded-md bg-white p-3 text-sm shadow-sm">
    <div class="mb-2">
      <span>你想选择以下哪个片段作为小说的背景？</span>
    </div>
    <div class="flex flex-col gap-y-2">
      <div
        v-for="(item, index) in backgroundList"
        :key="item.title"
        class="rounded bg-neutral-100 p-2 text-sm"
        :class="{
          'outline outline-primary': (selected === index)
        }"
        @click="handleSelectBackgroundClick(index)"
      >
        <div>
          <span>{{ item.title }}</span>
        </div>
        <div class="mt-0.5">
          <div>
            <span>时间:&nbsp;</span><span>{{ item.time }}</span>
          </div>
          <div>
            <span>地点:&nbsp;</span><span>{{ item.address }}</span>
          </div>
          <div class="text-justify">
            <span>背景:&nbsp;</span><span>{{ item.background }}</span>
          </div>
        </div>
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
