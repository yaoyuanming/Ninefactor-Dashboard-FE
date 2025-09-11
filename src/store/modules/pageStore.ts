import { defineStore } from 'pinia'

interface PageState {
  prtWorkTag: string
  prtWorkTag2:string
}

export const usePageStore = defineStore('page', {
  state: (): PageState => ({
    prtWorkTag: "1",
    prtWorkTag2: "1",
  }),
  getters: {
    getPrtWorkTag(): string {
      return this.prtWorkTag
    },
    getPrtWorkTag2(): string {
      return this.prtWorkTag2
    },
  },
  actions: {
    setPrtWorkTag(workTag: string) {
      this.prtWorkTag = workTag // 取消注释这行才能实际修改状态
    },
    setPrtWorkTag2(workTag: string) {
      this.prtWorkTag2 = workTag // 取消注释这行才能实际修改状态
    },
  },
  persist: false
})
