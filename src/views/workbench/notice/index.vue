<template>
  <div class="notice-management-container">
    <!-- 顶部标签切换 -->
    <el-tabs v-model="activeTab" class="main-tabs" @tab-click="handleTabClick">
      <!-- 发布通知标签 -->
      <el-tab-pane label="发布通知" name="publish">
        <div class="search-and-action">
          <!-- 搜索区域 -->
          <el-form ref="searchForm" :model="publishSearchForm" inline>
            <el-form-item label="状态" prop="status">
              <el-radio-group 
                v-model="publishSearchForm.status" 
                @change="handleSearch"
                style="margin-right: 16px">
                <el-radio-button :label="0">未发布</el-radio-button>
                <el-radio-button :label="1">已发布</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="标题" prop="title">
              <el-input v-model="publishSearchForm.title" placeholder="请输入标题" clearable />
            </el-form-item>
            <el-form-item label="发布单位" prop="publisherDeptName">
              <el-input v-model="publishSearchForm.publisherDeptName" placeholder="请输入发布单位" clearable />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch"> 搜索 </el-button>
              <el-button @click="resetSearch"> 重置 </el-button>
            </el-form-item>
          </el-form>

          <!-- 发布操作按钮 -->
          <div class="action-buttons">
            <el-button type="primary" @click="publishNewNotice">
              发布通知
            </el-button>
          </div>
        </div>

        <!-- 通知表格 -->
        <el-table :data="publishedNotices" style="width: 100%" v-loading="loading">
          <el-table-column prop="title" label="标题" show-overflow-tooltip>
            <template #default="{ row }">
              <span v-if="row.urgent" class="urgent-tag">(紧急)</span>{{ row.title }}
            </template>
          </el-table-column>
          <el-table-column prop="publisherDeptName" label="发布单位"  />
          <el-table-column prop="status" label="发布状态">
            <template #default="{ row }">
              <span v-if="row.status === 1">已发布</span>
              <span v-else-if="row.status === 0">未发布</span>
              <span v-else>--</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="publishTime"
            label="发布时间"
          >
            <template #default="{ row }">
              {{ formatDate(row.publishTime ? new Date(row.publishTime) : null) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="createTime"
            label="创建时间"
          >
            <template #default="{ row }">
              {{ formatDate(row.createTime ? new Date(row.createTime) : null) }}
            </template>
          </el-table-column>
          <!-- 根据返回的数据判断是否显示阅读状态列 -->
          <el-table-column v-if="shouldShowReadStatus" label="阅读状态（已阅/总）">
            <template #default="{ row }">
              <el-link type="primary" @click="goToReadDetail(row)">
                {{ row.readStatus || '0/0' }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="300" fixed="right" align="center">
            <template #default="{ row }">
              <el-button link type="primary" @click="viewPublishedNotice(row)">查看</el-button>
              <!-- 未发布状态显示发布按钮 -->
              <el-button v-if="row.status === 0" link type="success" @click="publishNoticeItem(row)">发布</el-button>
              <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="publishCurrentPage"
            v-model:page-size="publishPageSize"
            :total="totalPublished"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
          />
        </div>
      </el-tab-pane>

      <!-- 已收通知标签 -->
      <el-tab-pane label="已收通知" name="received">
        <div class="search-section">
          <el-form ref="searchForm" :model="receivedSearchForm" inline>
            <el-form-item label="标题" prop="title">
              <el-input v-model="receivedSearchForm.title" placeholder="请输入标题" clearable />
            </el-form-item>
            <el-form-item label="发布单位" prop="publishUnit">
              <el-input v-model="receivedSearchForm.publishUnit" placeholder="请输入发布单位" clearable />
            </el-form-item>
            <el-form-item label="发布时间">
              <el-date-picker
                v-model="receivedSearchForm.timeRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch"> 搜索 </el-button>
              <el-button @click="resetSearch"> 重置 </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 已收通知表格 -->
        <el-table 
          v-if="activeTab === 'received'" 
          :data="receivedNotices" 
          style="width: 100%"
          v-loading="loading"
          @row-click="handleRowClick"
        >
          <el-table-column prop="title" label="通知标题"  show-overflow-tooltip />
          <el-table-column prop="publisherDeptName" label="发布单位"  show-overflow-tooltip />
          <el-table-column prop="publishTime" label="发布时间" >
            <template #default="{ row }">
              {{ formatDate(row.publishTime ? new Date(row.publishTime) : null) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" >
            <template #default="{ row }">
              <el-tag :type="row.status === 2 ? 'success' : 'warning'">
                {{ row.status === 2 ? '已阅读' : '未阅读' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作"  fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click.stop="viewReceivedNotice(row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="receivedCurrentPage"
            v-model:page-size="receivedPageSize"
            :total="totalReceived"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
          />
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 通知详情弹窗 -->
    <el-dialog v-model="noticeDialogVisible" :title="currentNotice.title" width="60%">
      <div class="notice-detail">
        <div class="notice-meta">
          <div>发布单位：{{ currentNotice.publisherDeptName }}</div>
          <div>发布时间：{{ formatDate(currentNotice.publishTime ? new Date(currentNotice.publishTime) : null) }}</div>
          <div>更新时间：{{ formatDate(currentNotice.createTime ? new Date(currentNotice.createTime) : null) }}</div>
          <div class="urgent-tag" v-if="currentNotice.urgencyLevel === 2">(紧急通知)</div>
        </div>
        <div class="notice-content">
          <h3>通知内容</h3>
          <p>{{ currentNotice.content }}</p>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="noticeDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { noticePage, NoticePageReqVO, noticeDelete, noticeGet, noticeUpdate, publishNotice, markDeptNoticeAsRead, noticeReceiveDeptPage } from '@/api/workbenches/notice'
import { formatDate } from '@/utils/formatTime'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const userStore = useUserStore()
// 激活的标签页
const activeTab = ref('publish')
const loading = ref(false)
const noticeDialogVisible = ref(false)

// 发布通知tab参数
const publishCurrentPage = ref(1)
const publishPageSize = ref(10)
const totalPublished = ref(0)
const publishSearchForm = reactive({
  title: '',
  publisherDeptName: '',
  status: 1, // 默认为已发布
  timeRange: []
})
const publishedNotices = ref<any[]>([])

// 计算属性：根据返回的数据判断是否显示阅读状态列
const shouldShowReadStatus = computed(() => {
  // 如果没有数据，不显示阅读状态列
  if (publishedNotices.value.length === 0) {
    return false
  }
  // 如果所有数据都是已发布状态(status === 1)，则显示阅读状态列
  return publishedNotices.value.every(notice => notice.status === 1)
})

// 已收通知tab参数
const receivedCurrentPage = ref(1)
const receivedPageSize = ref(10)
const totalReceived = ref(0)
const receivedSearchForm = reactive({
  title: '',
  publishUnit: '',
  timeRange: []
})
const receivedNotices = ref<any[]>([])

// 当前查看的通知
const currentNotice = ref({
  id: '',
  title: '',
  publisher: '',
  publishTime: '',
  updateTime: '',
  urgent: false,
  content: ''
})

// 获取状态文本
const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return '未下发'
    case 1:
      return '已下发'
    case 2:
      return '已阅读'
    default:
      return '未知'
  }
}

// 获取状态标签类型
const getStatusType = (status: number) => {
  switch (status) {
    case 0:
      return 'warning' // 未下发 - 黄色警告
    case 1:
      return 'info'    // 已下发 - 蓝色信息
    case 2:
      return 'success' // 已阅读 - 绿色成功
    default:
      return 'info'
  }
}

// 查询发布通知分页
const fetchPublishedNotices = async () => {
  loading.value = true
  try {
    const params: NoticePageReqVO = {
      pageNo: publishCurrentPage.value,
      pageSize: publishPageSize.value,
      title: publishSearchForm.title || undefined,
      publisherDeptName: publishSearchForm.publisherDeptName || undefined,
      status: publishSearchForm.status === '' ? undefined : publishSearchForm.status
    }
    console.log('publish params:', params)
    const res = await noticePage(params)
    
    // 处理数据：如果 publishTime 为空，则将 createTime 赋值给 publishTime
    const processedList = res.list.map((item: any) => ({
      ...item,
      publishTime: item.publishTime || item.createTime
    }))
    
    publishedNotices.value = processedList
    totalPublished.value = res.total
  } finally {
    loading.value = false
  }
}

// 查询已收通知分页
const fetchReceivedNotices = async () => {
  loading.value = true
  try {
    
    const params = {
      pageNo: receivedCurrentPage.value,
      pageSize: receivedPageSize.value,
      deptId: userStore.user.deptId, // 使用当前用户部门ID
      status: '1,2'
    }
    console.log('received params:', params)
    const res = await noticeReceiveDeptPage(params)
    
    if (res && res.list && res.list.length > 0) {
      // 获取所有通知ID
      const noticeIds = res.list.map((item: any) => item.noticeId)
      
      // 批量查询通知详情获取标题
      const noticeDetails = await Promise.all(
        noticeIds.map(async (noticeId: number) => {
          try {
            const noticeRes = await noticeGet(noticeId)
            return noticeRes
          } catch (error) {
            console.error(`获取通知详情失败, noticeId: ${noticeId}`, error)
            return null
          }
        })
      )
      
      // 合并数据
      const processedList = res.list.map((item: any, index: number) => {
        const noticeDetail = noticeDetails[index]
        return {
          ...item,
          title: noticeDetail?.title || '未知标题',
          publisherDeptName: noticeDetail?.publisherDeptName || '未知发布单位',
          publishTime: noticeDetail?.publishTime || noticeDetail?.createTime || item.createTime
        }
      }).filter(item => item.title !== '未知标题') // 过滤掉获取失败的通知
      
      receivedNotices.value = processedList
      totalReceived.value = res.total || 0
    } else {
      receivedNotices.value = []
      totalReceived.value = 0
    }
  } catch (error) {
    console.error('获取已收通知失败:', error)
    ElMessage.error('获取已收通知失败')
    receivedNotices.value = []
    totalReceived.value = 0
  } finally {
    loading.value = false
  }
}

// 搜索功能
const handleSearch = () => {
  if (activeTab.value === 'publish') {
    fetchPublishedNotices()
  } else {
    fetchReceivedNotices()
  }
}

// 重置搜索
const resetSearch = () => {
  if (activeTab.value === 'publish') {
    publishSearchForm.title = ''
    publishSearchForm.publisherDeptName = ''
    publishSearchForm.status = 1 // 重置时默认选中"已发布"状态
    publishSearchForm.timeRange = []
    fetchPublishedNotices()
  } else {
    receivedSearchForm.title = ''
    receivedSearchForm.publishUnit = ''
    receivedSearchForm.timeRange = []
    fetchReceivedNotices()
  }
}

// 分页变化
const handlePageChange = (page: number) => {
  if (activeTab.value === 'publish') {
    publishCurrentPage.value = page
    fetchPublishedNotices()
  } else {
    receivedCurrentPage.value = page
    fetchReceivedNotices()
  }
}
const handleSizeChange = (size: number) => {
  if (activeTab.value === 'publish') {
    publishPageSize.value = size
    fetchPublishedNotices()
  } else {
    receivedPageSize.value = size
    fetchReceivedNotices()
  }
}

// 切换标签页时触发
const handleTabClick = (tab: any) => {
  if (tab.paneName === 'publish') {
    fetchPublishedNotices()
  } else if (tab.paneName === 'received') {
    fetchReceivedNotices()
  }
}

// 发布通知
const publishNoticeItem = async (notice: any) => {
  try {
    // 直接调用发布接口
    await publishNotice(notice.id)
    ElMessage.success('发布成功')

    // 刷新列表
    fetchPublishedNotices()
  } catch (error) {
    console.error('发布通知失败:', error)
    ElMessage.error('发布失败')
  }
}

// 查看发布通知详情（发布通知tab）
const viewPublishedNotice = (notice: any) => {
  router.push(`/workbench/notice/info/${notice.id}`)
}

// 查看已收通知详情（已收通知tab）
const viewReceivedNotice = async (notice: any) => {
  try {
    // 标记为已读，使用noticeId
    await markDeptNoticeAsRead(notice.noticeId)
  } catch (error) {
    console.error('标记通知已读失败:', error)
  }
  
  // 跳转到详情页，使用noticeId
  router.push(`/workbench/notice/info/${notice.noticeId}`)
}

// 发布新通知
const publishNewNotice = () => {
  // 跳转到发布通告页面
  router.push('/workbench/notice/publish')
}

function goToReadDetail(row: any) {
  router.push(`/workbench/notice/detail/${row.id}`)
}

// 删除通知公告
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除通知公告"${row.title}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await noticeDelete(row.id)
      ElMessage.success('删除成功')

      // 刷新当前标签页的数据
      if (activeTab.value === 'publish') {
        fetchPublishedNotices()
      } else {
        fetchReceivedNotices()
      }
    } catch (error) {
      console.error('删除通知公告失败:', error)
      ElMessage.error('删除失败，请重试')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

onMounted(() => {
  fetchPublishedNotices()
})
</script>

<style lang="scss" scoped>
.notice-management-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.main-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 20px;
  }

  :deep(.el-tabs__nav-wrap::after) {
    background-color: transparent;
  }
}

.search-and-action {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;

  .action-buttons {
    display: flex;
    align-items: center;
  }
}

.search-section {
  margin-bottom: 20px;
}

.notice-detail {
  .notice-meta {
    padding: 15px;
    background-color: #f8f8f8;
    border-radius: 4px;
    margin-bottom: 20px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    font-size: 14px;
    color: #666;

    .urgent-tag {
      color: #e6a23c;
      font-weight: bold;
      grid-column: span 2;
    }
  }

  .notice-content {
    line-height: 1.8;

    h3 {
      margin-bottom: 15px;
      color: #333;
    }

    p {
      white-space: pre-wrap;
    }
  }
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.urgent-tag {
  color: #e6a23c;
  font-weight: bold;
  margin-right: 5px;
}

.status-tag {
  padding: 2px 8px;
  border-radius: 4px;
}
</style>
