<template>
  <div v-loading="loading" class="content-section">
    <div class="section-header">
      <div class="header-left">
        <h3 class="section-title">区域报警统计</h3>
      </div>
      <div class="section-filters">
        <RegionSelect
          v-model="filterForm.regionCode"
          placeholder="请选择区域"
          width="180px"
          :default-first="true"
          @change="handleRegionChange"
        />
        <a-radio-group
          v-model="filterForm.type"
          type="button"
          size="small"
          style="margin-left: 12px"
        >
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

    <!-- 查询时间提示 -->
    <div v-if="queryPeriod" class="ai-alert">
      <div class="ai-content">{{ queryPeriod }}</div>
    </div>

    <!-- 图表网格 -->
    <div class="charts-grid">
      <div v-if="kpiData.length > 0" class="chart-box kpi-box">
        <div class="kpi-wrapper">
          <div v-for="(item, index) in kpiData" :key="index" class="kpi-card">
            <div class="kpi-title">{{ item.title }}</div>
            <div class="kpi-value">{{ item.value }}</div>
          </div>
        </div>
      </div>
      <div class="chart-box">
        <div class="chart-title">报警事件趋势</div>
        <div v-if="!statisticsData && !loading" class="empty-placeholder">
          暂无数据，请选择区域并点击查询按钮
        </div>
        <div v-else ref="trendChartRef" class="chart-content"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import {
    reactive,
    ref,
    onMounted,
    onUnmounted,
    nextTick,
    computed,
    watch,
  } from 'vue';
  import * as echarts from 'echarts';
  import { Message } from '@arco-design/web-vue';
  import { getRegionAlarmStatistics } from '@/api/statistics';
  import type { RegionAlarmStatisticsParams } from '@/api/statistics';
  import RegionSelect from '../../components/RegionSelect/index.vue';

  // 获取当前月份 (YYYY-MM 格式)
  const getCurrentMonth = () => {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${m}`;
  };

  // 获取当前年份
  const getCurrentYear = () => String(new Date().getFullYear());

  // 筛选表单
  const filterForm = reactive({
    regionCode: '' as string | number | null,
    type: 'month' as 'month' | 'year',
    date: getCurrentMonth(),
  });

  // 加载状态
  const loading = ref(false);

  // 统计数据
  const statisticsData = ref<any>(null);

  // 图表 DOM 引用
  const trendChartRef = ref<HTMLElement>();

  // 图表实例
  let trendChartInstance: echarts.ECharts | null = null;

  // 区域名称
  const regionName = ref('');

  // 监听类型切换，更新日期默认值
  watch(
    () => filterForm.type,
    (newType) => {
      filterForm.date =
        newType === 'month' ? getCurrentMonth() : getCurrentYear();
    }
  );

  // 处理区域选择变化
  const handleRegionChange = (
    value: string | number | null,
    label?: string
  ) => {
    regionName.value = label || '';
  };

  // KPI数据
  const kpiData = computed(() => {
    if (!statisticsData.value?.alarmEventRealTimeOverview) {
      return [];
    }

    const overview = statisticsData.value.alarmEventRealTimeOverview;
    const isMonth = filterForm.type === 'month';
    const prefix = isMonth ? '本月' : '本年';

    return [
      {
        title: `${prefix}新增报警事件总数(件)`,
        value: overview.monthTotalAlarmCount || 0,
      },
      {
        title: `期初未消警事件总数(件)`,
        value: overview.monthBeginUnresolvedCount || 0,
      },
      {
        title: `期末未消警事件总数(件)`,
        value: overview.monthEndUnresolvedCount || 0,
      },
      {
        title: `${prefix}已消警事件数(件)`,
        value: overview.monthResolvedCount || 0,
      },
      {
        title: `${prefix}新增超员作业报警事件数(件)`,
        value: overview.monthNewOverstaffingAlarmCount || 0,
      },
      {
        title: `${prefix}新增堵塞通道报警事件数(件)`,
        value: overview.monthNewChannelAlarmCount || 0,
      },
      {
        title: `${prefix}新增超高超量报警事件数(件)`,
        value: overview.monthNewOverHeightWeightAlarmCount || 0,
      },
      {
        title: `${prefix}新增非法入侵报警事件数(件)`,
        value: overview.monthNewIntrusionAlarmCount || 0,
      },
      {
        title: `${prefix}新增摄像头遮挡偏移报警事件数(件)`,
        value: overview.monthNewCameraOcclusionAlarmCount || 0,
      },
      {
        title: `${prefix}新增温度报警事件数(件)`,
        value: overview.monthNewTemperatureAlarmCount || 0,
      },
      {
        title: `${prefix}新增湿度报警事件数(件)`,
        value: overview.monthNewHumidityAlarmCount || 0,
      },
      {
        title: `${prefix}新增人员资质证书到期报警事件数(件)`,
        value: overview.monthNewCertificateExpireAlarmCount || 0,
      },
      {
        title: `${prefix}平均事件消警时长(分钟)`,
        value: Math.round(overview.avgAlarmClearTime || 0),
      },
      {
        title: `${prefix}平均事件发生频率(分钟)`,
        value: Math.round(overview.avgAlarmFrequency || 0),
      },
    ];
  });

  // 计算查询时间范围
  const queryPeriod = computed(() => {
    if (!filterForm.date) return '';

    if (filterForm.type === 'month') {
      const [year, month] = filterForm.date.split('-');
      const lastDay = new Date(
        parseInt(year, 10),
        parseInt(month, 10),
        0
      ).getDate();
      return `查询时间: ${year}年${month}月01日 - ${year}年${month}月${lastDay}日`;
    }
    return `查询时间: ${filterForm.date}年01月01日 - ${filterForm.date}年12月31日`;
  });

  // 处理窗口大小变化
  const handleResize = () => {
    trendChartInstance?.resize();
  };

  // 渲染趋势图
  const renderTrendChart = (trendData: any[]) => {
    nextTick(() => {
      if (!trendChartRef.value) return;

      if (!trendChartInstance) {
        trendChartInstance = echarts.init(trendChartRef.value);
      }

      // 聚合所有
      const typeNames: string[] = Array.from(
        new Set(
          trendData.flatMap((d: any) =>
            (d.alarmEvents || []).map((e: any) => e.alarmTypeName)
          )
        )
      );

      const xData = trendData.map((item: any) => String(item.dateNum));

      const series = typeNames.map((name) => ({
        name,
        type: 'bar',
        stack: 'total',
        data: trendData.map((d: any) => {
          const found = (d.alarmEvents || []).find(
            (e: any) => e.alarmTypeName === name
          );
          return found ? Number(found.num) || 0 : 0;
        }),
      }));

      trendChartInstance.setOption({
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
    // 守卫：确保区域已选择
    if (!filterForm.regionCode) {
      Message.warning('请先选择区域');
      return;
    }

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

    const params: RegionAlarmStatisticsParams = {
      regionCode: String(filterForm.regionCode),
      year: Number.isFinite(year) ? year : Number(getCurrentYear()),
    };

    if (month) {
      params.month = month;
    }

    try {
      loading.value = true;
      const res: any = await getRegionAlarmStatistics(params);
      const data = res?.data || res || {};
      statisticsData.value = data;

      // 渲染图表
      if (data.alarmEventTrend) {
        renderTrendChart(data.alarmEventTrend);
      }
    } catch (error: any) {
      Message.error(error?.message || '获取区域报警统计数据失败，请稍后重试');
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

      // 监听窗口大小变化，自动调整图表大小
      window.addEventListener('resize', handleResize);
    });
  };

  // 组件挂载
  onMounted(() => {
    initCharts();
    // 等待区域默认选中后再获取数据
    setTimeout(() => {
      if (filterForm.regionCode) {
        fetchData();
      }
    }, 500);
  });

  // 组件卸载时清理
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    trendChartInstance?.dispose();
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

      .header-left {
        .section-title {
          margin: 0;
          color: rgb(255 255 255 / 95%);
          font-weight: 600;
          font-size: 18px;
        }
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

    // （查询时间）
    .ai-alert {
      display: flex;
      flex-shrink: 0;
      align-items: flex-start;
      margin-bottom: 5px;
      padding: 12px 16px;
      background: rgb(23 150 250 / 8%);
      border: 1px solid rgb(23 150 250 / 20%);
      border-radius: 4px;

      .ai-content {
        flex: 1;
        color: rgb(255 255 255 / 75%);
        font-size: 13px;
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

        .empty-placeholder {
          display: flex;
          flex: 1;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          color: rgb(255 255 255 / 45%);
          font-size: 14px;
        }

        // KPI 卡片专用样式
        &.kpi-box {
          flex: 0 0 auto;
          overflow-y: auto;

          &::-webkit-scrollbar {
            width: 6px;
          }

          &::-webkit-scrollbar-thumb {
            background: rgb(23 150 250 / 30%);
            border-radius: 3px;

            &:hover {
              background: rgb(23 150 250 / 50%);
            }
          }

          .kpi-wrapper {
            display: grid;
            grid-auto-rows: 1fr;
            grid-template-columns: repeat(7, 1fr);
            gap: 12px;

            .kpi-card {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 16px 12px;
              text-align: center;
              background: linear-gradient(
                135deg,
                rgb(23 150 250 / 8%) 0%,
                rgb(23 150 250 / 3%) 100%
              );
              border: 1px solid rgb(23 150 250 / 25%);
              border-radius: 6px;
              box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
              transition: all 0.3s ease;

              &:hover {
                background: linear-gradient(
                  135deg,
                  rgb(23 150 250 / 15%) 0%,
                  rgb(23 150 250 / 8%) 100%
                );
                border-color: rgb(23 150 250 / 45%);
                box-shadow: 0 4px 16px rgb(23 150 250 / 20%);
                transform: translateY(-3px);
              }

              .kpi-title {
                width: 100%;
                margin-bottom: 10px;
                overflow: hidden;
                color: rgb(255 255 255 / 75%);
                font-size: 12px;
                line-height: 1.4;
                white-space: nowrap;
                text-overflow: ellipsis;
              }

              .kpi-value {
                color: #1796fa;
                font-weight: 700;
                font-size: 24px;
                text-shadow: 0 0 10px rgb(23 150 250 / 30%);
              }
            }
          }
        }
      }
    }
  }
</style>
