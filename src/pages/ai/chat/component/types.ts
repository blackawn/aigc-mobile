export type DialogRole = 'gpt' | 'user'

export type DialogType =
  'guide' |
  'guideAnswer' |
  'theme' |
  'themeAnswer' |
  'background' |
  'backgroundGeneration' |
  'backgroundAnswer' |
  'role' |
  'plot' |
  'plotAnswer' |
  'writingStyle' |
  'writingStyleAnswer' |
  'summary' |
  'outlineGeneration' |
  'chapterGeneration'

type RoleStyleInfoAge = '儿童' | '青少年' | '中年' | '老年'
type RoleStyleInfoSex = '男' | '女'

export interface RoleStyleInfoData {
  name: string
  age: RoleStyleInfoAge
  sex: RoleStyleInfoSex
  character: string | Array<string>
  [key: string]: any
}

export interface SummaryData {
  title: string
  id: DialogType
  content: string
  [key: string]: any
}

export interface DialogData {
  role: DialogRole
  content: string
  type: DialogType
  time?: string
  roleStyleInfo?: Array<RoleStyleInfoData>
  outline?: boolean
  summaryList?: Array<SummaryData>
  [key: string]: any
}