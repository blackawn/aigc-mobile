<script setup lang="ts">
import { ref, h, onMounted, watchEffect, inject, computed, onBeforeUnmount, reactive, nextTick } from 'vue'
import {
  CheckboxGroup,
  Checkbox,
  Divider,
  Popover,
  Image,
  Loading,
  Button,
  Circle,
  showImagePreview,
  showToast,
  closeNotify,
  showNotify
} from 'vant'
import Api, { SegmentData } from '@/api'
import { provideDrawResultDetail } from '@/provide'
import { useBaseDialog } from '@/composables/useBaseDialog'
import type { DrawConfig } from './index.vue'
import ImagesManage from './component/ImagesManage.vue'
import { useIntervalFn } from '@vueuse/core'
import { Icon } from '@iconify/vue'
import { router } from '@/router'
import { isRealEmpty } from '@/utils/is'
import { every, some, includes } from 'lodash'

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

const imageUrlResize = import.meta.env.VITE_APP_IMAGE_RESIZE

const drawResultIdList = computed(() => drawResultList.value.map((item) => item.id))

const imageManagePopoverList = ref<Array<boolean>>([])

const { openDialog, closeDialog } = useBaseDialog()

const imageControlList = ref([
  {
    label: '放大',
    control: [
      {
        label: 'U1',
        value: 'U1'
      },
      {
        label: 'U2',
        value: 'U2'
      },
      {
        label: 'U3',
        value: 'U3'
      },
      {
        label: 'U4',
        value: 'U4'
      }
    ]
  },
  {
    label: '变换',
    control: [
      {
        label: 'V1',
        value: 'V1'
      },
      {
        label: 'V2',
        value: 'V2'
      },
      {
        label: 'V3',
        value: 'V3'
      },
      {
        label: 'V4',
        value: 'V4'
      }
    ]
  }
])

const segmentSelected = ref(false)

const segmentSelectedAll = ref(false)

const segmentSelectIndeterminate = ref(true)

const segmentSelectList = ref<Array<number>>([])

const taskIdList = ref<Array<number>>([])

const mutual = reactive({
  action: false
})

const { pause, resume: intervalGetDrawProgressData, isActive } = useIntervalFn(() => {
  getDrawProgressData()
}, 3000, { immediate: false })

const checkAllChange = (val: boolean) => {
  segmentSelectList.value = val ? drawResultIdList.value : []
  segmentSelectIndeterminate.value = false
}

const checkedResultChange = (value: Array<string>) => {
  const checkedCount = value.length
  segmentSelectedAll.value = checkedCount === drawResultIdList.value.length
  segmentSelectIndeterminate.value = checkedCount > 0 && checkedCount < drawResultIdList.value.length
}

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
        novel_id: props.novelId,
        ...drawResultList.value[index]
      })

      if (res.code === 0) {
        closeDialog()
      }
    }
  })
}

// 隐藏悬浮菜单
const hiddenImageManagePopover = () => {
  imageManagePopoverList.value = imageManagePopoverList.value.map(() => false)
}

// 多图管理点击
const handleImagesManageClick = (segmentId: number, index: number) => {

  hiddenImageManagePopover()

  const imagesManageRef = ref<InstanceType<typeof ImagesManage> | null>(null)

  openDialog({
    title: '选择图片',
    message: () => h(ImagesManage, {
      ref: imagesManageRef,
      novelId: props.novelId,
      segmentId
    }),
    onCancel: () => {
      imagesManageRef.value?.pause()
    },
    onConfirm: () => {
      imagesManageRef.value?.pause()
      const url = imagesManageRef.value?.imageSelected
      if (!isRealEmpty(url)) {
        drawResultList.value[index].imageUrl = url as string
      }
    }
  })
}

// 转换 / 重绘点击
const handleTransformDrawClick = async (action: string, segmentId: number, taskId: string | number) => {

  hiddenImageManagePopover()

  const res = await Api.draw.transformDraw({
    action,
    novel_id: props.novelId,
    segment_id: segmentId,
    task_id: taskId,
    type: props.config.engine
  })

  if (res.code === 0) {
    showNotify({
      message: '转换绘图过程时间可能较久，您或可以在多图管理中查看',
      type: 'primary'
    })

    let timer: ReturnType<typeof setInterval> = setInterval(() => {
      getTransformDrawProgressData(action, segmentId, () => {
        clearInterval(timer)
      })
    }, 3000)
  }
}

