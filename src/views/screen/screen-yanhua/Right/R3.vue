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
                >立即处理</button
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
  import { useRouter } from 'vue-router';
  import Title from '../components/Title.vue';
  // import {
  //   getAlarmRecordPage,
  //   type AlarmRecordPageReqVO,
  //   getUnhandleAlarmCount,
  // } from '@/api/monitoring/record/alarmrecord/index';
  // import { formatDate } from '@/utils/formatTime';

  const router = useRouter();

  // 报警列表数据
  const alarmList = ref<any[]>([
    {
      location: '测试企业 南2仓库',
      type: '超员作业',
      time: '2025-09-17 10:22:00',
    },
    {
      location: '测试企业 南1仓库',
      type: '超员作业',
      time: '2025-09-17 10:24:00',
    },
  ]);

  // 获取报警数量
  const fetchAlarmCount = async () => {
    // try {
    //   const count = await getUnhandleAlarmCount();
    //   alarmCount.value = count || 0;
    // } catch (error) {
    //   console.error('获取报警数量失败', error);
    // }
  };

  // 获取报警列表
  const fetchAlarmList = async () => {
    try {
      // const params: AlarmRecordPageReqVO = {
      //   pageNum: 1,
      //   pageSize: 5,
      //   handleStat: 0,
      // };
      // const res = await getAlarmRecordPage(params);
      // if (res && res.pageData) {
      //   alarmList.value = res.pageData.map((item) => ({
      //     id: item.id,
      //     type: item.alarmTypeName || '未知类型',
      //     location: item.alarmPosition || '未知位置',
      //     time: item.warningDate ? formatDate(item.warningDate) : '未知时间',
      //   }));
      // }
    } catch (error) {
      console.error('获取报警列表失败', error);
    }
  };

  // 处理按钮点击
  const handleProcess = (item: any) => {
    router.push({ path: `/monitoring/record/process/${item.id}` });
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
    flex-direction: column;
    height: 57%;
    max-height: 470px;
    margin-bottom: 16px;
    background: linear-gradient(90deg, rgb(65 106 146 / 69%) 0%, #0c2249 97%);
    // background-color: #040e21;
    border-radius: 4px;
    pointer-events: all;
  }

  .alarm-list-wrapper {
    flex: 1;
    padding: 20px;
    overflow: hidden;
  }

  .alarm-list {
    height: 100%;
    max-height: calc(100% - 20px); /* 确保列表不会太长 */
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
