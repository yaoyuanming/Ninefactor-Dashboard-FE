<template>
  <div>
    <div style="background: #f3f3f3; padding: 10px">
      操作说明：
      <div>
        1. 点击【绘制区域】按钮，鼠标在地图上变成➕，按顺序点击要圈定的范围，可形成多边形，
        最后双击鼠标即可结束编辑。
      </div>
      <div> 2. 鼠标放置地图内，滚动鼠标滚轮可放大缩小地图，拖动地图可切换到更大范围。</div>
      <div> 3. 如果要删除绘制好的区域，先选中要删除的多边形，再点击【删除区域】按钮。</div>
    </div>
    <el-col :span="24" style="padding: 10px">
      <el-form-item label="绘制单元范围">
        <el-input
          style="width: 200px; margin-right: 5px"
          v-model="ruleForm"
          placeholder="搜索关键字"
          @keyup.enter="search"
        />
      </el-form-item>
      <el-form-item style="margin-top: 10px;">
        <el-button type="primary" @click="showInfoClick">绘制区域</el-button>
        <el-button type="primary" @click="deletePolygon">删除区域</el-button>
      </el-form-item>
    </el-col>
    <div id="containers1" style="height: 800px; width: 100%"></div>
  </div>
</template>

<script setup lang="ts">
let ruleForm = ref('')
import { defineEmits, defineProps, reactive, ref, withDefaults } from 'vue'
import {
  ElButton,
  type ComponentSize
} from 'element-plus'

interface FormData {
  deptId: String
  riskUnitName: String
  riskPoint: String
  riskLevel: String
}

interface Props {
  initialData?: Partial<FormData>
  size?: ComponentSize
}

const props = withDefaults(defineProps<Props>(), {
  initialData: () => ({
    deptId: '',
    riskUnitName: '',
    riskPoint: '',
    riskLevel: ''
  }),
  size: 'default'
})

const formData = reactive<FormData>({
  deptId: props.initialData.deptId || '',
  riskUnitName: props.initialData.riskUnitName || '',
  riskPoint: props.initialData.riskPoint || '',
  riskLevel: props.initialData.riskLevel || ''
})
const emit = defineEmits(['clickMapInfo', 'submit', 'reset', 'validated'])
// 返回地图坐标信息
const submitForm = async (): Promise<{
  state: boolean
  data: FormData | null
}> => {
  return new Promise((resolve) => {
    let array = []
    map.value.getAllOverlays('polygon').forEach((i) => {
      let position = []
      i.getPath().forEach((item) => {
        position.push([item.lng, item.lat])
      })
      array.push(position)
    })
    resolve({
      state: true,
      data: JSON.stringify(array)
    })
  })
}
import mapLoader from '@/utils/aMap.js'
let map = ref('')
let marker = ref(null)
let mouseTool = ref(null)
let polygons = ref([])
let placeSearch = ref(null)
let district = ref(null)
const initMap = (val, areaCode) => {
  mapLoader().then(
    (AMap) => {
      map.value = new AMap.Map('containers1', {
        zoom: 9,
        resizeEnable: true
      })
      mouseTool.value = new AMap.MouseTool(map.value)
      placeSearch.value = new AMap.PlaceSearch({
        // city 指定搜索所在城市，支持传入格式有：城市名、citycode和adcode
        city: ''
      })
      //监听draw事件可获取画好的覆盖物
      map.value.on('complete', function () {
        //实例化DistrictSearch
        var opts = {
          subdistrict: 0, //获取边界不需要返回下级行政区
          extensions: 'all', //返回行政区边界坐标组等具体信息
          level: 'district' //查询行政级别为 市
        }
        district.value = new AMap.DistrictSearch(opts)
        mapindex = 0
        if (formData.riskPoint != null) {
          let addr = JSON.parse(formData.riskPoint)
          if (addr.length == 0) {
            district.value.search(areaCode[2], function (status, result) {
              console.log('status:', status, ':result:', result)
              if (result.districtList != null) {
                map.value.setCenter(result.districtList[0].center)
              }
            })
          }
          addr.forEach((path) => {
            var polygon = new AMap.Polygon({
              path: path,
              strokeColor: 'green',
              strokeWeight: 6,
              strokeOpacity: 0.2,
              fillOpacity: 0.4,
              fillColor: '#1791fc',
              zIndex: 50,
              bubble: true
            })
            polygon.setExtData({
              id: mapindex
            })
            mapindex++
            polygon.on('click', function (i) {
              polygons.value.forEach((item) => {
                item.setOptions({
                  fillColor: '#00b0ff',
                  strokeColor: '#80d8ff'
                })
              })
              deleteId = i.target.getExtData().id
              i.target.setOptions({
                fillColor: '#ff0000',
                strokeColor: '#ff0000'
              })
            })
            polygons.value.push(polygon)
            map.value.add([polygon])
            map.value.setFitView()
          })
        } else {
          district.value.search(areaCode[2], function (status, result) {
            console.log('status:', status, ':result:', result)
            if (result.districtList != null) {
              map.value.setCenter(result.districtList[0].center)
            }
          })
        }
      })
    },
    (e) => {
      console.log('地图加载失败', e)
    }
  )
}
let deleteId = null
const deletePolygon = () => {
  map.value.setDefaultCursor('')
  mouseTool.value.close(false)
  polygons.value.forEach((e) => {
    if (e.getExtData().id == deleteId) {
      map.value.remove(e)
    }
  })
}
const search = (name) => {
  placeSearch.value.search(ruleForm.value, function (status, result) {
    // 查询成功时，result即对应匹配的POI信息
    var pois = result.poiList.pois
    map.value.clearMap()
    for (var i = 0; i < 1; i++) {
      var poi = pois[i]
      if (marker.value) {
        map.value.remove(marker.value) //清除上次结果
        marker.value = null
      }
      marker.value = new AMap.Marker({
        position: poi.location,
        offset: new AMap.Pixel(0, 0)
      })
      marker.value.setMap(map.value)
      map.value.setCenter(poi.location)
    }
    map.value.setFitView()
  })
}
let mapindex = 0
let lnglat = ref(null)
const showInfoClick = (e) => {
  map.value.setDefaultCursor('crosshair')
  mouseTool.value.polygon({
    fillColor: '#00b0ff',
    strokeColor: '#80d8ff'
    //同Polygon的Option设置
  })
  mouseTool.value.on('draw', function (e) {
    //获取画好的
    e.obj.setExtData({
      id: mapindex
    })
    e.obj.on('click', function (i, e) {
      polygons.value.forEach((item) => {
        item.setOptions({
          fillColor: '#00b0ff',
          strokeColor: '#80d8ff'
        })
      })
      deleteId = i.target.getExtData().id
      i.target.setOptions({
        fillColor: '#ff0000',
        strokeColor: '#ff0000'
      })
    })
    polygons.value.push(e.obj)
    mapindex++
    mouseTool.value.close(false)
    map.value.setDefaultCursor('default')
  })
}
let infostate = ref('')
// 打开地图
const openMap = (val, state, areaCode) => {
  areaCode = [1, 2, '355000']
  initMap(val, areaCode)
  infostate.value = state
}

/** 初始化 */
onMounted(async () => {
  openMap()
})
defineExpose({
  openMap,
  validate: submitForm,
  search
})
</script>
<style scoped>
:deep(.el-card__header) {
  background-color: #f2f2f2;
}
</style>
