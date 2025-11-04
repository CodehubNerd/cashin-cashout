export interface WalletConfig {
  name: string;
  enabled: boolean;
  icon: string;
}

export const walletConfig: WalletConfig[] = [
  { name: "MOMO", enabled: true, icon: "/momo.svg" },
  { name: "Unayo", enabled: true, icon: "/unayo.svg" },
  { name: "Delta Pay", enabled: false, icon: "/delta.jpeg" },
  { name: "Emali", enabled: false, icon: "/emali.jpeg" },
  { name: "ISnstaCash", enabled: false, icon: "/instacash.png" },
];
//
export interface TransactionType {
  type: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  route: string;
}

export const transactionTypes: TransactionType[] = [
  {
    type: "cash-out",
    title: "Cash-Out",
    description: "Customer withdraws money from their wallet",
    icon: "↑",
    color: "bg-blue-500",
    route: "/distributor/cico/cash-out",
  },
  {
    type: "cash-in",
    title: "Cash-In",
    description: "Customer deposits money into their wallet",
    icon: "↓",
    color: "bg-green-500",
    route: "/distributor/cico/cash-in",
  },
];

export interface WalletProvider {
  id: string;
  name: string;
  color: string;
  type: "mobile_money" | "bank";
  supportedMethods: ("normal" | "voucher")[] | undefined;
  fields: string[];
  requiresPin: boolean;
  requiresBalance: boolean;
  requiresKYC: boolean;
  quickAmounts: number[];
}

export const walletProviders: WalletProvider[] = [
  {
    id: "momo",
    name: "MOMO",
    color: "bg-yellow-500",
    type: "mobile_money",
    supportedMethods: ["normal"],
    fields: ["msidn"],
    requiresPin: false,
    requiresBalance: true,
    requiresKYC: true,
    quickAmounts: [100, 200, 500, 1000],
  },

  {
    id: "unayo",
    name: "Unayo",
    color: "bg-purple-500",
    type: "bank",
    supportedMethods: ["voucher"],
    fields: ["voucherNumber"],
    requiresPin: false,
    requiresBalance: false,
    requiresKYC: false,
    quickAmounts: [100, 500, 1000, 2000],
  },
  {
    id: "delta",
    name: "Delta Pay",
    color: "bg-red-500",
    type: "bank",
    supportedMethods: ["voucher"],
    fields: ["voucherNumber"],
    requiresPin: false,
    requiresBalance: false,
    requiresKYC: false,
    quickAmounts: [100, 200, 500, 1000, 2000],
  },
];
