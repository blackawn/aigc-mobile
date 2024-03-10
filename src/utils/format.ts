/**
 * 格式为千分位
 * @param num 
 * @returns 
 */
export function numberThousand(value: string | number | undefined): string {

  if (!value) return ''

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