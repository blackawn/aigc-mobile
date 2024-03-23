<script setup lang="ts">
import { withDefaults } from 'vue'
import { DialogData, DialogType } from './types'
import ChatInfo from './ChatInfo.vue'
import { Button, ButtonProps } from 'vant'
import { storeConfig } from '@/store/config'
import { sample } from 'lodash'

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
  (e: 'button', data: Pick<DialogData, 'type' | 'content'>): void
}>()

const configStore = storeConfig()

const theme = configStore.configList.filter((t) => (t.type === 1)).map((item) => item.name)
const plot = configStore.configList.filter((t) => (t.type === 4)).map((item) => item.name)
const writingStyle = configStore.configList.filter((t) => (t.type === 5)).map((item) => item.name)

const mutualButtonMap: MutualButtonMap = {
  guide: ['小说生成', '小说续写', '小说扩写'],
  theme,
  plot,
  writingStyle,
  expandWriteGuide: ['情节扩写', '人物扩写', '场景扩写', '冲突扩写'],
} as MutualButtonMap

const handleButtonClick = (content: string) => {

  if((props.data.type === 'theme') && (content === '随机盲盒')){
    const randomList = mutualButtonMap[props.data.type].filter((item)=> item !== '随机盲盒')
    content = sample(randomList) as string
  }

  emit('button', {
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
    <div class="mt-2 flex flex-wrap gap-1">
      <div
        v-for="item in mutualButtonMap[props.data.type]"
        :key="item"
      >
        <Button
          v-bind="props.buttonProps"
          size="small"
          @click="handleButtonClick(item)"
        >
          {{ item }}
        </Button>
      </div>
    </div>
  </ChatInfo>
</template>
<style></style>
