<template>
  <div class="rescue-force-detail">
    <div class="detail-header">
      <a-button @click="emit('back')"> <icon-arrow-left />返回列表 </a-button>
      <div class="header-title">救援力量详情</div>
    </div>
    <a-spin :loading="loading" style="width: 100%">
      <div class="detail-content">
        <!-- 左侧：基本信息 -->
        <div class="left-section">
          <a-card title="基本信息" :bordered="false" class="info-card">
            <a-descriptions :column="1" bordered>
              <a-descriptions-item label="队伍名称">
                {{ detailData.teamName || '-' }}
              </a-descriptions-item>
              <a-descriptions-item label="主管单位">
                {{ detailData.supervisingUnit || '-' }}
              </a-descriptions-item>
              <a-descriptions-item label="人员数量">
                {{ detailData.teamSize ? `${detailData.teamSize} 人` : '-' }}
              </a-descriptions-item>
              <a-descriptions-item label="负责人">
                {{ detailData.teamLeader || '-' }}
              </a-descriptions-item>
              <a-descriptions-item label="联系电话">
                {{ detailData.contactPhone || '-' }}
              </a-descriptions-item>
              <a-descriptions-item label="所在区域">
                {{ detailData.areaNames || '-' }}
              </a-descriptions-item>
              <a-descriptions-item label="位置">
                {{ detailData.officeAddress || '-' }}
              </a-descriptions-item>
              <a-descriptions-item v-if="detailData.remark" label="备注">
                <div class="remark-content">{{ detailData.remark }}</div>
              </a-descriptions-item>
            </a-descriptions>
          </a-card>
        </div>

        <!-- 右侧：队伍图片 -->
        <div class="right-section">
          <a-card title="队伍图片" :bordered="false" class="info-card">
            <div class="image-container">
              <a-image
                v-if="detailData.images"
                :src="detailData.images"
                fit="cover"
                :preview="true"
              />
              <a-empty v-else description="暂无图片" />
            </div>
          </a-card>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import { getRescueTeam, type RescueTeamVO } from '@/api/emergency';

  const props = defineProps<{ data: RescueTeamVO }>();
  const emit = defineEmits<{ (e: 'back'): void }>();

  const detailData = ref<RescueTeamVO>({} as RescueTeamVO);
  const loading = ref(false);

  // 加载详情数据
  const loadDetail = async () => {
    if (!props.data?.id) return;

    loading.value = true;
    try {
      const res = await getRescueTeam(props.data.id);
      if (res.data) {
        detailData.value = res.data;
      }
    } catch (error) {
      console.error('获取救援力量详情失败:', error);
      Message.error('获取详情失败');
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    if (props.data) {
      detailData.value = props.data;
      loadDetail();
    }
  });
</script>

<style scoped lang="less">
  .rescue-force-detail {
    .detail-header {
      display: flex;
      gap: 16px;
      align-items: center;
      margin-bottom: 24px;

      .header-title {
        color: #fff;
        font-weight: 600;
        font-size: 20px;
      }
    }

    .detail-content {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 16px;
      min-height: 0;

      .left-section {
        overflow-y: auto;
      }

      .right-section {
        overflow-y: auto;
      }

      .info-card {
        background: transparent;

        :deep(.arco-card-header) {
          color: #fff;
          font-weight: 600;
          font-size: 16px;
          background: linear-gradient(
            90deg,
            rgb(23 150 250 / 25%),
            rgb(23 150 250 / 10%)
          );
          border-bottom: 1px solid rgb(23 150 250 / 40%);
        }

        :deep(.arco-card-body) {
          background: rgb(10 30 60 / 35%);
          border: 1px solid rgb(23 150 250 / 15%);
          border-top: none;
        }
      }

      :deep(.arco-descriptions) {
        background: transparent;

        .arco-descriptions-item-label {
          min-width: 120px;
          padding: 12px 16px;
          color: rgb(255 255 255 / 95%);
          font-weight: 500;
          font-size: 14px;
          background: rgb(23 150 250 / 20%);
          border-color: rgb(23 150 250 / 25%);
        }

        .arco-descriptions-item-value {
          padding: 12px 16px;
          color: rgb(255 255 255 / 90%);
          font-size: 14px;
          background: rgb(10 30 60 / 30%);
          border-color: rgb(23 150 250 / 15%);
        }
      }

      .remark-content {
        color: rgb(255 255 255 / 90%);
        font-size: 14px;
        line-height: 1.8;
      }

      .image-container {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 300px;

        :deep(.arco-image) {
          width: 100%;
          max-width: 100%;

          img {
            width: 100%;
            border-radius: 4px;
          }
        }

        :deep(.arco-empty) {
          color: rgb(255 255 255 / 50%);
        }
      }
    }
  }
</style>
