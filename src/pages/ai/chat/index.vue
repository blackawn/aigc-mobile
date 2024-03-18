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

  /*
  chatDialogData.value.guide.push({
    avatar: 'icon_avatar',
    time: parseTime(),
    content: '小说生成',
    role: 'user',
    type: 'guideAnswer'
  })

  chatDialogData.value.type = 1

  chatDialogData.value.dialog = [{
    'avatar': 'icon_avatar',
    'time': '2024/03/18 13:43:45',
    'content': '好的！请告诉我您希望的小说背景是什么样的，我将会依据此为您生成小说的世界观。请随意描述您希望的背景设定。',
    'role': 'gpt',
    'type': 'theme'
  }, {
    'avatar': 'icon_avatar',
    'time': '2024/03/18 13:43:45',
    'content': '武侠古典',
    'role': 'user',
    'type': 'themeAnswer'
  }, {
    'avatar': 'icon_avatar',
    'time': '2024/03/18 13:43:46',
    'content': '好的！请告诉我您希望的小说背景是什么样的，我将会依据此为您生成小说的世界观。请随意描述您希望的背景设定。',
    'role': 'gpt',
    'type': 'background'
  }, {
    'avatar': 'icon_avatar',
    'time': '2024/03/18 13:43:48',
    'content': '悬疑推理',
    'role': 'user',
    'type': 'themeAnswer'
  }, {
    'avatar': 'icon_avatar',
    'time': '2024/03/18 13:43:48',
    'content': '好的！请告诉我您希望的小说背景是什么样的，我将会依据此为您生成小说的世界观。请随意描述您希望的背景设定。',
    'role': 'gpt',
    'type': 'background'
  }, {
    'avatar': 'icon_avatar',
    'time': '2024/03/18 13:43:58',
    'content': '柯南侦探的世界',
    'role': 'user',
    'type': 'backgroundAnswer'
  }, {
    'avatar': 'icon_avatar',
    'time': '2024/03/18 13:43:59',
    'content': '故事背景1：\n时间：古代\n地点：中国古代的华山\n背景：在这个世界中，华山是一个名副其实的修炼圣地，众多仙家弟子在此修行，争夺修炼资源并展开激烈争斗。华山的山峰上聚集着神奇的仙气，少数人能够悟得其中的法则，踏入玄奥的修行境界。然而，一个黑暗势力秘密潜伏在华山之中，企图获得华山仙气的掌控权，给整个修炼界带来巨大威胁。\n\n故事背景2：\n时间：现代\n地点：中国东部一座现代化都市\n背景：在这个世界中，科技与法术并存，人们通过学习古老的仙术，掌握了一些神奇的力量。这座都市成为修行者们的聚集地，其中一个特殊的区域——修真塔成为修行者们修炼、切磋的场所。修真塔内蕴藏着古老而神秘的力量，进入其中的修行者们将迎来各种挑战，只有战胜这些挑战，才能得到真正的修炼机缘。\n\n故事背景3：\n时间：近未来\n地点：全球各地的秘境禁地\n背景：在这个世界中，神秘的秘境禁地散布在全球各地，每个禁地都蕴藏着不同的修行机缘。这些禁地是由上古仙人留下的古老法术构成，并受到神秘势力的守护。修行者们必须先击败禁地中的守护者，才能获得仙术的奇缘，突破自身境界。然而，近年来有人发现了一个更为神奇的秘境禁地——通天福地的存在，成为了所有修行者们争夺的焦点。\n\n故事背景4：\n时间：宋朝\n地点：中原大地北方\n背景：在这个世界中，法术与武学共同发展。世人争相学习高深的法术，修炼出属于自己的一身本领，并在江湖中扬名立万。\n\n故事背景5：\n时间：未来\n地点：一颗神秘的异界星球\n背景：在这个世界中，人类掌握了跨越时空的科技，在多个未知星球中建立了殖民地。然而，这颗神秘的异界星球是充满了法术能量的，因此吸引着众多修行者前来开拓和探索。修行者们必须通过学习和修炼法术，才能在这个星球中生存和发展。然而，异界星球中隐藏着未知的危机和阻碍，修行者们需要面对各种艰难险阻，努力突破自我，最终开启异界星球的奥秘。',
    'role': 'gpt',
    'keyword': '柯南侦探的世界',
    'novelId': 1696,
    'type': 'backgroundGeneration',
    'selected': 3
  }, {
    'avatar': 'icon_avatar',
    'time': '2024/03/18 13:46:28',
    'content': '好的，请告诉我您想要设定的主要角色名称、年龄、性别以及他们的角色特征。',
    'role': 'gpt',
    'type': 'role',
    'roleStyleInfo': [{
      'id': 'QtnTLir-re',
      'name': '张力里',
      'sex': '男',
      'age': '青少年',
      'character': '富豪,道士,大小姐,胖子,伪娘'
    }, {
      'id': 'mp3MKV2Xhh',
      'name': '美家力',
      'sex': '女',
      'age': '青少年',
      'character': '善良仁慈,狂妄自大,勇敢无畏,笨拙可爱'
    }, {
      'id': 'r8cwVfsF-m',
      'name': '破将',
      'sex': '男',
      'age': '老年',
      'character': '辣妹'
    }]
  }, {
    'avatar': 'icon_avatar',
    'time': '2024/03/18 13:47:11',
    'content': '好的！请告诉我您想要的情节背景、主要事件或冲突，以及您希望故事发展的方向。',
    'role': 'gpt',
    'type': 'plot',
    'selectList': '邪道能力，巧解危机，王道信念，赢人一点，严肃搞笑'
  }, {
    'avatar': 'icon_avatar',
    'time': '2024/03/18 13:47:15',
    'content': '邪道能力，巧解危机，王道信念，赢人一点，严肃搞笑',
    'role': 'user',
    'type': 'plotAnswer'
  }, {
    'avatar': 'icon_avatar',
    'time': '2024/03/18 13:47:16',
    'content': '选择您想要的文风。',
    'role': 'gpt',
    'type': 'writingStyle'
  }, {
    'avatar': 'icon_avatar',
    'time': '2024/03/18 13:47:19',
    'content': '马克吐温幽默风',
    'role': 'user',
    'type': 'writingStyleAnswer'
  }, {
    'avatar': 'icon_avatar',
    'time': '2024/03/18 13:47:19',
    'content': '',
    'role': 'gpt',
    'type': 'summary',
    'outline': true,
    'summaryList': [{
      'title': '小说题材',
      'id': 'theme',
      'content': '悬疑推理'
    }, {
      'title': '背景设定',
      'id': 'background',
      'content': '时间：宋朝\n地点：中原大地北方\n背景：在这个世界中，法术与武学共同发展。世人争相学习高深的法术，修炼出属于自己的一身本领，并在江湖中扬名立万。'
    }, {
      'title': '角色',
      'id': 'role',
      'content': '姓名：张力里；性别：男；年龄：青少年；角色特征：富豪,道士,大小姐,胖子,伪娘；姓名：美家力；性别：女；年龄：青少年；角色特征：善良仁慈,狂妄自大,勇敢无畏,笨拙可爱；姓名：破将；性别：男；年龄：老年；角色特征：辣妹'
    }, {
      'title': '情节',
      'id': 'plot',
      'content': '邪道能力，巧解危机，王道信念，赢人一点，严肃搞笑'
    }, {
      'title': '文风',
      'id': 'writingStyle',
      'content': '马克吐温幽默风'
    }]
  },{
    'avatar': 'icon_avatar',
    'time': '2024/03/18 13:47:19',
    'role': 'gpt',
    'type': 'outlineGeneration',
    'content': `小说的标题：《玄幻仙侠之悬疑推理》

第1章
  标题：危机与相遇
  大纲：张力里意外发现了一本失传已久的秘笈，使他成为了众人追逐的目标。在逃亡的过程中，他遇到了神秘而有能力的美家力，两人结伴踏上了寻找真相的道路。他们遭到一群邪道势力的袭击，但幸运地被破将救了下来。破将教导他们掌握更多的武学技巧，帮助他们解决困难。

第2章
  标题：邪道与正义
  大纲：张力里和美家力发现了一个邪道组织的阴谋，他们希望揭示真相并保护民众。经过一番搜证和斗智斗勇，他们终于揭开了邪道组织的罪行，并将其送入了正义的审判之下。在这个过程中，美家力展现了她的勇气和智慧，赢得了人们的尊重和信任。

第3章
  标题：秘宝与危险
  大纲：在一次意外中，张力里得到了一个秘宝的线索。他和美家力决定探索这个秘宝的来历与内涵，以及它所蕴含的力量。他们穿越凶险的山谷，经历了重重考验，最终找到了秘宝所在的地方。然而，他们并没有想到的是，这个秘宝竟然是一个致命的陷阱。

第4章
  标题：友谊与背叛
  大纲：张力里和美家力遭到了邪道势力的背叛，他们的秘宝被夺走，并被困在了一个陌生的地方。在这个地方，他们结交了一些志同道合的朋友，并一起制定了逃离的计划。经过大家的努力，他们成功地逃脱了，并得知了背叛他们的人的真正身份。友谊得到了加深，背叛的人受到了应有的惩罚。

第5章
  标题：真相与冒险
  大纲：张力里和美家力最终找到了秘宝的真正秘密，以及它背后的古老秘辛。他们决定将这个秘密公之于众，以便维护正义和平衡。然而，这个过程中充满了各种挑战和危险。他们需要积极应对，巧妙解决问题，并将真相传达给世人。他们的冒险之旅，让他们的信念更加坚定，赢得了人们的敬佩和赞誉。`
  }]
  */
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
    <div
      ref="scrollElem"
      class="flex-1 overflow-x-hidden"
    >
      <div class="flex flex-col gap-y-5 p-4">
        <ChatInfoMutual
          :data="chatDialogData.guide[0]"
          :button-props="{
            disabled: !isEmpty(chatDialogData.guide[1])
          }"
          @button="handleGuideButtonClick"
        />
        <ChatInfo
          v-if="!isEmpty(chatDialogData.guide[1])"
          :data="chatDialogData.guide[1]"
        />
        <NovelGeneration
          v-if="(chatDialogData.type === 1)"
          ref="novelGenerationRef"
          :data="chatDialogData.dialog"
          :novel-id="novelId"
          @update="scrollElToBottom"
        />
      </div>
    </div>
    <InputBox
      :disabled="allowInputBox"
      @send="onInputSend"
    />
  </div>
</template>
<style></style>
