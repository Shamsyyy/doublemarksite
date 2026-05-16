export type BillingPeriod = "monthly" | "yearly";

export type PlanTier = "base" | "standard" | "elite";

export type PlanId =
  | "base-monthly"
  | "standard-monthly"
  | "elite-monthly"
  | "base-yearly"
  | "standard-yearly"
  | "elite-yearly";

export type Plan = {
  id: PlanId;
  tier: PlanTier;
  name: string;
  monthlyPriceRub: number;
  yearlyPriceRub: number;
  yearlyMonthlyPriceRub: number;
  trialDays: number;
  features: string[];
  highlighted?: boolean;
};

export const PLAN_CATALOG: Plan[] = [
  {
    id: "base-monthly",
    tier: "base",
    name: "Base",
    monthlyPriceRub: 3000,
    yearlyPriceRub: 28800,
    yearlyMonthlyPriceRub: 2400,
    trialDays: 14,
    features: [
      "14 дней бесплатного периода",
      "1 устройство",
      "Неограниченное количество кодов",
      "Windows-приложение",
      "Android-приложение",
      "Инструкции по настройке сканера и принтера",
      "Поддержка",
    ],
  },
  {
    id: "standard-monthly",
    tier: "standard",
    name: "Standard",
    monthlyPriceRub: 5000,
    yearlyPriceRub: 48000,
    yearlyMonthlyPriceRub: 4000,
    trialDays: 14,
    highlighted: true,
    features: [
      "14 дней бесплатного периода",
      "До 3 устройств",
      "Неограниченное количество кодов",
      "Windows-приложение",
      "Android-приложение",
      "Инструкции по настройке сканера и принтера",
      "Приоритетная поддержка",
    ],
  },
  {
    id: "elite-monthly",
    tier: "elite",
    name: "Elite",
    monthlyPriceRub: 10000,
    yearlyPriceRub: 96000,
    yearlyMonthlyPriceRub: 8000,
    trialDays: 14,
    features: [
      "14 дней бесплатного периода",
      "До 10 устройств",
      "Windows-приложение",
      "Android-приложение",
      "Beta-функции",
      "Инструкции по настройке сканера и принтера",
      "Выделенный менеджер",
    ],
  },
];

export const YEARLY_TRIAL_DAYS = 30;

export function getPlansForPeriod(period: BillingPeriod): Plan[] {
  return PLAN_CATALOG.map((plan) => ({
    ...plan,
    id: `${plan.tier}-${period}` as PlanId,
  }));
}

export function parsePlanId(
  planId: string,
): { tier: PlanTier; period: BillingPeriod } | null {
  const [tier, period] = planId.split("-") as [PlanTier, BillingPeriod];
  if (!tier || (period !== "monthly" && period !== "yearly")) {
    return null;
  }
  const plan = PLAN_CATALOG.find((item) => item.tier === tier);
  if (!plan) {
    return null;
  }
  return { tier, period };
}

export function getPlanById(planId: string): Plan | null {
  const parsed = parsePlanId(planId);
  if (!parsed) {
    return null;
  }
  return PLAN_CATALOG.find((plan) => plan.tier === parsed.tier) ?? null;
}

export function getCheckoutPlanId(tier: PlanTier, period: BillingPeriod): PlanId {
  return `${tier}-${period}`;
}

export type ResolvedPlan = {
  plan: Plan;
  planId: PlanId;
  period: BillingPeriod;
  priceRub: number;
  displayPriceRub: number;
  periodLabel: string;
  trialDays: number;
  subscriptionDays: number;
  features: string[];
};

export function resolvePlanCheckout(planId: PlanId): ResolvedPlan | null {
  const parsed = parsePlanId(planId);
  const plan = getPlanById(planId);
  if (!parsed || !plan) {
    return null;
  }

  const { period } = parsed;
  const trialDays = period === "yearly" ? YEARLY_TRIAL_DAYS : plan.trialDays;
  const priceRub = period === "yearly" ? plan.yearlyPriceRub : plan.monthlyPriceRub;
  const displayPriceRub =
    period === "yearly" ? plan.yearlyMonthlyPriceRub : plan.monthlyPriceRub;

  const features = plan.features.map((feature) => {
    if (feature.startsWith("14 дней") && period === "yearly") {
      return `${YEARLY_TRIAL_DAYS} дней бесплатного периода`;
    }
    return feature;
  });

  return {
    plan,
    planId,
    period,
    priceRub,
    displayPriceRub,
    periodLabel: period === "yearly" ? "год" : "мес",
    trialDays,
    subscriptionDays: period === "yearly" ? 365 : 30,
    features,
  };
}
