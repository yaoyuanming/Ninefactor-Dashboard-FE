import { defineStore } from 'pinia'
import { store } from '../index'
// @ts-ignore
import { DictDataVO, DictTypeVO } from '@/api/system/dict/types'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'
const { wsCache } = useCache('sessionStorage')
import { getSimpleDictDataList } from '@/api/system/dict/dict.data'
import {getSimpleDictTypeList} from "@/api/system/dict/dict.type";

export interface DictValueType {
  value: any
  label: string
  clorType?: string
  cssClass?: string
}
export interface DictTypeType {
  dictType: string
  dictValue: DictValueType[]
}
export interface DictState {
  dictMap: Map<string, any>
  dictTypeMap: Map<string, any>
  isSetDict: boolean
  isSetDictType: boolean
}

export const useDictStore = defineStore('dict', {
  state: (): DictState => ({
    dictMap: new Map<string, any>(),
    dictTypeMap: new Map<string, any>(),
    isSetDict: false,
    isSetDictType: false
  }),
  getters: {
    getDictMap(): Recordable {
      const dictMap = wsCache.get(CACHE_KEY.DICT_CACHE)
      if (dictMap) {
        this.dictMap = dictMap
      }
      return this.dictMap
    },
    getDictTypeMap(): Recordable {
      const dictTypeMap = wsCache.get(CACHE_KEY.DICT_TYPE_CACHE)
      if (dictTypeMap) {
        this.dictTypeMap = dictTypeMap
      }
      return this.dictTypeMap
    },
    getIsSetDict(): boolean {
      return this.isSetDict
    },
    getIsSetDictCat(): boolean {
      return this.isSetDictType
    }
  },
  actions: {
    async setDictMap() {
      const dictMap = wsCache.get(CACHE_KEY.DICT_CACHE)
      if (dictMap) {
        this.dictMap = dictMap
        this.isSetDict = true
      } else {
        const res = await getSimpleDictDataList()
        // 设置数据
        const dictDataMap = new Map<string, any>()
        res.forEach((dictData: DictDataVO) => {
          // 获得 dictType 层级
          const enumValueObj = dictDataMap[dictData.dictType]
          if (!enumValueObj) {
            dictDataMap[dictData.dictType] = []
          }
          // 处理 dictValue 层级
          dictDataMap[dictData.dictType].push({
            value: dictData.value,
            label: dictData.label,
            colorType: dictData.colorType,
            cssClass: dictData.cssClass
          })
        })
        this.dictMap = dictDataMap
        this.isSetDict = true
        wsCache.set(CACHE_KEY.DICT_CACHE, dictDataMap, { exp: 60 }) // 60 秒 过期
      }
    },
    getDictByType(type: string) {
      // console.log('isSetDict', this.isSetDict)
      if (!this.isSetDict) {
        this.setDictMap()
      }
      return this.dictMap[type]
    },
    async setDictTypeMap() {
      const dictTypeMap = wsCache.get(CACHE_KEY.DICT_TYPE_CACHE)
      if (dictTypeMap) {
        this.dictTypeMap = dictTypeMap
        this.isSetDictType = true
      } else {
        const hasCategory = 1
        const res = await getSimpleDictTypeList(hasCategory)
        // 设置数据
        const dictTypeDataMap = new Map<string, any>()
        res.forEach((dictType: DictTypeVO) => {
          // 获得 category 层级
          const enumValueObj = dictTypeDataMap[dictType.category]
          if (!enumValueObj) {
            dictTypeDataMap[dictType.category] = []
          }
          // 处理 dictValue 层级
          dictTypeDataMap[dictType.category].push({
            id: dictType.id,
            name: dictType.name,
            type: dictType.type,
            category: dictType.category
          })
        })
        this.dictTypeMap = dictTypeDataMap
        this.isSetDictType = true
        wsCache.set(CACHE_KEY.DICT_TYPE_CACHE, dictTypeDataMap, { exp: 60 }) // 60 秒 过期
      }
    },
    getDictTypeByCat(category: string) {
      // console.log('isSetDictCat', this.isSetDictCat)
      if (!this.isSetDictType)  {
        this.setDictTypeMap()
      }
      return this.dictTypeMap[category]
    },
    async resetDict() {
      wsCache.delete(CACHE_KEY.DICT_CACHE)
      const res = await getSimpleDictDataList()
      // 设置数据 - 按 dictType 分类
      const dictDataMap = new Map<string, any>()
      res.forEach((dictData: DictDataVO) => {
        // 获得 dictType 层级
        const enumValueObj = dictDataMap[dictData.dictType]
        if (!enumValueObj) {
          dictDataMap[dictData.dictType] = []
        }
        // 处理 dictValue 层级
        dictDataMap[dictData.dictType].push({
          value: dictData.value,
          label: dictData.label,
          colorType: dictData.colorType,
          cssClass: dictData.cssClass
        })
      })
      this.dictMap = dictDataMap
      this.isSetDict = true
      wsCache.set(CACHE_KEY.DICT_CACHE, dictDataMap, { exp: 60 }) // 60 秒 过期

      // 设置数据 - 按 dictCategory 分类
      wsCache.delete(CACHE_KEY.DICT_TYPE_CACHE)
      const hasCategory = 1
      const res2 = await getSimpleDictTypeList(hasCategory)
      const dictDataMapByCat = new Map<string, any>()
      res2.forEach((dictType: DictTypeVO) => {
        // 获得 dictCategory 层级
        const enumValueObj = dictDataMapByCat[dictType.dictCategory]
        if (!enumValueObj) {
          dictDataMapByCat[dictType.dictCategory] = []
        }
        // 处理 dictValue 层级
        dictDataMapByCat[dictType.dictCategory].push({
          id: dictType.id,
          name: dictType.name,
          type: dictType.type,
          category: dictType.category
        })
      })
      this.dictTypeMap = dictDataMapByCat
      this.isSetDictType = true
      wsCache.set(CACHE_KEY.DICT_TYPE_CACHE, dictDataMap, { exp: 60 }) // 60 秒 过期
    }
  }
})

export const useDictStoreWithOut = () => {
  return useDictStore(store)
}
