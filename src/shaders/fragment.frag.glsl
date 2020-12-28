// precision highp float;
// precision mediump sampler3D;

// uniform float u_N;

// uniform sampler3D u_data;

// varying vec3 v_camera;
// varying vec3 v_position;

// const vec3 COLOR = vec3(0., 0., 1.);

// float sample_density(vec3 texcoords) {
//     vec3 uv = ((texcoords + 1.0) * (u_N-2.0) + 1.0) / (2.0 * (u_N-1.0));
//     /* Sample float value from a 3D texture. Assumes intensity data. */
//     return texture(u_data, uv).r;
// }

// vec4 apply_colormap(float val) {
//     return vec4(COLOR * (val), pow(val, 0.2));
// }

// void main() {
//     // Calculate unit vector pointing in the view direction through this fragment.
//     float value = sample_density(v_position);

//     gl_FragColor = apply_colormap(value);//vec4((COLOR * (1.0 - texture2D(u_data,gl_PointCoord.xy).x)), texture2D(u_data, gl_PointCoord.xy).x); // apply_colormap(value);
//     // apply_colormap(texture(u_data, vec3(v_position.xy, 0.0)).r);
// }

// Modified from Three.js examples
//
// Original source:
// https://github.com/mrdoob/three.js/blob/master/examples/js/shaders/VolumeShader.js
// MIT License: 2010-2019 three.js authors
//
// This does not use the depthbuffer.
// Better visualisations should use the depthbuffer.
precision highp float;
precision highp int;
precision highp sampler2D;

uniform sampler2D u_data;
uniform vec2 u_size;
varying vec2 vUv;

vec2 rotate(vec2 pt, float theta, float aspect){
  float c = cos(theta);
  float s = sin(theta);
  mat2 mat = mat2(c, s, -s, c);
  pt.y /= aspect;
  pt = mat * pt;
  pt.y *= aspect;
  return pt;
}

void main() {
  //vec2 center = vec2(0.5);
  //vec2 uv = rotate(vUv - center, 0.0, 2.0/1.5) + center;
  vec2 uv = gl_FragCoord.xy/u_size.xy;
  vec4 color = texture( u_data, uv );

  // lighten a bit
  gl_FragColor = vec4(color.rrr, 1.0);

}

// precision highp float;
// precision mediump sampler3D;

// uniform float u_rows;
// uniform float u_cols;

// uniform sampler3D u_data;

// varying vec3 v_camera;
// varying vec3 v_position;

// const int MAX_STEPS = 128;
// const float relative_step_size = 2.0 * 1.73 / float(MAX_STEPS);
// const vec3 COLOR = vec3(0.7804, 0.3176, 0.051);

// float sample_density(vec3 texcoords) {
//   vec3 uv = ((texcoords + 5.0) * (u_rows) + 1.0) / (10.0 * (u_rows));
//   // vec3 uv = vec3(
//   //   ((texcoords.x + 5.0) * (u_rows) + 1.0) / (10.0 * (u_rows)),
//   //   ((texcoords.y + 5.0) * (u_cols) + 1.0) / (10.0 * (u_cols)),
//   //   texcoords.z
//   // );
//   /* Sample float value from a 3D texture. Assumes intensity data. */
//   return textureProj(u_data, uv);
// }

// vec4 apply_colormap(float val) {
//   // return vec4(vec3(fbm(v_position.xy))*val, 1. + pow(val, -0.2));
//   // return vec4(val*noise(vec2(val)), 0., exp(val)-1., 1. + pow(val, -0.2));
//   return vec4(COLOR*val, 1.);
//   // return vec4(sin(val), 0., cos(val), 1. + pow(val, -0.2));
// }

// void main() {
//   // Calculate unit vector pointing in the view direction through this fragment.
// //   vec3 view_ray = normalize(v_camera - v_position);

// //   vec3 step = relative_step_size * normalize(view_ray);

//   float value = sample_density(v_position);
//   gl_FragColor = apply_colormap(value);
// }
