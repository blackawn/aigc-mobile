<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Button, showToast } from 'vant'

import { Icon } from '@iconify/vue'

import IconPhone from '@/assets/icon/phone.svg'
import IconVerifyCode from '@/assets/icon/verify_code.svg'


import Api from '@/api'

const emit = defineEmits<{
  toggle: [void]
}>()

const form = reactive({
  phone: '',
  verifyCode: ''
})

const handleSendVerifyCode = async () => {
  const res = await Api.user.sendVerifyCode({
    phone: form.phone,
    type: '2'
  })
  console.log(res)
  if (res.code === 0) {
    showToast('发送成功！请注意接收')
  }
}

</script>
<template>
  <div class="flex h-full flex-col justify-between py-16 pt-28">
    <div class="flex flex-col items-center">
      <span class="text-3xl">验证码登录/注册</span>
      <span class="mt-2 text-xs text-neutral-400">未注册的手机号将自动注册并登录</span>
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
              v-model="form.phone"
              type="text"
              placeholder="请输入手机号"
              class="w-full placeholder:text-sm placeholder:text-[#C8C9CC]"
              @input="e => form.phone = (e.target as HTMLInputElement).value.replace(/\D/g, '')"
            >
          </div>
        </div>
        <div class="mt-4 flex items-center border-b border-neutral-300 py-3">
          <IconVerifyCode />
          <div class="flex-1 px-3">
            <input
              v-model="form.verifyCode"
              type="text"
              placeholder="请输入验证码"
              maxlength="6"
              class="w-full placeholder:text-sm placeholder:text-[#C8C9CC]"
              @input="e => form.verifyCode = (e.target as HTMLInputElement).value.replace(/\D/g, '')"
            >
          </div>
          <Button
            round
            type="primary"
            size="small"
            class="!px-4"
            @click="handleSendVerifyCode"
          >
            获取验证码
          </Button>
        </div>
      </div>
      <div class="mt-12">
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
        >使用账号密码登录</span>
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
