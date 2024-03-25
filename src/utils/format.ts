/**
 * 格式为千分位
 * @param num 
 * @returns 
 */
export function numberThousand(value: string | number | undefined): string {

  if (!value && (value !== 0)) return ''

  return value.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')
}

/**
 * 时间格式补零
 * @param value 
 * @returns 
 */
export function padZero(value: string | number): string {

  return Number(value) < 10 ? `0${value || 0}` : (value.toString() || '00')
}

/**
 * 插入字符串
 * @param value 
 * @param startIndex 
 * @param pad 
 * @returns 
 */
export function insertString(value: string | number | undefined, startIndex: number, pad: string): string {

  if (!value) return ''

  value = value.toString()

  if (value.length < startIndex + 1) {
    return value
  }

  const firstPart = value.slice(0, startIndex)
  const secondPart = value.slice(startIndex)

  return `${firstPart}${pad}${secondPart}`
}

/**
 * 时间格式化
 * @param {*} isTime 时间戳
 * @param {*} cFormat 需要转换的格式
 * @returns String
 */
export const parseTime = (isTime?: number | Date, cFormat?: string): string => {
  let time: number = isTime ? (typeof isTime === 'number' ? isTime : isTime.getTime()) : new Date().getTime()
  const format: string = cFormat || '{y}/{m}/{d} {h}:{i}:{s}'
  let date: Date

  if (typeof time === 'object') {
    date = time as Date
  } else {
    if (('' + time).length === 10) time = parseInt(time as any) * 1000
    date = new Date(time)
  }

  const formatObj: Record<string, number> = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }

  const timeStr: string = format.replace(/{(y|m|d|h|i|s|a)+}/g, (match: string, key: string) => {
    let value: number | string = formatObj[key]

    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }

    if (match.length > 0 && value < 10) {
      value = '0' + value
    }

    return value.toString() || '0'
  })

  return timeStr
}

/**
 * 获取图片命名的格式
 * @param {*} url 地址
 * @returns String
 */
export const getFileExtension = (url: string): string => {
  // 可能的图片扩展名列表
  const imageExtensions: string[] = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico']

  // 通过正则表达式从 URL 中提取文件扩展名
  const matches = url.match(/\.([a-zA-Z0-9]+)(\?|$)/)
  if (matches) {
    const extension: string = matches[1].toLowerCase()
    // 遍历可能的扩展名，直到找到第一个有效的扩展名
    for (const imageExtension of imageExtensions) {
      if (extension.includes(imageExtension)) {
        return imageExtension
      }
    }
  }

  // 如果未找到匹配的扩展名，则返回空字符串
  return ''
}