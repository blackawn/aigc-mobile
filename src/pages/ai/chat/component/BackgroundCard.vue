<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button, showToast } from 'vant'
import { useBaseDialog } from '@/composables/useBaseDialog'
import { Icon } from '@iconify/vue'

interface BackgroundCardProps {
  data: string
  allowMutual: boolean
}

interface BackgroundType {
  title: string
  time: string
  address: string
  background: string
}

const props = withDefaults(defineProps<BackgroundCardProps>(), {
  data: '',
  allowMutual: false
})

const emits = defineEmits<{
  backgroundSelect: [void]
  afresh: [void]
  confirm: [data: BackgroundType]
}>()

const { openDialog, closeDialog } = useBaseDialog()

const selected = ref(-1)

const selectBackground = (index: number) => {

  if (!props.allowMutual) return

  selected.value = selected.value === index ? -1 : index
  emits('backgroundSelect')
}

const backgroundList = computed<Array<BackgroundType>>(() => {

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
      emits('afresh')
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
    message: `确定选择 ${backgroundList.value[selected.value].title} ?`,
    onConfirm() {
      emits('confirm', backgroundList.value[selected.value])
      closeDialog()
    },
  })
}

</script>
<template>
  <div class="rounded-md bg-white p-2.5 shadow-sm">
    <h5 class="py-1 text-xl text-primary">
      你想选择以下哪个片段作为小说的背景？
    </h5>
    <div class="mt-2 flex flex-col space-y-2">
      <div
        v-for="(item, index) in backgroundList"
        :key="item.title"
        class="rounded bg-neutral-100 p-2"
        :class="{
          'outline outline-primary': (selected === index)
        }"
        @click="selectBackground(index)"
      >
        <h6 class="text-base">
          {{ item.title }}
        </h6>
        <div class="mt-0.5 text-sm">
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
      v-if="props.allowMutual"
      class="mt-4 flex"
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
        block
        round
        @click="handleConfirmClick"
      >
        确认
      </Button>
    </div>
  </div>
</template>
<style></style>
