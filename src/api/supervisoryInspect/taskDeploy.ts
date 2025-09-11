import request from '@/config/axios'


// 专项检查任务分页查询参数
export interface InspectionTaskPageReqVO {
  pageNo: string // 页码，从1开始
  pageSize: string // 每页条数，最大值为100
  taskTitle?: string // 专项检查任务标题
  taskDescription?: string // 专项检查任务描述
  taskSource?: string // 检查任务来源
  taskType?: string // 检查任务类型
  uploadDeptId?: string // 上传部门ID
  uploadDeptName?: string // 上传部门名称
  dispatchTime?: string // 任务派发时间
  inspectionStartTime?: string // 检查开始时间
  inspectionEndTime?: string // 检查结束时间
  status?: string // 任务状态(0-未派发, 1-已派发)
  hasHiddenDanger?: string // 是否存在隐患
  deliveryCheckType?: string // 下发类型(1-检查清单, 2-检查文件)
  filePaths?: string // 检查清单文件路径（多个用逗号分隔）
  checkType?: string // 检查清单类型(1-行业领域, 2-专项, 3-重大隐患)
  createTime?: string // 创建时间
  operatorId?: string // 操作人ID
}

// 企业检查清单分页查询参数
export interface InspectionTaskComPageReqVO {
  taskId: string // 检查任务ID，必填
  enterpriseName?: string // 企业名称，可选
  regionId?: string // 区域编码，可选
  industryId?: string // 国民经济类型，可选
  enterpriseScale?: string // 企业规模(大型/中型/小型/微型)，可选
  pageNo: string // 页码，从1开始，必填
  pageSize: string // 每页条数，最大值为100，必填
}

// 企业检查清单列表查询参数
export interface InspectionTaskComListReqVO {
  taskId: string // 检查任务ID，必填
  enterpriseName?: string // 企业名称，可选
  regionId?: string // 区域编码id，可选
  industryId?: string // 国民经济类型id，可选
  enterpriseScale?: string // 企业规模(大型/中型/小型/微型)，可选
  pageNo: string // 页码，从1开始（无效参数，必填）
  pageSize: string // 每页条数，最大值为100（无效参数，必填）
}

// 检查项目对象
export interface InspectionTaskItemVO {
  serialNum: number // 项目序号
  itemName: string // 检查项目名称
  inspectionStandard: string // 检查标准描述
}

// 检查任务对象
export interface InspectionTaskVO {
  deliveryCheckType: number // 下发类型：1-检查清单, 2-检查清单文件, 3-引用检查清单模版
  filePaths?: string // 检查清单文件路径（多个用逗号分隔），下发类型为2时必填
  checkType?: number // 检查清单类型：1-行业领域, 2-专项, 3-重大隐患，下发类型为3时必填
  inspectionTaskItemVOList?: InspectionTaskItemVO[] // 检查项目列表，下发类型为1、3时必填
  compIdList?: string[] // 下发企业id列表
}

// 专项检查任务批量新增请求对象
export interface InspectionTaskSaveVO {
  taskTitle: string // 专项检查任务标题
  taskDescription: string // 专项检查任务描述
  taskType: string // 检查任务类型
  dispatchTime: string // 任务派发时间
  inspectionStartTime: string // 检查开始时间
  inspectionEndTime: string // 检查结束时间
  inspectionTaskVOList: InspectionTaskVO[] // 检查任务列表
}

// 获得专项检查任务分页
export const getInspectionTaskPage = (params: InspectionTaskPageReqVO) => {
  return request.get({
    url: '/prt/inspection-task/page',
    params
  })
}

// 管理后台 - 专项检查任务批量新增
export const createInspectionTaskBatch = (data: InspectionTaskSaveVO) => {
  return request.post({
    url: '/prt/inspection-task/create-batch',
    data
  })
}

// 获得专项检查任务
export const getInspectionTask = (id: string) => {
  return request.get({
    url: '/prt/inspection-task/get',
    params: { id }
  })
}

// 获得企业检查清单（报告详情）分页
export const getInspectionTaskComPage = (params: InspectionTaskComPageReqVO) => {
  return request.get({
    url: '/prt/inspection-task-com/page',
    params
  })
}

// 获得企业检查清单（任务详情 搜索 列表）
export const getInspectionTaskComList = (params: InspectionTaskComListReqVO) => {
  return request.get({
    url: '/prt/inspection-task-com/list',
    params
  })
}

// 删除专项检查任务
export const deleteInspectionTask = (id: string) => {
  return request.delete({
    url: '/prt/inspection-task/delete',
    params: { id }
  })
}

