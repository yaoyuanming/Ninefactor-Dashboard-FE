import request from '@/config/axios'

// 风险单元 VO
export interface DangerRectSaveReqVO {
  "id": number
  "deptId": number,
  "inspectRecordId": number
  "rectConditionType": number
  "dangerRectCode": string
  "dangerDesc": string
  "dangerLevel": number
  "dangerSource": number
  "dangerAddress": string
  "dangerUrl": string
  "inspectUserId": string
  "inspectUserName": string
  "inspectTime": string
  "respDeptId": number
  "respDeptName": string
  "rectChargeUserId": string
  "rectChargeUserName": string
  "rectCompleteUrl": string
  "rectCompletionState": string
  "rectCompleteTime": string
}

// 风险单元 API
export const DangerRectApi = {
  // 获得隐患整改单分页
  getDangerRectPage: async (params: any) => {
    return await request.get({ url: `/prt/danger-rect/page`, params })
  },

  // 获得隐患整改单
  getDangerRect: async (id: number) => {
    return await request.get({ url: `prt/danger-rect/get?id=` + id })
  },

  // 创建隐患整改单
  createDangerRect: async (data: DangerRectSaveReqVO) => {
    return await request.post({ url: `/prt/danger-rect/create`, data })
  },

  // 更新隐患整改单
  updateDangerRect: async (data: DangerRectSaveReqVO) => {
    return await request.put({ url: `/prt/danger-rect/update`, data })
  },

  // 整改完成录入
  completeInput: async (data: any) => {
    return await request.put({ url: `/prt/danger-rect/complete-input`, data })
  },

  // 删除风险单元
  deleteDangerRect: async (id: number) => {
    return await request.delete({ url: `/prt/danger-rect/delete?id=` + id })
  },

  // 导出风险单元 Excel
  exportDangerRect: async (params) => {
    return await request.download({ url: `/prt/danger-rect/export-excel`, params })
  },
//   分配任务
  createAssignTask: async (data: any) => {
    return await request.post({ url: `/prt/inspect-task/create`, data })
  },
// 获得任务
  getTaskById: async (id: number) => {
    return await request.get({ url: `/prt/inspect-task/get?id=` + id })
  },
}
