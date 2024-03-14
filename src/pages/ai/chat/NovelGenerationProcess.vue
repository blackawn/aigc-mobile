<script setup lang="ts">
import { ref } from 'vue'

import type { DialogData } from './component/types'
import ChatInfo from './component/ChatInfo.vue'
import ChatInfoMutual from './component/ChatInfoMutual.vue'
import BackgroundGeneration from './component/BackgroundGeneration.vue'
import RoleGeneration from './component/RoleGeneration.vue'
import OutlineInfo from './component/OutlineInfo.vue'
import { watchEffect } from 'vue'

interface NovelGenerationProcessDialogProps {
  data?: Array<DialogData>
}

const props = withDefaults(defineProps<NovelGenerationProcessDialogProps>(), {
  data: () => []
})

const novelGenerationProcessDialogData = ref<Array<DialogData>>(props.data)

watchEffect(() => {
  novelGenerationProcessDialogData.value = props.data
})

</script>
<template>
  <div class="flex flex-col gap-y-5">
    <template
      v-for="(dialog, i) in novelGenerationProcessDialogData"
      :key="i"
    >
      <ChatInfoMutual
        v-if="(['theme', 'background', 'backgroundAnswer', 'plot', 'writingStyle'].includes(dialog.type) && dialog.role === 'gpt')"
        :data="dialog"
      />
      <ChatInfo
        v-else-if="(['theme', 'backgroundAnswer', 'plot', 'writingStyle'].includes(dialog.type))"
        :data="dialog"
      />
      <BackgroundGeneration
        v-else-if="(dialog.type === 'backgroundGeneration')"
        :data="dialog.content"
      />
      <RoleGeneration v-else-if="(dialog.type === 'role')" />
      <OutlineInfo v-else-if="(dialog.type === 'summary')" />
    </template>
  </div>
</template>
<style></style>
