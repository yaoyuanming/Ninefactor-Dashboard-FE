<template>
  <div class="screen-map" style="height: 100%; width: 100%; position: relative" v-loading="loading">
    <div class="search-box">
      <el-select
        multiple
        clearable
        @change="getCompanyListIfo"
        v-model="dangerousTrade"
        placeholder="全部"
        class="select"
      >
        <el-option
          :label="item.label"
          :value="item.value"
          v-for="(item, key) in [
            {
              label: '全部',
              value: ''
            },
            {
              label: '不涉及',
              value: '0'
            },
            {
              label: '有限空间',
              value: '5'
            },
            {
              label: '涉爆粉尘',
              value: '1'
            },
            {
              label: '涉氨制冷',
              value: '3'
            }
          ]"
          :key="key"
        />
      </el-select>
    </div>
    <div id="mapElement" style="height: 100%; width: 100%; position: relative"></div>
  </div>
</template>

<script lang="ts" setup>
import mapLoader from '@/utils/aMap.js'
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { getCompanyList } from '@/api/screen'
import Risk02 from '../../assets/imgs/screen/risk02.png'
import Risk05 from '../../assets/imgs/screen/risk05.png'
import Risk08 from '../../assets/imgs/screen/risk08.png'
import Risk010 from '../../assets/imgs/screen/risk010.png'

import Risk12 from '../../assets/imgs/screen/risk12.png'
import Risk15 from '../../assets/imgs/screen/risk15.png'
import Risk18 from '../../assets/imgs/screen/risk18.png'
import Risk110 from '../../assets/imgs/screen/risk110.png'

import Risk22 from '../../assets/imgs/screen/risk22.png'
import Risk25 from '../../assets/imgs/screen/risk25.png'
import Risk28 from '../../assets/imgs/screen/risk28.png'
import Risk210 from '../../assets/imgs/screen/risk210.png'

import Risk32 from '../../assets/imgs/screen/risk32.png'
import Risk35 from '../../assets/imgs/screen/risk35.png'
import Risk38 from '../../assets/imgs/screen/risk38.png'
import Risk310 from '../../assets/imgs/screen/risk310.png'

import { DICT_TYPE, getDictLabel } from '@/utils/dict'

const emit = defineEmits(['submit', 'reset', 'validated'])
const companyList = ref<any[]>([])

const map = ref<any>(null)
const aMap = ref<any>(null)
const loca = ref<any>(null)
// 新增遮罩相关变量
const maskPolygon = ref<any>(null)
const boundariesValue = ref<any>(null)
const targetDistrict = '石狮市'
let labelMarkerLayer: any = ref<any>(null) // LabelMarker图层
const dangerousTrade = ref<string[]>([])
const loading = ref(true)
const INFO_WINDOW_CLOSE_DELAY = 1000
const pageSize = 1000
const { push } = useRouter()

// 全局单例InfoWindow实例
const globalInfoWindow = ref<any>({
  instance: null,
  currentMarker: null
})

const companyIcon = {
  size: [30, 36],
  image: {
    0: {
      0: Risk02,
      4: Risk02,
      3: Risk05,
      2: Risk08,
      1: Risk010
    },
    5: {
      0: Risk12,
      4: Risk12,
      3: Risk15,
      2: Risk18,
      1: Risk110
    },
    1: {
      0: Risk22,
      4: Risk22,
      3: Risk25,
      2: Risk28,
      1: Risk210
    },
    3: {
      0: Risk32,
      4: Risk32,
      3: Risk35,
      2: Risk38,
      1: Risk310
    }
  },
  color: {
    0: '#00C6DA',
    4: '#00C6DA',
    3: '#E1CE2B',
    2: '#FF9C23',
    1: '#FF363C ',
  }
}

