import { octree } from "../mapHelper"

//通过相机移动自动选择要素功能封装成类
export class CesiumSelectedObjectByCamera {
    constructor(_viewer, _callback) {
        if (_callback) {
            this.callback = _callback;
        }
        this.name = "相机选取功能";
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
        this.selectedmaterial = Cesium.Color.White;

        this._handlecamerachanged = this.handlecamerachanged.bind(this)
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

    //处理相机发生变化
    handlecamerachanged() {
        var selectedobject = octree.cameraIntersectFirst(this.viewer.camera);
        this.handleentyunhighlight();
        if (selectedobject) {
            this.handleentyhighlight({ id: selectedobject })
        }
        //实时进行回调
        if (this.callback) {
            let offsetleft = this.viewer._container.offsetLeft;
            //获取居中位置
            //获取当前鼠标位置
            this.callback({ id: selectedobject }, { x: offsetleft + viewer.container.clientWidth / 2, y: viewer.container.clientHeight / 2 });
        }
        //else
        //console.log("当前没有选中对象");
    }

    active() {
        //这里使用camerachanged事件尝试此功能
        this.viewer.camera.changed.addEventListener(this._handlecamerachanged)
        this.viewer.camera.percentageChanged = 0.1;
    }

    deactive() {
        // this.maphanders.forEach((i) => i.destroy());
        // this.maphanders = [];
        this.viewer.camera.changed.removeEventListener(this._handlecamerachanged)
        this.viewer.camera.percentageChanged = 0.5;


        //this.handleentyunhighlight();
    }



}


















