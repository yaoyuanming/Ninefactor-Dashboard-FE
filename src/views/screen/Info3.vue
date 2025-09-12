<template>
  <div class="stats-section">
    <Title class="stats-section-title" title="隐患治理情况" :tabs="[]" />
    <div class="warehouse-overview-section">
      <div class="hidden-danger">
        <img class="img1" src="@/assets/imgs/screen/hidden-danger.png" />
        <img class="img2" src="@/assets/imgs/screen/hidden-danger2.png" />
        <div class="text-card card-left">
          <div class="title">已排查隐患总数</div>
          <div class="num">{{ dangerDetail?.totalHiddenDangers }}</div>
        </div>
        <div class="text-card card-right">
          <div class="title">隐患整改率</div>
          <div class="num">{{
            dangerDetail?.rectificationRate 
              ? (dangerDetail.rectificationRate * 100).toFixed(1) + '%'
              : '-'
          }}</div>
        </div>
      </div>
      <div class="select-card">
        <div :class="`card-right ${tabs === 'company' ? 'active' : ''}`" @click="tabs = 'company'"
          >企业自查<div class="active-show"></div
        ></div>
        <div
          :class="`card-left ${tabs === 'government' ? 'active' : ''}`"
          @click="tabs = 'government'"
          >政府检查<div class="active-show"></div
        ></div>
      </div>
      <div class="company-detail">
        <div class="company-detail-card">
          <img class="card-icon" src="@/assets/imgs/screen/danger4.png" />
          <div>
            <div class="card-title">隐患总数</div>
            <div v-if="tabs === 'government'" class="card-content">{{
              dangerDetail?.governmentCheck?.totalHiddenDangers
            }}</div>
            <div v-else class="card-content">{{
              dangerDetail?.enterpriseSelfCheck?.totalHiddenDangers
            }}</div>
          </div>
        </div>
        <div class="company-detail-card">
          <img class="card-icon" src="@/assets/imgs/screen/danger5.png" />
          <div>
            <div class="card-title">重大隐患</div>
            <div v-if="tabs === 'government'" class="card-content">{{
              dangerDetail?.governmentCheck?.majorHiddenDangers
            }}</div>
            <div v-else class="card-content">{{
              dangerDetail?.enterpriseSelfCheck?.majorHiddenDangers
            }}</div>
          </div>
        </div>
        <div class="company-detail-card">
          <img class="card-icon" src="@/assets/imgs/screen/danger6.png" />
          <div>
            <div class="card-title">一般隐患</div>
            <div v-if="tabs === 'government'" class="card-content">{{
              dangerDetail?.governmentCheck?.generalHiddenDangers
            }}</div>
            <div v-else class="card-content">{{
              dangerDetail?.enterpriseSelfCheck?.generalHiddenDangers
            }}</div>
          </div>
        </div>
      </div>
      <!-- <SecTitle class="sec-title" title="隐患整改情况" :tabs="[]" /> -->
      <div class="alarm-distribution">
        <!-- 图表容器 -->
        <div ref="alarmChartContainer" class="alarm-chart-container"></div>
        <div class="alarm-type-list">
          <div v-for="item in alarmTypes" :key="item.name" class="alarm-legend-item">
            <div class="title">
              <span
                class="legend-color-block"
                :style="{ backgroundColor: item.itemStyle.color }"
              ></span>
              <span class="legend-text">{{ item.name }}</span>
            </div>
            <div class="num" :style="{ color: item.itemStyle.color }">{{ item.value }}</div>
          </div>
        </div>
      </div>
      <div class="company-info">
        <div class="title-div">
          <img class="icon" src="@/assets/imgs/screen/company.png" />
          <div class="title">近三个月零申报企业数</div>
        </div>
        <div class="number-div">
          <div class="num">{{ dangerDetail?.zeroDeclarationEnterprises || 0 }}</div>
          <div class="unit">家</div>
        </div>
      </div>
      <SecTitle class="sec-title" title="年度隐患整改分布统计" :tabs="[]" />
      <div class="echarts-line">
        <div ref="lineContainer" class="line-container"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import Title from './Title.vue'
