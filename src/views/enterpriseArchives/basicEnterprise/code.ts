/**
 * 数据字典工具类
 */
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'

export const transformSelected = (selectedValues) => {
  if (selectedValues == null) {
    return []
  }
  const result = []

  // 1. 先处理纯数字（range_type）
  selectedValues
    .filter((v) => typeof v === 'number' || !v.includes('-'))
    .forEach((v) => {
      const type = typeof v === 'string' ? parseInt(v) : v
      if (!result.some((item) => item.range_type === type)) {
        result.push({ range_type: type, range_level: [] })
      }
    })

  // 2. 处理x-y格式（range_level）
  selectedValues
    .filter((v) => typeof v === 'string' && v.includes('-'))
    .forEach((v) => {
      const [type, level] = v.split('-').map(Number)
      const existing = result.find((item) => item.range_type === type)

      if (existing) {
        if (!existing.range_level.includes(level)) {
          existing.range_level.push(level)
        }
      } else {
        result.push({ range_type: type, range_level: [level] })
      }
    })

  // 3. 按range_type排序
  return result.sort((a, b) => a.range_type - b.range_type)
}

export const reverseTransform = (transformedData) => {
  if (!transformedData || !Array.isArray(transformedData)) {
    return []
  }

  const result = []

  // 处理每项range_type和range_level
  transformedData.forEach((item) => {
    // 添加range_type本身
    result.push(item.range_type)

    // 添加range_level的每一项，格式为"range_type-range_level"
    if (item.range_level && item.range_level.length > 0) {
      item.range_level.forEach((level) => {
        result.push(`${item.range_type}-${level}`)
      })
    }
  })

  return result
}
export const getMyData = () => {
  return getIntDictOptions(DICT_TYPE.RANGE_TYPE).map((i) => {
    if (i.value == 1) {
      i.cssClass = '3'
    }
    if (i.value == 2) {
      i.cssClass = '1,2,3,4'
    }
    if (i.value == 3) {
      i.cssClass = '1,2,3,4'
    }
    if (i.value == 4) {
      i.cssClass = '1,2,3'
    }
    if (i.value == 5) {
      i.cssClass = '1,2,3,4'
    }
    if (i.value == 6) {
      i.cssClass = '3,4'
    }
    if (i.value == 7) {
      i.cssClass = '1,2'
    }
    if (i.value == 8) {
      i.cssClass = '2,3'
    }
    if (i.value == 9) {
      i.cssClass = '1,2,3,4'
    }

    const children = []
    const cssClasses = i.cssClass ? i.cssClass.split(',') : []

    // 根据cssClass添加子选项
    if (cssClasses.includes('1')) children.push({ label: 'A级', value: `${i.value}-1` })
    if (cssClasses.includes('2')) children.push({ label: 'B级', value: `${i.value}-2` })
    if (cssClasses.includes('3')) children.push({ label: 'C级', value: `${i.value}-3` })
    if (cssClasses.includes('4')) children.push({ label: 'D级', value: `${i.value}-4` })

    return {
      ...i,
      children
    }
  })
}
/**
 * 根据行政区划编码生成层级编码数组
 * @param code 行政区划编码 (如: "110102")
 * @returns 层级编码数组 (如: ["11", "1101", "110102"])
 */
export const getAreaCodeLevels = (code: string): string[] => {
  const result: string[] = []

  // 省级编码 (前2位)
  const provinceCode = code.substring(0, 2)
  result.push(provinceCode)

  // 市级编码 (前4位)
  if (code.length >= 4) {
    const cityCode = code.substring(0, 4)
    if (cityCode !== provinceCode + '00') {
      // 过滤掉直辖市的情况
      result.push(cityCode)
    }
  }

  // 区级编码 (全部6位)
  if (code.length === 6) {
    result.push(code)
  }

  return result
}
import areas3 from './addressCode/areas3.json'
import provinces1 from './addressCode/provinces1.json'
import cities2 from './addressCode/cities2.json'
import streets4 from './addressCode/streets4.json'
// import villages5 from './addressCode/villages5.json'
// provinces1: 是个数组格式为[{code:1,name:"1"}]
// cities2:是个数组格式为[{code:1,name:"1",provinceCode:"11"}]
// areas3:是个数组 格式为[{code:1,name:"1",cityCode:"11",provinceCode:"11"}]
// streets4:是个数组 格式为[{code:1,name:"1",cityCode:"11",provinceCode:"11",areaCode:"11"}]
// villages5:是个数组 格式为[{code:1,name:"1",cityCode:"11",provinceCode:"11",areaCode:"11",streetCode:"11"}]
// villages5和父级streets4通过villages5.streetCode = streets4.code关联
// streets4和父级areas3通过areas3.code = streets4.areaCode关联
// areas3和父级cities2通过 cities2.code = areas3.cityCode关联
// cities2和父级provinces1通过 provinces1.code = cities2.provinceCode关联
// 编写个方法将各级通过父子树形节点关联起来 provinces1是父级，cities2是子级等等等
/**
 * 构建完整的行政区划树形结构
 * @param {Array} provinces 省份数组
 * @param {Array} cities 城市数组
 * @param {Array} areas 区县数组
 * @param {Array} streets 街道数组
 * @param {Array} villages 村庄数组
 * @returns {Array} 完整的树形结构
 */
export const buildAreaTree = () => {
  // 1. 首先建立所有层级的映射表（code -> item）
  const provinceMap = new Map(provinces1.map((p) => [p.code, { ...p, children: [] }]))
  const cityMap = new Map(cities2.map((c) => [c.code, { ...c, children: [] }]))
  const areaMap = new Map(areas3.map((a) => [a.code, { ...a, children: [] }]))
  const streetMap = new Map(streets4.map((s) => [s.code, { ...s, children: [] }]))

  // 2. 构建街道 -> 村庄的关系
  // villages.forEach(village => {
  //   if (streetMap.has(village.streetCode)) {
  //     streetMap.get(village.streetCode).children.push(village);
  //   }
  // });

  // 3. 构建区县 -> 街道的关系
  streets4.forEach((street) => {
    if (areaMap.has(street.areaCode)) {
      areaMap.get(street.areaCode).children.push(streetMap.get(street.code))
    }
  })

  // 4. 构建城市 -> 区县的关系
  areas3.forEach((area) => {
    if (cityMap.has(area.cityCode)) {
      cityMap.get(area.cityCode).children.push(areaMap.get(area.code))
    }
  })

  // 5. 构建省份 -> 城市的关系
  cities2.forEach((city) => {
    if (provinceMap.has(city.provinceCode)) {
      provinceMap.get(city.provinceCode).children.push(cityMap.get(city.code))
    }
  })

  // 6. 返回完整的省份树形结构
  return Array.from(provinceMap.values())
}
