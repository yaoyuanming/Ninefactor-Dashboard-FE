import { Layout } from '@/utils/routerHelper'
import { ScreenLayout } from '@/utils/routerHelper'

const { t } = useI18n()
/**
 * redirect: noredirect        当设置 noredirect 的时候该路由在面包屑导航中不可被点击
 * name:'router-name'          设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
 * meta : {
 hidden: true              当设置 true 的时候该路由不会再侧边栏出现 如404，login等页面(默认 false)

 alwaysShow: true          当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式，
 只有一个时，会将那个子路由当做根路由显示在侧边栏，
 若你想不管路由下面的 children 声明的个数都显示你的根路由，
 你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，
 一直显示根路由(默认 false)

 title: 'title'            设置该路由在侧边栏和面包屑中展示的名字

 icon: 'svg-name'          设置该路由的图标

 noCache: true             如果设置为true，则不会被 <keep-alive> 缓存(默认 false)

 breadcrumb: false         如果设置为false，则不会在breadcrumb面包屑中显示(默认 true)

 affix: true               如果设置为true，则会一直固定在tag项中(默认 false)

 noTagsView: true          如果设置为true，则不会出现在tag中(默认 false)

 activeMenu: '/dashboard'  显示高亮的路由路径

 followAuth: '/dashboard'  跟随哪个路由进行权限过滤

 canTo: true               设置为true即使hidden为true，也依然可以进行路由跳转(默认 false)
 }
 **/
