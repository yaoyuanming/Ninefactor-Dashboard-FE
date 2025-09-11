<template>
  <div class="alarm-process-container">
    <!-- 头部导航栏 -->
    <div class="header-bar">
      <div class="header-content">
        <div class="header-left">
          <el-button @click="goBack" type="text" class="back-btn">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
          <h2 class="page-title">消警处置</h2>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="submitProcess" class="save-btn" :loading="isSubmitting">
            <el-icon><Collection /></el-icon>
            保存
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="detail-container">
      <el-row :gutter="20">
        <!-- 左侧：报警信息 -->
        <el-col :span="10">
          <div class="info-card alarm-info-card">
            <div class="card-header">
              <div class="header-icon"><el-icon><Warning /></el-icon></div>
              <h3>报警信息</h3>
            </div>
            <div class="card-content">
              <div class="info-grid">
                <div class="info-item"><label>报警位置</label><span class="value">{{ alarmDetails.alarmPosition && alarmDetails.alarmPosition.trim() ? alarmDetails.alarmPosition : '--' }}</span></div>
                <!-- <div class="info-item"><label>报警编码</label><span class="value">{{ alarmDetails.alarmCode }}</span></div> -->
                <div class="info-item"><label>报警时间</label><span class="value">{{ formatDate(alarmDetails.warningDate) }}</span></div>
                <div class="info-item"><label>报警类型</label><span class="value">{{ getDictLabel(DICT_TYPE.MWS_ALARM_TYPE, alarmDetails.alarmType) }}</span></div>
                <!-- <div class="info-item"><label>报警事件</label><span class="value">{{ alarmDetails.alarmTypeName }}</span></div> -->
                <!-- <div class="info-item">
                  <label>报警等级</label>
                  <span class="value"> <el-tag :type="getAlarmGradeType(alarmDetails.alarmGrade)" class="grade-tag">{{ formatAlarmGrade(alarmDetails.alarmGrade) }}</el-tag></span>
                </div> -->
                 <div class="info-item">
                  <label>报警状态</label>
                  <span class="value">

                  <el-tag type="danger">{{ formatAlarmStatus(alarmDetails.alarmStatus) }}</el-tag></span>
                </div>
                <div class="info-item"><label>	
                  报警设备类型</label><span class="value">摄像头</span></div>
             
              </div>
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
                      <img :src="img" alt="" class="alarm-image-item" />
                      <div class="image-overlay">
                        <el-icon><ZoomIn /></el-icon>
                      </div>
                    </div>
                  </template>
                  <div v-else class="no-images"><el-icon><Picture /></el-icon><span>暂无图片</span></div>
                </div>
              </div>
            </div>
          </div>
        </el-col>

        <!-- 中间：报警处置 -->
        <el-col :span="10">
          <div class="info-card process-form-card">
            <div class="card-header">
              <div class="header-icon"><el-icon><EditPen /></el-icon></div>
              <h3>报警处置</h3>
            </div>
            <div class="card-content">
              <el-form :model="processForm" label-position="top" class="process-form">
                <el-form-item label="消警类型" required>
                  <el-radio-group v-model="processForm.handleType">
                    <el-radio-button
                      v-for="item in alarmHandleTypeOptions"
                      :key="item.value"
                      :label="item.value"
                    >{{ item.label }}</el-radio-button>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="处理内容" required>
                  <el-input v-model="processForm.handleMessage" type="textarea" placeholder="请输入处理情况的详细说明..." :rows="4" />
                </el-form-item>
                <el-form-item label="处理图片" required>
                  <el-upload
                    action="#"
                    list-type="picture-card"
                    v-model:file-list="fileList"
                    :http-request="handleUpload"
                    :on-preview="handlePictureCardPreview"
                    :before-upload="beforeUpload"
                    :limit="3"
                    :on-exceed="handleExceed"
                    multiple
                    :disabled="fileList.length >= 3"
                  >
                      <el-icon><Plus /></el-icon>
                    <template #tip>
                      <div class="el-upload__tip">
                        只能上传jpg/png文件，且不超过5MB，最多3张
                      </div>
                    </template>
                  </el-upload>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-col>

        <!-- 右侧：处置过程 -->
         <el-col :span="4">
           <div class="timeline-card">
            <div class="card-header">
              <div class="header-icon"><el-icon><Clock /></el-icon></div>
              <h3>处置过程</h3>
            </div>
            <div class="timeline-content">
              <el-timeline>
                <el-timeline-item placement="bottom" color="#ff6b6b">
                  <div class="custom-timeline-content">
                    <div class="activity-title">检测到报警</div>
                    <div class="activity-datetime">
                      <span>{{ formatDate(alarmDetails.warningDate).split(' ')[0] }}</span>
                      <span v-if="formatDate(alarmDetails.warningDate) !== '--'">{{ formatDate(alarmDetails.warningDate).split(' ')[1] }}</span>
                    </div>
                  </div>
                </el-timeline-item>
                <el-timeline-item placement="bottom" color="#ffa726">
                  <div class="custom-timeline-content">
                    <div class="activity-title">等待处置</div>
                     <div class="activity-details">
                      <span>状态: 未消警</span>
                    </div>
                  </div>
                </el-timeline-item>
              </el-timeline>
            </div>
          </div>
         </el-col>
      </el-row>
    </div>

    <!-- 图片预览对话框 -->
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
import { ArrowLeft, Collection, Warning, EditPen, Clock, Plus, Picture, ZoomIn } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import type { UploadFile, UploadProps } from 'element-plus';
import { getDictLabel, DICT_TYPE, getDictOptions, DictDataType } from '@/utils/dict'

