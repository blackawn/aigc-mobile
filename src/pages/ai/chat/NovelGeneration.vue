<script setup lang="ts">
import { ref, reactive, computed, watchEffect, nextTick } from 'vue'
import type { DialogData, DialogType, SummaryData, RoleStyleInfoData } from './component/types'
import ChatInfo from './component/ChatInfo.vue'
import ChatInfoMutual from './component/ChatInfoMutual.vue'
import ChatInfoMutualMultiple from './component/ChatInfoMutualMultiple.vue'
import BackgroundGeneration from './component/BackgroundGeneration.vue'
import RoleGeneration from './component/RoleGeneration.vue'
import OutlineInfo from './component/OutlineInfo.vue'
import OutlineGeneration from './component/OutlineGeneration.vue'
import ChapterGeneration from './component/ChapterGeneration.vue'
import Api from '@/api'
import { parseTime } from '@/utils/format'
import { nanoid } from 'nanoid'
import { last, isEmpty } from 'lodash'
import { onMounted } from 'vue'

interface NovelGenerationProps {
  guide?: Array<DialogData>
  data: Array<DialogData>
  novelId: number
}

const props = withDefaults(defineProps<NovelGenerationProps>(), {
  guide: () => [],
  data: () => [],
  novelId: -1
})

const emit = defineEmits<{
  (e: 'update'): void
}>()

const chatDialogData = ref<Array<DialogData>>([...props.data])

const outlineInfoList = ref<Array<SummaryData>>([])

const novelId = ref<number>(props.novelId)

const lastDialog = computed(() => last(chatDialogData.value))

// 更改会话内容
const modifyDialog = (type: DialogType, data: Partial<DialogData>, index?: number) => {

  if (!isEmpty(chatDialogData.value)) {
    // 如果提供了索引参数，则只修改特定索引位置的对象
    if (typeof index === 'number' && index >= 0 && index < chatDialogData.value.length) {
      chatDialogData.value[index] = {
        ...chatDialogData.value[index],
        ...data
      }
    } else {

      // 否则，遍历数组，修改所有符合条件的对象
      chatDialogData.value = chatDialogData.value.map((item) => {
        if (item.type === type) {
          return {
            ...item,
            ...data
          }
        }
        return item
      })
    }
  }
}

// 添加会话
const addDialog = async (opt: DialogData, time = 500, callback?: () => void) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const newDialog = {
        avatar: 'icon_avatar',
        time: parseTime(),
        ...opt
      }

      try {
        chatDialogData.value.push(newDialog)
        if (callback) {
          callback()
        }
        resolve(newDialog)
      } catch (error) {
        reject(error)
      }
    }, time)
  })
}

// 输入背景
const inputBackgroundAnswer = (value: string) => {

  if (novelId.value) {
    addDialog({
      content: value,
      role: 'user',
      type: 'backgroundAnswer'
    }, 0).then(() => {
      addDialog({
        content: '',
        role: 'gpt',
        keyword: value,
        novelId: novelId.value,
        type: 'backgroundGeneration'
      })
    })
  }

}

// 确认背景
const handleConfirmBackgroundContentClick = (data: { allContent: string, content: string, selected: number }) => {

  modifyDialog('backgroundGeneration', {
    selected: data.selected,
    content: data.allContent
  })

  outlineInfoList.value.push({
    title: '背景设定',
    id: 'background',
    content: data.content
  })

  addDialog({
    content: '好的，请告诉我您想要设定的主要角色名称、年龄、性别以及他们的角色特征。',
    role: 'gpt',
    type: 'role',
    roleStyleInfo: [{
      id: nanoid(10),
      name: '',
      sex: '男',
      age: '青少年',
      character: []
    }]
  })

}

// 确认角色
const handleConfirmRoleListClick = (data: Array<RoleStyleInfoData>) => {
  let content = ''

  data.forEach((role) => {
    content += `姓名：${role.name}；性别：${role.sex}；年龄：${role.age}；角色特征：${role.character}；`
  })

  console.log(data)

  modifyDialog('role', {
    roleStyleInfo: data
  })

  outlineInfoList.value.push({
    title: '角色',
    id: 'role',
    content: content.slice(0, -1)
  })

  addDialog({
    content: '好的！请告诉我您想要的情节背景、主要事件或冲突，以及您希望故事发展的方向。',
    role: 'gpt',
    type: 'plot'
  })

}

// 确认大纲信息
const handleConfirmOutlineInfoClick = () => {

  //mutualData.outlineInfoData = [{ 'title': '小说题材', 'id': 'theme', 'content': '都市生活' }, { 'title': '背景设定', 'id': 'background', 'content': '时间：古代；地点：仙界门派；背景：仙界门派是修真界最神秘的存在，他们位于终南山脉之巅。仙界门派的修真者们拥有超凡的法力和惊人的仙术，可以操控自然界的力量。门派中流传着许多神话和传说，有人说门派的始创者是一位半神半仙，曾经与天地之灵达成契约，获得无穷的修炼资源。每个修真者都渴望成为门派的一员，个个都是天之骄子，并为了进入门派展开了你争我夺的争斗。' }, { 'title': '角色', 'id': 'role', 'content': '姓名：丽丽；性别：女；年龄：青少年；角色特征：富豪' }, { 'title': '情节', 'id': 'plot', 'content': '舍生取义' }, { 'title': '文风', 'id': 'writingStyle', 'content': '轻小说风' }]
  addDialog({
    content: '',
    role: 'gpt',
    type: 'outlineGeneration',
    novelId: novelId.value
  })
}

