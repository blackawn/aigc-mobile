<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { Icon } from '@iconify/vue'
import { Button } from 'vant'
import { isEmpty } from 'lodash'
import { NativeEventSource, } from 'event-source-polyfill'

interface OutlineGenerationProps {
  data?: string
}

const props = withDefaults(defineProps<OutlineGenerationProps>(), {
  data: ''
})

const mutual = reactive({
  generate: false
})

const tempElemRef = ref<HTMLDivElement | null>(null)

const g = () => {

  const tempElem = tempElemRef.value as HTMLDivElement

  const content = '小说题材：科幻未来；背景设定：时间：2999年的夏季新纪元节；地点：太阳系尽头，汽化行星Omega-3上的生态穹顶；背景：意识上载至虚拟实境、环太阳系的快速交通网络铁路、全息影像取代传统教育、局部时间波动事件的探秘小说角色：姓名：力；性别：男；年龄：青少年；角色特征：刚毅坚强；小说情节：舍生取义；小说文风：金庸武侠风；'

  const url = `${import.meta.env.VITE_APP_API_URL.replace(/\/$/, '')}/novel/generate/content?novel_id=${1630}&content=${content}&chapter=1`

  let esp: EventSource | null = new NativeEventSource(url)

  esp.addEventListener('message', (message) => {
    // 临时打印生成的内容, 只操作dom
    tempElem.textContent += JSON.parse(message.data).content
  })

  esp.addEventListener('error', () => {

    esp = null
  })

}

</script>
<template>
  <div class="rounded-md bg-white p-3 text-sm shadow-sm">
    <div class="mb-2">
      <span>小说生成</span>
    </div>
    <div
      v-show="!isEmpty(props.data)"
      class="whitespace-pre-wrap rounded bg-neutral-100 p-2 text-justify text-sm"
    >
      {{ props.data }}
    </div>
    <div
      ref="tempElemRef"
      class="whitespace-pre-wrap text-justify text-sm"
    />
    <div
      v-if="!mutual.generate"
      class="mt-3 flex justify-between"
    >
      <div class="mr-2 flex shrink-0 items-center px-2 text-primary active:text-neutral-400">
        <Icon
          icon="tabler:refresh"
          class="text-xl"
        />
        <span class="ml-2 text-sm">重新生成</span>
      </div>
      <div class="flex items-center gap-x-2">
        <Button
          size="small"
          round
          type="default"
        >
          &nbsp;&nbsp;&nbsp;编辑大纲&nbsp;&nbsp;&nbsp;
        </Button>
        <Button
          type="primary"
          round
          size="small"
          @click="g"
        >
          &nbsp;&nbsp;&nbsp;&nbsp;立即生成小说&nbsp;&nbsp;&nbsp;&nbsp;
        </Button>
      </div>
    </div>
  </div>
</template>
<style></style>
