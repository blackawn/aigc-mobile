<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { Image } from 'vant'
import { router } from '@/router'
import Api from '@/api'
import { isRealEmpty } from '@/utils/is'
import { storeUser } from '@/store/user'
import { numberThousand } from '@/utils//format'

interface VipStatus {
  color: string;
  value: string;
}

interface UserBaseInfoProps {
  textColor?: 'white' | 'black'
}

const props = withDefaults(defineProps<UserBaseInfoProps>(), {
  textColor: 'white'
})

const userStore = storeUser()

// 会员信息
const vipStatusMap: Record<string, VipStatus> = {
  0: {
    color: 'bg-neutral-500',
    value: '未开通'
  },
  1: {
    color: 'bg-green-500',
    value: '付费'
  },
  default: {
    color: 'bg-red-500',
    value: '过期'
  }
}

const { gpt_tokens, gpt_tokens_used, dallE3_total, dallE3_times_used, mj_total, mj_times_used } = userStore.userInfo

// 会员开通状态
const userVipStatus = computed(() => {
  return vipStatusMap[userStore.userInfo.is_vip] || vipStatusMap.default
})

// 小说总数
const chatTotal = computed(() => {
  return numberThousand((gpt_tokens - gpt_tokens_used)) || 0
})

// MJ绘图总数
const drawMJTotal = computed(() => {
  return numberThousand(mj_total - mj_times_used) || 0
})

// DALL绘图总数
const drawDALLTotal = computed(() => {
  return numberThousand(dallE3_total - dallE3_times_used) || 0
})

// 获取用户信息
const getUserInfoData = async () => {
  const res = await Api.user.getUserInfo()
  userStore.modifyUserInfo(res.data)
}

// 立即登录
const handleSignClick = () => {
  router.push('/sign-in')
}

onMounted(() => {
  if (userStore.token) {
    getUserInfoData()
  }
})

</script>
<template>
  <div class="ml-2 flex">
    <div class="flex items-center justify-center place-self-start rounded-full border-2 border-neutral-300">
      <Image
        width="64"
        height="64"
        round
        :src="userStore.userInfo.avatar"
      >
        <template #loading />
        <template #error>
          加载失败
        </template>
      </Image>
    </div>
    <div
      class="ml-3 flex flex-col truncate"
      :class="{
        'text-white': (props.textColor === 'white'),
      }"
    >
      <div class="my-1 truncate">
        <span
          v-if="isRealEmpty(userStore.userInfo)"
          class="text-xl active:text-neutral-400"
          @click="handleSignClick"
        >立即登录</span>
        <span
          v-else
          class="text-xl"
        >{{ userStore.userInfo.nickname }}</span>
      </div>
      <div class="flex items-center text-wrap">
        <!-- <span
          v-if="(!isRealEmpty(userStore.userInfo))"
          class="mr-1.5 rounded px-1 py-[0.075rem] text-ss text-white"
          :class="userVipStatus.color"
        >{{ userVipStatus.value }}</span> -->
        <span
          v-if="(isRealEmpty(userStore.userInfo))"
          class="truncate text-sm"
          :class="{
            'text-neutral-300': (props.textColor === 'white')
          }"
        >登陆体验更多创作功能</span>
        <span
          v-else
          class="text-sm"
          :class="{
            'text-neutral-300': (props.textColor === 'white'),
            'text-neutral-500': (props.textColor === 'black')
          }"
        >小说:&nbsp;{{ chatTotal }}次&nbsp;&nbsp;MJ绘图:&nbsp;{{
          drawMJTotal
        }}次&nbsp;&nbsp;DALL绘图:&nbsp;{{
          drawDALLTotal
        }}次</span>
      </div>
    </div>
  </div>
</template>
<style></style>
