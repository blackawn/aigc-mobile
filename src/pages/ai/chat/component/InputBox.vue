<script setup lang="ts">
import { ref, inject } from 'vue'
import { Icon } from '@iconify/vue'
import { showToast } from 'vant'
import { isRealEmpty } from '@/utils/is'
import { provideIncreaseRouterCount } from '@/provide'
import { router } from '@/router'

interface InputBoxProps {
  disabled?: boolean
}

const props = withDefaults(defineProps<InputBoxProps>(), {
  disabled: false
})

const value = ref('')

const injectIncreaseRouterCount = inject(provideIncreaseRouterCount, null)

const emit = defineEmits<{
  (e: 'send', value: string): void
}>()

const send = () => {

  if (isRealEmpty(value.value.trim())) {
    showToast('请输入有效内容')
    return
  }

  emit('send', value.value)
  value.value = ''
}

const onSend = (event: KeyboardEvent) => {
  event.preventDefault()
  send()
}

const handleNewChatClick = () => {

  const path = '/client/ai/chat'
  if (router.currentRoute.value.path !== path) {
    router.push(path)
  }
  injectIncreaseRouterCount?.()
}

</script>
<template>
  <div class="flex items-center bg-neutral-50 py-2.5 shadow-md">
    <div
      class="flex px-4 py-1.5 active:text-neutral-400"
      @click="handleNewChatClick"
    >
      <Icon
        icon="oui:ml-create-single-metric-job"
        class="text-xl"
      />
    </div>
    <div
      class="flex-1 rounded-md bg-neutral-200/50 px-2 py-1"
      :class="{
        'pointer-events-none': props.disabled
      }"
    >
      <div class="relative flex-1 overflow-hidden">
        <textarea
          v-model="value"
          class="absolute left-0 top-0 m-0 inline-block size-full min-w-0 resize-none whitespace-pre-wrap break-words bg-transparent p-0 align-bottom"
          rows="1"
          @input="e => value = (e.target as HTMLInputElement).value"
          @keydown.enter="onSend"
        />
        <div
          class="pointer-events-none invisible static m-0 inline-block size-full max-h-24 min-h-6 resize-none overflow-hidden whitespace-pre-wrap break-words p-0 align-bottom"
        >
          {{ value }}
        </div>
      </div>
    </div>
    <div
      class="flex px-4 py-1.5 active:text-neutral-400"
      :class="{
        'pointer-events-none': props.disabled
      }"
      @click="send"
    >
      <Icon
        icon="streamline:send-email"
        class="text-lg"
        :class="{
          'text-primary': !props.disabled
        }"
      />
    </div>
  </div>
</template>
<style></style>
