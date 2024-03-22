import type { DialogData, SummaryData } from '@/pages/ai/chat/component/types'

export interface CreateNovelParams {
  title: string
  // 1小说生成 2小说续写 3小说扩写 4小说配图
  type: number
}

export interface CreateNovelRes {
  novel_id: number
}

export interface CreateNovelBackgroundParams {
  novel_id: number
  content: string
}

export interface CreateNovelBackgroundRes {
  time: string
  content: string
  code: number
}

export interface NovelHistoryParams {
  search?: string
  type?: Array<number> | null
}

export interface NovelHistoryData {
  novel_id: number;
  title?: string;
  type: number;
  sort: number;
  is_top?: number;
  updated_at: string;
}

export interface NovelHistoryRes {
  today: Array<NovelHistoryData>
  week: Array<NovelHistoryData>
  early: Array<NovelHistoryData>
}

export type ModifyNovelHistoryParams = Pick<NovelHistoryData, 'is_top' | 'novel_id' | 'title'>

export interface EditNovelContentParams {
  content: string
  novel_id: number
  type?: number // 1-保存生成的章节内容 2-背景 3-大纲 4-镜头脚本 5-角色 6-题材 7-文风 8-内容设定 9-续写内容 10-扩写内容
  chatper?: number
}

export interface SaveChatDialogParams {
  content: string
  novel_id: number
  type: 'sys'
}

export interface GetChatDialogParams {
  content?: string
  novel_id: number
}

export interface GetChatDialogRes {
  content: {
    dialog: Array<DialogData>
    guide: Array<DialogData>
    summaryList: Array<SummaryData>
  }
}

export interface GetNovelContentRes {
  content: string
  chatper: number
}