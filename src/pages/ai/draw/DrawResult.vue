<script setup lang="ts">
import { ref, h, onMounted, watchEffect, inject } from 'vue'
import {
  Divider,
  Popover,
  Image,
  Loading,
  Button,
  Circle,
  showImagePreview,
  showToast,
} from 'vant'
import Api, { GetSegmentDetailRes, SegmentData } from '@/api'
import { provideDrawResultDetail } from '@/provide'
import { useBaseDialog } from '@/composables/useBaseDialog'
import type { DrawConfig } from './index.vue'
import ImagesManage from './component/ImagesManage.vue'

import { Icon } from '@iconify/vue'
import { isRealEmpty } from '@/utils/is'
import { reactive } from 'vue'

interface DrawResultProps {
  novelId?: number
  config?: DrawConfig
}

const props = withDefaults(defineProps<DrawResultProps>(), {
  novelId: -1,
  config: () => ({
    size: '1:1',
    style: 58,
    engine: 1
  })
})

const modelToggle = defineModel('toggle',
  { type: Boolean, default: false }
)

const injectDrawResultDetail = inject(provideDrawResultDetail, null)

const drawResultList = ref<Array<SegmentData>>(injectDrawResultDetail?.value.list || [])

const novelId = ref(props.novelId)

const imageUrlResize = import.meta.env.VITE_APP_IMAGE_RESIZE

const { openDialog, closeDialog } = useBaseDialog()

const imageControlList = ref([
  {
    label: '放大',
    control: [
      {
        text: 'U1'
      },
      {
        text: 'U2'
      },
      {
        text: 'U3'
      },
      {
        text: 'U4'
      }
    ]
  },
  {
    label: '变换',
    control: [
      {
        text: 'V1'
      },
      {
        text: 'V2'
      },
      {
        text: 'V3'
      },
      {
        text: 'V4'
      }
    ]
  }
])

const segmentSelected = ref(false)

const segmentSelectList = ref<Array<number>>([])

// 分镜内容编辑
const handleSegmentContentEditClick = (content: string, index: number) => {

  const value = ref(content)

  openDialog({
    title: '编辑分镜文本',
    message: () => h('textarea', {
      value: value.value,
      maxlength: 3000,
      rows: 6,
      placeholder: '请输入分镜内容',
      class: 'rounded bg-neutral-100 size-full resize-none p-3 whitespace-pre-wrap break-words align-bottom text-sm',
      'onInput': (e) => value.value = (e.target as HTMLTextAreaElement).value
    }),
    onConfirm: async () => {
      if (isRealEmpty(value.value?.trim())) {
        showToast('请输入内容')
        return
      }

      drawResultList.value[index].description = value.value

      const res = await Api.draw.editSegment({
        novel_id: novelId.value,
        ...drawResultList.value[index]
      })

      if (res.code === 0) {
        closeDialog()
      }
    }
  })
}

// 多图管理点击
const handleImagesManageClick = (segmentId: number, index: number) => {

  const imagesManageRef = ref<InstanceType<typeof ImagesManage> | null>(null)

  openDialog({
    title: '选择图片',
    message: () => h(ImagesManage, {
      ref: imagesManageRef,
      novelId: novelId.value,
      segmentId
    }),
    onConfirm: () => {
      const url = imagesManageRef.value?.imageSelected
      if (!isRealEmpty(url)) {
        drawResultList.value[index].imageUrl = url as string
      }
    }
  })
}

// 下载点击
const handleDownImageClick = (index: number, original = false) => {
  let url = drawResultList.value[index].imageUrl
  if (!isRealEmpty(url.trim())) {
    url = original ? `${url}${imageUrlResize}` : url
  }
}

// 分镜图片预览点击
const handleSegmentImagePreviewClick = (index: number) => {

  const imagePreviewList = drawResultList.value
    .filter((item) => !isRealEmpty(item.imageUrl))
    .map((d) => (`${d.imageUrl}${imageUrlResize}`))

  showImagePreview({
    images: imagePreviewList,
    closeable: true,
    startPosition: index,
    closeOnClickImage: false
  })
}

// 返回分镜
const handleToggleGenerateClick = () => {
  modelToggle.value = true
}

// 绘图
const handleActionDrawClick = () => {
  console.log(props.config)
}

watchEffect(() => {
  novelId.value = props.novelId
  drawResultList.value = injectDrawResultDetail?.value.list || []
})

