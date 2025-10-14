<template>
  <div class="content-left" :style="`z-index: ${baseConfig.leftConfig.zIndex}`">
    <div class="content-left-main">
      <!-- 应急管理模块 -->
      <div class="stats-section emergency-stats-section">
        <div class="title-wrapper">
<<<<<<< HEAD
          <Title
            title="应急管理"
            :src="TitleImage"
            :tabs="[]"
            @imgClick="handleOpenEmergencyDrawer"
          />
=======
          <Title title="应急管理" :src="TitleImage" :tabs="[]" @imgClick="handleOpenEmergencyDrawer" />
>>>>>>> main
        </div>

        <!-- 内容区域 -->
        <div class="emergency-content">
          <!-- 上排：政府应急预案、企业应急预案、应急专家 -->
          <div class="top-row">
            <div class="item-card">
              <div class="item-icon">
                <img :src="govtIcon" alt="政府应急预案" />
              </div>
              <div class="item-info">
                <div class="item-count">10</div>
                <div class="item-label">政府应急预案</div>
              </div>
            </div>

            <div class="item-card">
              <div class="item-icon">
                <img :src="entIcon" alt="企业应急预案" />
              </div>
              <div class="item-info">
                <div class="item-count">5/5</div>
                <div class="item-label">企业应急预案</div>
              </div>
            </div>

            <div class="item-card">
              <div class="item-icon">
                <img :src="expertIcon" alt="应急专家" />
              </div>
              <div class="item-info">
                <div class="item-count">10</div>
                <div class="item-label">应急专家</div>
              </div>
            </div>
          </div>

          <!-- 下排：tab切换按钮 -->
          <div class="tab-row">
            <div class="tab-item" :class="{ active: currentTab === 'rescue-force' }"
              @click="handleTabChange('rescue-force')">
              救援力量
            </div>
            <div class="tab-item" :class="{ active: currentTab === 'medical' }" @click="handleTabChange('medical')">
              医疗机构
            </div>
            <div class="tab-item" :class="{ active: currentTab === 'supplies' }" @click="handleTabChange('supplies')">
              应急物资
            </div>
            <div class="tab-item" :class="{ active: currentTab === 'equipment' }" @click="handleTabChange('equipment')">
              应急装备
            </div>
          </div>

          <!-- 对应的队伍/机构列表 -->
          <div class="teams-list">
            <div v-for="(item, index) in currentList" :key="index" class="team-item" :style="teamStyle(index)">
              <div class="team-name">{{ item.name }}</div>
              <div class="team-icon">
                <img :src="getCurrentIcon()" :alt="getCurrentLabel()" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <L1/>
  </div>
</template>

<script lang="ts" setup>
import { ref, inject, computed, onMounted } from 'vue';
import { baseConfig } from '../config';
import Title from '../components/Title.vue';
import TitleImage from '../../../../assets/screen/lien.png';
import L1 from './L1.vue'
// 导入应急管理相关图标
import govtIcon from '../../../../assets/screen/emergency/govt.png';
import entIcon from '../../../../assets/screen/emergency/ent.png';
import expertIcon from '../../../../assets/screen/emergency/expert.png';
import rescueForceIcon from '../../../../assets/screen/emergency/rescue-force-marker.png';
import medicalIcon from '../../../../assets/screen/emergency/medical-institution-marker.png';
import suppliesIcon from '../../../../assets/screen/emergency/emergency-supplies-marker.png';
import equipmentIcon from '../../../../assets/screen/emergency/emergency-equipment-marker.png';

// 注入打开抽屉的方法
const openDrawer =
  inject<(type: string, title: string, data?: any) => void>('openDrawer');

onMounted(() => {
  console.log('Left2组件已挂载');
  console.log('openDrawer注入状态：', !!openDrawer);
});

// 当前选中的 tab
const currentTab = ref('rescue-force');

// 各类型的数据
const dataMap = {
  'rescue-force': [
    { name: '救援队1' },
    { name: '救援队2' },
    { name: '救援队3' },
    { name: '救援队4' },
  ],
  'medical': [
    { name: '医疗机构1' },
    { name: '医疗机构2' },
    { name: '医疗机构3' },
    { name: '医疗机构4' },
  ],
  'supplies': [
    { name: '物资仓库1' },
    { name: '物资仓库2' },
    { name: '物资仓库3' },
    { name: '物资仓库4' },
  ],
  'equipment': [
    { name: '装备库1' },
    { name: '装备库2' },
    { name: '装备库3' },
    { name: '装备库4' },
  ],
};

