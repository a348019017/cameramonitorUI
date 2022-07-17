import { clone } from "../util"

import mapHelper from '../mapHelper'
import "../cesium/material/PolylineTrailLinkMaterialProperty"

//将飞行轨迹渲染成相应实体
export function flyPath2Entity(flypath) {

  let option = flypath.option;
  let routes = flypath.routes;
  let viewHeight = option.viewHeight;
  //绝对高程，全部复写高程
  if (option.altitudemode == "绝对高程") {
    routes = routes.map(i => {
      let j = clone(i);
      j.height = viewHeight;
      return j;
    })
  } else if (option.altitudemode == "相对高程") {
    routes = routes.map(i => {
      let j = clone(i);
      j.height = j.height + viewHeight;
      return j;
    })
  } else if (option.altitudemode == "无") {
    routes = routes;
  }


  let pEntities = [];
  let pointEntities = routes.map(i => {
    return createPoint(i);
  })
  pEntities.push(...pointEntities);
  pEntities.push(createLine(routes));

  //此entities是已经加载进去了
  return pEntities;
}

//创建站点
function createPoint(route) {
  //let 
  let worldPosition = Cesium.Cartesian3.fromDegrees(route.lng, route.lat, route.height)
  var point = viewer.entities.add({
    position: worldPosition,
    point: {
      color: Cesium.Color.BLACK,
      pixelSize: 10,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    },
  });
  return point;
}

//创建线
function createLine(routes) {

  let positionData = routes.map(route => {
    return Cesium.Cartesian3.fromDegrees(route.lng, route.lat, route.height)
  })
  let shape = viewer.entities.add({
    polyline: {
      positions: positionData,
      clampToGround: true,
      material: Cesium.Color.RED,
      width: 8,
    },
  });
  return shape;
}










//飞行包装类
export class CesiumFlyManager {

  //传入飞行路径,这里建议直接存储的是经纬度的坐标点，不记录世界坐标
  constructor() {

  }

  //初始化操作
  init(marks, option, callback) {
    //如果当前处于飞行状态需要结束
    this.exitFly();

    this._callback = callback;
    //默认三种状态，飞行，暂停，停止，
    this.status = "停止";
    this.marksIndex = 1;
    //是否循环播放，此时不会有停止的callback触发
    this.isloop = false;
    this.pitchValue = -20;
    this.changeCameraTime = 5;
    //this.viewType=""
    //默认速度为10m每秒，这里不再使用flytime参数，也不再单独控制每段的速度，需要再作修改。
    this.speed = 10;
    this.factor = 2.0;
    this.flytime = 5;
    if (option && option.viewAngle) {
      this.pitchValue = option.viewAngle;
    }
    if (option && option.changeCameraTime) {
      this.changeCameraTime = option.changeCameraTime;
    }
    if (option && option.speed) {
      this.speed = option.speed;
    }
    let viewHeight = 100;
    if (option && option.viewHeight != undefined) {
      viewHeight = option.viewHeight;
      this.viewHeight = viewHeight;
    }
    if (option && option.altitudemode) {
      this.altitudemode = option.altitudemode;
    }
    if (option && option.factor) {
      this.factor = 2.0;
    }
    //根据高程模型处理marks的值
    //绝对高程，全部复写高程
    let routes = marks;
    if (option.altitudemode == "绝对高程") {
      routes = routes.map(i => {
        let j = clone(i);
        j.height = viewHeight;
        return j;
      })
    } else if (option.altitudemode == "相对高程") {
      routes = routes.map(i => {

        let rheight = this.getrealpositions(i);
        let j = clone(i);
        j.height = rheight + viewHeight;
        return j;
      })
    } else if (option.altitudemode == "无") {
      routes = routes;
    }

    this.postions = routes;

    //自动清理模型
    if (this.model) {
      viewer.entities.remove(this.model);
      this.model = null;
      //取消掉绑定初始化
      viewer.trackedEntity = null;
    }

    //处理模型的初始化
    if (option.modelinfo) {
      this.offsetheading = option.modelinfo.heading ? option.modelinfo.heading : 0;
      this.offsetpitch = option.modelinfo.pitch ? option.modelinfo.pitch : 0;
      this.offsetroll = option.modelinfo.roll ? option.modelinfo.roll : 0;

      this.model = mapHelper.loadmodel2(option.modelinfo, viewer);
      //设置模型的初始位置和初始视角
      this.initFirstModel();
      viewer.trackedEntity = this.model;
    } else {
      //初始化视角或者模型视角
      this.initFirstView();
    }


  }


