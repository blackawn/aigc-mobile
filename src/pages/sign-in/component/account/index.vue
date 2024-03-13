<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Button, showToast, Field, Form } from 'vant'
import { Icon } from '@iconify/vue'
import IconPhone from '@/assets/icon/phone.svg'
import IconPassword from '@/assets/icon/password.svg'
import { storeUser } from '@/store/user'
import { router } from '@/router'
import Api, { AccountPasswordSignInParams } from '@/api'

const emit = defineEmits<{
  (e: 'toggle'): void
}>()

const userStore = storeUser()

const mutual = reactive({
  signIn: false
})

const form = reactive<AccountPasswordSignInParams>({
  name: '',
  password: '',
  type: 1
})

// 登录
const handleSignInClick = async () => {

  mutual.signIn = true

  const res = await Api.user.accountPasswordSignIn(form).finally(() => mutual.signIn = false)
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
      <span class="text-3xl">账号密码登录</span>
      <span class="mt-2 text-xs text-neutral-400">请使用已注册的账号密码</span>
    </div>
    <div class="pb-10">
      <Form
        autocomplete="off"
        @submit="handleSignInClick"
      >
        <Field
          v-model="form.name"
          placeholder="请输入手机号"
          size="large"
          :label-width="'fit-content'"
          clearable
          label-class="flex"
          :rules="[{ required: true, message: '请输入用手机号' }]"
        >
          <template #left-icon>
            <IconPhone />
          </template>
          <template #label>
            <div class="flex items-center pl-2">
              <span class="text-sm">+86</span>
              <span class="ml-1">
                <Icon icon="solar:alt-arrow-down-outline" />
              </span>
            </div>
          </template>
        </Field>
        <Field
          v-model="form.password"
          placeholder="请输入密码"
          type="password"
          size="large"
          :label-width="'fit-content'"
          clearable
          label-class="flex"
          :rules="[{ required: true, message: '请输入密码' }]"
        >
          <template #left-icon>
            <IconPassword />
          </template>
          <template #label />
          <template #right-icon>
            <Button
              round
              plain
              type="default"
              size="small"
              class="!px-4 !text-neutral-500"
            >
              找回密码
            </Button>
          </template>
        </Field>

        <div class="mt-12 px-4">
          <Button
            block
            round
            type="primary"
            class="text-base"
            :disabled="(mutual.signIn)"
            :loading="mutual.signIn"
            native-type="submit"
          >
            登&nbsp;&nbsp;录
          </Button>
        </div>
      </Form>
      <div class="mt-8 text-center">
        <span
          class="text-sm text-primary active:!text-neutral-400"
          @click="emit('toggle')"
        >使用验证码登录/注册</span>
      </div>
    </div>
    <div class="flex justify-center gap-x-6">
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
