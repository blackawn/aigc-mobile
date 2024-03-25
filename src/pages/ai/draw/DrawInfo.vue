<script setup lang="ts">
import { ref, reactive, onMounted, watchEffect, inject, computed } from 'vue'
import { Image, Button, showToast, showLoadingToast } from 'vant'
import { Icon } from '@iconify/vue'
import { sample } from 'lodash'
import { storeConfig } from '@/store/config'
import Api, { SegmentMessage, GetSegmentDetailRes } from '@/api'
import { provideDrawResultDetail } from '@/provide'
import { storeMutual } from '@/store/mutual'
import type { DrawConfig } from './index.vue'
import { isRealEmpty } from '@/utils/is'

import style_0 from '@/assets/images/style_0.jpg'
import style_1 from '@/assets/images/style_1.jpg'
import style_2 from '@/assets/images/style_2.jpg'
import style_3 from '@/assets/images/style_3.jpg'
import style_4 from '@/assets/images/style_4.jpg'
import style_5 from '@/assets/images/style_5.jpg'
import style_6 from '@/assets/images/style_6.jpg'
import style_7 from '@/assets/images/style_7.jpg'

import { EventSourcePolyfill } from 'event-source-polyfill'

interface Style {
  label: string
  image: string
  value?: number
  description?: string
}

interface Size {
  label: string
  class: string,
  value?: string
}

interface Engine {
  label: string
  value?: number
}

const modelToggle = defineModel(
  'toggle',
  { type: Boolean, default: true }
)

const emit = defineEmits<{
  (e: 'config', config: DrawConfig): void
  (e: 'done', novelId: number): void
}>()

const injectDrawResultDetail = inject(provideDrawResultDetail, null)

const configStore = storeConfig()

const mutualStore = storeMutual()

const content = ref(injectDrawResultDetail?.value.content || '')

const drawResultDetailList = computed(() => injectDrawResultDetail?.value.list || [])

const mutual = reactive({
  generate: false
})

const sizeList = ref<Array<Size>>([
  {
    label: '1:1',
    value: '1:1',
    class: 'w-4 h-4'
  },
  {
    label: '4:3',
    value: '4:3',
    class: 'w-4 h-3'
  },
  {
    label: '3:4',
    value: '3:4',
    class: 'w-3 h-4'
  },
  {
    label: '16:9',
    value: '16:9',
    class: 'w-4 h-2.5'
  },
  {
    label: '9:16',
    value: '9:16',
    class: 'w-2.5 h-4'
  }
])

const styleList = ref<Array<Style>>([
  {
    label: '国风奇幻',
    image: style_0
  },
  {
    label: '国风古典',
    image: style_1
  },
  {
    label: '西方奇幻',
    image: style_2
  },
  {
    label: '都市现实',
    image: style_3
  },
  {
    label: '末世废土',
    image: style_4
  },
  {
    label: '赛博科技',
    image: style_5
  },
  {
    label: '黑白漫画',
    image: style_6
  },
  {
    label: '二次元插画',
    image: style_7
  }
])

const randomStyle = ref<Style>({
  label: '',
  image: ''
})

const engineList = ref<Array<Engine>>([
  {
    label: 'DALL-E',
    value: 1
  },
  {
    label: 'Midjourney',
    value: 2
  }
])

const select = reactive({
  style: 0,
  size: 0,
  engine: 0,
})

// 从我的小说获取内容点击
const handleSelectFromHistoryChatClick = () => {
  mutualStore.modifyNovelContentSelected(true)
}

// 清空点击
const handleClearClick = () => {
  content.value = ''
}

// 风格选择点击
const handleStyleClick = (index: number) => {
  select.style = index
  randomStyle.value = {
    label: '',
    image: ''
  }
}

// 尺寸选择点击
const handleSizeSelectClick = (index: number) => {
  select.size = index
}

// 绘图引擎点击
const handleEngineSelectClick = (index: number) => {
  select.engine = index
}

// 随机盲合
const handleRandomStyleClick = () => {
  select.style = -1
  randomStyle.value = sample(styleList.value) as Style
}

