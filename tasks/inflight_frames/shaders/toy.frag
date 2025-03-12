#version 450
#extension GL_ARB_separate_shader_objects : enable

struct Params
{
  uvec2 iResolution;
  uvec2 iMouse;
  float iTime;
};

layout(location = 0) out vec4 fragColor;

layout(binding = 0) uniform sampler2D colorTex;
layout(binding = 1) uniform sampler2D fileTex;
layout(binding = 2, set = 0) uniform AppData
{
  Params params;
};

float sphereSDF(in vec3 p, in float r)
{
    return length(p) - r +0.5;
}

float torusSDF(vec3 p, vec2 t) {
    vec2 q = vec2(length(p.xy) - t.x, p.z);
    return length(q) - t.y;
}

float sdf(in vec3 p)
{
    float angle = params.iTime;
    float c = sin(angle);
    float s = cos(angle);
        
    vec3 rotatedP = vec3(p.x + s, p.y * c - p.z * s, p.y * s + p.z * c);
    return min(torusSDF(rotatedP, vec2(1.0, 0.3)), torusSDF(rotatedP, vec2(2.0, 0.3)));
}

#define TRACE_ITER_LIM 100
#define EPS 0.01

vec3 raytrace(vec3 from, vec3 dir, out bool hit)
{
    vec3 p = from;
    float dist = 0.0;
    hit = false;
    
    for (int steps = 0; steps <  TRACE_ITER_LIM; ++steps)
    {
        float d = sdf(p);
        if (d < EPS)
        {
            hit = true;
            break;
        }
        dist += d;
        p += d * dir;
    }
    return p;
}
vec3 get_normal(vec3 p)
{
    float h = EPS;
    vec3 n = vec3(
        sdf(p + vec3(h, 0, 0)) - sdf(p - vec3(h, 0, 0)),
        sdf(p + vec3(0, h, 0)) - sdf(p - vec3(0, h, 0)),
        sdf(p + vec3(0, 0, h)) - sdf(p - vec3(0, 0, h))
    );
    return normalize(n);
}

vec2 pixel_offset(vec2 coord)
{
    return (coord - params.iResolution.xy * 0.5) / params.iResolution.x;
}

#define AMBIENT_LIGHT 0.3
vec3 light_pos = vec3(0.0, 0.0, -4.0);
vec3 diffuse_color = vec3(1.0, 0.5, 2.0);

vec3 phong_lighting(vec3 p, vec3 normal, vec3 dir) {
    vec3 light_dir = normalize(light_pos - p);
    
    vec3 ambient = AMBIENT_LIGHT * vec3(0.5, 0.5, 0.5);
    
    float diff = max(dot(normal, light_dir), 0.0);
    vec3 diffuse = diff * diffuse_color;
    
    vec3 reflect_dir = reflect(-light_dir, normal);
    float spec = pow(max(dot(dir, reflect_dir), 0.0), 32.0);
    vec3 specular = spec * vec3(1.0);
    
    return (ambient + diffuse + specular);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = pixel_offset(fragCoord);
    vec3 camera_offset = vec3(0, 0, -4);
    vec3 dir = normalize(vec3(uv.x, uv.y, 1));
    
    bool hit = false;
    vec3 col = vec3(0, 0, 0);
    vec3 p = raytrace(camera_offset, dir, hit);
    if (hit)
    {
        col = phong_lighting(p, get_normal(p), dir);
    }

    fragColor = vec4(0.5 * col,1.0);
}

void main()
{
  vec2 fragCoord = vec2(gl_FragCoord).xy;
  vec2 uv = pixel_offset(fragCoord);
  vec3 camera_offset = vec3(0, 0, -4);
  vec3 dir = normalize(vec3(uv.x, uv.y, 1));
    
  bool hit = false;
  vec3 col = vec3(0, 0, 0);
  vec3 p = raytrace(camera_offset, dir, hit);
  vec4 fragColor_test = vec4(vec3(0.), 1.);
  if (hit)
  {
	  vec3 n = get_normal(p);
      vec3 w = abs(n);
      col = phong_lighting(p, get_normal(p), dir);
	  vec3 texel1 =
            w.x * textureLod(colorTex, vec2(0.5) + 1.5 * p.yz, 0).rgb +
            w.y * textureLod(colorTex, vec2(0.5) + 1.5 * p.xz, 0).rgb +
            w.z * textureLod(colorTex, vec2(0.5) + 1.5 * p.xy, 0).rgb;
		vec3 texel2 =
            w.x * textureLod(fileTex, vec2(0.5) + 0.35 * p.yz, 0).rgb +
            w.y * textureLod(fileTex, vec2(0.5) + 0.35 * p.xz, 0).rgb +
            w.z * textureLod(fileTex, vec2(0.5) + 0.35 * p.xy, 0).rgb;
	
		fragColor_test = vec4(0.5 * col,1.0);
		fragColor_test = fragColor_test * vec4(texel1, 1.0) * vec4(texel2, 1.0);
  }
	fragColor = fragColor_test;
}