// 当前显示的列表
const currentList = computed(() => {
  return dataMap[currentTab.value as keyof typeof dataMap] || [];
});

// 获取当前图标
const getCurrentIcon = () => {
  const iconMap = {
    'rescue-force': rescueForceIcon,
    'medical': medicalIcon,
    'supplies': suppliesIcon,
    'equipment': equipmentIcon,
  };
  return iconMap[currentTab.value as keyof typeof iconMap];
};

// 获取当前标签
const getCurrentLabel = () => {
  const labelMap = {
    'rescue-force': '救援队',
    'medical': '医疗机构',
    'supplies': '物资仓库',
    'equipment': '装备库',
  };
  return labelMap[currentTab.value as keyof typeof labelMap];
};

// tab 切换处理
const handleTabChange = (tabValue: string) => {
  currentTab.value = tabValue;
};

// 点击标题打开应急管理抽屉
const handleOpenEmergencyDrawer = () => {
  console.log('点击了应急管理图标');
  console.log('openDrawer是否存在：', !!openDrawer);

  if (openDrawer) {
    console.log('调用openDrawer，参数：emergency-management, 应急管理');
    openDrawer('emergency-management', '应急管理');
  } else {
    console.error('openDrawer 未注入');
  }
};

// 返回的组件样式
function teamStyle(index: any) {
  if (index % 2 === 0) {
    return {
      background: " radial-gradient(56% 138% at 43% 100%, rgba(118, 177, 255, 0.15) 0%, rgba(112, 150, 202, 0) 100%)",
      boxSizing: " border-box",
      border: "1.57px solid",
      borderImage: "linear-gradient(270deg, rgba(88, 149, 231, 0) 0%, rgba(88, 149, 231, 0.37) 55%, rgba(88, 149, 231, 0) 100%) "
    }
  } else {
    return {
      border: 'none'
    }
  }
}
</script>

<style scoped lang="less">
.content-left {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  min-width: 440px;
  height: 100%;
  overflow: hidden;
  pointer-events: all;
  display: flex;
  justify-content: space-between;

  .content-left-main {
    display: flex;
    flex-direction: column;
    width: 460px;
    height: calc(100% - 100px);
    margin-top: 80px;
    padding-left: 20px;
    overflow: hidden;
    pointer-events: all;

    .stats-section {
      flex: 1;
      overflow: hidden;
      background: linear-gradient(90deg,
          #0c2249 0%,
          rgb(65 106 146 / 69%) 97%);
      border-radius: 4px;
      pointer-events: all;

      &.emergency-stats-section {
        display: flex;
        flex-direction: column;
        padding-bottom: 12px;
      }

      .title-wrapper {
        position: relative;
        z-index: 999; // 局部提高Title组件的z-index，确保可点击
      }

      .emergency-content {
        display: flex;
        flex: 1;
        flex-direction: column;
        padding: 10px 20px;

        .top-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        .item-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px 8px;
          background: rgb(10 30 60 / 40%);
          border: 1px solid rgb(23 150 250 / 20%);
          border-radius: 6px;

          .item-icon {
            width: 40px;
            height: 40px;
            margin-bottom: 8px;

            img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
          }

          .item-info {
            text-align: center;

            .item-count {
              margin-bottom: 4px;
              color: #fff;
              font-weight: bold;
              font-size: 18px;
            }

            .item-label {
              color: rgb(255 255 255 / 80%);
              font-size: 11px;
            }
          }
        }

        .tab-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 20px;

          .tab-item {
            padding: 8px 12px;
            color: rgb(255 255 255 / 70%);
            font-size: 12px;
            text-align: center;

            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s ease;
            pointer-events: all;

            &:hover {
              color: #fff;
              background: rgb(23 150 250 / 30%);
              border-color: rgb(23 150 250 / 50%);
            }

            &.active {
              color: #fff;
              font-weight: 500;
              background: rgb(23 150 250 / 60%);
              border-color: rgb(23 150 250 / 80%);
            }
          }
        }

        .teams-list {
          flex: 1;
          overflow-y: auto;

          .team-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 0 16px;
            border-radius: 4px;
            border: 1.57px solid;
            height: 80px;

            .team-icon {
              width: 28px;
              height: 36px;

              img {
                width: 100%;
                height: 100%;
                object-fit: contain;
              }
            }

            .team-name {
              color: #fff;
              font-weight: 400;
              font-size: 13px;
            }
          }
        }
      }
    }
  }
}
</style>