// 引入API
import { getAlarmDetail, handleAlarm } from '@/api/monitoring/record/alarmrecord/index';
import { uploadImage } from '@/api/monitoring/common/index';

const route = useRoute();
const router = useRouter();
const alarmId = ref(route.params.id as string);
const isSubmitting = ref(false);

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
const alarmDetails = ref<Partial<AlarmDetailResponse>>({});

// 处置表单数据
const processForm = reactive({
  handleMessage: '',
  handlePictures: [] as any[],
  handleType: '',
});

const fileList = ref<UploadFile[]>([]);

const alarmHandleTypeOptions = ref<DictDataType[]>([]);

const goBack = () => {
  router.back();
};

const previewImage = (img: string) => {
  previewImageUrl.value = img;
  imagePreviewVisible.value = true;
};

const handlePictureCardPreview: UploadProps['onPreview'] = (file) => {
  if (file.url) {
    previewImage(file.url);
  }
};

const fetchAlarmDetail = async () => {
  if (!alarmId.value) return;
  try {
    const res = await getAlarmDetail(alarmId.value);
    alarmDetails.value = res || {};
  } catch (error) {
    console.error('获取报警详情失败:', error);
  }
};

const beforeUpload = (file: File) => {
  const isJPGOrPNG = file.type === 'image/jpeg' || file.type === 'image/png';
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isJPGOrPNG) ElMessage.error('上传图片只能是 JPG 或 PNG 格式!');
  if (!isLt5M) ElMessage.error('图片大小不能超过 5MB!');
  return isJPGOrPNG && isLt5M;
};

const handleExceed = () => {
  ElMessage.warning(`最多只能上传3张图片`);
};

const handleUpload = async (options: any) => {
  const { file } = options;

  const formData = new FormData();
  formData.append('file', file);

  try {
    const url = await uploadImage(formData);
    const fileInList = fileList.value.find(f => f.uid === file.uid);
    if (fileInList) {
      fileInList.status = 'success';
      fileInList.url = url;
    }
    ElMessage.success('图片上传成功！');
  } catch(error) {
    ElMessage.error('图片上传失败！');
    const index = fileList.value.findIndex(f => f.uid === file.uid);
    if (index !== -1) {
      fileList.value.splice(index, 1);
    }
  }
};

