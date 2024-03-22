<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Api, { SegmentImagesTask } from '@/api'
import { Image, Loading, showImagePreview } from 'vant'
import { Icon } from '@iconify/vue'
import { isRealEmpty } from '@/utils/is'
import { computed } from 'vue'

interface ImagesManageProps {
  segmentId: number
  novelId: number
}

const props = withDefaults(defineProps<ImagesManageProps>(), {
  segmentId: -1,
  novelId: -1
})

const imageResize = import.meta.env.VITE_APP_IMAGE_RESIZE

const selected = ref(-1)

const drawResultTasList = ref<Array<SegmentImagesTask>>([])

const imageList = computed(() => {
  return drawResultTasList.value.map((item) => (item.imageUrl))
})

const imageSelected = computed(() => imageList.value[selected.value])

const getDrawResultTasListData = async () => {

  if ((props.novelId < 0) || (props.segmentId < 0)) return

  const res = await Api.draw.getSegmentImagesTasList({
    segment_id: props.segmentId,
    novel_id: props.novelId
  })

  drawResultTasList.value = res.data.list
}

const handleImageSelect = (index: number) => {
  selected.value = (index === selected.value ? -1 : index)
}

const handleIImagePreview = (index: number) => {

  const imagePreviewList = imageList.value
    .filter((item) => !isRealEmpty(item))
    .map((d) => (`${d}${imageResize}`))

  showImagePreview({
    images: imagePreviewList,
    startPosition: (selected.value === -1 ? 0 : index),
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
        'outline outline-2 outline-offset-2 outline-primary': (selected === index)
      }"
      @click="handleImageSelect(index)"
    >
      <Image
        v-if="!isRealEmpty(item.imageUrl)"
        class="size-full"
        :src="`${item.imageUrl}${imageResize}`"
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
        class="absolute right-2 top-2 rounded-md bg-black/35 p-1.5 text-white active:text-neutral-400"
        @click.stop="handleIImagePreview(index)"
      >
        <Icon icon="grommet-icons:view" />
      </div>
    </div>
  </div>
</template>
<style></style>