// 下载点击
const handleDownImageClick = (index: number) => {

  hiddenImageManagePopover()

  let url = drawResultList.value[index].imageUrl

  showNotify({
    message: '长按图片即可保存',
    type: 'primary',
    className: 'custom',
    duration: 0,
    onClick: closeNotify
  })

  showImagePreview({
    images: [url],
    showIndex: false,
    onClose: closeNotify,
    closeOnClickImage: false
  })
}

// 分镜图片预览点击
const handleSegmentImagePreviewClick = (id: number) => {

  const filterImagePreviewList = drawResultList.value
    .filter((flItem) => !isRealEmpty(flItem.imageUrl))

  const prevIndex = filterImagePreviewList.findIndex((item) => item.id === id)

  const imagePreviewList = filterImagePreviewList.map((item) => `${item.imageUrl}${imageUrlResize}`)

  showImagePreview({
    images: imagePreviewList,
    closeable: true,
    startPosition: prevIndex,
    closeOnClickImage: false
  })
}

// 返回分镜
const handleToggleGenerateClick = () => {
  modelToggle.value = true
}

// 生成绘图
const handleActionDrawClick = async () => {

  if (isRealEmpty(segmentSelectList.value)) {
    showToast('请选择分镜!')
    return
  }

  const hasDrawSegment = some(drawResultList.value, item => includes(segmentSelectList.value, item.id) && (item.task_id !== 0))

  if (hasDrawSegment) {
    showToast('存在已有生成任务的脚本，请重新选择')
    return
  }

  pause()

  mutual.action = true

  segmentSelected.value = false

  // 这里要做添加操作，然后去重，用户有可能一个一个的生成配图
  taskIdList.value.push(...segmentSelectList.value)

  taskIdList.value = [...new Set(taskIdList.value)]

  const res = await Api.draw.actionDraw({
    ids: segmentSelectList.value,
    novel_id: props.novelId,
    style_id: props.config.style,
    type: props.config.engine
  }).catch((res) => {

    if (res.code === 10005) {
      setTimeout(() => {
        router.push('/client/buy-package')
      }, 1000)
    }
    return { code: res.code }

  }).finally(() => {

    mutual.action = false
    segmentSelectList.value = []

  })

  if (res.code === 0) {
    showNotify({
      message: '提示！绘图过程时间可能较久，您可以稍后再来查看',
      type: 'primary'
    })

    intervalGetDrawProgressData()
  }
}

// 获取生成配图进度
const getDrawProgressData = async () => {

  if (isRealEmpty(taskIdList.value)) return

  const res = await Api.draw.getDrawProgress({
    ids: taskIdList.value
  })

  res.data.forEach((item) => {
    const index = drawResultList.value.findIndex(result => (result.id === item.id && result.download_status === 0))
    if (index !== -1) {
      Object.assign(drawResultList.value[index], item)
    }
  })

  if (every(res.data, obj => obj.download_status === 1) ||
    every(res.data, obj => obj.status === 5)) {
    pause()
  }
}

// 获取转换绘图进度
const getTransformDrawProgressData = async (action: string, segmentId: number, callback?: () => void) => {

  if (isRealEmpty(action)) return

  const res = await Api.draw.getDrawProgress({
    action,
    ids: [segmentId]
  })

  const index = drawResultList.value.findIndex(result => (result.id === res.data[0].id))
  if (index !== -1) {
    Object.assign(drawResultList.value[index], res.data[0])
  }

  if ((res.data[0].download_status === 1) || (res.data[0].status === 5)) {
    callback?.()
  }

}

const formatDrawProgressValue = (value: string) => ref(parseInt(value))

watchEffect(() => {
  drawResultList.value = injectDrawResultDetail?.value.list || []
  imageManagePopoverList.value = drawResultList.value.map(() => false)
})

onMounted(() => {
  setTimeout(() => {
    nextTick(() => {
      taskIdList.value = drawResultList.value.filter((flItem) => [3].includes(flItem.status)).map((item) => item.id)

      intervalGetDrawProgressData()
    })
  }, 1000)
})

