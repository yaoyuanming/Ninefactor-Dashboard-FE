  <template>
  <div class="screen-container">
    <div class="container-base">
      <div class="graph-canvas">
        <Map />
      </div>
    </div>
    <div id="max-screen-content" class="screen-modal">
      <div class="content-top">
        <img class="top-image" src="@/assets/imgs/screen/top-header.png" />
        <div class="top-text">石狮市安全管理平台</div>
      </div>
      <div class="content-left">
        <div class="time-modal">
          <div class="time">{{ utcTime }}</div>
          <div class="day">{{ utcDate }}</div>
        </div>
        <div class="content-left-main">
          <Info @clickAction="(type) => openModal('company', type)" />
          <Info2 @click="openModal('level')" />
        </div>
      </div>
      <div class="content-right">
        <div class="work-weather">
          <iframe
            width="200"
            scrolling="no"
            height="20"
            frameborder="0"
            allowtransparency="true"
            src="https://i.tianqi.com?c=code&id=53&color=%23ffffff&icon=1&site=12&lang=cn"
          ></iframe>
        </div>
        <el-button class="work-home" @click="openModal('home')">
          <img class="img" src="@/assets/imgs/screen/work-home.png" />
        </el-button>
        <div class="content-right-main">
          <Info3 />
          <!-- <Info4 @click="openModal('check')" /> -->
        </div>
      </div>
      <div class="content-bottom"> </div>
    </div>
    <div :class="['level', 'check', 'company'].includes(modalItem) ? 'modal-mask' : ''">
      <div v-if="['level'].includes(modalItem)" id="max-screen-modal" class="modal-screen">
        <div class="content-modal">
          <div class="modal-div-title">
            <img class="img" src="../../assets/imgs/screen/modal-dot.png" />
            <div class="content">风险分级管控情况</div>
            <div class="close" @click="openModal('')">✖</div>
          </div>
          <div class="modal-div">
            <div class="modal-div-content">
              <RiskControlDetail />
            </div>
          </div>
        </div>
      </div>
      <div v-if="['check'].includes(modalItem)" id="max-screen-modal" class="modal-screen">
        <div class="content-modal">
          <div class="modal-div-title">
            <img class="img" src="../../assets/imgs/screen/modal-dot.png" />
            <div class="content">企业风险巡查情况</div>
            <div class="close" @click="openModal('')">✖</div>
          </div>
          <div class="modal-div">
            <div class="modal-div-content">
              <RiskControlInPlaceRate />
            </div>
          </div>
        </div>
      </div>
      <div v-if="['company'].includes(modalItem)" id="max-screen-modal" class="modal-screen">
        <div class="content-modal">
          <div class="modal-div-title">
            <img class="img" src="../../assets/imgs/screen/modal-dot.png" />
            <div class="content">企业统计概况</div>
            <div class="close" @click="openModal('')">✖</div>
          </div>
          <div class="modal-div">
            <div class="modal-div-content">
              <CompanyList :enterpriseScale="enterpriseScale" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Info from './Info.vue'
import Info2 from './Info2.vue'
import Info3 from './Info3.vue'
import Info4 from './Info4.vue'
import Map from './Map.vue'
import { useAppStore } from '@/store/modules/app'
import dayjs from 'dayjs'
import { usePermissionStore } from '@/store/modules/permission'
import RiskControlDetail from '../standardized/risk/components/RiskControlDetail.vue'
import RiskControlInPlaceRate from '../standardized/risk/components/RiskControlInPlaceRate.vue'
import CompanyList from '../enterpriseArchives/Index.vue'

const { push } = useRouter()
const appStore = useAppStore()
const permissionStore = usePermissionStore()

const timeRef = ref()
const modalItem = ref('')
const enterpriseScale = ref('')
const title = computed(() => appStore.getBackTheme.title)
const utcDate = ref(dayjs().format('YYYY-MM-DD'))
const utcTime = ref(dayjs().format('HH:mm:ss'))
const topMenus = computed(() => {
  return permissionStore.getRouters.filter((route) => {
    // 过滤掉隐藏的路由
    if (route.meta?.hidden) {
      return false
    }
    // 情况1：如果是一级真实菜单页面（没有children）
    if (!route.children) {
      return true
    }
    // 情况2：如果是一级菜单且有子菜单
    if (route.children && route.children.length > 0) {
      return true
    }
    return false
  })
})
const openModal = (type, data = '') => {
  if (type === 'home') {
    const selectedRoute = topMenus.value.find((item) => item.path === '/workbench')
    permissionStore.setLeftMenuTabRouterIs('/workbench')
    permissionStore.setLeftMenuTabRouters(selectedRoute.children)
    push({
      path: '/workbench/home'
    })
  }
  if (type === 'company') {
    enterpriseScale.value = data
  }
  modalItem.value = type
}

function adjustScale(type = '') {
  const designWidth = 1920
  const designHeight = 1080
  const scaleX = window.innerWidth / designWidth
  const scaleY = window.innerHeight / designHeight
  const scaleMax = Math.max(scaleX, scaleY)
  const scaleMin = Math.min(scaleX, scaleY)
  const screenContent = document.getElementById('max-screen-content')
  if (scaleMax >= 1) {
    screenContent.style.transform = `scale(${scaleMax})`
  } else {
    screenContent.style.transform = `scale(1)`
  }
}

