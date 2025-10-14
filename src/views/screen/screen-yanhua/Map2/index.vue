<template>
  <div
    v-loading="loading"
    class="screen-map"
    style="position: relative; width: 100%; height: 100%"
  >
    <div class="search-box"> </div>
    <div
      id="mapElement2"
      style="position: relative; width: 100%; height: 100%"
    ></div>
  </div>
</template>

<script lang="ts" setup>
  import mapLoader from '@/utils/aMap.js';
  import { ref, onMounted, onUnmounted, nextTick } from 'vue';
  import {
    emergencyIcons,
    targetArea,
    centerPoint,
    targetAreaLevel,
    mapZoom,
    mapZooms,
  } from './config';

  const map = ref<any>(null);
  const aMap = ref<any>(null);
  // 新增遮罩相关变量
  const maskPolygon = ref<any>(null);

  const boundaries = ref<any>(null);
  const allBoundaries = ref<any>(null);
  const labelMarkerLayer = ref<any>(null); // LabelMarker图层
  const loading = ref(true);

  // 全局单例InfoWindow实例
  const globalInfoWindow = ref<any>({
    instance: null,
    currentMarker: null,
  });

  // 创建遮罩层（使用 DistrictSearch 边界）
  const createMaskLayer = () => {
    // 清除旧遮罩
    if (maskPolygon.value && map.value) {
      map.value.remove(maskPolygon.value);
    }

    // 使用高德坐标范围
    const outer = [
      new aMap.value.LngLat(70, 55, true), // 西北
      new aMap.value.LngLat(70, 15, true), // 西南
      new aMap.value.LngLat(140, 15, true), // 东南
      new aMap.value.LngLat(140, 55, true), // 东北
    ];
    const pathArray = [outer, ...boundaries.value];
    maskPolygon.value = new aMap.value.Polygon({
      path: pathArray,
      fillColor: '#192F44',
      fillOpacity: 0.8,
      strokeWeight: 0,
      zIndex: 1,
      bubble: true,
      clickable: false,
    });
    map.value.add(maskPolygon.value);
  };

  // 绘制区域内遮罩
  const areaBoundaries = (
    boundariesArray = boundaries.value,
    fillOpacity = 0.45
  ) => {
    // 主体
    boundariesArray?.forEach((boundaryItem) => {
      return new aMap.value.Polygon({
        path: boundaryItem,
        strokeColor: '#9BCCFF',
        strokeWeight: 3,
        strokeStyle: 'solid',
        fillColor: '#1796FA',
        fillOpacity,
        strokeOpacity: 0.66,
        map: map.value,
        zIndex: 3,
      });
    });
  };

  // 显示应急资源信息窗口
  const showEmergencyInfo = (data: any, marker: any) => {
    // 关闭之前的信息窗口
    if (globalInfoWindow.value.instance) {
      globalInfoWindow.value.instance.close();
    }

    let content = `
      <div style="padding: 10px; min-width: 200px;">
        <h3 style="margin: 0 0 10px 0; color: #333;">${data.name}</h3>
    `;

    switch (data.type) {
      case 'rescue':
        content += `
          <p style="margin: 5px 0;"><strong>人员：</strong>${data.personnel}人</p>
          <p style="margin: 5px 0;"><strong>车辆：</strong>${data.vehicles}辆</p>
        `;
        break;
      case 'medical':
        content += `
          <p style="margin: 5px 0;"><strong>床位：</strong>${data.beds}张</p>
          <p style="margin: 5px 0;"><strong>急诊：</strong>${
            data.emergency ? '是' : '否'
          }</p>
        `;
        break;
      case 'supplies':
        content += `
          <p style="margin: 5px 0;"><strong>类别：</strong>${data.category}</p>
          <p style="margin: 5px 0;"><strong>容量：</strong>${data.capacity}</p>
        `;
        break;
      case 'equipment':
        content += `
          <p style="margin: 5px 0;"><strong>装备：</strong>${data.equipment}</p>
          <p style="margin: 5px 0;"><strong>数量：</strong>${data.quantity}</p>
        `;
        break;
      case 'govt':
        content += `
          <p style="margin: 5px 0;"><strong>级别：</strong>${data.level}</p>
          <p style="margin: 5px 0;"><strong>联系：</strong>${data.contact}</p>
        `;
        break;
      default:
        content += `<p style="margin: 5px 0;">暂无详细信息</p>`;
        break;
    }

    content += '</div>';

    globalInfoWindow.value.instance = new aMap.value.InfoWindow({
      content,
      offset: new aMap.value.Pixel(0, -30),
      closeWhenClickMap: true,
    });

    globalInfoWindow.value.instance.open(map.value, data.position);
    globalInfoWindow.value.currentMarker = marker;
  };

  // 初始化应急资源标记点
  const initEmergencyMarkers = () => {
    if (!labelMarkerLayer.value) {
      labelMarkerLayer.value = new aMap.value.LabelsLayer({
        collision: false,
        allowCollision: false,
        zIndex: 10,
      });
      map.value.add(labelMarkerLayer.value);
    }

    // 清除旧的标记
    labelMarkerLayer.value.clear();

    // 模拟应急资源数据
    const mockEmergencyData = [
      // 救援力量
      {
        type: 'rescue',
        name: '福州市消防救援支队',
        position: [119.356, 26.061],
        personnel: 120,
        vehicles: 15,
      },
      {
        type: 'rescue',
        name: '鼓楼区应急救援队',
        position: [119.303, 26.082],
        personnel: 50,
        vehicles: 8,
      },
      // 医疗机构
      {
        type: 'medical',
        name: '福建省立医院',
        position: [119.291, 26.099],
        beds: 2000,
        emergency: true,
      },
      {
        type: 'medical',
        name: '福州市第一医院',
        position: [119.321, 26.047],
        beds: 1500,
        emergency: true,
      },
      // 应急物资
      {
        type: 'supplies',
        name: '福州市应急物资储备库',
        position: [119.377, 26.041],
        category: '综合物资',
        capacity: '5000吨',
      },
      {
        type: 'supplies',
        name: '仓山区应急物资仓库',
        position: [119.273, 26.038],
        category: '医疗物资',
        capacity: '1000吨',
      },
      // 应急装备
      {
        type: 'equipment',
        name: '福州市应急装备中心',
        position: [119.415, 26.074],
        equipment: '重型机械',
        quantity: 50,
      },
      {
        type: 'equipment',
        name: '台江区装备储备点',
        position: [119.309, 26.058],
        equipment: '通信设备',
        quantity: 200,
      },
      // 政府机构
      {
        type: 'govt',
        name: '福州市应急管理局',
        position: [119.302, 26.074],
        level: '市级',
        contact: '0591-12345',
      },
      {
        type: 'govt',
        name: '晋安区应急管理局',
        position: [119.324, 26.082],
        level: '区级',
        contact: '0591-67890',
      },
    ];

    // 创建标记点
    mockEmergencyData.forEach((item) => {
      const icon = emergencyIcons[item.type];
      if (!icon) return;

      const labelMarker = new aMap.value.LabelMarker({
        position: item.position,
        zIndex: 10,
        icon: {
          type: 'image',
          image: icon.url,
          size: icon.size,
          anchor: icon.anchor,
        },
        text: {
          content: item.name,
          direction: 'bottom',
          offset: [0, 5],
          style: {
            fontSize: 12,
            fontWeight: 'normal',
            fillColor: '#ffffff',
            strokeColor: '#004c99',
            strokeWidth: 2,
          },
        },
      });

      // 添加点击事件
      labelMarker.on('click', () => {
        showEmergencyInfo(item, labelMarker);
      });

      labelMarkerLayer.value.add(labelMarker);
    });
  };

  // 初始化地图
  const initMap = async () => {
    loading.value = true;
    try {
      const AMap = await mapLoader();
      aMap.value = AMap;

      // 使用不同的容器ID避免冲突
      map.value = new AMap.Map('mapElement2', {
        zoom: mapZoom,
        zooms: mapZooms,
        center: centerPoint,
        mapStyle: 'amap://styles/darkblue',
        viewMode: '2D',
        features: ['bg', 'road'],
        showLabel: false,
      });

      // 获取行政区域边界
      const district = new AMap.DistrictSearch({
        subdistrict: 0,
        extensions: 'all',
        level: targetAreaLevel,
      });

      district.search(targetArea, (status: any, result: any) => {
        if (status === 'complete') {
          const bounds = result.districtList[0].boundaries;
          boundaries.value = bounds;
          allBoundaries.value = bounds;

          // 创建遮罩层
          createMaskLayer();

          // 绘制区域边界
          areaBoundaries();

          // 初始化应急资源标记
          initEmergencyMarkers();

          loading.value = false;
        }
      });
    } catch (error) {
      console.error('Map2 initialization failed:', error);
      loading.value = false;
    }
  };

  onMounted(() => {
    nextTick(() => {
      initMap();
    });
  });

  onUnmounted(() => {
    if (globalInfoWindow.value.instance) {
      globalInfoWindow.value.instance.close();
    }
    if (map.value) {
      map.value.destroy();
    }
  });

  // 暴露方法供外部调用
  defineExpose({
    refreshMarkers: initEmergencyMarkers,
  });
</script>

<style scoped lang="less">
  .screen-map {
    position: relative;
    width: 100%;
    height: 100%;

    .search-box {
      position: absolute;
      top: 20px;
      left: 20px;
      z-index: 100;
    }
  }

  :deep(.amap-info-window) {
    background: rgb(255 255 255 / 95%);
    border-radius: 4px;
    box-shadow: 0 2px 6px rgb(0 0 0 / 30%);
  }

  :deep(.amap-info-window-content) {
    padding: 0;
  }
</style>
