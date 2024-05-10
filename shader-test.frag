// #ifdef GL_ES
// precision mediump float;
// #endif

// uniform vec4 bg_color;

// uniform float right_axis_x;
// uniform float right_axis_y;

// uniform float left_axis_x;
// uniform float left_axis_y;

// uniform float rt;
// uniform float lt;


// Star Nest by Pablo Roman Andrioli
// License: MIT
// uniform vec2 u_resolution;
// uniform vec2 u_mouse;
// uniform float u_time;

// #define iterations 17
// #define formuparam 0.53

// #define volsteps 20
// #define stepsize 0.1

// #define zoom   0.800
// #define tile   0.850
// #define speed  0.010

// #define brightness 0.0015
// #define darkmatter 0.300
// #define distfading 0.730
// #define saturation 0.850

//**********************************************************
//color shifting
// void main() {
// 	vec2 st = gl_FragCoord.xy/u_resolution;
// 	// gl_FragColor = vec4(abs(sin(u_time))*st.x,
//     //                     (abs(sin(u_time)))*st.y,
//     //                     abs(sin(u_time) * 0.25),
//     //                     abs(sin(u_time) * 0.75));
// 	gl_FragColor = vec4(left_axis_y,
//                         bg_color.g,
//                         left_axis_x,
//                         1.0);
// }
//**********************************************************

// void main()
// {
// 	//get coords and direction
// 	vec2 uv=gl_FragCoord.xy/u_resolution.xy-.5;
// 	uv.y*=u_resolution.y/u_resolution.x;
// 	vec3 dir=vec3(uv*zoom,1.);
// 	float time=u_time*speed+.25;

// 	//mouse rotation
// 	float a1=.5+u_mouse.x/u_resolution.x*2.;
// 	float a2=.8+u_mouse.y/u_resolution.y*2.;
// 	mat2 rot1=mat2(cos(a1),sin(a1),-sin(a1),cos(a1));
// 	mat2 rot2=mat2(cos(a2),sin(a2),-sin(a2),cos(a2));
// 	dir.xz*=rot1;
// 	dir.xy*=rot2;
// 	vec3 from=vec3(1.,.5,0.5);
// 	from+=vec3(time*2.,time,-2.);
// 	from.xz*=rot1;
// 	from.xy*=rot2;

// 	//volumetric rendering
// 	float s=0.1,fade=1.;
// 	vec3 v=vec3(0.);
// 	for (int r=0; r<volsteps; r++) {
// 		vec3 p=from+s*dir*.5;
// 		p = abs(vec3(tile)-mod(p,vec3(tile*2.))); // tiling fold
// 		float pa,a=pa=0.;
// 		for (int i=0; i<iterations; i++) {
// 			p=abs(p)/dot(p,p)-formuparam; // the magic formula
// 			a+=abs(length(p)-pa); // absolute sum of average change
// 			pa=length(p);
// 		}
// 		float dm=max(0.,darkmatter-a*a*.001); //dark matter
// 		a*=a*a; // add contrast
// 		if (r>6) fade*=1.-dm; // dark matter, don't render near
// 		//v+=vec3(dm,dm*.5,0.);
// 		v+=fade;
// 		v+=vec3(s,s*s,s*s*s*s)*a*brightness*fade; // coloring based on distance
// 		fade*=distfading; // distance fading
// 		s+=stepsize;
// 	}
// 	v=mix(vec3(length(v)),v,saturation); //color adjust
// 	gl_FragColor = vec4(v*.01,1.);

// }

// precision mediump float;

// float random(float p) {
//   return fract(sin(p)*10000.);
// }

// float noise(vec2 p) {
//   return random(p.x + p.y*10000.);
// }

// void main() {
// 	vec2 p = gl_FragCoord.xy/u_resolution.xy;
//   	float brightness = noise(p);
//   	gl_FragColor = vec4(vec3(brightness), 1.0);
// 	gl_FragColor.a = 1.;
// }

