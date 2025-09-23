export const frag = `#ifdef GL_ES
precision highp float;
#endif

#define PI 3.14159265359 // Define PI for convenience

uniform vec2 iResolution; // viewport resolution (width, height)
uniform float iTime;      // shader playback time (in seconds)
uniform vec2 iMouse;     // Not used in your snippets, but available if you need it

// Uniform to select which shader variant to run (set from p5.js)
uniform int u_shader_choice;

// Passed from the vertex shader, typically 0-1 for texture coordinates
varying vec2 vTexCoord;

// Custom tanh function for GLSL ES 1.00 compatibility
float custom_tanh(float x) {
    // tanh(x) = (exp(x) - exp(-x)) / (exp(x) + exp(-x))
    // Add a small epsilon to denominator to prevent division by zero for very large negative x
    float exp_x = exp(x);
    float exp_neg_x = exp(-x);
    return (exp_x - exp_neg_x) / (exp_x + exp_neg_x + 1e-6); // Added epsilon
}

// Helper function for 2D rotation (used by many snippets)
mat2 rotate2D(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat2(c, -s, s, c);
}

// Helper function for 3D rotation (used by the initial 'Code00' variant)
mat3 rotate3D(float angle, vec3 axis) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c; // One minus cosine
    return mat3(
        axis.x * axis.x * oc + c,       axis.x * axis.y * oc - axis.z * s,  axis.x * axis.z * oc + axis.y * s,
        axis.y * axis.x * oc + axis.z * s,  axis.y * axis.y * oc + c,       axis.y * axis.z * oc - axis.x * s,
        axis.z * axis.x * oc - axis.y * s,  axis.z * axis.y * oc + axis.x * s,  axis.z * axis.z * oc + c
    );
}

void main() {
    vec3 r = vec3(iResolution.x, iResolution.y, iResolution.y);
    float t = iTime;          // iTime (shader playback time)

    vec4 o = vec4(0.0); // Accumulator for final color, initialized to black
    vec2 fragCoord_p5 = gl_FragCoord.xy;

    // --- SHADER LOGIC BRANCHES ---
    // Use u_shader_choice to select the active shader variant.
    // Each 'if' block contains the logic for one specific shader variant.

    // Code 00: The original shader from previous conversation
	float z_local;
	float d_local;
	//float i_local; // Declared here for the outer loop

	z_local = 3.0; // Initialize z_local for this variant before the loop
	for(float i_local = 0.0; i_local < 100.0; i_local++) {
		vec3 simulated_FC_rgb = vec3(fragCoord_p5.xy, 0.0);
		vec3 p = z_local * (simulated_FC_rgb * 2.0 - r.xyy) / r.y;
		vec3 v = p; // 'v' is declared but not used in the original snippet beyond initialization

		// Manual unroll for: for(d=1.;d<3e1;d/=.7)p+=.3*sin(p*rotate3D(d,r.xyy)*d+t)/d;
		float d_unrolled;

		d_unrolled = 1.0;     if(d_unrolled < 30.0) p += 0.3 * sin(p * rotate3D(d_unrolled, r.xyy) * d_unrolled + t) / d_unrolled;
		d_unrolled = 1.42857; if(d_unrolled < 30.0) p += 0.3 * sin(p * rotate3D(d_unrolled, r.xyy) * d_unrolled + t) / d_unrolled;
		d_unrolled = 2.04082; if(d_unrolled < 30.0) p += 0.3 * sin(p * rotate3D(d_unrolled, r.xyy) * d_unrolled + t) / d_unrolled;
		d_unrolled = 2.91546; if(d_unrolled < 30.0) p += 0.3 * sin(p * rotate3D(d_unrolled, r.xyy) * d_unrolled + t) / d_unrolled;
		d_unrolled = 4.16494; if(d_unrolled < 30.0) p += 0.3 * sin(p * rotate3D(d_unrolled, r.xyy) * d_unrolled + t) / d_unrolled;
		d_unrolled = 5.94991; if(d_unrolled < 30.0) p += 0.3 * sin(p * rotate3D(d_unrolled, r.xyy) * d_unrolled + t) / d_unrolled;
		d_unrolled = 8.49987; if(d_unrolled < 30.0) p += 0.3 * sin(p * rotate3D(d_unrolled, r.xyy) * d_unrolled + t) / d_unrolled;
		d_unrolled = 12.14267; if(d_unrolled < 30.0) p += 0.3 * sin(p * rotate3D(d_unrolled, r.xyy) * d_unrolled + t) / d_unrolled;
		d_unrolled = 17.34667; if(d_unrolled < 30.0) p += 0.3 * sin(p * rotate3D(d_unrolled, r.xyy) * d_unrolled + t) / d_unrolled;
		d_unrolled = 24.78096; if(d_unrolled < 30.0) p += 0.3 * sin(p * rotate3D(d_unrolled, r.xyy) * d_unrolled + t) / d_unrolled;

		// The assignment to d_local inside the += operation for z_local is tricky.
		// d_local takes the value of the max expression.
		z_local += d_local = 0.01 + 0.4 * max(d_local = p.y + p.z * 0.5 + 2.0, -d_local * 0.1);
		o += 1.2 / d_local / z_local; // Original loop_expression moved into body
	}
	vec4 temp_o = o / vec4(9.0, 6.0, 3.0, 1.0) / 200.0;
	o = vec4(custom_tanh(temp_o.x), custom_tanh(temp_o.y), custom_tanh(temp_o.z), custom_tanh(temp_o.w));

    // Final output color
    gl_FragColor = o;
}
`

export const vert = `#ifdef GL_ES
precision highp float;
#endif

// Vertex attributes
attribute vec3 aPosition;
attribute vec2 aTexCoord;

// Pass-through to the fragment shader
varying vec2 vTexCoord;

void main() {
    // Pass texture coordinates to the fragment shader
    vTexCoord = aTexCoord;

    // Transform the position into normalized device coordinates (NDC)
    vec4 positionVec4 = vec4(aPosition, 1.0);

    // Scale and shift to NDC (Normalize Device Coordinate) range [-1, 1]
    positionVec4.xy = positionVec4.xy * 2.0 - 1.0;

    // Set the final position of the vertex
    gl_Position = positionVec4;
}
`