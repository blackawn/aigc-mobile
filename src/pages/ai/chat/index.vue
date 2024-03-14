<script setup lang="ts">
import { ref, watch } from 'vue'
import { Icon, _api } from '@iconify/vue'
import { Button } from 'vant'
import ChatDialog from './component/ChatDialog.vue'
import BackgroundGeneration, { BackgroundType } from './component/BackgroundGeneration.vue'
import RoleGeneration from './component/RoleGeneration.vue'
import OutlineInfo from './component/OutlineInfo.vue'
import { DialogType } from './component/types'
import { onMounted } from 'vue'
import { useEventSource } from '@/composables/useEventSource'
import Api, { CreateNovelParams, CreateNovelBackgroundRes } from '@/api'
import { watchEffect } from 'vue'
import { reactive } from 'vue'
import { EventSourcePolyfill } from 'event-source-polyfill'

const userInput = ref('')

const novelId = ref<number | null>(null)

interface NovelGenerationProcess {
  step: number
  dialog: Array<DialogType>
}

const delayMutual = ref(false)

const scrollEl = ref<HTMLDivElement | null>(null)

const backgroundInst = ref<EventSource | null>(null)

const background = reactive({
  content: '',
  pervGenerationKeyword: '',
  connected: false
})

const novelGenerationProcessData = ref<NovelGenerationProcess>({
  step: 0,
  dialog: []
})

// 初始化小说生成开头
const initNovelGenerationProcess = () => {
  novelGenerationProcessData.value.dialog.push({
    role: 'gtp',
    content: '嗨！我是专门为作者提供创作帮助的AI助手，我具备强大的理解和生成能力，可以为作者提供创意灵感、角色设定、情节发展等方面的建议。我可以与作者进行对话，帮助他们解决问题，充实情节，提升故事的吸引力。</br></br> 无论你是需要构思情节，塑造角色，还是需要一些创意技巧，我都会尽力帮助你。请告诉我你想写什么题材的小说？',
    time: '',
    type: 'theme',
    mutual: {
      type: 0,
      buttonList: ['玄幻仙侠', '言情甜宠', '武侠古典', '奇幻异世', '悬疑推理', '科幻未来', '都市生活', '古诗古文']
    }
  })
  novelGenerationProcessData.value.dialog.push({
    role: 'user',
    content: '武侠古典',
    time: '',
    type: 'theme'
  })

  novelGenerationProcessData.value.dialog.push({
    role: 'gtp',
    content: '好的！请告诉我您希望的小说背景是什么样的，我将会依据此为您生成小说的世界观。请随意描述您希望的背景设定。',
    time: '',
    type: 'theme'
  })

  novelGenerationProcessData.value.dialog.push({
    role: 'user',
    content: '科幻未来',
    time: '',
    type: 'theme'
  })

  novelGenerationProcessData.value.dialog.push({
    role: 'gtp',
    content: '好的！请告诉我您希望的小说背景是什么样的，我将会依据此为您生成小说的世界观。请随意描述您希望的背景设定。',
    time: '',
    type: 'theme'
  })

  novelGenerationProcessData.value.dialog.push({
    role: 'user',
    content: '在50年后的大地上充满了科幻的气息',
    time: '',
    type: 'theme'
  })
  novelGenerationProcessData.value.dialog.push({
    role: 'gtp',
    content: '好的！请告诉我您想要的情节背景、主要事件或冲突，以及您希望故事发展的方向。',
    time: '',
    type: 'theme',
    mutual: {
      type: 0,
      buttonList: ['轻取珍宝', '谈笑风生', '隐藏身份', '舍生取义', '巧用技能', '巧解危机', '邪道能力', '古怪伙伴', '王道信念','转危为机','严肃搞笑','赢人一点','女神暗恋','劫富济贫']
    }
  })
  novelGenerationProcessData.value.dialog.push({
    role: 'user',
    content: '巧用技能',
    time: '',
    type: 'theme'
  })
  novelGenerationProcessData.value.dialog.push({
    role: 'gtp',
    content: '选择您想要的文风',
    time: '',
    type: 'theme',
    mutual: {
      type: 0,
      buttonList: ['鲁迅风', '红楼风', '轻小说风', '古文小说风', '金庸武侠风', '马克吐温幽默风', '夏目漱石心理风', '海明威简明严肃风']
    }
  })
  novelGenerationProcessData.value.dialog.push({
    role: 'user',
    content: '古文小说风',
    time: '',
    type: 'theme'
  })
}

// 主题选择
const themeSelect = async (value: string) => {

  delayMutual.value = true

  // 第一次要选择交互，创建历史记录, 返回id
  if (!novelId.value) {
    const res = await Api.novel.createNovel({
      title: value,
      type: 1
    }).finally(() => delayMutual.value = false)

    novelId.value = res.data.novel_id
  }

  novelGenerationProcessData.value.dialog.push({
    role: 'user',
    content: value,
    time: '',
    type: 'theme'
  })

  setTimeout(() => {

    novelGenerationProcessData.value.dialog.push({
      role: 'gtp',
      content: '好的！请告诉我您希望的小说背景是什么样的，我将会依据此为您生成小说的世界观。请随意描述您希望的背景设定。',
      time: '',
      type: 'theme'
    })

    delayMutual.value = false

    novelGenerationProcessData.value.step = 1

  }, 500)
}

