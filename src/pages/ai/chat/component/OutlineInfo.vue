<script setup lang="ts">
import { ref, h, watchEffect } from 'vue'
import { Button } from 'vant'
import { Icon } from '@iconify/vue'
import { useBaseDialog } from '@/composables/useBaseDialog'
import OutlineInfoModify from './OutlineInfoModify.vue'
import type { SummaryData } from './types'

interface OutlineInfoProps {
  data?: Array<SummaryData>
}

const props = withDefaults(defineProps<OutlineInfoProps>(), {
  data: () => []
})

const { openDialog } = useBaseDialog()

const outlineInfoListData = ref<Array<SummaryData>>(props.data)

const handleModifyOutlineInfoClick = () => {
  openDialog({
    title: '修改大纲',
    message: () => h(OutlineInfoModify)
  })
}

watchEffect(()=>{
  outlineInfoListData.value = props.data
})

</script>
<template>
  <div class="rounded-md bg-white p-2.5 text-sm shadow-sm">
    <div class="mb-2">
      <span>好的！根据我们之前的对话，汇总得到以下：</span>
    </div>
    <div class="mt-0.5 flex flex-col gap-y-2">
      <div
        v-for="(item, index) in outlineInfoListData"
        :key="index"
        class="text-justify"
      >
        <span>{{ item.title }}:&nbsp;</span><span class="rounded bg-neutral-200 px-1">{{ item.content }}</span>
      </div>
    </div>
    <div class="mt-3 flex items-center justify-between">
      <span class="text-pink-500">是否确定生成小说大纲？</span>
      <div class="flex items-center gap-x-2">
        <Button
          size="small"
          round
          type="default"
          @click="handleModifyOutlineInfoClick"
        >
          &nbsp;&nbsp;&nbsp;修改&nbsp;&nbsp;&nbsp;
        </Button>
        <Button
          size="small"
          round
          type="primary"
        >
          &nbsp;&nbsp;&nbsp;生成&nbsp;&nbsp;&nbsp;
        </Button>
      </div>
    </div>
  </div>
</template>
<style></style>
