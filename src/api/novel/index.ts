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
    responseType: 'text', // 指定响应类型为流
    headers:{
      'Content-Type': 'text/event-stream'
    },
  })
}