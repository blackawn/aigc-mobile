<script setup lang="ts">
import { NavBar, NavBarProps } from 'vant'
import { Icon } from '@iconify/vue'
import { router } from '@/router'

interface NavBarEvent {
  onClickLeft: () => void
  onClickRight: () => void
}

const props = withDefaults(defineProps<Partial<NavBarProps & NavBarEvent>>(), {
  placeholder: true,
  border: false,
  onClickLeft: () => router.back(),
  onClickRight: () => router.push('/client')
})

</script>
<template>
  <NavBar
    v-bind="props"
    @click-left="props.onClickLeft"
    @click-right="props.onClickRight"
  >
    <template #left>
      <slot name="left">
        <Icon
          icon="fluent:chevron-left-32-filled"
          class="text-2xl"
        />
      </slot>
    </template>
    <template #title>
      <slot name="title" />
    </template>
    <template #right>
      <slot name="right">
        <Icon
          icon="codicon:home"
          class="text-2xl"
        />
      </slot>
    </template>
  </NavBar>
</template>
<style>
.van-nav-bar__left,
.van-nav-bar__right{
  @apply active:text-neutral-500
}
</style>
