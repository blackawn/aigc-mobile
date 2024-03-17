<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { DialogData } from './component/types'
import NovelGeneration from './NovelGeneration.vue'
import ChatInfoMutual from './component/ChatInfoMutual.vue'
import ChatInfo from './component/ChatInfo.vue'
import InputBox from './component/InputBox.vue'
import Api from '@/api'
import { parseTime } from '@/utils/format'
import { isEmpty } from 'lodash'
import { computed } from 'vue'

interface ChatDialogData {
  type: number
  guide: Array<DialogData>
  dialog: Array<DialogData>
}

const chatDialogData = ref<ChatDialogData>({
  type: 0,
  guide: [],
  dialog: []
})

const novelId = ref<number>(-1)

const scrollElem = ref<HTMLDivElement | null>(null)

const novelGenerationRef = ref<InstanceType<typeof NovelGeneration> | null>(null)

const allowInputBox = computed(() => {
  return (novelGenerationRef.value?.lastDialog?.type !== 'background')
})

const initChatDialog = () => {
  chatDialogData.value.guide.push({
    avatar: 'icon_avatar',
    time: parseTime(),
    content: '你好呀\r\n我是未未，你的创作助手\r\n无论你是遇到创作瓶颈，还是需要灵感激发，我都在这里帮助你。一起来创作吧！现在你需要什么帮助呢？',
    role: 'gpt',
    type: 'guide'
  })

  chatDialogData.value.guide.push({
    avatar: 'icon_avatar',
    time: parseTime(),
    content: '小说生成',
    role: 'user',
    type: 'guideAnswer'
  })

  chatDialogData.value.type = 1

  chatDialogData.value.dialog = [
    {
      'avatar': 'icon_avatar', 'time': '2024/03/17 09:57:06',
      'content': '好的！请告诉我您希望的小说背景是什么样的，我将会依据此为您生成小说的世界观。请随意描述您希望的背景设定。', 'role': 'gpt', 'type': 'theme'
    },
    {
      'avatar': 'icon_avatar', 'time': '2024/03/17 09:57:07',
      'content': '言情甜宠', 'role': 'user', 'type': 'themeAnswer'
    },
    {
      'avatar': 'icon_avatar', 'time': '2024/03/17 09:57:07',
      'content': '好的！请告诉我您希望的小说背景是什么样的，我将会依据此为您生成小说的世界观。请随意描述您希望的背景设定。', 'role': 'gpt', 'type': 'background'
    },
    {
      'avatar': 'icon_avatar', 'time': '2024/03/17 09:57:11',
      'content': '甜甜的世界', 'role': 'user', 'type': 'backgroundAnswer'
    },
    {
      'avatar': 'icon_avatar', 'time': '2024/03/17 09:57:12',
      'selected': 2,
      'content': '故事背景1：\n时间：古代\n地点：中原大地\n背景：大地上有诸多仙门，各自掌握着独特的法术和仙术。修炼者们以修仙为生，追求长生不老和超凡脱俗的境界。然而，仙门之间争斗不断，江湖之上密布暗流。主角是一位年轻的修炼者，他在经历一次惊险的遭遇后，踏上了寻找真相的征程，同时发现自己身上隐藏着惊人的秘密。\n\n故事背景2：\n时间：幻想未来\n地点：玄幻世界\n背景：科技和仙术融合的时代里，人们习得了控制元素的法术，使城市充满了神奇的景象。主角是一位普通人，意外得到了具有高度适应性的神秘法术，他被卷入了一场末日危机之中。为了拯救世界，他踏上了寻找守护神的旅途，同时揭开了人类历史上的秘密。\n\n故事背景3：\n时间：久远时代\n地点：神秘岛屿\n背景：在一个荒凉而神秘的岛屿上，居住着一群超凡修炼者。他们每隔一段时间，就进行一次至高无上的竞技大会，争夺掌握整个岛屿权力的机会。主角是一位天赋异禀的年轻修炼者，渴望成为传说中最强的存在。他在大会中结识了众多强敌和盟友，经历了一连串惊心动魄的冒险和挑战。\n\n故事背景4：\n时间：近未来\n地点：现代都市\n背景：在一个充满了法术技术的现代都市中，存在着一个神秘的组织，以保护人类不受妖魔鬼怪的侵扰。主角是一位普通的年轻人，因为一次意外暴露了自己的特殊能力，被这个秘密组织招募为成员。他在组织的指引下，与各种恶势力展开了斗争，逐渐认识到自己身上隐藏的力量。\n\n故事背景5：\n时间：古代\n地点：东方王朝\n背景：在一个以封建王朝为背景的时代里，仙术修行和政治力量纠缠在一起。主角是一位庶出的少年，因为机缘巧合获得了绝世仙术，卷入了王子之位的争夺中。他在残酷的宫廷斗争中与各方势力周旋，同时努力寻找平衡修行与政治的方法，最终领悟到了真正的力量所在。', 'role': 'gpt', 'type': 'backgroundGeneration'
    },
    {
      'avatar': 'icon_avatar', 'time': '2024/03/17 09:57:36',
      'content': '好的，请告诉我您想要设定的主要角色名称、年龄、性别以及他们的角色特征。',
      'role': 'gpt',
      'type': 'role',
      'roleStyleInfo':
        [{ 'id': 'XtJJ2zyP_Y', 'name': '张力', 'sex': '男', 'age': '青少年', 'character': ['美少女','大小姐'] },
        { 'id': 'XtJJ2zyP_Y', 'name': '丽丽', 'sex': '女', 'age': '青少年', 'character': ['美少女','大小姐'] }]
    },
    {
      'avatar': 'icon_avatar', 'time': '2024/03/17 09:58:00',
      'content': '好的！请告诉我您想要的情节背景、主要事件或冲突，以及您希望故事发展的方向。', 'role': 'gpt', 'type': 'plot'
    },
    {
      'avatar': 'icon_avatar', 'time': '2024/03/17 09:58:02',
      'content': '舍生取义', 'role': 'user', 'type': 'plotAnswer'
    },
    {
      'avatar': 'icon_avatar', 'time': '2024/03/17 09:58:02',
      'content': '选择您想要的文风。', 'role': 'gpt', 'type': 'writingStyle'
    },
    {
      'avatar': 'icon_avatar', 'time': '2024/03/17 09:58:02',
      'content': '轻小说风', 'role': 'user', 'type': 'writingStyleAnswer'
    },
    {
      'avatar': 'icon_avatar', 'time': '2024/03/17 09:58:03',
      'content': '', 'role': 'gpt', 'type': 'summary', 'outline': true, 'summaryList': [{ 'title': '小说题材', 'id': 'theme', 'content': '言情甜宠' }, { 'title': '背景设定', 'id': 'background', 'content': '时间：久远时代；地点：神秘岛屿；背景：在一个荒凉而神秘的岛屿上，居住着一群超凡修炼者。他们每隔一段时间，就进行一次至高无上的竞技大会，争夺掌握整个岛屿权力的机会。主角是一位天赋异禀的年轻修炼者，渴望成为传说中最强的存在。他在大会中结识了众多强敌和盟友，经历了一连串惊心动魄的冒险和挑战。' }, { 'title': '角色', 'id': 'role', 'content': '姓名：美美；性别：女；年龄：青少年；角色特征：辣妹；姓名：张力；性别：男；年龄：青少年；角色特征：剑客' }, { 'title': '情节', 'id': 'plot', 'content': '舍生取义' }, { 'title': '文风', 'id': 'writingStyle', 'content': '轻小说风' }]
    }]
}

