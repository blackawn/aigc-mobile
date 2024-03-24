import { every, isEmpty } from 'lodash'

export const isRealEmpty = (value: any) => {
  if (value === null || value === undefined) {
    // 如果值为 null 或 undefined，则返回 true
    return true
  } else if (Array.isArray(value)) {
    // 如果是数组，检查数组是否为空或所有元素为空字符串
    return value.length === 0 || value.every(val => typeof val === 'string' && val.trim() === '')
  } else if (typeof value === 'object') {
    // 如果是对象，检查对象是否为空
    return Object.keys(value).length === 0
  } else if (typeof value === 'string') {
    // 如果是字符串，经过 trim 处理后为空则返回 true
    return value.trim() === ''
  } else {
    // 其他情况检查是否为空
    return isEmpty(value)
  }
}
