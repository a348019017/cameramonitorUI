


//绘制点的一个功能
export class CesiumDrawPointTool {


    constructor(_drawcompletecallback, _drawpointcallback, option) {
        //右键结束绘制，返回全部的点geojson
        this.drawcompletecallback = _drawcompletecallback;
        //每绘制完一个点出发一次回调
        this.drawpointcallback = _drawpointcallback
        //构造函数中作一些判断
        if (!viewer.scene.pickPositionSupported) {
            window.alert("This browser does not support pickPosition.");
        }

        //点的坐标集合
        this.points = [];
        //点的实体集合
        this.pointsEntities = [];
        //当前的位置，鼠标移动的位置
        this.curposition = undefined;

        this.handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
        //右键结束的时候是否清除对象
        this.isclearwhencomplete = true;
        if (option && option.isclearwhencomplete === false) {
            this.isclearwhencomplete = false;
        }
    }




    active() {

        this.points = [];
        this.pointsEntities = [];
        let that = this;
        //先清空可能的事件再添加，防止频繁调用
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        //默认创建一个点，然后随着鼠标移动渲染，必须开启深度测试，否则不能pick
        viewer.scene.globe.depthTestAgainstTerrain = true
        // if (!this.activepoint) {
        //     let defaultposition = new Cesium.Cartesian3.fromDegrees(0, 0, 0);
        //     that.activepoint = this.createPoint(defaultposition);
        //     that.activepoint.position = new Cesium.CallbackProperty(function () {
        //         return this.curposition;
        //     }, false)
        // }


        this.handler.setInputAction(function (event) {
            // We use `viewer.scene.pickPosition` here instead of `viewer.camera.pickEllipsoid` so that
            // we get the correct point when mousing over terrain.
            var earthPosition = viewer.scene.pickPosition(event.position);
            // `earthPosition` will be undefined if our mouse is not over the globe.
            if (Cesium.defined(earthPosition)) {
                let shape = that.createPoint(earthPosition);
                that.pointsEntities.push(shape);
                if (that.drawpointcallback) {
                    //传出一个点
                    let outputparams = { point: earthPosition, pointEnty: shape };
                    that.drawpointcallback(outputparams)
                }
            }

        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        this.handler.setInputAction(function (event) {
            var earthPosition = viewer.scene.pick(event.endPosition);

            that.curposition = earthPosition;
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);


        this.handler.setInputAction(function (event) {
            //that.terminateShape();
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);




    }

    deactive() {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);


        if (this.isclearwhencomplete) {
            for (let index = 0; index < this.pointsEntities.length; index++) {
                const element = this.pointsEntities[index];
                viewer.entities.remove(element);
            }
        }
    }




    //清空全部对象，不管是否
    clear() {
        for (let index = 0; index < this.pointsEntities.length; index++) {
            const element = this.pointsEntities[index];
            viewer.entities.remove(element);
        }
    }


    //创建点
    createPoint(worldPosition) {
        var point = viewer.entities.add({
            position: worldPosition,
            point: {
                color: Cesium.Color.RED,
                pixelSize: 5,
                heightReference: Cesium.HeightReference.NONE,
            },
        });
        return point;
    }
}



