<script setup lang="ts">
import { ref, withDefaults } from 'vue'
import { DialogType } from './types'
import { Button,ButtonProps } from 'vant'
import { isEmpty } from 'lodash'

export interface ChatDialogProps {
  data?: DialogType
  buttonProps?: Partial<ButtonProps>
}

const props = withDefaults(defineProps<ChatDialogProps>(), {
  data: () => ({
    role: 'gtp',
    content: '',
    time: '',
    type: 'theme'
  })
})

const emit = defineEmits<{
  (e: 'button', value: string): void
}>()

</script>
<template>
  <div
    class="w-max max-w-[80vw] rounded-md p-2.5"
    :class="{
      'bg-white': props.data.role === 'gtp',
      'self-end bg-primary/10': props.data.role === 'user',
    }"
  >
    <div
      class="text-justify text-sm"
      v-html="props.data.content"
    />
    <div
      v-if="!isEmpty(props.data.mutual)"
      class="mt-2 flex flex-wrap gap-1"
    >
      <div
        v-for="item in props.data.mutual?.buttonList"
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
  </div>
</template>
<style></style>
