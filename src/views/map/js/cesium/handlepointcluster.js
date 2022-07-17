//处理点的聚类代码,这里传入的是datasource也就是说需要使用datasource进行加载type：geojsonX
export function customStyle(dataSource) {
  let removeListener;
  const pinBuilder = new Cesium.PinBuilder();
  const pin250 = pinBuilder
    .fromText("250+", Cesium.Color.RED, 96)
    .toDataURL();
  const pin200 = pinBuilder
    .fromText("200+", Cesium.Color.ORANGE, 96)
    .toDataURL();
  const pin150 = pinBuilder
    .fromText("150+", Cesium.Color.YELLOW, 96)
    .toDataURL();
  const pin100 = pinBuilder
    .fromText("100+", Cesium.Color.GREEN, 96)
    .toDataURL();
  const pin50 = pinBuilder
    .fromText("50+", Cesium.Color.BLUE, 96)
    .toDataURL();
  const singleDigitPins = new Array(8);
  for (let i = 0; i < singleDigitPins.length; ++i) {
    singleDigitPins[i] = pinBuilder
      .fromText(`${i + 2}`, Cesium.Color.VIOLET, 96)
      .toDataURL();
  } if (Cesium.defined(removeListener)) {
    removeListener();
    removeListener = undefined;
  } else {
    removeListener = dataSource.clustering.clusterEvent.addEventListener(
      function (clusteredEntities, cluster) {
        cluster.label.show = false;
        cluster.billboard.show = true;
        cluster.billboard.id = cluster.label.id;
        cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
        cluster.billboard.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND
        if (clusteredEntities.length >= 250) {
          cluster.billboard.image = pin250;
        } else if (clusteredEntities.length >= 200) {
          cluster.billboard.image = pin200;
        } else if (clusteredEntities.length >= 150) {
          cluster.billboard.image = pin150;
        } else if (clusteredEntities.length >= 100) {
          cluster.billboard.image = pin100;
        } else if (clusteredEntities.length >= 50) {
          cluster.billboard.image = pin50;
        } else {
          cluster.billboard.image =
            singleDigitPins[clusteredEntities.length - 2];
        }
      }
    );
  }
}


//处理点的数cluster处理
export function handlepointsloadbygeojson(dataSource, element) {
  if (element.cluster) {
    dataSource.clustering.enabled = true;
    dataSource.clustering.pixelRange = element.cluster.pixelRange ? element.cluster.pixelRange : 100;
    dataSource.clustering.minimumClusterSize = element.cluster.minimumClusterSize ? element.cluster.minimumClusterSize : 50;
    customStyle(dataSource);
  } else {
    //移除cluster
  }
}
