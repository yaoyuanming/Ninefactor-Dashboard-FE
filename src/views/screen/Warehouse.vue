<template>
  <div class="stats-section personnel-stats-section">
    <!-- <Title title="库区信息" :src="TitleImage" :tabs="[]" /> -->
    <div class="warehouse-overview-section">
      <div class="overview-data">
        <div class="data-item">
          <div class="data-icon">
            <!-- <img class="data-icon-image" src="@/assets/imgs/screen/kq-size.png" /> -->
          </div>
          <div class="data-content">
            <div class="data-value"
              >{{ storeDetail.totalArea }} <span class="data-unit">m²</span></div
            >
            <div class="data-label">库区面积</div>
          </div>
        </div>
        <div class="data-item">
          <div class="data-icon">
            <!-- <img class="data-icon-image" src="@/assets/imgs/screen/hy-weight.png" /> -->
          </div>
          <div class="data-content">
            <div class="data-value dosage-value">
              <span class="dosage-number">{{ storeDetail.totalDosage }}</span
              ><span class="data-unit">千克</span>
            </div>
            <div class="data-label">核定药量</div>
          </div>
        </div>
      </div>
      <div v-if="warehouseData.length === 0" style="margin-top: 20px; color: #fff; text-align: center;">
        暂无库房数据
      </div>
      <div v-for="warehouse in warehouseData" :key="warehouse.storeId">
        <div v-for="room in mergeRoomData(warehouse.temHumList)" :key="room.roomName" class="company-house">
          <div class="title-div">
            <!-- <img class="icon" src="@/assets/imgs/screen/warehouse/to.png" /> -->
            <div class="title">{{ room.roomName }}</div>
          </div>
          <div class="content-div">
            <div class="content-card">
              <div class="card-left">
                <!-- <img class="icon" src="@/assets/imgs/screen/warehouse/temp.png" /> -->
              </div>
              <div class="card-right">
                <div class="title">温度</div>
                <div class="num">{{ room.temp || '--' }}</div>
              </div>
            </div>
            <div class="content-card">
              <div class="card-left">
                <!-- <img class="icon" src="@/assets/imgs/screen/warehouse/humidity.png" /> -->
              </div>
              <div class="card-right">
                <div class="title">湿度</div>
                <div class="num">{{ room.humidity || '--' }}</div>
              </div>
            </div>
            <div class="content-card">
              <div class="card-left">
                <!-- <img class="icon" src="@/assets/imgs/screen/warehouse/size.png" /> -->
              </div>
              <div class="card-right">
                <div class="title">面积</div>
                <div class="num">{{ roomAcreageMap[room.roomName] || '--' }}m</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import Title from './Title.vue'
import { getCompanyReservoirInfo } from '@/api/monitoring/warehouseinfo'
import { ElMessage } from 'element-plus'
// import TitleImage from '../../../assets/imgs/screen/warehouse/icon.png' // Vite会处理图片导入
import { getCompanyInfo } from '@/api/monitoring/statistics/basicInfo'
import { getRiskMonitorHistoryValue } from '@/api/monitoring/statistics/riskMonitoringData'
import { getStoreRoomInfoPage } from '@/api/monitoring/warehouseinfo/index'

const storeDetail = ref<any>({})
const companyDetail = ref<any>({})
const warehouseData = ref<any[]>([])
const roomAcreageMap = ref<Record<string, number>>({})

// 合并同一 roomName 下的温度和湿度设备数据
function mergeRoomData(temHumList: any[]) {
  const map: Record<string, { roomName: string; temp?: string; humidity?: string }> = {}
  temHumList.forEach(item => {
    if (!map[item.roomName]) {
      map[item.roomName] = { roomName: item.roomName }
    }
    if (item.deviceType === '温度设备') {
      map[item.roomName].temp = item.realValue
    }
    if (item.deviceType === '湿度设备') {
      map[item.roomName].humidity = item.realValue
    }
  })
  return Object.values(map)
}

// 获取库区概述数据函数
const fetchOverviewData = async () => {
  try {
    const response = await getCompanyReservoirInfo()
    if (response) {
      storeDetail.value = response
    }
  } catch (error) {
    ElMessage.error('获取库区概述失败，请稍后再试。')
  }
}

