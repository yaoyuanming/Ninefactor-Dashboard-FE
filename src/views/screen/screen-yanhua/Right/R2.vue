<template>
  <div class="stats-section alarm-stats-section">
    <!-- 标题组件 -->
    <Title title="预警统计" :src="TitleImage" :tabs="[]" @img-click="handelImageClick" />

    <!-- 预警级别卡片区域 -->
    <div style="padding-left: 20px">
      <SecTitle title="预警级别" :src="titleImg" />
    </div>
    <div class="alarm-levels">
      <div v-for="(level, idx) in alarmLevels" :key="idx" class="alarm-level-card"
        :style="{ background: level.background }">
        <div class="level-icon">
          <img :src="level.icon" alt="预警级别图标" />
          <div class="level-num">{{ level.num }}</div>
        </div>
        <div class="level-name">{{ level.name }}</div>
      </div>
    </div>

    <!-- 未消警/已消警进度条区域 -->
    <div style="padding-left: 20px">
      <SecTitle title="处理进度" :src="titleImg" />
    </div>
    <div class="alarm-clearance">
      <div class="clearance-item">
        <div class="clearance-label">未消警</div>
        <div class="clearance-num">{{ statisticsData?.unresolvedNum || 0 }}</div>
      </div>
      <div class="clearance-progress">
        <a-progress :percent="clearancePercent" :stroke-width="10" :show-info="false" :show-text="false"
          color="#1890ff"></a-progress>
      </div>
      <div class="clearance-item">
        <div class="clearance-label">已消警</div>
        <div class="clearance-num">{{ statisticsData?.resolvedNum || 0 }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Title from '../components/Title.vue';
import SecTitle from '../components/SecTitle.vue';
import zd from '../../../../assets/screen/imgs/danger.png';
import { getEarlyWarningStatistics } from '@/api/compmonitoring';
import type { AlarmStatisticsVo, AlarmEventVo } from '@/api/compmonitoring'; // 导入接口类型定义
import TitleImage from '@/assets/screen/lien.png';
// 接口返回的统计数据
const statisticsData = ref<AlarmStatisticsVo>({});

const emits = defineEmits(['handelClick'])

// 预警级别数据（图标、数量、名称、背景渐变）
const alarmLevels = ref([
  {
    name: '重大',
    num: 0, // 初始值设为0，后续会从接口数据更新
    icon: zd,
    background: 'linear-gradient(180deg, rgba(255, 72, 77, 0.48) 2%, rgba(255, 58, 64, 0.13) 97%)',
  },
  {
    name: '较大',
    num: 0,
    icon: zd,
    background: 'linear-gradient(180deg, rgba(255, 156, 88, 0.47) 9%, rgba(255, 116, 20, 0.13) 95%)',
  },
  {
    name: '一般',
    num: 0,
    icon: zd,
    background: 'linear-gradient(180deg, rgba(255, 224, 139, 0.53) 7%, rgba(255, 222, 130, 0.21) 90%)',
  },
  {
    name: '低',
    num: 0,
    icon: zd,
    background: 'linear-gradient(180deg, rgba(0, 168, 255, 0.66) 0%, rgba(0, 168, 255, 0.19) 97%)',
  },
]);


// 头部点击
function handelImageClick() {
  emits('handelClick', { tabsIndex: 3 })
}

// 计算消警率百分比（用于进度条）
const clearancePercent = computed(() => {
  const total = (statisticsData.value?.unresolvedNum || 0) + (statisticsData.value?.resolvedNum || 0);
  if (total === 0) return 0; // 避免除以0
  return Math.round(((statisticsData.value?.resolvedNum || 0) / total) * 100);
});

// 获取预警统计数据
const fetchWarningData = async () => {
  try {
    const response = await getEarlyWarningStatistics();
    if (response.success && response.data) {
      // 保存接口返回的统计数据
      statisticsData.value = response.data;

      // 更新预警级别数据（假设alarmType与预警级别对应：1-重大, 2-较大, 3-一般, 4-低）
      response.data.alarmEvents?.forEach(event => {
        switch (event.alarmType) {
          case '1':
            alarmLevels.value[0].num = event.num || 0;
            break;
          case '2':
            alarmLevels.value[1].num = event.num || 0;
            break;
          case '3':
            alarmLevels.value[2].num = event.num || 0;
            break;
          case '4':
            alarmLevels.value[3].num = event.num || 0;
            break;
          default:
            // 可以处理其他类型或忽略
            break;
        }
      });
    }
  } catch (error) {
    console.error('获取预警统计数据失败:', error);
  }
};

// 组件挂载时获取数据
onMounted(() => {
  fetchWarningData();
});

const selectTab = ref('');

</script>

<style scoped lang="less">
.stats-section.alarm-stats-section {
  background: linear-gradient(90deg, rgb(65 106 146 / 69%) 0%, #0c2249 97%);
  border-radius: 4px;

  .alarm-levels {
    display: flex;
    gap: 10px;
    justify-content: space-around;
    padding: 12px 24px 0;

    .alarm-level-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 97px;
      padding: 12px;
      border-radius: 4px;
      box-shadow: 0 2px 6px rgb(0 0 0 / 15%);

      .level-icon {
        display: flex;
        align-items: flex-end;
        justify-content: space-around;
        width: 100%;
        margin-bottom: 12px;

        img {
          width: 28px;
          height: 28px;
        }

        .level-num {
          margin: 8px 0 4px;
          color: #fff;
          font-weight: 600;
          font-size: 20px;
        }
      }

      .level-name {
        color: rgb(255 255 255 / 85%);
        font-size: 14px;
      }
    }
  }

  .alarm-clearance {
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 12px 24px;

    .clearance-item {
      display: flex;
      flex-direction: column;
      align-items: center;

      .clearance-label {
        color: rgb(255 255 255 / 80%);
        font-size: 14px;
      }

      .clearance-num {
        margin-top: 4px;
        color: #fff;
        font-weight: 600;
        font-size: 18px;
      }
    }

    .clearance-progress {
      flex-grow: 1;
    }
  }
}
</style>
