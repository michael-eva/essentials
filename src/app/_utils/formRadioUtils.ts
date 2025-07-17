export function booleanToRadioValue(val: boolean | null | undefined): string {
    if (val === true) return "true";
    if (val === false) return "false";
    return "";
  }
  
  export function radioValueToBoolean(val: string): boolean | null {
    if (val === "true") return true;
    if (val === "false") return false;
    return null;
  }
  