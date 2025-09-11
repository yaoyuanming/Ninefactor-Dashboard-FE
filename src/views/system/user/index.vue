<template>
  <doc-alert title="用户体系" url="https://doc.iocoder.cn/user-center/" />
  <doc-alert title="三方登陆" url="https://doc.iocoder.cn/social-user/" />
  <doc-alert title="Excel 导入导出" url="https://doc.iocoder.cn/excel-import-and-export/" />
<!-- <el-button @click="isShow">test</el-button>-->
  <el-row :gutter="20">
    <!-- 左侧部门树 -->
<!--    <el-collapse-transition>-->
    <el-col :span="4" :xs="24" v-show="myShow" style="height: 100%;">
      <div class="relative" style="height: 100%;">
        <!-- 隐藏按钮 -->
        <div
          style="height: 100%;"
          class="absolute top-1/2 -right-3 transform -translate-y-1/2 z-10 cursor-pointer"
          @click="myShow = false"
        >
          <el-button
            style="margin-left: -10px;"
            type="primary"
            size="small"
            circle
            class="shadow-md"
          >
            <Icon icon="ep:arrow-left" />
          </el-button>
        </div>
        <ContentWrap class="h-1/1 relative">
          <DeptTree @node-click="handleDeptNodeClick" style="height: 900px;"/>
        </ContentWrap>
      </div>
    </el-col>
<!--    </el-collapse-transition>-->

    <el-col :span="myShow == true?20:24" :xs="24">
      <!-- 展开按钮（当左侧隐藏时显示） -->
      <div
        style="height: 100%;"
        v-show="!myShow"
        class="absolute top-1/2 -left-3 transform -translate-y-1/2 z-10 cursor-pointer"
        @click="myShow = true"
      >
        <el-button
          style="margin-left: 10px;"
          type="primary"
          size="small"
          circle
          class="shadow-md"
        >
          <Icon icon="ep:arrow-right" />
        </el-button>
      </div>
      <div>
        <!-- 搜索 -->
        <ContentWrap>
          <div style="margin-bottom: 10px;font-weight: bold;">{{deptName}}</div>
          <el-form
            class="-mb-15px"
            :model="queryParams"
            ref="queryFormRef"
            :inline="true"
            label-width="68px"
          >
            <el-form-item label="用户账号" prop="username">
              <el-input
                v-model="queryParams.username"
                placeholder="请输入用户账号"
                clearable
                @keyup.enter="handleQuery"
                class="!w-240px"
              />
            </el-form-item>
            <el-form-item label="手机号码" prop="mobile">
              <el-input
                v-model="queryParams.mobile"
                placeholder="请输入手机号码"
                clearable
                @keyup.enter="handleQuery"
                class="!w-240px"
              />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select
                v-model="queryParams.status"
                placeholder="用户状态"
                clearable
                class="!w-240px"
              >
                <el-option
                  v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="创建时间" prop="createTime">
              <el-date-picker
                v-model="queryParams.createTime"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="datetimerange"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                class="!w-240px"
              />
            </el-form-item>
            <el-form-item>
              <el-button @click="handleQuery">
                <Icon icon="ep:search" />
                搜索
              </el-button>
              <el-button @click="resetQuery">
                <Icon icon="ep:refresh" />
                重置
              </el-button>
              <el-button
                type="primary"
                plain
                @click="openForm('create')"
                v-hasPermi="['system:user:create']"
              >
                <Icon icon="ep:plus" />
                新增
              </el-button>
              <el-button
                type="warning"
                plain
                @click="handleImport"
                v-hasPermi="['system:user:import']"
              >
                <Icon icon="ep:download" />
                导入
              </el-button>
              <el-button
                type="success"
                plain
                @click="handleExport"
                :loading="exportLoading"
                v-hasPermi="['system:user:export']"
              >
                <Icon icon="ep:upload" />
                导出
              </el-button>
            </el-form-item>
          </el-form>
        </ContentWrap>
        <ContentWrap>
          <el-table v-loading="loading" :data="list">
            <!--          <el-table-column label="用户编号" align="center" key="id" prop="id" />-->
            <el-table-column
              label="姓名"
              align="center"
              prop="nickname"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="登录账号"
              align="center"
              prop="username"
              :show-overflow-tooltip="true"
            />
            <el-table-column label="手机号" align="center" prop="mobile" width="120" />
            <!-- <el-table-column
              label="工号"
              align="center"
              :show-overflow-tooltip="true"
              prop="empCode"
            /> -->
            <el-table-column
              label="部门"
              align="center"
              key="deptName"
              prop="deptName"
              :show-overflow-tooltip="true"
            />
            <!-- <el-table-column
              label="人员类型"
              align="center"
              key="empTypes"
              :show-overflow-tooltip="true"
              prop="empTypes"
            >
              <template #default="scope">
                {{ getEmpTypes(scope.row.empTypes) }}
              </template>
            </el-table-column> -->
            <!-- <el-table-column
              label="岗位"
              align="center"
              key="postIds"
              :show-overflow-tooltip="true"
              prop="postIds"
            >
              <template #default="scope">
                {{ getPostName(scope.row.postIds) }}
              </template>
            </el-table-column> -->
            <!--          <el-table-column label="状态" key="status">-->
            <!--            <template #default="scope">-->
            <!--              <el-switch-->
            <!--                v-model="scope.row.status"-->
            <!--                :active-value="0"-->
            <!--                :inactive-value="1"-->
            <!--                @change="handleStatusChange(scope.row)"-->
            <!--                :disabled="!checkPermi(['system:user:update'])"-->
            <!--              />-->
            <!--            </template>-->
            <!--          </el-table-column>-->
            <!--          <el-table-column-->
            <!--            label="创建时间"-->
            <!--            align="center"-->
            <!--            prop="createTime"-->
            <!--            :formatter="dateFormatter"-->
            <!--            width="180"-->
            <!--          />-->
            <el-table-column label="操作" align="center" width="160">
              <template #default="scope">
                <div class="flex items-center justify-center">
                  <el-button
                    type="primary"
                    link
                    @click="openForm('update', scope.row.id)"
                    v-hasPermi="['system:user:update']"
                  >
                    <Icon icon="ep:edit" />
                    修改
                  </el-button>
                  <el-dropdown
                    @command="(command) => handleCommand(command, scope.row)"
                    v-hasPermi="[
                    'system:user:delete',
                    'system:user:update-password',
                    'system:permission:assign-user-role'
                  ]"
                  >
                    <el-button type="primary" link>
                      <Icon icon="ep:d-arrow-right" />
                      更多
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item
                          command="handleDelete"
                          v-if="checkPermi(['system:user:delete'])"
                        >
                          <Icon icon="ep:delete" />
                          删除
                        </el-dropdown-item>
                        <el-dropdown-item
                          command="handleResetPwd"
                          v-if="checkPermi(['system:user:update-password'])"
                        >
                          <Icon icon="ep:key" />
                          重置密码
                        </el-dropdown-item>
                        <el-dropdown-item
                          command="handleRole"
                          v-if="checkPermi(['system:permission:assign-user-role'])"
                        >
                          <Icon icon="ep:circle-check" />
                          分配角色
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <Pagination
            :total="total"
            v-model:page="queryParams.pageNo"
            v-model:limit="queryParams.pageSize"
            @pagination="getList"
          />
        </ContentWrap>
      </div>
    </el-col>
  </el-row>

  <!-- 添加或修改用户对话框 -->
  <UserForm ref="formRef" @success="getList" />
  <!-- 用户导入对话框 -->
  <UserImportForm ref="importFormRef" @success="getList" />
  <!-- 分配角色 -->
  <UserAssignRoleForm ref="assignRoleFormRef" @success="getList" />
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { checkPermi } from '@/utils/permission'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { CommonStatusEnum } from '@/utils/constants'
import * as UserApi from '@/api/system/user'
import UserForm from './UserForm.vue'
import UserImportForm from './UserImportForm.vue'
import UserAssignRoleForm from './UserAssignRoleForm.vue'
import DeptTree from './DeptTree.vue'
import * as PostApi from '@/api/system/post'

