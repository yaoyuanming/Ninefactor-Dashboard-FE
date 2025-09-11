<template>
  11111111111
  <ContentWrap>
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center">
        <el-icon class="mr-2 cursor-pointer" @click="goBack">
          <ArrowLeft />
        </el-icon>
        <h2 class="text-lg font-medium">隐患数据填报情况</h2>
      </div>
      <el-button type="primary" @click="handleAdd">数据填报</el-button>
    </div>

    <!-- 进度条 -->
    <el-card class="mb-4">
      <div class="flex items-center justify-between mb-2">
        <div class="text-lg font-bold">60/100</div>
        <div class="text-gray-500 text-sm">已填报/总任务</div>
      </div>
      <el-progress :percentage="60" :show-text="false" />
    </el-card>

    <!-- 搜索区域 -->
    <el-card class="mb-4">
      <el-form :model="queryParams" inline>
        <el-form-item label="申请编号">
          <el-input v-model="queryParams.code" placeholder="请输入申请编号" clearable />
        </el-form-item>
        <el-form-item label="隐患等级">
          <el-select v-model="queryParams.level" placeholder="全部" clearable>
            <el-option label="一级隐患" value="1" />
            <el-option label="二级隐患" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            <Icon icon="ep:search" class="mr-1" /> 搜索
          </el-button>
          <el-button @click="resetQuery">
            <Icon icon="ep:refresh" class="mr-1" /> 重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card>
      <el-table :data="dataList" v-loading="loading" border>
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column label="隐患描述" prop="description" min-width="200" show-overflow-tooltip />
        <el-table-column label="隐患照片" width="100">
          <template #default="{ row }">
            <el-image 
              :src="row.image" 
              style="width: 50px; height: 50px" 
              :preview-src-list="[row.image]"
              fit="cover"
            />
          </template>
        </el-table-column>
        <el-table-column label="隐患等级" prop="level" width="100" />
        <el-table-column label="隐患来源" prop="source" width="100" />
        <el-table-column label="隐患位置" prop="location" width="120" />
        <el-table-column label="整改责任人" prop="responsiblePerson" width="100" />
        <el-table-column label="发现日期" prop="findDate" width="100" />
        <el-table-column label="整改状态" prop="status" width="100" />
        <el-table-column label="整改完成日期" prop="completeDate" width="120" />
        <el-table-column label="整改照片" width="100">
          <template #default="{ row }">
            <el-image 
              v-if="row.completeImage"
              :src="row.completeImage" 
              style="width: 50px; height: 50px" 
              :preview-src-list="[row.completeImage]"
              fit="cover"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <!-- <Pagination
        v-if="total > 0"
        :total="total"
        v-model:page="queryParams.pageNo"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      /> -->
    </el-card>
  </ContentWrap>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import { Icon } from '@/components/Icon'
// import { Pagination } from '@/components/Pagination'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

defineOptions({ name: 'WorkbenDatafillingDetail' })

const router = useRouter()

// 查询参数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  code: '',
  level: undefined
})

// 表格数据
const dataList = ref([
  {
    description: '机房第一层次光纤连接线路存在安全隐患，需要更换',
    image: 'https://via.placeholder.com/50',
    level: '一级隐患',
    source: '日常巡查',
    location: '一号车间',
    responsiblePerson: '刘芳',
    findDate: '2024-11-07',
    status: '已整改',
    completeDate: '2024-12-06',
    completeImage: 'https://via.placeholder.com/50'
  },
  {
    description: '高压配电室内17号高压柜存在漏电风险，已电流过大',
    image: 'https://via.placeholder.com/50',
    level: '二级隐患',
    source: '日常巡查',
    location: '配电室三楼（一号配电室）变压器旁边（17号柜）',
    responsiblePerson: '李明',
    findDate: '2024-10-16',
    status: '已整改',
    completeDate: '2024-11-15',
    completeImage: 'https://via.placeholder.com/50'
  }
])

const total = ref(60)
const loading = ref(false)

// 获取列表数据
const getList = async () => {
  loading.value = true
  try {
    // 这里应该调用API获取数据
    // const res = await getDataFillingList(queryParams)
    // dataList.value = res.list
    // total.value = res.total
    
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 500))
  } finally {
    loading.value = false
  }
}

// 查询
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

// 重置
const resetQuery = () => {
  queryParams.code = ''
  queryParams.level = undefined
  handleQuery()
}

// 新增
const handleAdd = () => {
  // 跳转到填报页面
  router.push('/workbenches/dataFilling/add')
}

// 返回
const goBack = () => {
  router.back()
}

onMounted(() => {
  getList()
})
</script>
