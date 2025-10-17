<template>
  <a-modal
    :visible="dialogVisible"
    :title="dialogTitle"
    :width="720"
    @ok="submitForm"
    @cancel="() => (dialogVisible = false)"
  >
    <a-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      layout="vertical"
    >
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item field="nickname" label="姓名">
            <a-input v-model="formData.nickname" placeholder="请输入姓名" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item field="deptId" label="部门">
            <a-tree-select
              v-model="formData.deptId"
              :data="deptTree"
              :field-names="{
                key: 'id',
                title: 'label',
                children: 'children',
              }"
              placeholder="请选择部门"
              allow-clear
              allow-search
            />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item field="phoneNumber" label="手机号">
            <a-input
              v-model="formData.phoneNumber"
              placeholder="请输入手机号"
              :max-length="11"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item field="email" label="邮箱">
            <a-input
              v-model="formData.email"
              placeholder="请输入邮箱"
              :max-length="50"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item
            v-if="formType === 'create'"
            field="userName"
            label="用户名称"
          >
            <a-input v-model="formData.userName" placeholder="请输入用户名称" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item
            v-if="formType === 'create'"
            field="password"
            label="用户密码"
          >
            <a-input-password
              v-model="formData.password"
              placeholder="请输入用户密码"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item field="sex" label="用户性别">
            <a-select v-model="formData.sex" placeholder="请选择性别">
              <a-option value="0">男</a-option>
              <a-option value="1">女</a-option>
              <a-option value="-1">未知</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item field="status" label="用户状态">
            <a-select v-model="formData.status" placeholder="请选择状态">
              <a-option value="0">正常</a-option>
              <a-option value="1">停用</a-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item field="remark" label="备注">
            <a-textarea
              v-model="formData.remark"
              placeholder="请输入备注"
              :max-length="500"
              :auto-size="{ minRows: 3, maxRows: 5 }"
            />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import * as AccountApi from '@/api/account';
  import * as DeptApi from '@/api/system/dept';
  import type { FormInstance } from '@arco-design/web-vue';

  const emit = defineEmits(['success']);

  const dialogVisible = ref(false);
  const dialogTitle = ref('');
  const formLoading = ref(false);
  const formType = ref('');
  const formRef = ref<FormInstance>();
  const deptTree = ref<any[]>([]);

  const formData = reactive({
    id: undefined as number | undefined,
    userName: '',
    nickname: '',
    email: '',
    phoneNumber: '',
    sex: '0',
    status: '0',
    password: '',
    remark: '',
    deptId: undefined as number | undefined,
    deptIds: [] as number[],
    mainDeptId: undefined as number | undefined,
    roleIds: [] as number[],
    postIds: [1], // 默认岗位
  });

  const formRules = {
    userName: [
      { required: true, message: '用户账号不能为空', trigger: 'blur' },
      {
        min: 1,
        max: 30,
        message: '用户账号长度不能超过30个字符',
        trigger: 'blur',
      },
    ],
    nickname: [{ required: true, message: '姓名不能为空', trigger: 'blur' }],
    deptId: [{ required: true, message: '部门不能为空', trigger: 'change' }],
    password: [
      { required: true, message: '用户密码不能为空', trigger: 'blur' },
      { min: 5, max: 20, message: '密码长度为5-20个字符', trigger: 'blur' },
    ],
    email: [
      {
        type: 'email',
        message: '请输入正确的邮箱地址',
        trigger: ['blur', 'change'],
      },
      { max: 50, message: '邮箱长度不能超过50个字符', trigger: 'blur' },
    ],
    phoneNumber: [
      {
        required: true,
        pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
        message: '请输入正确的手机号',
        trigger: 'blur',
      },
    ],
    remark: [
      { max: 500, message: '备注长度不能超过500个字符', trigger: 'blur' },
    ],
  };

  // 重置表单
  const resetForm = () => {
    formData.id = undefined;
    formData.userName = '';
    formData.nickname = '';
    formData.email = '';
    formData.phoneNumber = '';
    formData.sex = '0';
    formData.status = '0';
    formData.password = '';
    formData.remark = '';
    formData.deptId = undefined;
    formData.deptIds = [];
    formData.mainDeptId = undefined;
    formData.roleIds = [];
    formData.postIds = [1];
    formRef.value?.resetFields();
  };

  // 获得部门树
  const getDeptTree = async () => {
    try {
      const response = await DeptApi.getDeptTreeSelect();
      // 处理响应数据
      if (response && response.data) {
        deptTree.value = response.data;
      } else if (response) {
        // 如果响应直接是数据
        deptTree.value = response;
      } else {
        deptTree.value = [];
      }
    } catch (error) {
      // console.error('获取部门树失败:', error);
      deptTree.value = [];
    }
  };

  // 打开弹窗
  const open = async (type: string, id?: number) => {
    dialogVisible.value = true;
    dialogTitle.value = type === 'create' ? '新增用户' : '修改用户';
    formType.value = type;
    resetForm();

    // 获得部门树
    await getDeptTree();

    // 修改时，设置数据
    if (id) {
      formLoading.value = true;
      try {
        const response = await AccountApi.getUser(id);
        // 处理API响应格式
        const userData = response.data || response;

        // 字段映射和数据处理
        formData.id = id; // 使用传入的ID，避免精度丢失
        formData.userName = userData.userName || '';
        formData.nickname = userData.nickname || userData.userName || '';
        formData.email = userData.email || '';
        formData.phoneNumber = userData.phoneNumber || userData.mobile || '';
        formData.sex =
          userData.sex !== undefined && userData.sex !== ''
            ? String(userData.sex)
            : '0';
        formData.status = userData.status || '0';
        formData.remark = userData.remark || '';

        // 处理部门ID - mainDeptId是数字，deptIds可能是字符串或数组
        formData.deptId = userData.mainDeptId || undefined;

        // 处理deptIds - 可能是字符串、数组或deptIdList
        if (userData.deptIdList && Array.isArray(userData.deptIdList)) {
          formData.deptIds = userData.deptIdList;
        } else if (typeof userData.deptIds === 'string') {
          formData.deptIds = userData.deptIds
            .split(',')
            .map((deptId) => Number(deptId))
            .filter((deptId) => !Number.isNaN(deptId));
        } else if (Array.isArray(userData.deptIds)) {
          formData.deptIds = userData.deptIds;
        } else {
          formData.deptIds = [];
        }

        formData.mainDeptId = userData.mainDeptId || undefined;
        formData.roleIds = userData.roleIds || [];
        formData.postIds = userData.postIds || [1];

        // 编辑时不需要密码
        formData.password = '';
      } catch (error) {
        // console.error('获取用户详情失败:', error);
        Message.error('获取用户详情失败');
      } finally {
        formLoading.value = false;
      }
    }
  };

  // 提供 open 方法
  defineExpose({ open });

  // 提交表单
  const submitForm = async () => {
    // validate() 返回 undefined 表示验证通过，返回错误对象表示验证失败
    try {
      const errors = await formRef.value?.validate();
      if (errors) {
        return;
      }
    } catch (error) {
      return;
    }

    formLoading.value = true;
    try {
      // 构建提交数据
      const submitData: any = {
        // 编辑时使用姓名作为用户名，新增时使用原本的userName
        userName:
          formType.value === 'update'
            ? formData.nickname || formData.userName
            : formData.userName,
        nickname: formData.nickname || formData.userName,
        email: formData.email || '',
        phoneNumber: formData.phoneNumber || '',
        sex: formData.sex || '0',
        status: formData.status || '0',
        remark: formData.remark || '',
        deptIds: formData.deptId ? [formData.deptId] : [],
        mainDeptId: formData.deptId || 0,
        roleIds: formData.roleIds || [],
        postIds: formData.postIds || [1],
      };

      // 编辑时需要包含ID
      if (formType.value === 'update') {
        submitData.id = formData.id;
      }

      // 新增时必须有密码，编辑时只有填写了密码才发送
      if (formType.value === 'create') {
        submitData.password = formData.password;
      } else if (formData.password) {
        submitData.password = formData.password;
      }

      if (formType.value === 'create') {
        await AccountApi.createUser(submitData);
        Message.success('创建成功');
      } else {
        await AccountApi.updateUser(submitData);
        Message.success('更新成功');
      }

      dialogVisible.value = false;
      // 延迟一下再触发刷新，确保后端数据已更新
      setTimeout(() => {
        emit('success');
      }, 500);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message || error?.message || '操作失败';
      Message.error(errorMsg);
      // console.error('提交失败:', error);
    } finally {
      formLoading.value = false;
    }
  };
</script>