onBeforeUnmount(() => {
  pause()
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
      <CheckboxGroup
        v-model:model-value="segmentSelectList"
        icon-size="24"
        @change="checkedResultChange"
      >
        <div class="mb-40 mt-3 flex flex-col gap-y-4">
          <div
            v-for="(result, itemIndex) in drawResultList"
            :key="result.id"
            class="flex items-center justify-between"
          >
            <div
              class="flex flex-1 flex-col overflow-hidden rounded-md bg-white p-3 shadow-sm"
              :class="{
                'pointer-events-none': segmentSelected
              }"
            >
              <div>
                <div class="flex items-center justify-between">
                  <span class="text-sm">分镜文本</span>
                  <div
                    v-show="([0, 1, 5, 7].includes(result.status))"
                    class="p-0.5 active:text-neutral-400"
                    @click="handleSegmentContentEditClick(result.description, itemIndex)"
                  >
                    <Icon icon="lucide:edit" />
                  </div>
                </div>
                <div
                  class="mt-2 max-h-28 min-h-20 whitespace-pre-wrap rounded-md bg-neutral-50 p-2 text-justify text-sm text-neutral-500"
                >
                  {{ result.description }}
                </div>
              </div>
              <div v-show="((result.download_status === 1 || result.status > 0))">
                <Divider class="!my-3" />
                <div class="flex items-center justify-between">
                  <span class="text-sm">图片生成结果</span>
                  <Popover
                    v-model:show="imageManagePopoverList[itemIndex]"
                    placement="bottom-end"
                  >
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
                      <div
                        class="flex flex-1 items-center gap-x-1.5 px-3.5 py-2 active:bg-neutral-200"
                        @click="handleTransformDrawClick('RE', result.id, result.task_id)"
                      >
                        <Icon
                          icon="mdi:image-refresh-outline"
                          class="text-lg"
                        />
                        <span class="text-sm">重绘</span>
                      </div>
                      <Divider class="!my-0" />
                      <div
                        :class="{
                          'pointer-events-none text-neutral-300': (result.download_status !== 1)
                        }"
                        class="flex flex-1 items-center gap-x-1.5 px-3.5 py-2 active:bg-neutral-200"
                        @click="handleDownImageClick(itemIndex)"
                      >
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
                  <div
                    v-if="(result.download_status === 1)"
                    class="flex min-h-24 items-center justify-center"
                    @click="handleSegmentImagePreviewClick(result.id)"
                  >
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
                  <div
                    v-else-if="((result.status > 1))"
                    class="text-center"
                  >
                    <div
                      v-show="[1, 3, 4].includes(result.status)"
                      class="flex h-36 items-center justify-center"
                    >
                      <Circle
                        v-show="result.draw_progress"
                        v-model:current-rate="formatDrawProgressValue(result.draw_progress).value"
                        :rate="100"
                        :speed="100"
                        :text="result.draw_progress"
                      />
                    </div>
                    <span
                      :class="{
                        'text-green-500': (result.status === 1),
                        'text-primary': ([2, 3, 4].includes(result.status)),
                        'text-orange-500': (result.status === 7),
                        'text-red-500': (result.status === 5)
                      }"
                    >{{ result.status_text }}</span>
                  </div>
                </div>
                <div
                  v-if="result.download_status === 1"
                  class="mt-6 flex justify-center"
                >
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
                          :key="control.label"
                          class="rounded-md border px-4 py-1 text-sm active:bg-neutral-200"
                          @click="handleTransformDrawClick(control.value, result.id, result.task_id)"
                        >
                          {{ control.label }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              v-show="segmentSelected"
              class="ml-4"
            >
              <Checkbox :name="result.id" />
            </div>
          </div>
        </div>
      </CheckboxGroup>
    </div>
    <div class="flex gap-x-4 bg-white px-4 py-2 shadow">
      <Checkbox
        v-show="segmentSelected"
        v-model="segmentSelectedAll"
        class="px-4"
        :disabled="mutual.action"
        :indeterminate="segmentSelectIndeterminate"
        icon-size="22"
        @change="checkAllChange"
      >
        全选
      </Checkbox>
      <Button
        round
        :type="(segmentSelected ? 'default' : 'primary')"
        class="!h-10 flex-1"
        :disabled="mutual.action"
        @click="segmentSelected = !segmentSelected"
      >
        {{ segmentSelected ? '取消' : '选择' }}
      </Button>
      <Button
        round
        type="success"
        :loading="mutual.action"
        :disabled="(mutual.action || isRealEmpty(segmentSelectList))"
        class="!h-10 flex-1 shrink-0 text-nowrap"
        @click="handleActionDrawClick"
      >
        生成绘图 {{ `${(segmentSelected && segmentSelectList.length > 0) ? `(${segmentSelectList.length})` : ''}`
        }}
      </Button>
    </div>
  </div>
</template>
<style></style>
