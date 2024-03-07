<script setup lang="ts">
import { ref } from 'vue'
import phone from '@/assets/icon/phone.svg'
import VerifyCode from '@/assets/icon/verify_code.svg'
import ArrowDown from '@/assets/icon/arrow_down.svg'
import { Button } from 'vant'
import { reactive } from 'vue'

const form = reactive({
  phone: '',
  verifyCode: ''
})

const onInput = (e: Event) => {

  const value = (e.target as HTMLInputElement).value

  form.verifyCode = value.replace(/\D/g, '')

}

</script>
<template>
  <div class="h-screen overflow-hidden">
    <div class="flex h-full flex-col justify-center px-4">
      <div class="flex flex-col items-center">
        <span class="text-3xl text-black">账号密码登录</span>
        <span class="mt-2 text-xs text-[#969799]">请使用已注册的账号密码</span>
      </div>
      <div class="mt-10">
        <div class="flex items-center border-b border-neutral-300 py-3">
          <phone />
          <div class="flex items-center px-3">
            <span class="text-sm">+86</span>
            <span class="ml-1">
              <ArrowDown />
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
        <div class="mt-4 flex items-center border-b border-neutral-300 py-3">
          <VerifyCode />
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
          >
            获取验证码
          </Button>
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
      <div class="mt-6 text-center">
        <span class="text-sm text-primary">使用账号密码登录</span>
      </div>
    </div>
  </div>
</template>
<style></style>
