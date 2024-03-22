<script setup lang="ts">
import { withDefaults } from 'vue'
import { DialogData, DialogType } from './types'
import ChatInfo from './ChatInfo.vue'
import { Button, ButtonProps } from 'vant'
import { storeConfig } from '@/store/config'

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
  (e: 'mounted'): void
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
          @click="emit('button', {
            type: props.data.type,
            content: item
          })"
        >
          {{ item }}
        </Button>
      </div>
    </div>
  </ChatInfo>
</template>
<style></style>
