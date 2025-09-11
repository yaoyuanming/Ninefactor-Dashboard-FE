<template>
  <div class="alarm-detail-container">
    <!-- 头部导航栏 -->
    <div class="header-bar">
      <div class="header-content">
        <div class="header-left">
          <el-button @click="goBack" type="text" class="back-btn">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
          <h2 class="page-title">报警详情</h2>
        </div>
        <div class="header-right">
          <!-- 未消警状态显示消警处置按钮 -->
          <el-button 
            type="primary" 
            v-if="alarmDetails.alarmStatus === 0" 
            @click="goToProcessPage"
            class="process-btn"
          >
            <el-icon><Tools /></el-icon>
            消警处置
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="detail-container">
      <el-row :gutter="20">
        <!-- 左侧区域 -->
        <el-col :span="20">
          <!-- 报警信息卡片 -->
          <div class="info-card alarm-info-card">
            <div class="card-header">
              <div class="header-icon">
                <el-icon><Warning /></el-icon>
              </div>
              <h3>报警信息</h3>
            </div>
            <div class="card-content">
              <div class="info-grid">
                <!-- <div class="info-item">
                  <label>报警编码</label>
                  <span class="value">{{ alarmDetails.alarmCode }}</span>
                </div> -->
                <div class="info-item">
                  <label>报警位置</label>
                  <span class="value">{{ alarmDetails.alarmPosition }}</span>
                </div>
                <div class="info-item">
                  <label>报警时间</label>
                  <span class="value">{{ formatDate(alarmDetails.warningDate) }}</span>
                </div>

                <div class="info-item">
                  <label>报警类型</label>
                  <span class="value">{{ getDictLabel(DICT_TYPE.MWS_ALARM_TYPE, alarmDetails.alarmType) }}</span>
                </div>
                <!-- <div class="info-item">
                  <label>报警等级</label>
                  <span class="value">  <el-tag 
                    :type="getAlarmGradeType(alarmDetails.alarmGrade)"
                    class="grade-tag"
                  >
                    {{ formatAlarmGrade(alarmDetails.alarmGrade) }}
                  </el-tag></span>
                
                </div> -->
                <div class="info-item">
                  <label>报警状态</label>
                  
                  <span class="value"><el-tag 
                    :type="alarmDetails.alarmStatus === 0 ? 'danger' : 'success'"
                    class="status-tag"
                  >
                    {{ formatAlarmStatus(alarmDetails.alarmStatus) }}
                  </el-tag></span>
                </div>
                <!-- <div class="info-item">
                  <label>报警事件</label>
                  <span class="value">{{ alarmDetails.alarmTypeName }}</span>
                </div> -->
                <div class="info-item">
                  <label>报警设备类型</label>
                  <span class="value">摄像头</span>
                </div>
                <!-- <div class="info-item">
                  <label>门店编号</label>
                  <span class="value">{{ alarmDetails.storeNum || '--' }}</span>
                </div>
                <div class="info-item">
                  <label>库房编号</label>
                  <span class="value">{{ alarmDetails.storeroomNum || '--' }}</span>
                </div> -->
                <!-- <div class="info-item">
                  <label>所属组织编码</label>
                  <span class="value">{{ alarmDetails.orgCode }}</span>
                </div> -->
                <!-- <div class="info-item">
                  <label>报警通道名称</label>
                  <span class="value">{{ alarmDetails.alarmPosition }}</span>
                </div> -->
               
               
              </div>
              
              <!-- 报警图片区域 -->
              <div class="images-section">
                <h4>报警图片</h4>
                <div class="alarm-images">
                  <template v-if="alarmDetails.alarmFile && alarmDetails.alarmFile.trim() !== ''">
                    <div 
                      v-for="(img, index) in alarmDetails.alarmFile.split(',').filter(Boolean)" 
                      :key="index" 
                      class="image-wrapper"
                      @click="previewImage(img)"
                    >
                      <img 
                        :src="img" 
                        alt="报警图片" 
                        class="alarm-image-item" 
                      />
                      <div class="image-overlay">
                        <el-icon><ZoomIn /></el-icon>
                      </div>
                    </div>
                  </template>
                  <div v-else class="no-images">
                    <el-icon><Picture /></el-icon>
                    <span>暂无图片</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 已消警状态：显示处置信息 -->
          <div v-if="alarmDetails.alarmStatus === 2" class="info-card processed-info-card">
            <div class="card-header">
              <div class="header-icon">
                <el-icon><Check /></el-icon>
              </div>
              <h3>处置信息</h3>
            </div>
            <div class="card-content">
              <div class="info-grid">
                <div class="info-item">
                  <label>处置时间</label>
                  <span class="value">{{ formatDate(alarmDetails.clearDate) }}</span>
                </div>
                <div class="info-item">
                  <label>处置人员</label>
                  <span class="value">{{ alarmDetails.handleUser }}</span>
                </div>
                <div class="info-item">
                  <label>处理类型</label>
                  <span class="value">
                    {{ getHandleTypeLabel(alarmDetails.handleType) }}
                  </span>
                </div>
                <div class="info-item full-width">
                  <label>处理内容</label>
                  <div class="message-content">{{ alarmDetails.handleMessage || '--' }}</div>
                </div>
              </div>
              
              <!-- 处置后图片区域 -->
              <div class="images-section">
                <h4>处置后图片</h4>
                <div class="processed-images">
                  <template v-if="alarmDetails.handlePictures">
                    <div 
                      v-for="(img, index) in alarmDetails.handlePictures.split(',').filter(Boolean)" 
                      :key="index" 
                      class="image-wrapper"
                      @click="previewImage(img)"
                    >
                      <img 
                        :src="img" 
                        alt="处置后图片" 
                        class="alarm-image-item" 
                      />
                      <div class="image-overlay">
                        <el-icon><ZoomIn /></el-icon>
                      </div>
                    </div>
                  </template>
                  <div v-else class="no-images">
                    <el-icon><Picture /></el-icon>
                    <span>暂无图片</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-col>

        <!-- 右侧区域 - 处置过程时间线 -->
        <el-col :span="4">
          <div class="timeline-card">
            <div class="card-header">
              <div class="header-icon">
                <el-icon><Clock /></el-icon>
              </div>
              <h3>处置过程</h3>
            </div>
            <div class="timeline-content">
              <el-timeline>
                <!-- 报警产生 -->
                <el-timeline-item
                  placement="bottom"
                  color="#ff6b6b"
                  class="timeline-item"
                >
                  <div class="custom-timeline-content">
                    <div class="activity-title">检测到报警</div>
                    <div class="activity-datetime">
                      <span>{{ formatDate(alarmDetails.warningDate).split(' ')[0] }}</span>
                      <span>{{ formatDate(alarmDetails.warningDate).split(' ')[1] }}</span>
                    </div>
                  </div>
                </el-timeline-item>
                
                <!-- 处置过程（如果有处置信息） -->
                <el-timeline-item
                  v-if="alarmDetails.alarmStatus === 2 && alarmDetails.handleUser"
                  placement="bottom"
                  color="#2ed573"
                  class="timeline-item"
                >
                  <div class="custom-timeline-content">
                    <div class="activity-title">报警已处置</div>
                    <div v-if="alarmDetails.clearDate" class="activity-datetime">
                      <span>{{ formatDate(alarmDetails.clearDate).split(' ')[0] }}</span>
                      <span>{{ formatDate(alarmDetails.clearDate).split(' ')[1] }}</span>
                    </div>
                    <div class="activity-details">
                      <span>处置人: {{ alarmDetails.handleUser }}</span>
                      <span v-if="alarmDetails.handleType">处理类型: {{ getHandleTypeLabel(alarmDetails.handleType) }}</span>
                    </div>
                  </div>
                </el-timeline-item>
                
                <!-- 未处置状态 -->
                <el-timeline-item
                  v-if="alarmDetails.alarmStatus === 0"
                  placement="bottom"
                  color="#ffa726"
                  class="timeline-item"
                >
                   <div class="custom-timeline-content">
                    <div class="activity-title">等待处置</div>
                    <div class="activity-details">
                      <span>状态: 未消警</span>
                    </div>
                  </div>
                </el-timeline-item>
              </el-timeline>
              
              <!-- 处置状态说明 -->
              <div class="status-summary">
                <div class="summary-item">
                  <span class="summary-label">当前状态:</span>
                  <el-tag 
                    :type="alarmDetails.alarmStatus === 0 ? 'danger' : 'success'"
                    class="status-tag"
                  >
                    {{ formatAlarmStatus(alarmDetails.alarmStatus) }}
                  </el-tag>
                </div>
                <div v-if="alarmDetails.alarmStatus === 2" class="summary-item">
                  <span class="summary-label">处置时长:</span>
                  <span class="summary-value">{{ calculateProcessDuration() }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 图片预览对话框 -->
    <!-- <el-dialog v-model="imagePreviewVisible" title="图片预览" width="60%" center>
      <div class="image-preview">
        <img :src="previewImageUrl" alt="预览图片" class="preview-image" />
      </div>
    </el-dialog> -->
    <el-image-viewer
      v-if="imagePreviewVisible"
      :url-list="[previewImageUrl]"
      @close="imagePreviewVisible = false"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  ArrowLeft, 
  Tools, 
  Warning, 
  Check, 
  Clock, 
  ZoomIn, 
  Picture, 
  InfoFilled 
} from '@element-plus/icons-vue';
import { getDictLabel, DICT_TYPE, getDictOptions, DictDataType } from '@/utils/dict'

