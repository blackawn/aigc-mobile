<script setup lang="ts">
import { ref, h, watchEffect, onMounted } from 'vue'
import { Button, showToast } from 'vant'
import { useBaseDialog } from '@/composables/useBaseDialog'
import SummaryInfoModify from './SummaryInfoModify.vue'
import Api from '@/api'
import type { SummaryData } from './types'
import { isEmpty } from 'lodash'

interface SummaryInfoProps {
  data?: Array<SummaryData>
  novelId?: number
  allowMutual?: boolean
}

const props = withDefaults(defineProps<SummaryInfoProps>(), {
  data: () => [],
  novelId: -1,
  allowMutual: false
})

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'mounted'): void
}>()

const { openDialog } = useBaseDialog()

const summaryInfoList = ref<Array<SummaryData>>([...props.data])

const handleModifySummaryInfoClick = () => {
  openDialog({
    title: '修改信息',
    message: () => h(SummaryInfoModify)
  })
}

const handleConfirmSummaryInfoClick = async () => {

  if (props.novelId < 0) {
    showToast('缺少参数')
    return
  }

  let content = ''
  props.data.forEach((item) => {
    content += `${item.title}：${item.content}`
  })

  const res = await Api.novel.editNovelContent({
    novel_id: props.novelId,
    content,
    type: 8
  })

  if (res.code === 0) {
    emit('confirm')
  }
}

watchEffect(() => {
  summaryInfoList.value = [...props.data]
})

onMounted(()=>{
  emit('mounted')
})
</script>
<template>
  <div class="rounded-md bg-white p-2.5 text-sm shadow-sm">
    <div class="mb-2">
      <span>好的！根据我们之前的对话，汇总得到以下：</span>
    </div>
    <div class="mt-0.5 flex flex-col gap-y-2">
      <div
        v-for="(item, index) in summaryInfoList"
        :key="index"
        class="text-justify"
      >
        <span>{{ item.title }}:&nbsp;</span><span class="rounded bg-neutral-200 px-1">{{ item.content }}</span>
      </div>
    </div>
    <div
      v-if="props.allowMutual"
      class="mt-3 flex items-center justify-between"
    >
      <span class="text-primary">是否确定生成小说大纲？</span>
      <div class="flex items-center gap-x-2">
        <Button
          size="small"
          round
          type="default"
          @click="handleModifySummaryInfoClick"
        >
          &nbsp;&nbsp;&nbsp;修改&nbsp;&nbsp;&nbsp;
        </Button>
        <Button
          size="small"
          round
          type="primary"
          @click="handleConfirmSummaryInfoClick"
        >
          &nbsp;&nbsp;&nbsp;生成&nbsp;&nbsp;&nbsp;
        </Button>
      </div>
    </div>
  </div>
</template>
<style></style>
