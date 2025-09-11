<template>
  <div class="notice-read-detail-container">
    <!-- 1. 标题 -->
    <div class="page-header">
      <el-button @click="goBack" type="primary" plain>
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
    <h2 class="page-title">阅读详情</h2>
    </div>

    <!-- 2. 基本信息区 -->
    <el-descriptions :column="4" border label-width="80px">
      <el-descriptions-item label="标题" :span="2">{{ detail.title }}</el-descriptions-item>
      <el-descriptions-item label="发布单位"  :span="2">{{ detail.publisherDeptName }}</el-descriptions-item>
      <el-descriptions-item label="发布时间" :span="2">{{ formatPublishTime }}</el-descriptions-item>
      <el-descriptions-item label="创建时间" :span="2">{{ formatCreateTime }}</el-descriptions-item>
    </el-descriptions>

    <!-- 3. 统计区 -->
    <el-radio-group v-model="readStatus" class="read-status-radio" style="margin-bottom: 10px;" @change="handleReadStatusChange">
      <el-radio-button label="unread">未阅读 {{ unreadCount }}</el-radio-button>
      <el-radio-button label="read">已阅读{{ readCount }}</el-radio-button>
    </el-radio-group>

    <!-- 4. 部门/企业切换区 -->
    <el-tabs v-model="tabType" class="dept-company-tabs" @tab-change="handleTabChange">
      <!-- 未阅读状态 -->
      <el-tab-pane :label="`部门 ${deptCount}`" name="dept" v-if="readStatus === 'unread'">
        <el-form :inline="true" :model="searchFormDept" class="filter-bar">
          <el-form-item label="部门名称">
            <el-input v-model="searchFormDept.deptName" placeholder="请输入" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button type="warning">一键催阅</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="tableDataDept" border style="margin-top: 10px;" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" />
          <el-table-column prop="index" label="序号" width="60" />
          <el-table-column prop="name" label="名称" />
          <el-table-column prop="account" label="账号" />
          <el-table-column prop="region" label="区域" />
          <el-table-column prop="contact" label="业务对接人" />
          <el-table-column prop="phone" label="手机号" />
          <el-table-column label="操作" width="80">
            <template #default="scope">
              <el-link type="primary" @click="handleRemindOne(scope.row)">催阅</el-link>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      
      <el-tab-pane :label="`企业 ${companyCount}`" name="company" v-if="readStatus === 'unread'">
        <el-form :inline="true" :model="searchFormCompany" class="filter-bar">
          <el-form-item label="企业名称">
            <el-input v-model="searchFormCompany.companyName" placeholder="请输入" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button type="warning">一键催阅</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="tableDataCompany" border style="margin-top: 10px;" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" />
          <el-table-column prop="index" label="序号" width="60" />
          <el-table-column prop="name" label="名称" />
          <el-table-column prop="account" label="账号" />
          <el-table-column prop="region" label="区域" />
          <el-table-column prop="contact" label="业务对接人" />
          <el-table-column prop="phone" label="手机号" />
          <el-table-column label="操作" width="80">
            <template #default="scope">
              <el-link type="primary" @click="handleRemindOne(scope.row)">催阅</el-link>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      
      <!-- 已阅读状态 -->
      <el-tab-pane :label="`部门 ${deptCount}`" name="dept" v-if="readStatus === 'read'">
        <el-form :inline="true" :model="searchFormDept" class="filter-bar">
          <el-form-item label="部门名称">
            <el-input v-model="searchFormDept.deptName" placeholder="请输入" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="tableDataDept" border style="margin-top: 10px;">
          <el-table-column prop="index" label="序号" width="60" />
          <el-table-column prop="name" label="名称" />
          <el-table-column prop="account" label="账号" />
          <el-table-column prop="region" label="区域" />
          <el-table-column prop="contact" label="业务对接人" />
          <el-table-column prop="phone" label="手机号" />
          <el-table-column prop="readTime" label="阅读时间">
            <template #default="scope">
              {{ formatDate(scope.row.readTime ? new Date(scope.row.readTime) : null) }}
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      
      <el-tab-pane :label="`企业 ${companyCount}`" name="company" v-if="readStatus === 'read'">
        <el-form :inline="true" :model="searchFormCompany" class="filter-bar">
          <el-form-item label="企业名称">
            <el-input v-model="searchFormCompany.companyName" placeholder="请输入" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="tableDataCompany" border style="margin-top: 10px;">
          <el-table-column prop="index" label="序号" width="60" />
          <el-table-column prop="name" label="名称" />
          <el-table-column prop="account" label="账号" />
          <el-table-column prop="region" label="区域" />
          <el-table-column prop="contact" label="业务对接人" />
          <el-table-column prop="phone" label="手机号" />
          <el-table-column prop="readTime" label="阅读时间">
            <template #default="scope">
              {{ formatDate(scope.row.readTime ? new Date(scope.row.readTime) : null) }}
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 5. 分页 -->
    <div class="pagination-bar">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { noticeGet, noticeReceiveDeptPageWithStatus, noticeReceiveCompanyPageWithStatus, getNoticeReadRecordPage } from '@/api/workbenches/notice'
