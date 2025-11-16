import { imagesrc } from "../constants"; // added

// Wallet configurations
export const walletConfig = [
  { name: "momo", enabled: true, icon: imagesrc.momo },
  { name: "unayo", enabled: false, icon: imagesrc.unayo },
  { name: "deltapay", enabled: false, icon: imagesrc.delta },
  { name: "instacash", enabled: false, icon: imagesrc.instacash },
];

// Transaction types
export const transactionTypes = [
  {
    type: "cash-out",
    title: "CashOut",
    description: "Customer withdraws money from their wallet",
    icon: "↑",
    color: "bg-blue-500",
    route: "/distributor/cico/cash-out",
  },
  {
    type: "cash-in",
    title: "CashIn",
    description: "Customer deposits money into their wallet",
    icon: "↓",
    color: "bg-green-500",
    route: "/distributor/cico/cash-in",
  },
];

// Wallet providers
export const walletProviders = [
  {
    id: "momo",
    name: "momo", // changed: use lowercase identifier that matches route/params
    displayName: "MOMO",
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
    name: "unayo",
    displayName: "Unayo",
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
    id: "deltapay",
    name: "deltapay",
    displayName: "Delta Pay",
    color: "bg-red-500",
    type: "bank",
    supportedMethods: ["voucher"],
    fields: ["voucherNumber"],
    requiresPin: false,
    requiresBalance: false,
    requiresKYC: false,
    quickAmounts: [100, 200, 500, 1000, 2000],
  },
  {
    id: "instacash",
    name: "instacash",
    displayName: "insta cash",
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
