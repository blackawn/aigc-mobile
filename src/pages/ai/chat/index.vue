<script setup lang="ts">
import { ref, watch } from 'vue'
import { Icon, _api } from '@iconify/vue'
import { Button } from 'vant'
import ChatInfo from './component/ChatInfo.vue'
import BackgroundGeneration, { BackgroundType } from './component/BackgroundGeneration.vue'
import RoleGeneration from './component/RoleGeneration.vue'
import OutlineInfo from './component/OutlineInfo.vue'
import NovelGenerationProcess from './NovelGenerationProcess.vue'
import { DialogType } from './component/types'
import { onMounted } from 'vue'
import { useEventSource } from '@/composables/useEventSource'
import Api, { CreateNovelParams, CreateNovelBackgroundRes } from '@/api'
import { watchEffect } from 'vue'
import { reactive } from 'vue'
import { EventSourcePolyfill } from 'event-source-polyfill'

const userInput = ref('')

const novelId = ref<number | null>(null)

interface NovelGenerationProcessType {
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

const novelGenerationProcessData = ref<NovelGenerationProcessType>({
  step: 0,
  dialog: []
})

// 初始化小说生成开头
const initNovelGenerationProcess = () => {
  novelGenerationProcessData.value.dialog.push({
    role: 'gpt',
    content: '你好,我是专门为作者提供创作帮助的AI助手,您可以选择以下辅助模块辅助创作',
    time: '',
    type: 'theme',
    mutual: {
      type: 0,
      buttonList: ['小说生成', '小说续写', '小说扩写']
    }
  })

  novelGenerationProcessData.value.dialog.push({
    role: 'user',
    content: '小说生成',
    time: '',
    type: 'theme'
  })

  novelGenerationProcessData.value.dialog.push({
    'avatar': 'icon_avatar',
    'time': '2024/03/14 12:00:06',
    'content': '嗨！我是专门为作者提供创作帮助的AI助手，我具备强大的理解和生成能力，可以为作者提供创意灵感、角色设定、情节发展等方面的建议。我可以与作者进行对话，帮助他们解决问题，充实情节，提升故事的吸引力。\r\n\n无论你是需要构思情节，塑造角色，还是需要一些创意技巧，我都会尽力帮助你。请告诉我你想写什么题材的小说？',
    'role': 'gpt',
    'type': 'theme',
    mutual: {
      type: 0,
      buttonList: ['玄幻仙侠', '言情甜宠', '武侠古典', '奇幻异世', '悬疑推理', '科幻未来', '都市生活', '古诗古文']
    }
  })

  novelGenerationProcessData.value.dialog.push({
    'avatar': 'icon_avatar',
    'time': '2024/03/14 12:00:07',
    'content': '奇幻异世',
    'role': 'user',
    'type': 'theme'
  })

  novelGenerationProcessData.value.dialog.push({
    'avatar': 'icon_avatar',
    'time': '2024/03/14 12:00:07',
    'content': '好的！请告诉我您希望的小说背景是什么样的，我将会依据此为您生成小说的世界观。请随意描述您希望的背景设定。',
    'role': 'gpt',
    'type': 'background',
    'novel_id': 1476
  })

  novelGenerationProcessData.value.dialog.push({
    role: 'user',
    content: '科幻未来',
    time: '',
    type: 'theme'
  })

  novelGenerationProcessData.value.dialog.push({
    role: 'gpt',
    content: '好的！请告诉我您希望的小说背景是什么样的，我将会依据此为您生成小说的世界观。请随意描述您希望的背景设定。',
    time: '',
    type: 'background'
  })

  novelGenerationProcessData.value.dialog.push({
    role: 'user',
    content: '在50年后的大地上充满了科幻的气息',
    time: '',
    type: 'backgroundAnswer'
  })

  novelGenerationProcessData.value.dialog.push({
    role: 'gpt',
    content: `故事背景1：
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
背景：时空裂缝、流放者联盟、古尔文领主家族的崛起、散落的水晶碎片兽`,
    time: '',
    type: 'backgroundGeneration'
  })

  novelGenerationProcessData.value.dialog.push({
    role: 'user',
    content: '背景1',
    time: '',
    type: 'theme',
  })

  novelGenerationProcessData.value.dialog.push({
    role: 'gpt',
    content: '背景1',
    time: '',
    type: 'role',
  })

  novelGenerationProcessData.value.dialog.push({
    role: 'gpt',
    content: '好的！请告诉我您想要的情节背景、主要事件或冲突，以及您希望故事发展的方向。',
    time: '',
    type: 'theme',
    mutual: {
      type: 0,
      buttonList: ['轻取珍宝', '谈笑风生', '隐藏身份', '舍生取义', '巧用技能', '巧解危机', '邪道能力', '古怪伙伴', '王道信念', '转危为机', '严肃搞笑', '赢人一点', '女神暗恋', '劫富济贫']
    }
  })

  novelGenerationProcessData.value.dialog.push({
    role: 'user',
    content: '巧用技能',
    time: '',
    type: 'theme'
  })
  novelGenerationProcessData.value.dialog.push({
    role: 'gpt',
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

const init = () => {
  novelGenerationProcessData.value.dialog = [
    {
      'avatar': 'icon_avatar',
      'time': '2024/03/14 12:00:06',
      'content': '嗨！我是专门为作者提供创作帮助的AI助手，我具备强大的理解和生成能力，可以为作者提供创意灵感、角色设定、情节发展等方面的建议。我可以与作者进行对话，帮助他们解决问题，充实情节，提升故事的吸引力。\r\n\n无论你是需要构思情节，塑造角色，还是需要一些创意技巧，我都会尽力帮助你。请告诉我你想写什么题材的小说？',
      'role': 'gpt',
      'type': 'theme'
    },
    {
      'avatar': 'icon_avatar',
      'time': '2024/03/14 12:00:07',
      'content': '奇幻异世',
      'role': 'user',
      'type': 'theme'
    },
    {
      'avatar': 'icon_avatar',
      'time': '2024/03/14 12:00:07',
      'content': '好的！请告诉我您希望的小说背景是什么样的，我将会依据此为您生成小说的世界观。请随意描述您希望的背景设定。',
      'role': 'gpt',
      'type': 'background',
      'novel_id': 1476
    },
    {
      'avatar': 'icon_avatar',
      'time': '2024/03/14 12:00:16',
      'content': '奇怪的',
      'role': 'user',
      'type': 'backgroundAnswer'
    },
    {
      'avatar': 'icon_avatar',
      'time': '2024/03/14 12:00:51',
      'content': '好的，请告诉我您想要设定的主要角色名称、年龄、性别以及他们的角色特征。填写后点击"下一步"',
      'role': 'gpt',
      'roleStyleInfo': [
        {
          'name': '张力',
          'age': '青少年',
          'sex': '男',
          'character': '聪明机智,'
        }
      ],
      'type': 'role'
    },
    {
      'avatar': 'icon_avatar',
      'time': '2024/03/14 12:01:03',
      'content': '好的！请告诉我您想要的情节背景、主要事件或冲突，以及您希望故事发展的方向。',
      'role': 'gpt',
      'type': 'plot'
    },
    {
      'avatar': 'icon_avatar',
      'time': '2024/03/14 12:01:04',
      'content': '巧用技能',
      'role': 'user',
      'type': 'plot'
    },
    {
      'avatar': 'icon_avatar',
      'time': '2024/03/14 12:01:05',
      'content': '选择您想要的文风',
      'role': 'gpt',
      'type': 'writingStyle'
    },
    {
      'avatar': 'icon_avatar',
      'time': '2024/03/14 12:01:06',
      'content': '马克吐温幽默风',
      'role': 'user',
      'type': 'writingStyle'
    },
    {
      'avatar': 'icon_avatar',
      'time': '2024/03/14 12:01:07',
      'content': '好的！根据我们之前的对话，汇总得到以下',
      'role': 'gpt',
      'type': 'summary',
      'outline': true,
      'roleStyleInfo': [
        {
          'name': '张力',
          'age': '青少年',
          'sex': '男',
          'character': '聪明机智,'
        }
      ],
      'summaryList': [
        {
          'title': '小说题材',
          'id': 'theme',
          'content': '随机盲盒'
        },
        {
          'title': '背景设定',
          'id': 'background',
          'content': '时间：两派大战后的百年和平时期；地点：尼亚索斯世界，中心的辉煌帝国首都格兰塞尔；背景：魔力的稀释、双子王'
        },
        {
          'title': '角色',
          'id': 'role',
          'content': '\n姓名：张力；性别：男；年龄：青少年；角色特征：聪明机智；'
        },
        {
          'title': '情节',
          'id': 'plot',
          'content': '舍生取义,巧用技能,邪道能力'
        },
        {
          'title': '文风',
          'id': 'style',
          'content': '马克吐温幽默风'
        }
      ]
    }
  ]
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
      role: 'gpt',
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
  init()

})

</script>
<template>
  <div class="flex h-full flex-col bg-neutral-100">
    <div
      ref="scrollEl"
      class="flex-1 overflow-x-hidden"
    >
      <div class="p-4">
        <NovelGenerationProcess :data="novelGenerationProcessData.dialog" />
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
