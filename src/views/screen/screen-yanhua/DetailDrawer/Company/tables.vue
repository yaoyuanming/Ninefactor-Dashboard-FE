<template>
  <div v-show="showInfo" class="enterprise-statistics">
    <!-- 顶部统计卡片 -->
    <a-row :gutter="16">
      <a-col :span="4">
        <a-card title="企业总数" :bordered="false">
          <div class="card-value">{{ statisticsData.shouldAccessCount }}</div>
        </a-card>
      </a-col>
      <a-col :span="4">
        <a-card title="已上报企业数" :bordered="false">
          <div class="card-value">{{ statisticsData.accessedCount }}</div>
        </a-card>
      </a-col>
      <a-col :span="4">
        <a-card title="未上报企业数" :bordered="false">
          <div class="card-value">{{ statisticsData.notAccessedCount }}</div>
        </a-card>
      </a-col>
      <a-col :span="4">
        <a-card title="规上企业" :bordered="false">
          <div class="card-value">{{
            statisticsData.largeEnterpriseCount
          }}</div>
        </a-card>
      </a-col>
      <a-col :span="4">
        <a-card title="中等企业" :bordered="false">
          <div class="card-value">{{
            statisticsData.mediumEnterpriseCount
          }}</div>
        </a-card>
      </a-col>
      <a-col :span="4">
        <a-card title="小微企业" :bordered="false">
          <div class="card-value">{{
            statisticsData.smallEnterpriseCount
          }}</div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 搜索筛选区 -->
    <div class="search-filter">
      <a-space size="medium" wrap>
        <a-input
          v-model="searchForm.enterpriseName"
          placeholder="请输入企业名称"
          allow-clear
          style="width: 200px"
        >
          <template #prefix>
            <icon-search />
          </template>
        </a-input>

        <RegionSelect
          v-model="searchForm.areaCode"
          placeholder="请选择区域"
          style="width: 180px"
        />

        <a-tree-select
          v-model="searchForm.industryCode"
          :field-names="{
            key: 'id',
            title: 'label',
          }"
          :data="IndustryList"
          :allow-search="true"
          :allow-clear="true"
          :disable-filter="true"
          placeholder="请选择国民经济类型"
          style="width: 220px"
          @search="onSearch"
        />

        <a-select
          v-model="searchForm.riskLevel"
          placeholder="请选择整体风险等级"
          allow-clear
          style="width: 180px"
        >
          <a-option
            v-for="options in LeveList"
            :key="options.dictCode"
            :value="options.dictValue"
          >
            {{ options.dictLabel }}
          </a-option>
        </a-select>

        <a-button type="primary" @click="handleSearch">
          <icon-search />
          查询
        </a-button>
        <a-button @click="handleReset">
          <icon-refresh />
          重置
        </a-button>
      </a-space>
    </div>

    <!-- 企业列表表格 -->
    <a-table
      :columns="columns"
      :loading="loading"
      :data="enterpriseData"
      bordered
      :pagination="false"
    >
      <template #status="{ record }">
        <span
          :class="{
            'status-normal': record.status === '正常',
            'status-closed': record.status === '关闭',
            'status-locked': record.status === '锁定',
          }"
        >
          {{ record.status }}
        </span>
      </template>
      <template #operation="{ record }">
        <a-link @click="handleEnterpriseInfo(record)">企业信息</a-link>
      </template>
    </a-table>

    <div class="pagination">
      <a-pagination v-if="total != 0" :total="total" @change="handelChange" />
    </div>
  </div>
  <CompanyDetail
    v-show="!showInfo"
    ref="CompanyDetailForm"
    @back="showInfo = true"
  />
</template>

