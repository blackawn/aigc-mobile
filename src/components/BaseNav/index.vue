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
  onClickLeft: () => router.back()
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
          icon="uiw:left"
          class="text-xl"
        />
      </slot>
    </template>
    <template #title>
      <slot name="title" />
    </template>
    <template #right>
      <slot name="right" />
    </template>
  </NavBar>
</template>
<style></style>
