<script setup lang="ts">
import { ref, withDefaults } from 'vue'
import { DialogData, DialogType } from './types'
import ChatInfo from './ChatInfo.vue'
import { Button, ButtonProps } from 'vant'

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
  (e: 'button', value: string): void
}>()

const mutualButtonMap: MutualButtonMap = {
  theme: ['玄幻仙侠', '言情甜宠', '武侠古典', '奇幻异世', '悬疑推理', '科幻未来', '都市生活', '古诗古文'],
  plot: ['轻取珍宝', '谈笑风生', '隐藏身份', '舍生取义', '巧用技能', '巧解危机', '邪道能力', '古怪伙伴', '王道信念', '转危为机', '严肃搞笑', '赢人一点', '女神暗恋', '劫富济贫'],
  writingStyle: ['鲁迅风', '红楼风', '轻小说风', '古文小说风', '金庸武侠风', '马克吐温幽默风', '夏目漱石心理风', '海明威简明严肃风']
} as MutualButtonMap

</script>
<template>
  <ChatInfo :data="props.data">
    <div
      v-if="mutualButtonMap[props.data.type]"
      class="mt-2 flex flex-wrap gap-1"
    >
      <div
        v-for="item in mutualButtonMap[props.data.type]"
        :key="item"
      >
        <Button
          v-bind="props.buttonProps"
          size="small"
          @click="emit('button', item)"
        >
          {{ item }}
        </Button>
      </div>
    </div>
  </ChatInfo>
</template>
<style></style>
