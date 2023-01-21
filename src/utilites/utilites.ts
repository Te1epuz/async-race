export function generateRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateRandomColor() {
  return `#${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
}
