import { stringFormat } from "../util"

//修改3dtile的渐变显示效果，提示包含动态光环,由图层的参数指定minheight等
export default function set3dtileset(tiles, element) {

  let shader = `
        varying vec3 v_positionEC;
         void main(void){
           vec4 position = czm_inverseModelView * vec4(v_positionEC,1); // 位置
           float glowRange = {0}; // 光环的移动范围(高度)
           gl_FragColor = vec4(0.0, 0.3, 0.8, 0.8); // 颜色1
          //  gl_FragColor = vec4(220.0, 0.3, 0.8, 0.8); // 颜色2
           // 低于10米的楼不显示渐变色
           gl_FragColor *= vec4(vec3((position.{1}-{2}) / {0}), 0.8); // 渐变
           // 设置动态光环
           float time = fract(czm_frameNumber / 36.0);
           time = abs(time - 0.5) * 3.0;
           float diff = step(0.005, abs( clamp((position.{1}-{2}) / glowRange, 0.0, 1.0) - time));
           gl_FragColor.rgb += gl_FragColor.rgb * (1.0 - diff);
           gl_FragColor.a=0.6;
         }
         `
  let updatetile = function (tile) {
    let content = tile.content
    for (let i = 0; i < content.featuresLength; i++) {
      let feature = content.getFeature(i)

      let model = feature.content._model
      if (
        shader &&
        model &&
        model._sourcePrograms &&
        model._rendererResources
      ) {
        Object.keys(model._sourcePrograms).forEach(key => {
          let program = model._sourcePrograms[key]
          model._rendererResources.sourceShaders[
            program.fragmentShader
          ] = shader
        })
        model._shouldRegenerateShaders = true
      }
    }
  }
  if (element && element.style && element.style.type === "graduaflash") {
    let maxheight = element.style.maxheight ? element.style.maxheight : 10.01;
    let minheight = element.style.minheight ? element.style.minheight : 0.02;
    let height = maxheight - minheight;
    let axies = element.style.gltfUpAxis ? element.style.gltfUpAxis : "y";
    shader = stringFormat(shader, height, axies, minheight);

    tiles.tileVisible.removeEventListener(updatetile);
    tiles.tileVisible.addEventListener(updatetile);
  } else {
    tiles.tileVisible.removeEventListener(updatetile);
  }
}
