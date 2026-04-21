export type UserRole = "gamer" | "admin";

/** Backend stores these as numeric enums; labels live in `lib/status.ts`. */
export type AccountStatus = 0 | 1 | 2 | 3; // pending / active / suspended / deactivated
export type KycStatus = 0 | 1 | 2 | 3; // not_submitted / pending / approved / rejected

export interface UserSummary {
  _id: string;
  email?: string;
  phone?: string;
  role: UserRole;
  status: AccountStatus;
  kycStatus?: KycStatus;
  emailVerifiedAt?: string | null;
  phoneVerifiedAt?: string | null;
  lastSeenAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Profile {
  _id?: string;
  user?: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  username?: string;
  locale?: string;
  /** Public WhatsApp for listings; shown only to KYC-approved buyers. */
  whatsapp?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** Shape returned by `GET /profile` — authed caller sees email/phone. */
export interface ProfileMe {
  user: {
    id: string;
    email?: string;
    phone?: string;
    role: UserRole;
    status: AccountStatus;
    emailVerifiedAt?: string | null;
    phoneVerifiedAt?: string | null;
    createdAt?: string;
  };
  kycSummary: { kycStatus: KycStatus | number };
  profile: Profile;
}

export type GamePlatform =
  | "PC"
  | "PlayStation"
  | "Xbox"
  | "Mobile"
  | "Cross-platform";
export type GameCategory = "account" | "skin" | "currency" | "item" | "boosting";
export type ListingStatus = "active" | "sold" | "pending" | "removed";

export interface GameDetails {
  platform?: GamePlatform;
  region?: string;
  level?: number;
  rank?: string;
  hoursPlayed?: number;
}

export interface GameListing {
  _id: string;
  seller: string;
  title: string;
  description?: string;
  gameName: string;
  gameCategory: GameCategory;
  priceAmount: number;
  currency: string;
  negotiable: boolean;
  details?: GameDetails;
  status: ListingStatus;
  images?: Array<{ url: string; key?: string }>;
  createdAt?: string;
  updatedAt?: string;
}

/** Image descriptor stored on listings (new uploads) or legacy URL string. */
export type ListingImage = { url: string; key?: string } | string;

/** Minimal seller info exposed only to authenticated viewers of a listing. */
export interface ListingSeller {
  _id: string;
  email?: string;
  phone?: string;
  /** From seller profile when viewer’s KYC is approved. */
  whatsapp?: string;
  role?: UserRole;
  lastSeenAt?: string | null;
  /** True when signed in but viewer must complete KYC to see email/phone/WhatsApp. */
  contactRequiresKyc?: boolean;
}

/**
 * Response shape for listing GETs, mirroring the backend Game model.
 * Field names are nested (`game.name`, `price.amount`) — do NOT confuse with
 * the flat `GameListing` input type used for uploads.
 */
export interface ListingDoc {
  _id: string;
  seller: ListingSeller | string | null;
  title: string;
  description?: string;
  game: {
    name: string;
    category: GameCategory;
  };
  price: {
    amount: number;
    currency: string;
    negotiable?: boolean;
  };
  details?: GameDetails;
  status: ListingStatus;
  images?: ListingImage[];
  views?: number;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Aggregated entry for `/game/catalog` and `/game/trending`. */
export interface GameCatalogEntry {
  name: string;
  listingsCount: number;
  totalViews?: number;
  sampleImage?: ListingImage | null;
  minPrice?: number;
  maxPrice?: number;
  categories?: GameCategory[];
}

export interface AchievementDefinition {
  _id: string;
  code: string;
  name: string;
  description?: string;
  iconUrl?: string;
}

export interface UserAchievement {
  _id: string;
  user: string;
  achievement: AchievementDefinition | string;
  unlockedAt: string;
}

export interface KycRecord {
  _id: string;
  user: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  profilePicture?: string;
  /** The KYC model itself has no `status` — status lives on the User doc. */
  createdAt?: string;
  updatedAt?: string;
}