import { ElMessage } from 'element-plus'
import { formatDate } from '@/utils/formatTime'
import { ArrowLeft } from '@element-plus/icons-vue'

const route = useRoute()
const noticeId = ref(route.params.id as string)

const detail = ref({ title: '', publisherDeptName: '', publishTime: '', updateTime: '' })
const unreadCount = ref(0)
const readCount = ref(0)
const deptCount = ref(0)
const companyCount = ref(0)
const deptReadCount = ref(0) // 部门已阅读数量
const companyReadCount = ref(0) // 企业已阅读数量
const tabType = ref('dept')
const readStatus = ref('unread')
const searchFormDept = ref({ deptName: '' })
const searchFormCompany = ref({ companyName: '' })
const tableDataDept = ref([])
const tableDataCompany = ref([])
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)

// 获取通知详情
const getNoticeDetail = async () => {
  try {
    const res = await noticeGet(Number(noticeId.value))
    if (res) {
      // 处理数据：如果 publishTime 为空，则将 createTime 赋值给 publishTime
      if (!res.publishTime && res.createTime) {
        res.publishTime = res.createTime
      }
      detail.value = res
    }
  } catch (error) {
    console.error('获取通知详情失败:', error)
    ElMessage.error('获取通知详情失败')
  }
}

// 获取部门阅读记录（未阅读状态）
const getDeptReadRecords = async () => {
  try {
    const params = {
      pageNo: currentPage.value.toString(),
      pageSize: pageSize.value.toString(),
      noticeId: noticeId.value
      // 不传status，默认获取已下发的（未阅读）
    }
    
    // 添加搜索参数
    if (searchFormDept.value.deptName) {
      params.deptName = searchFormDept.value.deptName
    }
    
    const res = await noticeReceiveDeptPageWithStatus(params)
    if (res) {
      // 处理返回的数据
      const list = res.list || []
      
      // 处理表格数据
      const processedList = list.map((item, index) => {
        return {
          ...item,
          index: (currentPage.value - 1) * pageSize.value + index + 1, // 序号
          name: item.deptName || '--', // 部门名称
          account: item.deptId || '--', // 部门ID作为账号
          region: item.regionCode || '--', // 区域编码
          contact: item.deptName || '--', // 部门名称作为业务对接人
          phone: '--', // 手机号暂时设为默认值
          status: item.status // 状态：0-未下发，1-下发，2-阅读
        }
      })
      
      tableDataDept.value = processedList
      deptCount.value = res.total || 0
      total.value = res.total || 0
    }
  } catch (error) {
    console.error('获取部门阅读记录失败:', error)
    ElMessage.error('获取部门阅读记录失败')
  }
}

// 获取企业阅读记录（未阅读状态）
const getCompanyReadRecords = async () => {
  try {
    const params = {
      pageNo: currentPage.value.toString(),
      pageSize: pageSize.value.toString(),
      noticeId: noticeId.value
      // 不传status，默认获取已下发的（未阅读）
    }
    
    // 添加搜索参数
    if (searchFormCompany.value.companyName) {
      params.companyName = searchFormCompany.value.companyName
    }
    
    const res = await noticeReceiveCompanyPageWithStatus(params)
    if (res) {
      // 处理返回的数据
      const list = res.list || []
      
      // 处理表格数据
      const processedList = list.map((item, index) => {
        return {
          ...item,
          index: (currentPage.value - 1) * pageSize.value + index + 1, // 序号
          name: item.companyName || '--', // 企业名称
          account: item.companyId || '--', // 企业ID作为账号
          region: item.regionCode || '--', // 区域编码
          contact: item.companyName || '--', // 企业名称作为业务对接人
          phone: '--', // 手机号暂时设为默认值
          status: item.status // 状态：0-未下发，1-下发，2-阅读
        }
      })
      
      tableDataCompany.value = processedList
      companyCount.value = res.total || 0
      total.value = res.total || 0
    }
  } catch (error) {
    console.error('获取企业阅读记录失败:', error)
    ElMessage.error('获取企业阅读记录失败')
  }
}

