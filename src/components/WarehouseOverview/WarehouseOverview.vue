<template>
  <div class="warehouse-overview-container">
    <!-- 库区概况数据展示区域 -->
    <div class="overview-cards-container">

      <!-- 库区面积和核定药量 -->
      <div class="overview-area">
        <div class="overview-item-bordered">
          <div class="overview-label">库区面积 <el-icon class="edit-icon" @click="handleAreaClick"><Edit /></el-icon></div>
          <div class="overview-value">{{ overviewData.totalArea }} <span class="overview-unit">m²</span></div>
        </div>
        <div class="overview-item">
          <div class="overview-label">核定药量</div>
          <div class="overview-value">
            {{ overviewData.totalDosage }}
            <div class="overview-unit">千克</div>
          </div>
        </div>
      </div>

      <!-- 仓库数量、仓库面积、库房概况 -->
      <div class="warehouse-overview-card">
        <div class="warehouse-item-bordered warehouse-item-large-padding">
          <div class="warehouse-label">仓库数量</div>
          <div class="warehouse-value">{{ overviewData.storeCount }} 个</div>
        </div>
        <div class="warehouse-item-bordered warehouse-item-large-padding">
          <div class="warehouse-label">仓库面积</div>
          <div class="warehouse-value">{{ overviewData.storeTotalArea }} m²</div>
        </div>
        <div class="warehouse-summary-container warehouse-item-large-padding">
           <div class="warehouse-summary-item" v-for="item in overviewData.storeType" :key="item.typeName">
             <div class="warehouse-summary-label" :class="getWarehouseLevelClass(item.typeName)">{{ item.typeName }}</div>
             <div class="warehouse-summary-value" :class="getWarehouseLevelClass(item.typeName)">{{ item.count }}个<br/>{{ item.area }} m²</div>
           </div>
        </div>
      </div>

      <!-- 新增：库房数量、库房面积、各级库房概况 -->
      <div class="new-warehouse-overview-card">
        <div class="overview-item-bordered overview-item-small-padding">
          <div class="overview-label-small">库房数量</div>
          <div class="overview-value-large">
            {{ overviewData.roomCount }} 个
          </div>
        </div>
        <div class="overview-item-bordered overview-item-small-padding">
          <div class="overview-label-small">库房面积</div>
          <div class="overview-value-large">{{ overviewData.roomTotalArea }} m²</div>
        </div>
        <!-- 新增：各级库房概况的汇总容器 -->
        <div class="warehouse-summary-container">
           <div class="overview-item-small-padding" v-for="item in overviewData.roomType" :key="item.typeName">
             <div class="overview-label-medium" :class="getWarehouseLevelClass(item.typeName)">{{ item.typeName }}</div>
             <div class="overview-value-small" :class="getWarehouseLevelClass(item.typeName)">{{ item.count }}个<br/>{{ item.area }} m²</div>
           </div>
        </div>
      </div>

    </div>
  </div>
  <!-- 修改面积的弹出框 -->
  <el-dialog
    v-model="dialogVisible"
    title="库区面积编辑"
    width="30%"
    :before-close="handleCloseDialog"
  >
    <el-form :model="updateAreaForm" ref="updateAreaFormRef" :rules="updateAreaRules" label-width="100px">
      <el-form-item label="库区面积" prop="reservoirArea">
        <el-input v-model.number="updateAreaForm.reservoirArea" type="number" placeholder="请输入新面积" clearable>
          <template #append>m²</template>
        </el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="() => { handleCloseDialog(); }">取消</el-button>
        <el-button type="primary" @click="submitAreaUpdate">
          保存
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { ElIcon, ElMessage, ElDialog, ElForm, ElFormItem, ElInput, ElButton, ElMessageBox } from 'element-plus';
import { Top, Edit } from '@element-plus/icons-vue';
import { getCompanyReservoirInfo, CompanyReservoirInfoVO, RoomOrStoreTypeData, updateCompanyReservoirArea, CompanyReservoirAreaInfoSaveReqVO } from '@/api/monitoring/warehouseinfo/index';
import type { FormInstance, FormRules } from 'element-plus'; // 导入 FormInstance 和 FormRules 类型

// 定义库区概况数据对象，初始化默认值
const overviewData = reactive<CompanyReservoirInfoVO>({
  totalArea: 0,
  totalDosage: 0,
  storeCount: 0,
  storeTotalArea: 0,
  roomCount: 0,
  roomTotalArea: 0,
  roomType: [], // 初始化为空数组
  storeType: [], // 初始化为空数组
});

// 控制修改面积对话框显示
const dialogVisible = ref(false);

// 修改面积表单数据和校验规则
const updateAreaForm = reactive({
  reservoirArea: 0, // 新面积
});

const updateAreaFormRef = ref<FormInstance | null>(null);

const updateAreaRules = reactive<FormRules> ({
  reservoirArea: [
    { required: true, message: '请输入新库区面积', trigger: 'blur' },
    { type: 'number', message: '库区面积必须为数字', trigger: ['blur', 'change'] },
    { validator: (rule, value, callback) => {
        if (value !== null && value !== undefined && value >= 0) {
          callback();
        } else {
          callback(new Error('库区面积必须大于等于0'));
        }
      }, trigger: ['blur', 'change']
    }
  ],
});

