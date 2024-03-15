<script setup lang="ts">
import { ref } from 'vue'

interface TempGenerationProps {
  title?: string
}

const props = withDefaults(defineProps<TempGenerationProps>(), {
  title: ''
})

const tempElemRef = ref<HTMLDivElement | null>(null)

defineExpose({
  elRef: tempElemRef
})
</script>
<template>
  <div class="rounded-md bg-white p-3 text-sm shadow-sm">
    <div class="mb-2">
      <span>{{ props.title }}</span>
    </div>
    <div
      ref="tempElemRef"
      class="whitespace-pre-wrap text-justify text-sm"
    />
  </div>
</template>
<style></style>
