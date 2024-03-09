<script setup lang="ts">
import { ref,reactive } from 'vue'

import { Button } from 'vant'

import { Icon } from '@iconify/vue'

import IconPhone from '@/assets/icon/phone.svg'
import IconPassword from '@/assets/icon/password.svg'


const emit = defineEmits<{
  toggle: [void]
}>()

const form = reactive({
  phone: '',
  verifyCode: ''
})

</script>
<template>
  <div class="flex h-full flex-col justify-between py-16 pt-28">
    <div class="flex flex-col items-center">
      <span class="text-3xl">账号密码登录</span>
      <span class="mt-2 text-xs text-neutral-400">请使用已注册的账号密码</span>
    </div>
    <div class="pb-10">
      <div>
        <div class="flex items-center border-b border-neutral-300 py-3">
          <IconPhone />
          <div class="flex items-center px-3">
            <span class="text-sm">+86</span>
            <span class="ml-1">
              <Icon icon="solar:alt-arrow-down-outline" />
            </span>
          </div>
          <div class="flex-1">
            <input
              type="text"
              placeholder="请输入手机号"
              class="w-full placeholder:text-sm placeholder:text-[#C8C9CC]"
            >
          </div>
        </div>
        <div class="mt-4 flex items-center space-x-3 border-b border-neutral-300 py-3">
          <IconPassword />
          <div class="flex-1">
            <input
              v-model="form.verifyCode"
              type="password"
              placeholder="请输入密码"
              class="w-full placeholder:text-sm placeholder:text-[#C8C9CC]"
            >
          </div>
          <div class="h-4 w-px bg-neutral-300" />
          <span class="text-sm text-neutral-400">找回密码</span>
        </div>
      </div>
      <div class="mt-16">
        <Button
          block
          round
          type="primary"
          class="text-base"
        >
          登&nbsp;&nbsp;录
        </Button>
      </div>
      <div class="mt-8 text-center">
        <span
          class="text-sm text-primary"
          @click="emit('toggle')"
        >使用验证码登录/注册</span>
      </div>
    </div>
    <div class="flex justify-center space-x-6">
      <div class="flex items-center justify-center rounded-full border border-neutral-300 p-2">
        <Icon
          icon="ic:baseline-wechat"
          class="text-2xl"
        />
      </div>
      <div class="flex items-center justify-center rounded-full border border-neutral-300 p-2">
        <Icon
          icon="ph:device-mobile-camera"
          class="text-2xl"
        />
      </div>
    </div>
  </div>
</template>
<style></style>
