import { ref } from 'vue'
import { defineStore } from 'pinia'

export const storeMutual = defineStore('mutualStore', () => {

  const isWantNovelId = ref(false) 

  const wantNovelId = ref(-1)

  const modifyWantNovelIdStatus = (status: boolean)=>{
    isWantNovelId.value = status
  }

  const modifyWantNovelId = (id: number)=>{
    wantNovelId.value = id
  }

  return {
    isWantNovelId,
    modifyWantNovelIdStatus,
    wantNovelId,
    modifyWantNovelId
  }
})