// 在initMap函数顶部添加
const initMap = async () => {
  await mapLoader().then((AMap) => {
    aMap.value = AMap

    // 创建行政区查询实例
    const district = new AMap.DistrictSearch({
      subdistrict: 0,
      extensions: 'all',
      level: 'district'
    })

    // 搜索石狮市边界
    district.search(targetDistrict, (status: string, result: any) => {
      if (status === 'complete' && result.districtList.length > 0) {
        const boundaries = result.districtList[0].boundaries || []
        boundariesValue.value = boundaries.length > 0 ? boundaries : null

        // 创建地图实例（3D模式）- 直接使用石狮市中心坐标
        map.value = new AMap.Map('mapElement', {
          viewMode: '3D', // 使用3D模式
          rotateEnable: false, // 禁用旋转
          pitchEnable: false, // 禁用俯仰
          pitch: 40, // 俯仰角度
          rotation: 0, // 旋转角度
          zooms: [12, 20],
          zoom: 13.5,
          center: [118.6855, 24.73], // 石狮市中心坐标
          mapStyle: 'amap://styles/grey' // 深色底图增强极光效果
        })

        // 创建LabelMarker图层
        labelMarkerLayer.value = new AMap.LabelsLayer({
          zooms: [3, 20],
          zIndex: 200,
          collision: false, // 避免碰撞
        });
        map.value.add(labelMarkerLayer.value);

        // 将Loca初始化移到地图complete事件中
        map.value.on('complete', () => {
          // 创建全局单例InfoWindow
          globalInfoWindow.value.instance = new AMap.InfoWindow({
            isCustom: true,
            offset: new AMap.Pixel(260, 100),
            closeWhenClickMap: true
          })
          globalInfoWindow.value.currentMarker = null // 初始化为空

          // 添加遮罩层
          createMaskLayer(boundaries)

          // 绘制石狮市边界线
          addDistrictBoundary(boundaries)
          // 创建极光围栏
          createAuroraFence(boundaries)
          loading.value = false
        })
      }
    })
  })
}

// 创建极光围栏效果（使用 DistrictSearch 边界）
const createAuroraFence = (boundaries) => {
  var loca = (window.loca = new Loca.Container({
    map: map.value
  }))
  loca.value = loca

  // 使用行政区查询返回的全部边界路径构建 GeoJSON
  if (!boundaries || !boundaries.length) return

  // 创建面状GeoJSON（为每个边界生成一个 Feature）
  const features = boundaries.map((boundary) => {
    const polygonCoords = (boundary || []).map((p: any) =>
      Array.isArray(p) ? [p[0], p[1]] : [p.lng, p.lat]
    )
    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [polygonCoords]
      }
    }
  })

  const geojson = {
    type: 'FeatureCollection',
    features
  }

  var geo = new Loca.GeoJSONSource({ data: geojson })
  var auroraLayer = new Loca.PolygonLayer({
    zIndex: 3,
    cullface: 'none',
    shininess: 1,
    hasBottom: false,
    blockHide: false,
    hasSide: true,
    hasTop: false,
    depth: true
  })
  auroraLayer.setSource(geo)
  auroraLayer.setStyle({
    topColor: () => '#1796FA',
    sideTopColor: () => '#1796FA',
    sideBottomColor: () => '#1796FA',
    height: 450,
    altitude: -400,
    glow: { color: '#1796FA', intensity: 0.7, radius: 20 }
  })
  loca.add(auroraLayer)
}

// 创建遮罩层（使用 DistrictSearch 边界）
const createMaskLayer = (boundaries: any[]) => {
  // 清除旧遮罩
  if (maskPolygon.value && map.value) {
    map.value.remove(maskPolygon.value)
  }

  // 使用高德坐标范围
  const outer = [
    new aMap.value.LngLat(70, 55, true), // 西北
    new aMap.value.LngLat(70, 15, true), // 西南
    new aMap.value.LngLat(140, 15, true), // 东南
    new aMap.value.LngLat(140, 55, true) // 东北
  ]
  const pathArray = [outer, ...boundaries]
  maskPolygon.value = new aMap.value.Polygon({
    path: pathArray,
    fillColor: '#0F2038',
    fillOpacity: 0.75,
    strokeWeight: 0,
    zIndex: 1,
    bubble: true,
    clickable: false
  })
  map.value.add(maskPolygon.value)
}

