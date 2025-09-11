<template>
  <el-form ref="formRef" :model="modelData" :rules="rules" label-width="120px" class="mt-20px">
    <el-form-item label="流程标识" prop="key" class="mb-20px">
      <div class="flex items-center">
        <el-input
          class="!w-440px"
          v-model="modelData.key"
          :disabled="!!modelData.id"
          placeholder="请输入流程标识，以字母或下划线开头"
        />
        <el-tooltip
          class="item"
          :content="modelData.id ? '流程标识不可修改！' : '新建后，流程标识不可修改！'"
          effect="light"
          placement="top"
        >
          <Icon icon="ep:question-filled" class="ml-5px" />
        </el-tooltip>
      </div>
    </el-form-item>
    <el-form-item label="流程名称" prop="name" class="mb-20px" >
      <el-input
        v-model="modelData.name"
        clearable
        placeholder="请输入流程名称"
      />
      <!--        :disabled="!!modelData.id"-->
    </el-form-item>
    <el-form-item label="流程分类" prop="category" class="mb-20px">
      <el-select
        class="!w-full"
        v-model="modelData.category"
        clearable
        placeholder="请选择流程分类"
      >
        <el-option
          v-for="category in categoryList"
          :key="category.code"
          :label="category.name"
          :value="category.code"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="流程图标" class="mb-20px" >
      <UploadImg v-model="modelData.icon" :limit="1" height="64px" width="64px" :disabled="!modelData.allowUpdateBasicInfo"/>
    </el-form-item>
    <el-form-item label="流程描述" prop="description" class="mb-20px" >
      <el-input v-model="modelData.description" clearable type="textarea" :disabled="!modelData.allowUpdateBasicInfo"/>
    </el-form-item>
    <el-form-item label="流程类型" prop="type" class="mb-20px">
      <div class="flex items-center">
        <el-tooltip
          class="item"
          :content="'流程设计器类型，暂时仅开放 SIMPLE 设计器！'"
          effect="light"
          placement="top"
        >
          <Icon icon="ep:question-filled" class="mr-10px" />
        </el-tooltip>
        <el-radio-group v-model="modelData.type" :disabled="true">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.BPM_MODEL_TYPE)"
            :key="dict.value"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </div>
    </el-form-item>
    <!--  是否运营流程  -->
<!--    <el-form-item label="是否运营流程" prop="isBase" class="mb-20px">
      <div class="flex items-center">
        <el-tooltip
          class="item"
          :content="'表示该流程为运营流程，租户流程管控中可根据该模板创建对应流程！'"
          effect="light"
          placement="top"
        >
          <Icon icon="ep:question-filled" class="mr-10px" />
        </el-tooltip>
        <el-radio-group v-model="modelData.isBase" :disabled="modelData.isBase!=null"> &lt;!&ndash; 运营管理创建的流程模型默认都是运营流程，故此处不让修改 &ndash;&gt;
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value as string"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </div>
    </el-form-item>-->
    <!--  运营流程类型  -->
