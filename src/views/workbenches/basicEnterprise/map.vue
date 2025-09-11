<template>
  <div style="margin-top: 10px; position: relative">
    <!-- 添加position: relative作为定位上下文 -->
    <div id="mapElement" style="height: 700px; width: 100%; position: relative">
      <!-- 添加position: relative -->
      <!-- 浮动按钮 -->
      <div
        style="
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 1000;
          padding: 8px 8px;
          background: white;
          border-radius: 4px;
          border-color: blue;
          color: blue;
        "
      >
        企业整体风险总体概况
      </div>
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
    seriousRiskAreaLngLat: '[]'
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
    // console.log("JSON.parse(props.initialData.generalRiskAreaLngLat[0])",JSON.parse(props.initialData.generalRiskAreaLngLat[0]))
    // 处理组织区域（红色虚线）
    if (props.initialData.orgAreaLngLat && props.initialData.orgAreaLngLat.length != 0) {
      JSON.parse(props.initialData.orgAreaLngLat).forEach((path) => {
        const polygon = new AMap.Polygon({
          path: path,
          strokeColor: 'red',
          strokeWeight: 4,
          fillColor: 'transparent',
          zIndex: 1500,
          bubble: true,
          strokeStyle: 'dashed',
          strokeDasharray: [10, 10]
        })
        // const infoWindow = createInfoWindow()
        //
        // polygon.on('click', (e: any) => {
        //   infoWindow.open(map.value, e.lnglat)
        // })
        map.value.add([polygon])
      })
    }
    // var path1 = [[116.367461,39.853564],[116.553071,39.852451],[116.34861,39.772252],[116.234053,39.809021]]
    // var polygon6 = new AMap.Polygon({
    //   path: path1,
    //   strokeColor: "green",
    //   strokeWeight: 6,
    //   strokeOpacity: 0.2,
    //   fillOpacity: 0.4,
    //   fillColor: '#1791fc',
    //   zIndex: 50,
    //   bubble: true,
    //
    // })
    // map.value.add([polygon6])
    // console.log("path1",JSON.stringify(path1))
    // 处理一般风险区域（黄色）
    if (
      props.initialData.generalRiskAreaLngLat &&
      props.initialData.generalRiskAreaLngLat[0] != null &&
      props.initialData.generalRiskAreaLngLat[0].length != 0
    ) {
      console.log(
        'JSON.parse(props.initialData.generalRiskAreaLngLat[0])',
        JSON.parse(props.initialData.generalRiskAreaLngLat[0])
      )
      JSON.parse(props.initialData.generalRiskAreaLngLat[0]).forEach((path, index) => {
        const polygon1 = new AMap.Polygon({
          path: path,
          strokeColor: 'black',
          strokeWeight: 2,
          strokeOpacity: 1,
          fillOpacity: 1,
          fillColor: '#ffff00',
          zIndex: 1000
        })
        // const infoWindow = createInfoWindow()
        // polygon1.on('click', (e: any) => {
        //   infoWindow.open(map.value, e.lnglat)
        // })
        map.value.add([polygon1])
      })
    }

    // 处理较大风险区域（橙色）
    if (
      props.initialData.largeRiskAreaLngLat &&
      props.initialData.largeRiskAreaLngLat.length != 0
    ) {
      JSON.parse(props.initialData.largeRiskAreaLngLat[0]).forEach((path, index) => {
        // path.forEach((vv) => {
        const polygon2 = new AMap.Polygon({
          path: path,
          strokeColor: 'black',
          strokeWeight: 2,
          strokeOpacity: 1,
          fillOpacity: 1,
          fillColor: '#ffa500',
          zIndex: 1001
        })

        // const infoWindow = createInfoWindow(
        //   '较大风险区域',
        //   `区域编号: LR-${index + 1}<br>风险等级: 较大`
        // )
        //
        // polygon2.on('click', (e: any) => {
        //   infoWindow.open(map.value, e.lnglat)
        // })

        map.value.add([polygon2])
      })
      // })
    }
    //
    // 处理低风险区域（蓝色）
    if (props.initialData.lowRiskAreaLngLat && props.initialData.lowRiskAreaLngLat.length != 0) {
      JSON.parse(props.initialData.lowRiskAreaLngLat[0]).forEach((path, index) => {
        // path.forEach((vv) => {
        const polygon3 = new AMap.Polygon({
          path: path,
          strokeColor: 'black',
          strokeWeight: 2,
          strokeOpacity: 1,
          fillOpacity: 1,
          fillColor: '#0000ff',
          zIndex: 1002
        })

        // const infoWindow = createInfoWindow()
        //
        // polygon3.on('click', (e: any) => {
        //   infoWindow.open(map.value, e.lnglat)
        // })

        map.value.add([polygon3])
        // })
      })
    }
    //
    // // 处理重大风险区域（红色）
    if (
      props.initialData.seriousRiskAreaLngLat &&
      props.initialData.seriousRiskAreaLngLat.length != 0
    ) {
      JSON.parse(props.initialData.seriousRiskAreaLngLat[0]).forEach((path, index) => {
        // path.forEach((vv) => {
        const polygon4 = new AMap.Polygon({
          path: path,
          strokeColor: 'black',
          strokeWeight: 2,
          strokeOpacity: 1,
          fillOpacity: 1,
          fillColor: '#ff0000',
          zIndex: 1003
        })
        //
        // const infoWindow = createInfoWindow()
        //
        // polygon4.on('click', (e: any) => {
        //   infoWindow.open(map.value, e.lnglat)
        // })

        map.value.add([polygon4])
      })
      // })
    }

    map.value.setFitView()
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
