<template>
  <div style="margin-top: 10px; position: relative">
    <!-- 添加position: relative作为定位上下文 -->
    <div id="mapElement" style="height: 700px; width: 100%; position: relative">
      <!-- 添加position: relative -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import mapLoader from '@/utils/aMap.js'
import { ref, reactive, defineProps, defineEmits, withDefaults } from 'vue'
import type { ComponentSize, FormInstance, FormRules, FormProps } from 'element-plus'

interface FormData {
  generalRiskAreaLngLat: string
  largeRiskAreaLngLat: string
  lowRiskAreaLngLat: string
  orgAreaLngLat: string
  seriousRiskAreaLngLat: string
  companyLocation?: {
    longitude: number
    latitude: number
    name: string
  }
}

interface Props {
  initialData?: Partial<FormData>
  size?: ComponentSize
}

const props = withDefaults(defineProps<Props>(), {
  initialData: () => ({
    orgAreaLngLat: '[]',
    generalRiskAreaLngLat: '[]',
    largeRiskAreaLngLat: '[]',
    lowRiskAreaLngLat: '[]',
    seriousRiskAreaLngLat: '[]',
    companyLocation: undefined
  }),
  size: 'default'
})

const emit = defineEmits(['submit', 'reset', 'validated'])

const map = ref()
const initMap = () => {
  console.log('props.initialData', props.initialData)
  mapLoader().then((AMap) => {
    map.value = new AMap.Map('mapElement', {
      resizeEnable: true
    })
    
    // 添加卫星图层
    const satelliteLayer = new AMap.TileLayer.Satellite();
    map.value.add(satelliteLayer);

    // 创建信息窗口函数
    const createInfoWindow = () => {
      return new AMap.InfoWindow({
        content: `
          <div style="padding: 8px; ">
            <p style="color: #666;margin-bottom: 5px;">风险单元中体概况</p>
            <div class="myMapgrid-container">
  <div class="myMapgrid-item">风险点总数：</div>
  <div class="myMapgrid-item">9</div>
  <div class="myMapgrid-item">本年度隐患总数</div>
  <div class="myMapgrid-item">0</div>
  <div class="myMapgrid-item">低风险（蓝色）:</div>
  <div class="myMapgrid-item">1</div>
  <div class="myMapgrid-item">本年度重大隐患：</div>
  <div class="myMapgrid-item">0</div>
  <div class="myMapgrid-item">一般风险（黄色）:</div>
  <div class="myMapgrid-item">0</div>
  <div class="myMapgrid-item">当前未闭环隐患：</div>
  <div class="myMapgrid-item">0</div>
  <div class="myMapgrid-item">较大风险（橙色）：</div>
  <div class="myMapgrid-item">0</div>
  <div class="myMapgrid-item">本月新增隐患：</div>
  <div class="myMapgrid-item">0</div>
  <div class="myMapgrid-item">重大隐患（红色）：</div>
  <div class="myMapgrid-item">0</div>
  <div class="myMapgrid-item">隐患整改率：</div>
  <div class="myMapgrid-item">0</div>
</div>
          </div>
        `,
        offset: new AMap.Pixel(0, -30),
        closeWhenClickMap: true
      })
    }

    // 处理组织区域（红色虚线）
    if (props.initialData.orgAreaLngLat && props.initialData.orgAreaLngLat !== '[]' && props.initialData.orgAreaLngLat.length != 0) {
      try {
        const parsedData = JSON.parse(props.initialData.orgAreaLngLat)
        parsedData.forEach((path) => {
          const polygon = new AMap.Polygon({
            path: path,
            strokeColor: 'red',
            strokeWeight: 4,
            fillColor: 'rgba(255, 0, 0, 0.3)',
            zIndex: 1500,
            bubble: true,
            strokeStyle: 'dashed',
            strokeDasharray: [10, 10]
          })
          map.value.add([polygon])
        })
      } catch (error) {
        console.warn('解析组织区域数据失败:', error)
      }
    }

    // 处理一般风险区域（黄色）
    if (
      props.initialData.generalRiskAreaLngLat &&
      props.initialData.generalRiskAreaLngLat.length > 0
    ) {
      console.log('开始渲染一般风险区域，数量:', props.initialData.generalRiskAreaLngLat.length)
      props.initialData.generalRiskAreaLngLat.forEach((riskAreaJson, areaIndex) => {
        try {
          const parsedData = JSON.parse(riskAreaJson)
          console.log(`一般风险区域${areaIndex + 1}:`, parsedData)
          
          // 处理嵌套数组格式：[[[坐标1], [坐标2], ...]]
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            // 如果外层是数组，取第一个元素作为坐标数组
            const coordinates = Array.isArray(parsedData[0]) ? parsedData[0] : parsedData
            
            if (Array.isArray(coordinates) && coordinates.length >= 3) {
              const polygon1 = new AMap.Polygon({
                path: coordinates,
                strokeColor: 'black',
                strokeWeight: 2,
                strokeOpacity: 1,
                fillOpacity: 0.4,
                fillColor: 'rgba(255, 255, 0, 0.5)', // 半透明黄色填充
                zIndex: 1000
              })
              map.value.add([polygon1])
              console.log(`一般风险区域${areaIndex + 1} 渲染成功，坐标点数量:`, coordinates.length)
            } else {
              console.warn(`一般风险区域${areaIndex + 1} 坐标点不足3个:`, coordinates)
            }
          } else {
            console.warn(`一般风险区域${areaIndex + 1} 数据格式错误:`, parsedData)
          }
        } catch (parseError) {
          console.error(`解析一般风险区域${areaIndex + 1} 失败:`, parseError, '原始数据:', riskAreaJson)
        }
      })
    } else {
      console.log('一般风险区域数据为空')
    }

    // 处理较大风险区域（橙色）
    if (
      props.initialData.largeRiskAreaLngLat &&
      props.initialData.largeRiskAreaLngLat.length > 0
    ) {
      console.log('开始渲染较大风险区域，数量:', props.initialData.largeRiskAreaLngLat.length)
      props.initialData.largeRiskAreaLngLat.forEach((riskAreaJson, areaIndex) => {
        try {
          const parsedData = JSON.parse(riskAreaJson)
          console.log(`较大风险区域${areaIndex + 1}:`, parsedData)
          
          // 处理嵌套数组格式：[[[坐标1], [坐标2], ...]]
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            // 如果外层是数组，取第一个元素作为坐标数组
            const coordinates = Array.isArray(parsedData[0]) ? parsedData[0] : parsedData
            
            if (Array.isArray(coordinates) && coordinates.length >= 3) {
              const polygon2 = new AMap.Polygon({
                path: coordinates,
                strokeColor: 'black',
                strokeWeight: 2,
                strokeOpacity: 1,
                fillOpacity: 0.4,
                fillColor: 'rgba(255, 165, 0, 0.5)',
                zIndex: 1001
              })
              map.value.add([polygon2])
              console.log(`较大风险区域${areaIndex + 1} 渲染成功，坐标点数量:`, coordinates.length)
            } else {
              console.warn(`较大风险区域${areaIndex + 1} 坐标点不足3个:`, coordinates)
            }
          } else {
            console.warn(`较大风险区域${areaIndex + 1} 数据格式错误:`, parsedData)
          }
        } catch (parseError) {
          console.error(`解析较大风险区域${areaIndex + 1} 失败:`, parseError, '原始数据:', riskAreaJson)
        }
      })
    } else {
      console.log('较大风险区域数据为空')
    }
    
    // 处理低风险区域（蓝色）
    if (
      props.initialData.lowRiskAreaLngLat && 
      props.initialData.lowRiskAreaLngLat.length > 0
    ) {
      console.log('开始渲染低风险区域，数量:', props.initialData.lowRiskAreaLngLat.length)
      props.initialData.lowRiskAreaLngLat.forEach((riskAreaJson, areaIndex) => {
        try {
          const parsedData = JSON.parse(riskAreaJson)
          console.log(`低风险区域${areaIndex + 1}:`, parsedData)
          
          // 处理嵌套数组格式：[[[坐标1], [坐标2], ...]]
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            // 如果外层是数组，取第一个元素作为坐标数组
            const coordinates = Array.isArray(parsedData[0]) ? parsedData[0] : parsedData
            
            if (Array.isArray(coordinates) && coordinates.length >= 3) {
              const polygon3 = new AMap.Polygon({
                path: coordinates,
                strokeColor: 'black',
                strokeWeight: 2,
                strokeOpacity: 1,
                fillOpacity: 0.4,
                fillColor: 'rgba(0, 0, 255, 0.1)',
                zIndex: 1002
              })
              map.value.add([polygon3])
              console.log(`低风险区域${areaIndex + 1} 渲染成功，坐标点数量:`, coordinates.length)
            } else {
              console.warn(`低风险区域${areaIndex + 1} 坐标点不足3个:`, coordinates)
            }
          } else {
            console.warn(`低风险区域${areaIndex + 1} 数据格式错误:`, parsedData)
          }
        } catch (parseError) {
          console.error(`解析低风险区域${areaIndex + 1} 失败:`, parseError, '原始数据:', riskAreaJson)
        }
      })
    } else {
      console.log('低风险区域数据为空')
    }
    
    // 处理重大风险区域（红色）
    if (
      props.initialData.seriousRiskAreaLngLat &&
      props.initialData.seriousRiskAreaLngLat.length > 0
    ) {
      console.log('开始渲染重大风险区域，数量:', props.initialData.seriousRiskAreaLngLat.length)
      props.initialData.seriousRiskAreaLngLat.forEach((riskAreaJson, areaIndex) => {
        try {
          const parsedData = JSON.parse(riskAreaJson)
          console.log(`重大风险区域${areaIndex + 1}:`, parsedData)
          
          // 处理嵌套数组格式：[[[坐标1], [坐标2], ...]]
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            // 如果外层是数组，取第一个元素作为坐标数组
            const coordinates = Array.isArray(parsedData[0]) ? parsedData[0] : parsedData
            
            if (Array.isArray(coordinates) && coordinates.length >= 3) {
              const polygon4 = new AMap.Polygon({
                path: coordinates,
                strokeColor: 'black',
                strokeWeight: 2,
                strokeOpacity: 1,
                fillOpacity: 0.4,
                fillColor: '#ff0000',
                zIndex: 1003
              })
              map.value.add([polygon4])
              console.log(`重大风险区域${areaIndex + 1} 渲染成功，坐标点数量:`, coordinates.length)
            } else {
              console.warn(`重大风险区域${areaIndex + 1} 坐标点不足3个:`, coordinates)
            }
          } else {
            console.warn(`重大风险区域${areaIndex + 1} 数据格式错误:`, parsedData)
          }
        } catch (parseError) {
          console.error(`解析重大风险区域${areaIndex + 1} 失败:`, parseError, '原始数据:', riskAreaJson)
        }
      })
    } else {
      console.log('重大风险区域数据为空')
    }

    // 设置地图中心点和缩放级别
    if (map.value && typeof map.value.setFitView === 'function') {
      // 延迟执行，确保所有多边形都已添加
      setTimeout(() => {
        map.value.setFitView()
        console.log('地图已调整视野范围')
      }, 100)
    } else {
      console.warn('地图对象不可用或setFitView方法不存在')
    }
  })
}
onMounted(() => {
  initMap()
})

// 暴露方法给父组件
defineExpose({})
</script>
<style>
.amap-info-content {
  width: 350px;
  display: grid;
  grid-template-columns: 1fr;
}

.myMapgrid-container {
  display: grid;
  grid-template-columns: 3fr 1fr 3fr 1fr;
}

.myMapgrid-item {
  font-size: 12px;
}
</style>
<style scoped>
.demo-formData {
  margin: 0 auto;
}
</style>