const getCompanyDetail = async () => {
  const res = await getCompanyInfo()
  console.log('getCompanyDetail', res)
  companyDetail.value = res
}

const getRiskMonitorHistoryValueData = async () => {
  const today = new Date()
  const endTime = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} 23:59:59`
  try {
    const res = await getRiskMonitorHistoryValue(endTime)
    if (res && Array.isArray(res) && res.length > 0) {
      warehouseData.value = res

      const params = {
        pageNo: 1,
        pageSize: 10,
        storeNum: res[0].storeId
      }
      const roomRes = await getStoreRoomInfoPage(params)
      if (roomRes && Array.isArray(roomRes.list)) {
        const map: Record<string, number> = {}
        roomRes.list.forEach(item => {
          map[item.roomName] = item.acreage
        })
        roomAcreageMap.value = map
      }
    } else {
      warehouseData.value = []
    }
  } catch (error) {
    warehouseData.value = []
    ElMessage.error('获取温湿度数据失败，请稍后再试。')
  }
}



onMounted(() => {
  fetchOverviewData()
  getCompanyDetail()
  getRiskMonitorHistoryValueData()
})

onBeforeUnmount(() => {})
</script>

<style scoped lang="scss">
.stats-section {
  padding: 15px 22px 22px;
  margin-top: 12px;
  background-color: #040e21;
  border-radius: 4px;

  .warehouse-overview-section {
    margin-top: 12px;
    border-top: 1px solid;
    border-image: linear-gradient(
      270deg,
      rgb(115 154 175 / 0%) 6%,
      rgb(115 150 175 / 74%) 77%,
      rgb(115 158 175 / 0%) 97%
    );

    .overview-data {
      justify-content: space-around;
      margin: 0 -20px;

      .data-icon,
      .data-content {
        display: inline-block;

        .data-icon-image {
          width: 40px;
          height: 40px;
          margin-right: 8px;
        }
      }

      .data-content {
        width: 90px;
        vertical-align: sub;
      }

      .data-item {
        display: inline-block;
        width: 50%;
        text-align: center;

        .data-value {
          font-size: 20px;
          font-weight: bold;
          color: #fff;

          .data-unit {
            font-size: 8px;
            color: rgb(216 233 240 / 75%);
          }
        }

        .data-label {
          margin-top: 5px;
          font-size: 12px;
          color: rgb(216 233 240 / 75%);
        }
      }
    }

    .company-house {
      position: relative;
      margin-top: 12px;
      background: rgb(55 67 94 / 35%);
      border-radius: 4px;

      .title-div {
        height: 40px;

        .icon {
          position: absolute;
          top: -41px;
          left: -68px;
          width: 204px;
          height: 123px;
          opacity: 1;
        }

        .title {
          position: absolute;
          top: 11px;
          left: 55px;
          height: 22px;
          font-family: AlibabaPuHuiTi;
          font-size: 16px;
          font-weight: bold;
          line-height: normal;
          letter-spacing: 0;
          text-shadow: 0 0 20px rgb(255 255 255 / 27%);
          background: linear-gradient(270deg, #DFE3EB 0%, #FFF 56%, #D4D9E5 97%);
          opacity: 1;
          background-clip: text;
          font-variation-settings: "opsz" auto;
          font-feature-settings: "kern" on;
          -webkit-text-fill-color: transparent;
        }
      }

      .content-div {
        display: flex;
        padding: 0 12px 12px;
        gap: 8px;

        .content-card {
          display: flex;
          background: rgb(0 0 0 / 19%);
          border: 1px solid rgb(108 119 135 / 27%);
          border-radius: 8px;
          box-sizing: border-box;
          flex-grow: 1;
          align-self: stretch;

          .card-left {
            .icon {
              width: 54px;
              height: 54px;
            }
          }

          .card-right {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: baseline;
            height: 60px;

            .title {
              font-family: "Source Han Sans";
              font-size: 14px;
              font-weight: normal;
              line-height: normal;
              letter-spacing: 0;

              /* 文字 */
              color: rgb(216 233 240 / 75%);
              text-align: center;
            }

            .num {
              font-family: "Source Han Sans";
              font-size: 16px;
              font-weight: bold;
              line-height: normal;
              letter-spacing: 0;
              color: #FFF;
              text-align: center;
            }
          }
        }
      }
    }
  }
}
</style> 