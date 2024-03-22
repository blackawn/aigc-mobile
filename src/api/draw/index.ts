import { axiosInstance } from '@/utils/axios'
import {
  GetDrawResultDetailRes,
  GetDrawResultTasListParams,
  DrawStatusList
} from './types'
import { R } from '@/api/types'

/**
 * 获取分镜绘图详情
 * @param params 
 */
export const getDrawResultDetail = (id: number): R<GetDrawResultDetailRes> => {
  return axiosInstance.post('/novel/segment/detail', { novel_id: id })
}

/**
 * 获取多图管理
 * @param params 
 */
export const getDrawResultTasList = (params: GetDrawResultTasListParams): R<DrawStatusList> => {
  return axiosInstance.post('/novel/segment/image_change/task_list', params)
}