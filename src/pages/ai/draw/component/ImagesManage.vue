<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Api, { SegmentImagesTask } from '@/api'
import { Image, Loading, showImagePreview, Circle } from 'vant'
import { Icon } from '@iconify/vue'
import { isRealEmpty } from '@/utils/is'
import { useIntervalFn } from '@vueuse/core'
import { onBeforeMount } from 'vue'
import { onBeforeUnmount } from 'vue'

interface ImagesManageProps {
  segmentId: number
  novelId: number
}

const props = withDefaults(defineProps<ImagesManageProps>(), {
  segmentId: -1,
  novelId: -1
})

const imageUrlResize = import.meta.env.VITE_APP_IMAGE_RESIZE

const select = ref(-1)

const drawResultTasList = ref<Array<SegmentImagesTask>>([])

const imageSelected = computed(() => drawResultTasList.value[select.value]?.imageUrl || '')

const formatDrawProgressValue = (value: string) => ref(parseInt(value))

const { pause, resume, isActive } = useIntervalFn(() => {
  getDrawResultTasListData()
}, 3000)

const getDrawResultTasListData = async () => {

  if ((props.novelId < 0) || (props.segmentId < 0)) return

  const res = await Api.draw.getSegmentImagesTasList({
    segment_id: props.segmentId,
    novel_id: props.novelId
  })

  drawResultTasList.value = res.data.list

  const drawProgress = drawResultTasList.value.filter((flItem) => [2, 3, 4].includes(flItem.status))

  if (isRealEmpty(drawProgress)) {
    console.log('没有任务了')
    pause()
  }
}

const handleImageSelect = (index: number, downloadStatus: number) => {
  if(downloadStatus === 0) return
  select.value = (index === select.value ? -1 : index)
}

const handleImagePreview = (taskId: string) => {

  const filterImagePreviewList = drawResultTasList.value
    .filter((flItem) => !isRealEmpty(flItem.imageUrl))

  const prevIndex = filterImagePreviewList.findIndex((item) => item.task_id === taskId)

  const imagePreviewList = filterImagePreviewList.map((item) => `${item.imageUrl}${imageUrlResize}`)

  showImagePreview({
    images: imagePreviewList,
    startPosition: (select.value === -1 ? 0 : prevIndex),
    closeable: true,
    closeOnClickImage: false
  })
}

onMounted(() => {
  getDrawResultTasListData()
})

onBeforeUnmount(() => {
  pause()
})

defineExpose({
  imageSelected,
  pause
})
</script>
<template>
  <div
    class="grid gap-2 p-2"
    :class="{
      'grid-cols-2': (drawResultTasList.length > 1)
    }"
  >
    <div
      v-for="(item, index) in drawResultTasList"
      :key="item.task_id"
      class="relative flex min-h-32 items-center justify-center overflow-hidden rounded-md"
      :class="{
        'outline outline-2 outline-offset-2 outline-primary': (select === index)
      }"
      @click="handleImageSelect(index, item.download_status)"
    >
      <Image
        v-if="((item.download_status === 1))"
        class="size-full"
        :src="`${item.imageUrl}${imageUrlResize}`"
      >
        <template #loading>
          <Loading
            type="spinner"
            size="20"
          />
        </template>
      </Image>
      <div
        v-else-if="((item.status > 1))"
        class="text-center"
      >
        <div
          v-show="[1, 3, 4].includes(item.status)"
          class="flex items-center justify-center"
        >
          <Circle
            v-show="item.draw_progress"
            v-model:current-rate="formatDrawProgressValue(item.draw_progress).value"
            :rate="100"
            size="54px"
            :speed="100"
            :text="item.draw_progress"
          />
        </div>
        <span
          :class="{
            'text-green-500': (item.status === 1),
            'text-primary': ([2, 3, 4].includes(item.status)),
            'text-orange-500': (item.status === 7),
            'text-red-500': (item.status === 5)
          }"
        >{{ item.status_text }}</span>
      </div>
      <span
        class="absolute bottom-0 left-0 w-full truncate bg-gradient-to-t from-black/90 to-black/5 py-1 text-center text-xs text-white"
      >{{
        item.action }}</span>
      <div
        v-show="!isRealEmpty(item.imageUrl)"
        class="absolute right-2 top-2 rounded-md bg-black/35 p-1.5 text-white active:text-neutral-400"
        @click.stop="handleImagePreview(item.task_id)"
      >
        <Icon icon="grommet-icons:view" />
      </div>
    </div>
  </div>
</template>
<style></style>