const formatDate = (timestamp: number | string | null | undefined) => {
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

const formatAlarmStatus = (status: number | undefined) => {
  switch (status) {
    case 0: return '未消警';
    case 1: return '报警消失';
    case 2: return '已消警';
    default: return '未知';
  }
};

const formatAlarmGrade = (grade: number | undefined) => {
  switch (grade) {
    case 1: return '严重';
    case 2: return '一般';
    case 3: return '轻微';
    default: return '未知';
  }
};

const getAlarmGradeType = (grade: number | undefined) => {
  switch (grade) {
    case 1: return 'danger';
    case 2: return 'warning';
    case 3: return 'info';
    default: return 'info';
  }
};

const submitProcess = async () => {
  if (!processForm.handleType) return ElMessage.warning('请选择消警类型！');
  if (!processForm.handleMessage) return ElMessage.warning('请填写处理内容！');
  if (fileList.value.length === 0) return ElMessage.warning('请上传处理图片！');
  
  if (!alarmDetails.value.alarmCode) {
    return ElMessage.error('报警编码不存在，无法提交！');
  }

  const allSuccess = fileList.value.every(f => f.status === 'success');
  if (!allSuccess) {
    return ElMessage.warning('请等待所有图片上传完成或移除失败的图片！');
  }

  isSubmitting.value = true;
  try {
    const handlePictures = fileList.value.map(f => f.url).join(',');
    const params = {
      alarmCode: alarmDetails.value.alarmCode,
      alarmDate: formatDate(alarmDetails.value.warningDate),
      handleMessage: processForm.handleMessage,
      handlePictures,
      handleType: processForm.handleType,
    };
    await handleAlarm(params);
    ElMessage.success('处置成功！');
    router.back();
  } catch (error) {
    console.error('处置失败:', error);
    ElMessage.error('处置失败，请稍后再试！');
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(async () => {
  alarmHandleTypeOptions.value = await getDictOptions(DICT_TYPE.MWS_ALARM_HANDLE_TYPE);
  fetchAlarmDetail();
});
</script>

<style scoped>
.alarm-process-container {
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
  max-width: 1600px;
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
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.save-btn {
  display: flex;
  padding: 10px 20px;
  font-weight: 500;
  border-radius: 8px;
  align-items: center;
  gap: 6px;
}

.detail-container {
  width: 100%;
  max-width: 1600px;
  padding: 24px;
  margin: 0 auto;
  flex: 1;
}

/* 卡片通用样式 */
.info-card {
  display: flex;
  height: 100%;
  margin-bottom: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgb(0 0 0 / 8%);
  flex-direction: column;
}

.card-header {
  display: flex;
  padding: 20px 24px;
  color: white;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
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

.card-content {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

/* Specific card header colors */
.alarm-info-card .card-header {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
}

.process-form-card .card-header {
  background: linear-gradient(135deg, #48c6ef 0%, #6f86d6 100%);
}

.timeline-card .card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 信息网格布局 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
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
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  word-break: break-all;
  background: #f8f9fa;
  border-left: 4px solid #409eff;
  border-radius: 6px;
}

.info-item .el-tag {
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  text-align: center;
  box-sizing: border-box;
}

/* 图片区域样式 */
.images-section {
  padding-top: 24px;
  margin-top: 24px;
  border-top: 1px solid #ebeef5;
}

.images-section h4 {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.alarm-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
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

.alarm-image-item {
  display: block;
  width: 100%;
  height: 100px;
  object-fit: cover;
}

.no-images {
  display: flex;
  height: 100px;
  color: #909399;
  background: #f8f9fa;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* 表单样式 */
.process-form .el-form-item {
  margin-bottom: 24px;
}

.process-form .el-form-item__label {
  margin-bottom: 8px !important;
  font-size: 15px !important;
  font-weight: 600;
  color: #303133 !important;
}

.process-form .el-textarea__inner {
  font-size: 14px;
  border-radius: 6px;
}

.el-upload__tip {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.4;
  color: #909399;
}

:deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 100px;
  height: 100px;
}

/* 时间线样式 */
.timeline-card {
  position: sticky;
  top: 100px;
}

.timeline-content {
  padding: 24px;
}

.custom-timeline-content {
  padding: 10px 12px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
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
</style>