<!--    <el-form-item label="运营流程类型" prop="baseModelType" class="mb-20px" v-if="modelData.isBase">-->
    <el-form-item label="运营流程类型" prop="baseModelType" class="mb-20px">
      <div class="flex items-center">
        <el-tooltip
          class="item"
          :content="'0 模板流程，租户流程的基准模板，不可直接使用，支持后续扩展属性（公共属性、指定租户属性）\n1 内置流程，系统预置的固定流程（代码硬编码）；\n2 实例流程，租户可直接使用的实例化流程，支持后续扩展属性（公共属性、指定租户属性）;'"
          effect="light"
          placement="top"
        >
          <Icon icon="ep:question-filled" class="mr-10px" />
        </el-tooltip>
        <el-radio-group  v-model="modelData.baseModelType">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.BPM_BASE_MODEL_TYPE)"
            :key="dict.value"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </div>
    </el-form-item>
    <!--  运营流程属性  -->
    <el-form-item label="运营流程属性" prop="baseModelAttribute" class="mb-20px">
      <div class="flex items-center">
        <el-tooltip
          class="item"
          :content="'0 公共属性，所有租户都可以使用的运营流程；\n1 指定租户，指定租户可以使用的运营流程；'"
          effect="light"
          placement="top"
        >
          <Icon icon="ep:question-filled" class="mr-10px" />
        </el-tooltip>
        <el-radio-group  v-model="modelData.baseModelAttribute">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.BPM_BASE_MODEL_ATTRIBUTE)"
            :key="dict.value"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </div>
    </el-form-item>
    <el-form-item label="是否可见" prop="visible" class="mb-20px" >
      <div class="flex items-center">
        <el-tooltip
          class="item"
          :content="'不可见则：1.租户流程管控中不可创建；2.事项申请中不显示！'"
          effect="light"
          placement="top"
        >
          <Icon icon="ep:question-filled" class="mr-10px" />
        </el-tooltip>
        <el-radio-group v-model="modelData.visible" :disabled="!modelData.allowUpdateBasicInfo">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value as string"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </div>
    </el-form-item>
    <el-form-item label="谁可以发起" prop="startUserType" class="mb-20px">
      <el-select
        v-model="modelData.startUserType"
        placeholder="请选择谁可以发起"
        @change="handleStartUserTypeChange"
      >
        <el-option label="全员" :value="0" />
        <el-option label="指定人员" :value="1" />
      </el-select>
      <div v-if="modelData.startUserType === 1" class="mt-2 flex flex-wrap gap-2">
        <div
          v-for="user in selectedStartUsers"
          :key="user.id"
          class="bg-gray-100 h-35px rounded-3xl flex items-center pr-8px dark:color-gray-600 position-relative"
        >
          <el-avatar class="!m-5px" :size="28" v-if="user.avatar" :src="user.avatar" />
          <el-avatar class="!m-5px" :size="28" v-else>
            {{ user.nickname.substring(0, 1) }}
          </el-avatar>
          {{ user.nickname }}
          <Icon
            icon="ep:close"
            class="ml-2 cursor-pointer hover:text-red-500"
            @click="handleRemoveStartUser(user)"
          />
        </div>
        <el-button type="primary" link @click="openStartUserSelect">
          <Icon icon="ep:plus" /> 选择人员
        </el-button>
      </div>
    </el-form-item>
    <el-form-item label="流程管理员" prop="managerUserIds" class="mb-20px">
      <div class="flex flex-wrap gap-2">
        <div
          v-for="user in selectedManagerUsers"
          :key="user.id"
          class="bg-gray-100 h-35px rounded-3xl flex items-center pr-8px dark:color-gray-600 position-relative"
        >
          <el-avatar class="!m-5px" :size="28" v-if="user.avatar" :src="user.avatar" />
          <el-avatar class="!m-5px" :size="28" v-else>
            {{ user.nickname.substring(0, 1) }}
          </el-avatar>
          {{ user.nickname }}
          <Icon
            icon="ep:close"
            class="ml-2 cursor-pointer hover:text-red-500"
            @click="handleRemoveManagerUser(user)"
          />
        </div>
        <el-button type="primary" link @click="openManagerUserSelect">
          <Icon icon="ep:plus" />选择人员
        </el-button>
      </div>
    </el-form-item>
  </el-form>

  <!-- 用户选择弹窗 -->
  <UserSelectForm ref="userSelectFormRef" @confirm="handleUserSelectConfirm" />
</template>

<script lang="ts" setup>
import { DICT_TYPE, getBoolDictOptions, getIntDictOptions } from '@/utils/dict'
import { UserVO } from '@/api/system/user'
import { CategoryVO } from '@/api/bpm/category'
import {AiImageStatusEnum} from "@/views/ai/utils/constants";

const props = defineProps({
  categoryList: {
    type: Array as PropType<CategoryVO[]>,
    required: true
  },
  userList: {
    type: Array,
    required: true
  }
})

