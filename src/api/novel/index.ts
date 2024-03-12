import { axiosInstance } from '@/utils/axios'
import {
  CreateNovelParams,
  CreateNovelRes,
  CreateNovelBackgroundParams,
  CreateNovelBackgroundRes
} from './types'
import { R } from '@/api/types'

// 创建小说
export const createNovel = (params: CreateNovelParams): R<CreateNovelRes> => {
  return axiosInstance.post('/novel/add', params)
}

// 创建背景返回 流
export const createNovelBackground = (params: CreateNovelBackgroundParams): R<CreateNovelBackgroundRes> => {
  return axiosInstance.get('/novel/generate/background', {
    params,
    responseType: 'stream', // 指定响应类型为流
    transformResponse: [function (data) {
      // 将每一行的 JSON 数据解析为对象
      const jsonData = JSON.parse(data)
      return jsonData
    }],
  })
}