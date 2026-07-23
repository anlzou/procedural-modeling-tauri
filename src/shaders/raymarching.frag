precision highp float;
uniform float uTime;
uniform vec2 uResolution;
varying vec2 vUv;

// ---- SDF Primitives ----
float sdSphere(vec3 p, float r) { return length(p) - r; }
float sdBox(vec3 p, vec3 b) {
    vec3 d = abs(p) - b;
    return min(max(d.x, max(d.y, d.z)), 0.0) + length(max(d, 0.0));
}
float sdTorus(vec3 p, vec2 t) {
    vec2 q = vec2(length(p.xz) - t.x, p.y);
    return length(q) - t.y;
}
float sdCylinder(vec3 p, vec3 c) { return length(p.xz - c.xy) - c.z; }

// ---- Boolean Operations ----
float opUnion(float a, float b) { return min(a, b); }
float opIntersection(float a, float b) { return max(a, b); }
float opSubtraction(float a, float b) { return max(-a, b); }
float opSmoothUnion(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

// ---- Domain Operations ----
float opTwist(vec3 p, float k) {
    float c = cos(k * p.y), s = sin(k * p.y);
    vec3 q = vec3(c * p.x - s * p.z, p.y, s * p.x + c * p.z);
    return sdBox(q, vec3(0.5));
}
float opDisplace(vec3 p, float d) {
    return d + sin(3.0 * p.x) * sin(3.0 * p.y) * sin(3.0 * p.z) * 0.1;
}

// ---- Mandelbulb Fractal ----
float mandelbulb(vec3 p) {
    vec3 z = p; float dr = 1.0, r = 0.0;
    for (int i = 0; i < 6; i++) {
        r = length(z); if (r > 2.0) break;
        float theta = acos(z.z / r) * 8.0, phi = atan(z.y, z.x) * 8.0, zr = pow(r, 8.0);
        dr = pow(r, 7.0) * 8.0 * dr + 1.0;
        z = zr * vec3(sin(theta) * cos(phi), sin(theta) * sin(phi), cos(theta)) + p;
    }
    return 0.5 * log(r) * r / dr;
}

// ---- Scene (single scene) ----
float scene(vec3 p) {
    float t = uTime * 0.3;
    vec3 spherePos = vec3(sin(t) * 1.5, sin(t * 0.7) * 0.5, 0.0);
    float sphere = sdSphere(p - spherePos, 0.8);
    float box = opTwist(p - vec3(-1.5, 0.0, 0.0), 1.5);
    float torus = sdTorus(p - vec3(1.5, 0.0, 0.0), vec2(0.7, 0.25));
    float cyl = opDisplace(p - vec3(0.0, -1.5, 0.0), sdCylinder(p - vec3(0.0, -1.5, 0.0), vec3(0.0, 0.0, 0.5)));
    float fractal = mandelbulb(p * 0.8 + vec3(0.0, 1.5, 0.0));
    float combined = opUnion(opUnion(opUnion(sphere, box), torus), cyl);
    if (length(p - vec3(0.0, 2.5, 0.0)) < 2.0) combined = opUnion(combined, fractal);
    return opUnion(combined, p.y + 2.0);
}

// ---- Normal Calculation ----
vec3 calcNormal(vec3 p) {
    float eps = 0.001;
    return normalize(vec3(
        scene(p + vec3(eps, 0, 0)) - scene(p - vec3(eps, 0, 0)),
        scene(p + vec3(0, eps, 0)) - scene(p - vec3(0, eps, 0)),
        scene(p + vec3(0, 0, eps)) - scene(p - vec3(0, 0, eps))
    ));
}

// ---- Raymarching ----
float raymarch(vec3 ro, vec3 rd) {
    float t = 0.0;
    for (int i = 0; i < 100; i++) {
        float d = scene(ro + t * rd);
        if (d < 0.001 || t > 50.0) break;
        t += d;
    }
    return t;
}

// ---- Main ----
void main() {
    vec2 uv = (vUv - 0.5) * 2.0;
    uv.x *= uResolution.x / uResolution.y;

    float camAngle = uTime * 0.15;
    vec3 ro = vec3(sin(camAngle) * 5.0, 1.0, cos(camAngle) * 5.0);
    vec3 rd = normalize(vec3(uv, -1.5));

    vec3 forward = normalize(vec3(-ro.x, 0.0, -ro.z));
    vec3 right = normalize(cross(forward, vec3(0.0, 1.0, 0.0)));
    vec3 up = cross(right, forward);
    rd = normalize(rd.x * right + rd.y * up + rd.z * forward);

    float rayT = raymarch(ro, rd);
    vec3 color;

    if (rayT < 50.0) {
        vec3 p = ro + rayT * rd;
        vec3 normal = calcNormal(p);

        // Lighting
        vec3 lightDir = normalize(vec3(1.0, 1.0, -1.0));
        float diff = max(dot(normal, lightDir), 0.0);
        float ambient = 0.2;
        vec3 lightColor = vec3(1.0, 0.95, 0.9);

        vec3 viewDir = normalize(ro - p);
        vec3 reflectDir = reflect(-lightDir, normal);
        float spec = pow(max(dot(reflectDir, viewDir), 0.0), 32.0);

        // Color based on position
        vec3 objectColor = vec3(
            0.3 + 0.5 * abs(normal.x),
            0.4 + 0.5 * abs(normal.y),
            0.6 + 0.5 * abs(normal.z)
        );

        color = objectColor * (ambient + diff * lightColor) + vec3(1.0) * spec * 0.5;

        float fog = 1.0 - exp(-0.03 * rayT);
        color = mix(color, vec3(0.05, 0.05, 0.1), fog);
    } else {
        color = vec3(0.05, 0.05, 0.1);
    }

    gl_FragColor = vec4(color, 1.0);
}
