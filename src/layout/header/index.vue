<script setup lang="ts">
import { NavBar, Icon } from 'vant'
import { useRoute } from 'vue-router'
import router from '@/router'
import AIMenu from '@/components/AIMenu/index.vue'
import IconHistory from '@/assets/icon/history.svg'
import IconUser from '@/assets/icon/user.svg'

const route = useRoute()

const leftClick = () => {

}

</script>

<template>
  <NavBar
    left-arrow
    :placeholder="true"
    :border="false"
    @click-left="leftClick"
  >
    <template #left>
      <IconHistory />
    </template>
    <template #title>
      <AIMenu />
    </template>
    <template #right>
      <IconUser />
    </template>
  </NavBar>
</template>

<style>
</style>