// 获取已阅读记录（包含企业和部门）
const getReadRecords = async (readerType) => {
  try {
    const params = {
      pageNo: currentPage.value.toString(),
      pageSize: pageSize.value.toString(),
      noticeId: noticeId.value,
      readerType: readerType // 1-部门，2-企业
    }
    
    // 添加搜索参数
    if (readerType === 1 && searchFormDept.value.deptName) {
      // 部门搜索
      params.deptName = searchFormDept.value.deptName
    } else if (readerType === 2 && searchFormCompany.value.companyName) {
      // 企业搜索
      params.companyName = searchFormCompany.value.companyName
    }
    
    const res = await getNoticeReadRecordPage(params)
    if (res) {
      const list = res.list || []
      
      // 处理表格数据
      const processedList = list.map((item, index) => {
        return {
          ...item,
          index: (currentPage.value - 1) * pageSize.value + index + 1, // 序号
          name: item.readerType === 1 ? item.deptName : item.companyName, // 名称
          account: item.readerAccount || '--', // 账号
          region: item.regionId || '--', // 区域
          contact: item.readerName || '--', // 业务对接人
          phone: item.mobile || '--', // 手机号
          readTime: item.readTime // 阅读时间
        }
      })
      
      if (readerType === 1) {
        // 部门数据
        tableDataDept.value = processedList
        deptCount.value = res.total || 0
      } else {
        // 企业数据
        tableDataCompany.value = processedList
        companyCount.value = res.total || 0
      }
      
      total.value = res.total || 0
    }
  } catch (error) {
    console.error('获取已阅读记录失败:', error)
    ElMessage.error('获取已阅读记录失败')
  }
}



// 初始化数据（获取统计数据和初始表格数据）
const initData = async () => {
  try {
    // 获取通知详情
    await getNoticeDetail()
    
    // 获取未阅读的部门列表（同时用于统计和表格数据）
    const deptParams = {
      pageNo: currentPage.value.toString(),
      pageSize: pageSize.value.toString(),
      noticeId: noticeId.value
    }
    const deptRes = await noticeReceiveDeptPageWithStatus(deptParams)
    
    // 获取未阅读的企业数量（仅用于统计）
    const companyParams = {
      pageNo: '1',
      pageSize: '1',
      noticeId: noticeId.value
    }
    const companyRes = await noticeReceiveCompanyPageWithStatus(companyParams)
    
    // 获取已阅读的部门数据（用于统计和后续显示）
    const deptReadParams = {
      pageNo: '1',
      pageSize: '1',
      noticeId: noticeId.value,
      readerType: 1 // 部门
    }
    const deptReadRes = await getNoticeReadRecordPage(deptReadParams)
    
    // 获取已阅读的企业数据（用于统计和后续显示）
    const companyReadParams = {
      pageNo: '1',
      pageSize: '1',
      noticeId: noticeId.value,
      readerType: 2 // 企业
    }
    const companyReadRes = await getNoticeReadRecordPage(companyReadParams)
      
      // 更新统计数据
    deptCount.value = deptRes?.total || 0
    companyCount.value = companyRes?.total || 0
    deptReadCount.value = deptReadRes?.total || 0 // 部门已阅读数量
    companyReadCount.value = companyReadRes?.total || 0 // 企业已阅读数量
    readCount.value = deptReadCount.value + companyReadCount.value // 已阅读总数 = 部门已读 + 企业已读
    
    // 计算未阅读数量（已下发的总数 - 已阅读的总数）
    const totalUnread = (deptRes?.total || 0) + (companyRes?.total || 0) - readCount.value
    unreadCount.value = Math.max(0, totalUnread)
    
    // 处理部门表格数据（未阅读状态）
    if (deptRes) {
      const list = deptRes.list || []
      const processedList = list.map((item, index) => {
        return {
          ...item,
          index: (currentPage.value - 1) * pageSize.value + index + 1,
          name: item.deptName || '--',
          account: item.deptId || '--',
          region: item.regionCode || '--',
          contact: item.deptName || '--',
          phone: '--',
          status: item.status
        }
      })
      tableDataDept.value = processedList
      total.value = deptRes.total || 0
    }
    

  } catch (error) {
    console.error('初始化数据失败:', error)
    ElMessage.error('初始化数据失败')
  }
}

