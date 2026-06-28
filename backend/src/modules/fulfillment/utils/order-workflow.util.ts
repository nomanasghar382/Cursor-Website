export const ORDER_STATUS_FLOW = [
  "PENDING_PAYMENT",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
] as const;

export const TERMINAL_ORDER_STATUSES = ["CANCELLED", "RETURNED", "REFUNDED"] as const;

export type OrderWorkflowStatus = (typeof ORDER_STATUS_FLOW)[number] | (typeof TERMINAL_ORDER_STATUSES)[number];

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING_PAYMENT: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "RETURNED"],
  DELIVERED: ["RETURNED"],
  RETURNED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

export function canTransitionOrderStatus(current: string, next: string) {
  if (current === next) return true;
  return ALLOWED_TRANSITIONS[current]?.includes(next) ?? false;
}

export function buildOrderTimeline(status: string, shipmentStatus?: string) {
  const steps = [
    { key: "PENDING_PAYMENT", label: "Pending payment" },
    { key: "CONFIRMED", label: "Confirmed" },
    { key: "PROCESSING", label: "Processing & packed" },
    { key: "SHIPPED", label: "Shipped" },
    { key: "OUT_FOR_DELIVERY", label: "Out for delivery" },
    { key: "DELIVERED", label: "Delivered" },
  ];

  if (TERMINAL_ORDER_STATUSES.includes(status as (typeof TERMINAL_ORDER_STATUSES)[number])) {
    return [
      {
        key: status,
        label: status.replaceAll("_", " "),
        completed: true,
        current: true,
      },
    ];
  }

  let activeKey = status;
  if (status === "SHIPPED" && shipmentStatus === "IN_TRANSIT") {
    activeKey = "OUT_FOR_DELIVERY";
  }

  const activeIndex = steps.findIndex((step) => step.key === activeKey);
  return steps.map((step, index) => ({
    ...step,
    completed: activeIndex >= 0 ? activeIndex > index : false,
    current: step.key === activeKey,
  }));
}

export function shipmentStatusForOrderStatus(status: string) {
  switch (status) {
    case "SHIPPED":
      return "SHIPPED" as const;
    case "DELIVERED":
      return "DELIVERED" as const;
    case "PROCESSING":
      return "LABEL_CREATED" as const;
    default:
      return "PENDING" as const;
  }
}
