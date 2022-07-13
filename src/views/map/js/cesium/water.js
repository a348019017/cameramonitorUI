



//传入多边形的点或者polygonGeometry，构造成pimitive返回
export function drawWater(polygonGeometry, element) {
    //this.viewer.scene.globe.depthTestAgainstTerrain = false;

    var waterPrimitive = new Cesium.Primitive({
        show: true,// 默认隐藏
        allowPicking: false,
        geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.PolygonGeometry({
                polygonHierarchy: polygonGeometry,
                extrudedHeight: element.style.extrudedHeight != undefined ? element.style.extrudedHeight : undefined,//注释掉此属性可以只显示水面
                perPositionHeight: element.style.perPositionHeight != undefined ? element.style.perPositionHeight : true//注释掉此属性水面就贴地了
            })
        }),
        // 可以设置内置的水面shader
        appearance: new Cesium.EllipsoidSurfaceAppearance({
            material: new Cesium.Material({
                fabric: {
                    type: 'Water',
                    uniforms: {
                        //baseWaterColor:new Cesium.Color(0.0, 0.0, 1.0, 0.5),
                        //blendColor: new Cesium.Color(0.0, 0.0, 1.0, 0.5),
                        //specularMap: 'gray.jpg',
                        normalMap: '/static/images/waterNormals.jpg',
                        frequency: 1000.0,
                        animationSpeed: 0.01,
                        amplitude: 10.0
                    }
                }
            }),
            fragmentShaderSource: `varying vec3 v_positionMC;
            varying vec3 v_positionEC;
            varying vec2 v_st;
            
            void main()
            {
                czm_materialInput materialInput;
            
                vec3 normalEC = normalize(czm_normal3D * czm_geodeticSurfaceNormal(v_positionMC, vec3(0.0), vec3(1.0)));
            #ifdef FACE_FORWARD
                normalEC = faceforward(normalEC, vec3(0.0, 0.0, 1.0), -normalEC);
            #endif
            
                materialInput.s = v_st.s;
                materialInput.st = v_st;
                materialInput.str = vec3(v_st, 0.0);
            
                // Convert tangent space material normal to eye space
                materialInput.normalEC = normalEC;
                materialInput.tangentToEyeMatrix = czm_eastNorthUpToEyeCoordinates(v_positionMC, materialInput.normalEC);
            
                // Convert view vector to world space
                vec3 positionToEyeEC = -v_positionEC;
                materialInput.positionToEyeEC = positionToEyeEC;
            
                czm_material material = czm_getMaterial(materialInput);
            
            #ifdef FLAT
                gl_FragColor = vec4(material.diffuse + material.emission, material.alpha);
            #else
                gl_FragColor = czm_phong(normalize(positionToEyeEC), material, czm_lightDirectionEC);
                gl_FragColor.a=0.5;
            #endif
            }` //重写shader，修改水面的透明度,摘至EllipsoidSurfaceAppearance的shader效果
        })
    });
    //viewer.scene.primitives.add(waterPrimitive);
    return waterPrimitive;
}


