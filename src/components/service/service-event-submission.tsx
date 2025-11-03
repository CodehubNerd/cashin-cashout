import type React from "react";

import { useState, useRef } from "react";

import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ServiceSwitchHeader } from "@/components/ServiceSwitchHeader";
import {
  Upload,
  X,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  Camera,
  FileText,
} from "lucide-react";

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  commission: number;
  commissionType: "fixed" | "percentage";
  description: string;
  requirements: string[];
  active: boolean;
}

interface SubmissionData {
  customerPhone: string;
  amount: string;
  customerId: string;
  serviceId: string;
  evidence: File[];
  notes: string;
  assistanceDate: string;
}

const mockServices: ServiceItem[] = [
  {
    id: "mobile-money",
    name: "Mobile Money Transfer",
    category: "Financial Services",
    commission: 15.5,
    commissionType: "fixed",
    description:
      "Assist customers with mobile money transfers and transactions",
    requirements: [
      "Customer ID verification",
      "Transaction receipt",
      "Photo evidence",
    ],
    active: true,
  },
  {
    id: "airtime",
    name: "Airtime Purchase",
    category: "Telecommunications",
    commission: 5,
    commissionType: "percentage",
    description: "Help customers purchase airtime for their mobile devices",
    requirements: ["Customer phone number", "Purchase receipt"],
    active: true,
  },
  {
    id: "bill-payment",
    name: "Bill Payment Service",
    category: "Utilities",
    commission: 22.75,
    commissionType: "fixed",
    description: "Assist with utility bill payments and government services",
    requirements: ["Bill copy", "Payment confirmation", "Customer ID"],
    active: true,
  },
  {
    id: "insurance",
    name: "Insurance Registration",
    category: "Insurance",
    commission: 45.0,
    commissionType: "fixed",
    description: "Help customers register for insurance products",
    requirements: ["Customer documents", "Application form", "Payment proof"],
    active: true,
  },
];

interface ServiceEventSubmissionProps {
  onBack: () => void;
}

