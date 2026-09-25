export interface StoreInfo {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  themeColor: string;
  secondaryColor: string;
  path: string;
  description: string;
  currency: string;
  categoryTheme: string;
}

export declare const STORES: StoreInfo[];
export declare const ROLES: {
  SUPER_ADMIN: 'SUPER_ADMIN';
  STORE_ADMIN: 'STORE_ADMIN';
  USER: 'USER';
};
export declare const ORDER_STATUS: {
  PENDING: 'PENDING';
  CONFIRMED: 'CONFIRMED';
  SHIPPED: 'SHIPPED';
  DELIVERED: 'DELIVERED';
  CANCELLED: 'CANCELLED';
};