const formRef = ref()
const selectedStartUsers = ref<UserVO[]>([])
const selectedManagerUsers = ref<UserVO[]>([])
const userSelectFormRef = ref()
const currentSelectType = ref<'start' | 'manager'>('start')

const rules = {
  name: [{ required: true, message: '流程名称不能为空', trigger: 'blur' }],
  key: [{ required: true, message: '流程标识不能为空', trigger: 'blur' }],
  category: [{ required: true, message: '流程分类不能为空', trigger: 'blur' }],
  type: [{ required: true, message: '是否可见不能为空', trigger: 'blur' }],
  visible: [{ required: true, message: '是否可见不能为空', trigger: 'blur' }],
  isBase: [{ required: true, message: '是否运营流程不能为空', trigger: 'blur' }],
  baseModelType: [{ required: true, message: '运营流程类型不能为空', trigger: 'blur' }],
  baseModelAttribute: [{ required: true, message: '运营流程属性不能为空', trigger: 'blur' }],
  managerUserIds: [{ required: true, message: '流程管理员不能为空', trigger: 'blur' }]
}

// 创建本地数据副本
const modelData = defineModel<any>()

const initData = async () => {
  modelData.value.allowUpdateBasicInfo = true
}

// 初始化选中的用户
watch(
  () => modelData.value,
  (newVal) => {
    if (newVal.startUserIds?.length) {
      selectedStartUsers.value = props.userList.filter((user: UserVO) =>
        newVal.startUserIds.includes(user.id)
      ) as UserVO[]
    } else {
      selectedStartUsers.value = []
    }
    if (newVal.managerUserIds?.length) {
      selectedManagerUsers.value = props.userList.filter((user: UserVO) =>
        newVal.managerUserIds.includes(user.id)
      ) as UserVO[]
    } else {
      selectedManagerUsers.value = []
    }
  },
  {
    immediate: true
  }
)

/** 打开发起人选择 */
const openStartUserSelect = () => {
  currentSelectType.value = 'start'
  userSelectFormRef.value.open(0, selectedStartUsers.value)
}

/** 打开管理员选择 */
const openManagerUserSelect = () => {
  currentSelectType.value = 'manager'
  userSelectFormRef.value.open(0, selectedManagerUsers.value)
}

/** 处理用户选择确认 */
const handleUserSelectConfirm = (_, users: UserVO[]) => {
  if (currentSelectType.value === 'start') {
    modelData.value = {
      ...modelData.value,
      startUserIds: users.map((u) => u.id)
    }
  } else {
    modelData.value = {
      ...modelData.value,
      managerUserIds: users.map((u) => u.id)
    }
  }
}

/** 处理发起人类型变化 */
const handleStartUserTypeChange = (value: number) => {
  if (value !== 1) {
    modelData.value = {
      ...modelData.value,
      startUserIds: []
    }
  }
}

/** 移除发起人 */
const handleRemoveStartUser = (user: UserVO) => {
  modelData.value = {
    ...modelData.value,
    startUserIds: modelData.value.startUserIds.filter((id: number) => id !== user.id)
  }
}

/** 移除管理员 */
const handleRemoveManagerUser = (user: UserVO) => {
  modelData.value = {
    ...modelData.value,
    managerUserIds: modelData.value.managerUserIds.filter((id: number) => id !== user.id)
  }
}

/** 表单校验 */
const validate = async () => {
  await formRef.value?.validate()
}

/** 初始化 */
onMounted(async () => {
  await initData()
})

defineExpose({
  validate
})
</script>

<style lang="scss" scoped>
.bg-gray-100 {
  background-color: #f5f7fa;
  transition: all 0.3s;

  &:hover {
    background-color: #e6e8eb;
  }

  .ep-close {
    font-size: 14px;
    color: #909399;
    transition: color 0.3s;

    &:hover {
      color: #f56c6c;
    }
  }
}
</style>
