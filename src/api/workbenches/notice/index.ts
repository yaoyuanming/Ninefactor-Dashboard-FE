import request from '@/config/axios'

// 通知公告分页请求 VO
export interface NoticePageReqVO {
  pageNo: number // 页码，从 1 开始
  pageSize: number // 每页条数，最大值为 100
  title?: string // 通知标题
  content?: string // 富文本内容
  publisherId?: number // 发布人ID
  publisherName?: string // 发布人姓名
  publisherDeptId?: number // 发布单位ID
  publisherDeptName?: string // 发布单位名称
  urgencyLevel?: number // 紧急程度：1-普通，2-紧急
  status?: number // 状态：0-未发布，1-已发布
  publishTime?: string[] // 发布时间
  createTime?: string[] // 创建时间
}

// 通知公告新增/修改请求 VO
export interface NoticeSaveReqVO {
  id?: number // 主键，示例值(16905)
  title: string // 通知标题
  content: string // 富文本内容
  publisherId: number // 发布人ID，示例值(2903)
  publisherName?: string // 发布人姓名，示例值(张三)
  publisherDeptId: number // 发布单位ID，示例值(26909)
  publisherDeptName?: string // 发布单位名称，示例值(李四)
  urgencyLevel: number // 紧急程度：1-普通，2-紧急
  status?: number // 状态：0-未发布，1-已发布，示例值(1)
  publishTime?: string // 发布时间
  attachment?: string // 附页，多个以,分隔
  recordDepts?: string // 接收单位列表，多个以,分隔
  recordCompanyIds?: string // 接收企业列表，多个以,分隔
  isPublish?: boolean // 是否发布
}

// 导出通知公告Excel
export interface NoticeExportExcelReqVO {
  pageNo: string
  pageSize: string
  title?: string
  content?: string
  publisherId?: string
  publisherName?: string
  publisherDeptId?: string
  publisherDeptName?: string
  urgencyLevel?: string
  status?: string
  publishTime?: string
  createTime?: string
}

// 创建通知公告
export const noticeCreate = (data: NoticeSaveReqVO) => {
  return request.post({ url: '/mws/notice/create', data })
}

// 更新通知公告
export const noticeUpdate = (data: NoticeSaveReqVO) => {
  return request.put({ url: '/mws/notice/update', data })
}


// 获取通知公告分页
export const noticePage = (data: NoticePageReqVO) => {
  return request.post({ url: '/mws/notice/page', data })
}

// 删除通知公告
export const noticeDelete = (id: number) => {
  return request.delete({ url: '/mws/notice/delete', params: { id } })
}

// 导出通知公告Excel
export const noticeExportExcel = (params: NoticeExportExcelReqVO) => {
  return request.get({ url: '/mws/notice/export-excel', params, responseType: 'blob' })
}

// 获取通知公告详情
export const noticeGet = (id: number) => {
  return request.get({ url: '/mws/notice/get', params: { id } })
}


// 发布通知公告
export const publishNotice = (id: number) => {
  return request.put({
    url: '/mws/notice/publish',
    params: { id }
  })
}


// 通知接收单位分页请求 VO
export interface NoticeReceiveDeptPageReqVO {
  pageNo: string // 页码，从 1 开始
  pageSize: string // 每页条数，最大值为 100
  noticeId?: string // 通知ID
  deptId?: string // 接收部门ID
  deptName?: string // 接收部门名称
  status?: string // 状态
  createTime?: string // 创建时间
}

// 获取通知接收单位分页
export const noticeReceiveDeptPage = (params: NoticeReceiveDeptPageReqVO) => {
  return request.get({ url: '/mws/notice-receive-dept/page', params })
}

// 通知接收单位分页请求 VO（带阅读状态）
export interface NoticeReceiveDeptPageWithStatusReqVO {
  pageNo: string // 页码，从 1 开始
  pageSize: string // 每页条数，最大值为 100
  noticeId?: string // 通知ID
  deptId?: string // 接收部门ID
  deptName?: string // 接收部门名称
  status?: string // 状态：0-未下发，1-下发，2-阅读
  createTime?: string // 创建时间
}

// 获取通知接收单位分页（带阅读状态）
export const noticeReceiveDeptPageWithStatus = (params: NoticeReceiveDeptPageWithStatusReqVO) => {
  return request.get({ url: '/mws/notice-receive-dept/page', params })
}

// 通知接收企业分页请求 VO
export interface NoticeReceiveCompanyPageReqVO {
  pageNo: string // 页码，从 1 开始
  pageSize: string // 每页条数，最大值为 100
  noticeId?: string // 通知ID
  companyId?: string // 接收企业ID
  companyName?: string // 企业名称
  creditCode?: string // 统一信用代码
  regionId?: string // 区域编码Id
  industryId?: string // 国民经济类型编码Id
  supervisorDeptId?: string // 市行业监管部门ID
  status?: string // 状态
  createTime?: string // 创建时间
}

// 获取通知接收企业分页
export const noticeReceiveCompanyPage = (params: NoticeReceiveCompanyPageReqVO) => {
  return request.get({ url: '/mws/notice-receive-company/page', params })
}

// 通知接收企业分页请求 VO（带阅读状态）
export interface NoticeReceiveCompanyPageWithStatusReqVO {
  pageNo: string // 页码，从 1 开始
  pageSize: string // 每页条数，最大值为 100
  noticeId?: string // 通知ID
  companyId?: string // 接收企业ID
  companyName?: string // 企业名称
  status?: string // 状态：0-未下发，1-下发，2-阅读
  createTime?: string // 创建时间
  industryCode?: string // 国民经济类型编码
  supervisorDeptId?: string // 市行业监管部门ID
  regionCode?: string // 区域编码
}

// 获取通知接收企业分页（带阅读状态）
export const noticeReceiveCompanyPageWithStatus = (params: NoticeReceiveCompanyPageWithStatusReqVO) => {
  return request.get({ url: '/mws/notice-receive-company/page', params })
}

/**
 * 获取通知阅读记录分页
 * @param params 查询参数
 * @returns 
 */
export interface NoticeReadRecordPageReqVO {
  pageNo: string // 页码，从 1 开始
  pageSize: string // 每页条数，最大值为 100
  noticeId?: string // 通知ID
  readerId?: string // 阅读人ID
  readerName?: string // 阅读人姓名
  readerAccount?: string // 阅读人账号
  readerType?: string // 阅读人类型：1-政府单位人员，2-企业人员
  deptId?: string // 所属部门ID(政府人员)
  deptName?: string // 所属部门名称
  companyId?: string // 所属企业ID(企业人员)
  companyName?: string // 所属企业名称
  regionId?: string // 区域编码Id
  mobile?: string // 联系电话
  readTime?: string // 阅读时间
  ip?: string // IP地址
  deviceInfo?: string // 设备信息
}

export const getNoticeReadRecordPage = (params: NoticeReadRecordPageReqVO) => {
  return request.get({
    url: '/mws/notice-read-record/page',
    params
  })
}

/**
 * 获取通知阅读记录详情
 * @param id 阅读记录ID
 * @returns 
 */
export const getNoticeReadRecord = (id: number) => {
  return request.get({
    url: '/mws/notice-read-record/get',
    params: { id }
  })
}

/**
 * 部门人员标记通知为已读
 * @param noticeId 通知ID
 * @returns 
 */
export const markDeptNoticeAsRead = (noticeId: string) => {
  return request.get({
    url: '/mws/notice-receive-dept/mark-as-read',
    params: { noticeId }
  })
}



