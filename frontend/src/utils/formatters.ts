/**
 * Formats bytes to megabytes with 2 decimal places
 */
export const formatBytesToMB = (bytes: number): string => {
  return (bytes / 1024).toFixed(2);
};

/**
 * Formats a value for display in the chart tooltip
 */
export const formatTooltipLabel = (label: string, value: number): string => {
  const mbValue = formatBytesToMB(value);
  return `${label}: ${mbValue} MB`;
};
