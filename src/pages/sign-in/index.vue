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
    <div class="relative flex-1">
      <Transition name="fade">
        <div
          v-if="signInMode === 'phone'"
          class="size-full p-4"
        >
          <SignInVerify
           
            @toggle="signInMode = 'account'"
          />
        </div>
        <div
          v-else
          class="size-full p-4"
        >
          <SignInAccount
            
            @toggle="signInMode = 'phone'"
          />
        </div>
      </Transition>
    </div>
  </div>
</template>
<style>
.fade-enter-active,
.fade-leave-active {
  @apply duration-200 absolute
}

.fade-enter-active{
  @apply delay-300
}

.fade-leave-to,
.fade-enter-from{
  @apply opacity-0 scale-75
}

.fade-leave-from,
.fade-enter-to{
 @apply opacity-100 scale-100
}
</style>
