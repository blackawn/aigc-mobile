
// 1小说生成 2小说续写 3小说扩写 4小说配图
export type CreateNovelType = 0 | 1 | 2 | 3

export interface CreateNovelParams {
  title: string
  type: CreateNovelType
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