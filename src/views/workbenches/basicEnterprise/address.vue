<template>
  <el-dialog
    top="5vh"
    v-model="visible"
    title="获取经纬度坐标"
    width="60%"
    :before-close="handleClose"
    style="text-align: left"
  >
<!--    <el-col :span="24" v-if="infostate == 2">-->
<!--      <div style="background: #f3f3f3; padding: 10px">-->
<!--        操作说明：-->
<!--        <div> 1. 点击地图中的点，可获得经纬度，作为公司所在的经纬度</div>-->
<!--        <div> 2. 鼠标放置地图内，滚动鼠标滚轮可放大缩小地图，拖动地图可切换到更大范围</div>-->
<!--        <div> 3. 可以通过在输入框内输入公司地址（或附近地点）后，来快速定位位置</div>-->
<!--      </div>-->
<!--    </el-col>-->
    <el-col :span="24" style="padding: 10px" v-if="infostate == 2">
      <el-form-item>
        <el-input
          style="width: 200px; margin-right: 5px"
          v-model="ruleForm"
          placeholder="搜索关键字"
        />
        <el-button type="primary" @click="search">确定</el-button>
      </el-form-item>
    </el-col>
    <el-col :span="24">
      <div id="containers3" style="height: 500px; width: 100%" v-if="visible"></div>
    </el-col>
    <template #footer>
      <div class="dialog-footer" v-if="infostate == 2">
        <el-row style="text-align: left;">
          <el-col :span="18">
            <el-form :inline="true"  class="demo-form-inline" :model="formInline">
              <el-form-item label="经度">
                <el-input v-model="myLon" placeholder="经度" >
                  <template #append>
                    <div><Icon
                      icon="ep:copy-document"
                      class="mr-5px ml-5px"
                      style="color: blue; cursor: pointer;"
                      @click="copyRecordCode(myLon)"/></div>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item label="纬度">
                <el-input v-model="myLat" placeholder="纬度" >
                  <template #append>
                    <div><Icon
                      icon="ep:copy-document"
                      class="mr-5px ml-5px"
                      style="color: blue; cursor: pointer;"
                      @click="copyRecordCode(myLat)"/></div>
                  </template>
                </el-input>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="6" style="text-align: right;">
            <el-button type="primary" @click="submitForm"> 确定 </el-button>
            <el-button @click="visible = false">取消</el-button>
          </el-col>
        </el-row>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
let ruleForm = ref('')
import { ref } from 'vue'
import { ElButton, ElDrawer, ElNotification, ElMessageBox, ElMessage } from 'element-plus'
let myLon = ref("")//经度
let myLat = ref("")//纬度
const copyRecordCode = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    ElMessage.success('复制成功');
  } catch (err) {
    ElMessage.error('复制失败');
    console.error('复制失败:', err);
  }
};
let formInline = ref({})//纬度


const visible = ref(false)

const handleClose = (done) => {
  visible.value = false
}
let loading = ref(false)
const handleEdit = (row) => {
  visible.value = true
}
const emit = defineEmits(['clickMapInfo'])
const RefreshClick = (val) => {
  emit('clickMapInfo', '')
}
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}
let address = ref(null)
// 返回地图坐标信息
const submitForm = () => {
  var overlays = map.value.getAllOverlays('marker')
  if (overlays.length == 0) {
    ElNotification({
      message: '请选择位置',
      type: 'error'
    })
    return
  }
  // geocoder.value.getAddress(lnglat.value, function(status, result) {
  // 	if (status === 'complete' && result.regeocode) {
  // 		address.value = result.regeocode.formattedAddress;
  // 		let info = {
  // 			name: address.value,
  // 			position: marker.value.getPosition()
  // 		}
  // 		emit('clickMapInfo', info)
  // 	} else {}
  // });

  // geocoder.value
  geocoder.value.getAddress(overlays[0].getPosition(), function (status, result) {
    if (status === 'complete' && result.regeocode) {
      let info = {
        formattedAddress: result.regeocode.formattedAddress,
        position: overlays[0].getPosition()
      }
      emit('clickMapInfo', info)
    } else {
      ElMessage({
        message: '根据经纬度查询地址失败',
        type: 'error'
      })
    }
  })
  visible.value = false
}
let geocoder = ref(null)
import mapLoader from '@/utils/aMap.js'

