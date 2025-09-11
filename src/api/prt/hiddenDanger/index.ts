import request from '@/config/axios'

// 隐患上报记录 VO
export interface DangerReportRecordSaveReqVO {
  id: number
  deptId: number
  recordCode: string
  dangerRectId: number
  dangerRectCode: string
  dangerDesc: string
  dangerLevel: number
  dangerAddress: string
  dangerUrl: string
  reportUserId: number
  reportUserName: string
  reportUserAccount: string
  reportUserMobile: string
  reportUserDeptId: number
  reportUserDeptName: string
  dangerReportState: number
}

// 隐患上报记录 API
export const RecordApi = {
  // 获得隐患上报记录分页
  getRecordPage: async (params: any) => {
    return await request.get({ url: `/prt/danger-report-record/page`, params })
  },

  // 获得隐患上报记录
  getRecord: async (id) => {
    return await request.get({ url: `/prt/danger-report-record/get?id=` + id })
  },

  // 创建隐患上报记录
  createRecord: async (data: DangerReportRecordSaveReqVO) => {
    return await request.post({ url: `/prt/danger-report-record/create`, data })
  },

  // 更新隐患上报记录
  updateRecord: async (data: DangerReportRecordSaveReqVO) => {
    return await request.put({ url: `/prt/danger-report-record/update`, data })
  },

  // 删除隐患上报记录
  deleteRecord: async (id: number) => {
    return await request.delete({ url: `/prt/danger-report-record/delete?id=` + id })
  },

  // 导出隐患上报记录 Excel
  exportRecord: async (params) => {
    return await request.download({ url: `/prt/danger-report-record/export-excel`, params })
  },
//   获得隐患上报排行
  getStatPage: async (params: any) => {
    return await request.get({ url: `/prt/danger-report-record/stat`, params })
  },
  // 采纳审批
  createdApprove: async (data: DangerReportRecordSaveReqVO) => {
    return await request.post({ url: `/prt/danger-report-record/approve`, data })
  },
//   分配整改任务
  createdAllocation: async (data: DangerReportRecordSaveReqVO) => {
    return await request.post({ url: `/prt/danger-report-record/allocation`, data })
  },
}