import SecTitle from './SecTitle.vue'
import * as echarts from 'echarts'
import type { EChartsType } from 'echarts'
import CenterBg from '../../assets/imgs/screen/center-bg.png' // Vite会处理图片导入
import CenterImg3 from '../../assets/imgs/screen/center-img3.png' // Vite会处理图片导入
import { getDangerStatistics, getInspectionStatistics, getMonthlyAddList } from '@/api/screen'

const alarmChartContainer = ref<HTMLElement | null>(null)
const lineContainer = ref<HTMLElement | null>(null)
let alarmChart = ref<EChartsType | null>(null)
let lineChart = ref<EChartsType | null>(null)
const alarmTypes = ref([
  { value: 0, name: '已整改', itemStyle: { color: '#A4E76C' } },
  { value: 0, name: '整改中', itemStyle: { color: '#B0BCD3' } },
  { value: 0, name: '逾期未整改', itemStyle: { color: '#DED15D' } }
])
const lineChartsData = ref()
const dangerDetail = ref<any>({})
const inspectionDetail = ref<any>({})
const companyDetail = ref<number>(0)
const tabs = ref<any>('company')

// 获取近三个月零申报企业数
// const fetchZeroDeclarationCount = async () => {
//   const res = await getZeroDeclarationCount()
//   companyDetail.value = res
// }

const chartOption = {
  tooltip: {
    trigger: 'item'
  },
  graphic: {
    type: 'group', // 使用组包裹多个元素
    left: 'center',
    top: 'center',
    children: [
      {
        type: 'image',
        silent: true,
        style: {
          image: CenterBg, // 图片路径
          width: 83,
          height: 83
        },
        left: 'center',
        top: 'center'
      },
      {
        type: 'image',
        silent: true,
        style: {
          image: CenterImg3, // 图片路径
          width: 33,
          height: 33
        },
        left: 'center',
        top: 'center'
      }
    ]
  },
  series: [
    {
      name: '隐患整改',
      type: 'pie',
      radius: ['75%', '90%'], // 饼图半径
      itemStyle: {
        borderRadius: 1
      },
      padAngle: 5,
      avoidLabelOverlap: false,
      label: {
        show: false, // 默认不显示标签
        position: 'outside',
        formatter: '{b}: {c} ({d}%)'
      },
      emphasis: {
        label: {
          show: false, // 悬停时不显示标签
          fontSize: '12',
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false // 不显示标签引导线
      },
      data: alarmTypes.value
    }
  ]
}
// 月份数据
const months = [
  '1月',
  '2月',
  '3月',
  '4月',
  '5月',
  '6月',
  '7月',
  '8月',
  '9月',
  '10月',
  '11月',
  '12月'
]
// 整改隐患数
const rectificationRates = ref([])
// 新增隐患数
const newHiddenDangers = ref([])
const lineChartOption = {
  tooltip: {
    trigger: 'item'
  },
  legend: {
    show: false,
    data: ['隐患整改率', '新增隐患数'],
    right: 10,
    top: 10
  },
  grid: {
    left: '32px', // 调整左侧边距为 Y 轴标签留白
    right: '32px',
    bottom: '20px',
    top: '8px'
  },
  xAxis: [
    {
      type: 'category',
      boundaryGap: true,
      data: months,
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.5)' } },
      axisLabel: { color: 'rgba(255, 255, 255, 0.7)' }
    }
  ],
  yAxis: [
    {
      type: 'value',
      min: 0,
      max: 'dataMax', // 自动根据数据最大值设置
      interval: 'auto', // 自动计算间隔
      axisLine: {
        show: true,
        lineStyle: { color: 'rgba(255, 255, 255, 0.5)' }
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        formatter: '{value}',
        fontSize: 10
      },
      splitLine: {
        show: true,
        lineStyle: { type: 'dashed', color: 'rgba(255, 255, 255, 0.2)' }
      }
    },
    {
      type: 'value',
      min: 0,
      max: 'dataMax', // 自动根据数据最大值设置
      interval: 'auto', // 自动计算间隔
      axisLine: {
        show: false,
        lineStyle: { color: 'rgba(255, 255, 255, 0.5)' }
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        formatter: '{value}',
        fontSize: 10
      },
      splitLine: {
        show: true,
        lineStyle: { type: 'dashed', color: 'rgba(255, 255, 255, 0.2)' }
      }
    }
  ],
  series: [
    {
      name: '整改隐患数',
      type: 'line',
      yAxisIndex: 0,
      data: rectificationRates.value,
      smooth: true,
      itemStyle: { color: '#4285F4' },
      lineStyle: { width: 2 }
    },
    {
      name: '新增隐患数',
      type: 'bar',
      yAxisIndex: 1,
      data: newHiddenDangers.value,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#FF9C3F' },
          { offset: 1, color: 'rgba(255, 129, 11, 0)' }
        ])
      },
      barWidth: '50%'
    }
  ]
}
const updateChart = () => {
  if (alarmChart.value) {
    alarmChart.value.setOption({
      series: [
        {
          name: '隐患整改',
          data: alarmTypes.value
        }
      ]
    })
  }
}
const updateLineChart = () => {
  if (lineChart.value) {
    lineChart.value.setOption({
      series: [
        {
          name: '整改隐患数',
          data: rectificationRates.value
        },
        {
          name: '新增隐患数',
          data: newHiddenDangers.value
        }
      ]
    })
  }
}

