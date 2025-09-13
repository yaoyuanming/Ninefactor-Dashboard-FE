<template>
  <div class="stats-section">
    <Title class="stats-section-title" title="风险分级管控情况" :tabs="[]" />
    <div class="warehouse-overview-section">
      <!-- 报警类型分布（图表和列表） -->
      <div class="alarm-distribution">
        <!-- 图表容器 -->
        <div ref="alarmChartContainer" class="alarm-chart-container"></div>
        <!-- 报警类型列表 -->
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import Title from './Title.vue'
import * as echarts from 'echarts'
import type { EChartsType } from 'echarts'
import CenterBg from '../../assets/imgs/screen/center-bg.png' // Vite会处理图片导入
import CenterImg2 from '../../assets/imgs/screen/center-img2.png' // Vite会处理图片导入
// import { getRiskStatistics } from '@/api/screen'

const alarmChartContainer = ref<HTMLElement | null>(null)
let alarmChart = ref<EChartsType | null>(null)
const alarmTypes = ref([
  { value: 0, name: '重大风险', itemStyle: { color: '#FF666A' } },
  { value: 0, name: '较大风险', itemStyle: { color: '#FF9526' } },
  { value: 0, name: '一般风险', itemStyle: { color: '#E5CA29' } },
  { value: 0, name: '低风险', itemStyle: { color: '#2E88F3' } }
])

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
          image: CenterImg2, // 图片路径
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
      name: '风险管控',
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

const getData = () => {
  getRiskStatistics().then((res) => {
    alarmTypes.value[0].value = res.highRiskCount
    alarmTypes.value[1].value = res.mediumHighRiskCount
    alarmTypes.value[2].value = res.mediumRiskCount
    alarmTypes.value[3].value = res.lowRiskCount
    if (alarmChart.value) {
      alarmChart.value.setOption({
        series: [
          {
            name: '风险管控',
            data: alarmTypes.value
          }
        ]
      })
    }
  })
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
  getData()
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
  margin-top: 12px;
  padding: 55px 20px 20px 20px;
  background: linear-gradient(90deg, #0C2249 0%, rgba(65, 106, 146, 0) 97%);
  border-radius: 4px;
  pointer-events: fill;
  position: relative;
  cursor: pointer;

  .stats-section-title {
    position: absolute;
    left: 0;
    top: 0;
  }
  .warehouse-overview-section {
    margin-top: 4px;
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
  }
}
</style> 