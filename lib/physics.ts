export const GRAVITY = 9.81;
export const BALL_RADIUS = 0.11;
export type Vec = { x: number; y: number; z: number };
export type Bin = { x: number; z: number; height: number; radius: number; bottomRadius: number };
export const BINS: Bin[] = [
  { x: 0.35, z: -4.5, height: 0.88, radius: 0.47, bottomRadius: 0.34 },
  { x: -0.55, z: -5.3, height: 0.96, radius: 0.43, bottomRadius: 0.37 },
];
export const ORIGIN: Vec = { x: 0, y: 1.42, z: 2.7 };
export function launchVelocity(aim: number, power: number): Vec {
  const speed = 5 + power * 0.075;
  const elevation = 55 * Math.PI / 180;
  return { x: Math.sin(aim) * Math.cos(elevation) * speed, y: Math.sin(elevation) * speed, z: -Math.cos(aim) * Math.cos(elevation) * speed };
}
export function integrate(p: Vec, v: Vec, dt: number) {
  p.x += v.x * dt; p.y += v.y * dt - 0.5 * GRAVITY * dt * dt; p.z += v.z * dt;
  v.y -= GRAVITY * dt;
}
export function entersBin(previous: Vec, next: Vec, bin: Bin) {
  if (previous.y <= bin.height || next.y > bin.height) return false;
  const fraction = (previous.y - bin.height) / (previous.y - next.y);
  const x = previous.x + (next.x - previous.x) * fraction;
  const z = previous.z + (next.z - previous.z) * fraction;
  return Math.hypot(x - bin.x, z - bin.z) < bin.radius - BALL_RADIUS;
}
export function rimCollision(p: Vec, v: Vec, bin: Bin) {
  const dx = p.x - bin.x, dz = p.z - bin.z, distance = Math.hypot(dx, dz);
  if (distance < 0.0001) return false;
  const rimX = bin.x + dx / distance * bin.radius, rimZ = bin.z + dz / distance * bin.radius;
  const nx = p.x - rimX, ny = p.y - bin.height, nz = p.z - rimZ;
  const length = Math.hypot(nx, ny, nz), contact = BALL_RADIUS + 0.024;
  if (length >= contact || length < 0.00001) return false;
  const normal = { x: nx / length, y: ny / length, z: nz / length };
  p.x = rimX + normal.x * contact; p.y = bin.height + normal.y * contact; p.z = rimZ + normal.z * contact;
  const dot = v.x * normal.x + v.y * normal.y + v.z * normal.z;
  if (dot < 0) { v.x -= 1.42 * dot * normal.x; v.y -= 1.42 * dot * normal.y; v.z -= 1.42 * dot * normal.z; }
  return true;
}
