import { describe, it, expect } from "vitest";
import { ConditionTypeCode, ConditionGradeCode } from "@/lib/core/types/types";

function validateCondition(type: ConditionTypeCode, grade?: ConditionGradeCode) {
  if (type === ConditionTypeCode.NEW) return true;
  if (type === ConditionTypeCode.USED) return Boolean(grade);
  return false;
}

describe("Condition Validation", () => {
  it("new product doesn't require grade", () => {
    expect(validateCondition(ConditionTypeCode.NEW)).toBe(true);
  });

  it("used product requires grade", () => {
    expect(validateCondition(ConditionTypeCode.USED)).toBe(false);
    expect(validateCondition(ConditionTypeCode.USED, ConditionGradeCode.EXCELLENT)).toBe(true);
  });
});
