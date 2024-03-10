<script setup lang="ts">
import { NavBar, Icon } from 'vant'
import { useRoute } from 'vue-router'
import { router } from '@/router'
import BaseNav from '@/components/BaseNav/index.vue'
import AIMenu from '@/components/AIMenu/index.vue'
import IconHistory from '@/assets/icon/history.svg'
import IconUser from '@/assets/icon/user.svg'

const handleHistoryClick = () => {

}

const handleMineClick = () => {
  router.push('/client/mine')
}

</script>
<template>
  <div>
    <BaseNav
      @click-left="handleHistoryClick"
      @click-right="handleMineClick"
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
    </BaseNav>
  </div>
</template>
<style></style>
