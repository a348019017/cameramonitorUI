


//未使用，代码留存
export class CesiumMeasureLineSpace {


    constructor(_callback, option) {
        //this.drawcomplete = _callback;
        this.positions = [];
        this.poly = null;
        // var tooltip = document.getElementById("toolTip");
        this.distance = 0;
        this.cartesian = null;
        this.floatingPoint = null;
        //构造函数中作一些判断
        if (!viewer.scene.pickPositionSupported) {
            window.alert("This browser does not support pickPosition.");
        }

        this.handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);


    }




    active() {

        // 取消双击事件-追踪该位置
        //viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);


        this.positions = [];
        this.poly = null;
        // var tooltip = document.getElementById("toolTip");
        this.distance = 0;
        this.cartesian = null;
        this.floatingPoint = null;

        let that = this;

        this.handler.setInputAction(function (movement) {
            // tooltip.style.left = movement.endPosition.x + 3 + "px";
            // tooltip.style.top = movement.endPosition.y - 25 + "px";
            // tooltip.innerHTML = '<p>单击开始，右击结束</p>';
            // cartesian = viewer.scene.pickPosition(movement.endPosition);
            let ray = viewer.camera.getPickRay(movement.endPosition);
            that.cartesian = viewer.scene.globe.pick(ray, viewer.scene);
            //cartesian = viewer.scene.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
            if (that.positions.length >= 2) {
                if (!Cesium.defined(poly)) {
                    that.poly = new PolyLinePrimitive(positions);
                } else {
                    that.positions.pop();
                    // cartesian.y += (1 + Math.random());
                    that.positions.push(cartesian);
                }
                that.distance = getSpaceDistance(positions);
                // console.log("distance: " + distance);
                // tooltip.innerHTML='<p>'+distance+'米</p>';
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);


        this.handler.setInputAction(function (movement) {
            // tooltip.style.display = "none";
            // cartesian = viewer.scene.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
            // cartesian = viewer.scene.pickPosition(movement.position);
            let ray = viewer.camera.getPickRay(movement.position);
            that.cartesian = viewer.scene.globe.pick(ray, viewer.scene);
            if (that.positions.length == 0) {
                that.positions.push(cartesian.clone());
            }
            that.positions.push(cartesian);
            //在三维场景中添加Label
            //   var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            var textDisance = distance + "米";
            // console.log(textDisance + ",lng:" + cartographic.longitude/Math.PI*180.0);
            that.floatingPoint = viewer.entities.add({
                name: '空间直线距离',
                // position: Cesium.Cartesian3.fromDegrees(cartographic.longitude / Math.PI * 180, cartographic.latitude / Math.PI * 180,cartographic.height),
                position: that.positions[positions.length - 1],
                point: {
                    pixelSize: 5,
                    color: Cesium.Color.RED,
                    outlineColor: Cesium.Color.WHITE,
                    outlineWidth: 2,
                },
                label: {
                    text: textDisance,
                    font: '18px sans-serif',
                    fillColor: Cesium.Color.GOLD,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineWidth: 2,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(20, -20),
                }
            });
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        this.handler.setInputAction(function (movement) {
            that.handler.destroy(); //关闭事件句柄
            that.positions.pop(); //最后一个点无效
            // viewer.entities.remove(floatingPoint);
            // tooltip.style.display = "none";

        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);


        var PolyLinePrimitive = (function () {
            function _(positions) {
                this.options = {
                    name: '直线',
                    polyline: {
                        show: true,
                        positions: [],
                        material: Cesium.Color.CHARTREUSE,
                        width: 10,
                        clampToGround: true
                    }
                };
                this.positions = positions;
                this._init();
            }

            _.prototype._init = function () {
                var _self = this;
                var _update = function () {
                    return _self.positions;
                };
                //实时更新polyline.positions
                this.options.polyline.positions = new Cesium.CallbackProperty(_update, false);
                viewer.entities.add(this.options);
            };

            return _;
        })();


    }

    deactive() {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        //清除掉相关资源
        // viewer.entities.remove(this.floatingPoint);
        // viewer.entities.remove(this.activeShape);
        // for (let index = 0; index < this.activePoints.length; index++) {
        //     const element = this.activePoints[index];
        //     viewer.entities.remove(element);
        // }
        //

    }


    getSpaceDistance(positions) {
        var distance = 0;
        for (var i = 0; i < positions.length - 1; i++) {

            var point1cartographic = Cesium.Cartographic.fromCartesian(this.positions[i]);
            var point2cartographic = Cesium.Cartographic.fromCartesian(this.positions[i + 1]);
            /**根据经纬度计算出距离**/
            var geodesic = new Cesium.EllipsoidGeodesic();
            geodesic.setEndPoints(point1cartographic, point2cartographic);
            var s = geodesic.surfaceDistance;
            //console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)));
            //返回两点之间的距离
            s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
            distance = distance + s;
        }
        return distance.toFixed(2);
    }
}