<script setup lang="ts">
  import { ref, onMounted, nextTick } from 'vue';
  import { IconSearch, IconRefresh } from '@arco-design/web-vue/es/icon';
  import {
    getEnterPageList,
    getEnterpriseInformation,
  } from '@/api/compmonitoring';
  import { DictType, getIndustrySelect } from '@/api/system';
  import { formatDate } from '@/utils/date';
  import RegionSelect from '../../components/RegionSelect/index.vue';
  import CompanyDetail from './CompanyDetail.vue';

  defineProps<{
    data?: any;
  }>();

  // 统计数据
  const statisticsData = ref({
    shouldAccessCount: 0,
    accessedCount: 0,
    notAccessedCount: 0,
    largeEnterpriseCount: 0,
    mediumEnterpriseCount: 0,
    smallEnterpriseCount: 0,
  });

  const LeveList = ref([]);
  const IndustryList = ref([]);
  const loading = ref(false);
  // 搜索表单数据
  const searchForm = ref({
    enterpriseName: '',
    areaCode: '',
    industryCode: '',
    riskLevel: '',
    pageNo: 1,
    pageSize: 10,
  }) as any;

  const total = ref(0);

  const showInfo = ref(true);
  const CompanyDetailForm = ref(null) as any;

  // 格式化函数
  const formatRiskLevel = (level: number) => {
    const levelMap = {
      0: '无风险',
      2: '低风险',
      5: '一般风险',
      8: '较大风险',
      10: '重大风险',
    };
    return levelMap[level] || '-';
  };

  const formatEnterpriseScale = (scale: any) => {
    const scaleMap = {
      '1': '规上',
      '2': '中等',
      '3': '小微',
    };
    return scaleMap[String(scale)] || scale || '-';
  };

  // 表格列配置
  const columns = [
    {
      title: '企业名称',
      dataIndex: 'enterpriseName',
      align: 'center',
    },
    {
      title: '统一信用代码',
      dataIndex: 'creditCode',
      align: 'center',
    },
    {
      title: '区域',
      dataIndex: 'areaCode',
      align: 'center',
    },
    {
      title: '国民经济类型',
      dataIndex: 'industryCode',
      align: 'center',
    },
    {
      title: '整体风险等级',
      dataIndex: 'riskLevel',
      align: 'center',
      render: ({ record }: any) => formatRiskLevel(record.riskLevel),
    },
    {
      title: '主要负责人',
      dataIndex: 'principal',
      align: 'center',
    },
    {
      title: '企业规模',
      dataIndex: 'enterpriseScale',
      align: 'center',
      render: ({ record }: any) =>
        formatEnterpriseScale(record.enterpriseScale),
    },
    {
      title: '最近填报时间',
      dataIndex: 'lastReportTime',
      align: 'center',
      render: ({ record }: any) => formatDate(record.lastReportTime),
    },
    {
      title: '企业状态',
      dataIndex: 'status',
      slotName: 'status',
      align: 'center',
    },
    {
      title: '操作',
      slotName: 'operation',
      align: 'center',
    },
  ];

  // 企业列表数据
  const enterpriseData = ref([]);

  // 获取分页列表数据
  const getList = async () => {
    try {
      loading.value = true;
      const statusMap = { 0: '关闭', 1: '正常', 2: '锁定' };
      const res = (await getEnterPageList(searchForm.value)) as any;
      if (res.success) {
        total.value = res.data.total;
        enterpriseData.value = res.data.records.map((val) => {
          return {
            ...val,
            status: statusMap[val.status],
          };
        });
      }
    } catch {
      // 错误处理
    } finally {
      loading.value = false;
    }
  };

  // 搜索方法
  const handleSearch = () => {
    getList();
  };

  // 重置方法
  const handleReset = () => {
    searchForm.value = {
      enterpriseName: '',
      region: '',
      economicType: '',
      riskLevel: '',
      pageNo: 1,
    };
    getList();
  };

  // 企业信息方法
  const handleEnterpriseInfo = async (record: any) => {
    showInfo.value = false;
    await nextTick();
    if (CompanyDetailForm.value) {
      CompanyDetailForm.value.getRecord(record.id);
    }
  };

  // 直接跳转到企业详情（供外部调用）
  const goToEnterpriseDetail = async (enterpriseId: string) => {
    showInfo.value = false;
    await nextTick();
    if (CompanyDetailForm.value) {
      CompanyDetailForm.value.getRecord(enterpriseId);
    }
  };

  // 获取字典
  async function dictDetaile() {
    const res = (await DictType('risk_level')) as any;
    if (res.success) {
      LeveList.value = res.data;
    }
  }

  // 获取国民行业下拉列表
  async function IndustrySelect() {
    const res = (await getIndustrySelect()) as any;
    if (res.success) {
      IndustryList.value = res.data;
    }
  }

  // 分页函数
  function handelChange(num: number) {
    searchForm.value.pageNo = num;
    getList();
  }

  // 搜索
  function searchData(keyword: any) {
    const loop = (data: any) => {
      const result = [] as any;
      data.forEach((item: any) => {
        if (item.label.toLowerCase().indexOf(keyword.toLowerCase()) > -1) {
          result.push({ ...item });
        } else if (item.children) {
          const filterData = loop(item.children);
          if (filterData.length) {
            result.push({
              ...item,
              children: filterData,
            });
          }
        }
      });
      return result;
    };

    return loop(IndustryList.value);
  }

  const onSearch = (searchKey: any) => {
    loading.value = true;
    setTimeout(() => {
      loading.value = false;
      IndustryList.value = searchData(searchKey);
    }, 200);
  };

  // 获取企业统计信息
  const getStatistics = async () => {
    try {
      const res = await getEnterpriseInformation();
      if (res.success) {
        statisticsData.value = res.data;
      }
    } catch (error) {
      // console.error('获取企业统计信息失败:', error);
    }
  };

  onMounted(async () => {
    await getStatistics();
    await dictDetaile();
    await IndustrySelect();
    await getList();
  });

  defineExpose({ handleEnterpriseInfo, goToEnterpriseDetail });
