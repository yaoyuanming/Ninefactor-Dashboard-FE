import {hexToRGB} from "@/utils/color";

export type ThemeTypes = {
  elColorPrimary?: string
  leftMenuBorderColor?: string
  leftMenuBgColor?: string
  leftMenuBgLightColor?: string
  leftMenuBgActiveColor?: string
  leftMenuCollapseBgActiveColor?: string
  leftMenuTextColor?: string
  leftMenuTextActiveColor?: string
  logoTitleTextColor?: string
  logoBorderColor?: string
  topHeaderBgColor?: string
  topHeaderTextColor?: string
  topHeaderSubTextColor?: string
  topHeaderHoverColor?: string
  topToolBorderColor?: string
  topMenuBgColor?: string // 头部菜单背景颜色
  topMenuBgActiveColor?: string // 头部菜单选中背景颜色
  topMenuTextColor?: string // 头部菜单字体颜色
  topMenuTextActiveColor?: string // 头部菜单选中字体颜色
  screenFull?: boolean // 是否显示全屏按钮
  tagsView?: boolean // 是否显示标签页
  tagsViewIcon?: boolean // 是否显示标签页图标
  logoChange?: boolean // 是否显示logo
  fixedHeader?: boolean // 是否固定头部
  footer?: boolean // 是否显示页脚
  greyMode?: boolean // 是否灰色模式
  fixedMenu?: boolean // 是否固定菜单
  water?: string // 水印
}
