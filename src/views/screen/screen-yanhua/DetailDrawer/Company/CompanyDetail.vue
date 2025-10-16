<template>
  <div class="company-detail-container">
    <!-- 左侧：详情信息 -->
    <div class="left-column">
      <a-page-header :style="{ background: 'var(--color-bg-2)' }" title="返回" subtitle="企业基本信息"
        @back="handelBack"></a-page-header>

      <!-- 企业核心信息 -->
      <div class="core-info">
        <div class="core-info-wrap">
          <div class="company-img">
            <img src="@/assets/logo.ico" alt="企业图标" class="avatar">
          </div>
          <div class="company-base-info">
            <div class="company-name">{{basicInfo.find(item => item.label === '企业名称').value}}</div>
            <div class="credit-code">统一社会信用代码：{{basicInfo.find(item => item.label === '统一社会信用代码').value}}</div>
          </div>
        </div>
      </div>

      <!-- 基本信息区域-->
      <div class="detail-section">
        <a-divider orientation="left" class="section-divider">
          <span class="section-title">基本信息</span>
        </a-divider>
        <div class="basic-info-list">
          <div v-for="item in basicInfo" :key="item.label" class="basic-info-item">
            <span class="item-label">{{ item.label }}：</span>
            <span class="item-value">{{ item.value }}</span>
          </div>
        </div>
      </div>

      <!-- 详细信息区域 -->
      <div class="detail-section">
        <a-divider orientation="left" class="section-divider">
          <span class="section-title">详细信息</span>
        </a-divider>
        <div class="basic-info-list">
          <div v-for="item in detailInfo" :key="item.label" class="basic-info-item">
            <span class="item-label">{{ item.label }}：</span>
            <span class="item-value">{{ item.value }}</span>
          </div>
        </div>
      </div>

      <!-- 高危环境与经营信息 -->
      <div class="detail-section">
        <a-divider orientation="left" class="section-divider">
          <span class="section-title">高危环境与经营信息</span>
        </a-divider>
        <div class="basic-info-list">
          <div v-for="item in riskAndBusinessInfo" :key="item.label" class="basic-info-item">
            <span class="item-label">{{ item.label }}：</span>
            <span class="item-value">{{ item.value }}</span>
          </div>
        </div>
      </div>

      <!-- 附件信息 -->
      <div class="detail-section">
        <a-divider orientation="left" class="section-divider">
          <span class="section-title">附件信息</span>
        </a-divider>
        <div class="attachment-container">
          <div v-for="(item, idx) in attachmentInfo" :key="idx">
            <span class="item-label">{{ item.label }}：</span>
            <div class="attachment-list">
              <template v-if="item.value.length > 0">
                <div v-for="(img, imgIdx) in item.value" :key="imgIdx" class="attachment-item" @click="viewImage(img)">
                  <a-image :src="img" :width="120" :height="80" fit="cover" class="attachment-img" />
                  <span class="attachment-name">图片{{ imgIdx + 1 }}</span>
                </div>
              </template>
              <div v-else class="no-attachment">---</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧：Tabs表格（带分页） -->
    <div class="right-column">
      <div class="tabs-wrapper">
        <a-tabs v-model:active-key="activeTabKey" size="large">
          <!-- 仓库表格（带分页） -->
          <a-tab-pane key="warehouse" title="仓库">
            <a-table :columns="warehouseColumns" :data="warehouseData" bordered :pagination="warehousePagination"
              :scroll="{ x: 1500 }" @change="(pagination) => handleTableChange(pagination, 'warehouse')"
              class="table" />
          </a-tab-pane>
          <!-- 库房表格（带分页） -->
          <a-tab-pane key="storehouse" title="库房">
            <a-table :columns="storehouseColumns" :data="storehouseData" bordered :pagination="storehousePagination"
              :scroll="{ x: 1500 }" @change="(pagination) => handleTableChange(pagination, 'storehouse')"
              class="table" />
          </a-tab-pane>

          <!-- 人员表格-->
          <a-tab-pane key="personnel" title="人员">
            <a-table :columns="personnelColumns" :data="personnelData" bordered :pagination="personnelPagination"
              @change="(pagination) => handleTableChange(pagination, 'personnel')" class="table" :scroll="{ x: 1500 }">
              <template #avatar="{ record }">
                <a-image :src="record.avatar || 'https://via.placeholder.com/40'" :width="40" :height="40" fit="cover"
                  class="avatar-img" @click="record.avatar && viewImage(record.avatar)" />
              </template>
            </a-table>
          </a-tab-pane>

          <!-- 车辆表格-->
          <a-tab-pane key="vehicle" title="车辆">
            <a-table :columns="vehicleColumns" :data="vehicleData" bordered :pagination="vehiclePagination"
              @change="(pagination) => handleTableChange(pagination, 'vehicle')" class="table" :scroll="{ x: 1500 }">
              <template #vehicleDocumentUrls="{ record }">
                <div class="vehicle-doc-list">
                  <div
                    v-for="(docUrl, idx) in (record.vehicleDocumentUrls ? record.vehicleDocumentUrls.split(',') : [])"
                    :key="idx" class="vehicle-doc-item" @click="viewImage(docUrl.trim())">
                    <a-image :src="docUrl.trim()" :width="60" :height="40" fit="cover" class="doc-img" />
                  </div>
                  <div v-if="!record.vehicleDocumentUrls || record.vehicleDocumentUrls.trim() === ''" class="no-doc">
                    ---
                  </div>
                </div>
              </template>
            </a-table>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineExpose, ref, watch } from 'vue';
