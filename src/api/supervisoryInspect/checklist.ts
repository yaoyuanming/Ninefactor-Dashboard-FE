import request from '@/config/axios'

// ========== 检查清单相关接口 ==========

// 检查清单新增/修改 Request VO
export interface InspectCheckSaveReqVO {
  id?: number // 检查清单ID（新增时不需要）
  checkName: string // 检查清单名称
  checkType: number // 检查清单类型：1.行业领域/2.专项/3.重大隐患
  industryType: string // 适用行业类型
  isDisplayed: boolean // 是否在企业端展示：0-不展示，1-展示
  filePath: string // 文件存储路径（.xlsx格式）
  remark?: string // 备注信息
}

// 检查清单分页查询 Request VO
export interface InspectCheckPageReqVO extends PageParam {
  checkName?: string // 检查清单名称
  checkType?: string // 检查清单类型：1行业领域/2专项/3重大隐患
  industryType?: string // 适用行业类型
  uploadDepId?: string // 上传部门ID（账号部门）
  isDisplayed?: string // 是否在企业端展示：0-不展示，1-展示
  filePath?: string // 文件存储路径（.xlsx格式）
  lastOperationTime?: string // 最近操作时间
  operatorId?: string // 最后操作人ID
  createTime?: string // 创建时间
  remark?: string // 备注信息
}

// 检查清单 Response VO
export interface InspectCheckRespVO {
  id: number // 检查清单ID
  checkName: string // 检查清单名称
  checkType: number // 检查清单类型
  industryType: string // 适用行业类型
  uploadDepId?: string // 上传部门ID（账号部门）
  isDisplayed: boolean // 是否在企业端展示
  filePath: string // 文件存储路径
  lastOperationTime?: string // 最近操作时间
  operatorId?: string // 最后操作人ID
  createTime: Date // 创建时间
  updateTime: Date // 更新时间
  remark?: string // 备注信息
}

// 创建检查清单
export const createInspectCheck = (data: InspectCheckSaveReqVO) => {
  return request.post({ url: '/prt/inspect-check/create', data })
}

// 更新检查清单
export const updateInspectCheck = (data: InspectCheckSaveReqVO) => {
  return request.put({ url: '/prt/inspect-check/update', data })
}

// 删除检查清单
export const deleteInspectCheck = (id: number) => {
  return request.delete({ url: '/prt/inspect-check/delete?id=' + id })
}

// 获得检查清单
export const getInspectCheck = (id: number) => {
  return request.get({ url: '/prt/inspect-check/get?id=' + id })
}

// 获得检查清单分页
export const getInspectCheckPage = (params: InspectCheckPageReqVO) => {
  return request.get({ url: '/prt/inspect-check/page', params })
}

// 解析检查清单附件
export const parseInspectCheckFile = (fileUrl: string) => {
  return request.post({
    url: `/prt/inspect-check/parse-file?fileUrl=${encodeURIComponent(fileUrl)}`
  })
}

