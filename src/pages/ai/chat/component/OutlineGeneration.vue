<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { Button } from 'vant'
import { isEmpty } from 'lodash'

interface OutlineGenerationProps {
  data?: string
  allowMutual?: boolean
}

const props = withDefaults(defineProps<OutlineGenerationProps>(),{
  data: '',
  allowMutual: false
})

const emit = defineEmits<{
  (e: 'afresh'): void
  (e: 'confirm'): void
  (e: 'mount', el: HTMLDivElement): void
}>()

const tempElemRef = ref<HTMLDivElement | null>(null)

const handleAfreshClick = ()=>{
  emit('afresh')
}

const handleConfirmClick = ()=>{
  emit('confirm')
}

onMounted(() => {
  emit('mount', (tempElemRef.value as HTMLDivElement))
})

</script>
<template>
  <div class="rounded-md bg-white p-3 text-sm shadow-sm">
    <div class="mb-2">
      <span>大纲生成</span>
    </div>
    <div
      class="whitespace-pre-wrap rounded bg-neutral-100 p-2 text-justify text-sm"
    >
      {{ props.data }}
    </div>
    <div
      v-show="isEmpty(props.data)"
      ref="tempElemRef"
      class="whitespace-pre-wrap rounded bg-neutral-100 p-2 text-justify text-sm"
    />
    <div
      v-if="props.allowMutual"
      class="mt-3 flex justify-between"
    >
      <div
        class="mr-2 flex shrink-0 items-center px-2 text-primary active:text-neutral-400"
        @click="handleAfreshClick"
      >
        <Icon
          icon="tabler:refresh"
          class="text-xl"
        />
        <span class="ml-2 text-sm">重新生成</span>
      </div>
      <Button
        type="primary"
        round
        size="small"
        @click="handleConfirmClick"
      >
        &nbsp;&nbsp;&nbsp;&nbsp;立即生成小说&nbsp;&nbsp;&nbsp;&nbsp;
      </Button>
    </div>
  </div>
</template>
<style>
</style>
