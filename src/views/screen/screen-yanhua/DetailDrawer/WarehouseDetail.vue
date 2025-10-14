<template>
  <div class="warehouse-detail">
    <div class="detail-section">
      <div class="section-title">基本信息</div>
      <div class="detail-grid">
        <div v-for="item in basicInfo" :key="item.label" class="detail-item">
          <span class="item-label">{{ item.label }}</span>
          <span class="item-value">{{ item.value }}</span>
        </div>
      </div>
    </div>

    <div v-if="detailInfo.length > 0" class="detail-section">
      <div class="section-title">详细信息</div>
      <div class="detail-grid">
        <div
          v-for="item in detailInfo"
          :key="item.label"
          class="detail-item full-width"
        >
          <span class="item-label">{{ item.label }}</span>
          <span class="item-value">{{ item.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';

  const props = defineProps<{
    data?: any;
  }>();

  const basicInfo = computed(() => {
    const data = props.data || {};
    return [
      { label: '仓库名称', value: data.name || '-' },
      { label: '仓库编号', value: data.code || '-' },
      { label: '所属企业', value: data.company || '-' },
      { label: '仓库类型', value: data.type || '-' },
      { label: '危险等级', value: data.dangerLevel || '-' },
      { label: '存储容量', value: data.capacity || '-' },
      { label: '负责人', value: data.manager || '-' },
      { label: '联系电话', value: data.phone || '-' },
      { label: '建筑面积', value: data.area || '-' },
      { label: '启用日期', value: data.startDate || '-' },
      { label: '安全等级', value: data.safetyLevel || '-' },
    ];
  });

  const detailInfo = computed(() => {
    const data = props.data || {};
    const items = [];

    if (data.address) {
      items.push({ label: '仓库地址', value: data.address });
    }

    return items;
  });
</script>

<style scoped lang="less">
  .warehouse-detail {
    .detail-section {
      margin-bottom: 30px;

      &:last-child {
        margin-bottom: 0;
      }

      .section-title {
        margin-bottom: 20px;
        padding-bottom: 10px;
        color: #1796fa;
        font-weight: 600;
        font-size: 16px;
        border-bottom: 1px solid rgb(23 150 250 / 20%);
      }

      .detail-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px 40px;

        .detail-item {
          display: flex;
          align-items: flex-start;
          padding: 12px 16px;
          line-height: 1.8;
          background: rgb(23 150 250 / 5%);
          border-left: 3px solid rgb(23 150 250 / 30%);
          border-radius: 6px;
          transition: all 0.3s;

          &:hover {
            background: rgb(23 150 250 / 10%);
            border-left-color: #1796fa;
          }

          &.full-width {
            flex-direction: column;
            grid-column: 1 / -1;
            align-items: stretch;

            .item-label {
              margin-bottom: 8px;
            }

            .item-value {
              padding-left: 0;
            }
          }

          .item-label {
            flex-shrink: 0;
            min-width: 140px;
            color: rgb(255 255 255 / 70%);
            font-weight: 500;
            font-size: 14px;
          }

          .item-value {
            flex: 1;
            padding-left: 16px;
            color: rgb(255 255 255 / 95%);
            font-size: 14px;
            word-break: break-all;
          }
        }
      }
    }
  }
</style>
