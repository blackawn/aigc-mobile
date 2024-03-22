import { axiosInstance } from '@/utils/axios'
import {
  GetSegmentDetailRes,
  GetSegmentImagesTaskListParams,
  SegmentImagesTaskList,
  SegmentData,
  EditSegmentParams,
  SaveSegmentParams
} from './types'
import { R } from '../types'

/**
 * 获取分镜绘图详情
 * @param params 
 */
export const getSegmentDetail = (id: number): R<GetSegmentDetailRes> => {
  return axiosInstance.post('/novel/segment/detail', { novel_id: id })
}

/**
 * 获取多图管理
 * @param params 
 */
export const getSegmentImagesTasList = (params: GetSegmentImagesTaskListParams): R<SegmentImagesTaskList> => {
  return axiosInstance.post('/novel/segment/image_change/task_list', params)
}

/**
 * 保存分镜
 * @param params 
 */
export const saveSegment = (params: SaveSegmentParams): R => {
  return axiosInstance.post('/novel/segment/save', params)
}

/**
 * 编辑分镜
 * @param params 
 */
export const editSegment = (params: EditSegmentParams): R => {
  return axiosInstance.post('/novel/segment/edit', params)
}