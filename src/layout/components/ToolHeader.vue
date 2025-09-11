<script lang="tsx">
import { defineComponent, computed, ref } from 'vue'
import { Message } from '@/layout/components/Message'
import { Collapse } from '@/layout/components/Collapse'
import { UserInfo } from '@/layout/components/UserInfo'
import { Screenfull } from '@/layout/components/Screenfull'
import { Breadcrumb } from '@/layout/components/Breadcrumb'
import { SizeDropdown } from '@/layout/components/SizeDropdown'
import { LocaleDropdown } from '@/layout/components/LocaleDropdown'
import RouterSearch from '@/components/RouterSearch/index.vue'
import { Icon } from '@/components/Icon'
import { useAppStore } from '@/store/modules/app'
import { useDesign } from '@/hooks/web/useDesign'
import MenuTop from './MenuTop/index.vue'
import { useRouter } from 'vue-router'

const { getPrefixCls, variables } = useDesign()

const prefixCls = getPrefixCls('tool-header')

const appStore = useAppStore()

// 面包屑
const breadcrumb = computed(() => appStore.getBreadcrumb)

// 折叠图标
const hamburger = computed(() => appStore.getHamburger)

// 全屏图标
const screenfull = computed(() => appStore.getScreenfull)

// 搜索图片
const search = computed(() => appStore.search)

// 尺寸图标
const size = computed(() => appStore.getSize)

// 布局
const layout = computed(() => appStore.getLayout)

// 多语言图标
const locale = computed(() => appStore.getLocale)

// 消息图标
const message = computed(() => appStore.getMessage)

export default defineComponent({
  name: 'ToolHeader',
  setup() {
    const router = useRouter() // 路由
    // 定义点击事件处理函数
    const handleIconClick = (tag: string) => {
      const currentRoute = router.currentRoute.value.name
      if(tag == "1"|| tag == "2" || tag == "3"){
        appStore.setWorkTag(tag)
        if (currentRoute != 'topBarPage') {
          router.push({
            name: 'topBarPage',
            query: {
              tag: tag
            }
          })
        }
      }
    }
    return () => (
      <div
        id={`${variables.namespace}-tool-header`}
        class={[
          prefixCls,
          'h-[var(--top-tool-height)] relative px-[var(--top-tool-p-x)] flex items-center justify-between',
          'dark:bg-[var(--el-bg-color)]'
        ]}
      >
        {/* {layout.value !== 'top' ? (
          <div class="h-full flex items-center">
            {hamburger.value && layout.value !== 'cutMenu' ? (
              <Collapse class="custom-hover" color="var(--top-header-text-color)"></Collapse>
            ) : undefined}
            {breadcrumb.value ? <Breadcrumb class="lt-md:hidden"></Breadcrumb> : undefined}
          </div>
        ) : undefined} */}
        {layout.value == 'tlMenu' ? (
          <div class="h-full flex items-center">
            <MenuTop></MenuTop>
          </div>
        ) : (
          <div></div>
        )}
        <div class="h-full flex items-center">
          {/* <span onClick={() => handleIconClick('0')} class="cursor-pointer mr-20px">
            <Icon icon="ep:monitor" size={15} color="white" />
          </span>
          <span onClick={() => handleIconClick('1')} class="cursor-pointer mr-20px">
            <Icon icon="ep:document-add" size={15} color="white" />
          </span>
          <span onClick={() => handleIconClick('2')} class="cursor-pointer mr-20px">
            <Icon icon="ep:clock" size={15} color="white" />
          </span>
          <span onClick={() => handleIconClick('3')} class="cursor-pointer">
            <Icon icon="ep:bell" size={15} color="white" />
          </span> */}
          {screenfull.value ? (
            <span class="ml-20px mr-20px">
              <Screenfull color="var(--top-header-text-color)"></Screenfull>
            </span>
          ) : undefined}
          <UserInfo></UserInfo>
        </div>
      </div>
    )
  }
})
</script>

<style lang="scss" scoped>
$prefix-cls: #{$namespace}-tool-header;

.#{$prefix-cls} {
  transition: left var(--transition-time-02);
  // 移除渐变背景，因为父容器已经有了
  
  // 确保文字和图标是白色
  color: white;
  
  // 选中菜单项样式
  .selected-menu {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    padding: 8px 16px;
  }
  
  // 右侧用户信息和控制按钮样式
  :deep(.el-button) {
    color: white !important;
    border-color: rgba(255, 255, 255, 0.3) !important;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.1) !important;
      border-color: rgba(255, 255, 255, 0.5) !important;
    }
  }
  
  // 用户头像和下拉箭头
  :deep(.user-info) {
    color: white !important;
  }
  
  // 全屏按钮
  :deep(.screenfull) {
    color: white !important;
    
    &:hover {
      background-color: transparent !important;
    }
  }
}
</style>
