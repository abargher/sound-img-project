
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform vec4 bg_color;

void main() {
	vec2 st = gl_FragCoord.xy/u_resolution;
	// gl_FragColor = vec4(abs(sin(u_time))*st.x,
    //                     (abs(sin(u_time)))*st.y,
    //                     abs(sin(u_time) * 0.25),
    //                     abs(sin(u_time) * 0.75));
	gl_FragColor = vec4(bg_color.rgb, 1.0);
}
