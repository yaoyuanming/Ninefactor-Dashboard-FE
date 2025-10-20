<template>
  <div class="stats-section quick-handle-section">
    <!-- 使用Title组件 -->
    <Title title="快捷处理" :tabs="[]" />

    <!-- 报警列表区域 -->
    <div class="alarm-list-wrapper">
      <div class="alarm-list">
        <div v-for="(item, index) in alarmList" :key="index" class="alarm-item">
          <div class="alarm-info">
            <div class="alarm-location">位置: {{ item.location }}</div>
            <div class="alarm-action">
              <button class="handle-btn" @click="handleProcess(item)"
                >查看</button
              >
            </div>
          </div>
          <div class="alarm-detail">
            <div class="alarm-icon">
              <img src="@/assets/screen/imgs/danger.png" alt="报警图标" />
            </div>
            <div class="alarm-type">{{ item.type }}</div>
            <div class="alarm-time">{{ item.time }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import { getAlarmPage, type AlarmPageParams } from '@/api/alarm';
  import { formatDateTime } from '@/utils/date';
  import Title from '../components/Title.vue';

  // 报警列表数据
  const alarmList = ref<any[]>([]);

  // 获取报警数量
  const fetchAlarmCount = async () => {
    // 这里可以添加获取报警数量的逻辑
    // 暂时不需要实现
  };

  // 获取报警类型名称
  const getAlarmTypeName = (alarmType: number): string => {
    const typeMap: Record<number, string> = {
      1: '超员作业',
      2: '堵塞通道',
      3: '超高超量',
      4: '非法入侵',
      5: '摄像头遮挡偏移',
      6: '证书过期',
    };
    return typeMap[alarmType] || '未知类型';
  };

  // 获取报警列表
  const fetchAlarmList = async () => {
    try {
      const params: AlarmPageParams = {
        pageNo: 1,
        pageSize: 4,
      };

      const response = await getAlarmPage(params);
      const { data } = response;

      if (data && data.records) {
        alarmList.value = data.records.map((item: any) => ({
          id: item.id,
          type: getAlarmTypeName(item.alarmType),
          location: item.alarmPosition || '未知位置',
          time: formatDateTime(item.warningDate),
        }));
      }
    } catch (error) {
      // 获取报警列表失败
    }
  };

  // 定义事件
  const emits = defineEmits(['handelClick']);

  // 处理按钮点击 - 跳转到报警监控页面
  const handleProcess = (item: any) => {
    // 查看报警详情
    // 触发父组件事件，切换到报警监控页面
    emits('handelClick', { tabsIndex: 2, item });
  };

  // 定时刷新数据
  let refreshTimer: any = null;

  // 组件挂载时获取数据
  onMounted(() => {
    fetchAlarmCount();
    fetchAlarmList();

    // 每30秒刷新一次数据
    refreshTimer = setInterval(() => {
      fetchAlarmCount();
      fetchAlarmList();
    }, 30000);
  });

  // 组件卸载时清除定时器
  onBeforeUnmount(() => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
    }
  });
</script>

<style scoped lang="less">
  .stats-section {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    margin-bottom: 16px;
    background: linear-gradient(90deg, rgb(65 106 146 / 69%) 0%, #0c2249 97%);
    // background-color: #040e21;
    border-radius: 4px;
    pointer-events: all;
  }

  .alarm-list-wrapper {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 20px;
    overflow: hidden;
  }

  .alarm-list {
    flex: 1;
    min-height: 0;
    padding-right: 4px;
    overflow-y: auto;

    /* 自定义滚动条样式 */
    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: rgb(0 0 0 / 10%);
      border-radius: 2px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgb(100 100 100 / 50%);
      border-radius: 2px;
    }
  }

  .alarm-item {
    margin-bottom: 8px;
    padding: 12px;
    background: rgb(7 27 55 / 30%);
    border-radius: 4px;

    &:last-child {
      margin-bottom: 0;
    }

    .alarm-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;

      .alarm-location {
        color: rgb(193 201 216 / 83%);
        font-size: 14px;
      }

      .alarm-action {
        .handle-btn {
          padding: 6px 12px;
          color: white;
          font-size: 12px;
          background: linear-gradient(180deg, #3a6ac7 0%, #1d4fa3 100%);
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
      }
    }

    .alarm-detail {
      display: flex;
      align-items: center;

      .alarm-icon {
        width: 24px;
        height: 24px;
        margin-right: 8px;

        img {
          width: 100%;
          height: 100%;
        }
      }

      .alarm-type {
        margin-right: auto;
        color: rgb(255 255 255 / 96%);
        font-weight: 500;
        font-size: 14px;
      }

      .alarm-time {
        color: rgb(216 233 240 / 29%);
        font-size: 12px;
      }
    }
  }
</style>
