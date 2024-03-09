export interface ResponseResult<T> {
  code: number
  msg: string
  data: T
}

export type ReplaceField<T, K extends keyof T, NewType> = {
  [P in keyof T]: P extends K ? NewType : T[P];
};

export type R<T = string> = Promise<ResponseResult<T>>

export interface PaginationResult<T> {
  list: T
  total: number
}

export type PR<T> = Promise<ResponseResult<PaginationResult<T>>>