  //初始化模型的位置
  initFirstModel() {
    const marksIndex = 1;
    let preIndex = marksIndex - 1;
    //计算俯仰角
    let heading = this.bearing(this.postions[preIndex].lat, this.postions[preIndex].lng, this.postions[marksIndex].lat, this.postions[marksIndex].lng);
    heading = Cesium.Math.toRadians(heading);
    //获取当前点的地面高程，以达到贴地的效果

    const endPosition = Cesium.Cartesian3.fromDegrees(
      this.postions[0].lng,
      this.postions[0].lat,
      this.postions[0].height
    );
    this.setmodel(endPosition, heading);
  }


  //获取真实的位置
  getrealpositions(position) {
    if (position) {
      let rlng = Cesium.Math.toRadians(position.lng);
      let rlon = Cesium.Math.toRadians(position.lat);
      let cartographic = new Cesium.Cartographic(rlng, rlon, 0);
      let realheight = viewer.scene.globe.getHeight(cartographic)
      return realheight;
    }
    return 0;
  }


  //初始化默认视角，在init中调用
  initFirstView() {
    const pitch = Cesium.Math.toRadians(this.pitchValue);
    const marksIndex = 1;
    let preIndex = marksIndex - 1;
    //计算俯仰角
    let heading = this.bearing(this.postions[preIndex].lat, this.postions[preIndex].lng, this.postions[marksIndex].lat, this.postions[marksIndex].lng);
    heading = Cesium.Math.toRadians(heading);

    const endPosition = Cesium.Cartesian3.fromDegrees(
      this.postions[0].lng,
      this.postions[0].lat,
      this.postions[0].height
    );
    viewer.scene.camera.setView({
      destination: endPosition,
      orientation: {
        heading: heading,
        pitch: pitch,
      }
    });
  }


  //开始播放，联合暂停
  startFly() {
    if (!this.postions) {
      return;
    }
    if (this.status == "停止") {
      this.flyExtent();
    } else if (this.status == "暂停") {
      viewer.clock.shouldAnimate = true;
      this.status = "飞行";
    } else if (this.status == "飞行") {
      viewer.clock.shouldAnimate = false;
      this.status = "暂停";
    }
  }
  // //继续飞行
  // continueFly() {
  //     viewer.clock.shouldAnimate = true;
  // }
  // 停止飞行
  stopFly() {
    if (!this.postions) {
      return;
    }
    this.exitFly();
    this.status = "停止"
  }
  // 退出飞行,清楚事件监听即可不要求切回视角
  exitFly() {
    viewer.clock.onTick.removeEventListener(this.Exection);
    //重置markindex为1
    this.marksIndex = 1;
  }


  //一些变量的释放操作，stop仅用于结束操作，dispose释放相关模型资源
  dispose() {
    //自动清理模型
    if (this.model) {
      viewer.entities.remove(this.model);
      viewer.trackedEntity = null;
      this.model = null;
    }
  }


  //方位角设定模型
  setmodel(position, heading) {

    this.model.position.setValue(position);
    var _heading = heading + this.offsetheading;
    var _pitch = 0 + this.offsetpitch;
    var _roll = 0 + this.offsetroll;

    var hpr = new Cesium.HeadingPitchRoll(_heading, _pitch, _roll);
    var _orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
    this.model.orientation.setValue(_orientation);
  }




  //模型运动，相机偏移特定角度
  modelmove() { }


