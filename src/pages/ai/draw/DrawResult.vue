<script setup lang="ts">
import { ref } from 'vue'
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
  Circle
} from 'vant'
import Api, { GetDrawResultDetailRes } from '@/api'
import { NativeEventSource } from 'event-source-polyfill'
import { Icon } from '@iconify/vue'
import { onMounted } from 'vue'

const emit = defineEmits<{
  (e: 'toggle', value: boolean): void
}>()

const drawResultDetailList = ref<GetDrawResultDetailRes>({
  content: '',
  list: []
})

const roleSelect = ref(['a', 'b', 'c'])

const imageSettingPopover = ref(false)

const previewImage = ref(false)

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

const handleImageSettingClick = (action: PopoverAction, index: number) => {
  switch (index) {
    case 1:
      hs()
      break
    case 0:
      getDrawResultDetailListData()
      break
  }
}

const a = ref(50)

const hs = () => {

  const apiUrl = import.meta.env.VITE_APP_API_URL.replace(/\/$/, '')

  let c = ''

  const esp = new NativeEventSource(`${apiUrl}/novel/segment?novel_id=${1984}`)

  esp.addEventListener('message', (message) => {
    c += JSON.parse(message.data).content
  })

  esp.addEventListener('error', () => {
    console.log(c)
  })
}

///////////////////

const getDrawResultDetailListData = async () => {
  const res = await Api.draw.getDrawResultDetail(1982)
  drawResultDetailList.value = res.data
}

const handleToggleGenerateClick = () => {
  emit('toggle', false)
}

onMounted(()=>{
  getDrawResultDetailListData()
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
        <span class="text-sm text-neutral-500">共{{ drawResultDetailList.list.length }}条分镜</span>
      </div>
      <div class="mt-3 flex flex-col gap-y-4">
        <div
          v-for="item in drawResultDetailList.list"
          :key="item.id"
          class="flex flex-col rounded-md bg-white p-3 shadow-sm"
        >
          <div class="flex items-center gap-x-3">
            <div class="shrink-0 self-start">
              <span class="text-sm">角色</span>
            </div>
            <CheckboxGroup
              v-model="item.is_roles"
              direction="horizontal"
              class="gap-x-3 gap-y-1.5"
              icon-size="16px"
            >
              <Checkbox
                v-for="role in item.roles"
                :key="role"
                :name="role"
                class="!m-0"
              >
                <span class="text-sm">{{ role }}</span>
              </Checkbox>
            </CheckboxGroup>
          </div>
          <Divider class="!my-3" />
          <div>
            <div class="flex items-center justify-between">
              <span class="text-sm">分镜文本</span>
              <div class="p-0.5 active:text-neutral-400">
                <Icon icon="lucide:edit" />
              </div>
            </div>
            <div class="mt-2 max-h-28 min-h-20 whitespace-pre-wrap rounded-md bg-neutral-50 p-2 text-justify text-sm">
              {{ item.description }}
            </div>
          </div>
          <Divider class="!my-3" />
          <div>
            <div class="flex items-center justify-between">
              <span class="text-sm">图片生成结果</span>
              <Popover
                v-model:show="imageSettingPopover"
                :actions="imageActionsPopover"
                placement="bottom-end"
                @select="handleImageSettingClick"
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
              <Image
                class="size-full"
                :src="item.imageUrl"
              >
                <template #loading>
                  <Loading
                    type="spinner"
                    size="20"
                  />
                </template>
              </Image>
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
                  v-for="item in imagesControlList"
                  :key="item.label"
                  class="flex items-center"
                >
                  <span class="text-sm">{{ item.label }}</span>
                  <div class="ml-3 flex gap-x-3">
                    <span
                      v-for="control in item.control"
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
      >
        查看生成结果
      </Button>
      <Button
        round
        type="primary"
        class="!h-10 flex-1"
      >
        开始绘图
      </Button>
    </div>
  </div>
</template>
<style>
.van-popover__action {
  @apply px-3 w-auto h-9
}

</style>
