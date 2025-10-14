<template>
  <div class="content-left" :style="`z-index: ${baseConfig.leftConfig.zIndex}`">
    <div class="content-left-main">
      <!-- 应急管理模块 -->
      <div class="stats-section emergency-stats-section">
        <div class="title-wrapper">
          <Title
            title="应急管理"
            :src="TitleImage"
            :tabs="[]"
            @img-click="handleOpenEmergencyDrawer"
          />
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
                <div class="item-count">{{ statsData.govtPlanCount }}</div>
                <div class="item-label">政府应急预案</div>
              </div>
            </div>

            <div class="item-card">
              <div class="item-icon">
                <img :src="entIcon" alt="企业应急预案" />
              </div>
              <div class="item-info">
                <div class="item-count">{{ statsData.entPlanCount }}/5</div>
                <div class="item-label">企业应急预案</div>
              </div>
            </div>

            <div class="item-card">
              <div class="item-icon">
                <img :src="expertIcon" alt="应急专家" />
              </div>
              <div class="item-info">
                <div class="item-count">{{ statsData.expertCount }}</div>
                <div class="item-label">应急专家</div>
              </div>
            </div>
          </div>

          <!-- 下排：tab切换按钮 -->
          <div class="tab-row">
            <div
              class="tab-item"
              :class="{ active: currentTab === 'rescue-force' }"
              @click="handleTabChange('rescue-force')"
            >
              救援力量
            </div>
            <div
              class="tab-item"
              :class="{ active: currentTab === 'medical' }"
              @click="handleTabChange('medical')"
            >
              医疗机构
            </div>
            <div
              class="tab-item"
              :class="{ active: currentTab === 'supplies' }"
              @click="handleTabChange('supplies')"
            >
              应急物资
            </div>
            <div
              class="tab-item"
              :class="{ active: currentTab === 'equipment' }"
              @click="handleTabChange('equipment')"
            >
              应急装备
            </div>
          </div>

          <!-- 对应的队伍/机构列表 -->
          <div class="teams-list">
            <!-- 加载动画 -->
            <div v-if="loading" class="loading-container">
              <div class="loading-spinner">
                <div class="spinner-item"></div>
                <div class="spinner-item"></div>
                <div class="spinner-item"></div>
              </div>
              <div class="loading-text">数据加载中...</div>
            </div>

            <!-- 数据列表 -->
            <template v-else>
              <div
                v-for="(item, index) in currentList"
                :key="item.id || index"
                class="team-item"
              >
                <div class="team-name">
                  {{
                    item.name ||
                    item.teamName ||
                    item.institutionName ||
                    item.suppliesName ||
                    item.equipmentName
                  }}
                </div>
                <div class="team-icon">
                  <img :src="getCurrentIcon()" :alt="getCurrentLabel()" />
                </div>
              </div>
              <!-- 无数据提示 -->
              <div v-if="currentList.length === 0" class="no-data">
                暂无数据
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, inject, computed, onMounted } from 'vue';
  import {
    getRescueTeamList,
    getMedicalInstitutionList,
    getEmergencySuppliesList,
    getEmergencyEquipmentList,
  } from '@/api/emergency';
  import { baseConfig } from '../config';
  import Title from '../components/Title.vue';
  import TitleImage from '../../../../assets/screen/lien.png';

  // 导入API接口

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

  // 当前选中的 tab
  const currentTab = ref('rescue-force');

  // 加载状态
  const loading = ref(false);

  // 统计数据（预留接口）
  const statsData = ref({
    govtPlanCount: 10, // 预留：政府预案数量
    entPlanCount: 5, // 预留：企业预案数量
    expertCount: 10, // 预留：专家数量
  });

  // 各类型的数据
  const dataMap = ref<Record<string, any[]>>({
    'rescue-force': [],
    'medical': [],
    'supplies': [],
    'equipment': [],
  });

  // 当前显示的列表
  const currentList = computed(() => {
    return dataMap.value[currentTab.value] || [];
  });

  // 请求列表数据
  const fetchListData = async (type: string) => {
    loading.value = true;
    try {
      // 添加最小加载时间，避免闪烁
      const startTime = Date.now();

      let response;
      const params = {
        page: 1,
        size: 20,
      };

      switch (type) {
        case 'rescue-force':
          response = await getRescueTeamList(params);
          // API返回的数据结构是 data.records
          dataMap.value['rescue-force'] = response.data?.records || [];
          break;
        case 'medical':
          response = await getMedicalInstitutionList(params);
          dataMap.value.medical = response.data?.records || [];
          break;
        case 'supplies':
          response = await getEmergencySuppliesList(params);
          dataMap.value.supplies = response.data?.records || [];
          break;
        case 'equipment':
          response = await getEmergencyEquipmentList(params);
          dataMap.value.equipment = response.data?.records || [];
          break;
        default:
          break;
      }

      // 确保加载动画至少显示300ms
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < 300) {
        await new Promise((resolve) => {
          setTimeout(resolve, 300 - elapsedTime);
        });
      }
    } catch (error) {
      console.error(`获取${type}数据失败:`, error);
      // 如果接口失败，显示空数据
      dataMap.value[type] = [];
    } finally {
      loading.value = false;
    }
  };

  // 获取统计数据（预留接口，暂不调用）
  const fetchStatsData = async () => {
    // TODO: 后续接入统计接口
    // try {
    //   const govtPlanRes = await getEmergencyPlanList({
    //     page: 1,
    //     size: 1,
    //     planType: 1,
    //   });
    //   statsData.value.govtPlanCount = govtPlanRes.data?.total || 10;
    //
    //   const entPlanRes = await getEmergencyPlanList({
    //     page: 1,
    //     size: 1,
    //     planType: 2,
    //   });
    //   statsData.value.entPlanCount = entPlanRes.data?.total || 5;
    //
    //   const expertRes = await getEmergencyExpertList({
    //     page: 1,
    //     size: 1,
    //   });
    //   statsData.value.expertCount = expertRes.data?.total || 10;
    // } catch (error) {
    //   console.error('获取统计数据失败:', error);
    // }
  };

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
    if (currentTab.value === tabValue) return; // 避免重复点击
    currentTab.value = tabValue;
    // 切换时请求对应数据
    fetchListData(tabValue);
  };

  // 初始化时加载数据
  onMounted(async () => {
    // 统计数据暂时使用默认值，后续接入接口
    // await fetchStatsData();

    // 加载默认tab数据
    await fetchListData(currentTab.value);
  });

  // 点击标题打开应急管理抽屉
  const handleOpenEmergencyDrawer = () => {
    if (openDrawer) {
      openDrawer('emergency-management', '应急管理');
    }
  };
