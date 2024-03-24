<script setup lang="ts">
import { ref, provide, reactive } from 'vue'
import DrawInfo from './DrawInfo.vue'
import DrawResult from './DrawResult.vue'
import Api, { GetSegmentDetailRes } from '@/api'
import { provideDrawResultDetail } from '@/provide'
import { onMounted } from 'vue'

export interface DrawConfig {
  style: number
  size: string
  engine: number
}

const drawResultDetail = ref<GetSegmentDetailRes>({
  content: '',
  list: []
})

const novelId = ref(2013)

const toggleDrawInterface = ref(true)

const drawConfig = ref<DrawConfig>({
  style: 58,
  size: '1:1',
  engine: 1,
})

const drawInfoRef = ref<InstanceType<typeof DrawInfo> | null>(null)

const getDrawResultDetailListData = async () => {
  const res = await Api.draw.getSegmentDetail(novelId.value)
  drawResultDetail.value.content = res.data.content
  drawResultDetail.value.list = res.data.list
}

const getDrawConfig = (config: DrawConfig) => {
  drawConfig.value = config
}

provide(provideDrawResultDetail, drawResultDetail)

onMounted(() => {
  getDrawResultDetailListData()
})

</script>
<template>
  <div class="flex h-full flex-col bg-neutral-100">
    <div
      ref="scrollElem"
      class="flex-1 overflow-x-hidden"
    >
      <DrawInfo
        v-show="toggleDrawInterface"
        ref="drawInfoRef"
        v-model:toggle="toggleDrawInterface"
        @config="getDrawConfig"
      />
      <DrawResult
        v-if="!toggleDrawInterface"
        v-model:toggle="toggleDrawInterface"
        :config="drawConfig"
        :novel-id="novelId"
      />
    </div>
  </div>
</template>
<style></style>
