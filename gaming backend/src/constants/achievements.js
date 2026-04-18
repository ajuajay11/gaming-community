/**
 * Achievement definitions — progress is derived from listings (seller) and purchases (buyer).
 * Unlocks are stored in `UserAchievement` when thresholds are met.
 */
const ACHIEVEMENT_ROLE = {
  SELLER: "seller",
  BUYER: "buyer",
};

const ACHIEVEMENT_METRIC = {
  LISTINGS_CREATED: "listings_created",
  SALES: "sales",
  PURCHASES: "purchases",
};

/** Ordered by threshold within the same metric (for UI “next goal”). */
const ACHIEVEMENT_DEFINITIONS = [
  {
    key: "seller_first_listing",
    title: "First listing",
    description: "Created your first marketplace listing.",
    role: ACHIEVEMENT_ROLE.SELLER,
    metric: ACHIEVEMENT_METRIC.LISTINGS_CREATED,
    threshold: 1,
  },
  {
    key: "seller_10_listings",
    title: "Catalog builder",
    description: "Created 10 listings.",
    role: ACHIEVEMENT_ROLE.SELLER,
    metric: ACHIEVEMENT_METRIC.LISTINGS_CREATED,
    threshold: 10,
  },
  {
    key: "seller_first_sale",
    title: "First sale",
    description: "Sold your first item.",
    role: ACHIEVEMENT_ROLE.SELLER,
    metric: ACHIEVEMENT_METRIC.SALES,
    threshold: 1,
  },
  {
    key: "seller_10_sales",
    title: "Power seller",
    description: "Completed 10 sales.",
    role: ACHIEVEMENT_ROLE.SELLER,
    metric: ACHIEVEMENT_METRIC.SALES,
    threshold: 10,
  },
  {
    key: "buyer_first_purchase",
    title: "First purchase",
    description: "Bought your first item.",
    role: ACHIEVEMENT_ROLE.BUYER,
    metric: ACHIEVEMENT_METRIC.PURCHASES,
    threshold: 1,
  },
  {
    key: "buyer_5_purchases",
    title: "Collector",
    description: "Completed 5 purchases.",
    role: ACHIEVEMENT_ROLE.BUYER,
    metric: ACHIEVEMENT_METRIC.PURCHASES,
    threshold: 5,
  },
];

module.exports = {
  ACHIEVEMENT_ROLE,
  ACHIEVEMENT_METRIC,
  ACHIEVEMENT_DEFINITIONS,
};
