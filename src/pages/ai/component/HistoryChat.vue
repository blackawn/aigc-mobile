<script setup lang="ts">
import { ref, computed, h, reactive } from 'vue'
import { Search, Button, Divider, Field, showToast, Loading, Empty } from 'vant'
import { Icon } from '@iconify/vue'
import Api, { NovelHistoryRes, NovelHistoryData } from '@/api'
import { isEmpty, every } from 'lodash'
import { useBaseDialog } from '@/composables/useBaseDialog'
import { gsap } from 'gsap'

const searchValue = ref('')

const novelHistoryListData = ref<NovelHistoryRes | null>(null)

const { openDialog, closeDialog } = useBaseDialog()

const mutual = reactive({
  modify: false,
  load: true
})

const formatNovelHistoryListData = computed(() => {
  return {
    top: {
      label: '置顶',
      list: novelHistoryListData.value?.today.filter((item) => item.is_top === 1)
    },
    today: {
      label: '今天',
      list: novelHistoryListData.value?.today.filter((item) => item.is_top === 0)
    },
    week: {
      label: '一周内',
      list: novelHistoryListData.value?.week
    },
    early: {
      label: '更早',
      list: novelHistoryListData.value?.early
    }
  }
})

const isEmptyListData = computed(() => every(novelHistoryListData.value, isEmpty))

const getNovelHistoryListData = async (keyword = '') => {
  const res = await Api.novel.getNovelHistory({
    search: keyword
  })

  mutual.load = false

  novelHistoryListData.value = res.data
}

// 编辑置顶
const handleToggleTopClick = async (data: NovelHistoryData) => {

  if (mutual.modify) return

  mutual.modify = true

  const res = await Api.novel.modifyNovelHistory({
    novel_id: data.novel_id,
    is_top: (data.is_top === 1 ? 0 : 1)
  }).finally(() => mutual.modify = false)

  if (res.code === 0) {
    getNovelHistoryListData()
  }
}

// 编辑标题
const handleEditClick = (data: NovelHistoryData) => {

  const value = ref(data.title)

  openDialog({
    title: '编辑标题',
    message: () => h(Field, {
      modelValue: value.value,
      border: false,
      size: 'large',
      autocomplete: 'off',
      placeholder: '请输入标题',
      class: '!bg-neutral-100',
      clearable: true,
      'onUpdate:modelValue': (v) => value.value = v
    }),
    onConfirm: async () => {
      if (isEmpty(value.value?.trim())) {
        showToast('请输入标题')
        return
      }

      const res = await Api.novel.modifyNovelHistory({
        title: value.value,
        novel_id: data.novel_id
      })

      if (res.code === 0) {
        closeDialog()
        getNovelHistoryListData()
      }
    }

  })
}

// 删除
const handleDeleteClick = (data: NovelHistoryData) => {

  openDialog({
    message: `确定删除"${data.title}"?`,
    onConfirm: async () => {
      const res = await Api.novel.deleteNovelHistory(data.novel_id).finally(() => {
        closeDialog()
      })

      if (res.code === 0) {
        getNovelHistoryListData()
      }
    }
  })
}

const onBeforeEnter = (el: Element) => {
  gsap.to(el, {
    translateX: '-100%',
    duration: 0
  })
}

const onEnter = (el: Element, done: () => void) => {

  const elem = el as HTMLElement
  const index = Number(elem.dataset.index)

  gsap.to(el, {
    translateX: '0',
    delay: index * 0.1,
    onComplete: done,
    clearProps: 'all'
  })
}

const onLeave = (el: Element, done: () => void) => {
  gsap.to(el, {
    translateX: '100%',
    onComplete: done
  })
}

defineExpose({
  getNovelHistoryListData
})

</script>
<template>
  <div class="flex h-full flex-col p-4">
    <div class="mb-2 flex items-center">
      <Search
        v-model="searchValue"
        placeholder="请输入搜索关键词"
        class="flex-1 !py-0 !pl-0 !pr-2"
        autocomplete="off"
        @click-left-icon="getNovelHistoryListData(searchValue)"
        @search="getNovelHistoryListData(searchValue)"
      >
        <template #left-icon>
          <Icon
            icon="tabler:search"
            class="text-xl"
          />
        </template>
      </Search>
      <Button
        size="small"
        type="success"
        class="!px-3"
      >
        <Icon icon="fluent:add-12-filled" />
      </Button>
    </div>
    <div class="scroll-hidden flex-1 overflow-x-hidden">
      <div
        v-if="mutual.load"
        class="flex h-full items-center justify-center"
      >
        <Loading />
      </div>
      <div
        v-else-if="isEmptyListData"
        class="flex h-full items-center justify-center"
      >
        <Empty description="没有数据" />
      </div>
      <div
        v-for="item in formatNovelHistoryListData"
        :key="item.label"
      >
        <Divider
          v-if="!isEmpty(item.list)"
          class="!my-2 text-sm"
          content-position="left"
        >
          {{ item.label }}
        </Divider>
        <div class="flex flex-col gap-y-1.5">
          <TransitionGroup
            name="fade"
            @before-enter="onBeforeEnter"
            @enter="onEnter"
            @leave="onLeave"
          >
            <div
              v-for="(record, index) in item.list"
              :key="record.novel_id"
              class="flex items-center gap-x-2 rounded bg-neutral-100 px-4 py-3"
              :data-index="index"
            >
              <div>
                <Icon icon="lucide:book-open-text" />
              </div>
              <span class="flex-1 text-sm">{{ record.title }}</span>
              <div class="flex gap-x-4">
                <div
                  class="active:text-neutral-400"
                  @click="handleToggleTopClick(record)"
                >
                  <Icon
                    v-if="record.is_top === 1"
                    icon="lucide:arrow-down-to-line"
                  />
                  <Icon
                    v-else
                    icon="lucide:arrow-up-to-line"
                  />
                </div>
                <div
                  class="active:text-neutral-400"
                  @click="handleEditClick(record)"
                >
                  <Icon icon="lucide:edit" />
                </div>
                <div
                  class="active:text-neutral-400"
                  @click="handleDeleteClick(record)"
                >
                  <Icon icon="mi:delete" />
                </div>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </div>
    </div>
  </div>
</template>
<style>
.van-divider--content-left:before {
  @apply max-w-0 mr-2;
}

.fade-move {
  @apply duration-300
}
</style>
