<template>
  <div class="stats-section">
    <Title class="stats-section-title" title="企业统计概况" :tabs="[]" />
    <div class="warehouse-overview-section">
      <div class="company-info">
        <div class="title-div">
          <img class="icon" src="@/assets/imgs/screen/company.png" />
          <div class="title">企业总数</div>
        </div>
        <div class="number-div">
          <div class="num">{{ props.companyData?.totalCount }}</div>
          <div class="unit">家</div>
        </div>
      </div>
      <div class="company-detail">
        <div class="company-detail-card">
          <img class="card-icon" src="@/assets/imgs/screen/base1.png" />
          <div>
            <div class="card-title">有限空间</div>
            <div class="card-content">{{ props.companyData?.limitedSpaceTaskCount || 0 }}</div>
          </div>
        </div>
        <div class="company-detail-card">
          <img class="card-icon" src="@/assets/imgs/screen/base2.png" />
          <div>
            <div class="card-title">涉爆粉尘</div>
            <div class="card-content">{{ props.companyData?.metalDustCount || 0 }}</div>
          </div>
        </div>
        <div class="company-detail-card">
          <img class="card-icon" src="@/assets/imgs/screen/base3.png" />
          <div>
            <div class="card-title">涉氨制冷</div>
            <div class="card-content">{{ props.companyData?.ammoniaCount || 0 }}</div>
          </div>
        </div>
      </div>
      <SecTitle class="sec-title" title="企业规模分布统计" :tabs="[]" />
      <!-- 报警类型分布（图表和列表） -->
      <div class="alarm-distribution">
        <!-- 图表容器 -->
        <div ref="alarmChartContainer" class="alarm-chart-container"></div>
        <!-- 报警类型列表 -->
        <div class="alarm-type-list">
          <div v-for="item in alarmTypes" :key="item.name" @click="emit('clickAction', getProcessedName(item.name))" class="alarm-legend-item">
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
      <SecTitle class="sec-title2" title="企业填报情况统计" :tabs="[]" />
      <div class="content-div">
        <div class="content-card">
          <div class="card-left">
            <img class="icon" src="@/assets/imgs/screen/edit-text.png" />
          </div>
          <div class="card-right">
            <div class="num">{{ props.companyData?.reportedCount || '-' }}</div>
            <div class="title">已填报企业</div>
            <img class="jiantou" src="@/assets/imgs/screen/jiantou1.png" />
          </div>
        </div>
        <div class="content-card2">
          <div class="card-left">
            <img class="icon" src="@/assets/imgs/screen/no-text.png" />
          </div>
          <div class="card-right">
            <div class="num">{{ props.companyData?.notReportedCount || '0' }}</div>
            <div class="title">未填报企业</div>
            <img class="jiantou" src="@/assets/imgs/screen/jiantou2.png" />
          </div>
        </div>
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
import CenterImg1 from '../../assets/imgs/screen/center-img1.png' // Vite会处理图片导入

// 定义 props
const props = defineProps<{
  companyData: any
}>()

const alarmChartContainer = ref<HTMLElement | null>(null)
const emit = defineEmits(['clickAction'])
let alarmChart = ref<EChartsType | null>(null)

const alarmTypes = ref([
  { value: 0, name: '规上企业', itemStyle: { color: '#3BACEA' } },
  { value: 0, name: '中等企业', itemStyle: { color: '#A4E76C' } },
  { value: 0, name: '小微企业', itemStyle: { color: '#68BBC4' } }
])

// 监听数据变化
watch(() => props.companyData?.enterpriseScaleStatistics, (newData) => {
  if (newData && newData.length > 0) {
    updateChartData()
  }
}, { deep: true })

const updateChartData = () => {
  const scaleStats = props.companyData?.enterpriseScaleStatistics
  if (scaleStats && scaleStats.length > 0) {
    alarmTypes.value[0].value = scaleStats[2]?.count || 0
    alarmTypes.value[1].value = scaleStats[1]?.count || 0
    alarmTypes.value[2].value = scaleStats[0]?.count || 0
    
    if (alarmChart.value) {
      alarmChart.value.setOption({
        series: [
          {
            name: '企业规模',
            data: alarmTypes.value
          }
        ]
      })
    }
  }
}

