<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Image, Button } from 'vant'
import { Icon } from '@iconify/vue'
import { sample } from 'lodash'

import style_0 from '@/assets/images/style_0.jpg'
import style_1 from '@/assets/images/style_1.jpg'
import style_2 from '@/assets/images/style_2.jpg'
import style_3 from '@/assets/images/style_3.jpg'
import style_4 from '@/assets/images/style_4.jpg'
import style_5 from '@/assets/images/style_5.jpg'
import style_6 from '@/assets/images/style_6.jpg'
import style_7 from '@/assets/images/style_7.jpg'

import { NativeEventSource } from 'event-source-polyfill'

interface Style {
  label: string
  image: string
}

interface Size {
  label: string
  class: string
}

interface Engine {
  label: string
}

const emit = defineEmits<{
  (e: 'toggle', value: boolean): void
}>()

const content = ref('')

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

const select = reactive({
  style: 0,
  size: 0,
  engine: 0,
})

const sizeList = ref<Array<Size>>([
  {
    label: '1:1',
    class: 'w-4 h-4'
  },
  {
    label: '4:3',
    class: 'w-4 h-3'
  },
  {
    label: '3:4',
    class: 'w-3 h-4'
  },
  {
    label: '16:9',
    class: 'w-4 h-2.5'
  },
  {
    label: '9:16',
    class: 'w-2.5 h-4'
  }
])

const engineList = ref<Array<Engine>>([
  {
    label: 'DALL-E'
  },
  {
    label: 'Midjourney'
  }
])

const handleClearClick = () => {
  content.value = ''
}

const handleStyleClick = (index: number) => {
  select.style = index
  randomStyle.value = {
    label: '',
    image: ''
  }
}

const handleSizeSelectedClick = (index: number) => {
  select.size = index
}

const handleEngineSelectedClick = (index: number) => {
  select.engine = index
}

const handleRandomStyleClick = () => {
  select.style = -1
  randomStyle.value = sample(styleList.value) as Style
}

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

const handleToggleResultClick = () => {
  emit('toggle', true)
}

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
            class="flex items-center gap-x-1 text-indigo-400 active:text-neutral-400"
            @click="handleToggleResultClick"
          >
            <span class="text-sm leading-none">查看绘图结果</span>
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
            class="size-full resize-none whitespace-pre-wrap break-words bg-transparent align-bottom text-sm"
          />
          <div class="mt-2 flex items-end justify-between">
            <div class="flex gap-x-2">
              <div class="flex items-center gap-x-1 rounded-md border px-1.5 py-1 active:bg-neutral-200">
                <Icon icon="octicon:sidebar-expand-24" />
                <span class="text-xs leading-none">从我的小说中选择</span>
              </div>
              <div
                class="flex items-center gap-x-1 rounded-full border px-3 py-1 duration-300 active:bg-neutral-200"
                :class="{
                  'invisible opacity-0': (content.length <= 0)
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
            class="relative flex overflow-hidden rounded-lg"
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
            class="relative flex overflow-hidden rounded-lg border"
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
            @click="handleSizeSelectedClick(index)"
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
            @click="handleEngineSelectedClick(index)"
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
      >
        生成分镜
      </Button>
    </div>
  </div>
</template>
<style></style>