</script>

<style scoped lang="less">
  .enterprise-statistics {
    color: #fff;
    background: transparent;
  }

  // 统计卡片样式
  ::v-deep(.arco-card) {
    background: linear-gradient(
      135deg,
      rgb(30 144 255 / 10%) 0%,
      rgb(0 123 255 / 15%) 100%
    );
    border: 1px solid rgb(30 144 255 / 30%);
    border-radius: 8px;
    backdrop-filter: blur(10px);

    .arco-card-header {
      background: transparent;
      border-bottom: 1px solid rgb(30 144 255 / 20%);

      .arco-card-header-title {
        color: #fff;
        font-weight: 500;
        text-align: center;
      }
    }

    .arco-card-body {
      background: transparent;
    }
  }

  .card-value {
    margin-top: 10px;
    color: #00d4ff;
    font-weight: bold;
    font-size: 24px;
    text-align: center;
    text-shadow: 0 0 10px rgb(0 212 255 / 50%);
  }

  // 搜索筛选区样式
  .search-filter {
    flex-shrink: 0;
    margin-top: 20px;
    margin-bottom: 16px;
    padding: 16px;
    background: rgb(10 30 60 / 30%);
    border: 1px solid rgb(23 150 250 / 20%);
    border-radius: 8px;

    :deep(.arco-input-wrapper),
    :deep(.arco-select-view-single),
    :deep(.arco-tree-select-view) {
      color: rgb(255 255 255 / 85%);
      background: rgb(10 30 60 / 50%);
      border-color: rgb(23 150 250 / 30%);

      &:hover {
        border-color: rgb(23 150 250 / 50%);
      }

      &:focus-within {
        border-color: rgb(23 150 250 / 70%);
      }

      input,
      .arco-select-view-value,
      .arco-tree-select-view-value {
        color: rgb(255 255 255 / 85%);
        background: transparent;

        &::placeholder {
          color: rgb(255 255 255 / 40%);
        }
      }

      .arco-input {
        background: transparent;
      }

      .arco-select-view-placeholder,
      .arco-tree-select-view-placeholder {
        color: rgb(255 255 255 / 40%);
      }

      .arco-select-view-suffix,
      .arco-tree-select-view-suffix {
        color: rgb(255 255 255 / 60%);
      }
    }

    :deep(.arco-btn-primary) {
      background: linear-gradient(135deg, rgb(23 150 250), rgb(20 120 200));
      border: none;

      &:hover {
        background: linear-gradient(135deg, rgb(40 160 255), rgb(30 130 210));
      }
    }

    :deep(.arco-btn:not(.arco-btn-primary)) {
      color: rgb(255 255 255 / 75%);
      background: rgb(255 255 255 / 8%);
      border-color: rgb(255 255 255 / 15%);

      &:hover {
        background: rgb(255 255 255 / 12%);
        border-color: rgb(23 150 250 / 50%);
      }
    }
  }

  // 表格样式
  ::v-deep(.arco-table) {
    color: #fff;
    font-size: 14px;
    background: transparent;

    .arco-table-container {
      overflow: hidden;
      background: rgb(10 30 60 / 30%) !important;
      border: 1px solid rgb(23 150 250 / 10%);
      border-radius: 8px;
    }

    .arco-table-element,
    .arco-table-content,
    .arco-table-content-inner,
    .arco-table-wrapper,
    .arco-table-header,
    table,
    thead,
    tbody,
    tr {
      background: transparent !important;
    }

    .arco-table-th {
      padding: 16px 12px;
      color: rgb(255 255 255 / 95%);
      font-weight: 500;
      font-size: 14px;
      text-align: center;
      background: rgb(10 30 60 / 80%) !important;
      border-right: none;
      border-bottom: 2px solid rgb(23 150 250 / 30%);
      border-left: none;
    }

    .arco-table-td {
      padding: 14px 12px;
      color: rgb(255 255 255 / 85%);
      font-size: 14px;
      text-align: center;
      background: transparent !important;
      border-right: none;
      border-bottom: 1px solid rgb(255 255 255 / 8%);
      border-left: none;

      // 企业名称列高亮
      &:first-child {
        color: #1796fa;
        font-weight: 500;
      }
    }

    .arco-table-tr:hover {
      .arco-table-td {
        background: rgb(23 150 250 / 12%) !important;
      }
    }

    // 最后一行去掉底部边框
    .arco-table-tr:last-child {
      .arco-table-td {
        border-bottom: none;
      }
    }

    .arco-link {
      padding: 4px 8px;
      color: #1796fa;
      font-weight: 500;
      text-decoration: none;
      border-radius: 4px;
      transition: all 0.3s ease;

      &:hover {
        color: #2ea3ff;
        background: rgb(23 150 250 / 10%);
      }
    }

    // 空数据状态
    .arco-empty {
      color: rgb(255 255 255 / 60%);
      background: transparent !important;
    }

    // 加载状态
    .arco-table-loading {
      background: transparent;

      .arco-spin {
        .arco-spin-icon {
          color: #1796fa;
        }
      }
    }
  }

  // 状态标签样式
  .status-normal {
    display: inline-block;
    padding: 4px 12px;
    color: #52c41a;
    font-weight: 500;
    font-size: 12px;
    background: rgb(82 196 26 / 15%);
    border: 1px solid rgb(82 196 26 / 30%);
    border-radius: 12px;
  }

  .status-closed {
    display: inline-block;
    padding: 4px 12px;
    color: #ff4d4f;
    font-weight: 500;
    font-size: 12px;
    background: rgb(255 77 79 / 15%);
    border: 1px solid rgb(255 77 79 / 30%);
    border-radius: 12px;
  }

  .status-locked {
    display: inline-block;
    padding: 4px 12px;
    color: #faad14;
    font-weight: 500;
    font-size: 12px;
    background: rgb(250 173 20 / 15%);
    border: 1px solid rgb(250 173 20 / 30%);
    border-radius: 12px;
  }

  // 分页样式
  .pagination {
    display: flex;
    justify-content: end;
    padding: 16px 0;
  }

  ::v-deep(.arco-pagination) {
    .arco-pagination-item,
    .arco-pagination-item-previous,
    .arco-pagination-item-next {
      color: rgb(255 255 255 / 85%);
      background: rgb(255 255 255 / 8%);
      border: 1px solid rgb(255 255 255 / 15%);
      border-radius: 4px;

      &:hover:not(.arco-pagination-item-disabled) {
        color: #fff;
        background: rgb(23 150 250 / 20%);
        border-color: rgb(23 150 250 / 50%);
      }
    }

    .arco-pagination-item-active {
      color: #fff;
      font-weight: 500;
      background: linear-gradient(135deg, #1796fa 0%, #0d6fbe 100%);
      border-color: #1796fa;
    }

    .arco-pagination-item-disabled {
      color: rgb(255 255 255 / 30%);
      background: rgb(255 255 255 / 4%);
      border-color: rgb(255 255 255 / 8%);
    }

    .arco-pagination-options-size-changer {
      .arco-select-view {
        color: rgb(255 255 255 / 85%);
        background: rgb(255 255 255 / 8%);
        border-color: rgb(255 255 255 / 15%);

        &:hover {
          background: rgb(255 255 255 / 12%);
          border-color: rgb(23 150 250 / 50%);
        }
      }
    }

    .arco-pagination-total {
      color: rgb(255 255 255 / 70%);
    }

    .arco-pagination-jumper {
      .arco-pagination-jumper-prepend,
      .arco-pagination-jumper-append {
        color: rgb(255 255 255 / 70%);
      }

      .arco-input {
        color: rgb(255 255 255 / 85%);
        background: rgb(255 255 255 / 8%);
        border-color: rgb(255 255 255 / 15%);

        &:hover {
          border-color: rgb(23 150 250 / 50%);
        }
      }
    }
  }

  // 下拉菜单样式
  ::v-deep(.arco-select-dropdown),
  ::v-deep(.arco-tree-select-dropdown) {
    background: rgb(10 30 60 / 95%);
    border: 1px solid rgb(23 150 250 / 30%);
    backdrop-filter: blur(10px);

    .arco-select-option {
      color: rgb(255 255 255 / 85%);

      &:hover {
        color: #fff;
        background: rgb(23 150 250 / 15%);
      }

      &.arco-select-option-selected {
        color: #1796fa;
        background: rgb(23 150 250 / 25%);
      }
    }

    .arco-tree {
      background: transparent;

      .arco-tree-node {
        color: rgb(255 255 255 / 85%);

        &:hover {
          color: #fff;
          background: rgb(23 150 250 / 15%);
        }

        &.arco-tree-node-selected {
          color: #1796fa;
          background: rgb(23 150 250 / 25%);
        }
      }
    }
  }
</style>
