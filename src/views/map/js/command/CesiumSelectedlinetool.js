//废弃也不再使用

//选择功能封装成类
export class CesiumSelectedLine {
    constructor(_viewer, _callback) {
        if (_callback) {
            this.callback = _callback;
        }
        this.name = "选取功能";
        this.viewer = _viewer;
        //前一个选中的颜色和实体
        this.previousPickedEntity = {
            entity: undefined,
            originalColor: undefined,
            polygonoriginalColor: undefined,
        };

        //默认选中的样式
        this.defaultlinecolor = Cesium.Color.WHITE;
        this.defaultpolygonfillcolor = Cesium.Color.WHITE;
        this.maphanders = [];
        this.selectedmaterial = Cesium.Color.White;
    }


    //这里需要同时处理polyline和polygon的样式变换
    handleentyhighlight(enty) {
        if (enty && enty.id) {
            if (enty.id.polyline) {
                this.previousPickedEntity.originalColor = enty.id.polyline.material;
                enty.id.polyline.material = this.defaultlinecolor;
            } else if (enty.id.polygon) {
                this.previousPickedEntity.polygonoriginalColor = enty.id.polygon.material;
                enty.id.polygon.material = this.defaultpolygonfillcolor;
            }
        }
        this.previousPickedEntity.entity = enty;
    }
    //处理要素的复原
    handleentyunhighlight() {
        if (this.previousPickedEntity.entity && this.previousPickedEntity.entity.id) {
            if (this.previousPickedEntity.entity.id.polyline) {
                this.previousPickedEntity.entity.id.polyline.material = this.previousPickedEntity.originalColor;
            } else if (this.previousPickedEntity.entity.id.polygon) {
                this.previousPickedEntity.entity.id.polygon.material = this.previousPickedEntity.polygonoriginalColor;
            }
            this.previousPickedEntity.entity = undefined;
            this.previousPickedEntity.originalColor = undefined;
            this.previousPickedEntity.polygonoriginalColor = undefined;
        }
    }


    active() {
        this.maphanders.forEach((i) => i.destroy());
        this.maphanders = [];
        var handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        let that = this;
        handler.setInputAction(function (click) {
            var pickingEntity = that.viewer.scene.pick(click.endPosition);
            //高亮效果的逻辑代码,如果选中的和之前的不相同才处理原来的
            if (!(pickingEntity && that.previousPickedEntity.entity && pickingEntity.id == that.previousPickedEntity.entity.id)) {
                //处理复原
                that.handleentyunhighlight();
                //处理高亮
                that.handleentyhighlight(pickingEntity);
            }

            //实时进行回调
            if (that.callback) {
                let offsetleft = that.viewer._container.offsetLeft;
                that.callback(pickingEntity, { x: offsetleft + click.endPosition.x, y: click.endPosition.y });
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.maphanders.push(handler);
    }

    deactive() {
        this.maphanders.forEach((i) => i.destroy());
        this.maphanders = [];


        this.handleentyunhighlight();
    }



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















