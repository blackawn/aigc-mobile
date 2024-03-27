<script setup lang="ts">
import { ref, watchEffect, provide } from 'vue'
import { Popup } from 'vant'
import { Icon } from '@iconify/vue'
import BaseNav from '@/components/BaseNav/index.vue'
import { useRoute } from 'vue-router'
import { provideIncreaseRouterCount } from '@/provide'
import HistoryChat from './component/HistoryChat.vue'
import { router } from '@/router'
import { storeMutual } from '@/store/mutual'

const route = useRoute()

const routeName = ref('')

const showPopup = ref(false)

const routerCount = ref(0)

const historyChatRef = ref<InstanceType<typeof HistoryChat> | null>(null)

const mutualStore = storeMutual()

const handleHistoryClick = () => {
  showPopup.value = true
}

const handleMineClick = () => {
  router.push('/client/mine')
}

const onPopupOpened = () => {
  historyChatRef.value?.getNovelHistoryListData()
}

const onPopupClosed = () => {
  mutualStore.modifyNovelContentSelected(false)
}

const onHistoryChatClose = () => {
  showPopup.value = false
}

const increaseRouterCount = () => {
  routerCount.value += 1
}

watchEffect(() => {
  if (route.path) {
    routerCount.value += 1
  }
})

watchEffect(() => {
  routeName.value = route.name as string
})

watchEffect(() => {
  if (mutualStore.novelContentSelected) {
    handleHistoryClick()
  }
})
provide(provideIncreaseRouterCount, increaseRouterCount)

</script>
<template>
  <div class="flex h-full flex-col">
    <BaseNav
      class="shadow-sm"
      @click-left="handleHistoryClick()"
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
    <div class="relative flex-1 overflow-hidden">
      <RouterView v-slot="{ Component, route: rt }">
        <Transition :name="String(rt.meta.transition)">
          <component
            :is="Component"
            :key="routerCount"
          />
        </Transition>
      </RouterView>
    </div>
    <Popup
      v-model:show="showPopup"
      position="left"
      :style="{ width: '80%', height: '100%' }"
      teleport="body"
      @opened="onPopupOpened"
      @closed="onPopupClosed"
    >
      <HistoryChat
        ref="historyChatRef"
        @close="onHistoryChatClose"
      />
    </Popup>
  </div>
</template>
<style scoped></style>