</script>
<template>
  <div class="flex h-full flex-col">
    <div class="flex-1 overflow-x-hidden p-4">
      <div class="flex items-center justify-between">
        <div
          class="flex items-center gap-x-1 active:text-neutral-400"
          @click="handleToggleGenerateClick"
        >
          <Icon
            icon="ph:caret-left"
            class="text-lg"
          />
          <span class="text-sm leading-none">返回分镜</span>
        </div>
        <span class="text-sm text-neutral-500">共{{ drawResultList.length }}条分镜</span>
      </div>

      <div class="mb-40 mt-3 flex flex-col gap-y-4">
        <div
          v-for="(result, itemIndex) in drawResultList"
          :key="result.id"
          class="relative flex flex-col overflow-hidden rounded-md bg-white p-3 shadow-sm"
        >
          <div
            v-show="segmentSelected"
            class="absolute left-0 top-0"
          >
            <div class="absolute -left-4 -top-12 h-28 w-14 rotate-45 bg-pink-400" />
            <span class="absolute left-2 top-1.5 text-white">{{ itemIndex < 9 ? `0${itemIndex + 1}` : itemIndex + 1
            }}</span>
          </div>

          <div>
            <div class="flex items-center justify-between">
              <span class="text-sm">分镜文本</span>
              <div
                class="p-0.5 active:text-neutral-400"
                @click="handleSegmentContentEditClick(result.description, itemIndex)"
              >
                <Icon icon="lucide:edit" />
              </div>
            </div>
            <div class="mt-2 max-h-28 min-h-20 whitespace-pre-wrap rounded-md bg-neutral-50 p-2 text-justify text-sm">
              {{ result.description }}
            </div>
          </div>
          <Divider
            v-show="!isRealEmpty(result.imageUrl)"
            class="!my-3"
          />
          <div v-show="!isRealEmpty(result.imageUrl)">
            <div class="flex items-center justify-between">
              <span class="text-sm">图片生成结果</span>
              <Popover placement="bottom-end">
                <template #reference>
                  <div class="p-0.5 active:text-neutral-400">
                    <Icon icon="mingcute:menu-line" />
                  </div>
                </template>

                <div class="flex flex-col">
                  <div
                    class="flex flex-1 items-center gap-x-1.5 px-3.5 py-2 active:bg-neutral-200"
                    @click="handleImagesManageClick(result.id, itemIndex)"
                  >
                    <Icon
                      icon="ph:images"
                      class="text-lg"
                    />
                    <span class="text-sm">多图管理</span>
                  </div>
                  <Divider class="!my-0" />
                  <div class="flex flex-1 items-center gap-x-1.5 px-3.5 py-2 active:bg-neutral-200">
                    <Icon
                      icon="mdi:image-refresh-outline"
                      class="text-lg"
                    />
                    <span class="text-sm">重绘</span>
                  </div>
                  <Divider class="!my-0" />
                  <div class="flex flex-1 items-center gap-x-1.5 px-3.5 py-2 active:bg-neutral-200">
                    <Icon
                      icon="quill:folder-download"
                      class="text-lg"
                    />
                    <span class="text-sm">下载</span>
                  </div>
                </div>
              </Popover>
            </div>
            <div class="mt-2 rounded-md bg-neutral-50 p-3">
              <div @click="handleSegmentImagePreviewClick(itemIndex)">
                <Image
                  v-lazy="`${result.imageUrl}${imageUrlResize}`"
                  class="size-full"
                  lazy-load
                  :src="`${result.imageUrl}${imageUrlResize}`"
                >
                  <template #loading>
                    <Loading
                      type="spinner"
                      size="20"
                    />
                  </template>
                </Image>
              </div>
              <!-- <div class="flex h-36 items-center justify-center">
                <Circle
                  v-model:current-rate="a"
                  :rate="a"
                  :speed="100"
                  text="加载中"
                />
              </div> -->
            </div>
            <div class="mt-6 flex justify-center">
              <div class="flex flex-col gap-y-3">
                <div
                  v-for="contr in imageControlList"
                  :key="contr.label"
                  class="flex items-center"
                >
                  <span class="text-sm">{{ contr.label }}</span>
                  <div class="ml-3 flex gap-x-3">
                    <span
                      v-for="control in contr.control"
                      :key="control.text"
                      class="rounded-md border px-4 py-1 text-sm"
                    >
                      {{ control.text }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex items-center gap-x-4 bg-white px-4 py-2 shadow">
      <Button
        round
        type="default"
        class="!h-10"
        block
      >
        选择
      </Button>
      <Button
        round
        type="success"
        class="!h-10"
        block
        @click="handleActionDrawClick"
      >
        生成&nbsp;/&nbsp;重绘
      </Button>
    </div>
  </div>
</template>
<style></style>
