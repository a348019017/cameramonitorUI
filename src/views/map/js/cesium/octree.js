
//管理场景的四叉树，用于视锥体裁切等，这里先实现个基本的
export class Octree {
    constructor() {
        this.data = [];
    }



    addDatas() {

    }

    clear() {
        this.data = [];
    }

    addData(box, data, sphere) {
        this.data.push({ box: box, data: data, sphere: sphere });
    }

    //根据相机的位置计算符合要求的entity，返回最近的一个或者遍历的第一个
    cameraIntersectFirst(camera, tollerance) {
        var _tollerance = tollerance || 0.5;
        this.data.forEach(i => {
            i.distance = i.sphere.distanceSquaredTo(camera.positionWC)
        });
        //由小到大排序
        let filterdata = this.data.filter(i => {
            return i.distance <= _tollerance;
        }).sort((a, b) => {
            return a.distance - b.distance
        });
        if (filterdata && filterdata.length >= 1)
            return filterdata[0].data;
        else
            return undefined;
    }
}
