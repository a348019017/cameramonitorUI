

var thehandler = undefined;


export function setcustommodelviewcontroller(enable) {
    if (enable) {
        setmodelviewcontroller();
    } else {
        setdefaultcontroller();
    }
}


//重写缩放效果
function setmodelviewcontroller() {

    //设置背景，屏蔽所以星空等等之类的


    //修改缩放的效果
    //viewer.scene.screenSpaceCameraController.enableZoom = false;
    //编写一个acrball的控制器，强制锁定相机的范围为2*boundingsphere的范围，默认操作形式是左键旋转，中建缩放，右键平移
    //var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    //thehandler = handler;
    // handler.setInputAction(function (wheel) {
    //     if (wheel >= 0) {
    //         viewer.camera.moveForward(wheel / 50);
    //     } else {
    //         viewer.camera.moveBackward(-wheel / 50);
    //     }
    // }, Cesium.ScreenSpaceEventType.WHEEL);

    viewer.scene.skyBox.show = false;
    viewer.scene.backgroundColor = new Cesium.Color(0.0, 0.0, 0.0, 0.0);
    viewer.scene.sun.show = false;
    viewer.scene.moon.show = false;
    viewer.scene.globe.show = false;
    viewer.scene.skyAtmosphere.show = false; //隐藏大气圈


}


function setdefaultcontroller() {
    if (thehandler) {
        thehandler.destroy();
        thehandler = undefined;
    }
    viewer.scene.screenSpaceCameraController.enableZoom = true;

    viewer.scene.skyBox.show = true;
    viewer.scene.backgroundColor = new Cesium.Color(0.0, 0.0, 0.0, 0.0);
    viewer.scene.sun.show = true;
    viewer.scene.moon.show = true;
    viewer.scene.globe.show = true;
    viewer.scene.skyAtmosphere.show = true; //隐藏大气圈
}