defineOptions({ name: 'SystemUser' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const myShow = ref(true)
const isShow = ()=>{
  return myShow.value = !myShow.value
}
const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  username: undefined,
  mobile: undefined,
  status: undefined,
  deptId: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await UserApi.getUserPage(queryParams)
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
  queryFormRef.value?.resetFields()
  handleQuery()
}
let deptName = ref("全部")
/** 处理部门被点击 */
const handleDeptNodeClick = async (row) => {
  queryParams.deptId = row.id
  console.log(row)
  deptName.value = row.name
  await getList()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 用户导入 */
const importFormRef = ref()
const handleImport = () => {
  importFormRef.value.open()
}

/** 修改用户状态 */
const handleStatusChange = async (row: UserApi.UserVO) => {
  try {
    // 修改状态的二次确认
    const text = row.status === CommonStatusEnum.ENABLE ? '启用' : '停用'
    await message.confirm('确认要"' + text + '""' + row.username + '"用户吗?')
    // 发起修改状态
    await UserApi.updateUserStatus(row.id, row.status)
    // 刷新列表
    await getList()
  } catch {
    // 取消后，进行恢复按钮
    row.status =
      row.status === CommonStatusEnum.ENABLE ? CommonStatusEnum.DISABLE : CommonStatusEnum.ENABLE
  }
}

/** 导出按钮操作 */
const exportLoading = ref(false)
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await UserApi.exportUser(queryParams)
    download.excel(data, '用户数据.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 操作分发 */
const handleCommand = (command: string, row: UserApi.UserVO) => {
  switch (command) {
    case 'handleDelete':
      handleDelete(row.id)
      break
    case 'handleResetPwd':
      handleResetPwd(row)
      break
    case 'handleRole':
      handleRole(row)
      break
    default:
      break
  }
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await UserApi.deleteUser(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 重置密码 */
const handleResetPwd = async (row: UserApi.UserVO) => {
  try {
    // 重置的二次确认
    const result = await message.prompt(
      '请输入"' + row.username + '"的新密码',
      t('common.reminder')
    )
    const password = result.value
    // 发起重置
    await UserApi.resetUserPwd(row.id, password)
    message.success('修改成功，新密码是：' + password)
  } catch {}
}

/** 分配角色 */
const assignRoleFormRef = ref()
const handleRole = (row: UserApi.UserVO) => {
  assignRoleFormRef.value.open(row)
}

const getEmpTypes = (value) => {
  let str = []
  if (value != null) {
    value.split(',').forEach((item) => {
      getIntDictOptions(DICT_TYPE.SYSTEM_EMP_TYPE).forEach((i) => {
        if (i.value == item) {
          str.push(i.label)
        }
      })
    })
  }
  return str.toString()
}
const getPostName = (val) => {
  let str = []
  if (val != null) {
    val.forEach((item) => {
      postList.value.forEach((i) => {
        if (i.id == item) {
          str.push(i.name)
        }
      })
    })
  }
  return str.toString()
}
let postList = ref([])
/** 初始化 */
onMounted(async () => {
  await getList()
  postList.value = await PostApi.getSimplePostList()
})
</script>
