<template>
  <div class="stats-section risk-alert-section">
    <Title
      title="风险提示"
      :src="TitleImage"
      :tabs="[]"
      @img-click="handleRiskClick"
    />

    <!-- 风险列表区域 -->
    <div class="risk-list-wrapper">
      <!-- 无数据时显示 -->
      <div v-if="riskList.length === 0" class="empty-state">
        <img src="@/assets/screen/imgs/none-items.png" alt="暂无数据" />
      </div>

      <!-- 有数据时显示列表 -->
      <div v-else class="risk-list">
        <div v-for="(item, index) in riskList" :key="index" class="risk-item">
          <div class="risk-info">
            <div class="risk-location">位置: {{ item.location }}</div>
            <div class="risk-action">
              <button class="handle-btn" @click="handleProcess(item)"
                >查看</button
              >
            </div>
          </div>
          <div class="risk-detail">
            <div class="risk-icon">
              <img src="@/assets/screen/imgs/danger.png" alt="风险图标" />
            </div>
            <div class="risk-type">{{ item.type }}</div>
            <div class="risk-time">{{ item.time }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import TitleImage from '@/assets/screen/lien.png';
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import Title from '../components/Title.vue';

  // 风险列表数据
  const riskList = ref<any[]>([]);

  // 模拟数据
  // const mockRiskData = [
  //   {
  //     id: 1,
  //     type: '证书即将过期',
  //     location: '1号危化品仓库',
  //     time: '2025-01-20 14:30:25',
  //   },
  //   {
  //     id: 2,
  //     type: '库存超限预警',
  //     location: '3号库房',
  //     time: '2025-01-20 13:15:10',
  //   },
  //   {
  //     id: 3,
  //     type: '设备维护提醒',
  //     location: '2号温湿度设备',
  //     time: '2025-01-20 10:20:45',
  //   },
  // ];

  // TODO: 预留接口 - 获取风险提示列表
  const fetchRiskList = async () => {
    try {
      // const response = await getRiskAlertList({
      //   pageNo: 1,
      //   pageSize: 4,
      // });
      // riskList.value = response.data.records;

      // 暂时使用模拟数据 - 空数组显示无数据状态
      riskList.value = [];
      // 如需显示有数据状态，取消下面的注释
      // riskList.value = mockRiskData;
    } catch (error) {
      // console.error('获取风险提示列表失败：', error);
    }
  };

  // 处理按钮点击
  const handleProcess = (item: any) => {
    // console.log('查看风险详情：', item);
    // TODO: 实现查看风险详情的逻辑
  };

  // 点击标题图标
  const handleRiskClick = () => {
    // console.log('点击风险提示标题');
    // TODO: 实现点击标题的逻辑
  };

  // 定时刷新数据
  let refreshTimer: any = null;

  // 组件挂载时获取数据
  onMounted(() => {
    fetchRiskList();

    // 每30秒刷新一次数据
    refreshTimer = setInterval(() => {
      fetchRiskList();
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
    background: linear-gradient(90deg, #0c2249 0%, rgb(65 106 146 / 69%) 97%);
    border-radius: 4px;
    pointer-events: all;
  }

  .risk-list-wrapper {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 10px;
    overflow: hidden;
  }

  // 空状态样式
  .empty-state {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;

    img {
      width: 64px;
      height: 90px;
    }
  }

  // 风险列表样式
  .risk-list {
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

  .risk-item {
    margin-bottom: 8px;
    padding: 12px;
    background: rgb(7 27 55 / 30%);
    border-radius: 4px;

    &:last-child {
      margin-bottom: 0;
    }

    .risk-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;

      .risk-location {
        color: rgb(193 201 216 / 83%);
        font-size: 14px;
      }

      .risk-action {
        .handle-btn {
          padding: 6px 12px;
          color: white;
          font-size: 12px;
          background: linear-gradient(180deg, #3a6ac7 0%, #1d4fa3 100%);
          border: none;
          border-radius: 4px;
          cursor: pointer;

          &:hover {
            opacity: 0.9;
          }
        }
      }
    }

    .risk-detail {
      display: flex;
      align-items: center;

      .risk-icon {
        width: 24px;
        height: 24px;
        margin-right: 8px;

        img {
          width: 100%;
          height: 100%;
        }
      }

      .risk-type {
        margin-right: auto;
        color: rgb(255 255 255 / 96%);
        font-weight: 500;
        font-size: 14px;
      }

      .risk-time {
        color: rgb(216 233 240 / 29%);
        font-size: 12px;
      }
    }
  }
</style>
