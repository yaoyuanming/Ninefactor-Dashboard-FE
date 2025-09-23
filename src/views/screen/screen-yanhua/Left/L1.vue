<template>
  <div class="stats-section alarm-stats-section">
    <Title
      title="报警统计"
      :src="TitleImage"
      :tabs="[]"
      @tabChange="
        (value) => {
          selectTab = value;
        }
      "
    />
    <div class="overview-section">
      <div :style="{ flexGrow: 100 }" class="stat-item">
        <div class="title">
          <img class="icon" src="@/assets/screen/imgs/second-title.png" />
          <div class="label">消警数</div>
        </div>
        <div class="num">{{ clearanceNum }}</div>
      </div>
      <div :style="{ flexGrow: 315 }" class="stat-item">
        <div class="rlabel">消警率</div>
        <a-progress class="rnum" :percent="clearanceRate" />
      </div>
    </div>
    <!-- 报警类型分布（图表和列表） -->
    <div class="alarm-distribution">
      <!-- 图表容器 -->
      <div ref="alarmChartContainer" class="alarm-chart-container"></div>
      <!-- 报警类型列表 -->
      <div class="alarm-type-list">
        <div
          v-for="item in alarmTypes"
          :key="item.name"
          class="alarm-legend-item"
        >
          <div class="title">
            <span
              class="legend-color-block"
              :style="{
                backgroundColor: item.itemStyle.color?.colorStops?.[0]?.color,
              }"
            ></span>
            <span class="legend-text">{{ item.name }}</span>
          </div>
          <div class="num">{{ item.value }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
  // 引入 Echarts
  import * as echarts from 'echarts';
  import type { EChartsType } from 'echarts';
  import Title from '../components/Title.vue';
  import AlarmBg from '../../../../assets/screen/imgs/alarm-bg.png';
  import Drop from '../../../../assets/screen/imgs/drop.png';

  // Echarts 容器的引用
  const alarmChartContainer = ref<HTMLElement | null>(null);

  // Echarts 实例的引用
  const alarmChart = ref<EChartsType | null>(null);

  // 报警类型数据 (响应式数组，用于图表和列表)
  // 使用静态模拟数据，避免外部依赖
  const alarmTypes = ref([
    {
      value: 0,
      handle: 0,
      untreated: 0,
      name: '超员作业',
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 1,
          y2: 0,
          colorStops: [
            { offset: 0, color: '#4285F4' }, // 起始颜色
            { offset: 1, color: 'rgba(66, 133, 244, 0.1)' }, // 拖尾渐变色
          ],
        },
      },
    },
    {
      value: 0,
      handle: 0,
      untreated: 0,
      name: '堵塞通道',
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
      value: 0,
      handle: 0,
      untreated: 0,
      name: '超高超量',
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
      value: 0,
      handle: 0,
      untreated: 0,
      name: '非法入侵',
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
      value: 0,
      handle: 0,
      untreated: 0,
      name: '摄像头遮挡偏移',
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
      value: 0,
      handle: 0,
      untreated: 0,
      name: '人员资质证书到期',
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
      value: 0,
      handle: 0,
      untreated: 0,
      name: '其他',
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
  ]);

  // 模拟总报警数和消警率
  const totalAlarms = ref(0);
  const clearanceRate = ref(1);
  const clearanceNum = ref(0);

  // 图表配置
  const chartOption = {
    tooltip: {
      trigger: 'item',
    },
    graphic: {
      type: 'group', // 使用组包裹多个元素
      left: 'center',
      top: 'center',
      children: [
        {
          type: 'image',
          style: {
            image: AlarmBg, // 图片路径
            width: 200,
            height: 200,
          },
          left: 'center',
          top: 'center',
        },
        {
          type: 'image',
          style: {
            image: Drop, // 图片路径
            width: 115,
            height: 115,
          },
          left: 'center',
          top: 'center',
        },
        {
          type: 'text',
          style: {
            text: totalAlarms.value, // 数值
            fontSize: 24,
            fill: '#fff',
            fontWeight: 'bold',
          },
          left: 'center',
          top: '-20',
        },
        {
          type: 'text',
          style: {
            text: '报警数', // 主标题
            fontSize: 14,
            fill: '#C1C9D8',
          },
          left: 'center',
          top: '10', // 垂直居中偏上
        },
      ],
    },
    series: [
      {
        name: '报警类型',
        type: 'pie',
        radius: ['80%', '90%'], // 饼图半径
        itemStyle: {
          borderRadius: '50%',
        },
        padAngle: 5,
        avoidLabelOverlap: false,
        label: {
          show: false, // 默认不显示标签
          position: 'outside',
          formatter: '{b}: {c} ({d}%)',
        },
        emphasis: {
          label: {
            show: false, // 悬停时不显示标签
            fontSize: '12',
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false, // 不显示标签引导线
        },
        data: alarmTypes.value,
      },
    ],
  };

  const selectTab = ref('daily');
  const statisticsData = ref({});

  watch(
    alarmTypes,
    () => {
      // eslint-disable-next-line no-use-before-define
      updateChart();
    },
    { deep: true }
  );

  // watch(
  //   selectTab,
  //   () => {
  //     alarmTypes.value = transformData(statisticsData.value);
  //   },
  //   { deep: true }
  // );

  const updateChart = () => {
    nextTick(() => {
      alarmChart.value?.setOption({
        graphic: {
          type: 'group', // 使用组包裹多个元素
          left: 'center',
          top: 'center',
          children: [
            {
              type: 'image',
              style: {
                image: AlarmBg, // 图片路径
                width: 200,
                height: 200,
              },
              left: 'center',
              top: 'center',
            },
            {
              type: 'image',
              style: {
                image: Drop, // 图片路径
                width: 115,
                height: 115,
              },
              left: 'center',
              top: 'center',
            },
            {
              type: 'text',
              style: {
                text: totalAlarms.value, // 数值
                fontSize: 24,
                fill: '#fff',
                fontWeight: 'bold',
              },
              left: 'center',
              top: '-20',
            },
            {
              type: 'text',
              style: {
                text: '报警数', // 主标题
                fontSize: 14,
                fill: '#C1C9D8',
              },
              left: 'center',
              top: '10', // 垂直居中偏上
            },
          ],
        },
        series: [
          {
            data: alarmTypes.value,
          },
        ],
      });
    });
  };

  const getStatisticsData = async () => {
    // const res = await getAlarmStatistics();
    // statisticsData.value = res;
    // alarmTypes.value = transformData(res);
  };

  // const transformData = (originalData) => {
  //   const cy = {
  //     value: 0,
  //     handle: 0,
  //     untreated: 0,
  //     name: '超员作业',
  //     itemStyle: { color: '#4285F4' },
  //   };
  //   const ds = {
  //     value: 0,
  //     handle: 0,
  //     untreated: 0,
  //     name: '堵塞通道',
  //     itemStyle: { color: '#34A853' },
  //   };
  //   const cg = {
  //     value: 0,
  //     handle: 0,
  //     untreated: 0,
  //     name: '超高超量',
  //     itemStyle: { color: '#FBBC05' },
  //   };
  //   const rq = {
  //     value: 0,
  //     handle: 0,
  //     untreated: 0,
  //     name: '非法入侵',
  //     itemStyle: { color: '#EA4335' },
  //   };
  //   const zd = {
  //     value: 0,
  //     handle: 0,
  //     untreated: 0,
  //     name: '摄像头遮挡偏移',
  //     itemStyle: { color: '#F09300' },
  //   };
  //   const dq = {
  //     value: 0,
  //     handle: 0,
  //     untreated: 0,
  //     name: '人员资质证书到期',
  //     itemStyle: { color: '#E91E63' },
  //   };
  //   const qt = {
  //     value: 0,
  //     handle: 0,
  //     untreated: 0,
  //     name: '其他',
  //     itemStyle: { color: '#9C27B0' },
  //   };
  //   let totalCount = 0;
  //   // 处理daily数据
  //   originalData?.[selectTab.value].forEach(
  //     (item: { type: string; handleType: string; count: number }) => {
  //       if (item?.type === '超员作业') {
  //         cy.value += item?.count;
  //         item.handleType === '未消警'
  //           ? (cy.untreated = item?.count)
  //           : (cy.handle = item?.count);
  //       } else if (item?.type === '堵塞通道') {
  //         ds.value += item?.count;
  //         item.handleType === '未消警'
  //           ? (ds.untreated = item?.count)
  //           : (ds.handle = item?.count);
  //       } else if (item?.type === '超高超量') {
  //         cg.value += item?.count;
  //         item.handleType === '未消警'
  //           ? (cg.untreated = item?.count)
  //           : (cg.handle = item?.count);
  //       } else if (item?.type === '非法入侵') {
  //         rq.value += item?.count;
  //         item.handleType === '未消警'
  //           ? (rq.untreated = item?.count)
  //           : (rq.handle = item?.count);
  //       } else if (item?.type === '摄像头遮挡偏移') {
  //         zd.value += item?.count;
  //         item.handleType === '未消警'
  //           ? (zd.untreated = item?.count)
  //           : (zd.handle = item?.count);
  //       } else if (item?.type === '人员资质证书到期') {
  //         dq.value += item?.count;
  //         item.handleType === '未消警'
  //           ? (dq.untreated = item?.count)
  //           : (dq.handle = item?.count);
  //       } else {
  //         qt.value += item?.count;
  //         item.handleType === '未消警'
  //           ? (qt.untreated = item?.count)
  //           : (qt.handle = item?.count);
  //       }
  //       totalCount += item?.count;
  //     }
  //   );
  //   nextTick(() => {
  //     totalAlarms.value = totalCount;
  //     let handleCount =
  //       cy.handle + ds.handle + cg.handle + rq.handle + zd.handle + dq.handle;
  //     clearanceNum.value = handleCount;
  //     if (totalCount === 0) {
  //       clearanceRate.value = 100;
  //     } else {
  //       clearanceRate.value = Number(
  //         ((handleCount / totalCount) * 100).toFixed(2)
  //       );
  //     }
  //   });

  //   // 构建结果
  //   return [cy, ds, cg, rq, zd, dq, qt];
  // };

  onMounted(() => {
    // 在 DOM 挂载后初始化 Echarts 实例

    nextTick(() => {
      if (alarmChartContainer.value) {
        alarmChart.value = echarts.init(alarmChartContainer.value, '', {
          width: 170,
          height: 170,
        });
        alarmChart.value.setOption(chartOption);
      }
    });
    getStatisticsData();
  });

  onBeforeUnmount(() => {
    // 在组件销毁前销毁图表实例，防止内存泄漏
    if (alarmChart.value) {
      alarmChart.value.dispose();
    }
  });
</script>

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
      height: 43px;
      margin: 10px 0;
      padding: 0 20px;

      .stat-item {
        display: flex;
        padding: 10px 8px;
        background: rgb(64 83 123 / 23%);
        border-radius: 4px;
        opacity: 1;

        .title {
          position: relative;
          flex-grow: 3;

          .icon {
            position: absolute;
            top: 2px;
            left: -4;
            width: 27px;
            height: 24px;
            opacity: 1;
          }

          .label {
            display: inline-block;
            padding-left: 30px;
            color: rgb(193 201 216 / 83%);
            font-weight: normal;
            font-size: 14px;
            font-family: 'PingFang SC';
            line-height: normal;
            letter-spacing: 0;
          }
        }

        .rlabel {
          display: inline-block;
          color: rgb(193 201 216 / 83%);
          font-weight: normal;
          font-size: 14px;
          font-family: 'PingFang SC';
          line-height: normal;
          letter-spacing: 0;
        }

        .rnum {
          width: calc(100% - 58px);
          padding-left: 12px;
        }

        .num {
          padding-right: 8px;
          color: #fff;
          font-weight: 600;
          font-size: 14px;
          font-family: 'PingFang SC';
          line-height: normal;
          letter-spacing: 0;
          text-align: right;
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
