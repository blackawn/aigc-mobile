import { ref } from 'vue'
import { defineStore } from 'pinia'
import { customAlphabet } from 'nanoid'

export interface BaseParams {
  device_no: string;
  product_id: string;
  app_id: string;
  version_name: string;
  version_code: string;
  cid: string;
  click_id: string;
}

export const storeBase = defineStore('baseStore', () => {

  const baseParams = ref<BaseParams | null>(null)

  const createBaseParams = () => {

    const nanoid = customAlphabet('1234567890abcdef', 37)

    baseParams.value = {
      device_no: nanoid() ,
      product_id: '8020',
      app_id: 'Novel',
      cid: '',
      click_id: '',
      version_name: '1.0.1',
      version_code: '101'
    }
  }

  return {
    baseParams,
    createBaseParams
  }
})
