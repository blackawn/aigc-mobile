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