// 引入报警记录详情接口
import { getAlarmDetail } from '@/api/monitoring/record/alarmrecord/index';

const route = useRoute();
const router = useRouter();
const alarmId = ref(route.params.id as string);

// 图片预览相关
const imagePreviewVisible = ref(false);
const previewImageUrl = ref('');

// 定义报警详情接口响应类型
interface AlarmDetailResponse {
  id: string;
  alarmCode: string;
  companyCode: string;
  storeNum: string | null;
  storeroomNum: string | null;
  alarmStatus: number;
  deviceCode: string;
  alarmFile: string;
  alarmType: number;
  alarmPosition: string;
  alarmTypeName: string;
  orgCode: string;
  warningDate: number;
  orgName: string;
  linkNames: string;
  alarmGrade: number;
  taskWebName: string;
  alarmWebUrl: string;
  alarmAppUrl: string;
  taskWebUrl: string;
  taskAppUrl: string;
  handleUser: string | null;
  handlePictures: string | null;
  clearDate: number | null;
  handleType: string | null;
  handleMessage: string | null;
  compId: number;
}

// 报警详情数据
const alarmDetails = ref<AlarmDetailResponse>({
  id: '',
  alarmCode: '-',
  companyCode: '-',
  storeNum: null,
  storeroomNum: null,
  alarmStatus: 0,
  deviceCode: '-',
  alarmFile: '',
  alarmType: 0,
  alarmPosition: '-',
  alarmTypeName: '-',
  orgCode: '-',
  warningDate: 0,
  orgName: '-',
  linkNames: '-',
  alarmGrade: 0,
  taskWebName: '-',
  alarmWebUrl: '-',
  alarmAppUrl: '-',
  taskWebUrl: '-',
  taskAppUrl: '-',
  handleUser: null,
  handlePictures: null,
  clearDate: null,
  handleType: null,
  handleMessage: null,
  compId: 0,
});

