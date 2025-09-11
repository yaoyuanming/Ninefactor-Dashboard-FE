<template>
  <ContentWrap>
    <el-row>
      <el-col :span="12">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入平台名称"
          clearable
          @keydown.enter="handleQuery"
          class="!w-240px"
        />
      </el-col>
      <el-col :span="12" style="text-align: right">
        <el-button
          v-hasPermi="['system:tenant-platform:create']"
          type="primary" plain @click="openForm('create')"  >
          <Icon icon="ep:plus" class="mr-5px" />

          新增
        </el-button>
      </el-col>
    </el-row>
  </ContentWrap>
  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="平台名称" align="center" prop="name" />
      <el-table-column label="平台ID" align="center" prop="id" />
      <el-table-column label="平台编号" align="center" prop="code" />
      <el-table-column label="访问地址" align="center" prop="website" />
      <!--      <el-table-column label="平台英文名称" align="center" prop="enName" />-->
      <!--      <el-table-column label="平台logo" align="center" prop="logoUrl" />-->
      <!--      <el-table-column label="平台状态（0正常 1停用）" align="center" prop="status" />-->
      <!--      <el-table-column label="登录页背景图片" align="center" prop="loginBgUrl" />-->
      <!--      <el-table-column label="备注" align="center" prop="remark" />-->
      <!--      <el-table-column label="管理端样式配置（前端字段，根据前端配置定义）" align="center" prop="adminStyleConfig" />-->
      <!--      <el-table-column label="移动端样式配置（前端字段，根据前端配置定义）" align="center" prop="appStyleConfig" />-->
      <!--      <el-table-column-->
      <!--        label="创建时间"-->
      <!--        align="center"-->
      <!--        prop="createTime"-->
      <!--        :formatter="dateFormatter"-->
      <!--        width="180px"-->
      <!--      />-->
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
                      v-hasPermi="['system:tenant-platform:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['system:tenant-platform:delete']"
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
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { PlatformApi, PlatformVO } from '@/api/system/platform'
import {useRouter} from "vue-router";

/** 子平台 列表 */
defineOptions({ name: 'Platform' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<PlatformVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined,
  enName: undefined,
  logoUrl: undefined,
  code: undefined,
  status: undefined,
  website: undefined,
  loginBgUrl: undefined,
  remark: undefined,
  adminStyleConfig: undefined,
  appStyleConfig: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await PlatformApi.getPlatformPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}
const router = useRouter() // 路由
/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  // formRef.value.open(type, id)
  router.push({
    name: 'PlatformlistEdit',
    query: { id: id}
  })
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await PlatformApi.deletePlatform(id)
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
    const data = await PlatformApi.exportPlatform(queryParams)
    download.excel(data, '子平台.xls')
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
