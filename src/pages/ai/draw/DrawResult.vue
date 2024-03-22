<script setup lang="ts">
import { ref, h, onMounted, watchEffect } from 'vue'
import {
  Checkbox,
  CheckboxGroup,
  Divider,
  Popover,
  PopoverAction,
  ImagePreview,
  Image,
  Loading,
  Button,
  Circle,
  Field,
  showImagePreview,
  showToast
} from 'vant'
import Api, { GetSegmentDetailRes, SegmentData } from '@/api'
import { useBaseDialog } from '@/composables/useBaseDialog'
import ImagesManage from './component/ImagesManage.vue'

import { Icon } from '@iconify/vue'
import { isRealEmpty } from '@/utils/is'

interface DrawResultProps {
  data?: Array<SegmentData>
  novelId?: number
}

const props = withDefaults(defineProps<DrawResultProps>(), {
  data: () => [],
  novelId: -1,
})

const emit = defineEmits<{
  (e: 'toggle', value: boolean): void
}>()

const drawResultList = ref(props.data)

const novelId = ref(props.novelId)

const imageResize = import.meta.env.VITE_APP_IMAGE_RESIZE

const { openDialog, closeDialog } = useBaseDialog()

const imageActionsPopover: Array<PopoverAction> = [
  { text: '多图管理', icon: 'ph:images' },
  { text: '重绘', icon: 'mdi:image-refresh-outline' },
  { text: '下载', icon: 'quill:folder-download' },
]

const imagesControlList = ref([
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

// popover菜单点击
const handleImageActionsPopoverClick = (actionIndex: number, segmentId: number, index: number) => {
  switch (actionIndex) {
    case 0:
      handleImageManageClick(segmentId, index)
      break
    case 1:
      break
  }
}

// 多图管理点击
const handleImageManageClick = (segmentId: number, index: number) => {

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

// 分镜图片预览点击
const handleSegmentImagePreviewClick = (index: number) => {

  const imagePreviewList = drawResultList.value
    .filter((item) => !isRealEmpty(item.imageUrl))
    .map((d) => (`${d.imageUrl}${imageResize}`))

  showImagePreview({
    images: imagePreviewList,
    closeable: true,
    startPosition: index,
    closeOnClickImage: false
  })
}

// 返回分镜
const handleToggleGenerateClick = () => {
  emit('toggle', false)
}

watchEffect(() => {
  drawResultList.value = props.data
  novelId.value= props.novelId
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
              <Popover
                :actions="imageActionsPopover"
                placement="bottom-end"
                @select="(_, actionIndex) => handleImageActionsPopoverClick(actionIndex, result.id, itemIndex)"
              >
                <template #reference>
                  <div class="p-0.5 active:text-neutral-400">
                    <Icon icon="mingcute:menu-line" />
                  </div>
                </template>
                <template #action="{ action, index }">
                  <div class="flex size-full flex-col justify-center">
                    <Divider
                      v-if="(index !== 0)"
                      class="!my-0"
                    />
                    <div class="flex flex-1 items-center gap-x-1.5">
                      <Icon
                        :icon="action.icon"
                        class="text-lg"
                      />
                      <span class="text-sm">{{ action.text }}</span>
                    </div>
                  </div>
                </template>
              </Popover>
            </div>
            <div class="mt-2 rounded-md bg-neutral-50 p-3">
              <div @click="handleSegmentImagePreviewClick(itemIndex)">
                <Image
                  class="size-full"
                  :src="`${result.imageUrl}${imageResize}`"
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
                  v-for="contr in imagesControlList"
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
      >
        生成&nbsp;/&nbsp;重绘
      </Button>
    </div>
  </div>
</template>
<style>
.van-popover__action {
  @apply px-3 w-auto h-9
}
</style>
