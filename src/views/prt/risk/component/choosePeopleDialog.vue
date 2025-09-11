<template>
  <Dialog :title="title" v-model="dialogVisible" width="1200px">
    <el-row>
      <el-col :span="18">
        <div style="margin-bottom: 10px">所有员工</div>
        <ContentWrap>
          <el-row :gutter="24">
            <el-col :span="8">
              <div>
                <div class="head-container">
                  <el-input
                    v-model="deptName"
                    class="mb-20px"
                    clearable
                    placeholder="请输入部门名称"
                  >
                    <template #prefix>
                      <Icon icon="ep:search" />
                    </template>
                  </el-input>
                </div>
                <el-tree
                  ref="treeRef"
                  v-loading="loadingTree"
                  :filter-node-method="filterNode"
                  style="max-width: 600px;overflow-x: auto;"
                  :data="treeList"
                  :props="defaultProps"
                  @node-click="handleNodeClick"
                />
              </div>
            </el-col>
            <el-col :span="16">
              <div>
                <el-form
                  class="-mb-15px"
                  :model="queryParams"
                  ref="queryFormRef"
                  :inline="true"
                  label-width="0px"
                >
                  <el-form-item>
                    <el-input
                      @keyup.enter="getList"
                      v-model="queryParams.username"
                      placeholder="姓名/登录账号/手机号"
                      clearable
                      style="width: 200px"
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-button circle @click="getList" type="primary">
                      <Icon icon="ep:search" />
                    </el-button>
                    <el-button circle @click="reset" type="danger">
                      <Icon icon="ep:refresh" />
                    </el-button>
                  </el-form-item>
                </el-form>
              </div>
              <el-table
                ref="tableRef"
                v-loading="loadingList"
                :data="list"
                :stripe="true"
                :show-overflow-tooltip="true"
                style="overflow-x: auto"
                @selection-change="handleSelectionChange"
                @select="getselect"
                @select-all="getSelectAll"
              >
                <el-table-column type="selection" width="55" :selectable="getselectable" />
                <el-table-column label="姓名" prop="nickname" />
                <el-table-column label="登录账号" prop="username" />
                <el-table-column label="手机号" prop="mobile" />
              </el-table>
              <Pagination
                :total="total"
                v-model:page="queryParams.pageNo"
                v-model:limit="queryParams.pageSize"
                @pagination="getList"
              />
            </el-col>
          </el-row>
        </ContentWrap>
      </el-col>
      <el-col :span="6">
        <div style="margin-bottom: 10px">已选员工（{{ selectList.length }}）</div>
        <div v-for="(user, key) in selectList" :key="key">
          <ContentWrap style="background: #efefef;">
            <el-row>
              <el-col :span="18"> {{ user.nickname }}（{{ user.username }}） </el-col>
              <el-col :span="6" style="text-align: right">
                <Icon
                  icon="ep:close"
                  @click="removeSelectedUser(user, key)"
                  style="border-radius: 50%"
                />
              </el-col>
            </el-row>
          </ContentWrap>
        </div>
      </el-col>
    </el-row>
    <el-row>
      <el-col style="text-align: right">
        <el-button @click="dialogVisible = false" plain>取消</el-button>
        <el-button @click="mysubmit()" type="primary">确定</el-button>
      </el-col>
    </el-row>
  </Dialog>
</template>
<script setup lang="ts">
defineOptions({ name: 'ChoosePeopleDialog' })
import { defaultProps, handleTree } from '@/utils/tree'
import * as DeptApi from '@/api/system/dept'
import * as UserApi from '@/api/system/user'
import { ElTree } from 'element-plus'

