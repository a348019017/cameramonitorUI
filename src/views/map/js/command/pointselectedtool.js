
//处理项目全局预览的帮助类

var pointselectedtool = {};


var maphanders = [];

let callback = function () {

}

//初始化这里是鼠标点击的相应
pointselectedtool.init = function (_callback) {
    callback = _callback;
}


pointselectedtool.active = function () {
    maphanders.forEach((i) => i.destroy());
    maphanders = [];
    var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (click) {
        var pick = viewer.scene.pick(click.position);
        //选中某模型   pick选中的对象
        if (pick && pick.id) {
            //弹出界面显示project信息直接回调entitie的信息
            callback(pick.id);
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    maphanders.push(handler);
}

pointselectedtool.deactive = function () {
    maphanders.forEach((i) => i.destroy());
    maphanders = [];
}


export default pointselectedtool;