//**********************************************************************
// weird murky grayness
//**********************************************************************
// float random(float p) {
//   return fract(sin(p)*10000.);
// }

// float noise(vec2 p) {
//   return random(p.x + p.y*10000.);
// }

// vec2 sw(vec2 p) {return vec2( floor(p.x) , floor(p.y) );}
// vec2 se(vec2 p) {return vec2( ceil(p.x)  , floor(p.y) );}
// vec2 nw(vec2 p) {return vec2( floor(p.x) , ceil(p.y)  );}
// vec2 ne(vec2 p) {return vec2( ceil(p.x)  , ceil(p.y)  );}

// float smoothNoise(vec2 p) {
//   vec2 inter = smoothstep(0., 1., fract(p));
//   float s = mix(noise(sw(p)), noise(se(p)), inter.x);
//   float n = mix(noise(nw(p)), noise(ne(p)), inter.x);
//   return mix(s, n, inter.y);
//   return noise(nw(p));
// }

// float movingNoise(vec2 p) {
//   float total = 0.0;
//   total += smoothNoise(p     - u_time);
//   total += smoothNoise(p*2.  + u_time) / 2.;
//   total += smoothNoise(p*4.  - u_time) / 4.;
//   total += smoothNoise(p*8.  + u_time) / 8.;
//   total += smoothNoise(p*16. - u_time) / 16.;
//   total /= 1. + 1./2. + 1./4. + 1./8. + 1./16.;
//   return total;
// }

// float nestedNoise(vec2 p) {
//   float x = movingNoise(p);
//   float y = movingNoise(p + 100.);
//   return movingNoise(p + vec2(x, y));
// }

// void main() {
//   vec2 position = gl_FragCoord.xy/u_resolution.xy;
//   vec2 p = position * 6.;
//   float brightness = nestedNoise(p);
//   gl_FragColor.rgb = vec3(brightness);
//   gl_FragColor.a = 1.;
// }


#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

uniform float leftJoystick_x; // Left joystick x-axis (-1 to 1)
uniform float leftJoystick_y; // Left joystick y-axis (-1 to 1)
uniform float rightJoystick_x; // Right joystick x-axis (-1 to 1)
uniform float rightJoystick_y; // Right joystick y-axis (-1 to 1)

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    // Calculate center of the screen
    vec2 center = vec2(0.5);
    
    // Offset UV by center
    uv -= center;
    
    // Scale UV based on aspect ratio
    uv.x *= u_resolution.x / u_resolution.y;
    
    // Apply joystick input to UV
    uv += vec2(rightJoystick_x, rightJoystick_y) * 0.1 * u_time; // Right joystick controls speed and direction
    uv += vec2(leftJoystick_x, leftJoystick_y) * 0.01 * u_time; // Left joystick controls starfield movement
    
    // Adjust zoom based on left joystick y-axis
    float zoomFactor = 1.0 - clamp(leftJoystick_y, -1.0, 1.0) * 0.5;
    uv *= zoomFactor;
    
    // Calculate distance from center
    float dist = length(uv);
    
    // Create starfield effect with moving stars
    float starField = 0.0;
    // float numStars = 100.0;
    for (float i = 0.0; i < 100.0; i+=1.0) {
        // Random position for each star
        vec2 starPos = vec2(mod(23.0 * i * u_time, 1.0), mod(17.0 * i, 1.0));
        
        // Calculate distance from star
        float starDist = length(uv - starPos * 2.0);
        
        // Add brightness to star
        starField += smoothstep(0.005, 0.001, abs(fract(sin(starDist) * 43758.5453)));
    }
    
    // Create color gradient
    vec3 color = vec3(0.0);
    color = mix(vec3(0.0, 0.0, 0.1), vec3(0.0, 0.0, 0.5), uv.y + 0.5);
    
    // Add starfield effect
    color += vec3(starField * 0.5);
    
    // Output final color
    gl_FragColor = vec4(color, 1.0);
}