// 滚动到底部
const scrollElToBottom = () => {
  if (scrollEl.value) {
    scrollEl.value.scrollTop = scrollEl.value.scrollHeight
  }
}

// 生成背景
const generationBackground = () => {

  background.connected = true

  background.content = ''

  if (userInput.value) {
    background.pervGenerationKeyword = userInput.value
  }

  const keyword = userInput.value || background.pervGenerationKeyword

  backgroundInst.value = new EventSourcePolyfill(`https://api.novel.kafan321.com/api/v1/novel/generate/background?novel_id=${novelId.value}&content=${keyword}`)

  backgroundInst.value.addEventListener('message', (message) => {
    background.content += JSON.parse(message.data).content
    requestIdleCallback(() => scrollElToBottom())
  })

  backgroundInst.value.addEventListener('error', () => {
    background.connected = false
  })

}

const handleConfirmBackground = (data: BackgroundType) => {
  novelGenerationProcessData.value.step = 3
}

// 用户输入
const handleSendClick = async () => {
  novelGenerationProcessData.value.dialog.push({
    role: 'user',
    content: userInput.value,
    time: '',
    type: 'theme'
  })

  generationBackground()

  userInput.value = ''

  novelGenerationProcessData.value.step = 2

}

watchEffect(() => {
  if (novelGenerationProcessData.value.dialog.length) {
    requestIdleCallback(() => scrollElToBottom())
  }
})

onMounted(() => {
  initNovelGenerationProcess()

  const a = `故事背景1：
时间：先史纪元的晚期
地点：艾瑟兰达大陆，北侧的瑟利安森林边缘
背景：巨龙的凋零、古老魔法的消失、贵族之争、森林里的秘密种族

故事背景2：
时间：第五纪元的晨光年
地点：艾娜希尔大陆，西部的审判之地
背景：新星陨落、亡灵觉醒、骑士团的荣耀、被遗忘的魔法神殿

故事背景3：
时间：两派大战后的百年和平时期
地点：尼亚索斯世界，中心的辉煌帝国首都格兰塞尔
背景：魔力的稀释、双子王朝、独立商盟的兴起、远古巨兽的苏醒

故事背景4：
时间：幻梦元年，不可知时代的始点
地点：梦回大地，神秘岛屿群落尤特拉帕斯
背景：未知天象、幻梦者的到来、智者隐居地、种族之树与遗产守护者

故事背景5：
时间：镜界之争后的第一世纪
地点：德鲁安塔大陆，南端的风暴裂谷
背景：时空裂缝、流放者联盟、古尔文领主家族的崛起、散落的水晶碎片兽`

  background.content = a
})

</script>
<template>
  <div class="flex h-full flex-col bg-neutral-100">
    <div
      ref="scrollEl"
      class="flex-1 overflow-x-hidden"
    >
      <div class="p-4">
        <div class="flex flex-col gap-y-5">
          <ChatDialog
            v-for="data in novelGenerationProcessData.dialog"
            :key="data.time"
            :data="data"
            :button-props="{
              disabled: delayMutual
            }"
            @button="v => themeSelect(v)"
          />
          <BackgroundGeneration
            :data="background.content"
            :allow-mutual="(!background.connected)"
            @afresh="generationBackground"
            @confirm="handleConfirmBackground"
          />
          <RoleGeneration />
          <OutlineInfo />
        </div>
      </div>
    </div>
    <div
      class="flex items-center bg-neutral-50 py-2.5 shadow-md"
      :class="{
        'pointer-events-none': (novelGenerationProcessData.step !== 1)
      }"
    >
      <div class="flex px-4 py-1.5 active:text-neutral-400">
        <Icon
          icon="oui:ml-create-single-metric-job"
          class="text-xl"
        />
      </div>
      <div class="flex-1 rounded-md bg-neutral-200/50 px-2 py-1">
        <div class="relative flex-1 overflow-hidden">
          <textarea
            v-model="userInput"
            class="absolute left-0 top-0 m-0 inline-block size-full min-w-0 resize-none whitespace-pre-wrap break-words bg-transparent p-0 align-bottom"
            rows="1"
            @input="e => userInput = (e.target as HTMLInputElement).value"
          />
          <div
            class="pointer-events-none invisible static m-0 inline-block size-full max-h-24 min-h-6 resize-none overflow-hidden whitespace-pre-wrap break-words p-0 align-bottom"
          >
            {{ userInput }}
          </div>
        </div>
      </div>
      <div
        class="flex px-4 py-1.5 active:text-neutral-400"
        @click="handleSendClick"
      >
        <Icon
          icon="streamline:send-email"
          class="text-lg"
        />
      </div>
    </div>
  </div>
</template>
<style></style>
