// src/app/_utils/multiSelectNoneUtils.ts

export function handleNoneMultiSelect<T extends string>(
  current: T[],
  value: T,
  noneValue: T = "None" as T,
): T[] {
  if (value === noneValue) {
    // If 'None' is selected, deselect all others and only select 'None'
    return [noneValue];
  } else {
    if (current.includes(noneValue)) {
      // If 'None' is already selected, replace with the new value
      return [value];
    } else {
      // Toggle the value, and remove 'None' if present
      const toggled = current.includes(value)
        ? current.filter((p) => p !== value)
        : [...current, value];
      return toggled.filter((p) => p !== noneValue);
    }
  }
}
