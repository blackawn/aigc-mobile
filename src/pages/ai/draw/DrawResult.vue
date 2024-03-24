<script setup lang="ts">
import { ref, h, onMounted, watchEffect, inject, computed, onBeforeUnmount, reactive } from 'vue'
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
  showNotify
} from 'vant'
import Api, { SegmentData } from '@/api'
import { provideDrawResultDetail } from '@/provide'
import { useBaseDialog } from '@/composables/useBaseDialog'
import type { DrawConfig } from './index.vue'
import ImagesManage from './component/ImagesManage.vue'
import { useIntervalFn } from '@vueuse/core'
import axios from 'axios'
import { Icon } from '@iconify/vue'
import { isRealEmpty } from '@/utils/is'
import { getFileExtension } from '@/utils/format'
import { every } from 'lodash'
import { customAlphabet } from 'nanoid'

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

const { openDialog, closeDialog } = useBaseDialog()

const imageControlList = ref([
  {
    label: '放大',
    control: [
      {
        text: 'U1',
        value: 'U1'
      },
      {
        text: 'U2',
        value: 'U2'
      },
      {
        text: 'U3',
        value: 'U3'
      },
      {
        text: 'U4',
        value: 'U4'
      }
    ]
  },
  {
    label: '变换',
    control: [
      {
        text: 'V1',
        value: 'V1'
      },
      {
        text: 'V2',
        value: 'V2'
      },
      {
        text: 'V3',
        value: 'V3'
      },
      {
        text: 'V4',
        value: 'V4'
      }
    ]
  }
])

const segmentSelected = ref(false)

const segmentSelectedAll = ref(false)

const segmentSelectIndeterminate = ref(true)

const segmentSelectList = ref<Array<number>>([])

const mutual = reactive({
  action: false
})

const { pause, resume, isActive } = useIntervalFn(() => {
  getDrawProgressData()
}, 5000)

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

// 多图管理点击
const handleImagesManageClick = (segmentId: number, index: number) => {

  const imagesManageRef = ref<InstanceType<typeof ImagesManage> | null>(null)

  openDialog({
    title: '选择图片',
    message: () => h(ImagesManage, {
      ref: imagesManageRef,
      novelId: props.novelId,
      segmentId
    }),
    onConfirm: () => {
      const url = imagesManageRef.value?.imageSelected
      drawResultList.value[index].imageUrl = url as string
    }
  })
}

// 转换 / 重绘点击
const handleTransformDrawClick = async (action: string, segmentId: number, taskId: string) => {
  const res = await Api.draw.transformDraw({
    action,
    novel_id: props.novelId,
    segment_id: segmentId,
    task_id: taskId,
    type: props.config.engine
  })

  if (res.code === 0) {
    segmentSelectList.value = [segmentId]
    showNotify({
      message: '提示！绘图过程时间可能较久',
      type: 'primary'
    })
    resume()
  }
}

// 下载点击
const handleDownImageClick = (index: number, original = false) => {
  let url = drawResultList.value[index].imageUrl

  axios({
    method: 'GET',
    url: url,
    responseType: 'blob',
  })
    .then(({ data }) => {
      let blobUrl = window.URL.createObjectURL(new Blob([data]))
      let aElem = document.createElement('a')
      aElem.style.display = 'none'
      aElem.href = blobUrl
      let fileName = `${customAlphabet('1234567890abcdef', 32)()}.${getFileExtension(url)}`
      aElem.setAttribute('download', fileName)
      document.body.appendChild(aElem)
      aElem.click()
      window.URL.revokeObjectURL(blobUrl)
      document.body.removeChild(aElem)
    })
    .catch((error) => {
      console.log(error)
    })
}

// 分镜图片预览点击
const handleSegmentImagePreviewClick = (index: number) => {

  const imagePreviewList = drawResultList.value
    .map((item) => (`${item.imageUrl}${imageUrlResize}`))

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

// 开始绘图
const handleActionDrawClick = async () => {

  if (isRealEmpty(segmentSelectList.value)) {
    showToast('请选择分镜!')
    return
  }

  mutual.action = true

  segmentSelected.value = false

  const res = await Api.draw.actionDraw({
    ids: segmentSelectList.value,
    novel_id: props.novelId,
    style_id: props.config.style,
    type: props.config.engine
  })
  if (res.code === 0) {
    showNotify({
      message: '提示！绘图过程时间可能较久',
      type: 'primary'
    })
    resume()
  }
}

// 获取绘图进度
const getDrawProgressData = async () => {

  if (isRealEmpty(segmentSelectList.value)) return

  const res = await Api.draw.getDrawProgress({
    ids: segmentSelectList.value
  })

  res.data.forEach((item) => {
    const index = drawResultList.value.findIndex(result => (result.id === item.id && result.download_status === 0))
    if (index !== -1) {
      Object.assign(drawResultList.value[index], item)
    }
  })

  if (every(res.data, obj => obj.download_status === 1)) {
    pause()
    mutual.action = false
    segmentSelectList.value = []
  }
}

const formatDrawProgressValue = (value: string) => ref(parseInt(value))

watchEffect(() => {
  drawResultList.value = injectDrawResultDetail?.value.list || []
})

onMounted(() => {
  pause()
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
              <div v-show="((result.download_status === 1 || result.status > 0))">
                <Divider class="!my-3" />
                <div class="flex items-center justify-between">
                  <span class="text-sm">图片生成结果</span>
                  <Popover
                    v-if="result.download_status === 1"
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
                    v-if="result.download_status === 1"
                    class="flex min-h-24 items-center justify-center"
                    @click="handleSegmentImagePreviewClick(itemIndex)"
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
                    <span class="text-primary">{{ result.status_text }}</span>
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
                          :key="control.text"
                          class="rounded-md border px-4 py-1 text-sm"
                          @click="handleTransformDrawClick(control.value, result.id, result.task_id)"
                        >
                          {{ control.text }}
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
        生成&nbsp;/&nbsp;重绘 {{ `${(segmentSelected && segmentSelectList.length > 0) ? `(${segmentSelectList.length})` : ''}`
        }}
      </Button>
    </div>
  </div>
</template>
<style></style>