</script>

<style scoped lang="less">
  .content-left {
    position: absolute;
    top: 0;
    left: 0;
    width: 700px;
    min-width: 440px;
    height: 100%;
    overflow: hidden;
    pointer-events: all;

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
        background: linear-gradient(
          90deg,
          #0c2249 0%,
          rgb(65 106 146 / 69%) 97%
        );
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
            display: flex;
            gap: 12px;
            justify-content: space-between;
            margin-bottom: 20px;
          }

          .item-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start; // 改为从顶部开始排列
            width: 134px;
            height: 126px;
            padding: 20px 8px 12px; // 增加顶部内边距
            background: linear-gradient(
              0deg,
              rgb(0 11 47 / 24%) 0%,
              rgb(1 12 47 / 0%) 94%
            );
            border: none; // 移除边框
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
                margin-bottom: 8px; // 增加数值和标签之间的距离
                color: #fff;
                font-weight: normal; // 设置字重为normal
                font-size: 24px; // 设置数值字体大小为24px
                font-family: PangMenZhengDao; // 设置字体族
                line-height: normal;
                letter-spacing: 0;
              }

              .item-label {
                color: rgb(255 255 255 / 80%);
                font-weight: normal;
                font-size: 16px; // 设置标签字体大小为16px
                line-height: normal;
                text-align: center;
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
              background: rgb(10 30 60 / 40%);
              border: 1px solid rgb(23 150 250 / 20%);
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
              margin-bottom: 8px;
              padding: 10px 16px;
              background: rgb(10 30 60 / 40%);
              border: 1px solid rgb(23 150 250 / 20%);
              border-radius: 4px;

              .team-name {
                flex: 1;
                color: #fff;
                font-weight: 400;
                font-size: 13px;
              }

              .team-icon {
                width: 24px;
                height: 24px;
                margin-left: 12px;

                img {
                  width: 100%;
                  height: 100%;
                  object-fit: contain;
                }
              }
            }

            .no-data {
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100px;
              color: rgb(255 255 255 / 50%);
              font-size: 14px;
            }

            .loading-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 200px;

              .loading-spinner {
                display: flex;
                gap: 8px;
                margin-bottom: 16px;

                .spinner-item {
                  width: 8px;
                  height: 8px;
                  background: rgb(23 150 250 / 80%);
                  border-radius: 50%;
                  animation: loading-bounce 1.4s ease-in-out infinite both;

                  &:nth-child(1) {
                    animation-delay: -0.32s;
                  }

                  &:nth-child(2) {
                    animation-delay: -0.16s;
                  }
                }
              }

              .loading-text {
                color: rgb(255 255 255 / 80%);
                font-size: 14px;
              }
            }
          }
        }
      }
    }
  }

  @keyframes loading-bounce {
    0%,
    80%,
    100% {
      transform: scale(0.8);
      opacity: 0.5;
    }

    40% {
      transform: scale(1.2);
      opacity: 1;
    }
  }
</style>