export function ServiceEventSubmission({}: ServiceEventSubmissionProps) {
 
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<SubmissionData>({
    customerPhone: "",
    amount: "",
    customerId: "",
    serviceId: "",
    evidence: [],
    notes: "",
    assistanceDate: new Date().toISOString().slice(0, 10),
  });
  const [showSuccess, setShowSuccess] = useState(false);

  // Filter services based on search and category
  const filteredServices = mockServices.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || service.category === selectedCategory;
    return matchesSearch && matchesCategory && service.active;
  });

  const categories = [
    "all",
    ...Array.from(new Set(mockServices.map((s) => s.category))),
  ];

  const validateDate = (date: string): boolean => {
    const submissionDate = new Date(date);
    const now = new Date();
    const hoursDiff =
      (now.getTime() - submissionDate.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 24;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter((file) => {
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/pdf",
        "text/csv",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];
      const maxSize = 5 * 1024 * 1024; // 5MB
      return validTypes.includes(file.type) && file.size <= maxSize;
    });

    setFormData((prev) => ({
      ...prev,
      evidence: [...prev.evidence, ...validFiles].slice(0, 10), // Max 10 files
    }));
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      evidence: prev.evidence.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.customerPhone) {
      errors.push("Customer phone number is required");
    }

    if (!formData.amount) {
      errors.push("Transaction amount is required");
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      errors.push("Please enter a valid amount");
    }

    if (!selectedService) {
      errors.push("Please select a service");
    }

    if (!validateDate(formData.assistanceDate)) {
      errors.push("Service must be submitted within 24 hours of assistance");
    }


    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    setValidationErrors(errors);

    if (errors.length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API submission
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("[v0] Service event submitted:", {
        ...formData,
        serviceId: selectedService?.id,
        estimatedCommission: selectedService?.commission,
      });

      // Show success message
      setShowSuccess(true);
    } catch (error) {
      console.error("[v0] Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      customerPhone: "",
      amount: "",
      customerId: "",
      serviceId: "",
      evidence: [],
      notes: "",
      assistanceDate: new Date().toISOString().slice(0, 10),
    });
    setSelectedService(null);
    setShowSuccess(false);
    setValidationErrors([]);
  };

  const SuccessComponent = () => (
    <div className="min-h-screen bg-brand flex items-center justify-center">
      <Card className="max-w-md mx-auto bg-surface border-outline shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-brand mb-2">Success!</h2>
            <p className="text-secondary">
              Your service event has been submitted successfully.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={resetForm}
              className="w-full button transition-all duration-300 hover:scale-[1.02]"
              variant="ghost"
            >
              Create New Event
            </Button>

            <Button
              onClick={() => navigate("/distributor")}
              className="w-full transition-all duration-300 hover:scale-[1.02]"
              variant="outline"
            >
              Go to Dashboard
            </Button>

            <Button
              onClick={() => setShowSuccess(false)}
              className="w-full transition-all duration-300 hover:scale-[1.02]"
              variant="ghost"
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (showSuccess) {
    return <SuccessComponent />;
  }

  return (
    <div className="min-h-screen bg-brand">
      <ServiceSwitchHeader
        currentService="daas"
        title="Service Submission"
        breadcrumbs={[{ label: "Submit Service Event" }]}
      />

      <div className="container mx-auto px-4 py-6">
        {/* Single Card Layout */}
        <Card className="max-w-4xl mx-auto bg-surface border-outline shadow-lg transition-all duration-300 hover:shadow-xl">
          <CardHeader>
            <CardTitle className="text-form-title">
              Submit Service Event
            </CardTitle>
            <CardDescription className="text-secondary">
              Select the service provided and enter customer details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Selection Section */}
              <div className="space-y-4 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <Label className="text-brand text-lg font-medium">
                    Service Selection
                  </Label>
                  {selectedService && (
                    <Badge
                      variant="outline"
                      className="text-gray-300 animate-in slide-in-from-right-2 duration-300"
                    >
                      {selectedService.name}
                    </Badge>
                  )}
                </div>

                {/* Search and Filter */}
                <div className="flex gap-2 transition-all duration-200">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-300 transition-colors duration-200" />
                    <Input
                      placeholder="Search services..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 transition-all duration-200 hover:shadow-sm focus:shadow-md focus:scale-[1.01]"
                    />
                  </div>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="w-48 text-gray-300 transition-all duration-200 hover:shadow-sm focus:shadow-md focus:scale-[1.01]">
                      <Filter className="h-4 w-4 mr-2 transition-transform duration-200 hover:rotate-12" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category}
                          value={category}
                          className="transition-colors duration-150"
                        >
                          {category === "all" ? "All Categories" : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Service List - Compact Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                  {filteredServices.map((service, index) => (
                    <div
                      key={service.id}
                      className={`p-3 border rounded-lg  cursor-pointer transition-all duration-300 hover:shadow-md ${
                        selectedService?.id === service.id
                          ? "border-outline bg-gray-100 text-gray-800 shadow-md"
                          : "border-border text-brand"
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => setSelectedService(service)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-1">
                          <h4 className="font-medium text-sm transition-all duration-200">
                            {service.name}
                          </h4>
                          <p className="text-xs line-clamp-2 transition-all duration-200">
                            {service.description}
                          </p>
                          <Badge
                            variant="secondary"
                            className="text-xs transition-all duration-200"
                          >
                            {service.category}
                          </Badge>
                        </div>
                        <div className="text-right ml-2">
                          <div className="flex items-center gap-1 text-xs font-semibold transition-all duration-200">
                            {service.commissionType === "fixed"
                              ? `${service.commission.toFixed(2)}`
                              : `${service.commission}%`}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-6 transition-all duration-300">
                <Label className="text-brand text-lg font-medium mb-4 block">
                  Customer Information
                </Label>

                <div className="space-y-4 transition-all duration-300">
                  <div className="space-y-2">
                    <Label
                      className="text-brand text-lg font-medium"
                      htmlFor="customerPhone"
                    >
                      Customer Phone Number *
                    </Label>
                    <Input
                      id="customerPhone"
                      placeholder="e.g., 78123456"
                      value={formData.customerPhone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customerPhone: e.target.value,
                        }))
                      }
                      className="text-brand transition-all duration-200 hover:shadow-sm focus:shadow-md focus:scale-[1.01] text-lg h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      className="text-brand text-lg font-medium"
                      htmlFor="amount"
                    >
                      Transaction Amount (SZL) *
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g., 150.00"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          amount: e.target.value,
                        }))
                      }
                      className="text-brand transition-all duration-200 hover:shadow-sm focus:shadow-md focus:scale-[1.01] text-lg h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-brand" htmlFor="customerId">
                      Customer ID Number (Optional)
                    </Label>
                    <Input
                      id="customerId"
                      placeholder="Enter 13-digit ID number"
                      value={formData.customerId}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customerId: e.target.value,
                        }))
                      }
                      maxLength={13}
                      className="text-brand transition-all duration-200 hover:shadow-sm focus:shadow-md focus:scale-[1.01]"
                    />
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <Label className="text-brand" htmlFor="assistanceDate">
                    Assistance Date
                  </Label>
                  <Input
                    id="assistanceDate"
                    className="text-brand transition-all duration-200 hover:shadow-sm focus:shadow-md focus:scale-[1.01]"
                    type="date"
                    value={formData.assistanceDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        assistanceDate: e.target.value,
                      }))
                    }
                    max={new Date().toISOString().slice(0, 10)}
                  />
                </div>

                <div className="space-y-2 mt-4">
                  <Label className="text-brand">Evidence Files</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 transition-all duration-300 hover:border-primary/30 hover:bg-muted/20">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="text-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 text-gray-300 transition-all duration-200 hover:scale-105 hover:shadow-md"
                      >
                        <Upload className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
                        Upload Files
                      </Button>
                      <p className="text-xs text-gray-300 mt-2">
                        Images, PDF, CSV, Word, or text files, max 5MB each, up
                        to 10 files
                      </p>
                    </div>
                  </div>

                  {/* Uploaded Files */}
                  {formData.evidence.length > 0 && (
                    <div className="space-y-2 animate-in slide-in-from-bottom-2 duration-300">
                      {formData.evidence.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted rounded transition-all duration-200 hover:shadow-sm hover:scale-[1.01]"
                        >
                          <div className="flex items-center gap-2 transition-all duration-200">
                            {file.type.startsWith("image/") ? (
                              <Camera className="h-4 w-4 transition-transform duration-200" />
                            ) : (
                              <FileText className="h-4 w-4 transition-transform duration-200" />
                            )}
                            <span className="text-sm truncate">
                              {file.name}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="transition-all duration-200 hover:scale-110 hover:bg-destructive/10"
                          >
                            <X className="h-4 w-4 transition-transform duration-200 hover:rotate-90" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2 mt-4">
                  <Label className="text-brand" htmlFor="notes">
                    Additional Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional information about the service provided..."
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    rows={3}
                    className="text-brand transition-all duration-200 hover:shadow-sm focus:shadow-md focus:scale-[1.01] resize-none"
                  />
                </div>

                {/* Commission Preview */}
                {selectedService && (
                  <Alert className="bg-transparent mt-4 transition-all duration-300 animate-in slide-in-from-bottom-2">
                    <CheckCircle className="h-4 w-4 transition-transform duration-300 animate-pulse" />
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <span>Estimated Commission:</span>
                        <span className="font-semibold text-gray-300 transition-all duration-200">
                          {selectedService.commissionType === "fixed"
                            ? `SZL ${selectedService.commission.toFixed(2)}`
                            : `${selectedService.commission}% of transaction`}
                        </span>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full button mt-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-none"
                  disabled={isSubmitting || !selectedService}
                  variant={"ghost"}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Submitting...
                    </span>
                  ) : (
                    "Submit Service Event"
                  )}
                </Button>

                {/* Validation Errors - Moved to bottom */}
                {validationErrors.length > 0 && (
                  <Alert className="mt-4 border-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        {validationErrors.map((error, index) => (
                          <div key={index}>• {error}</div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
