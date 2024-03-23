<script setup lang="ts">
import { ref } from 'vue'
import DrawInfo from './DrawInfo.vue'
import DrawResult from './DrawResult.vue'
import Api, { GetSegmentDetailRes } from '@/api'
import { onMounted } from 'vue'

const drawResult = ref<GetSegmentDetailRes>({
  content: '',
  list: []
})

const novelId = ref(1984)

const toggleDrawInterface = ref(false)

const getDrawResultDetailListData = async () => {
  const res = await Api.draw.getSegmentDetail(novelId.value)
  drawResult.value.content = res.data.content
  drawResult.value.list = res.data.list
}

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
        v-if="!toggleDrawInterface"
        :content="drawResult.content"
        :result="(drawResult.list.length > 0)"
        @toggle="(v) => (toggleDrawInterface = v)"
      />
      <DrawResult
        v-else-if="toggleDrawInterface"
        :data="drawResult.list"
        :novel-id="novelId"
        @toggle="(v) => (toggleDrawInterface = v)"
      />
    </div>
  </div>
</template>
<style></style>
