import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "./ui/button";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { Home, LogOut } from "lucide-react";

interface ServiceSwitchHeaderProps {
  currentService: "daas" | "cico";
  title: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export const ServiceSwitchHeader: React.FC<ServiceSwitchHeaderProps> = ({
  currentService,
  title,
  breadcrumbs = [],
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // const handleServiceSwitch = () => {
  //   const newService = currentService === "daas" ? "cico" : "daas";
  //   setSelectedService(newService);

  //   if (newService === "daas") {
  //     navigate("/distributor");
  //   } else {
  //     navigate("/distributor/cico");
  //   }
  // };

  // const serviceConfig = {
  //   daas: {
  //     name: "DAAS Services",
  //     icon: <FileText className="h-4 w-4" />,
  //     color: "bg-blue-100 text-blue-700",
  //   },
  //   cico: {
  //     name: "CICO Transactions",
  //     icon: <ArrowUpDown className="h-4 w-4" />,
  //     color: "bg-green-100 text-green-700",
  //   },
  // };

  // const alternateService = currentService === "cico" ? "cico" : "daas";
  // const alternateConfig = serviceConfig[alternateService];

  return (
    <>
      {/* Header */}
      <header className="border-outline bg-surface">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-heading text-sm">{title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {/* <Button
                variant="secondary"
                size="sm"
                className="border-outline flex items-center gap-1 sm:gap-2"
                onClick={handleServiceSwitch}
              >
                <span className="hidden sm:inline">Switch to</span>
                <div className="flex items-center gap-1">
                  {alternateConfig.icon}
                  <span className="text-xs sm:text-sm">
                    {alternateService.toUpperCase()}
                  </span>
                </div>
              </Button> */}
              <Button
                variant="outline"
                size="sm"
                className="button border-outline"
                onClick={logout}
              >
                <LogOut className="w-4 h-4 " />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <div className="container mx-auto px-4 py-3 border-b border-outline">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <div className="flex items-center gap-2 text-brand">
                  <Home className="h-4 w-4" />
                  <BreadcrumbPage
                    className="text-brand cursor-pointer hover:text-accent"
                    onClick={() =>
                      navigate(
                        currentService === "daas"
                          ? "/distributor"
                          : "/distributor/cico"
                      )
                    }
                  >
                    Dashboard
                  </BreadcrumbPage>
                </div>
              </BreadcrumbItem>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {crumb.href ? (
                      <BreadcrumbPage
                        className="text-brand cursor-pointer hover:text-accent"
                        onClick={() => navigate(crumb.href!)}
                      >
                        {crumb.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbPage className="text-secondary">
                        {crumb.label}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      )}
    </>
  );
};
