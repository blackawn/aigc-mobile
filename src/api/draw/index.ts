import { axiosInstance } from '@/utils/axios'
import {
  GetDrawResultDetailRes
} from './types'
import { R } from '@/api/types'

/**
 * 获取分镜绘图详情
 * @param params 
 */
export const getDrawResultDetail = (id: number): R<GetDrawResultDetailRes> => {
  return axiosInstance.post('/novel/segment/detail', { novel_id: id })
}