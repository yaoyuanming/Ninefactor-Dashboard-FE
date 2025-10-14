<template>
  <div v-loading="loading" class="content-section">
    <div class="section-header">
      <h3 class="section-title">态势感知</h3>
      <div class="section-filters">
        <a-radio-group v-model="filterForm.type" type="button" size="small">
          <a-radio value="month">月份</a-radio>
          <a-radio value="year">年份</a-radio>
        </a-radio-group>
        <a-month-picker
          v-if="filterForm.type === 'month'"
          v-model="filterForm.date"
          style="width: 150px; margin-left: 12px"
        />
        <a-date-picker
          v-else
          v-model="filterForm.date"
          mode="year"
          format="YYYY"
          style="width: 150px; margin-left: 12px"
        />
        <a-button
          type="primary"
          size="small"
          style="margin-left: 12px"
          @click="handleSearch"
        >
          查询
        </a-button>
      </div>
    </div>

    <div class="ai-alert">
      <div class="ai-badge">AI</div>
      <div class="ai-content">
        当{{ filterForm.type === 'month' ? '月' : '年' }}新增报警事件{{
          numSummary.add || 0
        }}起(件),消警:{{ numSummary.clear || 0 }}件
        <br />
        根据近期{{
          filterForm.type === 'month' ? '月度' : '年度'
        }}报警数据显示，报警频次呈现周期性波动特征。建议重点关注报警高峰时段的应急响应能力，加强预警机制建设。
      </div>
    </div>

    <div class="charts-grid">
      <div class="chart-box">
        <div class="chart-title">报警数量趋势图</div>
        <div ref="trendChartRef" class="chart-content"></div>
      </div>
      <div class="chart-box">
        <div class="chart-title">报警事件趋势图</div>
        <div ref="eventChartRef" class="chart-content"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
  import * as echarts from 'echarts';
  import { Message } from '@arco-design/web-vue';
  import { getSituationAwareness } from '@/api/statistics';
  import type { SituationAwarenessParams } from '@/api/statistics';

  // 获取当前月份 (YYYY-MM 格式)
  const getCurrentMonth = () => {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${m}`;
  };

  // 获取当前年份
  const getCurrentYear = () => String(new Date().getFullYear());

  // 动态感知筛选表单
  const filterForm = reactive({
    type: 'month' as 'month' | 'year',
    date: getCurrentMonth(),
  });

  // 加载状态
  const loading = ref(false);

  // 数据汇总
  const numSummary = ref<{ add?: number; clear?: number }>({
    add: 0,
    clear: 0,
  });

  // 图表 DOM 引用
  const trendChartRef = ref<HTMLElement>();
  const eventChartRef = ref<HTMLElement>();

  // 图表实例
  let trendChartInstance: echarts.ECharts | null = null;
  let eventChartInstance: echarts.ECharts | null = null;

  // 监听类型切换，更新日期默认值
  watch(
    () => filterForm.type,
    (newType) => {
      filterForm.date =
        newType === 'month' ? getCurrentMonth() : getCurrentYear();
    }
  );

  // 处理窗口大小变化
  const handleResize = () => {
    trendChartInstance?.resize();
    eventChartInstance?.resize();
  };

  // 渲染报警数量趋势图（折线图）
  const renderTrendChart = (items: any[]) => {
    nextTick(() => {
      if (!trendChartRef.value) return;

      if (!trendChartInstance) {
        trendChartInstance = echarts.init(trendChartRef.value);
      }

      const xData = items.map((item: any) => String(item.dateNum));
      const addData = items.map((item: any) => Number(item.addAlarmCount) || 0);
      const clearData = items.map(
        (item: any) => Number(item.clearAlarmCount) || 0
      );

      trendChartInstance.setOption({
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: '#1796fa',
          textStyle: {
            color: '#fff',
          },
        },
        legend: {
          data: ['新增报警数', '消除报警数'],
          textStyle: {
            color: 'rgba(255, 255, 255, 0.85)',
          },
          top: 10,
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '15%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: xData,
          name: filterForm.type === 'month' ? '日' : '月',
          nameTextStyle: {
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: 12,
          },
          nameGap: 5,
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.2)',
            },
          },
          axisLabel: {
            color: 'rgba(255, 255, 255, 0.7)',
          },
        },
        yAxis: {
          type: 'value',
          name: '次',
          nameTextStyle: {
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: 12,
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.2)',
            },
          },
          axisLabel: {
            color: 'rgba(255, 255, 255, 0.7)',
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
          },
        },
        series: [
          {
            name: '新增报警数',
            type: 'line',
            data: addData,
            smooth: true,
            itemStyle: {
              color: '#ff4757',
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(255, 71, 87, 0.3)' },
                  { offset: 1, color: 'rgba(255, 71, 87, 0.05)' },
                ],
              },
            },
          },
          {
            name: '消除报警数',
            type: 'line',
            data: clearData,
            smooth: true,
            itemStyle: {
              color: '#2ed573',
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(46, 213, 115, 0.3)' },
                  { offset: 1, color: 'rgba(46, 213, 115, 0.05)' },
                ],
              },
            },
          },
        ],
      });
    });
  };

  // 渲染报警事件趋势图（柱状图）
  const renderEventChart = (items: any[]) => {
    nextTick(() => {
      if (!eventChartRef.value) return;

      if (!eventChartInstance) {
        eventChartInstance = echarts.init(eventChartRef.value);
      }

      // 聚合所有 alarmTypeName 作为系列
      const typeNames: string[] = Array.from(
        new Set(
          items.flatMap((d: any) =>
            (d.alarmEvents || []).map((e: any) => e.alarmTypeName)
          )
        )
      );

      const xData = items.map((item: any) => String(item.dateNum));

      const series = typeNames.map((name) => ({
        name,
        type: 'bar',
        stack: 'total',
        data: items.map((d: any) => {
          const found = (d.alarmEvents || []).find(
            (e: any) => e.alarmTypeName === name
          );
          return found ? Number(found.num) || 0 : 0;
        }),
      }));

      eventChartInstance.setOption({
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: '#1796fa',
          textStyle: {
            color: '#fff',
          },
          axisPointer: {
            type: 'shadow',
          },
        },
        legend: {
          data: typeNames,
          textStyle: {
            color: 'rgba(255, 255, 255, 0.85)',
          },
          top: 10,
          type: 'scroll',
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: typeNames.length > 6 ? '20%' : '15%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: xData,
          name: filterForm.type === 'month' ? '日' : '月',
          nameTextStyle: {
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: 12,
          },
          nameGap: 5,
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.2)',
            },
          },
          axisLabel: {
            color: 'rgba(255, 255, 255, 0.7)',
          },
        },
        yAxis: {
          type: 'value',
          name: '件',
          nameTextStyle: {
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: 12,
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.2)',
            },
          },
          axisLabel: {
            color: 'rgba(255, 255, 255, 0.7)',
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
          },
        },
        series,
      });
    });
  };

  // 获取数据
  const fetchData = async () => {
    // 守卫：根据当前类型兜底日期
    if (!filterForm.date) {
      filterForm.date =
        filterForm.type === 'month' ? getCurrentMonth() : getCurrentYear();
    }

    const year =
      filterForm.type === 'year'
        ? Number(filterForm.date)
        : Number((filterForm.date || '').split('-')[0]);

    const month =
      filterForm.type === 'month'
        ? Number((filterForm.date || '').split('-')[1])
        : undefined;

    const params: SituationAwarenessParams = {
      year: Number.isFinite(year) ? year : Number(getCurrentYear()),
    };

    if (month) {
      params.month = month;
    }

    try {
      loading.value = true;
      const res: any = await getSituationAwareness(params);
      const data = res?.data || res || {};

      // 渲染图表
      renderTrendChart(data.alarmNumTrend || []);
      renderEventChart(data.alarmEventTrend || []);

      // 计算汇总数据
      const addSum = (data.alarmNumTrend || []).reduce(
        (sum: number, item: any) => sum + (Number(item.addAlarmCount) || 0),
        0
      );
      const clearSum = (data.alarmNumTrend || []).reduce(
        (sum: number, item: any) => sum + (Number(item.clearAlarmCount) || 0),
        0
      );

      numSummary.value = {
        add: addSum,
        clear: clearSum,
      };
    } catch (error: any) {
      Message.error(error?.message || '获取态势感知数据失败，请稍后重试');
    } finally {
      loading.value = false;
    }
  };

  // 查询
  const handleSearch = () => {
    fetchData();
  };

  // 初始化图表
  const initCharts = () => {
    nextTick(() => {
      if (trendChartRef.value && !trendChartInstance) {
        trendChartInstance = echarts.init(trendChartRef.value);
      }
      if (eventChartRef.value && !eventChartInstance) {
        eventChartInstance = echarts.init(eventChartRef.value);
      }

      // 监听窗口大小变化，自动调整图表大小
      window.addEventListener('resize', handleResize);
    });
  };

  // 组件挂载
  onMounted(() => {
    initCharts();
    fetchData();
  });

  // 组件卸载时清理
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    trendChartInstance?.dispose();
    eventChartInstance?.dispose();
  });
</script>

<style scoped lang="less">
  .content-section {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    padding: 20px;
    overflow: hidden;

    .section-header {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
      padding-bottom: 15px;
      border-bottom: 1px solid rgb(23 150 250 / 20%);

      .section-title {
        margin: 0;
        color: rgb(255 255 255 / 95%);
        font-weight: 600;
        font-size: 18px;
      }

      .section-filters {
        display: flex;
        align-items: center;

        :deep(.arco-radio-group) {
          .arco-radio-button {
            color: rgb(255 255 255 / 85%);
            background: rgb(0 0 0 / 30%);
            border-color: rgb(255 255 255 / 15%);

            &:hover {
              border-color: rgb(23 150 250 / 50%);
            }
          }

          .arco-radio-checked {
            color: #fff;
            background: linear-gradient(135deg, #1796fa 0%, #0d6fbe 100%);
            border-color: #1796fa;
          }
        }

        :deep(.arco-picker) {
          color: rgb(255 255 255 / 85%);
          background: rgb(0 0 0 / 30%) !important;
          border-color: rgb(255 255 255 / 15%);

          &:hover {
            border-color: rgb(23 150 250 / 50%);
          }

          input {
            color: rgb(255 255 255 / 85%);
            background: transparent !important;
          }
        }

        :deep(.arco-btn-primary) {
          background: linear-gradient(135deg, #1796fa 0%, #0d6fbe 100%);
          border: none;
          box-shadow: 0 2px 8px rgb(23 150 250 / 30%);

          &:hover {
            background: linear-gradient(135deg, #2ea3ff 0%, #1796fa 100%);
            box-shadow: 0 4px 12px rgb(23 150 250 / 50%);
          }
        }
      }
    }

    // AI提示框
    .ai-alert {
      display: flex;
      flex-shrink: 0;
      align-items: flex-start;
      margin-bottom: 5px;
      padding: 16px;
      background: rgb(23 150 250 / 8%);
      border: 1px solid rgb(23 150 250 / 20%);
      border-radius: 4px;

      .ai-badge {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        margin-right: 12px;
        color: #fff;
        font-weight: 600;
        font-size: 14px;
        background: linear-gradient(135deg, #1796fa 0%, #0d6fbe 100%);
        border-radius: 4px;
      }

      .ai-content {
        flex: 1;
        color: rgb(255 255 255 / 85%);
        font-size: 14px;
        line-height: 1.6;
      }
    }

    // 图表网格
    .charts-grid {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 12px;
      min-height: 0;

      .chart-box {
        display: flex;
        flex: 1;
        flex-direction: column;
        min-height: 0;
        padding: 16px;
        background: rgb(0 0 0 / 20%);
        border: 1px solid rgb(23 150 250 / 15%);
        border-radius: 4px;

        .chart-title {
          flex-shrink: 0;
          margin-bottom: 12px;
          padding-bottom: 10px;
          color: rgb(255 255 255 / 90%);
          font-weight: 500;
          font-size: 14px;
          border-bottom: 1px solid rgb(255 255 255 / 10%);
        }

        .chart-content {
          flex: 1;
          min-height: 0;
        }
      }
    }
  }
</style>
