//2022/2/25新增融合模型等多要素的选取包装功能



//统一的选取功能封装，替代selectedlinetool(矢量选中)和selectedmodeltool(3dtile模型选中)
export class CesiumPickTool {
    constructor(_callback, _filter, viewer) {
        this.callback = _callback;
        this.filter = _filter;
        this.defaultselectedlinecolor = Cesium.Color.WHITE;
        this.defaultselectedfillcolor = Cesium.Color.RED;
        //默认选中模型的样式
        this.defaultselectedfeaturecolor = Cesium.Color.RED;
        //前一个选取的对象，{object既entity或者feature}
        this.previousPickedEntity = {};
        this.maphanders = [];
        this.name = "统一选取功能"
        this.viewer = viewer;
    }




    //处理对象的数据还原
    handleunhighlight() {
        //清除要素选中的效果
        if (this.previousPickedEntity) {
            if (this.previousPickedEntity.feature) {
                this.previousPickedEntity.feature.color = this.previousPickedEntity.originalColor;
                //将当前选择要素及其颜色添加到this.previousPickedEntity
                this.previousPickedEntity.feature = undefined;
                this.previousPickedEntity.originalColor = undefined;
            }
            if (this.previousPickedEntity.id) {
                if (this.previousPickedEntity.id.polyline) {
                    this.previousPickedEntity.id.polyline.material = this.previousPickedEntity.linecolor;
                    this.previousPickedEntity.linecolor = undefined;
                }
                if (this.previousPickedEntity.id.polygon) {
                    this.previousPickedEntity.id.polygon.material = this.previousPickedEntity.fillcolor;
                }
                this.previousPickedEntity.id = undefined
            }
        }
    }

    handlehighlight(pickingEntity) {
        if (pickingEntity instanceof Cesium.Cesium3DTileFeature) {
            //判断以前是否选择要素
            if (pickingEntity != this.previousPickedEntity.feature) {
                this.previousPickedEntity.feature = pickingEntity;
                this.previousPickedEntity.originalColor = pickingEntity.color;
            }
            //将模型变为黄色高亮
            pickingEntity.color = this.defaultselectedfeaturecolor;
            return;
        }

        if (pickingEntity.id) {
            if (pickingEntity.id == this.previousPickedEntity.id)
                return;
            if (pickingEntity.id.polygon) {
                this.previousPickedEntity.id = pickingEntity.id;
                this.previousPickedEntity.fillcolor = pickingEntity.id.polygon.material;
                pickingEntity.id.polygon.material = this.defaultselectedfillcolor;
            }
            if (pickingEntity.id.polyline) {
                this.previousPickedEntity.id = pickingEntity.id;
                this.previousPickedEntity.linecolor = pickingEntity.id.polyline.material;
                pickingEntity.id.polyline.material = this.defaultselectedlinecolor;
            }
        }

    }


    active() {
        this.maphanders.forEach((i) => i.destroy());
        this.maphanders = [];
        var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        var that = this;
        handler.setInputAction(function (click) {
            var pickingEntity = viewer.scene.pick(click.endPosition);
            // if (this.filter) {
            //     if (!this.filter(pickingEntity))
            //         return;
            // }
            if (!pickingEntity && (that.previousPickedEntity.id || that.previousPickedEntity.id)) {
                that.handleunhighlight();
            }
            //高亮效果的逻辑代码

            if (pickingEntity) {
                that.handlehighlight(pickingEntity);
                //实时进行回调

            }
            if (that.callback) {
                let offsetleft = viewer._container.offsetLeft;
                that.callback(pickingEntity, { x: offsetleft + click.endPosition.x, y: click.endPosition.y });
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.maphanders.push(handler);
    }


    deactive() {
        this.maphanders.forEach((i) => i.destroy());
        this.maphanders = [];
        //取消高亮
        this.handleunhighlight();
    }


}





