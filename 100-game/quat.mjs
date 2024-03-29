export function create() {
    let out = new glMatrix.ARRAY_TYPE(4);
    if (glMatrix.ARRAY_TYPE != Float32Array) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
    }
    out[3] = 1;
    return out;
}

export function rotateX(out, a, rad) {
    rad *= 0.5;
    let ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
    let bx = Math.sin(rad),
      bw = Math.cos(rad);
    out[0] = ax * bw + aw * bx;
    out[1] = ay * bw + az * bx;
    out[2] = az * bw - ay * bx;
    out[3] = aw * bw - ax * bx;
    return out;
}

export function rotateY(out, a, rad) {
    rad *= 0.5;
    let ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
    let by = Math.sin(rad),
      bw = Math.cos(rad);
    out[0] = ax * bw - az * by;
    out[1] = ay * bw + aw * by;
    out[2] = az * bw + ax * by;
    out[3] = aw * bw - ay * by;
    return out;
}

export function rotateZ(out, a, rad) {
    rad *= 0.5;
    let ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
    let bz = Math.sin(rad),
      bw = Math.cos(rad);
    out[0] = ax * bw + ay * bz;
    out[1] = ay * bw - ax * bz;
    out[2] = az * bw + aw * bz;
    out[3] = aw * bw - az * bz;
    return out;
}