import { every, isEmpty } from 'lodash'

export const isRealEmpty = (value: any)=>{
  return every(value, value => isEmpty(value))
}