<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { CellGroup, Cell, Button, showToast } from 'vant'
import BaseNav from '@/components/BaseNav/index.vue'
import UserBaseInfo from '@/components/UserBaseInfo/index.vue'
import { useBaseDialog } from '@/composables/useBaseDialog'
import { router } from '@/router'
import Api, { UserRewardInfo } from '@/api'
import { storeUser } from '@/store/user'

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

// 获取用户佣金信息
const getUserRewardInfoData = async () => {
  const res = await Api.user.getUserRewardInfo()
  userRewardInfoData.value = res.data
}

// 购买套餐点击
const handleBuyPackageClick = async () => {
  router.push('/client/buy-package')
}

// 退出登录
const handleSignOutClick = () => {
  openDialog({
    message: '是否退出登录?',
    onConfirm: async () => {
      const res = await Api.user.signOut()
      if (res.code === 0) {
        showToast('退出成功!')
        closeDialog()
        router.replace('/sign-in')
      }
      userStore.cleanAll()
    }
  })
}

onMounted(() => {
  if (userStore.token) {
    getUserRewardInfoData()
  }
})

</script>
<template>
  <div class="h-full bg-[#f6f6f6]">
    <div class="bg-gradient-to-b from-[#545670] to-[#363852]">
      <BaseNav class="text-white" />
      <div class="p-4">
        <UserBaseInfo />
        <div class="mt-6 grid grid-cols-2 gap-x-3">
          <div
            class="flex-1 items-center rounded-2xl bg-white p-3.5 active:bg-neutral-200"
            @click="handleBuyPackageClick"
          >
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
