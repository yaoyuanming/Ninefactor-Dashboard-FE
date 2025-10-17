<template>
  <a-modal
    v-model:visible="dialogVisible"
    title="菜单权限"
    width="650px"
    :mask-closable="false"
    @before-ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-form ref="formRef" :model="formData" label-col-flex="80px">
      <a-form-item label="角色名称">
        <a-tag>{{ formData.roleName }}</a-tag>
      </a-form-item>
      <a-form-item label="角色标识">
        <a-tag>{{ formData.roleKey }}</a-tag>
      </a-form-item>
      <a-form-item label="菜单权限">
        <a-card class="menu-tree-card" :bordered="false">
          <template #title>
            <a-space>
              <span>全选/全不选:</span>
              <a-switch
                v-model="treeNodeAll"
                @change="handleCheckedTreeNodeAll"
              >
                <template #checked> 是 </template>
                <template #unchecked> 否 </template>
              </a-switch>
              <a-divider direction="vertical" />
              <span>全部展开/折叠:</span>
              <a-switch v-model="menuExpand" @change="handleCheckedTreeExpand">
                <template #checked> 展开 </template>
                <template #unchecked> 折叠 </template>
              </a-switch>
            </a-space>
          </template>
          <a-spin :loading="loading" style="width: 100%">
            <a-tree
              ref="treeRef"
              :data="menuOptions"
              :field-names="{
                key: 'id',
                title: 'label',
                children: 'children',
              }"
              :checkable="true"
              :checked-keys="checkedKeys"
              :default-expand-all="menuExpand"
              @check="handleCheck"
            />
          </a-spin>
        </a-card>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
  import { ref, computed, watch, nextTick } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import type { TreeInstance } from '@arco-design/web-vue';

  interface Props {
    visible: boolean;
    data?: any;
  }

  const props = defineProps<Props>();
  const emit = defineEmits(['update:visible', 'success']);

  const formRef = ref();
  const treeRef = ref<TreeInstance>();
  const loading = ref(false);
  const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val),
  });

  const formData = ref({
    id: undefined,
    roleName: '',
    roleKey: '',
    menuIds: [] as number[],
  });

  const menuOptions = ref<any[]>([]);
  const checkedKeys = ref<number[]>([]);
  const treeNodeAll = ref(false);
  const menuExpand = ref(true);

  // 模拟菜单数据
  const mockMenuData = [
    {
      id: 1,
      label: '系统管理',
      children: [
        {
          id: 11,
          label: '用户管理',
          children: [
            { id: 111, label: '查询用户' },
            { id: 112, label: '新增用户' },
            { id: 113, label: '修改用户' },
            { id: 114, label: '删除用户' },
          ],
        },
        {
          id: 12,
          label: '角色管理',
          children: [
            { id: 121, label: '查询角色' },
            { id: 122, label: '新增角色' },
            { id: 123, label: '修改角色' },
            { id: 124, label: '删除角色' },
          ],
        },
        {
          id: 13,
          label: '菜单管理',
          children: [
            { id: 131, label: '查询菜单' },
            { id: 132, label: '新增菜单' },
            { id: 133, label: '修改菜单' },
            { id: 134, label: '删除菜单' },
          ],
        },
        {
          id: 14,
          label: '部门管理',
          children: [
            { id: 141, label: '查询部门' },
            { id: 142, label: '新增部门' },
            { id: 143, label: '修改部门' },
            { id: 144, label: '删除部门' },
          ],
        },
      ],
    },
    {
      id: 2,
      label: '监控管理',
      children: [
        {
          id: 21,
          label: '在线用户',
        },
        {
          id: 22,
          label: '系统日志',
          children: [
            { id: 221, label: '操作日志' },
            { id: 222, label: '登录日志' },
          ],
        },
      ],
    },
    {
      id: 3,
      label: '业务管理',
      children: [
        {
          id: 31,
          label: '应急物资',
        },
        {
          id: 32,
          label: '应急装备',
        },
        {
          id: 33,
          label: '救援队伍',
        },
        {
          id: 34,
          label: '应急专家',
        },
      ],
    },
  ];

  // 获取所有菜单ID
  const getAllMenuIds = (menus: any[]): number[] => {
    let ids: number[] = [];
    menus.forEach((menu) => {
      ids.push(menu.id);
      if (menu.children && menu.children.length > 0) {
        ids = ids.concat(getAllMenuIds(menu.children));
      }
    });
    return ids;
  };

  // 监听对话框显示状态
  watch(
    () => props.visible,
    async (val) => {
      if (val && props.data) {
        formData.value = {
          id: props.data.id,
          roleName: props.data.roleName,
          roleKey: props.data.roleKey,
          menuIds: [],
        };

        // 加载菜单数据
        loading.value = true;
        try {
          // 模拟异步加载
          await new Promise((resolve) => {
            setTimeout(resolve, 500);
          });
          menuOptions.value = mockMenuData;

          // 模拟获取角色已有的菜单权限
          if (props.data.roleKey === 'admin') {
            // 管理员拥有所有权限
            checkedKeys.value = getAllMenuIds(mockMenuData);
          } else {
            // 其他角色随机分配一些权限
            checkedKeys.value = [1, 11, 111, 112, 2, 21];
          }

          formData.value.menuIds = [...checkedKeys.value];
        } catch (error) {
          // console.error(error);
        } finally {
          loading.value = false;
        }
      }
    }
  );

  // 处理树节点选中
  const handleCheck = (newCheckedKeys: (string | number)[]) => {
    checkedKeys.value = newCheckedKeys as number[];
  };

  // 全选/全不选
  const handleCheckedTreeNodeAll = () => {
    if (treeNodeAll.value) {
      checkedKeys.value = getAllMenuIds(menuOptions.value);
    } else {
      checkedKeys.value = [];
    }
  };

  // 展开/折叠全部
  const handleCheckedTreeExpand = async () => {
    await nextTick();
    if (menuExpand.value) {
      treeRef.value?.expandAll(true);
    } else {
      treeRef.value?.expandAll(false);
    }
  };

  // 提交表单
  const handleSubmit = async () => {
    loading.value = true;
    try {
      // 模拟提交
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });

      Message.success('权限配置成功');
      dialogVisible.value = false;
      emit('success');
    } catch (error) {
      // console.error(error);
    } finally {
      loading.value = false;
    }
    return false;
  };

  // 取消
  const handleCancel = () => {
    checkedKeys.value = [...formData.value.menuIds];
    treeNodeAll.value = false;
    menuExpand.value = true;
  };
</script>

<style scoped lang="less">
  .menu-tree-card {
    width: 100%;

    :deep(.arco-card-body) {
      max-height: 400px;
      overflow-y: auto;
    }
  }
</style>
