vec2 translate(vec2 p, vec2 r, float t, float e){;
  return vec2(
    r.x * cos(uTime * t + p.x * p.y * e),
    r.y * sin(uTime * t + p.x * p.y * e)
  );
}