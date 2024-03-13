<script setup lang="ts">
import { ref } from 'vue'
import { Tab, Tabs, Button, Field, Tag } from 'vant'
import { Icon } from '@iconify/vue'
import { reactive } from 'vue'

interface RoleFeatureType {
  figure: Array<string>
  disposition: Array<string>
  customize: Array<string>
}

const roleFeatureData = reactive<RoleFeatureType>({
  figure: ['正太', '萝莉', '美少女', '美少男', '辣妹', '大小姐', '胖子', '伪娘', '御姐', '大叔', '剑客', '道士', '富豪', '侦探', '学生'],
  disposition: ['乐观豁达', '刚毅坚强', '聪明机智', '笨拙可爱', '善良仁慈', '冷漠孤傲', '勇敢无畏', '狡诈多疑', '狂妄自大', '心机深沉'],
  customize: []
})

const mutual = reactive({
  edit: false
})

const customizeValue = ref('')

const selected = ref<Array<string>>([])

const handleSelectClick = (value: string) => {

  const isExistIndex = selected.value.findIndex((item: string) => item === value)

  if (isExistIndex !== -1) {
    selected.value.splice(isExistIndex, 1)
  } else if (selected.value.length < 5) {
    selected.value.push(value)
  }
}

const handleAddCustomizeFeature = () => {
  roleFeatureData.customize.push(customizeValue.value)
  customizeValue.value = ''
}

const setSelected = (data: Array<string>)=>{
  selected.value = data
}

defineExpose({
  selected,
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
        <div class="flex flex-wrap justify-center gap-2 py-3">
          <Button
            v-for="item in roleFeatureData.figure"
            :key="item"
            size="small"
            :type="(selected.includes(item) ? 'primary' : 'default')"
            @click="handleSelectClick(item)"
          >
            {{ item }}
          </Button>
        </div>
      </Tab>
      <Tab title="性格特征">
        <div class="flex flex-wrap justify-center gap-2 py-3">
          <Button
            v-for="item in roleFeatureData.disposition"
            :key="item"
            size="small"
            :type="(selected.includes(item) ? 'primary' : 'default')"
            @click="handleSelectClick(item)"
          >
            {{ item }}
          </Button>
        </div>
      </Tab>
      <Tab title="自定义">
        <div class="py-3">
          <div>
            <div class="rounded-md bg-neutral-100/75">
              <Field
                v-model="customizeValue"
                placeholder="请输入特征"
                autocomplete="off"
                clearable
                class="!bg-transparent !px-2 !py-1.5"
              >
                <template #right-icon>
                  <div class="flex gap-x-1.5">
                    <Button
                      size="small"
                      type="success"
                      @click="handleAddCustomizeFeature"
                    >
                      添加
                    </Button>
                    <Button
                      size="small"
                      :type="(mutual.edit ? 'default' : 'warning')"
                      @click="(mutual.edit = !mutual.edit)"
                    >
                      {{ mutual.edit ? '取消' : '编辑' }}
                    </Button>
                  </div>
                </template>
              </Field>
            </div>
            <div class="mt-4 flex flex-wrap justify-center gap-1">
              <Button
                v-for="item in roleFeatureData.customize"
                :key="item"
                size="small"
                :type="(selected.includes(item) ? 'primary' : 'default')"
                @click="handleSelectClick(item)"
              >
                <div class="flex items-center">
                  <span>{{ item }}</span>
                  <div
                    v-if="mutual.edit"
                    class="ml-1 rounded-full p-0.5"
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
.van-button__content:before {
  content: "";
}
</style>