  flyExtent() {
    const self = this;
    // 相机看点的角度，如果大于0那么则是从地底往上看，所以要为负值
    const pitch = Cesium.Math.toRadians(this.pitchValue);

    if (this.speed) {
      //计算当前的flytime，如果speed为0，使用每段的flytime
      const originLat = self.marksIndex == 0 ? self.postions[self.postions.length - 1].lat : self.postions[self.marksIndex - 1].lat;
      const originLng = self.marksIndex == 0 ? self.postions[self.postions.length - 1].lng : self.postions[self.marksIndex - 1].lng;
      const originHeight = self.marksIndex == 0 ? self.postions[self.postions.length - 1].height : self.postions[self.marksIndex - 1].height;

      const nextLat = self.postions[self.marksIndex].lat;
      const nextLng = self.postions[self.marksIndex].lng;
      const nextHeight = self.postions[self.marksIndex].height;

      const originCoord = Cesium.Cartesian3.fromDegrees(originLng, originLat, originHeight);
      const netxCoord = Cesium.Cartesian3.fromDegrees(nextLng, nextLat, nextHeight);
      const distance = Cesium.Cartesian3.distance(originCoord, netxCoord);
      const flytime = distance / this.speed;
      this.postions[this.marksIndex].flytime = flytime;
    }

    // 时间间隔2秒钟//排除掉0.1s以下的轨迹
    if (this.postions[this.marksIndex].flytime <= 0.1) {
      self.marksIndex = ++self.marksIndex >= self.postions.length ? 0 : self.marksIndex;
      if (self.marksIndex != 0) {
        self.flyExtent();
      }
      return;
    }
    this.setExtentTime(this.postions[this.marksIndex].flytime / this.factor);
    var that = this;
    this.Exection = function TimeExecution() {
      let preIndex = self.marksIndex - 1;
      if (self.marksIndex == 0) {
        preIndex = self.postions.length - 1;
      }

      //计算俯仰角
      let heading = self.bearing(self.postions[preIndex].lat, self.postions[preIndex].lng, self.postions[self.marksIndex].lat, self.postions[self.marksIndex].lng);
      heading = Cesium.Math.toRadians(heading);
      // 当前已经过去的时间，单位s

      const delTime = Cesium.JulianDate.secondsDifference(viewer.clock.currentTime, viewer.clock.startTime);
      const originLat = self.marksIndex == 0 ? self.postions[self.postions.length - 1].lat : self.postions[self.marksIndex - 1].lat;
      const originLng = self.marksIndex == 0 ? self.postions[self.postions.length - 1].lng : self.postions[self.marksIndex - 1].lng;


      //小场景下是线性的计算
      const reallng = originLng + (self.postions[self.marksIndex].lng - originLng) / self.postions[self.marksIndex].flytime * delTime * that.factor;
      const reallat = originLat + (self.postions[self.marksIndex].lat - originLat) / self.postions[self.marksIndex].flytime * delTime * that.factor;
      let endPosition = Cesium.Cartesian3.fromDegrees(
        reallng,
        reallat,
        //这个高度一致是有误的
        self.postions[self.marksIndex].height
      );
      //相对高程实时贴地处理
      if (that.altitudemode == "相对高程") {
        const realheight = that.getrealpositions({ lng: reallng, lat: reallat });
        endPosition = Cesium.Cartesian3.fromDegrees(
          reallng,
          reallat,
          //这个高度一致是有误的
          realheight + that.viewHeight
        );
      }

      //如果模型便不修改相机视角
      if (self.model) {
        self.setmodel(endPosition, heading);
      } else {
        viewer.scene.camera.setView({
          destination: endPosition,
          orientation: {
            heading: heading,
            pitch: pitch,
          }
        });
      }

      if (Cesium.JulianDate.compare(viewer.clock.currentTime, viewer.clock.stopTime) >= 0) {
        viewer.clock.onTick.removeEventListener(self.Exection);
        //有个转向的功能
        self.changeCameraHeading();

      }
    };
    viewer.clock.onTick.addEventListener(self.Exection);
    this.status = "飞行";
  }
  // 相机原地定点转向
  changeCameraHeading() {

    const self = this;

    let nextIndex = this.marksIndex + 1;
    let preIndex = this.marksIndex - 1;
    //如果是循环模式继续进行下一次飞行，闭合线的最后一次转向暂不考虑
    if (this.marksIndex == this.postions.length - 1 && this.isloop) {
      this.marksIndex = 1;
      this.flyExtent();
    }
    //非循环模式直接退出 
    else if (this.marksIndex == this.postions.length - 1 && !this.isloop) {
      if (this._callback) {
        this.status = "停止"
        this._callback("停止");
      }
      return;
    }

    // 计算两点之间的方向
    const lastheading = this.bearing(this.postions[preIndex].lat, this.postions[preIndex].lng, this.postions[this.marksIndex].lat, this.postions[this.marksIndex].lng);
    const heading = this.bearing(this.postions[this.marksIndex].lat, this.postions[this.marksIndex].lng, this.postions[nextIndex].lat, this.postions[nextIndex].lng);
    const endPosition = Cesium.Cartesian3.fromDegrees(this.postions[this.marksIndex].lng, this.postions[this.marksIndex].lat, this.postions[this.marksIndex].height)
    // 相机看点的角度，如果大于0那么则是从地底往上看，所以要为负值
    const pitch = Cesium.Math.toRadians(this.pitchValue);
    // 给定飞行一周所需时间，比如10s, 那么每秒转动度数
    var isnegtive = heading - lastheading >= 0 ? 1.0 : -1.0;
    let angle = (Math.abs(heading - lastheading) >= 180 ? ((lastheading - heading) + isnegtive * 180) : (heading - lastheading)) / this.changeCameraTime;
    // 时间间隔2秒钟

    //heading - lastheading>0顺时针 超过-（heading - lastheading-180）
    //heading - lastheading<0   <-180    -(heading - lastheading+180）
    this.setExtentTime(this.changeCameraTime);
    // 相机的当前heading
    const initialHeading = lastheading;
    this.Exection = function TimeExecution() {
      // 当前已经过去的时间，单位s
      const delTime = Cesium.JulianDate.secondsDifference(viewer.clock.currentTime, viewer.clock.startTime);
      const heading = Cesium.Math.toRadians(delTime * angle) + Cesium.Math.toRadians(initialHeading);


      if (self.model) {
        //self.model.position.setValue(endPosition);
        var _heading = heading + self.offsetheading;
        var _pitch = 0 + self.offsetpitch;
        var _roll = 0 + self.offsetroll;
        var hpr = new Cesium.HeadingPitchRoll(_heading, _pitch, _roll);
        var _orientation = Cesium.Transforms.headingPitchRollQuaternion(endPosition, hpr);
        self.model.orientation.setValue(_orientation);
      } else {
        viewer.scene.camera.setView({
          orientation: {
            heading: heading,
            pitch: pitch,
          }
        });
      }


      if (Cesium.JulianDate.compare(viewer.clock.currentTime, viewer.clock.stopTime) >= 0) {
        viewer.clock.onTick.removeEventListener(self.Exection);

        self.marksIndex = ++self.marksIndex >= self.postions.length ? 0 : self.marksIndex;
        if (self.marksIndex != 0) {
          self.flyExtent();
        }
      }
    };
    viewer.clock.onTick.addEventListener(self.Exection);
  }
  // 设置飞行的时间到viewer的时钟里
  setExtentTime(time) {
    // const { viewer } = this;
    const startTime = Cesium.JulianDate.fromDate(new Date());
    const stopTime = Cesium.JulianDate.addSeconds(startTime, time, new Cesium.JulianDate());
    viewer.clock.startTime = startTime.clone();  // 开始时间
    viewer.clock.stopTime = stopTime.clone();     // 结速时间
    viewer.clock.currentTime = startTime.clone(); // 当前时间
    viewer.clock.clockRange = Cesium.ClockRange.CLAMPED; // 行为方式-达到终止时间后停止
    viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK; // 时钟设置为当前系统时间; 忽略所有其他设置。
  }
  /** 相机视角飞行 结束 **/
  /** 飞行时 camera的方向调整(heading) 开始 **/
  // 角度转弧度
  toRadians(degrees) {
    return degrees * Math.PI / 180;
  }
  // 弧度转角度
  toDegrees(radians) {
    return radians * 180 / Math.PI;
  }
  //计算俯仰角
  bearing(startLat, startLng, destLat, destLng) {

    startLat = this.toRadians(startLat);
    startLng = this.toRadians(startLng);
    destLat = this.toRadians(destLat);
    destLng = this.toRadians(destLng);

    let y = Math.sin(destLng - startLng) * Math.cos(destLat);
    let x = Math.cos(startLat) * Math.sin(destLat) - Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
    let brng = Math.atan2(y, x);
    let brngDgr = this.toDegrees(brng);

    return (brngDgr + 360) % 360;
  }

}
