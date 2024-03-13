<script setup lang="ts">
import { ref, h, watch, nextTick } from 'vue'
import { Form, Field, RadioGroup, Radio, Tag, Button } from 'vant'
import { Icon } from '@iconify/vue'
import { gsap } from 'gsap'
import { useBaseDialog } from '@/composables/useBaseDialog'
import RoleFeature from './RoleFeature.vue'
import { nanoid } from 'nanoid'

interface RoleType {
  id: string
  name: string
  sex: '0' | '1' // '0' 男性 | '1' 女性
  age: '0' | '1' | '2' | '3' // '0' 儿童 | '1' 青少年 | '2' 中年 | '3' 老年
  feature: Array<string>
}

const { openDialog } = useBaseDialog()

const defaultRole: RoleType = {
  id: nanoid(10),
  name: '',
  sex: '0',
  age: '1',
  feature: []
}

const roleListData = ref<Array<RoleType>>([{ ...defaultRole }])

const handleAddFeatureClick = (index: number) => {

  const roleFeatureInst = ref<InstanceType<typeof RoleFeature> | null>(null)

  openDialog({
    title: '角色特征(0/5)',
    message: () => h(RoleFeature, {
      ref: roleFeatureInst
    }),
    onConfirm() {
      roleListData.value[index].feature = roleFeatureInst.value?.selected || ['']
    }
  })

  nextTick(() => {
    roleFeatureInst.value?.setSelected([...roleListData.value[index].feature])
  })

}

const handleRemoveFeatureClick = (index: number, value: string) => {
  const featureIndex = roleListData.value[index].feature.findIndex(item => item === value)
  if (featureIndex !== -1) {
    roleListData.value[index].feature.splice(featureIndex, 1)
  }
}

const handleAddNewRoleClick = () => {
  roleListData.value.push({ ...defaultRole, id: nanoid(10) })

  // watch(() => roleFeatureInst.value?.selected, (n, o) => {

  // }, { immediate: true, deep: true })
}

const handleRemoveRoleClick = (index: number) => {
  roleListData.value.splice(index, 1)
}

const onBeforeEnter = (el: Element) => {
  gsap.to(el, {
    duration: 0,
    opacity: 0,
    scale: 0.6,
  })
}

const onEnter = (el: Element, done: () => void) => {
  gsap.to(el, {
    opacity: 1,
    scale: 1,
    onComplete: done
  })
}

const onLeave = (el: Element, done: () => void) => {
  gsap.to(el, {
    height: 0,
    scale: '0.9',
    onComplete: done
  })
}

const onTagLeave = (el: Element, done: () => void) => {
  gsap.to(el, {
    width: '0',
    paddingLeft: '0',
    paddingRight: '0',
    onComplete: done
  })
}

</script>
<template>
  <div class="rounded-md bg-white p-2.5 shadow-sm">
    <div class="mb-3 mt-1">
      <span class="text-primary">好的，请告诉我您想要设定的主要角色名称、年龄、性别以及他们的角色特征。填写后点击"下一步"</span>
    </div>
    <div class="flex flex-col gap-y-4">
      <TransitionGroup
        @before-enter="onBeforeEnter"
        @enter="onEnter"
        @leave="onLeave"
      >
        <div
          v-for="(item, index) in roleListData"
          :key="item.id"
          class="relative rounded bg-neutral-100"
        >
          <div
            v-if="(roleListData.length > 1)"
            class="absolute -right-1.5 -top-1.5 z-50"
          >
            <div
              class="flex rounded-full text-xl text-red-400 active:text-neutral-400"
              @click="handleRemoveRoleClick(index)"
            >
              <Icon icon="zondicons:close-solid" />
            </div>
          </div>
          <Form
            :label-width="'3.4em'"
            autocomplete="off"
            class="h-full overflow-hidden p-2"
          >
            <Field
              v-model="item.name"
              label="姓名"
              placeholder="请输入姓名"
              clearable
              :rules="[{ required: true, message: '请输入姓名' }]"
            />
            <Field label="性别">
              <template #input>
                <RadioGroup
                  v-model="item.sex"
                  direction="horizontal"
                  class="gap-2"
                >
                  <Radio name="0">
                    男性
                  </Radio>
                  <Radio name="1">
                    女性
                  </Radio>
                </RadioGroup>
              </template>
            </Field>
            <Field label="年龄">
              <template #input>
                <RadioGroup
                  v-model="item.age"
                  direction="horizontal"
                  class="gap-2"
                >
                  <Radio name="0">
                    儿童
                  </Radio>
                  <Radio name="1">
                    青少年
                  </Radio>
                  <Radio name="3">
                    中年
                  </Radio>
                  <Radio name="4">
                    老年
                  </Radio>
                </RadioGroup>
              </template>
            </Field>
            <Field
              label="特征"
              placeholder="请选择角色特征"
            >
              <template #input>
                <div class="flex flex-wrap gap-1">
                  <TransitionGroup
                    @before-enter="onBeforeEnter"
                    @enter="onEnter"
                    @leave="onTagLeave"
                  >
                    <Tag
                      v-for="feature in item.feature"
                      :key="feature"
                      type="primary"
                      size="medium"
                      class="overflow-hidden text-nowrap"
                      closeable
                      @close="handleRemoveFeatureClick(index, feature)"
                    >
                      {{ feature }}
                    </Tag>
                  </TransitionGroup>
                  <Tag
                    type="success"
                    size="medium"
                    plain
                    @click="handleAddFeatureClick(index)"
                  >
                    <span>
                      <Icon icon="mingcute:add-fill" />
                    </span>
                    <span class="ml-0.5">添加</span>
                  </Tag>
                </div>
              </template>
            </Field>
          </Form>
        </div>
      </TransitionGroup>
    </div>
    <div>
      <div class="mt-4 flex justify-between">
        <div
          class="mr-2 flex shrink-0 items-center   px-2 text-primary active:text-neutral-400"
          @click="handleAddNewRoleClick"
        >
          <Icon icon="zondicons:add-outline" />
          <span class="ml-2 text-sm">添加新角色</span>
        </div>
        <Button
          type="primary"
          round
        >
          &nbsp;&nbsp;下一步&nbsp;&nbsp;
        </Button>
      </div>
    </div>
  </div>
</template>
<style></style>
