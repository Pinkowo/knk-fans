export function randomFloat(min = 0, max = 1) {
  return Math.random() * (max - min) + min;
}

export function randomAngle() {
  return randomFloat(0, Math.PI * 2);
}
