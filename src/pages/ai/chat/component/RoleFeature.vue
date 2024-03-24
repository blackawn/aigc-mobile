<script setup lang="ts">
import { ref } from 'vue'
import { Tab, Tabs, Button, Field, Tag, showToast } from 'vant'
import { Icon } from '@iconify/vue'
import { reactive } from 'vue'
import { storeConfig } from '@/store/config'
import Api, { CustomizeFeature } from '@/api'
import { onMounted } from 'vue'

interface RoleFeatureData {
  figure: Array<string>
  disposition: Array<string>
  customize: Array<CustomizeFeature>
}

const configStore = storeConfig()

const figure = configStore.configList.filter((t) => (t.type === 2)).map((item) => item.name)

const disposition = configStore.configList.filter((t) => (t.type === 3)).map((item) => item.name)

const roleFeatureList = reactive<RoleFeatureData>({
  figure,
  disposition,
  customize: []
})

const mutual = reactive({
  edit: false
})

const customizeValue = ref('')

const selectList = ref<Array<string>>([])

// 选择特征点击
const handleSelectClick = (value: string) => {

  const isExistIndex = selectList.value.findIndex((item: string) => item === value)

  if (isExistIndex !== -1) {
    selectList.value.splice(isExistIndex, 1)
  } else if (selectList.value.length >= 5) {
    showToast('最多选5个特征')
  } else {
    selectList.value.push(value)
  }

}

// 添加自定义特征
const handleAddCustomizeFeatureClick = async () => {

  if (!customizeValue.value.trim()) return

  const res = await Api.config.createCustomizeFeature(customizeValue.value.trim())

  if (res.code === 0) {
    getCustomizeFeatureList()

    customizeValue.value = ''
  }

}

// 自定义特征点击
const handleCustomizeFeatureClick = (value: string) => {
  if (mutual.edit) return

  handleSelectClick(value)
}

const handleRemoveCustomizeFeatureClick = async (id: number) => {
  const res = await Api.config.deleteCustomizeFeature(id)

  if(res.code === 0){
    getCustomizeFeatureList()
  }
}

// 获取自定义特征
const getCustomizeFeatureList = async () => {
  const res = await Api.config.getCustomizeFeature()

  roleFeatureList.customize = res.data.list
}

const setSelected = (data: Array<string>) => {
  selectList.value = data
}

onMounted(() => {
  getCustomizeFeatureList()
})

defineExpose({
  selectList,
  setSelected
})

</script>
<template>
  <div>
    <Tabs
      swipeable
      line-height="0"
    >
      <Tab title="人物特征">
        <div class="grid grid-cols-4 gap-2 py-3">
          <Button
            v-for="item in roleFeatureList.figure"
            :key="item"
            size="small"
            :type="(selectList.includes(item) ? 'primary' : 'default')"
            @click="handleSelectClick(item)"
          >
            {{ item }}
          </Button>
        </div>
      </Tab>
      <Tab title="性格特征">
        <div class="grid grid-cols-3 gap-2 py-3">
          <Button
            v-for="item in roleFeatureList.disposition"
            :key="item"
            size="small"
            :type="(selectList.includes(item) ? 'primary' : 'default')"
            @click="handleSelectClick(item)"
          >
            {{ item }}
          </Button>
        </div>
      </Tab>
      <Tab title="自定义">
        <div class="py-3">
          <div>
            <div class="flex items-center gap-x-2">
              <Field
                v-model="customizeValue"
                placeholder="请输入特征"
                autocomplete="off"
                clearable
                class="rounded !bg-neutral-100 !px-2.5 !py-1.5"
                :border="false"
              />

              <Button
                size="small"
                type="success"
                class="shrink-0"
                @click="handleAddCustomizeFeatureClick"
              >
                添加
              </Button>
              <Button
                size="small"
                class="shrink-0"
                :type="(mutual.edit ? 'default' : 'warning')"
                @click="(mutual.edit = !mutual.edit)"
              >
                {{ mutual.edit ? '取消' : '编辑' }}
              </Button>
            </div>
            <div class="mt-4 grid grid-cols-3 gap-2">
              <Button
                v-for="item in roleFeatureList.customize"
                :key="item.id"
                size="small"
                :class="{
                  'pointer-events-none': mutual.edit
                }"
                :type="(selectList.includes(item.name) ? 'primary' : 'default')"
                @click="handleCustomizeFeatureClick(item.name)"
              >
                <div class="flex items-center">
                  <span>{{ item.name }}</span>
                  <div
                    v-if="mutual.edit"
                    class="pointer-events-auto ml-1 rounded-full p-0.5 active:text-red-400"
                    @click="handleRemoveCustomizeFeatureClick(item.id)"
                  >
                    <Icon icon="gridicons:cross" />
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </Tab>
    </Tabs>
  </div>
</template>
<style>
</style>
