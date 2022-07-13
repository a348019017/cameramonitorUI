//废弃，不再使用

//选择功能的封装

var selectedtool = {};


var maphanders = [];

var previousPickedEntity = undefined;

let selectedmaterial = Cesium.Color.RED;


//默认矢量的回调函数
let defaultpolylinecallback = function (pickingEntity) {

}


//默认的触发机制,这个仅支持模型的选中
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
        pickingEntity.color = selectedmaterial;
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
selectedtool.init = function (_callback, _selectedcolor) {
    if (_callback) {
        callback = _callback;
    }
    if (_selectedcolor) {
        selectedmaterial = typeof (_selectedcolor) === "string" ? Cesium.Color.fromCssColorString(_selectedcolor) : _selectedcolor;
    }
}



selectedtool.name = "模型选取功能";


//高亮显示代码
var previousPickedEntity2 = {
    feature: undefined,
    originalColor: undefined
};


//点击该功能时触发active,再次点击时触发deactive
selectedtool.active = function () {
    maphanders.forEach((i) => i.destroy());
    maphanders = [];
    var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (click) {
        var pickingEntity = viewer.scene.pick(click.endPosition);

        //判断选择是否为Cesium3DTileFeature
        if (pickingEntity instanceof Cesium.Cesium3DTileFeature) {
            //判断以前是否选择要素
            if (pickingEntity != previousPickedEntity2.feature) {
                if (previousPickedEntity2.feature != undefined) {
                    //还原前选择要素的本颜色
                    previousPickedEntity2.feature.color = previousPickedEntity2.originalColor;
                    //将当前选择要素及其颜色添加到previousPickedEntity
                    previousPickedEntity2.feature = pickingEntity;
                    previousPickedEntity2.originalColor = pickingEntity.color;
                }
                //将当前选择要素及其颜色添加到previousPickedEntity
                previousPickedEntity2.feature = pickingEntity;
                previousPickedEntity2.originalColor = pickingEntity.color;
            }
            //将模型变为黄色高亮
            pickingEntity.color = selectedmaterial;
        }

        if (!pickingEntity) {

            //清除模型选中的效果
            if (previousPickedEntity2.feature != undefined) {
                //还原前选择要素的本颜色
                previousPickedEntity2.feature.color = previousPickedEntity2.originalColor;
                //将当前选择要素及其颜色添加到previousPickedEntity
                previousPickedEntity2.feature = undefined;
                previousPickedEntity2.originalColor = undefined;
            }
        }


        //实时进行回调
        if (callback) {
            let offsetleft = viewer._container.offsetLeft;
            let realposition = { x: offsetleft + click.endPosition.x, y: click.endPosition.y }
            callback(pickingEntity, realposition);
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    maphanders.push(handler);
}


//反激活该功能
selectedtool.deactive = function () {
    maphanders.forEach((i) => i.destroy());
    maphanders = [];

    //清除模型选中的效果
    if (previousPickedEntity2.feature != undefined) {
        //还原前选择要素的本颜色
        previousPickedEntity2.feature.color = previousPickedEntity2.originalColor;
        //将当前选择要素及其颜色添加到previousPickedEntity
        previousPickedEntity2.feature = undefined;
        previousPickedEntity2.originalColor = undefined;
    }

}



export default selectedtool;
