<template>
  <div class="stats-section alarm-stats-section">
    <Title
      title="仓库概况"
      :src="TitleImage"
      :tabs="[]"
      @img-click="handleWarehouseClick"
    />
    <div class="tabbar-flex" style="padding: 12px 24px; text-align: center">
      <div class="tabbar">
        <div
          v-for="items in WarehouseItems"
          :key="items.id"
          class="items"
          :style="ItemsStyle(items.id, 'dataType')"
          @click="handleTabClick('dataType', items.id)"
          >{{ items.label }}</div
        >
      </div>
      <div class="tabbar">
        <div
          v-for="items in ConfigItems"
          :key="items.id"
          class="items"
          :style="ItemsStyle(items.id, 'dimension')"
          @click="handleTabClick('dimension', items.id)"
          >{{ items.label }}</div
        >
      </div>
    </div>

    <div class="charts-compons">
      <!-- 环形图容器 -->
      <div class="chart-container">
        <div ref="ringChart" class="ring-chart"></div>
        <!-- 中心部分 -->
        <div class="center-image">
          <img src="@/assets/screen/imgs/chatr-center.png" alt="中心图标" />
        </div>
      </div>
      <div class="flex-lines-views">
        <div
          v-for="(item, index) in currentData"
          :key="index"
          class="views-cop"
        >
          <div class="line" :style="{ background: item.color }"></div>
          <div class="title">{{ item.label }}</div>
          <div class="text">{{ item.count }}</div>
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
    computed,
  } from 'vue';
  // 引入 Echarts
  import * as echarts from 'echarts';
  import type { EChartsType } from 'echarts';
  import TitleImage from '@/assets/screen/lien.png';
  import { getObtainWarehouseInfor } from '@/api/compmonitoring';
  import { DrawerType } from '../DetailDrawer/types';
  import Title from '../components/Title.vue';

  // 图表实例
  const ringChart = ref<HTMLDivElement | null>(null);
  let chartInstance: EChartsType | null = null;

  // 仓库信息
  const warehouseData = ref<any>(null);

  // Tab切换
  const activeTabs = ref({
    dataType: 0,
    dimension: 0,
  });

  // 仓库tabbar
  const WarehouseItems = [
    { id: 0, label: '仓库' },
    { id: 1, label: '库房' },
  ];

  const ConfigItems = [
    { id: 0, label: '危险等级' },
    { id: 1, label: '核定药量' },
    { id: 2, label: '面积' },
  ];

  // 数据项配色方案
  const colorSchemes = [
    ['#FFA262', '#FF595E', '#A4E76C'], // 危险等级配色
    ['#36D399', '#FF9F1C', '#FF5630'], // 核定药量配色
    ['#6366F1', '#8B5CF6', '#EC4899'], // 面积配色
  ];

  // 计算属性：根据当前Tab获取对应数据
  const currentData = computed(() => {
    if (!warehouseData.value) return [];

    // 1. 确定是仓库还是库房数据
    const targetSummary =
      activeTabs.value.dataType === 0
        ? warehouseData.value.storeSummary
        : warehouseData.value.roomSummary;

    // 2. 确定是哪个维度的数据
    let targetData: Array<{ value: string; label: string; count: number }> = [];
    switch (activeTabs.value.dimension) {
      case 0:
        targetData = targetSummary?.riskLevel || [];
        break;
      case 1:
        targetData = targetSummary?.drugCapacity || [];
        break;
      case 2:
        targetData = targetSummary?.areaStandard || [];
        break;
      default:
        targetData = [];
        break;
    }

    // 3. 为数据项添加颜色
    return targetData.map((item, index) => ({
      ...item,
      color:
        colorSchemes[activeTabs.value.dimension][
          index % colorSchemes[activeTabs.value.dimension].length
        ],
    }));
  });

  // 更新环形图数据
  const updateRingChart = () => {
    if (!chartInstance || !currentData.value.length) return;

    // 转换数据格式为ECharts所需
    const chartData = currentData.value.map((item: any) => ({
      name: item.label,
      value: item.count,
      itemStyle: { color: item.color },
    }));

    chartInstance.setOption({
      series: [{ data: chartData }],
    });
  };

  // Tab样式处理
  function ItemsStyle(ids: number, type: 'dataType' | 'dimension') {
    if (ids === activeTabs.value[type]) {
      return {
        color: '#fff',
        background:
          'linear-gradient(180deg, rgba(45, 154, 255, 0) 5%, rgba(45, 139, 255, 0.51) 100%)',
        cursor: 'pointer',
      };
    }
    return {
      color: 'rgba(216, 233, 240, 0.75)',
      cursor: 'pointer',
    };
  }

  // Tab切换事件
  function handleTabClick(type: 'dataType' | 'dimension', id: number) {
    activeTabs.value[type] = id;
    updateRingChart(); // 切换后更新图表
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

    // 设置基础配置
    const baseOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}个',
      },
      series: [
        {
          type: 'pie',
          radius: ['70%', '85%'],
          center: ['50%', '50%'],
          startAngle: 90,
          clockWise: false,
          data: [],
          itemStyle: {
            borderWidth: 0,
          },
          label: {
            show: false,
          },
          labelLine: {
            show: false,
          },
          animationDuration: 1500,
          animationEasing: 'cubicOut',
        },
      ],
      graphic: {
        elements: [
          {
            type: 'circle',
            cx: '50%',
            cy: '50%',
            r: '88%',
            fill: 'none',
            stroke: 'rgba(255, 255, 255, 0.2)',
            lineWidth: 1,
            lineDash: [2, 2],
          },
        ],
      },
    };

    chartInstance.setOption(baseOption);

    // 响应窗口大小变化
    const handleResize = () => {
      chartInstance?.resize();
    };

    window.addEventListener('resize', handleResize);

    // 组件卸载时移除事件监听
    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize);
    });

    // 初始化数据
    updateRingChart();
  };

  const openDrawer = inject<any>('openDrawer');

  // 点击仓库概况
  const handleWarehouseClick = () => {
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

  // 获取仓库信息
  const getMontuInfo = async () => {
    try {
      const response = (await getObtainWarehouseInfor()) as any;
      if (response.success) {
        warehouseData.value = response.data;
      }
      // console.log('获取到的仓库数据：', warehouseData.value);
    } catch (error) {
      // console.error('获取仓库信息接口异常：', error);
    }
  };

  // 组件挂载后初始化图表
  onMounted(() => {
    nextTick(async () => {
      await getMontuInfo();
      initRingChart();
    });
  });

  // 监听数据变化，更新图表
  watch(currentData, () => {
    updateRingChart();
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
      font-size: 14px;
      line-height: 27px;
      background: rgb(8 23 44 / 48%);
      border-image: radial-gradient(
          50% 50% at 50% 0%,
          #829cb9 0%,
          rgb(127 154 183 / 0%) 100%
        )
        1;
      cursor: pointer;
    }
  }

  // 图表容器样式
  .chart-container {
    position: relative;
    width: 120px;
    height: 120px;
    margin: 20px 44px 14px 61px;
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
        display: flex;
        align-items: center;
        width: 204px;
        padding: 2.7px 6px;
        background: rgb(17 41 75 / 23%);

        .line {
          width: 5.5px;
          height: 5.5px;
          border-radius: 50%;
        }

        .title {
          flex: 1;
          margin-left: 7px;
          color: #aec8e1;
          font-size: 15px;
        }

        .text {
          font-size: 18px;
          background: linear-gradient(
            180deg,
            #fff 37%,
            #94fbff 69%,
            #c2ddff 94%
          );
          background-clip: text;
          -webkit-text-fill-color: transparent;
          text-fill-color: transparent;
        }
      }
    }
  }

  .center-image {
    position: absolute;
    top: 50%;
    left: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    background: rgb(0 0 0 / 30%);
    border-radius: 50%;
    transform: translate(-50%, -50%);

    img {
      width: 24px;
      height: 24px;
    }
  }
</style>
