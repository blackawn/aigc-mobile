export type DialogRole = 'gpt' | 'user'

export type DialogType = 'theme' |
  'background' |
  'backgroundGeneration' |
  'backgroundAnswer' |
  'role' |
  'plot' |
  'style' |
  'writingStyle' |
  'summary'

export interface RoleStyleInfoData {
  name: string
  age: string
  sex: string
  character: string | []
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
  time: string
  roleStyleInfo?: Array<RoleStyleInfoData>
  outline?: boolean
  summaryList?: Array<SummaryData>
  [key: string]: any
}