const getData = () => {
  getDangerStatistics().then((res) => {
    dangerDetail.value = res
    // 更新饼图数据 - 使用新的数据结构
    alarmTypes.value[0].value = res.rectificationStatus.rectified // 已整改
    alarmTypes.value[1].value = res.rectificationStatus.inProgress // 整改中
    alarmTypes.value[2].value = res.rectificationStatus.overdue // 逾期未整改
    updateChart()
  })
}

// 移除 getInspectionStatistics 的调用
// getInspectionStatistics().then((res) => {
//   inspectionDetail.value = res
// })

const getLineData = () => {
  getMonthlyAddList({
    yyyy: new Date().getFullYear()
  }).then((res) => {
    console.log('dangerDetail', res)
    // 整改隐患数
    rectificationRates.value = res?.map((i) => i.totalNewRectHazards)
    // 新增隐患数
    newHiddenDangers.value = res?.map((i) => i.totalNewHazards)
    updateLineChart()
  })
}

onMounted(() => {
  // 在 DOM 挂载后初始化 Echarts 实例
  if (alarmChartContainer.value) {
    nextTick(() => {
      alarmChart.value = echarts.init(alarmChartContainer.value)
      alarmChart.value.setOption(chartOption)
    })
  }
  if (lineContainer.value) {
    nextTick(() => {
      lineChart.value = echarts.init(lineContainer.value)
      lineChart.value.setOption(lineChartOption)
    })
  }
  getData()
  getLineData()
  // fetchZeroDeclarationCount()
})

onBeforeUnmount(() => {
  // 在组件销毁前销毁图表实例，防止内存泄漏
  if (alarmChart.value) {
    alarmChart.value.dispose()
  }
  if (lineChart.value) {
    lineChart.value.dispose()
  }
})
</script>

