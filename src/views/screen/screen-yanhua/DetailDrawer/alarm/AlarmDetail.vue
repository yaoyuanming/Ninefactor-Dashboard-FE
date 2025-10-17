<template>
  <div class="alarm-detail-drawer">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <a-spin :size="32" />
      <div class="loading-text">加载中...</div>
    </div>

    <!-- 详情内容 -->
    <div v-else-if="detailData" class="detail-content">
      <!-- 左侧：基本信息 -->
      <div class="left-section">
        <div class="info-section">
          <h3 class="section-title">基本信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">报警编号</span>
              <span class="info-value">{{
                detailData?.alarmCode || '--'
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">企业名称</span>
              <span class="info-value">{{
                detailData?.enterpriseName || '--'
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">企业编码</span>
              <span class="info-value">{{
                detailData?.companyCode || '--'
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">区域编码</span>
              <span class="info-value">{{ detailData?.areaCode || '--' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">区域名称</span>
              <span class="info-value">{{ detailData?.areaName || '--' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">仓库编号</span>
              <span class="info-value">{{ detailData?.storeNum || '--' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">库房编号</span>
              <span class="info-value">{{
                detailData?.storeroomNum || '--'
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">设备编码</span>
              <span class="info-value">{{
                detailData?.deviceCode || '--'
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">报警类型</span>
              <span
                class="info-value alarm-type"
                :class="getAlarmTypeClass(detailData?.alarmType)"
              >
                {{ getAlarmTypeName(detailData?.alarmType) }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">报警事件</span>
              <span class="info-value">{{
                detailData?.alarmTypeName || '--'
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">报警等级</span>
              <span
                class="info-value alarm-grade"
                :class="getAlarmGradeClass(detailData?.alarmGrade)"
              >
                {{ getAlarmGradeName(detailData?.alarmGrade) }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">报警状态</span>
              <span
                class="info-value"
                :class="
                  detailData?.alarmStatus === 0
                    ? 'status-warning'
                    : 'status-success'
                "
              >
                {{ detailData?.alarmStatus === 0 ? '未消警' : '已消警' }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">发生地点</span>
              <span class="info-value">{{
                detailData?.alarmPosition || '--'
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">报警时间</span>
              <span class="info-value">{{
                formatDate(detailData?.warningDate)
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">所属组织</span>
              <span class="info-value">{{ detailData?.orgName || '--' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">组织编码</span>
              <span class="info-value">{{ detailData?.orgCode || '--' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">联动能力</span>
              <span class="info-value">{{
                detailData?.linkNames || '--'
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">消警时间</span>
              <span class="info-value">{{
                formatDate(detailData?.clearDate)
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">处理人</span>
              <span class="info-value">{{
                detailData?.handleUser || '--'
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">消警类型</span>
              <span class="info-value">{{
                detailData?.handleType || '--'
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">处理结果</span>
              <span class="info-value">{{
                detailData?.handleMessage || '--'
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">创建时间</span>
              <span class="info-value">{{
                formatDate(detailData?.createTime)
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：图片 -->
      <div class="right-section">
        <!-- 报警图片 -->
        <div class="info-section">
          <h3 class="section-title">报警图片</h3>
          <div class="image-container">
            <template v-if="alarmImages.length > 0">
              <div
                v-for="(img, index) in alarmImages"
                :key="index"
                class="image-item"
                @click="previewImage(img)"
              >
                <img :src="img" :alt="`报警图片${index + 1}`" />
              </div>
            </template>
            <div v-else class="no-data">暂无报警图片</div>
          </div>
        </div>

        <!-- 消警图片 -->
        <div v-if="detailData?.alarmStatus === 2" class="info-section">
          <h3 class="section-title">消警图片</h3>
          <div class="image-container">
            <template v-if="handleImages.length > 0">
              <div
                v-for="(img, index) in handleImages"
                :key="index"
                class="image-item"
                @click="previewImage(img)"
              >
                <img :src="img" :alt="`消警图片${index + 1}`" />
              </div>
            </template>
            <div v-else class="no-data">暂无消警图片</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载失败 -->
    <div v-else class="error-container">
      <a-result status="error" title="加载失败">
        <template #subtitle> 无法获取报警详情信息 </template>
      </a-result>
    </div>

    <!-- 图片预览 -->
    <a-image-preview
      v-model:visible="previewVisible"
      :src="previewSrc"
      :closable="true"
    />
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, onMounted } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import dayjs from 'dayjs';
  import { getAlarmById } from '@/api/alarm';

  // Props
  interface Props {
    data?: any;
  }

  const props = withDefaults(defineProps<Props>(), {
    data: () => ({}),
  });

  // 状态
  const loading = ref(false);
  const detailData = ref<any>(null);

  // 获取报警详情
  const fetchDetail = async () => {
    if (!props.data?.id) {
      Message.error('缺少报警ID');
      return;
    }

    loading.value = true;
    try {
      const response = await getAlarmById(props.data.id);
      detailData.value = response.data;
    } catch (error: any) {
      Message.error(error?.message || '获取报警详情失败');
      detailData.value = null;
    } finally {
      loading.value = false;
    }
  };

  // 组件挂载时获取数据
  onMounted(() => {
    fetchDetail();
  });

  // 图片预览
  const previewVisible = ref(false);
  const previewSrc = ref('');

  const previewImage = (src: string) => {
    previewSrc.value = src;
    previewVisible.value = true;
  };

  // 解析报警图片
  const alarmImages = computed(() => {
    if (!detailData.value?.alarmFile) return [];

    const { alarmFile } = detailData.value;

    // 如果是字符串路径，转换为完整URL
    if (typeof alarmFile === 'string') {
      // 如果是相对路径，添加基础URL
      if (!alarmFile.startsWith('http')) {
        // 假设图片服务器的基础URL，需要根据实际情况调整
        const baseUrl = import.meta.env.VITE_FILE_BASE_URL || '/api/file/';
        return [baseUrl + alarmFile];
      }
      return [alarmFile];
    }

    // 如果是数组，直接返回
    if (Array.isArray(alarmFile)) {
      return alarmFile;
    }

    // 尝试解析 JSON
    try {
      const parsed = JSON.parse(alarmFile);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [];
    }
  });

  // 解析消警图片
  const handleImages = computed(() => {
    if (!detailData.value?.handlePictures) return [];

    const { handlePictures } = detailData.value;

    // 如果是字符串路径，转换为完整URL
    if (typeof handlePictures === 'string') {
      // 如果是相对路径，添加基础URL
      if (!handlePictures.startsWith('http')) {
        const baseUrl = import.meta.env.VITE_FILE_BASE_URL || '/api/file/';
        return [baseUrl + handlePictures];
      }
      return [handlePictures];
    }

    // 如果是数组，直接返回
    if (Array.isArray(handlePictures)) {
      return handlePictures;
    }

    // 尝试解析 JSON
    try {
      const parsed = JSON.parse(handlePictures);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [];
    }
  });

  // 报警类型映射
  const getAlarmTypeName = (type: number) => {
    const typeMap: Record<number, string> = {
      1: '超员作业',
      2: '堵塞通道',
      3: '超高超量',
      4: '非法入侵',
      5: '摄像头遮挡偏移',
      6: '证书过期',
    };
    return typeMap[type] || '--';
  };

  // 报警类型样式
  const getAlarmTypeClass = (type: number) => {
    const classMap: Record<number, string> = {
      1: 'type-overman',
      2: 'type-block',
      3: 'type-over',
      4: 'type-intrusion',
      5: 'type-camera',
      6: 'type-expire',
    };
    return classMap[type] || '';
  };

  // 报警等级映射
  const getAlarmGradeName = (grade: number) => {
    const gradeMap: Record<number, string> = {
      1: '严重',
      2: '一般',
      3: '轻微',
    };
    return gradeMap[grade] || '--';
  };

  // 报警等级样式
  const getAlarmGradeClass = (grade: number) => {
    const classMap: Record<number, string> = {
      1: 'grade-serious',
      2: 'grade-normal',
      3: 'grade-minor',
    };
    return classMap[grade] || '';
  };

  // 格式化日期
  const formatDate = (date: string) => {
    if (!date) return '--';
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
  };
</script>

<style scoped lang="less">
  .alarm-detail-drawer {
    width: 100%;
    height: 100%;
    overflow-y: auto;

    .loading-container,
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      min-height: 400px;

      .loading-text {
        margin-top: 16px;
        color: rgb(255 255 255 / 65%);
        font-size: 14px;
      }
    }

    .detail-content {
      display: flex;
      gap: 20px;
      padding: 20px;
    }

    .left-section {
      flex: 0 0 65%;
      overflow-y: auto;
    }

    .right-section {
      flex: 1;
      overflow-y: auto;
    }

    .info-section {
      margin-bottom: 20px;
      padding: 16px;
      background: rgb(10 30 60 / 30%);
      border: 1px solid rgb(23 150 250 / 20%);
      border-radius: 4px;

      .section-title {
        margin-bottom: 16px;
        color: #1890ff;
        font-weight: 500;
        font-size: 16px;
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px 16px;

        .info-item {
          display: flex;
          gap: 8px;
          align-items: flex-start;

          .info-label {
            flex-shrink: 0;
            width: 80px;
            color: rgb(255 255 255 / 65%);
            font-size: 14px;
          }

          .info-value {
            flex: 1;
            color: rgb(255 255 255 / 85%);
            font-size: 14px;
            word-break: break-all;

            &.alarm-type {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 2px;

              &.type-overman {
                color: #ff4d4f;
                background: rgb(255 77 79 / 10%);
              }

              &.type-block {
                color: #faad14;
                background: rgb(250 173 20 / 10%);
              }

              &.type-over {
                color: #ff7a45;
                background: rgb(255 122 69 / 10%);
              }

              &.type-intrusion {
                color: #f5222d;
                background: rgb(245 34 45 / 10%);
              }

              &.type-camera {
                color: #fa8c16;
                background: rgb(250 140 22 / 10%);
              }

              &.type-expire {
                color: #fadb14;
                background: rgb(250 219 20 / 10%);
              }
            }

            &.alarm-grade {
              display: inline-block;
              padding: 2px 8px;
              font-weight: 500;
              border-radius: 2px;

              &.grade-serious {
                color: #f5222d;
                background: rgb(245 34 45 / 10%);
              }

              &.grade-normal {
                color: #faad14;
                background: rgb(250 173 20 / 10%);
              }

              &.grade-minor {
                color: #52c41a;
                background: rgb(82 196 26 / 10%);
              }
            }

            &.status-warning {
              color: #faad14;
            }

            &.status-success {
              color: #52c41a;
            }
          }
        }
      }

      .image-container {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .image-item {
          position: relative;
          width: 100%;
          height: 200px;
          overflow: hidden;
          background: rgb(0 0 0 / 20%);
          border: 1px solid rgb(23 150 250 / 20%);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            border-color: #1890ff;
            box-shadow: 0 4px 12px rgb(24 144 255 / 30%);
          }

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .no-data {
          padding: 40px;
          color: rgb(255 255 255 / 45%);
          font-size: 14px;
          text-align: center;
        }
      }
    }
  }
</style>
