<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Button, showToast } from 'vant'
import { Icon } from '@iconify/vue'
import IconPhone from '@/assets/icon/phone.svg'
import IconVerifyCode from '@/assets/icon/verify_code.svg'
import { storeUser } from '@/store/user'
import { router } from '@/router'
import Api, { PhoneVerifyCodeSignInParams } from '@/api'
import { useCountdown } from '@/composables/useCountdown'
import { isEmpty } from 'lodash'

const emits = defineEmits<{
  toggle: [void]
}>()

const userStore = storeUser()

const { start, isActive, count } = useCountdown()

const mutual = reactive({
  signIn: false,
  getCode: false
})

const form = reactive<PhoneVerifyCodeSignInParams>({
  name: '',
  code: '',
  type: 2
})

// 发送手机验证码
const handleSendVerifyCode = async () => {

  mutual.getCode = true

  const res = await Api.user.sendVerifyCode({
    phone: form.name,
    type: 2
  }).finally(() => mutual.getCode = false)

  console.log(res)
  if (res.code === 0) {
    start()
    showToast('发送成功！请注意接收')
  }

}

// 登录
const handleSignInClick = async () => {

  mutual.signIn = true
  
  const res = await Api.user.phoneVerifyCodeSignIn(form).finally(() => mutual.signIn = false)

  if (res.code === 0) {

    showToast('登录成功!')
    userStore.modifyUserInfo(res.data)
    userStore.modifyToken(res.data.token)
    router.replace('/client/ai')

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
              v-model="form.name"
              type="text"
              maxlength="11"
              placeholder="请输入手机号"
              class="w-full placeholder:text-sm placeholder:text-[#C8C9CC]"
              @input="e => form.name = (e.target as HTMLInputElement).value.replace(/\D/g, '')"
            >
          </div>
        </div>
        <div class="mt-4 flex items-center border-b border-neutral-300 py-3">
          <IconVerifyCode />
          <div class="flex-1 px-3">
            <input
              v-model="form.code"
              type="text"
              placeholder="请输入验证码"
              maxlength="6"
              class="w-full placeholder:text-sm placeholder:text-[#C8C9CC]"
              @input="e => form.code = (e.target as HTMLInputElement).value.replace(/\D/g, '')"
            >
          </div>
          <Button
            round
            type="primary"
            size="small"
            class="!px-4"
            :disabled="(isActive || mutual.getCode || isEmpty(form.name))"
            @click="handleSendVerifyCode"
          >
            {{ isActive ? `重新获取${count}秒` : '获取验证码' }}
          </Button>
        </div>
      </div>
      <div class="mt-12">
        <Button
          block
          round
          type="primary"
          class="text-base"
          :disabled="(mutual.signIn || !form.name || !form.code)"
          :loading="mutual.signIn"
          @click="handleSignInClick"
        >
          登&nbsp;&nbsp;录
        </Button>
      </div>
      <div class="mt-8 text-center">
        <span
          class="text-sm text-primary active:!text-neutral-400"
          @click="emits('toggle')"
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
