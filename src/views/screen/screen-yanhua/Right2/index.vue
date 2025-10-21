<template>
  <div class="right2-container">
    <div class="filter-panel">
      <div class="filter-content">
        <div class="filter-item">
          <a-checkbox v-model="filterTypes.govt" @change="handleFilterChange">
            <span class="filter-label">
              <span>企业</span>
              <img :src="govtIcon" class="filter-icon" alt="企业" />
            </span>
          </a-checkbox>
        </div>
        <div class="filter-item">
          <a-checkbox v-model="filterTypes.rescue" @change="handleFilterChange">
            <span class="filter-label">
              <span>救援队</span>
              <img :src="rescueIcon" class="filter-icon" alt="救援队" />
            </span>
          </a-checkbox>
        </div>
        <div class="filter-item">
          <a-checkbox
            v-model="filterTypes.medical"
            @change="handleFilterChange"
          >
            <span class="filter-label">
              <span>医疗机构</span>
              <img :src="medicalIcon" class="filter-icon" alt="医疗机构" />
            </span>
          </a-checkbox>
        </div>
        <div class="filter-item">
          <a-checkbox
            v-model="filterTypes.supplies"
            @change="handleFilterChange"
          >
            <span class="filter-label">
              <span>应急物资</span>
              <img :src="suppliesIcon" class="filter-icon" alt="应急物资" />
            </span>
          </a-checkbox>
        </div>
        <div class="filter-item">
          <a-checkbox
            v-model="filterTypes.equipment"
            @change="handleFilterChange"
          >
            <span class="filter-label">
              <span>应急装备</span>
              <img :src="equipmentIcon" class="filter-icon" alt="应急装备" />
            </span>
          </a-checkbox>
        </div>
        <div class="filter-item">
          <a-checkbox
            v-model="filterTypes.accident"
            @change="handleFilterChange"
          >
            <span class="filter-label">
              <span>事故后果</span>
              <img :src="accidentIcon" class="filter-icon" alt="事故后果" />
            </span>
          </a-checkbox>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  // 导入图标
  import equipmentIcon from '@/assets/screen/emergency/icon-equipment.png';
  import govtIcon from '@/assets/screen/emergency/icon-govt.png';
  import medicalIcon from '@/assets/screen/emergency/icon-medical.png';
  import rescueIcon from '@/assets/screen/emergency/icon-rescue.png';
  import suppliesIcon from '@/assets/screen/emergency/icon-supplies.png';
  import accidentIcon from '@/assets/screen/emergency/icon-accident.png';

  // 定义事件
  const emit = defineEmits(['filterChange']);

  // 筛选类型（默认勾选前三项）
  const filterTypes = ref({
    govt: true, // 企业 - 默认勾选
    rescue: true, // 救援队 - 默认勾选
    medical: true, // 医疗机构 - 默认勾选
    supplies: false, // 应急物资
    equipment: false, // 应急装备
    accident: false, // 事故后果
  });

  // 处理筛选变化
  const handleFilterChange = () => {
    emit('filterChange', { ...filterTypes.value });
  };

  // 暴露方法供外部调用
  defineExpose({
    getFilterTypes: () => filterTypes.value,
    setFilterTypes: (types: Record<string, boolean>) => {
      filterTypes.value = { ...types };
    },
  });
</script>

<style scoped lang="less">
  .right2-container {
    position: absolute;
    top: 38%; // 再往上移动一点 (从45%改为40%)
    right: 100px; // 往中间移动一点 (从50px改为120px)
    z-index: 100;
    transform: translateY(-50%);
    pointer-events: auto;

    .filter-panel {
      display: flex;
      flex-direction: column;
      width: 276px; // 设置宽度为276px
      height: 407px; // 设置高度为407px
      padding: 20px 25px;
      background: rgb(11 36 62 / 75%);
      border: 1px solid rgb(155 204 255 / 20%);
      border-radius: 4px;
      backdrop-filter: blur(10px);

      .filter-content {
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: 24px; // 增加间距，让布局更舒适
        justify-content: center; // 垂直居中内容
      }

      .filter-item {
        display: flex;
        justify-content: flex-start; // 改为左对齐
        width: 100%;
        padding: 0 40px; // 添加左右内边距

        :deep(.arco-checkbox) {
          width: 150px; // 固定宽度，确保对齐

          .arco-checkbox-icon {
            width: 20px; // 增大复选框尺寸
            height: 20px; // 增大复选框尺寸
            background: transparent !important;
            border-color: rgb(155 204 255 / 50%);
            border-radius: 2px;

            &::before {
              display: none !important;
            }

            &::after {
              top: 2px !important;
              left: 5px !important;
              width: 5px !important;
              height: 9px !important;
              border-color: #fff !important;
              opacity: 0 !important;
            }
          }

          &.arco-checkbox-checked .arco-checkbox-icon {
            background: #1890ff !important;
            border-color: #1890ff;

            &::after {
              opacity: 1 !important;
            }
          }
        }

        .filter-label {
          display: flex;
          align-items: center;
          justify-content: space-between; // 两端对齐
          width: 100%; // 占满整个宽度
          color: rgb(255 255 255 / 85%);
          font-size: 16px; // 增大字体
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            color: #1890ff;

            .filter-icon {
              opacity: 1;
            }
          }

          .filter-icon {
            flex-shrink: 0; // 防止图标缩小
            width: 24px; // 增大图标尺寸
            height: 24px; // 增大图标尺寸
            object-fit: contain;
            opacity: 0.7;
            transition: opacity 0.3s;
          }

          span {
            min-width: 80px; // 设置最小宽度确保文字对齐
            white-space: nowrap; // 防止文字换行
            text-align: left; // 文字左对齐
          }
        }
      }
    }
  }
</style>