// 点击库区面积处理函数
const handleAreaClick = () => {
  updateAreaForm.reservoirArea = overviewData.totalArea;
  dialogVisible.value = true; // 显示对话框
};

// 关闭对话框前处理 (主要用于 before-close)
const handleCloseDialog = (done?: () => void) => {
  // 重置表单校验状态
  if (updateAreaFormRef.value) {
    updateAreaFormRef.value.resetFields();
  }
  // 重置表单数据
  updateAreaForm.reservoirArea = 0;
  dialogVisible.value = false; // 隐藏对话框
  if (done && typeof done === 'function') {
    done();
  }
};

// 提交面积更新
const submitAreaUpdate = async () => {
  if (!updateAreaFormRef.value) {
    return;
  }
  await updateAreaFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 调用更新接口
        const params: CompanyReservoirAreaInfoSaveReqVO = {
          reservoirArea: updateAreaForm.reservoirArea,
        };
        await updateCompanyReservoirArea(params);
        ElMessage.success('库区面积更新成功！');
        dialogVisible.value = false; // 关闭对话框
        // 刷新库区概述数据
        await fetchOverviewData();
      } catch (error) {
        ElMessage.error('更新库区面积失败，请稍后再试。');
      }
    } else {
      console.log('表单校验失败');
    }
  });
};

// 获取库区概述数据函数
const fetchOverviewData = async () => {
  try {
    const response = await getCompanyReservoirInfo();
    if (response) { // 检查 response 是否存在
      Object.assign(overviewData, response);
    }
  } catch (error) {
    ElMessage.error('获取库区概述失败，请稍后再试。');
  }
};

// 在组件加载时获取库区概述数据
onMounted(() => {
  fetchOverviewData();
});

// 等级颜色映射方法
function getWarehouseLevelClass(typeName: string) {
  if (typeName === '1.1级库房') {
    return 'warehouse-level-11';
  } else if (typeName === '1.3级库房') {
    return 'warehouse-level-13';
  } else if (typeName === '无药库房') {
    return 'warehouse-level-none';
  } else {
    return 'warehouse-level-default';
  }
}

</script>

<style scoped>
.warehouse-overview-container {
  background-color: #fff;
  padding: 10px;
}

.overview-cards-container {
  margin-bottom: 10px;
  display: flex;
  gap: 8px;
}

.overview-area,
.warehouse-overview-card,
.new-warehouse-overview-card {
  flex: 1;
  padding: 5px;
  background-color: #f5f5f5;
  border-radius: 4px;
  display: flex;
}

.warehouse-overview-card {
  flex: 3; 
}

.new-warehouse-overview-card {
    flex: 3; 
    padding: 5px 0; 
}

.overview-item,
.overview-item-bordered {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  padding: 5px 10px;
}

.overview-item-bordered {
  border-right: 1px solid #ccc;
}

.overview-label {
  font-size: 12px;
  color: #606266;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-icon {
  margin-left: 5px;
  cursor: pointer;
  color: #409eff;
}

.overview-value {
  font-weight: bold;
  font-size: 14px;
  text-align: center;
  line-height: 1.1;
}

.overview-unit {
  font-size: 8px;
  color: #606266;
  margin-top: 2px;
}

.warehouse-item-bordered {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  border-right: 1px solid #ccc;
}

.warehouse-item-large-padding {
    padding: 5px 8px;
}

.warehouse-label {
  font-size: 11px;
  color: #606266;
  margin-bottom: 10px;
}

.warehouse-value {
  font-size: 14px;
  font-weight: bold;
}

.warehouse-summary-container {
    flex: 3; 
    display: flex;
    justify-content: space-around;
    text-align: center;
}

.warehouse-summary-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 5px 5px; 
}

.warehouse-summary-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

.warehouse-summary-value {
  font-size: 12px;
  font-weight: bold;
}

.warehouse-level-11 { color: #f5222d; }   /* 红色 */
.warehouse-level-13 { color: #e6a23c; }   /* 橙色 */
.warehouse-level-none { color: #67c23a; } /* 绿色 */
.warehouse-level-default { color: #606266; }

.overview-item-small-padding{
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 5px 2px;
}

.overview-label-small {
    font-size: 11px;
    color: #606266;
    margin-bottom: 10px;
}

.overview-value-large {
    font-size: 14px;
    font-weight: bold;
}

.overview-label-medium {
    font-size: 14px;
    color: #606266;
    margin-bottom: 4px;
}

.overview-value-small {
    font-size: 12px;
    font-weight: bold;
}

.arrow-up {
  color: #52c41a;
}
.arrow-down {
  color: #f5222d;
}

.overview-label-medium.warehouse-level-11,
.warehouse-summary-label.warehouse-level-11 { color: #f5222d !important; }
.overview-label-medium.warehouse-level-13,
.warehouse-summary-label.warehouse-level-13 { color: #e6a23c !important; }
.overview-label-medium.warehouse-level-none,
.warehouse-summary-label.warehouse-level-none { color: #67c23a !important; }

</style>