onMounted(async () => {
  adjustScale()
  window.addEventListener('resize', adjustScale)
  timeRef.value = setInterval(() => {
    utcDate.value = dayjs().format('YYYY-MM-DD')
    utcTime.value = dayjs().format('HH:mm:ss')
  }, 1000)
})
onBeforeUnmount(() => {
  clearInterval(timeRef.value)
})
</script>

<style scoped lang="scss">
.screen-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none; /* Safari */
}

.container-base {
  position: relative;
  display: flex;
  width: 100%;
  height: 100vh;
  min-width: 1920px;
  min-height: 920px;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}

.screen-modal {
  position: absolute;
  top: 0;
  left: 0;
  width: 1920px;
  height: 100%;
  // background: radial-gradient(
  //   50% 50% at 50% 50%,
  //   rgba(36, 63, 96, 0) 60%,
  //   rgba(36, 63, 96, 0.31) 99%
  // );

  pointer-events: none;
  transform-origin: 0 0;
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 60;
  width: 100%;
  height: 100vh;
  background: rgb(0 0 0 / 60%);
}

.graph-canvas {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
}

.content-top {
  position: absolute;
  top: 0px;
  width: 100%;
  height: 300px;
  // background: linear-gradient(0deg, rgba(26, 46, 62, 0) 0%, #1a2e3e 100%);

  .top-image {
    z-index: 100;
    position: absolute;
    top: 0px;
    left: 0px;
    width: 1920px;
  }

  .top-text {
    z-index: 110;
    position: absolute;
    top: 12px;
    font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei',
      '微软雅黑', Arial, sans-serif;
    font-variation-settings: "opsz" auto;
    text-align: center;
    width: 1920px;
    font-size: 32px;
    font-weight: bold;
    line-height: normal;
    text-align: center;
    letter-spacing: 0em;
    color: #ffffff;
    text-shadow: 0px 3.29px 47.64px rgba(0, 0, 0, 0.59);
  }
}

.content-left {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 700px;
  height: 100%;
  min-width: 440px;
  z-index: 20;
  // background: linear-gradient(270deg, rgba(26, 46, 62, 0) 0%, #1a2e3e 100%);

  .time-modal {
    position: absolute;
    left: 20px;
    top: 20px;
    pointer-events: fill;
    .time {
      font-size: 20px;
      letter-spacing: 0.01em;
      font-weight: bold;
      color: #ffffff;
      display: inline-block;
      text-shadow: 0.77px 0.77px 0px rgba(0, 0, 0, 0.21);
      line-height: 32px;
    }
    .day {
      font-size: 14px;
      letter-spacing: 0em;
      color: #93bbff;
      display: inline-block;
      text-shadow: 0.77px 0.77px 0px rgba(0, 0, 0, 0.21);
      padding-left: 12px;
      line-height: 32px;
    }
  }

  .content-left-main {
    margin-top: 80px;
    padding-left: 20px;
  }
}

.content-right {
  position: absolute;
  top: 0px;
  right: 0px;
  width: 700px;
  height: 100%;
  // background: linear-gradient(90deg, rgba(26, 46, 62, 0) 0%, #1a2e3e 100%);
  min-width: 440px;
  z-index: 20;
  display: flex;
  justify-content: flex-end;
  .work-weather {
    position: absolute;
    z-index: 200;
    right: 85px;
    top: 35px;
  }
  .work-home {
    pointer-events: fill;
    position: absolute;
    width: 130px;
    height: 40px;
    background: #00000000;
    border: none;
    z-index: 200;
    right: 12px;
    top: 20px;
    // overflow: hidden;
    .img {
      width: 160px;
      // height: 100px;
    }
  }
  .content-right-main {
    margin-top: 80px;
    padding-right: 20px;
  }
}

.content-bottom {
  position: absolute;
  bottom: 0px;
  display: flex;
  width: 100%;
  height: 300px;
  justify-content: center;
  // background: linear-gradient(180deg, rgba(26, 46, 62, 0) 0%, #1a2e3e 100%);

  .bottom-button {
    position: relative;
    z-index: 140;
    width: 180px;
    height: 50px;
    background-color: #0000;
    border: none;

    img {
      position: absolute;
      top: -5px;
      left: 0;
      width: 180px;
      height: 50px;
    }
  }
}

.modal-screen {
  position: absolute;
  width: 100%;
  height: 70%;
  bottom: 0;
  z-index: 120;
  background-image: url(../../assets/imgs/screen/modal-bg.png);
  .content-modal {
    position: relative;
    display: flex;
    pointer-events: painted;
    // background: rgb(0 0 0 / 60%);
    justify-content: center;
    align-items: center;
    padding-top: 80px;
    height: 100%;

    .modal-div-title {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 80px;
      background: #fff;
      // background-image: url(../../assets/imgs/screen/modal-title.png);
      border-bottom: 1px solid #eee;
      .img {
        width: 20px;
        height: 20px;
        position: absolute;
        left: 20px;
        top: 30px;
      }
      .content {
        font-size: 30px;
        position: absolute;
        left: 60px;
        font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
          'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
        line-height: 80px;
        font-weight: bold;
      }
      .close {
        position: absolute;
        top: 10px;
        right: 20px;
        z-index: 200;
        font-size: 30px;
        cursor: pointer;
      }
    }

    .modal-div {
      position: relative;
      width: 100%;
      padding: 20px;
      background-color: #ffffff;
      height: 100%;

      .modal-div-content {
        width: 100%;
        height: 100%;
        overflow-y: auto;
      }
    }
  }
}
</style>