export function getProjectSurfaceColor(accentColor: string) {
  return `color-mix(in srgb, ${accentColor} 9%, white)`;
}

export function getProjectBorderColor(accentColor: string) {
  return `color-mix(in srgb, ${accentColor} 18%, white)`;
}