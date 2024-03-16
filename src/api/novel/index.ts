import { axiosInstance } from '@/utils/axios'
import {
  CreateNovelParams,
  CreateNovelRes,
  CreateNovelBackgroundParams,
  CreateNovelBackgroundRes,
  NovelHistoryParams,
  NovelHistoryRes,
  ModifyNovelHistoryParams
} from './types'
import { R } from '@/api/types'

/**
 * 创建小说
 * @param params 
 */
export const createNovel = (params: CreateNovelParams): R<CreateNovelRes> => {
  return axiosInstance.post('/novel/add', params)
}

/**
 * 获取历史记录
 * @param params 
 */
export const getNovelHistory = (param: NovelHistoryParams): R<NovelHistoryRes> => {
  return axiosInstance.post('/novel/list', param)
}

/**
 * 编辑历史记录
 * @param params 
 */
export const modifyNovelHistory = (param: ModifyNovelHistoryParams): R => {
  return axiosInstance.post('/novel/edit', param)
}

/**
 * 删除历史记录
 * @param params 
 */
export const deleteNovelHistory = (param: number): R => {
  return axiosInstance.post('/novel/delete', { novel_id: param })
}