<style scoped lang="scss">
.stats-section {
  width: 460px;
  background: linear-gradient(90deg, rgba(65, 106, 146, 0) 0%, #0c2249 97%);
  border-radius: 4px;
  pointer-events: fill;
  padding: 45px 20px 10px 20px;
  position: relative;

  .stats-section-title {
    position: absolute;
    left: 0;
    top: 0;
  }

  .warehouse-overview-section {
    .hidden-danger {
      position: relative;

      .img1 {
        width: 250px;
      }
      .img2 {
        width: 166px;
      }
      .card-left {
        position: absolute;
        top: 10px;
        left: 80px;
      }
      .card-right {
        position: absolute;
        top: 10px;
        right: 55px;
      }
      .text-card {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: baseline;
        // height: 40px;

        .title {
          font-family: 'Source Han Sans';
          font-size: 16px;
          font-weight: bold;
          line-height: normal;
          letter-spacing: 0;
          color: #dce9ff;
          text-align: center;
        }

        .num {
          font-family: YouSheBiaoTiHei;
          font-size: 24px;
          font-weight: bold;
          line-height: normal;
          letter-spacing: 0em;
          color: #ebfeff;
        }
      }
    }

    .select-card {
      display: flex;
      position: relative;
      cursor: pointer;
      .card-left,
      .card-right {
        width: 210px;
        height: 46.8px;
        opacity: 1;
        /* 自动布局 */
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 9.6px 0px 1.2px 0px;
        flex-grow: 1;
        color: #ffffff;
        border-bottom: 1px solid #474f59;
        .active-show {
          width: 210px;
          height: 2.4px;
          position: absolute;
          bottom: -1px;
          display: none;
          background: linear-gradient(
              270deg,
              rgba(101, 174, 235, 0) 0%,
              #65aeeb 24%,
              #9dd3ff 46%,
              rgba(101, 174, 235, 0.8142) 70%,
              rgba(101, 174, 235, 0) 100%
            ),
            #474f59;
        }
      }
      .active {
        background: linear-gradient(180deg, rgba(36, 84, 125, 0) 47%, rgba(36, 84, 125, 0.62) 100%);
        .active-show {
          display: block;
        }
      }
    }

    .company-detail {
      display: flex;
      margin-top: 2px;
      gap: 12px;

      .company-detail-card {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        flex-grow: 1;
        align-self: stretch;

        .card-icon {
          width: 73px;
          height: 85px;
          opacity: 1;
        }

        .card-title {
          font-family: 'Source Han Sans';
          font-size: 14px;
          font-weight: normal;
          line-height: normal;
          letter-spacing: 0;

          /* 文字 */
          color: rgb(216 233 240 / 75%);
          text-align: center;
          font-variation-settings: 'opsz' auto;
          font-feature-settings: 'kern' on;
        }

        .card-content {
          font-family: 'Source Han Sans';
          font-size: 22px;
          font-weight: bold;
          line-height: normal;
          letter-spacing: 0;

          /* text-1 */
          color: #e7f0ff;
          text-align: center;
          font-variation-settings: 'opsz' auto;
          font-feature-settings: 'kern' on;
        }
      }
    }

    .sec-title {
      margin-top: 12px;
      margin-bottom: 12px;
    }

    .alarm-distribution {
      display: flex;
      align-items: flex-start;

      .alarm-chart-container {
        width: 160px;
        height: 130px;
      }
      .alarm-type-list {
        display: flex;
        height: 130px;
        width: 260px;
        flex-direction: column;
        justify-content: center;
        padding: 0px 20px;
        gap: 12px;

        .alarm-legend-item {
          display: flex;
          align-items: center;
          color: rgba(255, 255, 255, 0.8);
          white-space: nowrap;
          justify-content: space-between;
          background: rgba(33, 45, 66, 0.7);
          padding: 2px 8px;
          width: 100%;

          .title {
            border-radius: 4px;
            opacity: 1;
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 10px;
            .legend-color-block {
              display: inline-block;
              width: 5px;
              height: 5px;
              margin-right: 4px;
              border-radius: 50%;
            }

            .legend-text {
              font-size: 16px;
              color: #aec8e1;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }
          .num {
            color: #fff;
            font-size: 20px;
            font-weight: bold;
            font-family: YouSheBiaoTiHei;
          }
        }
      }
    }

    .echarts-line {
      display: flex;
      .line-container {
        height: 100px;
        width: 100%;
      }
    }
  }

  .company-info {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 6px 20px;
    margin-top: 10px;
    border-radius: 4px;
    gap: 12px;
    background: rgba(31, 82, 182, 0.3);
    box-sizing: border-box;
    border: 1px solid rgba(42, 97, 228, 0.66);

    .title-div {
      /* 自动布局 */
      display: flex;
      width: 220px;
      height: 23px;
      padding: 0;
      opacity: 1;
      flex-direction: row;
      align-items: center;
      gap: 16px;
      flex-grow: 1;

      .icon {
        width: 20px;
      }

      .title {
        font-family: 'Source Han Sans';
        font-size: 16px;
        font-weight: normal;
        line-height: normal;
        letter-spacing: 0;
        color: rgb(216 233 240 / 96%);
        text-align: center;
        font-variation-settings: 'opsz' auto;
        font-feature-settings: 'kern' on;
      }
    }

    .number-div {
      .num {
        display: inline-block;
        margin-right: 5px;
        font-family: 'Source Han Sans';
        font-size: 22px;
        font-weight: 700;
        color: #e7f0ff;
      }

      .unit {
        display: inline-block;
        font-family: 'Source Han Sans';
        font-size: 14px;
        font-weight: 700;
        color: #9bb9ff;
        font-variation-settings: 'opsz' auto;
      }
    }
  }
}
</style> 