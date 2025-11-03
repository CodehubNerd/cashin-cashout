import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import {
  DollarSign,
  FileText,
  ArrowUpDown,
  CreditCard,
  TrendingUp,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  features: Array<{ icon: React.ReactNode; text: string }>;
  buttonText: string;
  onSelect: () => void;
  isDisabled: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  icon,
  features,
  buttonText,
  onSelect,
  isDisabled,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="bg-surface border-outline hover:shadow-lg transition-all cursor-pointer">
      <CardHeader className="text-center pb-2 sm:pb-4">
        <div className="flex justify-center mb-2 sm:mb-4">
          <div className={`p-2 sm:p-4 bg-blue-100 rounded-full`}>
            <div className={`h-6 w-6 sm:h-8 sm:w-8 text-blue-600`}>{icon}</div>
          </div>
        </div>
        <CardTitle className="text-form-title text-lg sm:text-xl">
          {title}
        </CardTitle>
        <CardDescription className="text-secondary text-sm">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-4">
        {/* Mobile: Collapsible features */}
        <div className="sm:hidden">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between p-2 text-sm font-medium text-option border border-outline rounded-md hover:bg-surface"
          >
            <span>View Features</span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {isExpanded && (
            <div className="mt-2 space-y-2 p-2 border border-outline rounded-md bg-surface">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div className="h-3 w-3 text-accent">{feature.icon}</div>
                  <span className="text-option">{feature.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop: Always visible features */}
        <div className="hidden sm:block space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3 text-sm">
              <div className="h-4 w-4 text-accent">{feature.icon}</div>
              <span className="text-option">{feature.text}</span>
            </div>
          ))}
        </div>

        <Button
          className="w-full button mt-3 sm:mt-4"
          variant="ghost"
          onClick={onSelect}
          disabled={isDisabled}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};

const ServiceSelection: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedService } = useAuth();

  const handleServiceSelection = (service: "daas" | "cico") => {
    setSelectedService(service);
    if (service === "daas") {
      navigate("/distributor");
    } else {
      navigate("/distributor/cico");
    }
  };

  const daasFeatures = [
    {
      icon: <TrendingUp className="h-full w-full" />,
      text: "Performance tracking and metrics",
    },
    {
      icon: <DollarSign className="h-full w-full" />,
      text: "Commission management",
    },
    {
      icon: <Users className="h-full w-full" />,
      text: "Service event submissions",
    },
  ];

  const cicoFeatures = [
    {
      icon: <CreditCard className="h-full w-full" />,
      text: "Mobile money transactions",
    },
    {
      icon: <DollarSign className="h-full w-full" />,
      text: "Cash-in and cash-out operations",
    },
    {
      icon: <FileText className="h-full w-full" />,
      text: "Transaction history and reporting",
    },
  ];

  return (
    <div className="min-h-screen bg-brand">
      {/* Header */}
      <header className="border-outline">
        <div className="container mx-auto px-4 py-4">
          <div className="text-center">
            <h1 className="text-heading text-xl sm:text-2xl font-bold">
              Choose Your Service
            </h1>
            <p className="text-secondary text-sm sm:text-base">
              Select the service you want to access
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <ServiceCard
              title="CICO Transactions"
              description="Cash In Cash Out Transaction Processing"
              icon={<ArrowUpDown className="h-full w-full" />}
              features={cicoFeatures}
              buttonText="Access CICO Services"
              onSelect={() => handleServiceSelection("cico")}
              isDisabled={false}
            />
            <ServiceCard
              title="DAAS Services"
              description="Distributor Agent Administration System"
              icon={<FileText className="h-full w-full" />}
              features={daasFeatures}
              buttonText="Access DAAS Services"
              onSelect={() => handleServiceSelection("daas")}
              isDisabled={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceSelection;