// 添加边界线
const addDistrictBoundary = (boundaries: any[]) => {
  boundaries.forEach((boundary: any) => {
    // 主体
    new aMap.value.Polygon({
      path: boundary,
      strokeColor: '#1D64CA',
      strokeWeight: 1,
      strokeStyle: 'solid',
      fillColor: '#1796FA', // 填充色
      fillOpacity: 0.45,
      strokeOpacity: 0.9,
      lineJoin: 'round',
      map: map.value,
      zIndex: 2
    })
  })
}

// 添加自动分页加载所有数据的辅助函数，支持增量显示
const loadAllDataIncremental = async (params) => {
  let allData = []
  let pageNo = 1
  let hasMore = true
  
  console.log('开始增量加载数据，参数:', params)
  
  while (hasMore) {
    console.log(`正在加载第 ${pageNo} 页数据...`)
    
    const res = await getCompanyList({
      ...params,
      infoStatus: 1,
      pageNo,
      pageSize: pageSize // 适中的分页大小
    })
    
    console.log(`第 ${pageNo} 页响应数据:`, res)
    
    if (res && res.records) {
      allData = allData.concat(res.records)
      console.log(`第 ${pageNo} 页获取到 ${res.records.length} 条数据，累计 ${allData.length} 条`)
      
      // 立即更新公司列表并显示标记
      companyList.value = [...allData]
      addCompanyLabelMarkers()
      
      // 判断是否还有更多数据
      hasMore = res.records.length === pageSize && res.total > allData.length
      console.log(`是否还有更多数据: ${hasMore}, 当前页数据量: ${res.records.length}, 总数: ${res.total}, 已加载: ${allData.length}`)
      pageNo++
    } else {
      console.log('没有更多数据或响应格式不正确')
      hasMore = false
    }
    
    // 添加短暂延迟，避免请求过于频繁
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  
  console.log('数据加载完成，总计:', allData.length)
  return allData
}

// 使用LabelMarker创建企业标记
const addCompanyLabelMarkers = () => {
  if (!map.value || !aMap.value || !labelMarkerLayer.value) {
    console.log('地图或LabelMarker图层未准备好，无法添加标记')
    return
  }
  // debugger

  const AMap = aMap.value
  let newMarkersCount = 0

  // 只处理新添加的公司
  const startIndex = companyList.value.length > 0 ?  companyList.value.length -pageSize : 0
  const newCompanies = companyList.value.slice(startIndex)

  console.log(`开始添加新标记，从第 ${startIndex} 个开始，新增 ${newCompanies.length} 个公司`)

  const markers: any = []
  newCompanies.forEach((company, index) => {
    if (!company.longitude || !company.latitude) {
      console.log(`公司 ${company.enterpriseName || '未知'} 缺少坐标信息，跳过`)
      return
    }

    const riskType = dangerousTrade.value?.[0] || company.isHasLimitedSpaceTask || company.isHasDust || company.isHasAmmonia || 0
    const riskLvl = company.dynamicRiskLevel || 0
    const iconUrl = companyIcon.image[riskType]?.[riskLvl] || companyIcon.image[0][0]

    // 创建LabelMarker
    const labelMarker = new AMap.LabelMarker({
      position: new AMap.LngLat(parseFloat(company.longitude), parseFloat(company.latitude)),
      icon: {
        type: 'image',
        image: iconUrl,
        size: companyIcon.size,
        anchor: 'bottom-center',
      },
      zIndex: 200,
      extData: company,
      opacity: 1
    })

    // 添加鼠标事件
    labelMarker.on('mouseover', (e: any) => {
      const marker = e.target
      const companyData = marker.getExtData()
      
      // 高亮标记
      highlightLabelMarker(marker, true)

      // 设置全局InfoWindow内容并打开
      globalInfoWindow.value.instance.setContent(createInfoWindowContent(companyData))
      globalInfoWindow.value.instance.open(map.value, marker.getPosition())

      // 绑定InfoWindow内容的鼠标事件
      const content = globalInfoWindow.value.instance.getContent()
      if (content) {
        content.addEventListener('mouseenter', () => {
          if (marker.closeTimer) clearTimeout(marker.closeTimer)
        })

        content.addEventListener('mouseleave', () => {
          marker.closeTimer = setTimeout(() => {
            if (globalInfoWindow.value.instance?.getIsOpen()) {
              globalInfoWindow.value.instance.close()
            }
          }, INFO_WINDOW_CLOSE_DELAY)
        })
      }

      // 绑定详情按钮事件
      nextTick(() => {
        const detailBtn = document.querySelector('.company-detail-btn')
        if (detailBtn) {
          detailBtn.addEventListener('click', () => {
            pushToEnterpriseDetail(companyData)
          })
        }
      })
    })

    labelMarker.on('mouseout', (e: any) => {
      const marker = e.target
      highlightLabelMarker(marker, false)
      marker.closeTimer = setTimeout(() => {
        const content = globalInfoWindow.value.instance.getContent()
        if (!content?.matches(':hover') && globalInfoWindow.value.instance?.getIsOpen()) {
          globalInfoWindow.value.instance.close()
        }
      }, INFO_WINDOW_CLOSE_DELAY)
    })

    // 添加到LabelMarker图层
    markers.push(labelMarker)
    newMarkersCount++
  })

  labelMarkerLayer.value.add(markers)


  console.log(`成功添加 ${newMarkersCount} 个新标记到LabelMarker图层`)
  console.log(`当前标记数量: ${labelMarkerLayer.value.getAllOverlays()?.length}`);
  
}

// 高亮LabelMarker
const highlightLabelMarker = (labelMarker: any, isHighlight: boolean) => {
  const company = labelMarker.getExtData()
  const riskType = dangerousTrade.value?.[0] || company.riskEnvTypes?.split(',')?.[0] || 0
  const riskLvl = company.dynamicRiskLevel || 0
  const iconUrl = companyIcon.image[riskType]?.[riskLvl] || companyIcon.image[0][0]
  if (isHighlight) {
    // 放大效果
    labelMarker.setIcon({
      type: 'image',
      image: iconUrl,
      size: [companyIcon.size[0] * 1.2, companyIcon.size[1] * 1.2],
      anchor: 'bottom-center',
    })
  } else {
    // 恢复正常大小
    labelMarker.setIcon({
      type: 'image',
      image: iconUrl,
      size: companyIcon.size,
      anchor: 'bottom-center',
    })
  }
}

// 创建信息窗口内容
const createInfoWindowContent = (company: any) => {
  const div = document.createElement('div')
  div.className = 'custom-info-window'

  div.innerHTML = `
    <div class="info-title">${company.enterpriseName || '企业名称'}</div>
    <div class="info-item">
      <span class="item-label">统一社会信用代码：</span>
      <span>${company.creditCode || '暂无数据'}</span>
    </div>
    <div class="info-item">
      <span class="item-label">企业生产经营地址：</span>
      <span>${company.productionAddress || '暂无数据'}</span>
    </div>
    <div class="info-item">
      <span class="item-label">国民经济类型：</span>
      <span>${company.industryName || '暂无数据'}</span>
    </div>
    <div class="info-item">
      <span class="item-label">企业规模：</span>
      <span>${company.enterpriseScale || '暂无数据'}</span>
    </div>
    <div class="info-item">
      <span class="item-label">动态风险等级：</span>
      <span>${getDictLabel(DICT_TYPE.INHERENT_RISK, company.dynamicRiskLevel) || '暂无数据'}</span>
    </div>
    <div class="info-item">
      <span class="item-label">是否涉及高危环境：</span>
      <span>${getRiskEnvTypes(company.riskEnvTypes) || '暂无数据'}</span>
    </div>
    <div class="info-footer">
      <button class="company-detail-btn">查看企业详情</button>
    </div>
  `

  return div
}

// 跳转到企业详情
const pushToEnterpriseDetail = (company: any) => {
  push({
    path: `/enterpriseArchives/basic/` + company.id
  })
}

// 清理标记
const clearLabelMarkers = () => {
  if (labelMarkerLayer.value) {
    labelMarkerLayer.value?.clear()
  }

  // 关闭全局InfoWindow
  if (globalInfoWindow.value.instance && globalInfoWindow.value.instance?.getIsOpen()) {
    globalInfoWindow.value.instance.close()
  }
}

const getCompanyListIfo = async () => {
  try {
    loading.value = true
    
    // 清空现有数据
    companyList.value = []
    clearLabelMarkers()
    // 使用增量加载
    await loadAllDataIncremental({
      riskEnvTypes: dangerousTrade.value?.join(',')
    })
    
  } catch (error) {
    console.error('获取企业列表失败:', error)
  } finally {
    loading.value = false // 确保loading状态正确
  }
}

const getRiskEnvTypes = (value: string) => {
  if (!value) return ''
  const types = value.split(',')
  const label: string[] = []
  if (types.includes('1')) label.push('有限空间')
  if (types.includes('2')) label.push('粉尘涉爆')
  if (types.includes('3')) label.push('涉氨制冷')
  return label.join(',')
}

onMounted(async () => {
  await initMap()
  await getCompanyListIfo()
})

onUnmounted(() => {
  clearLabelMarkers()
  // 销毁全局InfoWindow
  if (globalInfoWindow.value.instance) {
    globalInfoWindow.value.instance.destroy()
    globalInfoWindow.value.instance = null
  }
  // 销毁Loca实例
  if (loca.value) {
    loca.value.destroy()
    loca.value = null
  }
  // 确保地图被销毁
  if (map.value) {
    map.value.destroy()
    map.value = null
  }
})
</script>

<style lang="scss">
/* 隐藏高德Logo */
.amap-logo {
  display: none !important;
}
/* 隐藏版权信息（版本号） */
.amap-copyright {
  opacity: 0 !important;
  display: none !important;
}
/* 信息窗口样式 */
.custom-info-window {
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 100%),
    rgba(8, 30, 64, 0.84);
  .info-title {
    font-size: 16px;
    font-weight: bold;
    color: #ffffff;
    line-height: 44px;
    padding-left: 20px;
    width: 418px;
    height: 44px;
    opacity: 1;
    display: flex;
    background: radial-gradient(
        77% 77% at 50% 100%,
        rgba(72, 146, 243, 0.31) 0%,
        rgba(72, 146, 243, 0) 100%
      ),
      linear-gradient(270deg, rgba(62, 86, 124, 0.33) 0%, rgba(62, 86, 124, 0.19) 94%);
    box-sizing: border-box;
    border-width: 0px 0px 2px 0px;
    border-style: solid;
    border-image: linear-gradient(
        270deg,
        rgba(48, 106, 141, 0) 0%,
        rgba(141, 147, 255, 0.578) 27%,
        #33b2ff 52%,
        rgba(108, 147, 255, 0.5582) 75%,
        rgba(48, 106, 141, 0) 100%
      )
      0 0 2 0;
    margin-bottom: 10px;
  }

  .info-item {
    margin-bottom: 10px;
    padding-left: 20px;
    font-size: 12px;
    color: #fff;
    line-height: 18px;
    width: 418px;

    .item-label {
      color: #8cbcff;
      letter-spacing: 0px;
    }
  }

  .info-footer {
    background: rgba(255, 255, 255, 0.09);
    display: flex;
    justify-content: flex-end;
    padding: 4px 20px;

    button {
      border: none;
      line-height: 18px;
      background: #00000000;
      color: #fff;
    }
    .company-detail-btn {
      cursor: pointer !important;
    }
  }
}
</style>

<style lang="scss" scoped>
.screen-map {
  .search-box {
    position: absolute;
    top: 8.5%;
    left: 25.5%;
    z-index: 200;
    .select {
      width: 220px;
      &:deep(.el-select__wrapper) {
        box-shadow: none;
        background: rgba(14, 26, 47, 0.8);
        border-radius: 5px;
      }
    }
  }
}
</style>
