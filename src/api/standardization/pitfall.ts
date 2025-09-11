import request from '@/config/axios'

// 隐患整改单分页查询参数
export interface DangerRectPageReqVO {
  pageNo: string // 页码，从 1 开始
  pageSize: string // 每页条数，最大值为 100
  timeLimit?: string // 整改完成期限(逗号隔开)
  inspectId?: string // 检查单ID
  deptId?: string // 企业ID
  deptName?: string // 企业名称
  provinceCode?: string // 省code
  cityCode?: string // 市code
  areaCode?: string // 区县code
  inspectRecordId?: string // 检查记录ID
  rectConditionType?: string // 隐患整改单状态（5：未整改 6：逾期未整改 50：整改完成）
  dangerLevel?: string // 隐患等级（5：一般隐患 10：重大隐患）
  industryId?: string // 国民经济类型Id
  riskEnvTypes?: string // 所涉高危环境类型
}

// 获得隐患整改单分页
export const getDangerRectPage = (params: DangerRectPageReqVO) => {
  return request.get({
    url: '/prt/danger-rect/page',
    params
  })
}

// 获得隐患整改单详情
export const getDangerRect = (id) => {
  return request.get({
    url: '/prt/danger-rect/get',
    params: { id }
  })
}

// 获得隐患整改（状态）数量
export const getDangerRectCount = (params: DangerRectPageReqVO) => {
  return request.get({
    url: '/prt/danger-rect/count',
    params
  })
}