const chartOption = {
  tooltip: {
    trigger: 'item',
    position: 'right'
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
          image: CenterImg1, // 图片路径
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
      name: '企业规模',
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

// 处理企业规模名称，去掉"企业"后缀
const getProcessedName = (name: string) => {
  if (name.includes('企业')) {
    return name.replace('企业', '')
  }
  return name
}

onMounted(() => {
  // 在 DOM 挂载后初始化 Echarts 实例
  if (alarmChartContainer.value) {
    nextTick(() => {
      alarmChart.value = echarts.init(alarmChartContainer.value)
      // 设置图表选项
      alarmChart.value.setOption(chartOption)
      // 监听窗口 resize 事件，使图表自适应
    })
  }
})

onBeforeUnmount(() => {
  // 在组件销毁前销毁图表实例，防止内存泄漏
  if (alarmChart.value) {
    alarmChart.value.dispose()
  }
})
</script>

<style scoped lang="scss">
.stats-section {
  width: 460px;
  padding: 45px 20px 20px 20px;
  background: linear-gradient(90deg, #0c2249 0%, rgba(65, 106, 146, 0) 97%);
  border-radius: 4px;
  pointer-events: fill;
  position: relative;

  .stats-section-title {
    position: absolute;
    left: 0;
    top: 0;
  }

  .sec-title {
    margin-top: 12px;
    margin-bottom: 5px;
  }
  .sec-title2 {
    margin-top: 5px;
    margin-bottom: 5px;
  }

  .warehouse-overview-section {
    .company-detail {
      display: flex;
      margin-top: 12px;
      gap: 12px;

      .company-detail-card {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 27px 0;
        gap: 20px;
        flex-grow: 1;
        align-self: stretch;
        background: linear-gradient(180deg, rgba(14, 26, 47, 0.83) 0%, rgba(25, 39, 62, 0.41) 99%);

        .card-icon {
          width: 33px;
          height: 33px;
          border-radius: 3.36px;
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

    .alarm-distribution {
      display: flex;
      align-items: flex-start;

      .alarm-chart-container {
        width: 160px;
        height: 160px;
      }
      .alarm-type-list {
        display: flex;
        width: 260px;
        height: 160px;
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
          cursor: pointer;

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

    .content-div {
      display: flex;
      gap: 8px;

      .content-card {
        display: flex;
        background: rgba(21, 35, 59, 0.45);
        box-sizing: border-box;
        border-width: 0px 0px 0.9px 0px;
        border-style: solid;
        border-image: linear-gradient(270deg, #4fa6e2 0%, rgba(77, 178, 249, 0) 97%) 0 0 0.9 0;
        box-sizing: border-box;
        flex-grow: 1;
        align-self: stretch;
        padding: 15px 10px 10px;
        position: relative;

        .card-left {
          .icon {
            width: 40px;
            height: 40px;
          }
        }

        .card-right {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: baseline;
          padding-left: 15px;
          height: 40px;

          .title {
            font-family: 'Source Han Sans';
            font-size: 14px;
            font-weight: normal;
            line-height: normal;
            letter-spacing: 0;

            /* 文字 */
            color: #a0bad3;
            text-align: center;
          }

          .num {
            font-family: 'Source Han Sans';
            font-size: 16px;
            font-weight: bold;
            line-height: normal;
            letter-spacing: 0;
            color: #fff;
            text-align: center;
          }

          .jiantou {
            width: 39px;
            height: 56px;
            position: absolute;
            right: 16px;
            top: 0px;
          }
        }
      }
      .content-card2 {
        display: flex;
        background: rgba(21, 35, 59, 0.45);
        box-sizing: border-box;
        border-width: 0px 0px 0.9px 0px;
        border-style: solid;
        border-image: linear-gradient(270deg, #9edf6a 0%, rgba(156, 219, 105, 0) 96%) 0 0 0.9 0;
        box-sizing: border-box;
        flex-grow: 1;
        align-self: stretch;
        padding: 15px 10px 10px;
        position: relative;

        .card-left {
          .icon {
            width: 40px;
            height: 40px;
          }
        }

        .card-right {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: baseline;
          padding-left: 15px;
          height: 40px;

          .title {
            font-family: 'Source Han Sans';
            font-size: 14px;
            font-weight: normal;
            line-height: normal;
            letter-spacing: 0;

            /* 文字 */
            color: #a4d3a0;
            text-align: center;
          }

          .num {
            font-family: 'Source Han Sans';
            font-size: 16px;
            font-weight: bold;
            line-height: normal;
            letter-spacing: 0;
            color: #ecffe7;
            text-align: center;
          }

          .jiantou {
            width: 39px;
            height: 56px;
            position: absolute;
            right: 16px;
            top: 0px;
          }
        }
      }
    }
  }
}
</style> 