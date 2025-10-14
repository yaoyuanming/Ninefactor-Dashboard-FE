<template>
  <div class="stats-section alarm-stats-section">
    <Title title="仓库概况" :src="TitleImage" :tabs="[]" @imgClick="handleWarehouseClick" />
    <div class="tabbar-flex" style="padding: 12px 24px; text-align: center;">
      <div class="tabbar">
        <div class="items" :style="ItemsStyle(items.id)" v-for="items in WarehouseItems" :key="items.id">{{ items.label
          }}</div>
      </div>
      <div class="tabbar">
        <div class="items" :style="ItemsStyle(items.id)" v-for="items in ConfigItems" :key="items.id">{{ items.label }}
        </div>
      </div>
    </div>

    <div class="charts-compons">
      <!-- 环形图容器 -->
      <div class="chart-container">
        <div ref="ringChart" class="ring-chart"></div>
        <!-- 中心部分 -->
        <div class="center-image">
          <img src="@/assets/screen/imgs/chatr-center.png" alt="">
        </div>
      </div>
      <div class="flex-lines-views">
        <div class="views-cop" v-for="views in ViewsItems" :key="views.id">
          <div class="line" :style="{ background: views.background }"></div>
          <div class="title">{{ views.label }}</div>
          <div class="text">52</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  onMounted,
  onBeforeUnmount,
  nextTick,
  watch,
  inject,
} from 'vue';
// 引入 Echarts
import * as echarts from 'echarts';
import type { EChartsType } from 'echarts';
import { DrawerType } from '../DetailDrawer/types';
import Title from '../components/Title.vue';
import TitleImage from '@/assets/screen/lien.png';

// 图表实例
const ringChart = ref<HTMLDivElement | null>(null);
let chartInstance: EChartsType | null = null;

// 仓库tabbar
const WarehouseItems = [
  { id: 0, label: '仓库' },
  { id: 1, label: '库房' },
]

const ConfigItems = [
  { id: 0, label: '危险等级' },
  { id: 1, label: '核定药量' },
  { id: 2, label: '面积' },
]

const ViewsItems = [
  { id: 0, label: '1.1级仓库', background: '#FFA262' },
  { id: 1, label: '1.3级仓库', background: '#FF595E' },
  { id: 2, label: '无药仓库', background: '#A4E76C' },
]

const WarehouseIds = ref(0)

function ItemsStyle(ids: Number) {
  if (ids === WarehouseIds.value) {
    return {
      color: "#fff",
      background: "linear-gradient(180deg, rgba(45, 154, 255, 0) 5%, rgba(45, 139, 255, 0.51) 100%"
    }
  } else {
    return {
      color: "rgba(216, 233, 240, 0.75)"
    }
  }
}

// 初始化环形图
const initRingChart = () => {
  if (!ringChart.value) return;

  // 销毁已有实例
  if (chartInstance) {
    chartInstance.dispose();
  }

  // 创建新实例
  chartInstance = echarts.init(ringChart.value);

  // 图表配置
  const option = {
    tooltip: {
      show: false
    },
    series: [
      {
        type: 'pie',
        radius: ['70%', '85%'], // 控制环形的粗细
        center: ['50%', '50%'],
        startAngle: 90, // 从顶部开始
        clockWise: false, // 逆时针方向
        data: [
          { value: 30, itemStyle: { color: '#36D399' } }, // 绿色部分
          { value: 20, itemStyle: { color: '#FF9F1C' } }, // 橙色部分
          { value: 50, itemStyle: { color: '#FF5630' } }  // 红色部分
        ],
        itemStyle: {
          borderWidth: 0
        },
        // 隐藏标签和连接线
        label: {
          show: false
        },
        labelLine: {
          show: false
        },
        // 添加动画效果
        animationDuration: 1500,
        animationEasing: 'cubicOut'
      }
    ],
    // 添加外层虚线圆环
    graphic: {
      elements: [
        {
          type: 'circle',
          cx: '20%',
          cy: '20%',
          r: '50%', // 稍大于外环
          fill: 'none',
          stroke: 'rgba(255, 255, 255, 0.2)',
          lineWidth: 1,
          lineDash: [2, 2] // 虚线样式
        }
      ]
    }
  };

  // 设置配置项
  chartInstance.setOption(option);

  // 响应窗口大小变化
  const handleResize = () => {
    chartInstance?.resize();
  };

  window.addEventListener('resize', handleResize);

  // 组件卸载时移除事件监听
  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
  });
}

const openDrawer = inject<any>('openDrawer');

// 点击仓库概况
const handleWarehouseClick = () => {
  console.log('Left/L2组件：handleWarehouseClick被调用了');
  console.log('openDrawer是否存在：', !!openDrawer);
  openDrawer?.(DrawerType.WAREHOUSE, '仓库概况', {
    name: '1号危化品仓库',
    code: 'WH2025001',
    company: '福州市XXXXX公司',
    type: '危险品仓库',
    dangerLevel: '01-1.1级库房',
    capacity: '500吨',
    manager: '李四',
    phone: '13800138000',
    address: '福建省福州市仓山区金山大道XXX号仓储区A区',
    area: '1200㎡',
    startDate: '2019-03-15',
    safetyLevel: 'A级',
  });
};

// 组件挂载后初始化图表
onMounted(() => {
  nextTick(() => {
    initRingChart();
  });
});

// 组件卸载前销毁图表实例
onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});

// 监听窗口大小变化，重新调整图表尺寸
watch(
  () => window.innerWidth,
  () => {
    chartInstance?.resize();
  }
);

</script>

<style scoped lang="less">
.stats-section {
  background: linear-gradient(90deg, #0c2249 0%, rgb(65 106 146 / 69%) 97%);
  border-radius: 4px;
  pointer-events: all;
  padding-bottom: 20px;
}

.tabbar-flex {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tabbar {
  display: flex;
  align-items: center;

  .items {
    width: 70px;
    line-height: 27px;
    border-image: radial-gradient(50% 50% at 50% 0%, #829CB9 0%, rgba(127, 154, 183, 0) 100%) 1;
    background: rgba(8, 23, 44, 0.48);
    font-size: 14px;
    cursor: pointer;
  }
}

// 图表容器样式
.chart-container {
  position: relative;
  margin: 20px 44px 14px 61px;
  height: 120px;
  width: 120px;
}

.ring-chart {
  width: 120px;
  height: 120px;
}

.charts-compons {
  display: flex;
  align-items: center;

  .flex-lines-views {
    display: flex;
    flex-direction: column;
    gap: 7px;

    .views-cop {
      width: 204px;
      display: flex;
      align-items: center;
      padding: 2.7px 6px;
      background: rgba(17, 41, 75, 0.23);

      .line {
        width: 5.5px;
        height: 5.5px;
        border-radius: 50%;
      }

      .title {
        margin-left: 7px;
        font-size: 15px;
        color: #AEC8E1;
        flex: 1;

      }

      .text {
        background: linear-gradient(180deg, #FFFFFF 37%, #94FBFF 69%, #C2DDFF 94%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-fill-color: transparent;
        font-size: 18px;
      }
    }
  }
}

.center-image {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);

  img {
    width: 24px;
    height: 24px;
  }
}
</style>
