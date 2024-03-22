import { ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { customAlphabet } from 'nanoid'
import { ConfigData } from '@/api'

export interface BaseParams {
  device_no: string;
  product_id: string;
  app_id: string;
  version: string;
  cid: string;
  click_id: string;
  user_type: string;
}

export const storeConfig = defineStore('configStore', () => {

  const nanoid = customAlphabet('1234567890abcdef', 32)

  const baseParams = ref<BaseParams | null>(null)

  const deviceId = useStorage<string>('deviceId', nanoid())

  const createBaseParams = () => {

    baseParams.value = {
      device_no: deviceId.value,
      product_id: '8020',
      app_id: 'Novel',
      cid: '',
      click_id: '',
      version: '',
      user_type: '0'
    }

  }

  const configList = ref<Array<ConfigData>>([])

  const modifyConfigList = (data: Array<ConfigData>) => {
    configList.value = data
  }

  return {
    deviceId,
    baseParams,
    createBaseParams,
    configList,
    modifyConfigList
  }
})
