<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Api, { SegmentImagesTask } from '@/api'
import { Image, Loading, showImagePreview } from 'vant'
import { Icon } from '@iconify/vue'
import { isRealEmpty } from '@/utils/is'

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

const getDrawResultTasListData = async () => {

  if ((props.novelId < 0) || (props.segmentId < 0)) return

  const res = await Api.draw.getSegmentImagesTasList({
    segment_id: props.segmentId,
    novel_id: props.novelId
  })

  drawResultTasList.value = res.data.list
}

const handleImageSelect = (index: number) => {
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

defineExpose({
  imageSelected
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
      class="relative overflow-hidden rounded-md"
      :class="{
        'min-h-20 outline outline-2 outline-offset-2 outline-primary': (select === index)
      }"
      @click="handleImageSelect(index)"
    >
      <Image
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
