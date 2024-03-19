<script setup lang="ts">
import { ref, h, watch, nextTick } from 'vue'
import { Form, Field, RadioGroup, Radio, Tag, Button, showToast } from 'vant'
import { Icon } from '@iconify/vue'
import { gsap } from 'gsap'
import { useBaseDialog } from '@/composables/useBaseDialog'
import RoleFeature from './RoleFeature.vue'
import { nanoid } from 'nanoid'
import { isEmpty, isString } from 'lodash'
import { RoleStyleInfoData } from './types'
import { watchEffect } from 'vue'

interface RoleGenerationProps {
  data?: Array<RoleStyleInfoData>
  disabled?: boolean
}

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'confirm', data: Array<RoleStyleInfoData>): void
}>()

const { openDialog } = useBaseDialog()

const defaultRole: RoleStyleInfoData = {
  id: nanoid(10),
  name: '',
  sex: '男',
  age: '青少年',
  character: []
}

const props = withDefaults(defineProps<RoleGenerationProps>(), {
  data: () => [],
  disabled: true
})

const roleList = ref<Array<RoleStyleInfoData>>([...props.data])

const handleAddFeatureClick = (index: number) => {

  const roleFeatureInst = ref<InstanceType<typeof RoleFeature> | null>(null)

  openDialog({
    title: '角色特征(0/5)',
    message: () => h(RoleFeature, {
      ref: roleFeatureInst
    }),
    onConfirm() {
      roleList.value[index].character = roleFeatureInst.value?.selectList || ['']
    }
  })

  nextTick(() => {
    roleFeatureInst.value?.setSelected([...roleList.value[index].character])
  })

}

const handleRemoveFeatureClick = (index: number, value: string) => {
  const featureIndex = (roleList.value[index].character as Array<string>).findIndex((item: string) => item === value)
  if (featureIndex !== -1) {
    (roleList.value[index].character as Array<string>).splice(featureIndex, 1)
  }
}

const handleAddNewRoleClick = () => {

  if (roleList.value.length >= 5) {
    showToast('最多添加5个角色!')
    return
  }

  roleList.value.push({ ...defaultRole, id: nanoid(10) })

  nextTick(() => {
    emit('add')
  })
}

const handleRemoveRoleClick = (index: number) => {
  roleList.value.splice(index, 1)
}

const handleConfirmClick = () => {
  const isVacancy = roleList.value.every((item) => !isEmpty(item.name.trim()) && !isEmpty(item.character))

  if (!isVacancy) {
    showToast('请填写完整角色信息!')
    return
  }

  const formatRoleList = roleList.value.map((item) => {
    return {
      ...item,
      character: (item.character as Array<string>).join(',')
    }

  })

  emit('confirm', formatRoleList)
}

const formatCharacter = (character: string | Array<string>) => {
  if (isString(character)) {
    character = character.split(',')
  }

  return character
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

watchEffect(() => {
  roleList.value = props.data.map((item) => {
    return {
      ...item,
      character: formatCharacter(item.character)
    }
  })
})

</script>
<template>
  <div class="rounded-md bg-white p-3 text-sm shadow-sm">
    <div class="mb-2">
      <span>好的，请告诉我您想要设定的主要角色名称、年龄、性别以及他们的角色特征。填写后点击"确认"。</span>
    </div>
    <div class="flex flex-col gap-y-4">
      <TransitionGroup
        @before-enter="onBeforeEnter"
        @enter="onEnter"
        @leave="onLeave"
      >
        <div
          v-for="(item, index) in roleList"
          :key="item.id"
          class="relative rounded bg-neutral-100"
        >
          <div
            v-if="((roleList.length > 1) && !props.disabled)"
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
            :disabled="props.disabled"
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
                  :disabled="props.disabled"
                >
                  <Radio name="男">
                    男性
                  </Radio>
                  <Radio name="女">
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
                  :disabled="props.disabled"
                >
                  <Radio name="儿童">
                    儿童
                  </Radio>
                  <Radio name="青少年">
                    青少年
                  </Radio>
                  <Radio name="中年">
                    中年
                  </Radio>
                  <Radio name="老年">
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
                      v-for="feature in item.character"
                      :key="feature"
                      type="primary"
                      size="medium"
                      class="overflow-hidden text-nowrap"
                      :class="{
                        '!bg-primary/50': props.disabled
                      }"
                      :closeable="!props.disabled"
                      @close="handleRemoveFeatureClick(index, feature)"
                    >
                      {{ feature }}
                    </Tag>
                  </TransitionGroup>
                  <Tag
                    v-if="!props.disabled"
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
    <div
      v-if="!props.disabled"
      class="mt-3 flex justify-between"
    >
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
        size="small"
        @click="handleConfirmClick"
      >
        &nbsp;&nbsp;确认&nbsp;&nbsp;
      </Button>
    </div>
  </div>
</template>
<style></style>
