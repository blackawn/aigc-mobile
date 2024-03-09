<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useBaseDialog } from '@/composables/useBaseDialog'
import { router } from '@/router'
import { Image, CellGroup, Cell, Button } from 'vant'
import BaseNav from '@/components/BaseNav/index.vue'

const { open } = useBaseDialog()

const handleSignOutClick = () => {
  open({
    message: '是否退出登录?',
    onConfirm: ()=> {
      router.replace('/sign-in')
    }
  })
}

</script>
<template>
  <div class="h-full bg-[#f6f6f6]">
    <div class="bg-gradient-to-b from-[#545670] to-[#363852]">
      <BaseNav class="text-white" />
      <div class="p-4">
        <div class="ml-2 flex">
          <div class="flex items-center justify-center rounded-full border-2 border-white">
            <Image
              width="64"
              height="64"
              round
              src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg"
            />
          </div>
          <div class="ml-3 flex flex-col text-white">
            <div class="my-1 ">
              <span
                class="text-xl"
                @click="router.push('/sign-in')"
              >立即登录</span>
            </div>
            <div class="flex items-center">
              <span class="mr-1.5 rounded bg-neutral-500 px-1 py-0.5 text-ss">免费版</span>
              <span class="text-sm text-neutral-300">登陆体验更多创作功能</span>
            </div>
          </div>
        </div>
        <div class="mt-6 grid grid-cols-2 space-x-3">
          <div class="flex-1 items-center rounded-2xl bg-white p-3.5">
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
          <div class="flex-1 items-center rounded-2xl bg-white p-3.5">
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
              <span class="text-2xl">123.4</span>
            </div>
          </template>
        </Cell>
        <Cell
          size="large"
          title="已注册人数"
          value="4人"
        />
        <Cell
          size="large"
          title="佣金比例"
          value="30%"
        />
        <Cell
          size="large"
          title="确认中的佣金"
          value="￥20"
        />
        <Cell
          size="large"
          title="累计获得佣金"
          value="￥20"
        />
      </CellGroup>
    </div>
    <div class="px-4 pt-2">
      <Button
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