const remainingRouter: AppRouteRecordRaw[] = [
  {
    path: '/redirect',
    component: Layout,
    name: 'Redirect',
    children: [
      {
        path: '/redirect/:path(.*)',
        name: 'Redirect',
        component: () => import('@/views/Redirect/Redirect.vue'),
        meta: {}
      }
    ],
    meta: {
      hidden: true,
      noTagsView: true
    }
  },
  {
    path: '/screen',
    component: ScreenLayout,
    name: 'Screen',
    redirect: '/screen/home',
    meta: {
      hidden: true
    },
    children: [
      {
        path: 'home',
        component: () => import('@/views/screen/index.vue'),
        name: 'ScreenHome',
        meta: {
          title: '',
          icon: 'ep:tickets',
          noCache: true,
          hidden: true,
          activeMenu: '/workbenches/basicEnterprise1'
        }
      },
    ]
  },
  //  {
  //   path: '/enterpriseArchives',
  //   component: Layout,
  //   redirect: '/enterpriseArchives/index',
  //   name: 'EnterpriseArchives',
  //   meta: {
  //     title: "一企一档",
  //     icon: 'ep:home-filled',
  //   },
  //   children: [
  //     {
  //       path: 'index',
  //       component: () => import('@/views/enterpriseArchives/Index.vue'),
  //       name: 'Index',
  //       meta: {
  //         title: '一企一档',
  //         icon: 'ep:home-filled',
  //         noCache: false,
  //         affix: true // 标签页固定
  //       }
  //     }
  //   ]
  // },
  {
    path: '/enterpriseArchives/basic/:id',
    component: Layout,
    name: 'EnterpriseBasicDetailLayout',
    meta: {
      title: '企业信息',
      hidden: true,
      noCache: true,
      canTo: true,
      activeMenu: '/enterprise-archives',
    },
    children: [
      {
        path: '',
        component: () => import('@/views/enterpriseArchives/basicEnterprise/index.vue'),
        name: 'EnterpriseBasicDetail',
        meta: {
          title: '企业信息',
          hideTopMenu: true
        }
      }
    ]
  },
  
  // {
  //   path: '/workbench',
  //   component: Layout,
  //   redirect: '/workbench/home',
  //   name: 'Workbench',
  //   meta: {
  //     title: '工作台',
  //     icon:'fa:dedent',
  //     alwaysShow: true
  //   },
  //   children: [
  //     {
  //       path: 'home',
  //       component: () => import('@/views/workbench/home/index.vue'),
  //       name: 'Home',
  //       meta: {
  //         title: '首页',
  //         icon: 'fa:hdd-o',
  //         noCache: false,
  //         affix: true
  //       }
  //     },
  //     {
  //       path: 'notice',
  //       component: () => import('@/views/workbench/notice/index.vue'),
  //       name: 'Notice',
  //       meta: {
  //         title: '通知公告',
  //         icon: 'fa:hdd-o',
  //         noCache: false,
  //         affix: true
  //       }
  //     },
      
  //   ]
  // },

{
  path: '/workbench/notice/publish',
  component: Layout,
  name: 'NoticePublishLayout',
  meta: {
    title: '发布通告',
    hidden: true,
    noCache: true,
    canTo: true,
    activeMenu: '/workbench/notice',
  },
  children: [
    {
      path: '',
      component: () => import('@/views/workbench/notice/NewNotice.vue'),
      name: 'NoticePublish',
      meta: {
        title: '发布通告',
        hideTopMenu: true
      }
    }
  ]
},
{
  path: '/workbench/notice/info/:id',
  component: Layout,
  name: 'NoticeInfoLayout',
  meta: {
    title: '通告详情',
    hidden: true,
    noCache: true,
    canTo: true,
    activeMenu: '/workbench/notice',
  },
  children: [
    {
      path: '',
      component: () => import('@/views/workbench/notice/NoticeInfo.vue'),
      name: 'NoticeInfo',
      meta: {
        title: '通告详情',
        hideTopMenu: true
      }
    }
  ]
},
{
  path: '/workbench/notice/detail/:id',
  component: Layout,
  name: 'NoticeReadDetailLayout',
  meta: {
    title: '阅读详情',
    hidden: true,
    noCache: true,
    canTo: true,
    activeMenu: '/workbench/notice',
  },
  children: [
    {
      path: '',
      component: () => import('@/views/workbench/notice/NoticeReadDetail.vue'),
      name: 'NoticeReadDetail',
      meta: {
        title: '阅读详情',
        hideTopMenu: true
      }
    }
  ]
},
{
  path: '/supervisoryInspect/taskDeploy/add/:type',
  component: Layout,
  name: 'TaskDeployAddLayout',
  meta: {
    title: '添加专项检查任务',
    hidden: true,
    noCache: true,
    canTo: true,
    activeMenu: '/supervisoryInspect/taskDeploy',
  },
  children: [
    {
      path: '',
      component: () => import('@/views/supervisoryInspect/taskDeploy/add/index.vue'),
      name: 'TaskDeployAdd',
      meta: {
        title: '添加专项检查任务',
        hideTopMenu: true
      }
    }
  ]
},

  // 检查清单添加页面路由
  {
    path: '/supervisoryInspect/checklist/add/:type',
    component: Layout,
    name: 'ChecklistAddLayout',
    meta: {
      title: '添加检查清单',
      hidden: true,
      noCache: true,
      canTo: true,
      activeMenu: '/supervisoryInspect/checklist',
    },
    children: [
      {
        path: '',
        component: () => import('@/views/supervisoryInspect/checklist/add/index.vue'),
        name: 'ChecklistAdd',
        meta: {
          title: '添加检查清单',
          hideTopMenu: true
        }
      }
    ]
  },
  {
    path: '/supervisoryInspect/checklist/edit/:type/:id',
    component: Layout,
    name: 'ChecklistEditLayout',
    meta: {
      title: '编辑检查清单',
      hidden: true,
      noCache: true,
      canTo: true,
      activeMenu: '/supervisoryInspect/checklist',
    },
    children: [
      {
        path: '',
        component: () => import('@/views/supervisoryInspect/checklist/edit/index.vue'),
        name: 'ChecklistEdit',
        meta: {
          title: '编辑检查清单',
          hideTopMenu: true
        }
      }
    ]
  },
  {
    path: '/supervisoryInspect/checklist/detail/:type/:id',
    component: Layout,
    name: 'ChecklistDetailLayout',
    meta: {
      title: '检查清单详情',
      hidden: true,
      noCache: true,
      canTo: true,
      activeMenu: '/supervisoryInspect/checklist',
    },
    children: [
      {
        path: '',
        component: () => import('@/views/supervisoryInspect/checklist/detail/index.vue'),
        name: 'ChecklistDetail',
        meta: {
          title: '检查清单详情',
          hideTopMenu: true
        }
      }
    ]
  },
  {
    path: '/supervisoryInspect/specialInspectionRecord/taskDetail/:id',
    component: Layout,
    name: 'TaskDetailLayout',
    meta: {
      title: '任务详情',
      hidden: true,
      noCache: true,
      canTo: true,
      activeMenu: '/supervisoryInspect/specialInspectionRecord',
    },
    children: [
      {
        path: '',
        component: () => import('@/views/supervisoryInspect/specialInspectionRecord/TaskDetail.vue'),
        name: 'TaskDetail',
        meta: {
          title: '任务详情',
          hideTopMenu: true
        }
      }
    ]
  },
  {
    path: '/supervisoryInspect/specialInspectionRecord/reportDetail/:id',
    component: Layout,
    name: 'ReportDetailLayout',
    meta: {
      title: '报告详情',
      hidden: true,
      noCache: true,
      canTo: true,
      activeMenu: '/supervisoryInspect/specialInspectionRecord',
    },
    children: [
      {
        path: '',
        component: () => import('@/views/supervisoryInspect/specialInspectionRecord/ReportDetail.vue'),
        name: 'ReportDetail',
        meta: {
          title: '报告详情',
          hideTopMenu: true
        }
      }
    ]
  },
  // {
  //   path: '/supervisoryInspect',
  //   component: Layout,
  //   redirect: '/supervisoryInspect/overview',
  //   name: 'SupervisoryInspect',
  //   meta: {
  //     title: '监督检查',
  //     icon:'fa:dedent',
  //     alwaysShow: true
  //   },
  //   children: [
  //     {
  //       path: 'overview',
  //       component: () => import('@/views/supervisoryInspect/overview/index.vue'),
  //       name: 'Overview',
  //       meta: {
  //         title: '概况',
  //         icon: 'fa:hdd-o',
  //         noCache: false,
  //         affix: true
  //       }
  //     },
  //     {
  //       path: 'specialInspectionRecord',
  //       component: () => import('@/views/supervisoryInspect/specialInspectionRecord/index.vue'),
  //       name: 'SpecialInspectionRecord',
  //       meta: {
  //         title: '专项检查记录',
  //         icon: 'fa:hdd-o',
  //         noCache: false,
  //         affix: true
  //       }
  //     },
      
  //   ]
  // },
  
  // {
  //   path: '/',
  //   component: Layout,
  //   redirect: '/workbenches/index',
  //   name: 'Home',
    // meta: {
    //   title: "首页",
    //   icon: 'ep:home-filled',
    // },
  //   children: [
  //     {
  //       path: 'index',
  //       component: () => import('@/views/Home/Index.vue'),
  //       name: 'Index',
  //       meta: {
  //         title: t('router.home'),
  //         icon: 'ep:home-filled',
  //         noCache: false,
  //         affix: true // 标签页固定
  //       }
  //     }
  //   ]
  // },
  // {
  //   path: '/newbpm',
  //   component: Layout,
  //   redirect: '/newbpm/iform',
  //   name: 'Newbpm',
  //   meta: {
  //     title: '流程管理',
  //     icon:'fa:dedent',
  //     alwaysShow: true
  //   },
  //   children: [
  //     {
  //       path: 'iform',
  //       component: () => import('@/views/bpm/form/index.vue'),
  //       name: 'Iform',
  //       meta: {
  //         title: '流程表单',
  //         icon: 'fa:hdd-o',
  //         noCache: false,
  //         affix: true
  //       }
  //     },
  //     {
  //       path: 'edit',
  //       component: () => import('@/views/bpm/form/editor/index.vue'),
  //       name: 'BpmFormEditor',
  //       meta: {
  //         noCache: true,
  //         hidden: true,
  //         canTo: true,
  //         title: '设计流程表单',
  //         activeMenu: '/bpm/manager/form'
  //       }
  //     },
  //     {
  //       path: 'imodel',
  //       component: () => import('@/views/NewLowCode/model/index.vue'),
  //       name: 'Imodel',
  //       meta: {
  //         title: '流程模型',
  //         icon: "fa-solid:project-diagram",
  //         noCache: false,
  //         affix: true
  //       }
  //     },
  //     {
  //       path: 'manager/model/create',
  //       component: () => import('@/views/bpm/model/form/index.vue'),
  //       name: 'BpmModelCreate',
  //       meta: {
  //         noCache: true,
  //         hidden: true,
  //         canTo: true,
  //         title: '创建流程',
  //         activeMenu: '/bpm/manager/model'
  //       }
  //     },
  //     {
  //       path: 'icategory',
  //       component: () => import('@/views/NewLowCode/category/index.vue'),
  //       name: 'Icategory',
  //       meta: {
  //         title: '流程分类',
  //         icon: "fa-solid:project-diagram",
  //         noCache: false,
  //         affix: true
  //       }
  //     },
  //   ]
  // },
  // {
  //   path: '/newreport',
  //   component: Layout,
  //   redirect: '/newreport/ireport',
  //   name: 'Newreport',
  //   meta: {
  //     title: '报表管理',
  //     icon:'fa:dedent',
  //     alwaysShow: true
  //   },
  //   children: [
  //     {
  //       path: 'ireport',
  //       component: () => import('@/views/report/jmreport/index.vue'),
  //       name: 'Ireport',
  //       meta: {
  //         title: '报表设计',
  //         icon: "fa-solid:project-diagram",
  //         noCache: false,
  //         affix: true
  //       }
  //     },
  //   ]
  // },
  {
    path: '/login',
    component: () => import('@/views/Login/Login.vue'),
    name: 'Login',
    meta: {
      hidden: true,
      title: t('router.login'),
      noTagsView: true
    }
  },
  {
    path: '/sso',
    component: () => import('@/views/Login/Login.vue'),
    name: 'SSOLogin',
    meta: {
      hidden: true,
      title: t('router.login'),
      noTagsView: true
    }
  },

  {
    path: '/403',
    component: () => import('@/views/Error/403.vue'),
    name: 'NoAccess',
    meta: {
      hidden: true,
      title: '403',
      noTagsView: true
    }
  },
  {
    path: '/404',
    component: () => import('@/views/Error/404.vue'),
    name: 'NoFound',
    meta: {
      hidden: true,
      title: '404',
      noTagsView: true
    }
  },
  {
    path: '/500',
    component: () => import('@/views/Error/500.vue'),
    name: 'Error',
    meta: {
      hidden: true,
      title: '500',
      noTagsView: true
    }
  },
  {
    path: '/system',
    component: Layout,
    name: 'system',
    meta: {
      hidden: true
    },
    children: [
      {
        path: 'type/data/:dictType',
        component: () => import('@/views/system/dict/data/index.vue'),
        name: 'SystemDictData', // 为路由提供唯一标识
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          title: '字典数据',
          activeMenu: '/system/dict' // 用于高亮菜单
        }
      },{
        path: 'PlatformForm/edit',
        component: () => import('@/views/system/platform/PlatformForm.vue'),
        name: 'PlatformlistEdit', // 为路由提供唯一标识
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          title: '编辑',
          activeMenu: '/system/platform' // 用于高亮菜单
        }
      },
    ]
  },
  {
    path: '/codegen',
    component: Layout,
    name: 'CodegenEdit',
    meta: {
      hidden: true
    },
    children: [
      {
        path: 'edit',
        component: () => import('@/views/infra/codegen/EditTable.vue'),
        name: 'InfraCodegenEditTable',
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          icon: 'ep:edit',
          title: '修改生成配置',
          activeMenu: 'infra/codegen/index'
        }
      }
    ]
  },
  {
    path: '/bpm',
    component: Layout,
    name: 'bpm',
    meta: {
      hidden: true
    },
    children: [
      {
        path: 'manager/form/edit',
        component: () => import('@/views/bpm/form/editor/index.vue'),
        name: 'BpmFormEditor',
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          title: '设计流程表单',
          activeMenu: '/bpm/manager/form'
        }
      },
      {
        path: 'manager/definition',
        component: () => import('@/views/bpm/model/definition/index.vue'),
        name: 'BpmProcessDefinition',
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          title: '流程定义',
          activeMenu: '/bpm/manager/model'
        }
      },
      {
        path: 'process-instance/detail',
        component: () => import('@/views/bpm/processInstance/detail/index.vue'),
        name: 'BpmProcessInstanceDetail',
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          title: '流程详情',
          activeMenu: '/bpm/task/my'
        },
        props: (route) => ({
          id: route.query.id,
          taskId: route.query.taskId,
          activityId: route.query.activityId
        })
      },
      {
        path: 'process-instance/report',
        component: () => import('@/views/bpm/processInstance/report/index.vue'),
        name: 'BpmProcessInstanceReport',
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          title: '数据报表',
          activeMenu: '/bpm/manager/model'
        }
      },
      {
        path: 'oa/leave/create',
        component: () => import('@/views/bpm/oa/leave/create.vue'),
        name: 'OALeaveCreate',
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          title: '发起 OA 请假',
          activeMenu: '/bpm/oa/leave'
        }
      },
      {
        path: 'oa/leave/detail',
        component: () => import('@/views/bpm/oa/leave/detail.vue'),
        name: 'OALeaveDetail',
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          title: '查看 OA 请假',
          activeMenu: '/bpm/oa/leave'
        }
      },
      {
        path: 'manager/model/create',
        component: () => import('@/views/bpm/model/form/index.vue'),
        name: 'BpmModelCreate',
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          title: '创建流程',
          activeMenu: '/bpm/manager/model'
        }
      },
      {
        path: 'manager/model/:type/:id',
        component: () => import('@/views/bpm/model/form/index.vue'),
        name: 'BpmModelUpdate',
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          title: '修改流程',
          activeMenu: '/bpm/manager/model'
        }
      }
    ]
  },
  // {
  //   path: '/mall/product', // 商品中心
  //   component: Layout,
  //   name: 'ProductCenter',
  //   meta: {
  //     hidden: true
  //   },
  //   children: [
  //     {
  //       path: 'spu/add',
  //       component: () => import('@/views/mall/product/spu/form/index.vue'),
  //       name: 'ProductSpuAdd',
  //       meta: {
  //         noCache: false, // 需要缓存
  //         hidden: true,
  //         canTo: true,
  //         icon: 'ep:edit',
  //         title: '商品添加',
  //         activeMenu: '/mall/product/spu'
  //       }
  //     },
  //     {
  //       path: 'spu/edit/:id(\\d+)',
  //       component: () => import('@/views/mall/product/spu/form/index.vue'),
  //       name: 'ProductSpuEdit',
  //       meta: {
  //         noCache: true,
  //         hidden: true,
  //         canTo: true,
  //         icon: 'ep:edit',
  //         title: '商品编辑',
  //         activeMenu: '/mall/product/spu'
  //       }
  //     },
  //     {
  //       path: 'spu/detail/:id(\\d+)',
  //       component: () => import('@/views/mall/product/spu/form/index.vue'),
  //       name: 'ProductSpuDetail',
  //       meta: {
  //         noCache: true,
  //         hidden: true,
  //         canTo: true,
  //         icon: 'ep:view',
  //         title: '商品详情',
  //         activeMenu: '/mall/product/spu'
  //       }
  //     },
  //     {
  //       path: 'property/value/:propertyId(\\d+)',
  //       component: () => import('@/views/mall/product/property/value/index.vue'),
  //       name: 'ProductPropertyValue',
  //       meta: {
  //         noCache: true,
  //         hidden: true,
  //         canTo: true,
  //         icon: 'ep:view',
  //         title: '商品属性值',
  //         activeMenu: '/product/property'
  //       }
  //     }
  //   ]
  // },
  // {
  //   path: '/mall/trade', // 交易中心
  //   component: Layout,
  //   name: 'TradeCenter',
  //   meta: {
  //     hidden: true
  //   },
  //   children: [
  //     {
  //       path: 'order/detail/:id(\\d+)',
  //       component: () => import('@/views/mall/trade/order/detail/index.vue'),
  //       name: 'TradeOrderDetail',
  //       meta: { title: '订单详情', icon: 'ep:view', activeMenu: '/mall/trade/order' }
  //     },
  //     {
  //       path: 'after-sale/detail/:id(\\d+)',
  //       component: () => import('@/views/mall/trade/afterSale/detail/index.vue'),
  //       name: 'TradeAfterSaleDetail',
  //       meta: { title: '退款详情', icon: 'ep:view', activeMenu: '/mall/trade/after-sale' }
  //     }
  //   ]
  // },
  // {
  //   path: '/member',
  //   component: Layout,
  //   name: 'MemberCenter',
  //   meta: { hidden: true },
  //   children: [
  //     {
  //       path: 'user/detail/:id',
  //       name: 'MemberUserDetail',
  //       meta: {
  //         title: '会员详情',
  //         noCache: true,
  //         hidden: true
  //       },
  //       component: () => import('@/views/member/user/detail/index.vue')
  //     }
  //   ]
  // },
  // {
  //   path: '/pay',
  //   component: Layout,
  //   name: 'pay',
  //   meta: { hidden: true },
  //   children: [
  //     {
  //       path: 'cashier',
  //       name: 'PayCashier',
  //       meta: {
  //         title: '收银台',
  //         noCache: true,
  //         hidden: true
  //       },
  //       component: () => import('@/views/pay/cashier/index.vue')
  //     }
  //   ]
  // },
  // {
  //   path: '/diy',
  //   name: 'DiyCenter',
  //   meta: { hidden: true },
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'template/decorate/:id',
  //       name: 'DiyTemplateDecorate',
  //       meta: {
  //         title: '模板装修',
  //         noCache: true,
  //         hidden: true,
  //         activeMenu: '/mall/promotion/diy/template'
  //       },
  //       component: () => import('@/views/mall/promotion/diy/template/decorate.vue')
  //     },
  //     {
  //       path: 'page/decorate/:id',
  //       name: 'DiyPageDecorate',
  //       meta: {
  //         title: '页面装修',
  //         noCache: true,
  //         hidden: true,
  //         activeMenu: '/mall/promotion/diy/page'
  //       },
  //       component: () => import('@/views/mall/promotion/diy/page/decorate.vue')
  //     }
  //   ]
  // },
  // {
  //   path: '/crm',
  //   component: Layout,
  //   name: 'CrmCenter',
  //   meta: { hidden: true },
  //   children: [
  //     {
  //       path: 'clue/detail/:id',
  //       name: 'CrmClueDetail',
  //       meta: {
  //         title: '线索详情',
  //         noCache: true,
  //         hidden: true,
  //         activeMenu: '/crm/clue'
  //       },
  //       component: () => import('@/views/crm/clue/detail/index.vue')
  //     },
  //     {
  //       path: 'customer/detail/:id',
  //       name: 'CrmCustomerDetail',
  //       meta: {
  //         title: '客户详情',
  //         noCache: true,
  //         hidden: true,
  //         activeMenu: '/crm/customer'
  //       },
  //       component: () => import('@/views/crm/customer/detail/index.vue')
  //     },
  //     {
  //       path: 'business/detail/:id',
  //       name: 'CrmBusinessDetail',
  //       meta: {
  //         title: '商机详情',
  //         noCache: true,
  //         hidden: true,
  //         activeMenu: '/crm/business'
  //       },
  //       component: () => import('@/views/crm/business/detail/index.vue')
  //     },
  //     {
  //       path: 'contract/detail/:id',
  //       name: 'CrmContractDetail',
  //       meta: {
  //         title: '合同详情',
  //         noCache: true,
  //         hidden: true,
  //         activeMenu: '/crm/contract'
  //       },
  //       component: () => import('@/views/crm/contract/detail/index.vue')
  //     },
  //     {
  //       path: 'receivable-plan/detail/:id',
  //       name: 'CrmReceivablePlanDetail',
  //       meta: {
  //         title: '回款计划详情',
  //         noCache: true,
  //         hidden: true,
  //         activeMenu: '/crm/receivable-plan'
  //       },
  //       component: () => import('@/views/crm/receivable/plan/detail/index.vue')
  //     },
  //     {
  //       path: 'receivable/detail/:id',
  //       name: 'CrmReceivableDetail',
  //       meta: {
  //         title: '回款详情',
  //         noCache: true,
  //         hidden: true,
  //         activeMenu: '/crm/receivable'
  //       },
  //       component: () => import('@/views/crm/receivable/detail/index.vue')
  //     },
  //     {
  //       path: 'contact/detail/:id',
  //       name: 'CrmContactDetail',
  //       meta: {
  //         title: '联系人详情',
  //         noCache: true,
  //         hidden: true,
  //         activeMenu: '/crm/contact'
  //       },
  //       component: () => import('@/views/crm/contact/detail/index.vue')
  //     },
  //     {
  //       path: 'product/detail/:id',
  //       name: 'CrmProductDetail',
  //       meta: {
  //         title: '产品详情',
  //         noCache: true,
  //         hidden: true,
  //         activeMenu: '/crm/product'
  //       },
  //       component: () => import('@/views/crm/product/detail/index.vue')
  //     }
  //   ]
  // },
  // {
  //   path: '/ai',
  //   component: Layout,
  //   name: 'Ai',
  //   meta: {
  //     hidden: true
  //   },
  //   children: [
  //     {
  //       path: 'image/square',
  //       component: () => import('@/views/ai/image/square/index.vue'),
  //       name: 'AiImageSquare',
  //       meta: {
  //         title: '绘图作品',
  //         icon: 'ep:home-filled',
  //         noCache: false
  //       }
  //     },
  //     {
  //       path: 'knowledge/document',
  //       component: () => import('@/views/ai/knowledge/document/index.vue'),
  //       name: 'AiKnowledgeDocument',
  //       meta: {
  //         title: '知识库文档',
  //         icon: 'ep:document',
  //         noCache: false,
  //         activeMenu: '/ai/knowledge'
  //       }
  //     },
  //     {
  //       path: 'knowledge/document/create',
  //       component: () => import('@/views/ai/knowledge/document/form/index.vue'),
  //       name: 'AiKnowledgeDocumentCreate',
  //       meta: {
  //         title: '创建文档',
  //         icon: 'ep:plus',
  //         noCache: true,
  //         hidden: true,
  //         activeMenu: '/ai/knowledge'
  //       }
  //     },
  //     {
  //       path: 'knowledge/document/update',
  //       component: () => import('@/views/ai/knowledge/document/form/index.vue'),
  //       name: 'AiKnowledgeDocumentUpdate',
  //       meta: {
  //         title: '修改文档',
  //         icon: 'ep:edit',
  //         noCache: true,
  //         hidden: true,
  //         activeMenu: '/ai/knowledge'
  //       }
  //     },
  //     {
  //       path: 'knowledge/retrieval',
  //       component: () => import('@/views/ai/knowledge/knowledge/retrieval/index.vue'),
  //       name: 'AiKnowledgeRetrieval',
  //       meta: {
  //         title: '文档召回测试',
  //         icon: 'ep:search',
  //         noCache: true,
  //         hidden: true,
  //         activeMenu: '/ai/knowledge'
  //       }
  //     },
  //     {
  //       path: 'knowledge/segment',
  //       component: () => import('@/views/ai/knowledge/segment/index.vue'),
  //       name: 'AiKnowledgeSegment',
  //       meta: {
  //         title: '知识库分段',
  //         icon: 'ep:tickets',
  //         noCache: true,
  //         hidden: true,
  //         activeMenu: '/ai/knowledge'
  //       }
  //     }
  //   ]
  // },
  // {
  //   path: '/iot',
  //   component: Layout,
  //   name: 'IOT',
  //   meta: {
  //     hidden: true
  //   },
  //   children: [
  //     {
  //       path: 'product/product/detail/:id',
  //       name: 'IoTProductDetail',
  //       meta: {
  //         title: '产品详情',
  //         noCache: true,
  //         hidden: true,
  //         activeMenu: '/iot/device/product'
  //       },
  //       component: () => import('@/views/iot/product/product/detail/index.vue')
  //     },
  //     {
  //       path: 'device/detail/:id',
  //       name: 'IoTDeviceDetail',
  //       meta: {
  //         title: '设备详情',
  //         noCache: true,
  //         hidden: true,
  //         activeMenu: '/iot/device/device'
  //       },
  //       component: () => import('@/views/iot/device/device/detail/index.vue')
  //     },
  //     {
  //       path: 'plugin/detail/:id',
  //       name: 'IoTPluginDetail',
  //       meta: {
  //         title: '插件详情',
  //         noCache: true,
  //         hidden: true,
  //         activeMenu: '/iot/plugin'
  //       },
  //       component: () => import('@/views/iot/plugin/detail/index.vue')
  //     }
  //   ]
  // },
  {
    path: '/prt',
    component: Layout,
    name: 'Prt',
    meta: {
      hidden: true
    },
    children: [
      {
        path: 'prt/riskControl/edit',
        component: () => import('@/views/prt/riskunit/edit.vue'),
        name: 'riskUnitEdit',
        meta: {
          title: '风险单元编辑',
          icon: 'ep:tickets',
          noCache: true,
          hidden: true,
          activeMenu: '/prt/riskControl'
        }
      },
      {
        path: 'prt/risklist/details',
        component: () => import('@/views/prt/risk/details.vue'),
        name: 'risklistDetails',
        meta: {
          title: '风险点管理',
          icon: 'ep:tickets',
          noCache: true,
          hidden: true,
          activeMenu: '/prt/risklist'
        }
      },
      {
        path: 'prt/risklist/edit',
        component: () => import('@/views/prt/risk/edit.vue'),
        name: 'risklistEdit',
        meta: {
          title: '风险点编辑',
          icon: 'ep:tickets',
          noCache: true,
          hidden: true,
          activeMenu: '/prt/risklist'
        }
      },
      {
        path: 'prt/inspectrecord/hazardInvestigation/edit',
        component: () => import('@/views/prt/hazardInvestigation/edit.vue'),
        name: 'hazardInvestigationEdit',
        meta: {
          title: '录入隐患',
          icon: 'ep:tickets',
          noCache: true,
          hidden: true,
          activeMenu: '/prt/hazardInvestigationEdit'
        }
      },
      {
        path: 'prt/inspectrecord/details',
        component: () => import('@/views/prt/inspectrecord/details.vue'),
        name: 'inspectrecordDetails',
        meta: {
          title: '检查记录详情',
          icon: 'ep:tickets',
          noCache: true,
          hidden: true,
          activeMenu: '/prt/inspectrecord'
        }
      }
      ,
      {
        path: 'prt/enterprise/RC/details',
        component: () => import('@/views/prt/enterprise/detailsRC.vue'),
        name: 'inspectRecordDetailsRC',
        meta: {
          title: '企业日常检查单详情',
          icon: 'ep:tickets',
          noCache: true,
          hidden: true,
          activeMenu: '/prt/inspectrecordRC'
        }
      },
      {
        path: 'prt/enterprise/ZX/details',
        component: () => import('@/views/prt/enterprise/detailsZX.vue'),
        name: 'inspectRecordDetailsZX',
        meta: {
          title: '企业专项检查单详情',
          icon: 'ep:tickets',
          noCache: true,
          hidden: true,
          activeMenu: '/prt/inspectrecordZX'
        }
      },
      {
        path: 'prt/hazardInvestigation/GZ/details',
        component: () => import('@/views/prt/hazardInvestigation/detailsGZ.vue'),
        name: 'inspectRecordDetailsGZ',
        meta: {
          title: '隐患排除详情',
          icon: 'ep:tickets',
          noCache: true,
          hidden: true,
          activeMenu: '/prt/inspectrecordGZ'
        }
      },
      {
        path: 'prt/government/ZF/details',
        component: () => import('@/views/prt/government/detailsZF.vue'),
        name: 'governmentDetailsZF',
        meta: {
          title: '政府专项检查清单详情',
          icon: 'ep:tickets',
          noCache: true,
          hidden: true,
          activeMenu: '/prt/governmentZF'
        }
      },
      {
        path: 'prt/enterprise/edit',
        component: () => import('@/views/prt/enterprise/edit.vue'),
        name: 'EnterpriseEdit',
        meta: {
          title: '新增企业项目检查清单',
          icon: 'ep:tickets',
          noCache: true,
          hidden: true,
          activeMenu: '/prt/enterpriseEdit'
        }
      }
    ]
  },
  {
    path: '/jump',
    component: Layout,
    name: 'jump',
    meta: {
      hidden: true
    },
    children: [
      {
        path: 'jump/index',
        component: () => import('@/views/jump/index.vue'),
        name: 'jumpComponentsIndex',
        meta: {
          title: '',
          icon: 'ep:tickets',
          noCache: true,
          hidden: true,
          activeMenu: '/workbenches/basicEnterprise1'
        }
      },
    ]
  },
  {
    path: '/workbenches',
    component: Layout,
    name: 'Workbenches',
    meta: {
      hidden: true
    },
    children: [
      {
        path: 'workbenches/topBarPage/matterComponents/index',
        component: () => import('@/views/workbenches/topBarPage/matterComponents/hiddenDangerShorthandEdit.vue'),
        name: 'matterComponentsIndex',
        meta: {
          title: '隐患速记',
          icon: 'ep:tickets',
          noCache: true,
          hidden: true,
          activeMenu: '/workbenches/basicEnterprise1'
        }
      },
      {
        path: 'workbenches/topBarPage/matterComponents/rectificationInput',
        component: () => import('@/views/workbenches/topBarPage/matterComponents/rectificationInput.vue'),
        name: 'rectificationInputPage',
        meta: {
          title: '整改完成录入',
          icon: 'ep:tickets',
          noCache: true,
          hidden: true,
          activeMenu: '/workbenches/basicEnterprise1'
        }
      },
      {
        path: 'workbenches/basicEnterprise/edit',
        component: () => import('@/views/workbenches/basicEnterprise/edit.vue'),
        name: 'basicEnterpriseEdit',
        meta: {
          title: '编辑企业基本信息',
          icon: 'ep:tickets',
          noCache: true,
          hidden: true,
          activeMenu: '/workbenches/basicEnterprise'
        }
      },
      // 企业端
      {
        path: 'manager/modelTenant/create',
        component: () => import('@/views/bpm/modelTenant/form/index.vue'),
        name: 'BpmModelTenantCreate',
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          title: '创建流程',
          activeMenu: '/bpm/manager/BpmModelTenant'
        }
      },
      {
        path: 'manager/modelTenant/definition',
        component: () => import('@/views/bpm/modelTenant/definition/index.vue'),
        name: 'BpmModelTenantDefinition',
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          title: '流程定义',
          activeMenu: '/bpm/manager/BpmModelTenant'
        }
      },
      {
        path: 'manager/modelTenant/:type/:id',
        component: () => import('@/views/bpm/modelTenant/form/index.vue'),
        name: 'BpmModelTenantUpdate',
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          title: '修改流程',
          activeMenu: '/bpm/manager/BpmModelTenant'
        }
      },
      {
        path: 'process-instance/report',
        component: () => import('@/views/bpm/processInstance/report/index.vue'),
        name: 'BpmModelTenantInstanceReport',
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          title: '数据报表',
          activeMenu: '/bpm/manager/BpmModelTenant'
        }
      },
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/Error/404.vue'),
    name: '',
    meta: {
      title: '404',
      hidden: true,
      breadcrumb: false
    }
  }
]

export default remainingRouter
