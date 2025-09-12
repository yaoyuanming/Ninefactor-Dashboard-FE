<template>
  <div class="screen-map" style="height: 100%; width: 100%; position: relative" v-loading="loading">
    <div class="search-box">
      <el-select
        multiple
        clearable
        @change="getCompanyListIfo"
        v-model="riskLevel"
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
              value: '1'
            },
            {
              label: '粉尘涉爆',
              value: '2'
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

import { usePermissionStore } from '@/store/modules/permission'
import { DICT_TYPE, getDictLabel } from '@/utils/dict'
// import { jiaomeiData } from './jiaomei.ts' // Removed as per edit hint

const emit = defineEmits(['submit', 'reset', 'validated'])
const companyList = ref<any[]>([])

const map = ref<any>(null)
const aMap = ref<any>(null)
const loca = ref<any>(null) // Loca容器实例
// 新增遮罩相关变量
const maskPolygon = ref<any>(null)
const boundariesValue = ref<any>(null)
const targetDistrict = '石狮市'
let currentMarkers: any[] = []
const riskLevel = ref<string[]>([])
const loading = ref(true)
const INFO_WINDOW_CLOSE_DELAY = 1000
const { push } = useRouter()
const permissionStore = usePermissionStore()

// 全局单例InfoWindow实例
const globalInfoWindow = ref<any>({
  instance: null,
  currentMarker: null // 新增：记录当前关联的marker
})
const topMenus = computed(() => {
  return permissionStore.getRouters.filter((route) => {
    if (route.meta?.hidden) return false
    if (!route.children) return true
    if (route.children && route.children.length > 0) return true
    return false
  })
})

const companyIcon = {
  size: [30, 36],
  image: {
    0: {
      0: Risk02,
      2: Risk02,
      5: Risk05,
      8: Risk08,
      10: Risk010
    },
    1: {
      0: Risk12,
      2: Risk12,
      5: Risk15,
      8: Risk18,
      10: Risk110
    },
    2: {
      0: Risk22,
      2: Risk22,
      5: Risk25,
      8: Risk28,
      10: Risk210
    },
    3: {
      0: Risk32,
      2: Risk32,
      5: Risk35,
      8: Risk38,
      10: Risk310
    }
  },
  color: {
    0: '#00C6DA',
    2: '#00C6DA',
    5: '#E1CE2B',
    8: '#FF9C23',
    10: '#FF363C ',
  },
  anchor: 'bottom-center'
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
          // terrain: true, // 开启地形图
          rotateEnable: false, // 禁用旋转
          pitchEnable: false, // 禁用俯仰
          pitch: 40, // 俯仰角度
          rotation: 0, // 旋转角度
          zooms: [12, 20],
          zoom: 13.2,
          center: [118.65, 24.73], // 石狮市中心坐标
          mapStyle: 'amap://styles/grey' // 深色底图增强极光效果
        })

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

  // 使用行政区查询返回的第一个边界路径
  const pathLngLat = (boundaries && boundaries[0]) || []
  if (!pathLngLat.length) return

  // 优化后的方向光源配置
  const dirLight = new Loca.DirectionalLight({
    intensity: 0.9, // 提高强度增强立体感
    color: 'rgb(255, 250, 240)', // 暖白色模拟自然阳光
    target: [0, 1, 0], // 保持Y轴正方向
    position: [0, -1, 0], // 调整位置创造斜射效果
    castShadow: true // 启用阴影增强立体切割感
  })
  loca.value.addLight(dirLight)

  // var pointLight = new Loca.PointLight({
  //   color: 'rgb(100,100,100)',
  //   position: [117.82, 24.45, 10000], // 使用地图中心点
  //   intensity: 5,
  //   distance: 50000
  // })
  // loca.addLight(pointLight)

  // 创建面状GeoJSON
  const polygonCoords = pathLngLat.map((p) => [p.lng, p.lat])
  const geojson = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [polygonCoords]
        }
      }
    ]
  }

  var geo = new Loca.GeoJSONSource({ data: geojson })
  var auroraLayer = new Loca.PolygonLayer({
    zIndex: 40,
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
  // 使用 DistrictSearch 返回的路径作为孔洞
  const innerPath = (boundaries && boundaries[0]) || []
  if (!innerPath.length) return
  const pathArray = [outer, innerPath]
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

// 添加龙海区边界线
const addDistrictBoundary = (boundaries: any[]) => {
  boundaries.forEach((boundary: any) => {
    // 主体
    new aMap.value.Polygon({
      path: boundary,
      strokeColor: 'rgba(134, 247, 255, 0.73)',
      strokeWeight: 1,
      strokeStyle: 'solid',
      fillColor: 'rgba(134, 247, 255, 0.37)', // 填充色（透明）
      fillOpacity: 0.37,
      strokeOpacity: 0.9,
      lineJoin: 'round',
      map: map.value,
      zIndex: 5
    })
  })
}


const addCompanyMarkers = () => {
  clearMarkers()

  if (!map.value || !aMap.value || !companyList.value.length) return

  const AMap = aMap.value

  companyList.value.forEach((company) => {
    if (!company.longitude || !company.latitude) return

    // 创建标记
    const marker = new AMap.Marker({
      position: new AMap.LngLat(parseFloat(company.longitude), parseFloat(company.latitude)),
      content: createMarkerContent(company),
      anchor: companyIcon.anchor,
      zIndex: 100, // 提高zIndex确保标记在极光层上方
      extData: company
    })

    // 使用单例InfoWindow处理事件
    marker.on('mouseover', (e: any) => {
      // 切换节点时清空上一个节点的计时器
      if (globalInfoWindow.value.currentMarker && globalInfoWindow.value.currentMarker !== marker) {
        clearTimeout(globalInfoWindow.value.currentMarker.closeTimer)
        globalInfoWindow.value.currentMarker.closeTimer = null
      }

      // 🔄 更新当前关联节点
      globalInfoWindow.value.currentMarker = marker

      if (marker.closeTimer) {
        clearTimeout(marker.closeTimer)
        marker.closeTimer = null
      }

      highlightMarker(marker, true)

      // 设置全局InfoWindow内容并打开
      globalInfoWindow.value.instance.setContent(createInfoWindowContent(company, topMenus))
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
            pushToEnterpriseDetail(company)
          })
        }
      })
    })

    marker.on('mouseout', () => {
      highlightMarker(marker, false)
      marker.closeTimer = setTimeout(() => {
        // ⚠️ 注意：需检查InfoWindow是否未被鼠标悬停
        const content = globalInfoWindow.value.instance.getContent()
        if (!content?.matches(':hover') && globalInfoWindow.value.instance?.getIsOpen()) {
          globalInfoWindow.value.instance.close()
        }
      }, INFO_WINDOW_CLOSE_DELAY)
    })

    currentMarkers.push(marker)
  })

  map.value.add(currentMarkers)
  nextTick(() => {
    // 关闭InfoWindow避免冲突
    if (globalInfoWindow.value.instance?.getIsOpen()) {
      globalInfoWindow.value.instance.close()
    }

    // 修复 setFitView 调用
    if (boundariesValue.value) {
      // 创建包含所有点的数组
      const allPoints = boundariesValue.value.flat()

      map.value.setFitView(allPoints, {
        padding: [50, 50],
        duration: 450 // 添加动画时长
      })
    }
  })
}

