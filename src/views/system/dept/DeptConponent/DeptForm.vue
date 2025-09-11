<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="上级部门" prop="parentId">
        <el-tree-select
          v-model="formData.parentId"
          :data="deptTree"
          :props="defaultProps"
          check-strictly
          default-expand-all
          placeholder="请选择上级部门"
          value-key="deptId"
        />
      </el-form-item>
      <el-form-item label="部门名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入部门名称" />
      </el-form-item>
<!--      <el-form-item label="显示排序" prop="sort">-->
<!--        <el-input-number v-model="formData.sort" :min="0" controls-position="right" />-->
<!--      </el-form-item>-->
      <!-- <el-form-item label="部门负责人" prop="leaderUserId">
        <el-select v-model="formData.leaderUserId" clearable placeholder="请输入负责人">
          <el-option
            v-for="item in userList"
            :key="item.id"
            :label="item.nickname"
            :value="item.id"
          />
        </el-select>

      </el-form-item> -->
      <!-- <el-form-item label="联系电话" prop="phone">
        <el-input v-model="formData.phone" maxlength="11" placeholder="请输入联系电话" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" maxlength="50" placeholder="请输入邮箱" />
      </el-form-item> -->
      <el-form-item label="区域" prop="regionId">
        <el-tree-select
          v-model="formData.regionId"
          :data="regionTree"
          :props="{
            label: 'regionName',
            value: 'primaryId',
            children: 'children'
          }"
          check-strictly
          default-expand-all
          placeholder="请选择区域"
          value-key="primaryId"
          clearable
          filterable
          @change="handleRegionChange"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="formData.status" clearable placeholder="请选择状态">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
  <OneSelect ref="userSelectFormRef" @confirm="handleUserSelectConfirm" />
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { defaultProps, handleTree } from '@/utils/tree'
import * as DeptApi from '@/api/system/dept'
import * as UserApi from '@/api/system/user'
import { CommonStatusEnum } from '@/utils/constants'
import { FormRules } from 'element-plus'
import { getRegionTree } from '@/api/systemSettings/dataApplication/region'

defineOptions({ name: 'SystemDeptForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  title: '',
  parentId: undefined,
  name: undefined,
  sort: undefined,
  leaderUserId: undefined,
  phone: undefined,
  email: undefined,
  status: CommonStatusEnum.ENABLE,
  regionId: undefined, // 当前选中的区域ID
  regionIdPath: [] // 完整的区域路径
})
const formRules = reactive<FormRules>({
  parentId: [{ required: true, message: '上级部门不能为空', trigger: 'blur' }],
  name: [{ required: true, message: '部门名称不能为空', trigger: 'blur' }],
  sort: [{ required: true, message: '显示排序不能为空', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }],
  phone: [
    { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  status: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
  regionId: [{ required: true, message: '区域不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref
const deptTree = ref() // 树形结构
const userList = ref<UserApi.UserVO[]>([]) // 用户列表
const regionTree = ref([])

/** 处理区域选择变化 */
const handleRegionChange = (selectedValue) => {
  console.log('区域选择变化:', selectedValue)
  console.log('当前区域树:', regionTree.value)

  if (!selectedValue) {
    formData.value.regionIdPath = []
    return
  }

  // 根据选中的值，获取完整的父级路径
  const path = getRegionPath(selectedValue, regionTree.value)
  console.log('获取到的路径:', path)
  formData.value.regionIdPath = path
}

/** 转换区域数据格式 */
const transformRegionData = (data) => {
  if (!data || !Array.isArray(data)) {
    return []
  }
  return data.map(item => ({
    id: item.id,
    primaryId: item.primaryId || item.id, // 数据库主键ID
    regionName: item.label || item.regionName,
    regionCode: item.id,
    label: item.label || item.regionName, // 用于显示
    value: item.primaryId || item.id, // 用于选择
    children: item.children ? transformRegionData(item.children) : []
  }))
}

/** 递归获取区域的完整路径 */
const getRegionPath = (targetId, nodes, currentPath = []) => {
  for (const node of nodes) {
    const newPath = [...currentPath, node.primaryId || node.id]

    if ((node.primaryId || node.id) === targetId) {
      return newPath
    }

    if (node.children && node.children.length > 0) {
      const result = getRegionPath(targetId, node.children, newPath)
      if (result) {
        return result
      }
    }
  }
  return null
}

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      const data = await DeptApi.getDept(id)
      formData.value = data
      // 处理 regionId 回显：从路径字符串中取最后一个值作为选中值
      if (data.regionId && typeof data.regionId === 'string') {
        const pathArray = data.regionId.split(',').map(id => parseInt(id.trim()))
        formData.value.regionId = pathArray[pathArray.length - 1] // 取最后一个值
        formData.value.regionIdPath = pathArray // 保存完整路径
      }
    } finally {
      formLoading.value = false
    }
  }
  // 获得用户列表
  userList.value = await UserApi.getSimpleUserList()
  // 获得部门树
  await getTree()
  // 获得区域树
  try {
    const regionData = await getRegionTree()
    
    // 转换数据格式以适配 el-tree-select
    regionTree.value = transformRegionData(regionData)
  
  } catch (error) {
    console.error('获取区域树失败:', error)
    message.error('获取区域数据失败')
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗
let userSelectFormRef = ref()
let currentSelectType = ref()
/** 打开发起人选择 */
const openStartUserSelect = () => {
  currentSelectType.value = 'start'
  userSelectFormRef.value.open(0, [{ id: formData.value.leaderUserId }])
}
/** 处理用户选择确认 */
const handleUserSelectConfirm = (_, users: UserVO[]) => {
  formData.value.leaderUserName = users.map((u) => u.nickname)
  formData.value.leaderUserId = users.map((u) => u.id)
}
/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  try {
    const data = { ...formData.value } as unknown as DeptApi.DeptVO
    // 处理 regionId 提交：使用完整路径
    if (formData.value.regionIdPath && formData.value.regionIdPath.length > 0) {
      data.regionId = formData.value.regionIdPath.join(',')
    } else if (formData.value.regionId) {
      // 如果没有路径但有选中值，重新获取路径
      const path = getRegionPath(formData.value.regionId, regionTree.value)
      data.regionId = path ? path.join(',') : formData.value.regionId.toString()
    }

    if (formType.value === 'create') {
      await DeptApi.createDept(data)
      message.success('创建成功')
    } else {
      await DeptApi.updateDept(data)
      message.success('更新成功')
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    title: '',
    parentId: undefined,
    name: undefined,
    sort: undefined,
    leaderUserId: undefined,
    phone: undefined,
    email: undefined,
    status: CommonStatusEnum.ENABLE,
    regionId: undefined,
    regionIdPath: []
  }
  formRef.value?.resetFields()
}

/** 获得部门树 */
const getTree = async () => {
  deptTree.value = []
  const data = await DeptApi.getSimpleDeptList()
  let dept: Tree = { id: 0, name: '顶级部门', children: [] }
  dept.children = handleTree(data)
  deptTree.value.push(dept)
}
</script>
