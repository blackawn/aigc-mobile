<script setup lang="ts">
import { ref, h } from 'vue'
import { Button } from 'vant'
import { Icon } from '@iconify/vue'
import { useBaseDialog } from '@/composables/useBaseDialog'
import OutlineInfoModify from './OutlineInfoModify.vue'

const { openDialog } = useBaseDialog()

const handleModifyOutlineInfoClick = () => {
  openDialog({
    title: '修改大纲',
    message: () => h(OutlineInfoModify)
  })
}

</script>
<template>
  <div class="rounded-md bg-white p-2.5 shadow-sm">
    <div class="mb-2 mt-1">
      <span class="text-orange-500">好的！根据我们之前的对话，汇总得到以下：</span>
    </div>
    <div class="mt-0.5 flex flex-col gap-y-2">
      <div class="text-justify">
        <span>小说题材:&nbsp;</span><span class="rounded bg-neutral-200 px-1">武侠古典</span>
      </div>
      <div class="text-justify">
        <span>背景设定:&nbsp;</span><span
          class="rounded bg-neutral-200 px-1"
        >时间：两派大战后的百年和平时期；地点：尼亚索斯世界，中心的辉煌帝国首都格兰塞尔；背景：魔力的稀释、双子王子王子王</span>
      </div>
      <div class="text-justify">
        <span>角色:&nbsp;</span><span class="rounded bg-neutral-200 px-1">姓名：张力；性别：男；年龄：青少年；角色特征：聪明机智；</span>
      </div>
      <div class="text-justify">
        <span>情节:&nbsp;</span><span class="rounded bg-neutral-200 px-1">舍生取义,巧用技能,邪道能力</span>
      </div>
      <div class="text-justify">
        <span>文风:&nbsp;</span><span class="rounded bg-neutral-200 px-1">马克吐温幽默风</span>
      </div>
    </div>
    <div class="mt-3 flex items-center justify-between">
      <span class="text-orange-500">是否确定生成小说大纲？</span>
      <div class="flex items-center gap-x-2">
        <Button
          size="small"
          round
          type="primary"
          @click="handleModifyOutlineInfoClick"
        >
          &nbsp;&nbsp;&nbsp;修改&nbsp;&nbsp;&nbsp;
        </Button>
        <Button
          size="small"
          round
          type="success"
        >
          &nbsp;&nbsp;&nbsp;生成&nbsp;&nbsp;&nbsp;
        </Button>
      </div>
    </div>
  </div>
</template>
<style></style>
