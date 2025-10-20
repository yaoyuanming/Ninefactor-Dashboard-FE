<template>
  <div class="stats-section alarm-stats-section">
    <Title
      title="报警统计"
      :src="TitleImage"
      :tabs="[]"
      @img-click="handelImageClick"
    />
    <div class="overview-section">
      <div class="stat-item">
        <SecTitle title="消警数" />
        <div class="num">{{ statisticsData?.resolvedNum || 0 }}</div>
      </div>
      <div class="stat-item progress-item">
        <div class="label">消警率</div>
        <a-progress
          class="progress-bar"
          :percent="calculateClearanceRate"
          :show-text="false"
          :status="calculateClearanceRate === 100 ? 'success' : undefined"
        />
        <div class="percent-text">{{ calculateClearanceRate }}%</div>
      </div>
    </div>
    <!-- 报警类型分布（图表和列表） -->
    <div class="alarm-distribution">
      <!-- 图表容器 -->
      <div ref="alarmChartContainer" class="alarm-chart-container"></div>
      <div class="alarm-type-list">
        <!-- 循环显示报警类型 -->
        <div
          v-for="(item, index) in statisticsData.alarmEvents"
          :key="item.alarmType"
          class="alarm-legend-item"
        >
          <div class="title">
            <span
              class="legend-color-block"
              :style="{
                backgroundColor:
                  alarmTypes[index].itemStyle.color?.colorStops?.[0]?.color,
              }"
            ></span>
            <!-- 显示报警类型名称，为空时显示默认文本 -->
            <span class="legend-text">{{
              item.alarmTypeName || '未知类型'
            }}</span>
          </div>
          <div class="num">{{ item.num || 0 }}</div>
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
    computed,
  } from 'vue';
  import * as echarts from 'echarts';
  import type { EChartsType } from 'echarts';
  import { getAlarmStatistics } from '@/api/compmonitoring';
  import TitleImage from '@/assets/screen/jump.png';
  import Title from '../components/Title.vue';
  import SecTitle from '../components/SecTitle.vue';
  import AlarmBg from '../../../../assets/screen/imgs/alarm-bg.png';
  import Drop from '../../../../assets/screen/imgs/drop.png';
  // 图表容器和实例
  const alarmChartContainer = ref<HTMLElement | null>(null);
  const alarmChart = ref<EChartsType | null>(null);

  const emits = defineEmits(['handelClick']);

  // 报警类型颜色配置
  const alarmTypes = ref([
    {
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 1,
          y2: 0,
          colorStops: [
            { offset: 0, color: '#4285F4' },
            { offset: 1, color: 'rgba(66, 133, 244, 0.1)' },
          ],
        },
      },
    },
    {
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 1,
          y2: 0,
          colorStops: [
            { offset: 0, color: '#34A853' },
            { offset: 1, color: 'rgba(52, 168, 83, 0.1)' },
          ],
        },
      },
    },
    {
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 1,
          y2: 0,
          colorStops: [
            { offset: 1, color: '#FBBC05' },
            { offset: 0, color: 'rgba(251, 188, 5, 0.1)' },
          ],
        },
      },
    },
    {
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 1,
          y2: 0,
          colorStops: [
            { offset: 1, color: '#EA4335' },
            { offset: 0, color: 'rgba(234, 67, 53, 0.1)' },
          ],
        },
      },
    },
    {
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 1,
          y2: 0,
          colorStops: [
            { offset: 1, color: '#F09300' },
            { offset: 0, color: 'rgba(240, 147, 0, 0.1)' },
          ],
        },
      },
    },
    {
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 1,
          y2: 0,
          colorStops: [
            { offset: 0, color: '#E91E63' },
            { offset: 1, color: 'rgba(233, 30, 99, 0.1)' },
          ],
        },
      },
    },
    {
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 1,
          y2: 0,
          colorStops: [
            { offset: 0, color: '#9C27B0' },
            { offset: 1, color: 'rgba(156, 39, 176, 0.1)' },
          ],
        },
      },
    },
    {
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 1,
          y2: 0,
          colorStops: [
            { offset: 0, color: '#00BCD4' },
            { offset: 1, color: 'rgba(0, 188, 212, 0.1)' },
          ],
        },
      },
    },
  ]);

  // 接口数据类型定义
  interface AlarmEventVo {
    alarmType: string;
    alarmTypeName: string; // 确保类型定义正确
    num: number;
  }
  interface StatisticsData {
    alarmNum?: number;
    unresolvedNum?: number;
    resolvedNum?: number;
    dateType?: string;
    alarmEvents?: AlarmEventVo[];
  }
  const statisticsData = ref<StatisticsData>({});

  // 计算消警率
  const calculateClearanceRate = computed(() => {
    const total = statisticsData.value?.alarmNum || 0;
    const resolved = statisticsData.value?.resolvedNum || 0;
    return total === 0 ? 0 : Math.round((resolved / total) * 100);
  });

  // 头部点击
  function handelImageClick() {
    emits('handelClick', { tabsIndex: 2 });
  }

  // 图表配置
  const getChartOption = computed(() => {
    const chartData = (statisticsData.value?.alarmEvents || []).map(
      (item, index) => ({
        name: item.alarmTypeName || '未知类型', // 图表中也做容错
        value: item.num || 0,
        itemStyle: alarmTypes.value[index]?.itemStyle || {},
      })
    );

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}次',
      },
      graphic: {
        type: 'group',
        left: 'center',
        top: 'center',
        children: [
          {
            type: 'image',
            style: { image: AlarmBg, width: 200, height: 200 },
            left: 'center',
            top: 'center',
          },
          {
            type: 'image',
            style: { image: Drop, width: 115, height: 115 },
            left: 'center',
            top: 'center',
          },
          {
            type: 'text',
            style: {
              text: `${statisticsData.value?.alarmNum || 0}`,
              fontSize: 24,
              fill: '#fff',
              fontWeight: 'bold',
            },
            left: 'center',
            top: '-20',
          },
          {
            type: 'text',
            style: { text: '报警数', fontSize: 14, fill: '#C1C9D8' },
            left: 'center',
            top: '10',
          },
        ],
      },
      series: [
        {
          name: '报警类型',
          type: 'pie',
          radius: ['80%', '90%'],
          itemStyle: { borderRadius: '50%' },
          padAngle: 5,
          data: chartData,
        },
      ],
    };
  });

  // 更新图表
  const updateChart = () => {
    nextTick(() => {
      if (alarmChart.value) {
        alarmChart.value.setOption(getChartOption.value);
      }
    });
  };

  // 监听数据变化更新图表
  watch(
    statisticsData,
    () => {
      updateChart();
    },
    { deep: true }
  );

  // 获取报警统计数据
  const getStatisticsData = async () => {
    try {
      const res = await getAlarmStatistics();
      statisticsData.value = res.data;
    } catch (error) {
      // 获取报警统计接口异常
    }
  };

  // 组件挂载
  onMounted(() => {
    nextTick(async () => {
      await getStatisticsData();
      // 数据加载后初始化图表
      if (alarmChartContainer.value) {
        alarmChart.value = echarts.init(alarmChartContainer.value, '', {
          width: 170,
          height: 170,
        });
        alarmChart.value.setOption(getChartOption.value);
      }
    });
  });

  // 组件卸载
  onBeforeUnmount(() => {
    if (alarmChart.value) {
      alarmChart.value.dispose();
    }
  });
