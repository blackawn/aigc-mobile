<script setup lang="ts">
import { ref } from 'vue'
import BaseNav from '@/components/BaseNav/index.vue'

import SignInAccount from './component/account/index.vue'
import SignInVerify from './component/verify/index.vue'

type SignInModeType = 'phone' | 'account' 

const signInMode = ref<SignInModeType>('phone')

</script>
<template>
  <div class="flex h-screen flex-col">
    <BaseNav />
    <div class="flex-1 p-4">
      <SignInVerify
        v-show="signInMode === 'phone'"
        @toggle="signInMode = 'account'"
      />
      <SignInAccount
        v-show="signInMode === 'account'"
        @toggle="signInMode = 'phone'"
      />
    </div>
  </div>
</template>
<style>
</style>
