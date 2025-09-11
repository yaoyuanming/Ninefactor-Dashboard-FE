<script lang="ts" setup>
import { ElMessageBox } from 'element-plus'

import avatarImg from '@/assets/imgs/avatar.png'
import { useDesign } from '@/hooks/web/useDesign'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { useUserStore } from '@/store/modules/user'
import LockDialog from './components/LockDialog.vue'
import LockPage from './components/LockPage.vue'
import { useLockStore } from '@/store/modules/lock'
import { usePermissionStore } from '@/store/modules/permission'
import {CACHE_KEY, useCache} from "@/hooks/web/useCache";


const permissionStore = usePermissionStore()


defineOptions({ name: 'UserInfo' })

const { t } = useI18n()

const { push, replace } = useRouter()

const userStore = useUserStore() // 登录用户信息缓存

const tagsViewStore = useTagsViewStore()

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('user-info')

const avatar = computed(() => userStore.user.avatar || avatarImg) // 用户头像
const account = computed(() => userStore.user.username ?? '') // 用户账号
const userName = computed(() => userStore.user.nickname ?? 'Admin') // 姓名

// 锁定屏幕
const lockStore = useLockStore()
const getIsLock = computed(() => lockStore.getLockInfo?.isLock ?? false)
const dialogVisible = ref<boolean>(false)
const lockScreen = () => {
  dialogVisible.value = true
}
const { wsCache } = useCache()
const loginOut = async () => {
  try {
    await ElMessageBox.confirm(t('common.loginOutMessage'), t('common.reminder'), {
      confirmButtonText: t('common.ok'),
      cancelButtonText: t('common.cancel'),
      type: 'warning'
    })
    await userStore.loginOut()
    tagsViewStore.delAllViews()
    permissionStore.setLeftMenuTabRouters([])
    // replace('/login?redirect=/index')
    const backCache = wsCache.get(CACHE_KEY.BACK_CACHE)
    console.log("backCache",backCache)
    let platform = ''
    if(wsCache.get(CACHE_KEY.BACK_CACHE) != null){
      const backCache = wsCache.get(CACHE_KEY.BACK_CACHE)
      platform = backCache.platformNumber
    }
    replace(`/login`)
  } catch {}
}
const toProfile = async () => {
  push('/user/profile')
}
const toDocument = () => {
  window.open('https://doc.iocoder.cn/')
}
</script>

<template>
  <ElDropdown :class="prefixCls" trigger="click">
    <div class="flex items-center">
      <ElAvatar :src="avatar" alt="" :size="35" class="rounded-[50%]" />
<!--      <ElAvatar :src="avatar" alt="" style="width: 35px; height: 35px" class="rounded-[50%]" />-->
<!--      <ElAvatar :src="avatar" alt="" class="w-[calc(var(&#45;&#45;logo-height)-30px)] rounded-[50%]" />-->
      <div>
        <span class="pl-[8px] text-14px text-white <lg:hidden">
          {{ userName?userName:'后台管理' }}
        </span>
        <div></div>
        <span class="pl-[8px] text-12px text-white <lg:hidden">
          {{ account }}
        </span>
      </div>
    </div>
    <template #dropdown>
      <ElDropdownMenu>
        <!-- <ElDropdownItem>
          <Icon icon="ep:tools" />
          <div @click="toProfile">{{ t('common.profile') }}</div>
        </ElDropdownItem> -->
        <!-- <ElDropdownItem>
          <Icon icon="ep:menu" />
          <div @click="toDocument">{{ t('common.document') }}</div>
        </ElDropdownItem> -->
        <!-- <ElDropdownItem divided>
          <Icon icon="ep:lock" />
          <div @click="lockScreen">{{ t('lock.lockScreen') }}</div>
        </ElDropdownItem> -->
        <ElDropdownItem divided @click="loginOut">
          <Icon icon="ep:switch-button" />
          <div>{{ t('common.loginOut') }}</div>
        </ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
  <LockDialog v-if="dialogVisible" v-model="dialogVisible" />

  <teleport to="body">
    <transition name="fade-bottom" mode="out-in">
      <LockPage v-if="getIsLock" />
    </transition>
  </teleport>
</template>

<style scoped lang="scss">
.fade-bottom-enter-active,
.fade-bottom-leave-active {
  transition:
    opacity 0.25s,
    transform 0.3s;
}

.fade-bottom-enter-from {
  opacity: 0;
  transform: translateY(-10%);
}

.fade-bottom-leave-to {
  opacity: 0;
  transform: translateY(10%);
}

// 确保用户信息文字为白色
:deep(.el-dropdown) {
  color: white !important;
}

:deep(.el-dropdown__caret) {
  color: white !important;
}

// 强制设置用户名和账号为白色
span {
  color: white !important;
}
</style>