// 高亮标记
const highlightMarker = (marker: any, isHighlight: boolean) => {
  const content = marker.getContent()
  if (content) {
    const img = content.querySelector('img')
    if (img) {
      img.style.transform = isHighlight ? 'scale(1.1) translateY(-3px)' : 'scale(1) translateY(0)'
      img.style.transition = 'transform 0.2s ease'
    }
  }
}

// 创建标记内容（添加极光脉冲效果）
const createMarkerContent = (company: any) => {
  const div = document.createElement('div')
  const riskType = riskLevel.value?.[0] || company.riskEnvTypes?.split(',')?.[0] || 0
  const riskLvl = company.riskLevel || 0
  const pulseColor = companyIcon.color?.[riskLvl]
  
  div.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      position: relative;
      align-items: center;
      cursor: pointer;
    ">
      <div style="
        position:absolute;
        top:-8px; left:-8px;
        width:46px; height:46px;
        border-radius:50%;
        background:${pulseColor};
        opacity:0.3;
        animation:pulse 2s infinite;
        z-index: -1;
      "></div>
      <img src="${companyIcon.image[riskType]?.[riskLvl]}" 
           alt="公司图标" 
           style="width: ${companyIcon.size[0]}px; height: ${companyIcon.size[1]}px;" />
    </div>
  `
  return div
}

// 创建信息窗口内容
const createInfoWindowContent = (company: any, topMenus: any) => {
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
      <span class="item-label">整体风险等级：</span>
      <span>${getDictLabel(DICT_TYPE.INHERENT_RISK, company.riskLevel) || '暂无数据'}</span>
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
  const selectedRoute = topMenus.value.find((item) => item.path === '/enterpriseArchives')
  permissionStore.setLeftMenuTabRouterIs('/enterpriseArchives')
  permissionStore.setLeftMenuTabRouters(selectedRoute?.children)
  push({
    path: `/enterpriseArchives/basic/` + company.id
  })
}

// 清理标记
const clearMarkers = () => {
  if (currentMarkers.length) {
    currentMarkers.forEach((marker) => {
      marker.off('mouseover mouseout')
    })
    map.value.remove(currentMarkers)
    currentMarkers = []
  }

  // 关闭全局InfoWindow
  if (globalInfoWindow.value.instance && globalInfoWindow.value.instance?.getIsOpen()) {
    globalInfoWindow.value.instance.close()
  }
}

const getCompanyListIfo = async () => {
  try {
    loading.value = true // 添加加载状态管理
    const res = await getCompanyList({
      pageNo: 1,
      pageSize: 100,
      riskEnvTypes: riskLevel.value?.join(',')
    })
    companyList.value = res?.list || []
    addCompanyMarkers()
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
  clearMarkers()
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

/* 添加脉冲动画 */
@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 0.7;
  }
  70% {
    transform: scale(1.5);
    opacity: 0.1;
  }
  100% {
    transform: scale(1.8);
    opacity: 0;
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