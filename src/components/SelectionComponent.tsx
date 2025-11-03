import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useNavigate } from "react-router-dom";
import {
  TransactionType,
  transactionTypes,
  walletConfig,
  WalletConfig,
} from "@/lib/wallets";

const SelectionComponent: React.FC = () => {
  const navigate = useNavigate();

  const handleWalletClick = (type: TransactionType, wallet: WalletConfig) => {
    if (wallet.enabled) {
      navigate(`${type.route}?wallet=${wallet.name}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-heading">
          Start A Transaction
        </h2>
        <p className="text-sm sm:text-base text-secondary">
          Select whether you want to process a cash-in or cash-out transaction
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {transactionTypes.map((type) => (
          <Card
            key={type.type}
            className="card text-heading shadow-lg border transition-all bg-surface border-outline"
          >
            <CardHeader className="text-center pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl">{type.title}</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                {type.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm mb-3 text-label">
                    Choose A Wallet:
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {walletConfig.map((wallet) => (
                      <button
                        key={wallet.name}
                        className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg border-2 transition-all ${
                          wallet.enabled
                            ? "border-outline text-brand hover:border-gray-300 hover:shadow-sm cursor-pointer active:scale-95"
                            : "bg-white/30 border-gray-200 text-gray-400 cursor-not-allowed opacity-50 backdrop-blur-sm"
                        }`}
                        onClick={() => handleWalletClick(type, wallet)}
                        disabled={!wallet.enabled}
                        title={wallet.enabled ? "Select wallet" : "Coming soon"}
                      >
                        <img
                          src={wallet.icon}
                          alt={`${wallet.name} logo`}
                          className="w-8 h-8 sm:w-10 sm:h-10 mb-1 sm:mb-2 object-contain"
                        />
                        <span className="text-xs sm:text-sm font-medium text-heading">
                          {wallet.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SelectionComponent;
