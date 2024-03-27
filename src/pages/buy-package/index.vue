<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Divider } from 'vant'
import BaseNav from '@/components/BaseNav/index.vue'
import UserBaseInfo from '@/components/UserBaseInfo/index.vue'
import Api, { Package } from '@/api'
import { numberThousand } from '@/utils/format'
import { isRealEmpty } from '@/utils/is'
import { gsap } from 'gsap'
import { hq } from '@/utils/pay'

const buyPackageList = ref<Array<Package>>([])

const selectPackage = ref(-1)

const settlementPrice = computed(() => (buyPackageList.value[selectPackage.value]?.price || 0))
const settlementOffer = computed(() => Number(buyPackageList.value[selectPackage.value]?.price || 0)
  - Number(buyPackageList.value[selectPackage.value]?.original_price || 0))

const getBuyPackageListData = async () => {
  const res = await Api.user.getBuyPackageList()
  buyPackageList.value = res.data
}

const handlePackageClick = (index: number) => {
  selectPackage.value = index === selectPackage.value ? -1 : index
}

const handleBuyClick = () => {
  hq()
}

const onBeforeEnter = (el: any) => {
  gsap.to(el, {
    translateX: (el.dataset.index % 2 === 0 ? -1 : 1) * 200 + '%',
    duration: 0
  })
}

const onEnter = (el: any, done: () => void) => {
  gsap.to(el, {
    translateX: 0,
    delay: el.dataset.index * 0.1,
    onComplete: done,
    clearProps: 'all'
  })
}

onMounted(() => {
  getBuyPackageListData()
})

</script>
<template>
  <div class="flex h-full flex-col overflow-hidden bg-[#EFF3FE]">
    <BaseNav>
      <template #title>
        <span>购买套餐</span>
      </template>
    </BaseNav>
    <div class="flex h-full flex-col overflow-x-hidden">
      <div class="p-4">
        <UserBaseInfo text-color="black" />
      </div>
      <div class="flex-1 rounded-t-3xl bg-white pt-4">
        <div class="px-4">
          <div class="flex items-center gap-x-2 pl-2">
            <div class="h-4 w-2 rounded-sm bg-primary" />
            <span>会员套餐</span>
          </div>
          <div class="mt-4 grid grid-cols-2 gap-4 px-2">
            <TransitionGroup
              @before-enter="onBeforeEnter"
              @enter="onEnter"
            >
              <div
                v-for="(item, index) in buyPackageList"
                :key="item.id"
                :data-index="index"
                class="custom-shadow flex flex-col overflow-hidden rounded-2xl bg-white text-sm text-neutral-500"
                :class="{
                  'outline outline-2 outline-primary/80': (selectPackage === index)
                }"
                @click="handlePackageClick(index)"
              >
                <div class="flex flex-1 flex-col gap-y-1 px-4 py-2.5">
                  <div>
                    <span class="text-base font-bold text-neutral-600">{{ item.vip_name }}</span>
                    <span class="ml-1 text-primary"><span>￥</span><span class="text-xl">{{ numberThousand(item.price)
                    }}</span>
                    </span>
                  </div>
                  <Divider class="!my-0" />
                  <div>
                    <span>gtp-3.5：</span>
                    <span>{{ item.gpt3_tokens_text }}</span>
                  </div>
                  <Divider class="!my-0" />
                  <div>
                    <span>gtp-4.0：</span>
                    <span>{{ item.gpt4_tokens_text }}</span>
                  </div>
                  <Divider class="!my-0" />
                  <div>
                    <span>MJ绘图：</span>
                    <span>{{ item.mj_times_text }}</span>
                  </div>
                  <Divider class="!my-0" />
                  <div>
                    <span>有效期：</span>
                    <span>{{ item.time }}</span>
                  </div>
                </div>
                <div class="bg-primary/80 py-1.5 text-center text-xs text-white">
                  立省￥{{ (Number(item.price) - Number(item.original_price)) }}
                </div>
              </div>
            </TransitionGroup>
          </div>
        </div>
        <div
          v-show="!isRealEmpty(buyPackageList)"
          class="mb-40 mt-12 px-4"
        >
          <div class="flex items-center gap-x-2 pl-2">
            <div class="h-4 w-2 rounded-sm bg-primary" />
            <span>功能对比</span>
          </div>
          <div class="custom-shadow relative mt-4 overflow-x-auto rounded-xl">
            <table class="w-full text-sm text-gray-500">
              <thead class="bg-gray-50 text-gray-700">
                <tr>
                  <th
                    scope="col"
                    class="px-6 py-3"
                  >
                    功能
                  </th>
                  <th
                    scope="col"
                    class="rounded-t-lg bg-gradient-to-r from-[#42ABFD] to-[#3635FC] px-6 py-3 text-white"
                  >
                    会员
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3"
                  >
                    免费版
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr class="odd:bg-white even:bg-gray-50">
                  <th
                    scope="row"
                    class="whitespace-nowrap px-6 py-4 "
                  >
                    小说生成
                  </th>
                  <td class="bg-indigo-50 px-6 py-4 text-primary/85">
                    大模型4.0版
                  </td>
                  <td class="px-6 py-4">
                    大模型3.5版
                  </td>
                </tr>
                <tr class="odd:bg-white even:bg-gray-50">
                  <th
                    scope="row"
                    class="whitespace-nowrap px-6 py-4 "
                  >
                    图片生成
                  </th>
                  <td class="bg-indigo-50 px-6 py-4 text-primary/85">
                    画图效果升级 更多绘图风格
                  </td>
                  <td class="px-6 py-4">
                    体验次数限制 PC
                  </td>
                </tr>
                <tr class="odd:bg-white even:bg-gray-50">
                  <th
                    scope="row"
                    class="whitespace-nowrap px-6 py-4 "
                  >
                    个性化设定
                  </th>
                  <td class="bg-indigo-50 px-6 py-4 text-primary/85">
                    支持
                  </td>
                  <td class="px-6 py-4">
                    无
                  </td>
                </tr>
                <tr class="odd:bg-white even:bg-gray-50">
                  <th
                    scope="row"
                    class="whitespace-nowrap px-6 py-4 "
                  >
                    生成速度
                  </th>
                  <td class="bg-indigo-50 px-6 py-4 text-primary/85">
                    优先生成
                  </td>
                  <td class="px-6 py-4">
                    排队等候
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    class="whitespace-nowrap px-6 py-4 "
                  >
                    图片质量
                  </th>
                  <td class="bg-indigo-50 px-6 py-4 text-primary/85">
                    高质量
                  </td>
                  <td class="px-6 py-4">
                    普通
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <div class="flex items-center bg-white px-4 py-2 shadow">
      <div class="mr-2 flex w-24 shrink-0 flex-col text-center text-primary">
        <span><span class="text-sm">￥</span><span class="text-lg">{{ numberThousand(settlementPrice) }}</span></span>
        <span class="text-xs">已优惠￥{{ settlementOffer }}</span>
      </div>
      <div
        class="flex flex-1 items-center justify-center rounded-md bg-gradient-to-r from-primary/60 to-primary py-2.5 text-white active:from-primary active:to-primary"
        @click="handleBuyClick"
      >
        立即购买
      </div>
    </div>
  </div>
</template>
<style>
.custom-shadow {
  box-shadow: 0 2px 8px 1px rgba(0, 0, 0, 0.1);
}
</style>
