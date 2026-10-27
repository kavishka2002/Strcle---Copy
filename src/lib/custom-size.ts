export type MeasurementUnit = "in" | "cm";

export const CUSTOM_SIZE_LIMITS = {
  minWidthMm: 20,
  maxWidthMm: 200,
  minHeightMm: 15,
  maxHeightMm: 280
} as const;

export function measurementToMillimeters(value: number, unit: MeasurementUnit): number {
  return value * (unit === "in" ? 25.4 : 10);
}

export function millimetersToMeasurement(valueMm: number, unit: MeasurementUnit): number {
  return valueMm / (unit === "in" ? 25.4 : 10);
}

export function isSupportedCustomSize(widthMm: number, heightMm: number): boolean {
  return Number.isFinite(widthMm) && Number.isFinite(heightMm)
    && widthMm >= CUSTOM_SIZE_LIMITS.minWidthMm && widthMm <= CUSTOM_SIZE_LIMITS.maxWidthMm
    && heightMm >= CUSTOM_SIZE_LIMITS.minHeightMm && heightMm <= CUSTOM_SIZE_LIMITS.maxHeightMm;
}
