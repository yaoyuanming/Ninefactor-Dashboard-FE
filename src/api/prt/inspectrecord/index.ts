import request from '@/config/axios'

// 检查记录 VO
export interface InspectRecordVO {
  id: number // 检查记录ID
  deptId: number // 部门ID（企业ID）
  inspectRecordCode: string // 检查记录编号（检查记录信息）
  inspectStatus: number // 检查状态*（1：待检查 5：已检查 15：已作废）（检查记录信息）
  inspectResult: number // 检查结果*（1：正常 10：异常 15：逾期未检 ）（检查记录信息）
  validStartTime: Date // 本次有效检查开始时间（检查记录信息）
  validEndTime: Date // 本次有效检查结束时间（检查记录信息）
  inspectTaskId: number // 检查任务ID（检查任务表冗余字段）
  inspectType: number // 检查类型*（5：按人员检查 10：按岗位检查）（检查任务表冗余字段）
  inspectUsers: string // 检查人员ID/岗位ID（多条采用英文逗号隔开）（检查任务表冗余字段）
  submitType: number // 检查任务提交方式*（1：全部人员提交 5：仅需其中一人提交）（检查任务表冗余字段）
  inspectFrqType: number // 检查频次*（1：一次性 2：循环检查）（检查任务表冗余字段）
  cycleFrqType: number // 循环频次单位*（2：按小时 3：按天 6：按月 9：按年）（检查任务表冗余字段）
  cycleFrqNumber: number // 循环频次（说明：一、'循环频次单位'为'按小时'，则逾期需根据前一次检查时间进行时间间隔判断（如前一次检查时间为07:01，则本次检查逾期时间为08:01）；二、'循环频次单位'非'按小时'，则逾期根据对应时间结束点判断（如'1天/1次'，则每次检查逾期时间为每日0点））（检查任务表冗余字段）
  cycleFrqTimeType: number // 检查任务时间分配类型*（1：自定义 2：工作日/节假日）
  cycleFrqTimes: string // 检查任务时间分配*（1：周一...8：工作日 9：周末及节假日）（英文逗号隔开）
  inspectId: number // 检查单ID（检查单表冗余字段）
  inspectName: string // 检查单名称（检查单表冗余字段）
  inspectCode: string // 检查单编号（检查单表冗余字段）
  inspectListCat: number // 检查单类别*（1：企业日常检查单 5：企业专项检查单 8：政府专项检查单）（检查单表冗余字段）
  inspectItemType: number // 检查内容*（1：按项目 2：按风险点）（检查单表冗余字段）
  inspectTarget: string // 检查目标（检查单表冗余字段）
  govInspectListType: number // 政府专项检查单类型*（1：行业领域 2：专项检查 3：重大隐患 4：主体责任）（检查单表冗余字段）
  govAgencyName: string // 上传部门名称（行政部门）（'政府专项检查单'时才有值）（检查单表冗余字段）
  govAgencyCode: string // 上传部门编号（'政府专项检查单'时才有值）（检查单表冗余字段）
  validType: number // 检查单有效周期*（1：长期 5：自定义日期）（检查单表冗余字段）
  startTime: Date // 检查单有效开始时间（检查单表冗余字段）
  endTime: Date // 检查单有效结束时间（检查单表冗余字段）
  riskId: number // 风险点ID（风险点表冗余字段）
  riskName: string // 风险点名称（风险点表冗余字段）
  inherentRisk: number // 固有风险*（风险点表冗余字段）
  existingRisk: number // 现实风险*（风险点表冗余字段）
  riskType: number // 风险点类型*（风险点表冗余字段）（5：场所 10：设备设施 15：常规作业 20：特殊作业 25：管理）（风险点表冗余字段）
  controlLevel: number // 管控层级*（2：单位 3：部门 4：岗位）（风险点表冗余字段）
  respDeptId: number // 责任部门id（风险点表冗余字段）
  respDeptName: string // 责任部门名称（风险点表冗余字段）
  riskUnitId: number // 风险单元id（风险单元表冗余字段）
  riskUnitName: string // 风险单元名称（风险单元表冗余字段）
  respUserId: number // 管控负责人id（风险点表冗余字段）
  respUserName: string // 管控负责人姓名（风险点表冗余字段）
  supervisorUser: string // 监管人员ID组（多条采用英文逗号隔开）（风险点表冗余字段）
  supervisorUserName: string // 监管人员姓名（多条采用英文逗号隔开）（风险点表冗余字段）
  inspectorUser: string // 验收人员ID组（多条采用英文逗号隔开）（风险点表冗余字段）
  inspectorUserName: string // 验收人员姓名（多条采用英文逗号隔开）（风险点表冗余字段）
  inspectUserIds: string // 检查人员ID组（多条采用英文逗号隔开）（检查权限人员）
  inspectUserId: string // 检查人员ID（检查记录信息）（提交检查结果人员）
  inspectUserName: string // 检查人员姓名（检查记录信息）
  inspectTime: Date // 检查时间（即检查上报时间）（检查记录信息）
  supportInfoUrl: string // 佐证材料url
  supportInfoUrlName: string // 佐证材料url名称
}

// 检查记录 API
export const InspectRecordApi = {
  // 查询检查记录分页
  getInspectRecordPage: async (params: any) => {
    return await request.get({ url: `/prt/inspect-record/page`, params })
  },

  // 查询检查记录详情
  getInspectRecord: async (id: number) => {
    return await request.get({ url: `/prt/inspect-record/get?id=` + id })
  },

  // 新增检查记录
  createInspectRecord: async (data: InspectRecordVO) => {
    return await request.post({ url: `/prt/inspect-record/create`, data })
  },

  // 修改检查记录
  updateInspectRecord: async (data: InspectRecordVO) => {
    return await request.put({ url: `/prt/inspect-record/update`, data })
  },

  // 删除检查记录
  deleteInspectRecord: async (id: number) => {
    return await request.delete({ url: `/prt/inspect-record/delete?id=` + id })
  },

  // 导出检查记录 Excel
  exportInspectRecord: async (params) => {
    return await request.download({ url: `/prt/inspect-record/export-excel`, params })
  },
}
