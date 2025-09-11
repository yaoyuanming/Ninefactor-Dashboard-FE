import request from '@/config/axios'

// 检查记录 VO
export interface InspectRespVO {
  "id": number
  "deptId": number
  "inspectCode": string
  "inspectName":string
  "inspectListCat": number
  "validType": number
  "startTime": string
  "endTime": string
  "inspectItemType": number
  "inspectTarget": string
  "listDate": string
  "listSource": string
  "inspectionLevel": number
  "inspectionType": number
  "govInspectListType": number
  "govAgencyName": string
  "govAgencyCode": string
  "uploadTime": string
  "riskName": string
  "overallRisk": number
  "controlLevel": string
  "riskUnitName": string
  "respUserName": string
  "respDeptName": string
  "inspectUserName": string
  "frequency": string
  "validStartTime": string
  "validEndTime":string
}

// 检查清单 API
export const InspectRespAPI = {
  // 查询检查记录分页
  getInspectPage: async (params: any) => {
    return await request.get({ url: `/prt/inspect/page`, params })
  },
  // 获得政府专项检查清单列表（分页）
  getGovInspectPage: async (params: any) => {
    return await request.get({ url: `/prt/inspect/gov-page`, params })
  },

  // 查询检查记录详情
  getInspect: async (id: number) => {
    return await request.get({ url: `/prt/inspect/get?id=` + id })
  },

  // 新增检查记录
  createInspect: async (data: InspectRespVO) => {
    return await request.post({ url: `/prt/inspect/create`, data })
  },

  // 修改检查记录
  updateInspect: async (data: InspectRespVO) => {
    return await request.put({ url: `/prt/inspect/update`, data })
  },

  // 删除检查记录
  deleteInspect: async (id: number) => {
    return await request.delete({ url: `/prt/inspect/delete?id=` + id })
  },

  // 导出检查记录 Excel
  exportInspect: async (params) => {
    return await request.download({ url: `/prt/inspect/export-excel`, params })
  },
}
