<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { router } from '@/router'
import BaseNav from '@/components/BaseNav/index.vue'

const route = useRoute()

const routeName = ref('')

const handleHistoryClick = () => {

}

const handleMineClick = () => {
  router.push('/client/mine')
}

watchEffect(() => {
  routeName.value = route.name as string
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
      <RouterView />
    </div>
  </div>
</template>
<style></style>
