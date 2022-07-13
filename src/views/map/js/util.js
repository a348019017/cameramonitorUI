import cesiumloader from "./cesiumloader";
import * as turf from "@turf/turf"


export function stringFormat() {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i++) {
        var reg = new RegExp("\\{" + i + "\\}", "gm");
        s = s.replace(reg, arguments[i + 1]);
    }
    return s;
}

//艺维度转换成二维数组
export function arrTrans(num, arr) { // 一维数组转换为二维数组
    const iconsArr = []; // 声明数组
    arr.forEach((item, index) => {
        const page = Math.floor(index / num); // 计算该元素为第几个素组内
        if (!iconsArr[page]) { // 判断是否存在
            iconsArr[page] = [];
        }
        iconsArr[page].push(item);
    });
    return iconsArr;
}

export function clone(data) {
    let model = {};

    for (let item in data) {
        if (data[item] instanceof Array) {
            model[item] = new Array();
            for (let i = 0; i < data[item].length; i++) {

                model[item].push(clone(data[item][i]));
            }
        } else {
            model[item] = data[item];
        }

    }
    return model;
}


export function datedifference(sDate1, sDate2) {    //sDate1和sDate2是2006-12-18格式 
    var dateSpan,
        tempDate,
        iDays;
    sDate1 = Date.parse(sDate1);
    sDate2 = Date.parse(sDate2);
    dateSpan = sDate2 - sDate1;
    dateSpan = Math.abs(dateSpan);
    iDays = Math.floor(dateSpan / (24 * 3600 * 1000));
    return iDays
};

//统一传入日期型
export function addDate(date, days) {
    // if (days == undefined || days == '') {
    //     days = 1;
    // }
    var date = new Date(date);
    date.setDate(date.getDate() + days);
    var month = date.getMonth() + 1;
    var day = date.toLocaleDateString();
    return day;
}


export function GUID() {
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}
function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}



//通过一群点查找最贴近的平面，在根据顺逆时针决定其法向量的方向，用于裂缝面或线的自动定位
export function plane_from_points(points, viewer, layeritem) {

    //reversepoinst checkout the dir result
    //points = points.reverse()


    if (points.length < 3) {
        return null; // At least three points required
    }
    //计算其中心，
    let sumx = 0;
    let sumy = 0;
    let sumz = 0;
    for (let index = 0; index < points.length; index++) {
        const element = points[index];
        sumx += element.x;
        sumy += element.y;
        sumz += element.z;
    }
    let centroid = new Cesium.Cartesian3(sumx / points.length, sumy / points.length, sumz / points.length);


    //取前三个点计算其法向量，

    // Calc full 3x3 covariance matrix, excluding symmetries:
    let xx = 0.0; let xy = 0.0; let xz = 0.0;
    let yy = 0.0; let yz = 0.0; let zz = 0.0;

    for (const p in points) {
        let r = Cesium.Cartesian3.subtract(points[p], centroid, new Cesium.Cartesian3());
        xx += r.x * r.x;
        xy += r.x * r.y;
        xz += r.x * r.z;
        yy += r.y * r.y;
        yz += r.y * r.z;
        zz += r.z * r.z;
    }


    let det_x = yy * zz - yz * yz;
    let det_y = xx * zz - xz * xz;
    let det_z = xx * yy - xy * xy;

    let det_max = Math.max(det_x, det_y, det_z);
    if (det_max <= 0.0) {
        return null; // The points don't span a plane
    }

    // Pick path with best conditioning:
    let dir = new Cesium.Cartesian3();
    if (det_max == det_x) {
        dir.x = det_x;
        dir.y = xz * yz - xy * zz;
        dir.z = xy * yz - xz * yy;
    } else if (det_max == det_y) {
        dir.x = xz * yz - xy * zz;
        dir.y = det_y;
        dir.z = xy * xz - yz * xx;
    } else {
        dir.x = xy * yz - xz * yy;
        dir.y = xy * xz - yz * xx;
        dir.z = det_z;
    };


    // //取前三个点计算法向量
    // let ab = Cesium.Cartesian3.subtract(points[0], points[1], new Cesium.Cartesian3());
    // let bc = Cesium.Cartesian3.subtract(points[2], points[1], new Cesium.Cartesian3());
    // let sysabc = Cesium.Cartesian3.cross(ab, bc, new Cesium.Cartesian3());
    let normaldir = Cesium.Cartesian3.normalize(dir, new Cesium.Cartesian3());
    //let isinvertdir = Cesium.Cartesian3.dot(sysabc, dir) >= 0 ? normaldir : Cesium.Cartesian3.negate(normaldir, new Cesium.Cartesian3());

    //这里的dir似乎并没有考虑顺时针逆时针的情况，我们希望通过点的顺逆时针方向来决定法向量的正负
    return get_plane_normal(viewer, { center: centroid, dir: normaldir }, layeritem)

}


//通过viewer的pickfromray来决定normal的正负号，以此来判断裂缝在模型的哪一面，这里不知道能否获取face的normal
export function get_plane_normal(viewer, plane, layeritem) {
    var center = plane.center;
    var ray1 = new Cesium.Ray(center, plane.dir);
    var ray2 = new Cesium.Ray(center, Cesium.Cartesian3.negate(plane.dir, new Cesium.Cartesian3()));
    //这里要传入非3dtile的实体，这不确定这么实现
    var result1 = viewer.scene.pickFromRay(ray1, layeritem.entities);
    var result2 = viewer.scene.pickFromRay(ray2, layeritem.entities);
    //如果都有相交，那么中心点在模型模型内，取距离较小的范围为
    if (result1 && result2) {
        let dis1 = Cesium.Cartesian3.distance(result1.position, center);
        let dis2 = Cesium.Cartesian3.distance(result2.position, center);

        //
        if (result1.object == result2.object) {
            if (dis1 > dis2) {
                plane.dir = Cesium.Cartesian3.negate(plane.dir, new Cesium.Cartesian3());
            }
        } else {
            if (dis1 < dis2) {
                plane.dir = Cesium.Cartesian3.negate(plane.dir, new Cesium.Cartesian3());
            }
        }

    } else if (result1 && !result2) {
        plane.dir = Cesium.Cartesian3.negate(plane.dir, new Cesium.Cartesian3());
    }
    //如果没有交点，那么返回的就是面的正确方向,不作修改正常返回
    else {

    }
    return plane;
}