// 返回按钮逻辑
const goBack = () => {
  router.back();
};

// 跳转到消警处置页面
const goToProcessPage = () => {
  if (alarmId.value) {
    router.push({ path: `/monitoring/record/process/${alarmId.value}` });
  } else {
    console.error('报警记录缺少ID，无法跳转到消警处置页面');
  }
};

// 图片预览功能
const previewImage = (imageUrl: string) => {
  previewImageUrl.value = imageUrl;
  imagePreviewVisible.value = true;
};

// 获取报警等级对应的标签类型
const getAlarmGradeType = (grade: number) => {
  switch (grade) {
    case 1: return 'danger';
    case 2: return 'warning';
    case 3: return 'info';
    default: return 'info';
  }
};

// 获取报警详情数据
const fetchAlarmDetail = async () => {
  if (!alarmId.value) {
    console.error('缺少报警ID，无法获取详情');
    return;
  }

  try {
    const res = await getAlarmDetail(alarmId.value);

    if (res) {
      Object.assign(alarmDetails.value, {
        id: res.id || '',
        alarmCode: res.alarmCode || '-',
        companyCode: res.companyCode || '-',
        storeNum: res.storeNum || null,
        storeroomNum: res.storeroomNum || null,
        alarmStatus: res.alarmStatus !== undefined ? res.alarmStatus : 0,
        deviceCode: res.deviceCode || '-',
        alarmFile: res.alarmFile || '',
        alarmType: res.alarmType || 0,
        alarmPosition: res.alarmPosition || '-',
        alarmTypeName: res.alarmTypeName || '-',
        orgCode: res.orgCode || '-',
        warningDate: res.warningDate || 0,
        orgName: res.orgName || '-',
        linkNames: res.linkNames || '-',
        alarmGrade: res.alarmGrade || 0,
        taskWebName: res.taskWebName || '-',
        alarmWebUrl: res.alarmWebUrl || '-',
        alarmAppUrl: res.alarmAppUrl || '-',
        taskWebUrl: res.taskWebUrl || '-',
        taskAppUrl: res.taskAppUrl || '-',
        handleUser: res.handleUser || null,
        handlePictures: res.handlePictures || null,
        clearDate: res.clearDate || null,
        handleType: res.handleType || null,
        handleMessage: res.handleMessage || null,
        compId: res.compId || 0,
      });
    } else {
      console.warn('获取报警详情接口返回空数据', res);
    }
  } catch (error) {
    console.error('获取报警详情失败:', error);
  }
};

