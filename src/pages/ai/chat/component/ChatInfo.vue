<script setup lang="ts">
import { withDefaults } from 'vue'
import { DialogData } from './types'
import { onMounted } from 'vue'

export interface ChatDialogProps {
  data?: DialogData
}

const props = withDefaults(defineProps<ChatDialogProps>(), {
  data: () => ({
    role: 'gpt',
    content: '',
    time: '',
    type: 'theme'
  })
})

</script>
<template>
  <div
    class="w-max max-w-[80vw] rounded-md p-3"
    :class="{
      'bg-white': props.data.role === 'gpt',
      'self-end bg-primary/10': props.data.role === 'user',
    }"
  >
    <div class="whitespace-pre-wrap text-justify text-sm">
      {{ props.data.content }}
    </div>
    <slot />
  </div>
</template>
<style></style>
