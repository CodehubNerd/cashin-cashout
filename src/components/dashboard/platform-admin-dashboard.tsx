"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Settings,
  Users,
  FileText,
  Shield,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,
  Flag,
  Gift,
  TrendingUp,
  Activity,
} from "lucide-react";

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  commission: number;
  commissionType: "fixed" | "percentage";
  description: string;
  active: boolean;
  createdDate: string;
  totalEvents: number;
}

interface DistributorOverview {
  id: string;
  name: string;
  email: string;
  role: string;
  kycStatus: "verified" | "pending" | "rejected";
  totalEarnings: number;
  monthlyEvents: number;
  joinDate: string;
  status: "active" | "inactive" | "suspended";
  lastActivity: string;
}

interface FlaggedEvent {
  id: string;
  distributorName: string;
  serviceName: string;
  customerPhone: string;
  amount: number;
  flagReason: string;
  submissionTime: string;
  status: "pending" | "approved" | "rejected";
  priority: "high" | "medium" | "low";
}

export function PlatformAdminDashboard() {
  const { logout } = useAuth();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddServiceDialog, setShowAddServiceDialog] = useState(false);

  // Mock data - in real app this would come from API
  const platformMetrics = {
    totalDistributors: 1247,
    activeDistributors: 1089,
    totalServices: 12,
    activeServices: 10,
    pendingEvents: 23,
    flaggedEvents: 8,
    totalRevenue: 125420.75,
    monthlyRevenue: 28450.5,
  };

  const services: ServiceItem[] = [
    {
      id: "1",
      name: "Mobile Money Transfer",
      category: "Financial Services",
      commission: 15.5,
      commissionType: "fixed",
      description: "Assist customers with mobile money transfers",
      active: true,
      createdDate: "2024-01-15",
      totalEvents: 1247,
    },
    {
      id: "2",
      name: "Airtime Purchase",
      category: "Telecommunications",
      commission: 5,
      commissionType: "percentage",
      description: "Help customers purchase airtime",
      active: true,
      createdDate: "2024-01-20",
      totalEvents: 892,
    },
    {
      id: "3",
      name: "Bill Payment Service",
      category: "Utilities",
      commission: 22.75,
      commissionType: "fixed",
      description: "Assist with utility bill payments",
      active: false,
      createdDate: "2024-02-01",
      totalEvents: 456,
    },
  ];

  const distributors: DistributorOverview[] = [
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@example.com",
      role: "distributor",
      kycStatus: "verified",
      totalEarnings: 3420.75,
      monthlyEvents: 15,
      joinDate: "2024-01-15",
      status: "active",
      lastActivity: "2 hours ago",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      role: "business-admin",
      kycStatus: "verified",
      totalEarnings: 8950.5,
      monthlyEvents: 45,
      joinDate: "2024-01-10",
      status: "active",
      lastActivity: "1 hour ago",
    },
    {
      id: "3",
      name: "Michael Brown",
      email: "michael.brown@example.com",
      role: "distributor",
      kycStatus: "pending",
      totalEarnings: 0,
      monthlyEvents: 0,
      joinDate: "2024-02-15",
      status: "inactive",
      lastActivity: "3 days ago",
    },
  ];

  const flaggedEvents: FlaggedEvent[] = [
    {
      id: "1",
      distributorName: "John Smith",
      serviceName: "Mobile Money Transfer",
      customerPhone: "+27 82 123 4567",
      amount: 15.5,
      flagReason: "Duplicate submission detected",
      submissionTime: "2024-02-20 14:30",
      status: "pending",
      priority: "high",
    },
    {
      id: "2",
      distributorName: "Emma Davis",
      serviceName: "Bill Payment",
      customerPhone: "+27 83 234 5678",
      amount: 22.75,
      flagReason: "Unusual timing pattern",
      submissionTime: "2024-02-20 13:15",
      status: "pending",
      priority: "medium",
    },
  ];

  const [newServiceData, setNewServiceData] = useState({
    name: "",
    category: "",
    commission: "",
    commissionType: "fixed" as "fixed" | "percentage",
    description: "",
  });

  const handleAddService = () => {
    console.log("[v0] Adding new service:", newServiceData);
    setNewServiceData({
      name: "",
      category: "",
      commission: "",
      commissionType: "fixed",
      description: "",
    });
    setShowAddServiceDialog(false);
  };

  const handleApproveEvent = (eventId: string) => {
    console.log("[v0] Approving flagged event:", eventId);
  };

  const handleRejectEvent = (eventId: string) => {
    console.log("[v0] Rejecting flagged event:", eventId);
  };

  return (
    <div className="min-h-screen bg-brand">
      {/* Header */}
      <header className="border-outline bg-surface">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-heading">Platform Administration</h1>
                <p className="text-secondary">
                  System-wide management and configuration
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                System Status: Operational
              </Badge>
              <Button
                variant="outline"
                className="button border-outline"
                onClick={logout}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="distributors">Distributors</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Platform Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-surface border-outline">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-label">
                    Total Distributors
                  </CardTitle>
                  <Users className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-brand">
                    {platformMetrics.totalDistributors}
                  </div>
                  <p className="text-description">
                    {platformMetrics.activeDistributors} active
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-surface border-outline">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-label">Active Services</CardTitle>
                  <FileText className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-brand">
                    {platformMetrics.activeServices}
                  </div>
                  <p className="text-description">
                    of {platformMetrics.totalServices} total
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-surface border-outline">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-label">Monthly Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-brand">
                    ${platformMetrics.monthlyRevenue.toFixed(2)}
                  </div>
                  <p className="text-description">
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    +18% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-surface border-outline">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-label">Flagged Events</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {platformMetrics.flaggedEvents}
                  </div>
                  <p className="text-description">Require review</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flag className="h-5 w-5 text-orange-500" />
                    Review Flagged Events
                  </CardTitle>
                  <CardDescription>
                    {platformMetrics.flaggedEvents} events need attention
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    KYC Monitoring
                  </CardTitle>
                  <CardDescription>Monitor compliance levels</CardDescription>
                </CardHeader>
              </Card>

              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-500" />
                    System Analytics
                  </CardTitle>
                  <CardDescription>View performance metrics</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-heading">Service Management</h2>
                <p className="text-secondary">
                  Manage service catalog and commission configuration
                </p>
              </div>
              <Dialog
                open={showAddServiceDialog}
                onOpenChange={setShowAddServiceDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="button flex items-center gap-2 border-outline"
                  >
                    <Plus className="h-4 w-4" />
                    Add New Service
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Service</DialogTitle>
                    <DialogDescription>
                      Create a new service for distributors
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="serviceName">Service Name</Label>
                      <Input
                        id="serviceName"
                        placeholder="Enter service name"
                        value={newServiceData.name}
                        onChange={(e) =>
                          setNewServiceData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="serviceCategory">Category</Label>
                      <Select
                        value={newServiceData.category}
                        onValueChange={(value) =>
                          setNewServiceData((prev) => ({
                            ...prev,
                            category: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Financial Services">
                            Financial Services
                          </SelectItem>
                          <SelectItem value="Telecommunications">
                            Telecommunications
                          </SelectItem>
                          <SelectItem value="Utilities">Utilities</SelectItem>
                          <SelectItem value="Insurance">Insurance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="commissionType">Commission Type</Label>
                      <Select
                        value={newServiceData.commissionType}
                        onValueChange={(value: "fixed" | "percentage") =>
                          setNewServiceData((prev) => ({
                            ...prev,
                            commissionType: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Fixed Amount</SelectItem>
                          <SelectItem value="percentage">Percentage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="commission">
                        Commission{" "}
                        {newServiceData.commissionType === "fixed"
                          ? "Amount ($)"
                          : "Percentage (%)"}
                      </Label>
                      <Input
                        id="commission"
                        type="number"
                        placeholder={
                          newServiceData.commissionType === "fixed"
                            ? "15.50"
                            : "5"
                        }
                        value={newServiceData.commission}
                        onChange={(e) =>
                          setNewServiceData((prev) => ({
                            ...prev,
                            commission: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Service description"
                        value={newServiceData.description}
                        onChange={(e) =>
                          setNewServiceData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <Button
                      onClick={handleAddService}
                      variant="outline"
                      className="button w-full border-outline"
                    >
                      Create Service
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Services Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total Events</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-brand">
                              {service.name}
                            </p>
                            <p className="text-description">
                              {service.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{service.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {service.commissionType === "fixed"
                              ? `${service.commission.toFixed(2)}`
                              : `${service.commission}%`}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={service.active ? "default" : "secondary"}
                          >
                            {service.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>{service.totalEvents}</TableCell>
                        <TableCell>
                          {new Date(service.createdDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Distributors Tab */}
          <TabsContent value="distributors" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-heading">Distributor Management</h2>
                <p className="text-secondary">
                  Monitor and manage all distributors
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="button flex items-center gap-2 border-outline"
                >
                  <Upload className="h-4 w-4" />
                  Bulk Import
                </Button>
                <Button
                  variant="outline"
                  className="button flex items-center gap-2 border-outline"
                >
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search distributors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Distributors Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Distributor</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>KYC Status</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Monthly Events</TableHead>
                      <TableHead>Total Earnings</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {distributors.map((distributor) => (
                      <TableRow key={distributor.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-brand">
                              {distributor.name}
                            </p>
                            <p className="text-description">
                              {distributor.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{distributor.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              distributor.kycStatus === "verified"
                                ? "default"
                                : distributor.kycStatus === "pending"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {distributor.kycStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              distributor.status === "active"
                                ? "default"
                                : distributor.status === "inactive"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {distributor.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{distributor.monthlyEvents}</TableCell>
                        <TableCell>
                          ${distributor.totalEarnings.toFixed(2)}
                        </TableCell>
                        <TableCell>{distributor.lastActivity}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-heading">Event Review & Compliance</h2>
                <p className="text-secondary">
                  Review flagged events and monitor compliance
                </p>
              </div>
              <Button
                variant="outline"
                className="button flex items-center gap-2 border-outline"
              >
                <Download className="h-4 w-4" />
                Export Audit Log
              </Button>
            </div>

            {/* Flagged Events Alert */}
            {flaggedEvents.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You have {flaggedEvents.length} flagged events that require
                  immediate review.
                </AlertDescription>
              </Alert>
            )}

            {/* Flagged Events Table */}
            <Card>
              <CardHeader>
                <CardTitle>Flagged Events Queue</CardTitle>
                <CardDescription>
                  Events requiring manual review
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Distributor</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Flag Reason</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flaggedEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <p className="font-medium text-brand">
                            {event.distributorName}
                          </p>
                        </TableCell>
                        <TableCell>{event.serviceName}</TableCell>
                        <TableCell>{event.customerPhone}</TableCell>
                        <TableCell>${event.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{event.flagReason}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              event.priority === "high"
                                ? "destructive"
                                : event.priority === "medium"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {event.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {event.submissionTime}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 hover:text-green-700 bg-transparent"
                              onClick={() => handleApproveEvent(event.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 bg-transparent"
                              onClick={() => handleRejectEvent(event.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Fraud Detection Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-surface border-outline">
                <CardHeader>
                  <CardTitle className="text-lg">IP Anomalies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">3</div>
                  <p className="text-description">
                    Suspicious IP patterns detected
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-surface border-outline">
                <CardHeader>
                  <CardTitle className="text-lg">Duplicate Attempts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">5</div>
                  <p className="text-description">
                    Potential duplicate submissions
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-surface border-outline">
                <CardHeader>
                  <CardTitle className="text-lg">Timing Violations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">2</div>
                  <p className="text-description">24-hour rule violations</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-heading">Rewards & Recognition</h2>
                <p className="text-secondary">
                  Manage vouchers and leaderboard configuration
                </p>
              </div>
              <Button
                variant="outline"
                className="button flex items-center gap-2 border-outline"
              >
                <Gift className="h-4 w-4" />
                Issue New Voucher
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-surface border-outline">
                <CardHeader>
                  <CardTitle>Voucher Management</CardTitle>
                  <CardDescription>
                    Issue and track gift vouchers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Voucher management features coming soon...
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-surface border-outline">
                <CardHeader>
                  <CardTitle>Leaderboard Configuration</CardTitle>
                  <CardDescription>
                    Set ranking criteria and reward thresholds
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Leaderboard configuration coming soon...
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