// 处理分镜内容
const formatSegmentContent = (content: string) => {
  const contentArray = content.split('\n\n')
  let splitArray: Array<string> = []
  contentArray.forEach(item => {
    if (item.indexOf('场景：') > -1) {
      splitArray.push(item)
    }
  })
  let messages: Array<SegmentMessage> = []
  splitArray.forEach(item => {
    const message: SegmentMessage = {
      scene: '',
      description: '',
      roles: [],
      is_roles: [],
      ratio: sizeList.value[select.size].value,
      style_id: randomStyle.value.value || styleList.value[select.style].value,
      is_draw: false,
      ready_draw: false,
      checked: false,
    }
    const splitAllArr = item.substring(item.indexOf(' ') + 1, item.length).split('\n')
    const splitArr = splitAllArr.filter((e: string) => e.indexOf('场景：') > -1 || e.indexOf('描述：') > -1 || e.indexOf('人物：') > -1)
    message.scene = splitArr[0].split('：')[1]
    message.description = splitArr[1].split('：')[1]
    if (splitArr.length < 3) {
      message.roles = []
    } else {
      if (splitArr[2].indexOf('：') == -1) {
        message.roles = []
      } else {
        const midArr = splitArr[2].split('：')
        if (midArr[1].indexOf('、') != -1) {
          message.roles = midArr[1].split('、')
        } else if (midArr[1].indexOf(',') != -1) {
          message.roles = midArr[1].split(',')
        } else if (midArr[1].indexOf('，') != -1) {
          message.roles = midArr[1].split('，')
        } else if (midArr[1].indexOf(';') != -1) {
          message.roles = midArr[1].split(';')
        } else if (midArr[1].indexOf('；') != -1) {
          message.roles = midArr[1].split('；')
        } else {
          message.roles = [midArr[1]]
        }
      }
    }
    message.is_roles = message.roles
    message.is_draw = false
    message.ready_draw = false
    message.checked = false
    messages.push(message)
  })

  return messages
}

// 分镜生成点击
const handleGenerateSegmentClick = async () => {

  if (content.value.trim().length < 10) {
    showToast('内容字数生成少于10字')
    return
  }

  if (!isRealEmpty(drawResultDetailList.value)) {
    return
  }

  const lt = showLoadingToast({
    message: '生成中...',
    forbidClick: true,
    loadingType: 'spinner',
  })

  mutual.generate = true

  const createRes = await Api.novel.createNovel({
    title: '小说配图',
    type: 4
  })

  if (createRes.code === 0) {

    const id = createRes.data.novel_id

    await Api.novel.editNovelContent({
      novel_id: id,
      content: content.value,
      type: 4
    })

    const apiUrl = import.meta.env.VITE_APP_API_URL.replace(/\/$/, '')

    let segmentContent = ''

    let esp: EventSourcePolyfill | null = new EventSourcePolyfill(`${apiUrl}/novel/segment?novel_id=${id}&message_id=1`)

    esp.addEventListener('message', (message) => {
      segmentContent += JSON.parse(message.data).content
    })

    esp.addEventListener('error', async () => {

      const messages = formatSegmentContent(segmentContent)

      if (isRealEmpty(messages)) {
        lt.close()
        showToast('未生成有效分镜,请重试')
        mutual.generate = false
        esp?.close()
        esp = null
        return
      }

      const res = await Api.draw.saveSegment({
        novel_id: id,
        messages,
        chapter: 1
      }).finally(() => {
        lt.close()
        mutual.generate = false
      })

      if (res.code === 0) {
        showToast('分镜生成成功!')
        emit('done', id)
      }
    })

  } else {
    mutual.generate = false
    lt.close()
  }

}

// 设置风格Id
const setStyleListValue = () => {
  styleList.value.forEach((item, index) => {
    const relation = configStore.configList.find((v) => ((v.name === item.label) && v.type === 6))
    if (relation) {
      styleList.value[index].value = relation.id
    }
  })
}

// 跳转分镜结果
const handleToggleResultClick = () => {
  modelToggle.value = false
}

// 获取小说的内容
const getNovelHistoryContent = async (novelId: number) => {
  const res = await Api.novel.getNovelContent(novelId).finally(() => {
    mutualStore.modifyNovelContentIdSelect(-1)
  })

  if (isRealEmpty(res.data.content.trim())) {
    showToast('该小说内容为空!')
    return
  }

  content.value = res.data.content
}

// 获取绘图配置
const getDrawConfig = () => {

  const size = sizeList.value[select.size]?.value || '1:1'
  const style = randomStyle.value?.value || styleList.value[select.style]?.value || 58
  const engine = engineList.value[select.engine]?.value || 1

  emit('config', {
    size,
    style,
    engine
  })
}

watchEffect(() => {
  if (configStore.configList) {
    setStyleListValue()
  }
})

watchEffect(() => {
  if (mutualStore.novelContentIdSelect > 0) {
    getNovelHistoryContent(mutualStore.novelContentIdSelect)
  }
})

watchEffect(() => {
  if (!isRealEmpty(drawResultDetailList.value)) {
    select.size = sizeList.value.findIndex((item) => item.value === drawResultDetailList.value[0].ratio)
    select.style = styleList.value.findIndex((item) => item.value === drawResultDetailList.value[0].style_id)
  }
})

watchEffect(() => {
  if (select) {
    getDrawConfig()
  }
})

onMounted(() => {
  //content.value = '小李和小芳还有智明在吃饭'
})

