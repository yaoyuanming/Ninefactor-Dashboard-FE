import AMapLoader from '@amap/amap-jsapi-loader'

window._AMapSecurityConfig = {
  securityJsCode: 'b77b0eaf31f13a061f9ad8a774a3591e',
}

const mapLoader = () => {
  return new Promise((resolve, reject) => {
    AMapLoader.load({
      key: 'bfd3f3e063124c2824560b702e8a2176', // 申请好的Web端开发者Key ，一样用自己的
      version: '2.0', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
      plugins: ['AMap.Driving','AMap.Geocoder','AMap.Driving','AMap.MouseTool','AMap.PlaceSearch','AMap.DistrictSearch'], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
      AMapUI: {
        // 是否加载 AMapUI，缺省不加载
        version: '1.1', // AMapUI 版本
        plugins: ['overlay/SimpleMarker'], // 需要加载的 AMapUI ui插件
      },
      Loca: {
        // 是否加载 Loca， 缺省不加载
        version: '2.0', // Loca 版本
      },
    }).then((AMap) => {
      resolve(AMap)
    }).catch((error) => {
      reject(false)
    })
  })
}

export default mapLoader
