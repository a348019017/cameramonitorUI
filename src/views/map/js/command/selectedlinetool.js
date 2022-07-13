

//选择功能的封装

var selectedtool = {};


var maphanders = [];

var previousPickedEntity = undefined;

const selectedmaterial = Cesium.Color.White;


//默认矢量的回调函数
let defaultpolylinecallback = function (pickingEntity) {


}


//默认的触发机制
let callback = function (pickingEntity) {
    if (pickingEntity instanceof Cesium.Cesium3DTileFeature) {
        //判断以前是否选择要素
        if (pickingEntity != previousPickedEntity.feature) {
            if (previousPickedEntity.feature != undefined) {
                //还原前选择要素的本颜色
                previousPickedEntity.feature.color =
                    previousPickedEntity.originalColor;
                //将当前选择要素及其颜色添加到previousPickedEntity
                previousPickedEntity.feature = pickingEntity;
                previousPickedEntity.originalColor = pickingEntity.color;
            }
            //将当前选择要素及其颜色添加到previousPickedEntity
            previousPickedEntity.feature = pickingEntity;
            previousPickedEntity.originalColor = pickingEntity.color;
        }
        //将模型变为黄色高亮
        pickingEntity.color = Cesium.Color.RED;
        var name = pickingEntity.getProperty("id");
        selectedtileId = name;
        //获取其外包球
        var center = pickingEntity.content.tile.boundingSphere.center;
        var radius = pickingEntity.content.tile.boundingSphere.radius;

        console.log(
            JSON.stringify(pickingEntity.content.tile.boundingSphere)
        );
        console.log(name);
    } else {
    }
}

//初始化该功能，并注册一个callback
selectedtool.init = function (_callback) {
    if (_callback) {
        callback = _callback;
    }
}


selectedtool.name = "选取功能";


//前一个选中的颜色和实体
var previousPickedEntity = {
    entity: undefined,
    originalColor: undefined,
    polygonoriginalColor: undefined,
};

//默认选中的样式
const defaultlinecolor = Cesium.Color.WHITE;
const defaultpolygonfillcolor = Cesium.Color.WHITE;

//这里需要同时处理polyline和polygon的样式变换
let handleentyhighlight = function (enty) {
    if (enty && enty.id) {
        if (enty.id.polyline) {
            previousPickedEntity.originalColor = enty.id.polyline.material;
            enty.id.polyline.material = defaultlinecolor;
        } else if (enty.id.polygon) {
            previousPickedEntity.polygonoriginalColor = enty.id.polygon.material;
            enty.id.polygon.material = defaultpolygonfillcolor;
        }
    }
    previousPickedEntity.entity = enty;
}

//处理要素的复原
let handleentyunhighlight = function () {
    if (previousPickedEntity.entity && previousPickedEntity.entity.id) {
        if (previousPickedEntity.entity.id.polyline) {
            previousPickedEntity.entity.id.polyline.material = previousPickedEntity.originalColor;
        } else if (previousPickedEntity.entity.id.polygon) {
            previousPickedEntity.entity.id.polygon.material = previousPickedEntity.polygonoriginalColor;
        }
        previousPickedEntity.entity = undefined;
        previousPickedEntity.originalColor = undefined;
        previousPickedEntity.polygonoriginalColor = undefined;
    }
}



//点击该功能时触发active,再次点击时触发deactive
selectedtool.active = function () {
    maphanders.forEach((i) => i.destroy());
    maphanders = [];
    var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (click) {
        var pickingEntity = viewer.scene.pick(click.endPosition);
        //高亮效果的逻辑代码,如果选中的和之前的不相同才处理原来的
        if (!(pickingEntity && previousPickedEntity.entity && pickingEntity.id == previousPickedEntity.entity.id)) {
            //处理复原
            handleentyunhighlight();
            //处理高亮
            handleentyhighlight(pickingEntity);
        }



        //实时进行回调
        if (callback) {
            callback(pickingEntity, click.endPosition);
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    maphanders.push(handler);
}


//反激活该功能
selectedtool.deactive = function () {
    maphanders.forEach((i) => i.destroy());
    maphanders = [];


    handleentyunhighlight();
}



export default selectedtool;


