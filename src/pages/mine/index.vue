<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import BaseNav from '@/components/BaseNav/index.vue'
import { useBaseDialog } from '@/composables/useBaseDialog'
import { Image, CellGroup, Cell, Button, showToast } from 'vant'
import { router } from '@/router'
import Api, { UserRewardInfo } from '@/api'
import { isEmpty } from 'lodash'
import { storeUser } from '@/store/user'
import { numberThousand } from '@/utils//format'

interface VipStatus {
  color: string;
  value: string;
}

const userStore = storeUser()

const { openDialog, closeDialog } = useBaseDialog()

// 佣金信息
const userRewardInfoData = ref<UserRewardInfo>({
  invited_users: 0,
  rate: '0%',
  rewards_remain: 0,
  withdraw: 0,
  withdraw_in_review: 0
})

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

// 会员开通状态
const userVipStatus = computed(() => {
  return vipStatusMap[userStore.userInfo.is_vip] || vipStatusMap.default
})

// 小说总数
const chatTotal = computed(() => {
  const { gpt_tokens, gpt_tokens_used } = userStore.userInfo
  return numberThousand((gpt_tokens - gpt_tokens_used)) || 0
})

// 绘图总数
const drawTotal = computed(() => {
  const { dallE3_total, dallE3_times_used, mj_total, mj_times_used } = userStore.userInfo
  return numberThousand((dallE3_total + mj_total) - (dallE3_times_used + mj_times_used)) || 0
})

// 获取用户信息
const getUserInfoData = async () => {
  const res = await Api.user.getUserInfo()
  userStore.modifyUserInfo(res.data)
}

// 获取用户佣金信息
const getUserRewardInfoData = async () => {
  const res = await Api.user.getUserRewardInfo()
  userRewardInfoData.value = res.data
}

// 退出登录
const handleSignOutClick = () => {
  openDialog({
    message: '是否退出登录?',
    onConfirm: async () => {
      const res = await Api.user.signOut()
      if(res.code === 0){
        showToast('退出成功!')
      }
      closeDialog()
      router.replace('/sign-in')
      userStore.cleanAll()
    }
  })
}

onMounted(() => {
  if (userStore.token) {
    getUserInfoData()
    getUserRewardInfoData()
  }
})

</script>
<template>
  <div class="h-full bg-[#f6f6f6]">
    <div class="bg-gradient-to-b from-[#545670] to-[#363852]">
      <BaseNav class="text-white" />
      <div class="p-4">
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
          <div class="ml-3 flex flex-col truncate text-white">
            <div class="my-1 truncate">
              <span
                v-if="isEmpty(userStore.userInfo)"
                class="text-xl active:text-neutral-400"
                @click="router.push('/sign-in')"
              >立即登录</span>
              <span
                v-else
                class="text-xl"
              >{{ userStore.userInfo.nickname }}</span>
            </div>
            <div class="flex items-center">
              <span
                v-if="(!isEmpty(userStore.userInfo))"
                class="mr-1.5 rounded px-1 py-[0.075rem] text-ss"
                :class="userVipStatus.color"
              >{{ userVipStatus.value }}</span>
              <span
                v-if="(isEmpty(userStore.userInfo))"
                class="truncate text-sm text-neutral-300"
              >登陆体验更多创作功能</span>
              <span
                v-else
                class="truncate text-sm text-neutral-300"
              >小说:&nbsp;{{ chatTotal }}次&nbsp;&nbsp;绘图:&nbsp;{{
                drawTotal
              }}次</span>
            </div>
          </div>
        </div>
        <div class="mt-6 grid grid-cols-2 space-x-3">
          <div class="flex-1 items-center rounded-2xl bg-white p-3.5 active:bg-neutral-200">
            <div class="flex items-center">
              <span class="font-bold">购买套餐</span>
              <span class="ml-1">
                <Icon
                  icon="icons8:chevron-right-round"
                  class="text-lg text-neutral-500"
                />
              </span>
            </div>
            <div class="mt-0.5 flex items-center justify-between">
              <span class="text-ss text-neutral-400">开通会员纵享不限量生成</span>
              <span>
                <Icon
                  icon="mingcute:vip-2-fill"
                  class="text-sm text-neutral-500"
                />
              </span>
            </div>
          </div>
          <div class="flex-1 items-center rounded-2xl bg-white p-3.5 active:bg-neutral-200">
            <div class="flex items-center">
              <span class="font-bold">加入社<span class="text-red-400">群</span></span>
              <span class="ml-1">
                <Icon
                  icon="icons8:chevron-right-round"
                  class="text-lg text-neutral-500"
                />
              </span>
            </div>
            <div class="mt-0.5 flex items-center justify-between">
              <span class="text-ss text-neutral-400">领取三天免费试用</span>
              <span>
                <Icon
                  icon="ic:baseline-wechat"
                  class="text-neutral-500"
                />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="py-4">
      <CellGroup inset>
        <Cell
          size="large"
          title="当前剩余佣金"
        >
          <template #label>
            <div class="font-bold text-neutral-700">
              <span class="text-lg">￥</span>
              <span class="text-2xl">{{ userRewardInfoData.rewards_remain }}</span>
            </div>
          </template>
        </Cell>
        <Cell
          size="large"
          title="已注册人数"
          :value="`${userRewardInfoData.invited_users}人`"
        />
        <Cell
          size="large"
          title="佣金比例"
          :value="userRewardInfoData.rate"
        />
        <Cell
          size="large"
          title="确认中的佣金"
          :value="`￥${userRewardInfoData.withdraw_in_review}`"
        />
        <Cell
          size="large"
          title="累计获得佣金"
          :value="`￥${userRewardInfoData.withdraw}`"
        />
      </CellGroup>
    </div>
    <div class="px-4 pt-2">
      <Button
        v-if="userStore.token"
        block
        plain
        type="danger"
        class="!border-none"
        @click="handleSignOutClick"
      >
        退出登录
      </Button>
    </div>
  </div>
</template>
<style>
.van-cell-group.van-cell-group--inset {
  @apply shadow-sm py-1.5
}
</style>
