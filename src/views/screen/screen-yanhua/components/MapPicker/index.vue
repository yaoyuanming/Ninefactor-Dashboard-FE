<template>
  <a-modal
    v-model:visible="visible"
    title="选择位置"
    width="800px"
    :footer="false"
    @cancel="handleClose"
  >
    <!-- 搜索框 -->
    <div class="search-bar">
      <a-input-search
        v-model="searchKeyword"
        placeholder="搜索地址或关键字"
        button-text="搜索"
        search-button
        style="width: 100%"
        @search="handleSearch"
      />
    </div>

    <!-- 地图容器 -->
    <div class="map-container">
      <div id="map-picker-container" class="map-wrapper"></div>
    </div>

    <!-- 坐标信息 -->
    <div class="coordinate-info">
      <a-space>
        <a-input
          v-model="longitude"
          readonly
          placeholder="经度"
          style="width: 200px"
        >
          <template #prepend>经度</template>
          <template #append>
            <a-button type="text" @click="copyToClipboard(longitude)">
              <icon-copy />
            </a-button>
          </template>
        </a-input>
        <a-input
          v-model="latitude"
          readonly
          placeholder="纬度"
          style="width: 200px"
        >
          <template #prepend>纬度</template>
          <template #append>
            <a-button type="text" @click="copyToClipboard(latitude)">
              <icon-copy />
            </a-button>
          </template>
        </a-input>
      </a-space>
    </div>

    <!-- 地址信息 -->
    <div v-if="formattedAddress" class="address-info">
      <a-space>
        <span class="label">地址：</span>
        <span class="value">{{ formattedAddress }}</span>
      </a-space>
    </div>

    <!-- 底部按钮 -->
    <div class="footer-actions">
      <a-space>
        <a-button @click="handleClose">取消</a-button>
        <a-button type="primary" @click="handleConfirm">确定</a-button>
      </a-space>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
  import { ref, nextTick } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import mapLoader from '@/utils/aMap';

  interface LocationData {
    lng?: string | number;
    lat?: string | number;
  }

  interface MapResult {
    formattedAddress: string;
    position: {
      lng: number;
      lat: number;
    };
  }

  const emit = defineEmits<{
    (e: 'confirm', data: MapResult): void;
  }>();

  const visible = ref(false);
  const searchKeyword = ref('');
  const longitude = ref('');
  const latitude = ref('');
  const formattedAddress = ref('');

  let map: any = null;
  let marker: any = null;
  let geocoder: any = null;
  let placeSearch: any = null;

  // 添加标记
  const addMarker = (position: [number, number]) => {
    if (!map) return;

    // 移除旧标记
    if (marker) {
      map.remove(marker);
      marker = null;
    }

    // 创建新标记
    const { AMap } = window as any;
    marker = new AMap.Marker({
      position,
      map,
    });
  };

  // 根据坐标获取地址
  const getAddress = (position: [number, number]) => {
    if (!geocoder) return;

    geocoder.getAddress(position, (status: string, result: any) => {
      if (status === 'complete' && result.regeocode) {
        formattedAddress.value = result.regeocode.formattedAddress;
      }
    });
  };

  // 关闭弹窗
  const handleClose = () => {
    visible.value = false;
    searchKeyword.value = '';
    longitude.value = '';
    latitude.value = '';
    formattedAddress.value = '';

    // 销毁地图
    if (map) {
      map.destroy();
      map = null;
      marker = null;
      geocoder = null;
      placeSearch = null;
    }
  };

  // 初始化地图
  const initMap = async (initialLocation?: LocationData) => {
    try {
      const AMap = await mapLoader();

      // 创建地图实例
      map = new AMap.Map('map-picker-container', {
        zoom: 13,
        resizeEnable: true,
        center:
          initialLocation?.lng && initialLocation?.lat
            ? [Number(initialLocation.lng), Number(initialLocation.lat)]
            : [116.397428, 39.90923], // 默认北京
      });

      // 创建地理编码器
      geocoder = new AMap.Geocoder({
        city: '',
        radius: 1000,
      });

      // 创建地点搜索
      placeSearch = new AMap.PlaceSearch({
        city: '',
      });

      // 如果有初始位置，添加标记
      if (initialLocation?.lng && initialLocation?.lat) {
        addMarker([Number(initialLocation.lng), Number(initialLocation.lat)]);
        longitude.value = String(initialLocation.lng);
        latitude.value = String(initialLocation.lat);
        getAddress([Number(initialLocation.lng), Number(initialLocation.lat)]);
      }

      // 监听地图点击事件
      map.on('click', (e: any) => {
        const { lng, lat } = e.lnglat;
        addMarker([lng, lat]);
        longitude.value = String(lng);
        latitude.value = String(lat);
        getAddress([lng, lat]);
      });
    } catch (error) {
      Message.error('地图加载失败');
    }
  };

  // 搜索地点
  const handleSearch = () => {
    if (!searchKeyword.value || !placeSearch) {
      Message.warning('请输入搜索关键字');
      return;
    }

    placeSearch.search(searchKeyword.value, (status: string, result: any) => {
      if (status === 'complete' && result.poiList?.pois?.length > 0) {
        const poi = result.poiList.pois[0];
        const { lng, lat } = poi.location;

        // 添加标记
        addMarker([lng, lat]);

        // 更新坐标
        longitude.value = String(lng);
        latitude.value = String(lat);
        formattedAddress.value = poi.address || poi.name;

        // 地图移动到该位置
        map.setCenter([lng, lat]);
        map.setZoom(15);
      } else {
        Message.warning('未找到相关地点');
      }
    });
  };

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      Message.success('复制成功');
    } catch (err) {
      Message.error('复制失败');
    }
  };

  // 确认选择
  const handleConfirm = () => {
    if (!longitude.value || !latitude.value) {
      Message.warning('请在地图上选择位置');
      return;
    }

    const result: MapResult = {
      formattedAddress: formattedAddress.value,
      position: {
        lng: Number(longitude.value),
        lat: Number(latitude.value),
      },
    };

    emit('confirm', result);
    handleClose();
  };

  // 打开地图选择器
  const open = async (initialLocation?: LocationData) => {
    visible.value = true;
    await nextTick();
    await initMap(initialLocation);
  };

  defineExpose({
    open,
  });
</script>

<style scoped lang="less">
  .search-bar {
    margin-bottom: 16px;
  }

  .map-container {
    margin-bottom: 16px;

    .map-wrapper {
      width: 100%;
      height: 500px;
      border: 1px solid var(--color-border);
      border-radius: 4px;
    }
  }

  .coordinate-info {
    margin-bottom: 12px;

    :deep(.arco-input-prepend) {
      color: var(--color-text-2);
      font-weight: 500;
    }
  }

  .address-info {
    margin-bottom: 16px;
    padding: 12px;
    background: var(--color-fill-2);
    border-radius: 4px;

    .label {
      color: var(--color-text-2);
      font-weight: 500;
    }

    .value {
      color: var(--color-text-1);
    }
  }

  .footer-actions {
    display: flex;
    justify-content: flex-end;
    padding-top: 16px;
    border-top: 1px solid var(--color-border);
  }
</style>