// 生成小说
const handleConfirmChapterGenerationClick = (content: string) => {
  modifyDialog('outlineGeneration', {
    content
  })

  addDialog({
    content: '',
    role: 'gpt',
    type: 'chapterGeneration',
    chapter: 1,
    novelId: novelId.value
  })
}

// 聊天框按钮交互点击
const handleChatMutualButtonClick = (data: Pick<DialogData, 'type' | 'content'>) => {

  // 主题选择
  if (data.type === 'theme') {
    chatDialogData.value.push({
      avatar: 'icon_avatar',
      time: parseTime(),
      content: data.content,
      role: 'user',
      type: 'themeAnswer'
    })

    // 更新标题
    Api.novel.modifyNovelHistory({
      novel_id: novelId.value,
      title: `小说生成 - ${data.content}`
    })

    outlineInfoList.value[0] = {
      title: '小说题材',
      id: 'theme',
      content: data.content
    }

    // 背景选择
    addDialog({
      content: '好的！请告诉我您希望的小说背景是什么样的，我将会依据此为您生成小说的世界观。请随意描述您希望的背景设定。',
      role: 'gpt',
      type: 'background'
    })

  }

  // 文风
  if (data.type === 'writingStyle') {
    addDialog({
      content: data.content,
      role: 'user',
      type: 'writingStyleAnswer'
    }, 0).then(() => {
      outlineInfoList.value.push({
        title: '文风',
        id: 'writingStyle',
        content: data.content
      })

      // 大纲
      addDialog({
        content: '',
        role: 'gpt',
        type: 'summary',
        outline: true,
        summaryList: outlineInfoList.value
      })
    })
  }
}

// 聊天框按钮多选交互点击
const handleChatMutualMultipleConfirmClick = (data: Pick<DialogData, 'type' | 'content'>) => {

  // 情节选择
  if (data.type === 'plot') {
    addDialog({
      content: data.content,
      role: 'user',
      type: 'plotAnswer'
    }).then(() => {

      outlineInfoList.value.push({
        title: '情节',
        id: 'plot',
        content: data.content
      })

      // 文风选择
      addDialog({
        content: '选择您想要的文风。',
        role: 'gpt',
        type: 'writingStyle'
      })
    })
  }
}

// 可以交互的按钮
const getDialogMutualStatus = (type: DialogType) => {
  // 主题选择禁用
  return (type === 'theme' && !['theme', 'background'].includes((lastDialog.value?.type as string))) ||
    // 情节
    (type === 'plot' && lastDialog.value?.type !== 'plot') ||
    // 文风
    (type === 'writingStyle' && lastDialog.value?.type !== 'writingStyle')
}

// 保存会话信息
const savaChatDialogList = () => {

  const data = {
    guide: props.guide,
    dialog: chatDialogData.value,
  }

  Api.novel.saveChatDialogList({
    novel_id: novelId.value,
    content: JSON.stringify(data),
    type: 'sys'
  })
}

watchEffect(() => {
  chatDialogData.value = [...props.data]
  novelId.value = props.novelId
})

watchEffect(() => {
  if (chatDialogData.value.length) {
    requestAnimationFrame(() => emit('update'))
  }
})

onMounted(() => {
  novelId.value = 1630
})

defineExpose({
  inputBackgroundAnswer,
  lastDialog
})

</script>
<template>
  <template
    v-for="dialog in chatDialogData"
    :key="dialog.time"
  >
    <ChatInfoMutual
      v-if="(['theme', 'writingStyle'].includes(dialog.type))"
      :data="dialog"
      :button-props="{
        disabled: getDialogMutualStatus(dialog.type)
      }"
      @button="handleChatMutualButtonClick"
      @mounted="savaChatDialogList"
    />
    <ChatInfo
      v-else-if="(['background', 'themeAnswer', 'backgroundAnswer', 'plotAnswer', 'writingStyleAnswer'].includes(dialog.type))"
      :data="dialog"
      @mounted="savaChatDialogList"
    />
    <BackgroundGeneration
      v-else-if="(dialog.type === 'backgroundGeneration')"
      :data="dialog.content"
      :selected="dialog.selected"
      :novel-id="dialog.novelId"
      :keyword="dialog.keyword"
      :disabled="(lastDialog?.type !== 'backgroundGeneration')"
      @confirm="handleConfirmBackgroundContentClick"
    />
    <RoleGeneration
      v-else-if="(dialog.type === 'role')"
      :disabled="(lastDialog?.type !== 'role')"
      :data="dialog.roleStyleInfo"
      @confirm="handleConfirmRoleListClick"
    />
    <OutlineInfo
      v-else-if="(dialog.type === 'summary')"
      :data="dialog.summaryList"
      :allow-mutual="(lastDialog?.type === 'summary')"
      :novel-id="novelId"
      @confirm="handleConfirmOutlineInfoClick"
    />
    <OutlineGeneration
      v-else-if="(dialog.type === 'outlineGeneration')"
      :data="dialog.content"
      :novel-id="dialog.novelId"
      :allow-mutual="((lastDialog?.type === 'outlineGeneration') && !isEmpty(lastDialog.content))"
      @confirm="handleConfirmChapterGenerationClick"
    />
    <ChatInfoMutualMultiple
      v-else-if="(dialog.type === 'plot')"
      :data="dialog"
      :button-props="{
        disabled: getDialogMutualStatus(dialog.type)
      }"
      @confirm="handleChatMutualMultipleConfirmClick"
    />
    <ChapterGeneration
      v-else-if="(dialog.type === 'chapterGeneration')"
      :data="dialog.content"
      :chapter="dialog.chapter"
      :novel-id="dialog.novelId"
    />
  </template>
</template>
<style></style>