// 格式化日期
const formatDate = (timestamp: number | string | null) => {
  if (!timestamp) return '--';
  const date = new Date(Number(timestamp));
  if (isNaN(date.getTime())) return '--';
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 格式化报警状态
const formatAlarmStatus = (status: number) => {
  switch (status) {
    case 0: return '未消警';
    case 2: return '已消警';
    default: return '未知';
  }
};

// 格式化报警等级
const formatAlarmGrade = (grade: number) => {
  switch (grade) {
    case 1: return '严重';
    case 2: return '一般';
    case 3: return '轻微';
    default: return '未知';
  }
};

// 获取处理类型字典选项
const alarmHandleTypeOptions = ref<DictDataType[]>([]);
onMounted(async () => {
  alarmHandleTypeOptions.value = await getDictOptions(DICT_TYPE.MWS_ALARM_HANDLE_TYPE);
  console.log('报警详情页 - 接收到ID:', alarmId.value);
  fetchAlarmDetail();
});

// 字典映射函数
const getHandleTypeLabel = (value: string | number) => {
  const found = alarmHandleTypeOptions.value.find(item => item.value == value);
  return found ? found.label : value;
};

// 计算处置过程时长
const calculateProcessDuration = () => {
  if (alarmDetails.value.clearDate && alarmDetails.value.warningDate) {
    const clearTime = new Date(Number(alarmDetails.value.clearDate)).getTime();
    const warningTime = new Date(Number(alarmDetails.value.warningDate)).getTime();
    const duration = clearTime - warningTime;
    const minutes = Math.floor(duration / (1000 * 60));
    return `${minutes}分钟`;
  }
  return '--';
};
</script>

<style scoped>


/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (width <= 1200px) {
  .info-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

@media (width <= 768px) {
  .detail-container {
    padding: 16px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .alarm-images,
  .processed-images {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}

.alarm-detail-container {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  flex-direction: column;
}

/* 头部样式 */
.header-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 16px 24px;
  background: white;
  box-shadow: 0 2px 12px rgb(0 0 0 / 10%);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #606266;
  transition: all 0.3s ease;
}

.back-btn:hover {
  color: #409eff;
  transform: translateX(-2px);
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.process-btn {
  display: flex;
  padding: 10px 20px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
  align-items: center;
  gap: 6px;
}

.process-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgb(64 158 255 / 30%);
}

/* 主要内容区域 */
.detail-container {
  width: 100%;
  max-width: 1400px;
  padding: 24px;
  margin: 0 auto;
  flex: 1;
}

/* 卡片通用样式 */
.info-card {
  margin-bottom: 20px;
  overflow: hidden;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgb(0 0 0 / 8%);
  transition: all 0.3s ease;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgb(0 0 0 / 12%);
}

.card-header {
  display: flex;
  padding: 20px 24px;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  align-items: center;
  gap: 12px;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.header-icon {
  display: flex;
  width: 32px;
  height: 32px;
  font-size: 16px;
  background: rgb(255 255 255 / 20%);
  border-radius: 8px;
  align-items: center;
  justify-content: center;
}

/* 报警信息卡片特殊样式 */
.alarm-info-card .card-header {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
}

/* 处置信息卡片特殊样式 */
.processed-info-card .card-header {
  background: linear-gradient(135deg, #2ed573 0%, #1e90ff 100%);
}

.card-content {
  padding: 24px;
}

/* 信息网格布局 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item label {
  font-size: 14px;
  font-weight: 500;
  color: #909399;
}

.info-item .value {
  padding: 8px 12px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  background: #f8f9fa;
  border-left: 4px solid #409eff;
  border-radius: 6px;
}

/* 标签样式 */
.status-tag,
.grade-tag,
.handle-type-tag {
  padding: 6px 12px;
  font-weight: 500;
  border-radius: 6px;
}

/* 消息内容样式 */
.message-content {
  min-height: 60px;
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.6;
  color: #303133;
  white-space: pre-wrap;
  background: #f8f9fa;
  border-left: 4px solid #67c23a;
  border-radius: 8px;
}

/* 图片区域样式 */
.images-section {
  padding-top: 24px;
  margin-top: 24px;
  border-top: 1px solid #ebeef5;
}

.images-section h4 {
  display: flex;
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  align-items: center;
  gap: 8px;
}

.alarm-images,
.processed-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
}

.image-wrapper {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.image-wrapper:hover {
  transform: scale(1.05);
}

.alarm-image-item {
  display: block;
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  font-size: 20px;
  color: white;
  background: rgb(0 0 0 / 50%);
  opacity: 0;
  transition: opacity 0.3s ease;
  align-items: center;
  justify-content: center;
}

.image-wrapper:hover .image-overlay {
  opacity: 1;
}

.no-images {
  display: flex;
  height: 120px;
  color: #909399;
  background: #f8f9fa;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.no-images .el-icon {
  font-size: 24px;
}

/* 时间线卡片样式 */
.timeline-card {
  position: sticky;
  top: 100px;
  height: fit-content;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgb(0 0 0 / 8%);
}

.timeline-card .card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.timeline-content {
  padding: 24px;
}

.timeline-item {
  padding-bottom: 20px;
}

.timeline-content .activity-text {
  margin-bottom: 4px;
  font-weight: 500;
  color: #303133;
}

.timeline-content .activity-operator {
  font-size: 12px;
  color: #909399;
}

.timeline-content .activity-time {
  font-size: 12px;
  color: #909399;
}

.timeline-content .activity-type {
  font-size: 12px;
  color: #909399;
}

.timeline-content .activity-status {
  font-size: 12px;
  color: #909399;
}

.status-summary {
  padding-top: 24px;
  margin-top: 24px;
  border-top: 1px solid #ebeef5;
}

.summary-item {
  margin-bottom: 12px;
}

.summary-label {
  font-size: 14px;
  font-weight: 500;
  color: #909399;
}

.summary-value {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

/* 图片预览对话框样式 */
.image-preview {
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 8px;
}

.info-card {
  animation: fadeInUp 0.6s ease-out;
}

.info-card:nth-child(2) {
  animation-delay: 0.1s;
}

.info-card:nth-child(3) {
  animation-delay: 0.2s;
}

:deep(.el-timeline-item__timestamp.is-bottom) {
  margin-top: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #909399;
}

.custom-timeline-content {
  padding: 10px 12px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.timeline-item:hover .custom-timeline-content {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgb(0 0 0 / 5%);
}

.activity-title {
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #343a40;
}

.activity-datetime span,
.activity-details span {
  display: block;
  font-size: 12px;
  line-height: 1.5;
  color: #6c757d;
}

.activity-details {
  margin-top: 8px;
}

.timeline-content .activity-operator,
.timeline-content .activity-time,
.timeline-content .activity-type,
.timeline-content .activity-status {
  font-size: 12px;
  color: #909399;
}
</style> 