const handleSelectionChange = (selection) => {
  console.log('选中的行:', selection)
}

const handleRemindOne = (row) => {
  ElMessage.success(`已向 ${row.name} 发送阅读提醒`)
}

// 查询按钮处理
const handleQuery = () => {
  currentPage.value = 1
  if (readStatus.value === 'unread') {
    if (tabType.value === 'dept') {
      getDeptReadRecords()
    } else {
      getCompanyReadRecords()
    }
  } else {
    getReadRecords(tabType.value === 'dept' ? 1 : 2)
  }
}

// 重置按钮处理
const handleReset = () => {
  if (tabType.value === 'dept') {
    searchFormDept.value.deptName = ''
  } else {
    searchFormCompany.value.companyName = ''
  }
  currentPage.value = 1
  if (readStatus.value === 'unread') {
    if (tabType.value === 'dept') {
      getDeptReadRecords()
    } else {
      getCompanyReadRecords()
    }
  } else {
    getReadRecords(tabType.value === 'dept' ? 1 : 2)
  }
}

const handleSizeChange = (size) => {
  pageSize.value = size
  if (readStatus.value === 'unread') {
    if (tabType.value === 'dept') {
      getDeptReadRecords()
    } else {
      getCompanyReadRecords()
    }
  } else {
  getReadRecords(tabType.value === 'dept' ? 1 : 2)
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  if (readStatus.value === 'unread') {
    if (tabType.value === 'dept') {
      getDeptReadRecords()
    } else {
      getCompanyReadRecords()
    }
  } else {
  getReadRecords(tabType.value === 'dept' ? 1 : 2)
  }
}

// 监听标签页和阅读状态变化
const handleTabChange = () => {
  currentPage.value = 1
  if (readStatus.value === 'unread') {
    if (tabType.value === 'dept') {
      getDeptReadRecords()
    } else {
      getCompanyReadRecords()
    }
  } else {
  getReadRecords(tabType.value === 'dept' ? 1 : 2)
  }
}

const handleReadStatusChange = async () => {
  currentPage.value = 1
  
  if (readStatus.value === 'unread') {
    // 未阅读状态：同时获取部门和企业的未阅读数据
    await Promise.all([
      getDeptReadRecords(),
      getCompanyReadRecords()
    ])
    
    // 恢复未阅读状态的数量（从initData中获取的原始数据）
    // 这里需要重新获取未阅读的数量
    const deptParams = { pageNo: '1', pageSize: '1', noticeId: noticeId.value }
    const companyParams = { pageNo: '1', pageSize: '1', noticeId: noticeId.value }
    
    const [deptRes, companyRes] = await Promise.all([
      noticeReceiveDeptPageWithStatus(deptParams),
      noticeReceiveCompanyPageWithStatus(companyParams)
    ])
    
    deptCount.value = deptRes?.total || 0
    companyCount.value = companyRes?.total || 0
  } else {
    // 已阅读状态：同时获取部门和企业的已阅读数据，并更新标签页数量
    await Promise.all([
      getReadRecords(1), // 部门
      getReadRecords(2)  // 企业
    ])
    
    // 更新标签页数量为已阅读的数量
    deptCount.value = deptReadCount.value
    companyCount.value = companyReadCount.value
  }
}

// 格式化时间显示
const formatPublishTime = computed(() => {
  return formatDate(detail.value.publishTime ? new Date(detail.value.publishTime) : null)
})

const formatCreateTime = computed(() => {
  return formatDate(detail.value.createTime ? new Date(detail.value.createTime) : null)
})

// 返回上一页
const goBack = () => {
  history.back()
}

// 页面加载时获取数据
onMounted(() => {
  if (noticeId.value) {
    initData()
  } else {
    ElMessage.error('通知ID不存在')
  }
})
</script>

<style scoped>
.notice-read-detail-container {
  background: #fff;
  padding: 24px;
  border-radius: 6px;
}
.page-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
}
.page-title {
  font-size: 22px;
  font-weight: bold;
}
.read-status-radio {
  margin-top: 8px;
}
.dept-company-tabs {
  margin: 10px 0 18px 0;
}
.filter-bar {
  margin-bottom: 10px;
}
.pagination-bar {
  margin: 18px 0 0 0;
  text-align: right;
}
</style>
