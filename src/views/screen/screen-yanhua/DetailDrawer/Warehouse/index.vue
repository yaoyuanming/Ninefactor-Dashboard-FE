<template>
    <div class="warehouse-overview">
        <!-- 标签页 -->
        <a-tabs v-model:active-key="activeKey">
            <a-tab-pane title="仓库" key="warehouse">
                <!-- 搜索区域 -->
                <div class="search-area">
                    <a-input v-model:value="searchValue" placeholder="请输入仓库名称或仓库编号"
                        style="width: 200px; margin-right: 8px;" />
                    <a-button type="primary" @click="handleSearch">搜索</a-button>
                    <a-button style="margin-left: 8px;" @click="handleReset">重置</a-button>
                </div>

                <!-- 表格区域 -->
                <a-table :loading="loading" :columns="currentColumns" :data="tableData" bordered
                    :pagination="pagination" @page-change="handlePageChange">
                    <template #empty>
                        <div>暂无数据</div>
                    </template>
                </a-table>
            </a-tab-pane>
            <a-tab-pane title="库房" key="storage-room">
                <!-- 搜索区域（与仓库标签页共用搜索值） -->
                <div class="search-area">
                    <a-input v-model:value="searchValue" placeholder="请输入库房名称或库房编号"
                        style="width: 200px; margin-right: 8px;" />
                    <a-button type="primary" @click="handleSearch">搜索</a-button>
                    <a-button style="margin-left: 8px;" @click="handleReset">重置</a-button>
                </div>

                <!-- 库房表格区域 -->
                <a-table :loading="loading" :columns="storageRoomColumns" :data="tableData" bordered
                    :pagination="pagination" @page-change="handlePageChange">
                </a-table>
            </a-tab-pane>
        </a-tabs>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getRepositoryList, getWarehouseList } from '@/api/compmonitoring';

// 激活的标签页key
const activeKey = ref('warehouse');
// 搜索值
const searchValue = ref('');
// 表格加载状态
const loading = ref(false);
// 表格数据
const tableData = ref([]);

// 分页配置
const pagination = ref({
    total: 0,
    pageSize: 10,
    current: 1,
    showTotal: (total: number) => `共 ${total} 条`,
    showQuickJumper: true,
});

// 仓库表格列配置
const warehouseColumns = [
    {
        title: '仓库名称',
        dataIndex: 'warehouseName',
    },
    {
        title: '仓库编号',
        dataIndex: 'warehouseNum',
    },
    {
        title: '面积(m²)',
        dataIndex: 'acreage',
    },
    {
        title: '危险等级',
        dataIndex: 'dangerLevel',
    },
    {
        title: '剂量(千克)',
        dataIndex: 'dosage',
    },
    {
        title: '位置',
        dataIndex: 'location',
    },
    {
        title: '人员限制',
        dataIndex: 'personLimit',
    },
    {
        title: '创建时间',
        dataIndex: 'createDate',
    },
];

// 库房表格列配置
const storageRoomColumns = [
    {
        title: '库房名称',
        dataIndex: 'roomName',
    },
    {
        title: '库房编号',
        dataIndex: 'roomNum',
    },
    {
        title: '面积(m²)',
        dataIndex: 'acreage',
    },
    {
        title: '危险等级',
        dataIndex: 'dangerLevel',
    },
    {
        title: '剂量(千克)',
        dataIndex: 'dosage',
    },
    {
        title: '人员限制',
        dataIndex: 'personLimit',
    },
    {
        title: '创建人',
        dataIndex: 'createBy',
    },
    {
        title: '创建日期',
        dataIndex: 'createDate',
    },
];

// 根据激活的标签页，动态选择表格列
const currentColumns = computed(() => {
    console.log(111)
    return activeKey.value === 'warehouse' ? warehouseColumns : storageRoomColumns;
});

// 搜索方法
const handleSearch = () => {
    loading.value = true;
    const requestParams = {
        ...(searchValue.value ? { keyword: searchValue.value } : {}), 
        pageNo: pagination.value.current,
        pageSize: pagination.value.pageSize,
    };

    if (activeKey.value === 'warehouse') {
        getRepositoryList(requestParams)
            .then((res) => {
                tableData.value = res.data.records;
                pagination.value.total = res.total;
            })
            .finally(() => {
                loading.value = false;
            });
    } else {
        getWarehouseList(requestParams)
            .then((res) => {
                tableData.value = res.data.records;
                pagination.value.total = res.total;
            })
            .finally(() => {
                loading.value = false;
            });
    }
};

// 重置方法
const handleReset = () => {
    searchValue.value = '';
    handleSearch();
};

// 分页变更方法
const handlePageChange = (current: number) => {
    pagination.value.current = current;
    handleSearch();
};

onMounted(() => {
    handleSearch();
});
</script>

<style scoped>
::v-deep(.arco-tabs-nav)::before {
    background-color: transparent;
}

.warehouse-overview {
    padding: 16px;
    background-color: #0f2b48;
    color: #fff;
}

.search-area {
    margin-bottom: 16px;
}
</style>