</script>

<style scoped>
  /* 新增无数据样式 */
  .no-data {
    width: 100%;
    padding: 20px 0;
    color: rgb(216 233 240 / 75%);
    text-align: center;
  }
</style>

<style scoped lang="less">
  .stats-section {
    // background-color: #040e21;
    // background: linear-gradient(90deg, rgba(65, 106, 146, 0) 0%, #0c2249 97%);
    background: linear-gradient(90deg, rgb(65 106 146 / 69%) 0%, #0c2249 97%);
    border-radius: 4px;
    pointer-events: all;

    .overview-section {
      display: flex;
      gap: 12px;
      margin: 10px 0;
      padding: 0 20px;

      .stat-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
        background: rgb(7 27 55 / 30%);
        border-radius: 4px;
        opacity: 1;

        // 覆盖 SecTitle 的 margin-top，确保水平对齐
        :deep(.sec-title) {
          margin-top: 0;
        }

        &:first-child {
          flex: 0 0 auto;
          min-width: 120px;
        }

        &.progress-item {
          flex: 1;
          gap: 12px;
        }

        .label {
          flex-shrink: 0;
          color: #e7f0ff;
          font-weight: bold;
          font-size: 16px;
          font-family: AlibabaPuHuiTi, 'PingFang SC', sans-serif;
          white-space: nowrap;
        }

        .progress-bar {
          flex: 1;
          min-width: 100px;
        }

        .percent-text {
          flex-shrink: 0;
          min-width: 45px;
          font-weight: 600;
          font-size: 16px;
          font-family: 'PingFang SC';
          white-space: nowrap;
          text-align: right;
          background: linear-gradient(
            180deg,
            #fff 37%,
            #94fbff 69%,
            #c2ddff 94%
          );
          background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          font-variation-settings: 'opsz' auto;
        }

        .num {
          margin-left: auto;
          padding-left: 12px;
          font-weight: 600;
          font-size: 20px;
          font-family: 'PingFang SC';
          line-height: normal;
          letter-spacing: 0;
          background: linear-gradient(
            180deg,
            #fff 37%,
            #94fbff 69%,
            #c2ddff 94%
          );
          background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          font-variation-settings: 'opsz' auto;
        }
      }
    }

    .alarm-distribution {
      display: flex;
      justify-content: space-around;
      padding: 12px 20px 12px 0;

      .alarm-chart-container {
        width: 170px;
        height: 170px;
        background: radial-gradient(
          88% 88% at 50% 100%,
          rgb(0 0 0 / 0%) 2%,
          rgb(22 22 26 / 42%) 100%
        );
        border-radius: 50%;
      }

      .alarm-type-list {
        display: flex;
        flex-direction: column;
        gap: 2px;
        justify-content: center;
        width: 170px;
        height: 170px;

        .alarm-legend-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: rgb(255 255 255 / 80%);
          font-size: 10px;
          white-space: nowrap;

          .title {
            display: flex;
            flex-direction: row;
            gap: 10px;
            align-items: center;
            padding: 3px 8px;
            background: linear-gradient(
              90deg,
              #283b54 0%,
              rgb(40 59 84 / 0%) 100%
            );
            border-radius: 4px;
            opacity: 1;

            .legend-color-block {
              display: inline-block;
              width: 5px;
              height: 5px;
              margin-right: 4px;
              border-radius: 50%;
            }

            .legend-text {
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }
        }
      }
    }
  }
</style>
