<template>
  <ContentWrap>
    <el-row :gutter="24">
      <el-col :span="6">
        <el-input
          v-model="test1"
          @keydown.enter="getUnitList"
          placeholder="风险单元名称"
          size="small"
        />
        <el-menu default-active="2" class="el-menu-vertical-demo" style="height: 100%">
          <el-menu-item
            :index="item.id"
            v-for="(item, key) in UnitList"
            :key="key"
            @click="openUnit(item)"
          >
            <div
              style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                min-height: 40px;
              "
            >
              <span style="flex: 1; text-align: left; word-break: break-all; line-height: 1.4;">{{ item.riskUnitName }}</span>
              <!-- <el-dropdown v-if="item.id != null">
                <span class="el-dropdown-link">
                  <Icon
                    icon="ep:more-filled"
                    style="border: 1px solid #bccafc; border-radius: 20%; background: #bccafc; flex-shrink: 0;"
                  />
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="openPage(item, 1)">编辑</el-dropdown-item>
                    <el-dropdown-item @click="openPage(item, 2)">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown> -->
            </div>
          </el-menu-item>
        </el-menu>
      </el-col>
      <el-col :span="18">
        <div style="font-weight: bold">{{ riskUnitName }}</div>
        <!-- 搜索工作栏 -->
        <div style="padding: 10px 0px">
          <el-space wrap>
            <el-tag style="background: #c7d3f5; border: 1px solid blue;color: #434343;"
              >低风险（{{ RiskStat.lowRiskCount }}）
            </el-tag>
            <el-tag style="background: #F0E68C; border: 1px solid #bab25b;color: #434343;"
              >一般风险（{{ RiskStat.generalRiskCount }}）
            </el-tag>
            <el-tag style="background: #fff0da; border: 1px solid orange;color: #434343;"
              >较大风险（{{ RiskStat.largeRiskCount }}）
            </el-tag>
            <el-tag style="background: #f6d4cd; border: 1px solid red;color: #434343;"
              >重大风险（{{ RiskStat.majorRiskCount }}）
            </el-tag>
          </el-space>
        </div>
        <el-row style="margin-bottom: 10px">
          <el-col :span="24">
            <el-space wrap>
              风险点名称
              <el-input
                v-model="queryParams.riskName"
                placeholder="请输入风险点名称"
                clearable
                @keyup.enter="handleQuery"
                class="!w-140px"
              />
              整体风险等级
              <el-select
                clearable
                @change="handleQuery"
                v-model="queryParams.overallRisk"
                placeholder="请选择"
                class="!w-140px"
              >
                <el-option
                  :label="item.label"
                  :value="item.value"
                  v-for="(item, key) in getIntDictOptions(DICT_TYPE.INHERENT_RISK)"
                  :key="key"
                />
              </el-select>
              类型
              <el-select
                clearable
                @change="handleQuery"
                v-model="queryParams.riskType"
                placeholder="请选择"
                class="!w-140px"
              >
                <el-option
                  :label="item.label"
                  :value="item.value"
                  v-for="(item, key) in getIntDictOptions(DICT_TYPE.RISKTYPE)"
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
              <el-button
                v-hasPermi="['prt:risk:create']"
                type="primary"
                plain
                @click="openForm('create', null, null)"
              >
                <Icon icon="ep:plus" class="mr-5px" />
                新增
              </el-button>
              <el-button
                type="success"
                plain
                @click="handleExport"
                :loading="exportLoading"
                v-hasPermi="['prt:risk:export']"
              >
                <Icon icon="ep:download" class="mr-5px" />
                导出
              </el-button>
            </el-space>
          </el-col>
        </el-row>
        <el-table
          v-loading="loading"
          :data="list"
          :stripe="true"
          :show-overflow-tooltip="true"
          style="overflow-x: auto; height: 600px"
        >
          <el-table-column label="风险点" align="center" prop="riskName" min-width="120" />
          <el-table-column label="整体风险等级" align="center" prop="overallRisk" min-width="120">
            <template #default="scope">
              <el-tag
                v-if="scope.row.overallRisk == 2"
                style="background: #c7d3f5; border: 1px solid blue;color: #434343;"
              >
                {{ getDictLabel(DICT_TYPE.INHERENT_RISK, scope.row.overallRisk) }}
              </el-tag>
              <el-tag
                v-if="scope.row.overallRisk == 5"
                style="background: #F0E68C; border: 1px solid #bab25b;color: #434343;"
              >
                {{ getDictLabel(DICT_TYPE.INHERENT_RISK, scope.row.overallRisk) }}
              </el-tag>
              <el-tag
                v-if="scope.row.overallRisk == 8"
                style="background: #fff0da; border: 1px solid orange;color: #434343;"
              >
                {{ getDictLabel(DICT_TYPE.INHERENT_RISK, scope.row.overallRisk) }}
              </el-tag>
              <el-tag
                v-if="scope.row.overallRisk == 10"
                style="background: #f6d4cd; border: 1px solid red;color: #434343;"
              >
                {{ getDictLabel(DICT_TYPE.INHERENT_RISK, scope.row.overallRisk) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="类型" align="center" prop="riskType" min-width="100">
            <template #default="scope">
              {{ getDictLabel(DICT_TYPE.RISKTYPE, scope.row.riskType) }}
            </template>
          </el-table-column>
          <el-table-column label="风险单元" align="center" prop="riskUnitName" min-width="150" />
          <el-table-column label="管控层级" align="center" prop="controlLevel" min-width="100">
            <template #default="scope">
              <span v-if="scope.row.controlLevel == 1">个人</span>
              <span v-else-if="scope.row.controlLevel == 2">单位</span>
              <span v-else-if="scope.row.controlLevel == 3">部门</span>
              <span v-else-if="scope.row.controlLevel == 4">岗位</span>
              <span v-else>{{ scope.row.controlLevel }}</span>
            </template>
          </el-table-column>
          <el-table-column label="责任部门名称" align="center" prop="respDeptName" min-width="120" />
          <el-table-column label="管控责任人" align="center" prop="respUserName" min-width="100" />
          <!-- <el-table-column label="操作" align="center" min-width="200px" fixed="right">
            <template #default="scope">
              <el-button
                link
                type="primary"
                @click="openForm('details', scope.row.id, null)"
                v-hasPermi="['prt:risk:details']"
              >
                详情
              </el-button>
              <el-button
                link
                type="primary"
                plain
                @click="openForm('create', scope.row.id, 'copy')"
                v-hasPermi="['prt:risk:copy']"
              >
                复制
              </el-button>
              <el-dropdown style="margin-top: 2px; margin-left: 15px" trigger="click">
                <el-button link type="primary">
                  更多
                  <Icon icon="ep-arrow-right" color="#000" :size="16" />
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu style="z-index: 9999;">
                    <el-dropdown-item @click="openForm('update', scope.row.id, null)">
                      编辑
                    </el-dropdown-item>
                    <el-dropdown-item @click="handleDelete(scope.row.id)">
                      删除
                    </el-dropdown-item>
                    <el-dropdown-item @click="openForm('create', scope.row.id, '1')">
                      风险定级
                    </el-dropdown-item>
                    <el-dropdown-item @click="openForm('create', scope.row.id, 3)">
                      导出风险分级管控清单
                    </el-dropdown-item>
                    <el-dropdown-item @click="openForm('create', scope.row.id, '2')">
                      生成风险告知卡
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-table-column> -->
        </el-table>
        <!-- 分页 -->
      </el-col>
    </el-row>
    <el-row :gutter="24">
      <el-col :span="6" style="text-align: center">
        <!-- <el-button style="margin-top: 10px" type="primary" @click="openPage({ id: undefined }, 1)">
          <Icon icon="ep:plus" />
          新增风险单元
        </el-button> -->
      </el-col>
      <el-col :span="18">
        <Pagination
          :total="total"
          v-model:page="queryParams.pageNo"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
        />
      </el-col>
    </el-row>
  </ContentWrap>
</template>

<script setup lang="ts">
import download from '@/utils/download'
import { getRiskStatisticsByCompId } from '@/api/standardization/risks'
import { RiskApi, RiskVO } from '@/api/prt/risk'
import { useRouter } from 'vue-router'

const router = useRouter() // 路由
import { DICT_TYPE, getIntDictOptions, getDictLabel } from '@/utils/dict'
import { RiskUnitApi } from '@/api/prt/riskunit'

/** 风险点 列表 */
defineOptions({ name: 'Risk' })

// 接收父组件传递的企业ID
const props = defineProps<{
  deptId: string
}>()

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<RiskVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const test1 = ref('')
const queryParams = ref({
  pageNo: 1,
  pageSize: 10,
  deptId: undefined,
  overallRisk: undefined,
  riskUnitId: undefined,
  riskName: undefined,
  inherentRisk: undefined,
  existingRisk: undefined,
  riskType: undefined,
  isEnable: undefined,
  controlEffectiveness: undefined,
  controlLevel: undefined,
  respDeptId: undefined,
  respDeptName: undefined,
  respUserId: undefined,
  respUserName: undefined,
  supervisorUser: undefined,
  inspectorUser: undefined,
  dataSources: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中
/** 查询风险单元列表 */
let UnitList = ref([])
const getUnitList = async () => {
  loading.value = true
  try {
    const data = await RiskUnitApi.getRiskUnitPage({
      pageNo: 1,
      pageSize: 100,
      riskUnitName: test1.value,
      deptId: props.deptId // 添加企业ID参数
    })
    UnitList.value = data.list
    if (test1.value == '') {
      UnitList.value.unshift({
        id: null,
        riskUnitName: '全部'
      })
    }
  } finally {
    loading.value = false
  }
}
let riskUnitName = ref('全部') //风险单元名称
// 打开页面
const openUnit = async (item) => {
  queryParams.value.riskUnitId = item.id
  riskUnitName.value = item.riskUnitName
  await getList()
}
const openPage = async (item, type) => {
  if (type == 1) {
    //   页面跳转
    router.push({
      name: 'riskUnitEdit',
      query: { id: item.id }
    })
  } else {
    //   删除
    handleDeleteUnit(item.id)
  }
}
/** 删除按钮操作 */
const handleDeleteUnit = async (id: number) => {
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
/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    // 使用父组件传递的企业ID作为deptId参数
    const params = {
      ...queryParams.value,
      deptId: props.deptId
    }
    const data = await RiskApi.getRiskPage(params)
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
    overallRisk: undefined,
    riskUnitId: undefined,
    riskName: undefined,
    inherentRisk: undefined,
    existingRisk: undefined,
    riskType: undefined,
    isEnable: undefined,
    controlEffectiveness: undefined,
    controlLevel: undefined,
    respDeptId: undefined,
    respDeptName: undefined,
    respUserId: undefined,
    respUserName: undefined,
    supervisorUser: undefined,
    inspectorUser: undefined,
    dataSources: undefined,
    riskName: undefined,
    createTime: []
  }
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number, flag: string) => {
  if (type == 'details') {
    router.push({
      name: 'risklistDetails',
      query: { id: id }
    })
  } else {
    router.push({
      name: 'risklistEdit',
      query: { id: id, flag: flag }
    })
  }
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await RiskApi.deleteRisk(id)
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
    const data = await RiskApi.exportRisk(queryParams.value)
    download.excel(data, '风险点.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}
import * as RiskLevelApi from '@/api/prt/risklevel'

let RiskLeveList = ref({ list: [] })
// 获取管控层级
const getRiskLevel1 = async () => {
  try {
    const response = await RiskLevelApi.RiskLevelApi.getRiskLevelPage(queryParams.value)
    RiskLeveList.value = response
  } catch (error) {
    console.error('获取管控层级失败:', error)
    RiskLeveList.value = { list: [] }
  }
}
const getValue = (item: any) => {
  let str = ''
  if (RiskLeveList.value.list != null) {
    RiskLeveList.value.list.forEach((i) => {
      if (i.id == item) {
        str = i.controlLevel
      }
    })
  }
  return str
}
let RiskStat = ref({
  lowRiskCount: '',
  generalRiskCount: '',
  largeRiskCount: '',
  majorRiskCount: ''
})
const getStat = async () => {
  try {
    const response = await getRiskStatisticsByCompId({ compId: props.deptId })
    if (response) {
      // 将返回的数据映射到 RiskStat 对应的值
      RiskStat.value = {
        lowRiskCount: response.lowRiskPoints || 0,
        generalRiskCount: response.mediumRiskPoints || 0,
        largeRiskCount: response.mediumHighRiskPoints || 0,
        majorRiskCount: response.highRiskPoints || 0
      }
    }
  } catch (error) {
    console.error('获取风险统计失败:', error)
    RiskStat.value = {
      lowRiskCount: 0,
      generalRiskCount: 0,
      largeRiskCount: 0,
      majorRiskCount: 0
    }
  }
}
/** 初始化 **/
onMounted(async () => {
  // await getRiskLevel1()
  await getList() // 风险点风险
  await getUnitList() // 风险单元
  await getStat() // 获得风险点统计
})

// 暴露给父组件调用的方法
const fetchRiskList = async () => {
  // await getRiskLevel1()
  await getList() 
  await getUnitList()
  await getStat()
}

// 暴露方法给父组件
defineExpose({
  fetchRiskList
})
</script>

<style scoped>
/* 确保下拉菜单能正常显示 */
:deep(.el-dropdown-menu) {
  z-index: 9999 !important;
}

:deep(.el-dropdown) {
  z-index: 9999 !important;
}

/* 确保下拉菜单项文字颜色可见 */
:deep(.el-dropdown-menu__item) {
  color: #606266 !important;
  font-size: 14px !important;
  line-height: 22px !important;
  padding: 5px 20px !important;
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: #f5f7fa !important;
  color: #409eff !important;
}

/* 修复表格内下拉菜单的层级问题 */
:deep(.el-table) {
  z-index: 1;
}

:deep(.el-table__body-wrapper) {
  z-index: 1;
}
</style>
