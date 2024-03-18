<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { DialogData, DialogType } from './types'
import ChatInfo from './ChatInfo.vue'
import { Button, ButtonProps, showToast } from 'vant'
import { isEmpty, isString } from 'lodash'

export interface ChatDialogProps {
  data?: DialogData,
  buttonProps?: Partial<ButtonProps>
}

type MutualButtonMap = {
  [key in DialogType]: Array<string>
}

const props = withDefaults(defineProps<ChatDialogProps>(), {
  data: () => ({
    role: 'gpt',
    content: '',
    time: '',
    type: 'theme'
  })
})

const emit = defineEmits<{
  (e: 'confirm', data: Pick<DialogData, 'type' | 'content'>): void
}>()

const mutualButtonMap: MutualButtonMap = {
  plot: ['轻取珍宝', '谈笑风生', '隐藏身份', '舍生取义', '巧用技能', '巧解危机', '邪道能力', '古怪伙伴', '王道信念', '转危为机', '严肃搞笑', '赢人一点', '女神暗恋', '劫富济贫'],
} as MutualButtonMap

const selectList = ref<Array<string>>([])

const handleButtonSelectClick = (value: string) => {
  const isExistIndex = selectList.value.findIndex((item: string) => item === value)

  if (isExistIndex !== -1) {
    selectList.value.splice(isExistIndex, 1)
  } else if (selectList.value.length >= 5) {
    showToast('最多选5个')
  } else {
    selectList.value.push(value)
  }
}

const handleConfirmPlotClick = () => {
  if (isEmpty(selectList.value)) {
    showToast('请选择内容')
    return
  }
  const content = selectList.value.join('，')
  emit('confirm', {
    type: props.data.type,
    content
  })
}

</script>
<template>
  <ChatInfo
    v-if="mutualButtonMap[props.data.type]"
    :data="props.data"
  >
    <div class="flex flex-col">
      <div class="mt-2 flex flex-wrap gap-1">
        <div
          v-for="item in mutualButtonMap[props.data.type]"
          :key="item"
        >
          <Button
            v-bind="props.buttonProps"
            size="small"
            :type="(selectList.includes(item) ? 'primary' : 'default')"
            @click="handleButtonSelectClick(item)"
          >
            {{ item }}
          </Button>
        </div>
      </div>
      <div
        v-if="!props.buttonProps?.disabled"
        class="mt-1 flex justify-end"
      >
        <Button
          round
          size="small"
          type="primary"
          @click="handleConfirmPlotClick"
        >
          &nbsp;&nbsp;确定&nbsp;&nbsp;
        </Button>
      </div>
    </div>
  </ChatInfo>
</template>
<style></style>
