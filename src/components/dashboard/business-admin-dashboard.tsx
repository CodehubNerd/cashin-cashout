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
import {
  DollarSign,
  Users,
  TrendingUp,
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  UserPlus,
  BarChart3,
  Home,
} from "lucide-react";
import logo from "@/assets/logos/logo.svg";
interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  status: "active" | "inactive" | "pending";
  totalEarnings: number;
  monthlyEvents: number;
  kycStatus: "verified" | "pending" | "rejected";
}

interface BusinessMetrics {
  totalStaff: number;
  activeStaff: number;
  totalEarnings: number;
  monthlyEarnings: number;
  totalEvents: number;
  monthlyEvents: number;
  walletBalance: number;
}

export function BusinessAdminDashboard() {
  const { logout } = useAuth();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddStaffDialog, setShowAddStaffDialog] = useState(false);

  // Mock data - in real app this would come from API
  const businessMetrics: BusinessMetrics = {
    totalStaff: 12,
    activeStaff: 10,
    totalEarnings: 45250.75,
    monthlyEarnings: 8420.5,
    totalEvents: 342,
    monthlyEvents: 67,
    walletBalance: 12450.25,
  };

  const staffMembers: StaffMember[] = [
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "+27 82 123 4567",
      joinDate: "2024-01-15",
      status: "active",
      totalEarnings: 3420.75,
      monthlyEvents: 15,
      kycStatus: "verified",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      phone: "+27 83 234 5678",
      joinDate: "2024-02-01",
      status: "active",
      totalEarnings: 2890.5,
      monthlyEvents: 12,
      kycStatus: "verified",
    },
    {
      id: "3",
      name: "Michael Brown",
      email: "michael.brown@example.com",
      phone: "+27 84 345 6789",
      joinDate: "2024-02-15",
      status: "pending",
      totalEarnings: 0,
      monthlyEvents: 0,
      kycStatus: "pending",
    },
    {
      id: "4",
      name: "Emma Davis",
      email: "emma.davis@example.com",
      phone: "+27 85 456 7890",
      joinDate: "2024-01-20",
      status: "active",
      totalEarnings: 4125.25,
      monthlyEvents: 18,
      kycStatus: "verified",
    },
  ];

  const recentTransactions = [
    {
      id: "1",
      type: "commission",
      description: "Staff Commission Payout - Week 8",
      amount: -1250.75,
      date: "2024-02-20",
      status: "completed",
    },
    {
      id: "2",
      type: "earning",
      description: "Business Commission - Mobile Money Services",
      amount: 2450.5,
      date: "2024-02-19",
      status: "completed",
    },
    {
      id: "3",
      type: "commission",
      description: "Staff Commission Payout - John Smith",
      amount: -340.25,
      date: "2024-02-18",
      status: "completed",
    },
    {
      id: "4",
      type: "earning",
      description: "Business Commission - Bill Payment Services",
      amount: 890.75,
      date: "2024-02-17",
      status: "completed",
    },
  ];

  const filteredStaff = staffMembers.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || staff.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const [newStaffData, setNewStaffData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleAddStaff = () => {
    console.log("[v0] Adding new staff member:", newStaffData);
    setNewStaffData({ name: "", email: "", phone: "" });
    setShowAddStaffDialog(false);
  };

  return (
    <div className="min-h-screen bg-brand">
      {/* Header */}
      <header className="border-outline bg-surface">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} width={40} height={40} alt="Logo" />
              <div>
                <h1 className="text-heading text-lg sm:text-xl">Business</h1>
                <p className="text-secondary text-sm sm:text-base">
                  Admin Portal
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
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
          <TabsList className="grid w-full grid-cols-4 bg-surface">
            <TabsTrigger
              className="text-brand data-[state=active]:bg-accent data-[state=active]:text-black flex items-center gap-2"
              value="overview"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              className="text-brand data-[state=active]:bg-accent data-[state=active]:text-black flex items-center gap-2"
              value="staff"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Staff</span>
            </TabsTrigger>
            <TabsTrigger
              className="text-brand data-[state=active]:bg-accent data-[state=active]:text-black flex items-center gap-2"
              value="financial"
            >
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Financial</span>
            </TabsTrigger>
            <TabsTrigger
              className="text-brand data-[state=active]:bg-accent data-[state=active]:text-black flex items-center gap-2"
              value="reports"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-surface border-outline">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-label">Total Staff</CardTitle>
                  <Users className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-brand">
                    {businessMetrics.totalStaff}
                  </div>
                  <p className="text-description">
                    {businessMetrics.activeStaff} active
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-surface border-outline">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-label">Monthly Earnings</CardTitle>
                  <DollarSign className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-brand">
                    SZL {businessMetrics.monthlyEarnings.toFixed(2)}
                  </div>
                  <p className="text-description">
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    +15% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-surface border-outline">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-label">Monthly Events</CardTitle>
                  <FileText className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-brand">
                    {businessMetrics.monthlyEvents}
                  </div>
                  <p className="text-description">Across all staff</p>
                </CardContent>
              </Card>

              <Card className="bg-surface border-outline">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-label">Wallet Balance</CardTitle>
                  <Wallet className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-brand">
                    SZL {businessMetrics.walletBalance.toFixed(2)}
                  </div>
                  <p className="text-description">Available for payout</p>
                </CardContent>
              </Card>
            </div>

            {/* Top Performers */}
            <Card className="bg-surface border-outline">
              <CardHeader>
                <CardTitle className="text-form-title">
                  Top Performing Staff
                </CardTitle>
                <CardDescription className="text-secondary">
                  This month's highest earners
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {staffMembers
                    .filter((staff) => staff.status === "active")
                    .sort((a, b) => b.monthlyEvents - a.monthlyEvents)
                    .slice(0, 3)
                    .map((staff, index) => (
                      <div
                        key={staff.id}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0
                                ? "bg-yellow-500 text-white"
                                : index === 1
                                ? "bg-gray-400 text-white"
                                : "bg-amber-600 text-white"
                            }`}
                          >
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-brand">
                              {staff.name}
                            </p>
                            <p className="text-description">
                              {staff.monthlyEvents} events
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-brand">
                            SZL {staff.totalEarnings.toFixed(2)}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {staff.kycStatus}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Staff Management Tab */}
          <TabsContent value="staff" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-heading text-lg sm:text-xl">
                  Distributers
                </h2>
                <p className="text-secondary text-sm sm:text-base">
                  Manage your business staff members
                </p>
              </div>
              <Dialog
                open={showAddStaffDialog}
                onOpenChange={setShowAddStaffDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="button flex items-center gap-2 border-outline"
                  >
                    <UserPlus className="h-4 w-4" />
                    Add Distributer
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-surface text-brand">
                  <DialogHeader>
                    <DialogTitle>Add Distributer</DialogTitle>
                    <DialogDescription>
                      Invite a member to join your business
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="staffName">Full Name</Label>
                      <Input
                        id="staffName"
                        placeholder="Enter full name"
                        value={newStaffData.name}
                        onChange={(e) =>
                          setNewStaffData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="staffEmail">Email Address</Label>
                      <Input
                        id="staffEmail"
                        type="email"
                        placeholder="Enter email address"
                        value={newStaffData.email}
                        onChange={(e) =>
                          setNewStaffData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="staffPhone">Phone Number</Label>
                      <Input
                        id="staffPhone"
                        placeholder="Enter phone number"
                        value={newStaffData.phone}
                        onChange={(e) =>
                          setNewStaffData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <Button
                      onClick={handleAddStaff}
                      variant="outline"
                      className="button w-full border-outline"
                    >
                      Send Invitation
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search staff members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Staff Table */}
            <Card className="text-brand bg-surface text-brand">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-brand">Staff Member</TableHead>
                      <TableHead className="text-brand">Contact</TableHead>
                      <TableHead className="text-brand">Status</TableHead>
                      <TableHead className="text-brand">KYC</TableHead>
                      <TableHead className="text-brand">
                        Monthly Events
                      </TableHead>
                      <TableHead className="text-brand">
                        Total Earnings
                      </TableHead>
                      <TableHead className="text-brand">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaff.map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-brand">
                              {staff.name}
                            </p>
                            <p className="text-description">
                              Joined{" "}
                              {new Date(staff.joinDate).toLocaleDateString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-option">{staff.email}</p>
                            <p className="text-description">{staff.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              staff.status === "active"
                                ? "default"
                                : staff.status === "pending"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {staff.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              staff.kycStatus === "verified"
                                ? "default"
                                : staff.kycStatus === "pending"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {staff.kycStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>{staff.monthlyEvents}</TableCell>
                        <TableCell>
                          SZL {staff.totalEarnings.toFixed(2)}
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

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-heading text-lg sm:text-xl">
                  Financial Management
                </h2>
                <p className="text-secondary text-sm sm:text-base">
                  Track earnings, payouts, and wallet balance
                </p>
              </div>
              <Button
                variant="outline"
                className="button flex items-center gap-2 border-outline"
              >
                <Download className="h-4 w-4" />
                Export Financial Report
              </Button>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-surface border-outline">
                <CardHeader>
                  <CardTitle className="text-lg text-brand">
                    Total Lifetime Earnings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-brand">
                    SZL {businessMetrics.totalEarnings.toFixed(2)}
                  </div>
                  <p className="text-description mt-2">
                    From {businessMetrics.totalEvents} service events
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-surface border-outline">
                <CardHeader>
                  <CardTitle className="text-lg text-brand">
                    Available Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-brand">
                    SZL {businessMetrics.walletBalance.toFixed(2)}
                  </div>
                  <Button
                    className="text-brand mt-2"
                    variant={"ghost"}
                    size="sm"
                  >
                    Request Payout
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-surface border-outline">
                <CardHeader>
                  <CardTitle className="text-lg text-brand">
                    Monthly Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-brand">
                    SZL {businessMetrics.monthlyEarnings.toFixed(2)}
                  </div>
                  <p className="text-description mt-2">+15% from last month</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="card bg-surface text-brand">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest financial activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            transaction.type === "earning"
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {transaction.type === "earning" ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-brand">
                            {transaction.description}
                          </p>
                          <p className="text-description flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            transaction.amount > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.amount > 0 ? "+" : ""}SZL
                          {Math.abs(transaction.amount).toFixed(2)}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-heading text-lg sm:text-xl">
                  Business Reports
                </h2>
                <p className="text-secondary text-sm sm:text-base">
                  Generate detailed analytics and reports
                </p>
              </div>
              <Button
                variant="outline"
                className="button flex items-center gap-2 border-outline"
              >
                <BarChart3 className="h-4 w-4" />
                Generate Custom Report
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-surface border-outline">
                <CardHeader>
                  <CardTitle className="text-brand">
                    Performance Analytics
                  </CardTitle>
                  <CardDescription>
                    Staff performance and business metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Detailed performance analytics coming soon...
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-surface border-outline">
                <CardHeader>
                  <CardTitle className="text-brand">
                    Financial Reports
                  </CardTitle>
                  <CardDescription>
                    Revenue, commissions, and payout tracking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Financial reporting features coming soon...
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