let dialogVisible = ref(false)
let title = ref('选择检查人/整改责任人')
let queryParams = reactive({
  pageNo: 1,
  pageSize: 10
})
let total = ref(0) // 列表的总页数
let loadingList = ref(false) //列表加载状态
let loadingTree = ref(false) //树形加载状态
const treeList = ref([]) //树形数据
let list = ref([])
let deptList = ref([])
// 子组件调用父组件的函数
const emit = defineEmits(['submit', 'update:modelValue'])
// 打开弹窗
const open = (item) => {
  dialogVisible.value = true
  getData()
}
const props = defineProps({
  modelValue: Array, //绑定选中数据
  state: null //是否允许多选
})
let selectList = ref(props.modelValue || [])
const getselectable = (row, index) => {
  let state = false
  list.value.forEach((i) => {
    if (props.state) {
      if (selectList.value.length > 0) {
        selectList.value.forEach((item) => {
          if (row.id == item.id) {
            state = true
          } else {
            state = false
          }
        })
      } else {
        state = true
      }
    } else {
      state = true
    }
  })
  return state
}
const getSelectAll = (selection) => {
  if (selection.length == 0) {
    try {
      list.value.forEach((i) => {
        selectList.value.forEach((j, index) => {
          if (i.id == j.id) {
            if (i.userId == j.userId) {
              selectList.value.splice(index, 1)
            }
          }
        })
      })
    } catch (e) {}
  }
}
const getselect = (selection, row) => {
  let selected = selection.length && selection.indexOf(row) !== -1
  if (selected == false) {
    selectList.value.forEach((i, index) => {
      if (i.id == row.id) {
        selectList.value.splice(index, 1)
      }
    })
  }
}
const handleSelectionChange = (val: User[]) => {
  val.forEach((i) => {
    selectList.value.push(i)
  })
  let jobId = []
  let arr = []
  let str = selectList.value
  for (var i = 0; i < str.length; i++) {
    //判断在id这个数组中有没有找到id
    if (jobId.indexOf(str[i].id) == -1) {
      //把id用push存进id这个数组中
      jobId.push(str[i].id)
      arr.push(str[i])
    }
  }
  selectList.value = arr
}

// 删除已选用户
const removeSelectedUser = (user: User, key: number) => {
  // 删除索引对应的元素
  selectList.value.splice(key, 1)
  nextTick(() => {
    const row = list.value.find((item) => item.id === user.id)
    row && tableRef.value?.toggleRowSelection(row, false)
  })
}
const mysubmit = () => {
  emit('update:modelValue', selectList.value)
  dialogVisible.value = false
}

const tableRef = ref<InstanceType<typeof ElTable>>()
// 获取列表数据时保持回显逻辑
const reset = () => {
  queryParams.deptId = undefined
  queryParams.username = ''
  getList()
}
const getList = async () => {
  loadingList.value = true
  try {
    const data = await UserApi.getUserPage(queryParams)
    list.value = data.list
    total.value = data.total
    setTimeout(() => {
      selectList.value.forEach((i) => {
        if (list.value != null) {
          list.value.forEach((j) => {
            if (i.id == j.id) {
              tableRef.value?.toggleRowSelection(j, undefined)
            }
          })
        }
      })
    }, 30)
  } finally {
    loadingList.value = false
  }
}

// 树形显示配置
const defaultProps = {
  children: 'children',
  label: 'name'
}
// 请求树形数据
const getTree = async () => {
  loadingTree.value = true
  try {
    const data = await DeptApi.getDeptPage(queryParams)
    deptList.value = JSON.parse(JSON.stringify(data))
    treeList.value = handleTree(data)
  } finally {
    loadingTree.value = false
  }
}
// 树形点击
const handleNodeClick = (data) => {
  queryParams.deptId = data.id
  getList()
}
/** 基于名字过滤 */
const filterNode = (name: string, data: Tree) => {
  if (!name) return true
  return data.name.includes(name)
}
// 数据回显
const getData = async () => {
  setTimeout(() => {
    selectList.value.forEach((i) => {
      if (list.value != null) {
        list.value.forEach((j) => {
          if (i.id == j.id) {
            i.username = j.username
            i.nickname = j.nickname
            tableRef.value?.toggleRowSelection(j, undefined)
          }
        })
      }
    })
  }, 30)
}
// 组件初始化
onMounted(async () => {
  await getList()
  await getTree()
  // await getData()
})
const deptName = ref('')
const treeRef = ref<InstanceType<typeof ElTree>>()
/** 监听deptName */
watch(deptName, (val) => {
  treeRef.value!.filter(val)
})
let mydisplay = ref(props.state ? 'none' : '')
// 将接口暴露给父组件调用
defineExpose({
  open
})
</script>

<style scoped lang="scss">
:deep(.el-table__header-wrapper .el-checkbox) {
  display: v-bind(mydisplay);
}
</style>
