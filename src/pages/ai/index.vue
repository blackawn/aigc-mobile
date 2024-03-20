<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { Popup } from 'vant'
import { Icon } from '@iconify/vue'
import BaseNav from '@/components/BaseNav/index.vue'
import { useRoute } from 'vue-router'
import HistoryChat from './component/HistoryChat.vue'
import { router } from '@/router'

const route = useRoute()

const routeName = ref('')

const showPopup = ref(false)

const historyChatRef = ref<InstanceType<typeof HistoryChat> | null>(null)

const handleHistoryClick = () => {
  showPopup.value = true
}

const handleMineClick = () => {
  router.push('/client/mine')
}

const handlePopupOpened = () => {
  historyChatRef.value?.getNovelHistoryList()
}

const routerCount = ref(0)

watchEffect(() => {
  
  routeName.value = route.name as string

  if (route.params) {
    routerCount.value += 1
  }
})

</script>
<template>
  <div class="flex h-full flex-col">
    <BaseNav
      @click-left="handleHistoryClick"
      @click-right="handleMineClick"
    >
      <template #left>
        <Icon
          icon="icon-park-outline:history"
          class="text-xl"
        />
      </template>
      <template #title>
        <div class="flex gap-x-2.5">
          <span
            class="px-2 py-1 duration-300"
            :class="{
              'scale-95 text-neutral-400': (routeName !== 'chat')
            }"
            @click="router.push('/client/ai/chat')"
          >小说</span>
          <span
            class="px-2 py-1 duration-300"
            :class="{
              'scale-95 text-neutral-400': (routeName !== 'draw')
            }"
            @click="router.push('/client/ai/draw')"
          >绘图</span>
        </div>
      </template>
      <template #right>
        <Icon
          icon="icon-park-outline:user"
          class="text-xl"
        />
      </template>
    </BaseNav>
    <div class="flex-1 overflow-hidden">
      <RouterView :key="routerCount" />
    </div>
    <Popup
      v-model:show="showPopup"
      position="left"
      :style="{ width: '80%', height: '100%' }"
      teleport="body"
      @opened="handlePopupOpened"
    >
      <HistoryChat
        ref="historyChatRef"
        @record="(showPopup = false)"
      />
    </Popup>
  </div>
</template>
<style></style>
