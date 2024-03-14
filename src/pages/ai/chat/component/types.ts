export type Role = 'gpt' | 'user'

export type Type = 'theme' |
  'background' |
  'backgroundGeneration' |
  'backgroundAnswer' |
  'role' |
  'plot' |
  'style' |
  'writingStyle' |
  'summary'

// 0 按钮交互
export type MutualType = 0 | 1

export interface RoleStyleInfo {
  name: string
  age: string
  sex: string
  character: string
}

export interface Summary {
  title: string
  id: Type
  content: string
}

export interface DialogType {
  role: Role
  content: string
  type: Type
  time: string
  mutual?: {
    type: MutualType
    buttonList?: Array<string>
  }
  roleStyleInfo?: Array<RoleStyleInfo>
  outline?: boolean
  summaryList?: Array<Summary>
  [key: string]: any
}