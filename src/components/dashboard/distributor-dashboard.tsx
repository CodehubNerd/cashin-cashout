import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceSwitchHeader } from "@/components/ServiceSwitchHeader";
import {
  DollarSign,
  TrendingUp,
  Clock,
  Users,
  FileText,
  Award,
  Plus,
  CheckCircle,
  AlertCircle,
  Calendar,
} from "lucide-react";

export function DistributorDashboard() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");

  const metrics = {
    daily: { earnings: 125.5, events: 3, rank: 15 },
    weekly: { earnings: 875.25, events: 18, rank: 12 },
    monthly: { earnings: 3420.75, events: 67, rank: 8 },
  };

  const commissionSummary = {
    pending: 245.5,
    approved: 1875.25,
    paid: 8950.0,
  };

  const recentActivities = [
    {
      id: 1,
      type: "service",
      description: "Mobile Money Transfer - Customer #4521",
      amount: 15.5,
      status: "approved",
      time: "2 hours ago",
    },
    {
      id: 2,
      type: "service",
      description: "Airtime Purchase - Customer #4520",
      amount: 8.25,
      status: "pending",
      time: "4 hours ago",
    },
    {
      id: 3,
      type: "education",
      description: "Completed: Advanced Mobile Money Guide",
      amount: null,
      status: "completed",
      time: "1 day ago",
    },
    {
      id: 4,
      type: "service",
      description: "Bill Payment - Customer #4519",
      amount: 22.75,
      status: "approved",
      time: "1 day ago",
    },
  ];

  const currentMetrics = metrics[selectedPeriod as keyof typeof metrics];

  return (
    <div className="min-h-screen bg-brand">
      <ServiceSwitchHeader currentService="daas" title="Distributor Portal" />

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-form-title mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="button flex items-center gap-2 border-outline"
              onClick={() => navigate("/distributor/submit-service")}
            >
              <Plus className="h-4 w-4" />
              Submit Service Event
            </Button>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-form-title">Performance Overview</h2>
            <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <TabsList className="bg-surface border-outline">
                <TabsTrigger
                  value="daily"
                  className="text-brand data-[state=active]:bg-accent data-[state=active]:text-black"
                >
                  Daily
                </TabsTrigger>
                <TabsTrigger
                  value="weekly"
                  className="text-brand data-[state=active]:bg-accent data-[state=active]:text-black"
                >
                  Weekly
                </TabsTrigger>
                <TabsTrigger
                  value="monthly"
                  className="text-brand data-[state=active]:bg-accent data-[state=active]:text-black"
                >
                  Monthly
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-surface border-outline">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-label">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-brand">
                  SZL{currentMetrics.earnings.toFixed(2)}
                </div>
                <p className="text-description">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +12% from last period
                </p>
              </CardContent>
            </Card>

            <Card className="bg-surface border-outline">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-label">Service Events</CardTitle>
                <FileText className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-brand">
                  {currentMetrics.events}
                </div>
                <p className="text-description">
                  <Clock className="inline h-3 w-3 mr-1" />
                  {selectedPeriod} total
                </p>
              </CardContent>
            </Card>

            <Card className="bg-surface border-outline">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-label">Leaderboard Rank</CardTitle>
                <Award className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-brand">
                  #{currentMetrics.rank}
                </div>
                <p className="text-description">
                  <Users className="inline h-3 w-3 mr-1" />
                  Out of 150 distributors
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Commission Summary */}
          <Card className="bg-surface border-outline">
            <CardHeader>
              <CardTitle className="text-form-title">
                Commission Summary
              </CardTitle>
              <CardDescription className="text-secondary">
                Your earnings breakdown
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span className="text-option">Pending</span>
                </div>
                <span className="font-semibold text-brand">
                  SZL{commissionSummary.pending.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-option">Approved</span>
                </div>
                <span className="font-semibold text-brand">
                  SZL{commissionSummary.approved.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-option">Paid</span>
                </div>
                <span className="font-semibold text-brand">
                  SZL{commissionSummary.paid.toFixed(2)}
                </span>
              </div>
              <div className="pt-2 border-t border-outline">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span className="text-brand">Total Lifetime</span>
                  <span className="text-brand">
                    SZL
                    {(
                      commissionSummary.pending +
                      commissionSummary.approved +
                      commissionSummary.paid
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="bg-surface border-outline">
            <CardHeader>
              <CardTitle className="text-form-title">
                Recent Activities
              </CardTitle>
              <CardDescription className="text-secondary">
                Your latest service events and progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between py-2 border-b border-outline last:border-b-0"
                  >
                    <div className="flex-1">
                      <p className="text-option font-medium">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={
                            activity.status === "approved"
                              ? "default"
                              : activity.status === "pending"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {activity.status}
                        </Badge>
                        <span className="text-description flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {activity.time}
                        </span>
                      </div>
                    </div>
                    {activity.amount && (
                      <div className="text-option font-semibold text-brand">
                        +SZL{activity.amount.toFixed(2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