let map = ref(null)
let marker = ref(null)
let placeSearch = ref(null)
let district = ref(null)
let polygon = ref(null)
const initMap = (val, areaCode) => {
  mapLoader().then(
    (AMap) => {
      map.value = new AMap.Map('containers3', {
        zoom: 9,
        resizeEnable: true
      })
      lnglat.value = new AMap.LngLat(116, 39)
      geocoder.value = new AMap.Geocoder({
        city: '', //城市设为北京，默认：“全国”
        radius: 1000 //范围，默认：500
      })

      placeSearch.value = new AMap.PlaceSearch({
        // city 指定搜索所在城市，支持传入格式有：城市名、citycode和adcode
        city: ''
      })
      map.value.on('complete', function () {
        //实例化DistrictSearch
        var opts = {
          subdistrict: 0, //获取边界不需要返回下级行政区
          extensions: 'all', //返回行政区边界坐标组等具体信息
          level: 'district' //查询行政级别为 市
        }
        district.value = new AMap.DistrictSearch(opts)
        if (infostate.value == 1) {
          district.value.search(areaCode, function (status, result) {
            console.log('status:', status, ':result:', result)
            if (polygon.value.value) {
              map.value.remove(polygon.value) //清除上次结果
              polygon.value = null
            }
            var bounds = result.districtList[0].boundaries
            if (bounds) {
              //生成行政区划polygon
              for (var i = 0; i < bounds.length; i += 1) {
                //构造MultiPolygon的path
                bounds[i] = [bounds[i]]
              }
              polygon.value = new AMap.Polygon({
                strokeWeight: 1,
                path: bounds,
                fillOpacity: 0.4,
                fillColor: '#80d8ff',
                strokeColor: '#0091ea'
              })
              map.value.add(polygon.value)
              map.value.setFitView() //视口自适应
            }
          })
        } else {
          if (areaCode == null) {
            map.value.on('click', (e) => {
              if (marker.value) {
                map.value.remove(marker.value) //清除上次结果
                marker.value = null
              }
              // currentPosition.value = e.lnglat
              // addMarker(e.lnglat)
              marker.value = new AMap.Marker({
                position: e.lnglat
                // map: map.value
              })
              lnglat.value.setLng(e.lnglat.lng)
              lnglat.value.setLat(e.lnglat.lat)
              myLon.value = e.lnglat.lng
              myLat.value = e.lnglat.lat
              marker.value.setMap(map.value)
            })
            // 创建新标记
            // marker.value = new AMap.Marker({
            //   map: map.value
            // })
            // polygon.value.on('click', function(e) {
            //   if (marker.value) {
            //     map.value.remove(marker.value) //清除上次结果
            //     marker.value = null;
            //   }
            //   marker.value = new AMap.Marker({
            //     position: e.lnglat,
            //     offset: new AMap.Pixel(0, 0)
            //   });
            //   lnglat.value.setLng(e.lnglat.lng)
            //   lnglat.value.setLat(e.lnglat.lat)
            //   marker.value.setMap(map.value);
            // });
            // map.value.add(polygon.value)
            // map.value.setFitView();
          } else {
            district.value.search(areaCode[2], function (status, result) {
              if (polygon.value) {
                map.value.remove(polygon.value) //清除上次结果
                polygon.value = null
              }
              var bounds = result.districtList[0].boundaries
              if (bounds) {
                //生成行政区划polygon
                for (var i = 0; i < bounds.length; i += 1) {
                  //构造MultiPolygon的path
                  bounds[i] = [bounds[i]]
                }
                polygon.value = new AMap.Polygon({
                  strokeWeight: 1,
                  path: bounds,
                  fillOpacity: 0.4,
                  fillColor: '#80d8ff',
                  strokeColor: '#0091ea'
                })
                if (infostate.value == 2) {
                  polygon.value.on('click', function (e) {
                    if (marker.value) {
                      map.value.remove(marker.value) //清除上次结果
                      marker.value = null
                    }
                    marker.value = new AMap.Marker({
                      position: e.lnglat,
                      offset: new AMap.Pixel(0, 0)
                    })
                    lnglat.value.setLng(e.lnglat.lng)
                    lnglat.value.setLat(e.lnglat.lat)
                    marker.value.setMap(map.value)
                  })
                  map.value.add(polygon.value)
                  map.value.setFitView()
                }
                // map.value.setFitView(polygon.value); //视口自适应
              }
            })
          }
        }
        console.log(val)
        if (val.lat != null && val.lng != null && val.lat != '' && val.lng != '') {
          myLat.value = val.lat
          myLon.value = val.lng
          marker.value = new AMap.Marker({
            position: [val.lng, val.lat],
            offset: new AMap.Pixel(0, 0)
          })
          marker.value.setMap(map.value)
          map.value.setFitView()
        }
      })
      if (infostate.value == 2) {
        // map.value.on('click', showInfoClick);
      }
    },
    (e) => {
      console.log('地图加载失败', e)
    }
  )
}
const search = () => {
  placeSearch.value.search(ruleForm.value, function (status, result) {
    // 查询成功时，result即对应匹配的POI信息
    var pois = result.poiList.pois
    if (marker.value) {
      map.value.remove(marker.value) //清除上次结果
      marker.value = null
    }
    for (var i = 0; i < 1; i++) {
      var poi = pois[i]
      marker.value = new AMap.Marker({
        position: poi.location,
        offset: new AMap.Pixel(0, 0)
      })
      marker.value.setMap(map.value)
      map.value.setFitView()
      // 将创建的点标记添加到已有的地图实例：
    }
    map.value.setFitView()
  })
  // ruleForm.value
  // 地图位置搜索
}
let lnglat = ref(null)
const showInfoClick = (e) => {
  if (marker.value) {
    map.value.remove(marker.value) //清除上次结果
    marker.value = null
  }
  // map.value.clearMap()
  marker.value = new AMap.Marker({
    position: e.lnglat,
    offset: new AMap.Pixel(0, 0)
  })
  lnglat.value.setLng(e.lnglat.lng)
  lnglat.value.setLat(e.lnglat.lat)
  marker.value.setMap(map.value)
}
let infostate = ref('')
// 打开地图
const openMap = (val, state, areaCode) => {
  initMap(val, areaCode)
  infostate.value = state
  visible.value = true
}
defineExpose({
  handleEdit,
  openMap
})
</script>
<style scoped>
:deep(.el-card__header) {
  background-color: #f2f2f2;
}
</style>
