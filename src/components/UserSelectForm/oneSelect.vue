<template>
  <Dialog v-model="dialogVisible" title="人员选择" width="800">
    <el-row class="gap2" v-loading="formLoading">
      <el-col :span="6">
        <ContentWrap class="h-1/1">
          <el-tree
            ref="treeRef"
            :data="deptTree"
            :expand-on-click-node="false"
            :props="defaultProps"
            default-expand-all
            highlight-current
            node-key="id"
            @node-click="handleNodeClick"
          />
        </ContentWrap>
      </el-col>
      <el-col :span="17">
        <el-transfer
          v-model="selectedUserIdList"
          :titles="['未选', '已选']"
          filterable
          filter-placeholder="搜索成员"
          :data="transferUserList"
          :left-default-checked="leftDefaultChecked"
          :props="{ label: 'nickname', key: 'id' }"
          @left-check-change="handleLeftCheckChange"
          @change="handleTransferChange"
        />
      </el-col>
    </el-row>
    <template #footer>
      <el-button
        :disabled="formLoading || !selectedUserIdList?.length"
        type="primary"
        @click="submitForm"
      >
        确 定
      </el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { defaultProps, handleTree } from '@/utils/tree'
import * as DeptApi from '@/api/system/dept'
import * as UserApi from '@/api/system/user'

defineOptions({ name: 'UserSelectForm' })
const emit = defineEmits<{
  confirm: [id: any, user: any] // 修改为返回单个用户
}>()
const { t } = useI18n() // 国际
const message = useMessage() // 消息弹窗
const deptTree = ref<Tree[]>([]) // 部门树形结构化
const deptList = ref<any[]>([]) // 保存扁平化的部门列表数据
const userList = ref<UserApi.UserVO[]>([]) // 所有用户列表
const filteredUserList = ref<UserApi.UserVO[]>([]) // 当前部门过滤后的用户列表
const selectedUserIdList = ref<any[]>([]) // 选中的用户列表（限制为只能选一个）
const dialogVisible = ref(false) // 弹窗的是否展示
const formLoading = ref(false) // 表单的加载中
const activityId = ref()
const leftCheckedItems = ref<any[]>([]) // 新增：存储左侧当前勾选的项
const leftDefaultChecked = ref<any[]>([]) // 用于设置左侧默认勾选

/** 计算属性：合并已选择的用户和当前部门过滤后的用户 */
const transferUserList = computed(() => {
  // 1.1 获取所有已选择的用户
  const selectedUsers = userList.value.filter((user: any) =>
    selectedUserIdList.value.includes(user.id)
  )

  // 1.2 获取当前部门过滤后的未选择用户
  const filteredUnselectedUsers = filteredUserList.value.filter(
    (user: any) => !selectedUserIdList.value.includes(user.id)
  )

  // 2. 合并并去重
  return [...selectedUsers, ...filteredUnselectedUsers]
})
/** 打开弹窗 */
const open = async (id: number, selectedList?: any[]) => {
  activityId.value = id
  resetForm()

  // 加载部门、用户列表
  const deptData = await DeptApi.getSimpleDeptList()
  deptList.value = deptData // 保存扁平结构的部门数据
  deptTree.value = handleTree(deptData) // 转换成树形结构
  userList.value = await UserApi.getSimpleUserList()

  // 初始状态下，过滤列表等于所有用户列表
  filteredUserList.value = [...userList.value]
  selectedUserIdList.value = selectedList?.map((item: any) => item.id) || []
  dialogVisible.value = true
}

/** 获取指定部门及其所有子部门的ID列表 */
const getChildDeptIds = (deptId: number, deptList: any[]): number[] => {
  const ids = [deptId]
  const children = deptList.filter((dept) => dept.parentId === deptId)
  children.forEach((child) => {
    ids.push(...getChildDeptIds(child.id, deptList))
  })
  return ids
}

/** 获取部门过滤后的用户列表 */
const filterUserList = async (deptId?: number) => {
  formLoading.value = true
  try {
    if (!deptId) {
      // 如果没有选择部门，显示所有用户
      filteredUserList.value = [...userList.value]
      return
    }

    // 直接使用已保存的部门列表数据进行过滤
    const deptIds = getChildDeptIds(deptId, deptList.value)

    // 过滤出这些部门下的用户
    filteredUserList.value = userList.value.filter((user) => deptIds.includes(user.deptId))
  } finally {
    formLoading.value = false
  }
}
/** 处理左侧勾选变化 */
const handleLeftCheckChange = (checkedItems: any[]) => {
  // 只保留最后一个勾选的项
  if (checkedItems.length > 0) {
    leftDefaultChecked.value = [checkedItems[checkedItems.length - 1]]
  } else {
    leftDefaultChecked.value = []
  }
}

/** 处理transfer变化事件，确保单选 */
const handleTransferChange = (value: any[], direction: string, movedKeys: string[]) => {
  if (direction === 'right') {
    // 如果是向右移动（选择），只保留最后一个选择的
    selectedUserIdList.value = [movedKeys[movedKeys.length - 1]]
  }
  // 如果是向左移动（取消选择），不做特殊处理
}

/** 提交选择 */
const submitForm = async () => {
  try {
    message.success(t('common.updateSuccess'))
    dialogVisible.value = false
    // 从所有用户列表中筛选出已选择的用户
    const emitUserList = userList.value.filter((user: any) =>
      selectedUserIdList.value.includes(user.id)
    )
    // 发送操作成功的事件
    emit('confirm', activityId.value, emitUserList)
  } finally {
  }
}

/** 重置表单 */
const resetForm = () => {
  deptTree.value = []
  deptList.value = []
  userList.value = []
  filteredUserList.value = []
  selectedUserIdList.value = []
}

/** 处理部门被点击 */
const handleNodeClick = (row: { [key: string]: any }) => {
  filterUserList(row.id)
}

defineExpose({ open }) // 提供 open 方法，用于打开弹窗
</script>

<style lang="scss" scoped>
:deep(.el-transfer-panel .el-transfer-panel__header .el-checkbox span:first-of-type){
  display: none;
}
:deep() {
  .el-transfer {
    display: flex;
    .el-transfer__buttons {
      display: flex !important;
      flex-direction: column-reverse;
      justify-content: center;
      gap: 20px;
      .el-transfer__button:nth-child(2) {
        margin: 0;
      }
    }
  }
}
</style>
