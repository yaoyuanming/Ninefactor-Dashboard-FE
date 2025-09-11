<template>
  <div class="stats-section">
    <Title class="stats-section-title" title="企业风险巡查情况" :tabs="[]" />
    <div class="warehouse-overview-section">
      <!-- 报警类型分布（图表和列表） -->
      <div class="alarm-distribution">
        <div ref="chartContainer" class="chart-container"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import Title from './Title.vue'
import * as echarts from 'echarts'
import type { EChartsType } from 'echarts'
import { getDangerStatisticsDayList } from '@/api/screen'
import dayjs from 'dayjs';

const chartContainer = ref<HTMLElement | null>(null)
const chart = ref<EChartsType | null>(null)
const chartData = ref({
  x: [],
  y: []
})

const initPersonnelChart = () => {
  if (chartContainer.value) {
    const chartOption = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        show: false,
      },
      grid: {
        left: '32px', // 调整左侧边距为 Y 轴标签留白
        right: '32px',
        bottom: '20px',
        top: '20px'
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: chartData.value.x,
        axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.5)' } },
        axisLabel: { color: 'rgba(255, 255, 255, 0.7)' }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: true,
          lineStyle: { color: 'rgba(255, 255, 255, 0.5)' }
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.7)',
          formatter: '{value}'
        },
        splitLine: {
          show: true,
          lineStyle: { type: 'dashed', color: 'rgba(255, 255, 255, 0.2)' }
        },
        min: 0,
        splitNumber: 5
      },
      series: [
        {
          name: '风险巡查到位率(%)',
          type: 'line',
          data: chartData.value.y,
          itemStyle: { color: '#4285F4' },
          lineStyle: { width: 2 },
          symbol: 'circle',
          symbolSize: 6,
          smooth: true
        }
      ]
    }
    chart.value = echarts.init(chartContainer.value)
    nextTick(() => {
      if (chart.value) {
        chart.value.setOption(chartOption, true)
        chart.value.resize({
          animation: { duration: 0 }
        })
      }
    })
  }
}

const getData = () => {
  const utcDate = dayjs().format('YYYY-MM-DD');
  getDangerStatisticsDayList({
    endDate: utcDate
  }).then((res) => {
    const x: any = []
    const y: any = []
    res?.forEach((element, index) => {
      if (index < 30) {
        const yNumber = Number(element.inspectionRate)
        x.push(dayjs(element.statTime).format('YYYY-MM-DD'))
        y.push(isNaN(yNumber) ? 0 : (yNumber).toFixed(2))
      }
    })

    chartData.value = {
      x,
      y
    }
    if (chart.value) {
      chart.value.setOption({
        xAxis: {
          data: chartData.value.x
        },
        series: [
          {
            name: '风险巡查到位率(%)',
            data: chartData.value.y
          }
        ]
      })
    }
  })
}

onMounted(() => {
  initPersonnelChart()
  getData()
})

onBeforeUnmount(() => {
  // 在组件销毁前销毁图表实例，防止内存泄漏
  if (chart.value) {
    chart.value.dispose()
  }
})
</script>

<style scoped lang="scss">
.stats-section {
  width: 460px;
  margin-top: 12px;
  padding: 35px 20px 20px 20px;
  background: linear-gradient(90deg, rgba(65, 106, 146, 0) 0%, #0C2249 97%);
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
    .chart-container {
      flex-grow: 1;
      height: 140px;
    }
  }
}
</style>
