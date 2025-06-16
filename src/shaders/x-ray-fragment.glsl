#include <common>

uniform sampler2D tDiffuse;
uniform sampler2D tDiffuse1;
uniform vec2 resolution;
varying vec2 vUv;
uniform vec2 uMouse;
uniform vec2 uViewportRes;
uniform float expand;

vec2 coverUvs(vec2 imageRes,vec2 containerRes,vec2 vUv)
{
    float imageAspectX = imageRes.x/imageRes.y;
    float imageAspectY = imageRes.y/imageRes.x;
    
    float containerAspectX = containerRes.x/containerRes.y;
    float containerAspectY = containerRes.y/containerRes.x;

    vec2 ratio = vec2(
        min(containerAspectX / imageAspectX, 1.0),
        min(containerAspectY / imageAspectY, 1.0)
    );

    vec2 newUvs = vec2(
        vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
        vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );

    return newUvs;
}

void main()
{
    vec2 texel = vec2( 1.0 / resolution.x, 1.0 / resolution.y );

        
    //vec2 squareUvs = coverUvs(vec2(1.),uViewportRes);
    vec2 squareUvs = coverUvs(vec2(1.),uViewportRes,vUv);
    vec2 squareMouse = coverUvs(vec2(1.),uViewportRes,uMouse);
    float side = 0.25 + expand;
    vec2 offset = vec2(squareMouse-side*0.5);

    float square = step(offset.x,squareUvs.x) * (1.-step(side+offset.x,squareUvs.x))
    *step(offset.y,squareUvs.y) * (1.-step(side+offset.y,squareUvs.y));


    vec4 t = texture2D(tDiffuse,vUv);
    
    vec4 t1 = texture2D(tDiffuse1,vUv);    

    t.rgb*=6.;    

    
    vec4 bodyLayer = t1;
    bodyLayer.r = ceil(bodyLayer.r);
    bodyLayer.g = ceil(bodyLayer.g); 
    bodyLayer.b = ceil(bodyLayer.b); 

    t = t + bodyLayer*0.05;

    if(t1.a == 0.) t1.rgb = vec3(1.);
    
    gl_FragColor = square*t + (1.-square)*t1;

    // #include <colorspace_fragment>
}