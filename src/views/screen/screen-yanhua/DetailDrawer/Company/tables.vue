<template>
    <div class="enterprise-statistics" v-show="showInfo">
        <!-- 顶部统计卡片 -->
        <a-row :gutter="16">
            <a-col :span="4">
                <a-card title="企业总数" :bordered="false">
                    <div class="card-value">{{ props.data.shouldAccessCount }}</div>
                </a-card>
            </a-col>
            <a-col :span="4">
                <a-card title="已上报企业数" :bordered="false">
                    <div class="card-value">{{ props.data.accessedCount }}</div>
                </a-card>
            </a-col>
            <a-col :span="4">
                <a-card title="未上报企业数" :bordered="false">
                    <div class="card-value">{{ props.data.notAccessedCount }}</div>
                </a-card>
            </a-col>
            <a-col :span="4">
                <a-card title="规上企业" :bordered="false">
                    <div class="card-value">{{ props.data.largeEnterpriseCount }}</div>
                </a-card>
            </a-col>
            <a-col :span="4">
                <a-card title="中等企业" :bordered="false">
                    <div class="card-value">{{ props.data.mediumEnterpriseCount }}</div>
                </a-card>
            </a-col>
            <a-col :span="4">
                <a-card title="小微企业" :bordered="false">
                    <div class="card-value">{{ props.data.smallEnterpriseCount }}</div>
                </a-card>
            </a-col>
        </a-row>

        <!-- 筛选表单 -->
        <a-form :model="searchForm" layout="inline" style="margin: 20px 0;">
            <a-form-item label="企业名称">
                <a-input v-model="searchForm.enterpriseName" placeholder="请输入企业名称" />
            </a-form-item>
            <a-form-item label="区域">
                <RegionSelect v-model="searchForm.areaCode" />
            </a-form-item>
            <a-form-item label="国民经济类型">
                <a-tree-select :field-names="{
                    key: 'id',
                    title: 'label',
                }" v-model="searchForm.industryCode" :data="IndustryList" :allow-search="true" :allow-clear="true"
                    :disable-filter="true" placeholder="请选择国民经济类型" style="width: 100%"
                    @search="onSearch"></a-tree-select>
            </a-form-item>
            <a-form-item label="整体风险等级">
                <a-select v-model="searchForm.riskLevel" placeholder="请选择整体风险等级">
                    <a-option :value="options.dictValue" v-for="options in LeveList" :key="options.dictCode">{{
                        options.dictLabel }}</a-option>
                </a-select>
            </a-form-item>
            <a-form-item>
                <a-button type="primary" @click="handleSearch">搜索</a-button>
            </a-form-item>
            <a-form-item>
                <a-button @click="handleReset">重置</a-button>
            </a-form-item>
        </a-form>

        <!-- 企业列表表格 -->
        <a-table :columns="columns" :loading="loading" :data="enterpriseData" bordered :pagination="false">
            <template #operation="{ record }">
                <a-link @click="handleEnterpriseInfo(record)">企业信息</a-link>
            </template>
        </a-table>

        <div class="pagination">
            <a-pagination v-if="total != 0" :total="total" @change="handelChange" />
        </div>
    </div>
    <CompanyDetail v-show="!showInfo" ref="CompanyDetailForm" @back="showInfo = true" />
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { getEnterPageList } from '@/api/compmonitoring'
import { DictType, getIndustrySelect } from '@/api/system'
import RegionSelect from '../../components/RegionSelect/index.vue'
import CompanyDetail from './CompanyDetail.vue'
const props = defineProps<{
    data?: any;
}>();

const LeveList = ref([])
const IndustryList = ref([])
const loading = ref(false)
// 搜索表单数据
const searchForm = ref({
    enterpriseName: '',
    areaCode: '',
    industryCode: '',
    riskLevel: '',
    pageNo: 1,
    pageSize: 10
}) as any

const total = ref(0)

const showInfo = ref(true)
const CompanyDetailForm = ref(null) as any

// 表格列配置
const columns = [
    {
        title: '企业名称',
        dataIndex: 'enterpriseName',
    },
    {
        title: '统一信用代码',
        dataIndex: 'creditCode',
    },
    {
        title: '区域',
        dataIndex: 'areaCode',
    },
    {
        title: '国民经济类型',
        dataIndex: 'industryCode',
    },
    {
        title: '整体风险等级',
        dataIndex: 'riskLevel',
    },
    {
        title: '主要负责人',
        dataIndex: 'principal',
    },
    {
        title: '企业规模',
        dataIndex: 'enterpriseScale',
    },
    {
        title: '最近填报时间',
        dataIndex: 'lastReportTime',
    },
    {
        title: '企业状态',
        dataIndex: 'status',
    },
    {
        title: '操作',
        slotName: 'operation',
    },
];

// 企业列表数据
const enterpriseData = ref([]);

// 搜索方法
const handleSearch = () => {
    getList()
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
    getList()
};

// 企业信息方法
const handleEnterpriseInfo = async (record: any) => {
    showInfo.value = false
    await nextTick();
    if (CompanyDetailForm.value) {
        CompanyDetailForm.value.getRecord(record.id);
    } else {
        console.error('CompanyDetail组件实例为null，无法调用getRecord方法');
    }
};


// 获取分页列表数据
const getList = async () => {
    try {
        const statusMap = { 0: '关闭', 1: '正常', 2: '锁定' };
        let res = await getEnterPageList(searchForm.value) as any
        loading.value = true
        if (res.success) {
            total.value = res.data.total
            enterpriseData.value = res.data.records.map(val => {
                return {
                    ...val,
                    status: statusMap[val.status],
                    riskLevel: LeveList.value.find((news: any) => news.dictValue == val.riskLevel)?.dictLabel
                }
            })
            loading.value = false
        }
    } catch {
        loading.value = false
    }
}

// 获取字典
async function dictDetaile() {
    let res = await DictType('risk_level') as any
    if (res.success) {
        LeveList.value = res.data
    }
}

// 获取国民行业下拉列表
async function IndustrySelect() {
    let res = await getIndustrySelect() as any
    if (res.success) {
        IndustryList.value = res.data
    }
}

// 分页函数
function handelChange(num: number) {
    searchForm.value.pageNo = num
    getList()
}


// 搜索
function searchData(keyword) {
    const loop = (data) => {
        const result = [];
        data.forEach(item => {
            if (item.label.toLowerCase().indexOf(keyword.toLowerCase()) > -1) {
                result.push({ ...item });
            } else if (item.children) {
                const filterData = loop(item.children);
                if (filterData.length) {
                    result.push({
                        ...item,
                        children: filterData
                    })
                }
            }
        })
        return result;
    }

    return loop(IndustryList.value);
}

const onSearch = (searchKey) => {
    loading.value = true;
    setTimeout(() => {
        loading.value = false;
        IndustryList.value = searchData(searchKey);
    }, 200)
};

onMounted(async () => {
    await dictDetaile()
    await IndustrySelect()
    await getList()
})
</script>

<style scoped lang="less">
::v-deep(.arco-card-header-title) {
    text-align: center;
}

::v-deep(.arco-form-item-label) {
    color: #fff;
}

.card-value {
    font-size: 24px;
    font-weight: bold;
    margin-top: 10px;
    text-align: center;
}

.pagination {
    display: flex;
    justify-content: end;
    padding: 12px 0;
}
</style>