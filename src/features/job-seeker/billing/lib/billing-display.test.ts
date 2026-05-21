import { describe, expect, it } from "vitest";
import {
  formatEntitlementLimit,
  formatPlanPrice,
  getFeatureLabel,
  getSubscriptionStatusLabel,
} from "./billing-display";

describe("billing-display", () => {
  it("maps feature keys to readable labels", () => {
    expect(getFeatureLabel("AI_RESUME_REVIEW")).toBe("AI resume review");
    expect(getFeatureLabel("CUSTOM_FEATURE")).toBe("custom feature");
  });

  it("formats plan prices", () => {
    expect(formatPlanPrice({ priceMonthly: null, currency: "usd" })).toBe("Free");
    expect(formatPlanPrice({ priceMonthly: 0, currency: "usd" })).toBe("Free");
    expect(formatPlanPrice({ priceMonthly: 1900, currency: "usd" })).toMatch(/\$19(\.00)?\/mo/);
  });

  it("formats entitlement limits", () => {
    expect(
      formatEntitlementLimit({ featureKey: "AI_RESUME_REVIEW", limitValue: null }),
    ).toBe("Unlimited");
    expect(
      formatEntitlementLimit({ featureKey: "AI_RESUME_REVIEW", limitValue: 5 }),
    ).toBe("5 reviews / month");
    expect(
      formatEntitlementLimit({ featureKey: "SAVED_JOBS", limitValue: 10 }),
    ).toBe("10 / month");
  });

  it("maps subscription status labels", () => {
    expect(getSubscriptionStatusLabel("BETA")).toBe("Beta access");
    expect(getSubscriptionStatusLabel("ACTIVE")).toBe("Active");
  });
});