// 添加会话
const addDialog = (opt: DialogData, time = 500) => {
  setTimeout(() => {
    chatDialogData.value.dialog.push({
      avatar: 'icon_avatar',
      time: parseTime(),
      ...opt
    })
  }, time)
}

// 引导按钮点击
const handleGuideButtonClick = async (data: Pick<DialogData, 'type' | 'content'>) => {

  const typeMapping: Record<string, number> = {
    '小说生成': 1,
    '小说续写': 2,
    '小说扩写': 3
  }

  const type = typeMapping[data.content] || 0

  const res = await Api.novel.createNovel({
    title: data.content,
    type
  })

  if (res.code === 0) {

    novelId.value = res.data.novel_id

    chatDialogData.value.guide.push({
      avatar: 'icon_avatar',
      time: parseTime(),
      content: data.content,
      type: 'guideAnswer',
      role: 'user'
    })

    chatDialogData.value.type = type

    const dialogMap: Record<number, DialogData> = {
      1: {
        content: '好的！请告诉我您希望的小说背景是什么样的，我将会依据此为您生成小说的世界观。请随意描述您希望的背景设定。',
        role: 'gpt',
        type: 'theme'
      },
      2: {
        content: '好的！请告诉我您希望的小说背景是什么样的',
        role: 'gpt',
        type: 'background'
      },
      3: {
        content: '好的！',
        role: 'gpt',
        type: 'summary'
      }
    }

    const dialog = dialogMap[type]

    if (dialog) {
      addDialog(dialog)
    }
  }
}

// 用户发送
const onInputSend = (value: string) => {
  if (chatDialogData.value.type === 1) {
    novelGenerationRef.value?.inputBackgroundAnswer(value)
  }
}

// 滚动到底部
const scrollElToBottom = () => {
  if (scrollElem.value) {
    scrollElem.value.scrollTop = scrollElem.value.scrollHeight
  }
}

onMounted(() => {
  initChatDialog()
})

</script>
<template>
  <div class="flex h-full flex-col bg-neutral-100">
    <div ref="scrollElem" class="flex-1 overflow-x-hidden">
      <div class="flex flex-col gap-y-5 p-4">
        <ChatInfoMutual :data="chatDialogData.guide[0]" :button-props="{
          disabled: !isEmpty(chatDialogData.guide[1])
        }" @button="handleGuideButtonClick" />
        <ChatInfo v-if="!isEmpty(chatDialogData.guide[1])" :data="chatDialogData.guide[1]" />
        <NovelGeneration v-if="(chatDialogData.type === 1)" ref="novelGenerationRef" :data="chatDialogData.dialog"
          :novel-id="novelId" @update="scrollElToBottom" />
      </div>
    </div>
    <InputBox :disabled="allowInputBox" @send="onInputSend" />
  </div>
</template>
<style></style>
