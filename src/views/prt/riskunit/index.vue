<template>
  <ContentWrap>
    <div style="font-weight: bold">风险单元</div>
    <!-- 搜索工作栏 -->
    <el-row style="margin-bottom: 10px">
      <el-col :span="18">
        <el-space wrap>
          风险单元
          <el-input
            v-model="queryParams.riskUnitName"
            placeholder="请输入风险单元名称"
            clearable
            @keyup.enter="handleQuery"
            class="!w-240px"
          />
          固有风险等级
          <el-select
            v-model="queryParams.riskLevel"
            placeholder="请选择固有风险等级"
            clearable
            @change="handleQuery"
            class="!w-240px"
          >
            <el-option
              :label="item.label"
              :value="item.value"
              v-for="(item, key) in getIntDictOptions(DICT_TYPE.RISKLEVEL)"
              :key="key"
            />
          </el-select>
          整体风险等级
          <el-select
            v-model="queryParams.overallRisk"
            placeholder="请选择固有风险等级"
            clearable
            @change="handleQuery"
            class="!w-240px"
          >
            <el-option
              :label="item.label"
              :value="item.value"
              v-for="(item, key) in getIntDictOptions(DICT_TYPE.RISKLEVEL)"
              :key="key"
            />
          </el-select>
          <el-button @click="handleQuery">
            <Icon icon="ep:search" class="mr-5px" />
            搜索
          </el-button>
          <el-button @click="resetQuery">
            <Icon icon="ep:refresh" class="mr-5px" />
            重置
          </el-button>
        </el-space>
      </el-col>
      <el-col :span="6" style="text-align: right">
        <el-space wrap>
          <el-button type="primary" plain @click="openForm()" v-hasPermi="['prt:risk-unit:create']">
            <Icon icon="ep:plus" class="mr-5px" />
            新增
          </el-button>
          <el-button
            type="success"
            plain
            @click="handleExport"
            :loading="exportLoading"
            v-hasPermi="['prt:risk-unit:import']"
          >
            <Icon icon="ep:download" class="mr-5px" />
            导入
          </el-button>
          <el-button
            type="success"
            plain
            @click="handleExport"
            :loading="exportLoading"
            v-hasPermi="['prt:risk-unit:export']"
          >
            <Icon icon="ep:download" class="mr-5px" />
            导出
          </el-button>
        </el-space>
      </el-col>
    </el-row>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="风险单元名称" align="center" prop="riskUnitName" />
      <el-table-column label="固有风险" align="center" prop="riskLevel">
        <template #default="scope">
          <el-tag
            v-if="scope.row.riskLevel == 2"
            style="background: #c7d3f5; border: 1px solid #959fc1; color: #434343"
          >
            {{ getDictLabel(DICT_TYPE.RISKLEVEL, scope.row.riskLevel) }}
          </el-tag>
          <el-tag
            v-if="scope.row.riskLevel == 5"
            style="background: #F0E68C; border: 1px solid #bab25b; color: #434343"
          >
            {{ getDictLabel(DICT_TYPE.RISKLEVEL, scope.row.riskLevel) }}
          </el-tag>
          <el-tag
            v-if="scope.row.riskLevel == 8"
            style="background: #fff0da; border: 1px solid #afa18e; color: #434343"
          >
            {{ getDictLabel(DICT_TYPE.RISKLEVEL, scope.row.riskLevel) }}
          </el-tag>
          <el-tag
            v-if="scope.row.riskLevel == 10"
            style="background: #f6d4cd; border: 1px solid #bca39e; color: #434343"
          >
            {{ getDictLabel(DICT_TYPE.RISKLEVEL, scope.row.riskLevel) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="整体风险" align="center" prop="overallRisk">
        <template #default="scope">
          <el-tag
            v-if="scope.row.overallRisk == 2"
            style="background: #c7d3f5; border: 1px solid blue; color: #434343"
          >
            {{ getDictLabel(DICT_TYPE.RISKLEVEL, scope.row.overallRisk) }}
          </el-tag>
          <el-tag
            v-if="scope.row.overallRisk == 5"
            style="background: #e6e554; border: 1px solid #a3a344; color: #434343"
          >
            {{ getDictLabel(DICT_TYPE.RISKLEVEL, scope.row.overallRisk) }}
          </el-tag>
          <el-tag
            v-if="scope.row.overallRisk == 8"
            style="background: #fff0da; border: 1px solid orange; color: #434343"
          >
            {{ getDictLabel(DICT_TYPE.RISKLEVEL, scope.row.overallRisk) }}
          </el-tag>
          <el-tag
            v-if="scope.row.overallRisk == 10"
            style="background: #f6d4cd; border: 1px solid red; color: #434343"
          >
            {{ getDictLabel(DICT_TYPE.RISKLEVEL, scope.row.overallRisk) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="120px" fixed="right">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm(scope.row.id)"
            v-hasPermi="['prt:risk-unit:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['prt:risk-unit:delete']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <RiskUnitForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { RiskUnitApi, RiskUnitVO } from '@/api/prt/riskunit'
import RiskUnitForm from './RiskUnitForm.vue'
import { useRouter } from 'vue-router'
import { DICT_TYPE, getIntDictOptions, getDictLabel } from '@/utils/dict'

/** 风险单元 列表 */
defineOptions({ name: 'RiskUnit' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<RiskUnitVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = ref({
  pageNo: 1,
  pageSize: 10,
  deptId: undefined,
  riskUnitName: undefined,
  riskPoint: undefined,
  riskLevel: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中
const lists = [
  {
    value: 2,
    label: '低风险'
  },
  {
    value: 5,
    label: '一般风险'
  },
  {
    value: 8,
    label: '较大风险'
  },
  {
    value: 10,
    label: '重大风险'
  }
]
const getValue = (value: number) => {
  let str = ''
  lists.forEach((i) => {
    if (i.value == value) {
      str = i.label
    }
  })
  return str
}
/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await RiskUnitApi.getRiskUnitPage(queryParams.value)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryParams.value = {
    pageNo: 1,
    pageSize: 10,
    deptId: undefined,
    riskUnitName: undefined,
    riskPoint: undefined,
    riskLevel: undefined,
    createTime: []
  }
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const router = useRouter() // 路由
const openForm = (id?: number) => {
  router.push({
    name: 'riskUnitEdit',
    query: { id: id }
  })
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm(
      '确定删除该风险单元，确认后该风险单元关联的风险点也将同步删除，请谨慎操作!',
      '删除提示'
    )
    // 发起删除
    await RiskUnitApi.deleteRiskUnit(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await RiskUnitApi.exportRiskUnit(queryParams.value)
    download.excel(data, '风险单元.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