</script>
<template>
  <div class="flex h-full flex-col">
    <div class="flex flex-1 flex-col gap-y-6 overflow-x-hidden p-4">
      <div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-x-1">
            <Icon
              icon="fluent:slide-text-28-regular"
              class="text-lg"
            />
            <span class="text-sm leading-none">生成内容</span>
          </div>
          <div
            v-show="(drawResultDetailList?.length > 0)"
            class="flex items-center gap-x-1 active:text-neutral-400"
            @click="handleToggleResultClick"
          >
            <span class="text-sm leading-none">查看分镜结果</span>
            <Icon
              icon="ph:caret-right"
              class="text-lg"
            />
          </div>
        </div>
        <div class="mt-3 rounded-md bg-white p-3">
          <textarea
            v-model="content"
            placeholder="请输入您的小说全文"
            rows="7"
            maxlength="5000"
            class="size-full resize-none whitespace-pre-wrap break-words bg-transparent align-bottom text-sm"
          />
          <div class="mt-2 flex items-end justify-between">
            <div class="flex gap-x-2">
              <div
                class="flex items-center gap-x-1 rounded-md border px-1.5 py-1 active:bg-neutral-200"
                @click="handleSelectFromHistoryChatClick"
              >
                <Icon icon="octicon:sidebar-expand-24" />
                <span class="text-xs leading-none">从我的小说中选择</span>
              </div>
              <div
                class="flex items-center gap-x-1 rounded-full border px-3 py-1 duration-300 active:bg-neutral-200"
                :class="{
                  'invisible opacity-0': (content?.length <= 0)
                }"
                @click="handleClearClick"
              >
                <span class="text-xs leading-none">清空</span>
              </div>
            </div>
            <span class="text-sm text-neutral-500">
              {{ content.length }}/5000
            </span>
          </div>
        </div>
      </div>
      <div>
        <div class="flex items-center gap-x-1">
          <Icon
            icon="fluent:style-guide-20-regular"
            class="text-xl"
          />
          <span class="text-sm leading-none">绘图风格</span>
        </div>
        <div class="mt-3 grid grid-cols-3 gap-2.5 rounded-md bg-white p-3">
          <div
            v-for="(item, index) in styleList"
            :key="item.label"
            class="relative flex justify-center overflow-hidden rounded-lg"
            :class="{
              'outline outline-2 outline-offset-2 outline-primary': (select.style === index)
            }"
            @click="handleStyleClick(index)"
          >
            <Image
              fit="cover"
              :src="item.image"
            />
            <span
              class="absolute bottom-0 left-0 w-full truncate bg-gradient-to-t from-black/90 to-black/5 py-1 text-center text-xs text-white"
            >{{
              item.label }}</span>
          </div>
          <div
            class="relative flex justify-center overflow-hidden rounded-lg border"
            :class="{
              'outline outline-2 outline-offset-2 outline-primary': (randomStyle.label && (select.style === -1))
            }"
            @click="handleRandomStyleClick"
          >
            <Image
              fit="cover"
              class="w-full"
              :src="randomStyle.image"
            >
              <template #loading>
                <Icon
                  icon="fluent:question-24-filled"
                  class="text-2xl"
                />
              </template>
            </Image>
            <span
              class="absolute bottom-0 left-0 w-full truncate py-1 text-center text-xs"
              :class="{
                'bg-gradient-to-t from-black/90 to-black/5 text-white': (randomStyle.label)
              }"
            >{{ randomStyle.label || '随机盲盒' }}</span>
          </div>
        </div>
      </div>
      <div>
        <div class="flex items-center gap-x-1">
          <Icon
            icon="material-symbols:view-real-size"
            class="text-xl"
          />
          <span class="text-sm leading-none">图片比例</span>
        </div>
        <div class="mt-3 grid grid-cols-5 gap-2.5 rounded-md bg-white p-2.5">
          <div
            v-for="(item, index) in sizeList"
            :key="item.label"
            class="flex items-center justify-center gap-x-1 rounded border-2 p-2"
            :class="{
              'border-primary': (select.size === index)
            }"
            @click="handleSizeSelectClick(index)"
          >
            <div
              class="shrink-0 border-2 border-primary/30"
              :class="[
                item.class,
                {
                  '!border-primary': (select.size === index)
                }
              ]"
            />
            <span
              class="text-sm"
              :class="{
                'text-primary': (select.size === index)
              }"
            >{{ item.label }}</span>
          </div>
        </div>
      </div>
      <div class="mb-40">
        <div class="flex items-center gap-x-1">
          <Icon
            icon="icon-park-outline:application-one"
            class="text-lg"
          />
          <span class="text-sm leading-none">绘图软件</span>
        </div>
        <div class="mt-3 flex gap-2.5 rounded-md bg-white p-2.5">
          <div
            v-for="(item, index) in engineList"
            :key="item.label"
            class="flex items-center justify-center gap-x-1 rounded border-2 p-2"
            :class="{
              'border-primary': (select.engine === index)
            }"
            @click="handleEngineSelectClick(index)"
          >
            <span
              class="text-sm"
              :class="{
                'text-primary': (select.engine === index)
              }"
            >{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="bg-white px-4 py-2 shadow">
      <Button
        round
        type="primary"
        block
        :disabled="(mutual.generate || isRealEmpty(content) || !isRealEmpty(drawResultDetailList))"
        :loading="mutual.generate"
        @click="handleGenerateSegmentClick"
      >
        生成分镜
      </Button>
    </div>
  </div>
</template>
<style></style>
