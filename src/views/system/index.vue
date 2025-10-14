<template>
  <div class="system-container">
    <!-- 顶部导航 -->
    <div class="system-header">
      <div class="header-content">
        <div class="logo-section">
          <img src="@/assets/screen/logo.png" alt="Logo" class="logo" />
          <span class="system-title"
            >福州市烟花爆竹经营(批发)企业安全风险监测预警系统</span
          >
        </div>
        <div class="nav-section">
          <div class="nav-item" @click="goToScreen">
            <icon-home /> 数据大屏
          </div>
          <div class="nav-item active"> <icon-setting /> 系统设置 </div>
        </div>
        <div class="user-section">
          <span class="user-name">admin</span>
          <a-button type="text" @click="handleLogout">退出</a-button>
        </div>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="system-body">
      <!-- 左侧菜单 -->
      <div class="system-sidebar">
        <a-menu
          v-model:selected-keys="selectedKeys"
          mode="vertical"
          :default-selected-keys="['dept']"
          @menu-item-click="handleMenuClick"
        >
          <a-menu-item key="dept">
            <template #icon>
              <icon-apps />
            </template>
            部门机构管理
          </a-menu-item>
          <a-menu-item key="region">
            <template #icon>
              <icon-location />
            </template>
            区域管理
          </a-menu-item>
          <a-menu-item key="account">
            <template #icon>
              <icon-user />
            </template>
            账号管理
          </a-menu-item>
          <a-menu-item key="role">
            <template #icon>
              <icon-user-group />
            </template>
            角色管理
          </a-menu-item>
        </a-menu>
      </div>

      <!-- 右侧内容区 -->
      <div class="system-content">
        <!-- 部门机构管理 -->
        <DeptManagement v-if="currentModule === 'dept'" />
        <!-- 区域管理 -->
        <RegionManagement v-if="currentModule === 'region'" />
        <!-- 账号管理 -->
        <AccountManagement v-if="currentModule === 'account'" />
        <!-- 角色管理 -->
        <RoleManagement v-if="currentModule === 'role'" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { Message } from '@arco-design/web-vue';
  import DeptManagement from './dept/index.vue';
  import RegionManagement from './region/index.vue';
  import AccountManagement from './account/index.vue';
  import RoleManagement from './role/index.vue';

  const router = useRouter();
  const selectedKeys = ref(['dept']);
  const currentModule = ref('dept');

  // 菜单点击事件
  const handleMenuClick = (key: string) => {
    currentModule.value = key;
  };

  // 返回数据大屏
  const goToScreen = () => {
    router.push('/index');
  };

  // 退出登录
  const handleLogout = () => {
    Message.success('退出成功');
    router.push('/login');
  };
</script>

<style scoped lang="less">
  .system-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100vh;
    background: #f0f2f5;

    .system-header {
      z-index: 100;
      height: 60px;
      background: #fff;
      box-shadow: 0 2px 8px rgb(0 0 0 / 8%);

      .header-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 100%;
        padding: 0 20px;

        .logo-section {
          display: flex;
          align-items: center;

          .logo {
            height: 32px;
            margin-right: 12px;
          }

          .system-title {
            color: #333;
            font-weight: 500;
            font-size: 18px;
          }
        }

        .nav-section {
          display: flex;
          gap: 24px;

          .nav-item {
            display: flex;
            gap: 6px;
            align-items: center;
            padding: 8px 16px;
            color: #666;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
              color: #1890ff;
              background: #f0f2f5;
            }

            &.active {
              color: #1890ff;
              background: #e6f7ff;
            }
          }
        }

        .user-section {
          display: flex;
          gap: 16px;
          align-items: center;

          .weather {
            color: #999;
            font-size: 14px;
          }

          .user-name {
            color: #333;
            font-weight: 500;
          }
        }
      }
    }

    .system-body {
      display: flex;
      flex: 1;
      overflow: hidden;

      .system-sidebar {
        width: 200px;
        background: #fff;
        box-shadow: 2px 0 8px rgb(0 0 0 / 5%);

        :deep(.arco-menu) {
          height: 100%;
          border: none;
        }

        :deep(.arco-menu-item) {
          margin: 4px 8px;
          border-radius: 4px;
        }
      }

      .system-content {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
      }
    }
  }
</style>