import { getEnterpriseInfor, getObtainWarehouseInforList, getWarehouseList } from '@/api/compmonitoring';
import { getPersonPage, getCarPage } from '@/api/company';

const config = ref({});
const emits = defineEmits(['back']);
const activeTabKey = ref('warehouse');

// ---------------------- 分页配置 ----------------------
// 仓库分页
const warehousePagination = ref({
  current: 1, // 当前页（默认1）
  pageSize: 10, // 每页条数（默认10）
  total: 0, // 总条数（接口返回后更新）
  showSizeChanger: true, // 显示每页条数切换
  showQuickJumper: true, // 显示快速跳转
  showTotal: (total) => `共 ${total} 条数据` // 总条数提示
})

// 库房分页
const storehousePagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条数据`
})

// 人员分页
const personnelPagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条数据`
})
// 车辆分页
const vehiclePagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条数据`
})

// ---------------------- 表格数据 ----------------------
const warehouseData = ref([]); // 仓库数据
const storehouseData = ref([]); // 库房数据
const personnelData = ref([]); // 人员数据
const vehicleData = ref([]); // 车辆数据

// ---------------------- 基本信息 ----------------------
const basicInfo = computed(() => {
  const data = config.value || {}
  const statusMap = { 0: '关闭', 1: '正常', 2: '锁定' };
  const riskLevelMap = { '2': '低风险', '5': '一般风险', '8': '较大风险', '10': '重大风险' };
  const enterpriseScaleMap = { '规上': '规上', '中等': '中等', '小微': '小微' };

  return [
    { label: '主键ID', value: data.id || '---' },
    { label: '企业名称', value: data.enterpriseName || '---' },
    { label: '统一社会信用代码', value: data.creditCode || '---' },
    { label: '企业状态', value: statusMap[data.status] || '---' },
    { label: '整体风险等级', value: riskLevelMap[data.riskLevel] || '---' },
    { label: '主要负责人', value: data.principal || '---' },
    { label: '负责人ID', value: data.principalId || '---' },
    { label: '区域编码', value: data.areaCode || '---' },
    { label: '区域名称', value: data.areaName || '---' },
    { label: '国民经济类型名称', value: data.industryName || '---' },
    { label: '企业规模', value: enterpriseScaleMap[data.enterpriseScale] || '---' },
    { label: '职工总人数', value: data.employeeCount || '---' },
    { label: '最近填报时间', value: formatTime(data.lastReportTime) || '---' },
    { label: '经度', value: data.longitude ? data.longitude.toFixed(6) : '---' },
    { label: '纬度', value: data.latitude ? data.latitude.toFixed(6) : '---' },
    { label: '创建时间', value: formatTime(data.createTime) || '---' },
    { label: '更新时间', value: formatTime(data.updateTime) || '---' },
  ];
});

const detailInfo = computed(() => {
  const data = config.value || {}
  return [
    {
      label: '上一年营业收入',
      value: data.lastYearRevenue !== undefined ? `${data.lastYearRevenue} 万元` : '---'
    },
    {
      label: '企业注册地址',
      value: data.registerAddress || '---'
    },
    {
      label: '企业生产经营地址',
      value: data.productionAddress || '---'
    },
    {
      label: '营业执照经营范围',
      value: data.businessScope || '---'
    }
  ];
});

const riskAndBusinessInfo = computed(() => {
  const data = config.value || {}
  const riskEnvMap = { '0': '未涉及', '1': '有限空间', '2': '粉尘涉爆', '3': '涉氮制冷' }

  return [
    {
      label: '所涉高危环境类型',
      value: data.riskEnvTypes
        ? data.riskEnvTypes.split(',').map((code) => riskEnvMap[code] || `未知类型(${code})`).join('、')
        : '---'
    },
    {
      label: '国民经济类型编码',
      value: data.industryCode
        ? data.industryCode.split(',').join('、')
        : '---'
    }
  ];
});

const attachmentInfo = computed(() => {
  const data = config.value || {}
  return [
    {
      label: '许可证附件',
      value: data.licenseAnnex ? data.licenseAnnex.split(',').filter((img) => img.trim()) : []
    }
  ];
});

// ---------------------- 表格列配置 ----------------------
const warehouseColumns = ref([
  { title: '仓库编号', dataIndex: 'warehouseNum', key: 'warehouseNum', align: 'center' },
  { title: '仓库名称', dataIndex: 'warehouseName', key: 'warehouseName', align: 'center' },
  { title: '仓库地址', dataIndex: 'location', key: 'location', align: 'center' },
  { title: '仓库面积(㎡)', dataIndex: 'acreage', key: 'acreage', align: 'center' },
  { title: '危险等级', dataIndex: 'dangerLevel', key: 'dangerLevel', align: 'center' },
  { title: '剂量', dataIndex: 'dosage', key: 'dosage', align: 'center' },
  { title: '人员限制', dataIndex: 'personLimit', key: 'personLimit', align: 'center' },
  { title: '更新时间', dataIndex: 'updateDate', key: 'updateDate', align: 'center' },
])

const storehouseColumns = ref([
  { title: '库房编号', dataIndex: 'roomNum', key: 'roomNum', align: 'center' },
  { title: '库房名称', dataIndex: 'roomName', key: 'roomName', align: 'center' },
  { title: '面积', dataIndex: 'acreage', key: 'acreage', align: 'center' },
  { title: '危险等级', dataIndex: 'dangerLevel', key: 'dangerLevel', align: 'center' },
  { title: '剂量', dataIndex: 'dosage', key: 'dosage', align: 'center' },
  { title: '人员限制', dataIndex: 'personLimit', key: 'personLimit', align: 'center' },
  { title: '更新时间', dataIndex: 'updateDate', key: 'updateDate', align: 'center' },
])
const personnelColumns = ref([
  { title: '公司编号', dataIndex: 'companyCode', key: 'companyCode', align: 'center' },
  { title: '人员姓名', dataIndex: 'personname', key: 'personname', align: 'center' },
  { title: '身份证号', dataIndex: 'idcard', key: 'idcard', align: 'center' },
  { title: '账户', dataIndex: 'account', key: 'account', width: 130 },
  { title: '密码', dataIndex: 'password', key: 'password', align: 'center' },
  { title: '工号', dataIndex: 'workNo', key: 'workNo', align: 'center' },
  { title: '职位', dataIndex: 'position', key: 'position', align: 'center' },
  { title: '手机号', dataIndex: 'mb', key: 'mb', align: 'center' },
  { title: '创建人', dataIndex: 'createBy', key: 'createBy', align: 'center' },
  { title: '创建日期', dataIndex: 'createDate', key: 'createDate', align: 'center' },
  { title: '更新人', dataIndex: 'updateBy', key: 'updateBy', align: 'center' },
  { title: '更新日期', dataIndex: 'updateDate', key: 'updateDate', align: 'center' },
  { title: '证件号码', dataIndex: 'documentNumber', key: 'documentNumber', align: 'center' },
  { title: '头像', slotName: 'avatar', key: 'mb', align: 'center' },
  { title: 'ICC卡ID', dataIndex: 'iccCardId', key: 'iccCardId', align: 'center' },
  { title: '生物特征', dataIndex: 'biosignatures', key: 'biosignatures', align: 'center' },
])

const vehicleColumns = ref([
  { title: '车牌号码', dataIndex: 'plateNumber', key: 'plateNumber', align: 'center' },
  { title: '车辆类型', dataIndex: 'vehicleType', key: 'vehicleType', align: 'center' },
  { title: '车牌颜色', dataIndex: 'plateColor', key: 'plateColor', align: 'center' },
  { title: '品牌', dataIndex: 'brand', key: 'brand', align: 'center' },
  { title: '车身颜色', dataIndex: 'bodyColor', key: 'bodyColor', align: 'center' },
  { title: '备注', dataIndex: 'remarks', key: 'remarks', align: 'center' },
  { title: '是否运营车辆', dataIndex: 'isOperational', key: 'isOperational', align: 'center' },
  { title: '运营许可号', dataIndex: 'operationalLicenseNumber', key: 'operationalLicenseNumber', align: 'center' },
  { title: '车辆证件', slotName: 'vehicleDocumentUrls', key: 'vehicleDocumentUrls', align: 'center' },
  { title: '更新日期', dataIndex: 'updateTime', key: 'updateTime', align: 'center' },
])

// ---------------------- 数据请求函数（核心：对接接口+传参） ----------------------
/**
 * 获取仓库列表
 * @param pageNo 页码
 * @param pageSize 每页条数
 */
const getWarehouseData = async (pageNo = 1, pageSize = 10) => {
  const companyId = config.value?.id
  if (!companyId) return;

  try {
    const res = await getObtainWarehouseInforList({
      pageNo,
      pageSize,
      companyId // 传递企业ID参数
    })
    if (res.success) {
      warehouseData.value = res.data?.records || [];
      warehousePagination.value.total = res.data?.total || 0;
    }
  } catch (error) {
    console.error('获取仓库列表失败：', error);
  }
};

/**
 * 获取库房列表
 * @param pageNo 页码
 * @param pageSize 每页条数
 */
const getStorehouseData = async (pageNo = 1, pageSize = 10) => {
  const companyId = config.value?.id;
  if (!companyId) return;

  try {
    const res = await getWarehouseList({
      pageNo,
      pageSize,
      companyId
    })
    if (res.success) {
      storehouseData.value = res.data?.records || [];
      storehousePagination.value.total = res.data?.total || 0;
    }
  } catch (error) {
    console.error('获取库房列表失败：', error);
  }
};

/**
 * 获取人员列表
 * @param pageNo 页码
 * @param pageSize 每页条数
 */
const getPersonnelData = async (pageNo = 1, pageSize = 10) => {
  const companyId = config.value?.id;
  if (!companyId) return;

  try {
    const res = await getPersonPage({
      pageNo,
      pageSize,
      companyId
    })
    if (res.success) {
      personnelData.value = res.data?.records || [];
      personnelPagination.value.total = res.data?.total || 0;
    }
  } catch (error) {
    console.error('获取人员列表失败：', error);
  }
};

/**
 * 获取车辆列表
 * @param pageNo 页码
 * @param pageSize 每页条数
 */
const getVehicleData = async (pageNo = 1, pageSize = 10) => {
  const companyId = config.value?.id;
  if (!companyId) return;

  try {
    const res = await getCarPage({
      pageNo,
      pageSize,
      companyId
    })
    if (res.success) {
      vehicleData.value = res.data?.records || [];
      vehiclePagination.value.total = res.data?.total || 0;
    }
  } catch (error) {
    console.error('获取车辆列表失败：', error);
  }
};

// ---------------------- 分页事件处理（通用：处理页码/每页条数变化） ----------------------
/**
 * 表格分页变化事件
 * @param pagination 分页参数
 * @param type 表格类型（warehouse/storehouse/personnel/vehicle）
 */
const handleTableChange = (pagination, type) => {
  const { current, pageSize } = pagination;

  // 根据表格类型更新对应分页状态+请求数据
  switch (type) {
    case 'warehouse':
      warehousePagination.value.current = current;
      warehousePagination.value.pageSize = pageSize;
      getWarehouseData(current, pageSize);
      break;
    case 'storehouse':
      storehousePagination.value.current = current;
      storehousePagination.value.pageSize = pageSize;
      getStorehouseData(current, pageSize);
      break;
    case 'personnel':
      personnelPagination.value.current = current;
      personnelPagination.value.pageSize = pageSize;
      getPersonnelData(current, pageSize);
      break;
    case 'vehicle':
      vehiclePagination.value.current = current;
      vehiclePagination.value.pageSize = pageSize;
      getVehicleData(current, pageSize);
      break;
  }
};

// ---------------------- 企业详情获取+表格初始化 ----------------------
// 获取企业详情后，自动初始化所有表格的第一页数据
function getRecord(ids) {
  getEnterpriseInfor(ids).then((res) => {
    if (res.success) {
      config.value = res.data;
      getWarehouseData();
      getStorehouseData();
      getPersonnelData();
      getVehicleData();
    }
  });
}

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).replace(/\//g, '-');
};

const viewImage = (imgUrl) => {
  console.log('查看图片：', imgUrl);
};

function handelBack() {
  emits('back');
}

// 暴露方法供父组件调用
defineExpose({ getRecord });
</script>

<style scoped lang="less">
.company-detail-container {
  display: flex;
  gap: 20px;
  padding: 16px;
  background: #fff;

  .left-column,
  .right-column {
    flex: 1;
  }

  .left-column {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .right-column {
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    overflow: hidden;
  }
}

.core-info {
  .core-info-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    background: #cfd9fd;

    .avatar {
      width: 26px;
      height: 26px;
      border-radius: 8px;
      object-fit: cover;
    }

    .company-name {
      font-size: 14px;
      font-weight: 600;
      color: #0a2744;
    }

    .credit-code {
      font-size: 14px;
      color: #666;
    }
  }
}

.detail-section {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  border: 1px solid #f0f0f0;

  .section-divider {
    margin-bottom: 20px;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #0a2744;
    }
  }
}

.basic-info-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.basic-info-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 10px;
  background: #fafafa;

  .item-label {
    flex: 0 0 140px;
    color: #666;
    font-weight: 500;
    padding-top: 2px;
  }

  .item-value {
    flex: 1;
    color: #333;
    word-break: break-all;
    line-height: 1.6;
    white-space: pre-line;
  }
}

.attachment-container {
  .attachment-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 8px;
    align-items: center;

    .attachment-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;

      .attachment-img {
        border-radius: 4px;
        border: 1px solid #eee;
      }

      .attachment-name {
        margin-top: 8px;
        font-size: 12px;
        color: #666;
      }
    }

    .no-attachment {
      color: #999;
      font-size: 14px;
    }
  }
}

.tabs-wrapper {
  flex: 1;
  padding: 24px;
  overflow: auto;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;

  .table {
    align: center;
    margin-top: 16px;

    ::v-deep(.arco-table-th) {
      background: #f5f7fa;
      font-weight: 600;
    }
  }

  ::v-deep(.arco-tabs-card) {
    border: 1px solid #eee;
    border-radius: 8px;
    overflow: hidden;
  }
}
</style>