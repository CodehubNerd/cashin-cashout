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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Shield,
  Search,
  Filter,
  Download,
  FileText,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  Activity,
  BarChart3,
  Globe,
  Smartphone,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  deviceInfo: string;
  status: "success" | "failed" | "warning";
}

interface KYCRecord {
  id: string;
  distributorName: string;
  email: string;
  kycLevel: "basic" | "intermediate" | "advanced";
  status: "verified" | "pending" | "rejected" | "expired";
  submissionDate: string;
  verificationDate?: string;
  expiryDate?: string;
  documents: string[];
  riskScore: number;
}

interface SecurityAlert {
  id: string;
  type:
    | "ip_anomaly"
    | "device_fingerprint"
    | "suspicious_activity"
    | "multiple_logins";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  affectedUser: string;
  timestamp: string;
  status: "open" | "investigating" | "resolved";
  details: string;
}

export function ComplianceDashboard() {
  const { logout } = useAuth();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("7d");
  const [actionFilter, setActionFilter] = useState("all");
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Mock data - in real app this would come from API
  const complianceMetrics = {
    totalAuditLogs: 15247,
    todayLogs: 342,
    kycPending: 23,
    kycVerified: 1089,
    securityAlerts: 8,
    criticalAlerts: 2,
    complianceScore: 94.5,
    riskLevel: "low" as const,
  };

  const auditLogs: AuditLogEntry[] = [
    {
      id: "1",
      timestamp: "2024-02-20 14:30:25",
      userId: "user_123",
      userName: "John Smith",
      userRole: "distributor",
      action: "service_submission",
      resource: "Mobile Money Transfer",
      details: "Submitted service event for customer +27821234567",
      ipAddress: "192.168.1.100",
      deviceInfo: "Chrome 121.0 / Windows 10",
      status: "success",
    },
    {
      id: "2",
      timestamp: "2024-02-20 14:25:12",
      userId: "admin_456",
      userName: "Sarah Johnson",
      userRole: "business-admin",
      action: "staff_management",
      resource: "Staff Member",
      details: "Added new staff member: Michael Brown",
      ipAddress: "10.0.0.50",
      deviceInfo: "Safari 17.2 / macOS 14.2",
      status: "success",
    },
    {
      id: "3",
      timestamp: "2024-02-20 14:20:45",
      userId: "user_789",
      userName: "Emma Davis",
      userRole: "distributor",
      action: "login_attempt",
      resource: "Authentication",
      details: "Failed login attempt - invalid password",
      ipAddress: "203.0.113.45",
      deviceInfo: "Firefox 122.0 / Ubuntu 22.04",
      status: "failed",
    },
    {
      id: "4",
      timestamp: "2024-02-20 14:15:33",
      userId: "platform_001",
      userName: "System Admin",
      userRole: "platform-admin",
      action: "service_configuration",
      resource: "Service Catalog",
      details: "Updated commission rate for Bill Payment Service",
      ipAddress: "172.16.0.10",
      deviceInfo: "Chrome 121.0 / Windows 11",
      status: "success",
    },
  ];

  const kycRecords: KYCRecord[] = [
    {
      id: "1",
      distributorName: "John Smith",
      email: "john.smith@example.com",
      kycLevel: "advanced",
      status: "verified",
      submissionDate: "2024-01-15",
      verificationDate: "2024-01-18",
      expiryDate: "2025-01-18",
      documents: ["ID Document", "Proof of Address", "Bank Statement"],
      riskScore: 15,
    },
    {
      id: "2",
      distributorName: "Michael Brown",
      email: "michael.brown@example.com",
      kycLevel: "basic",
      status: "pending",
      submissionDate: "2024-02-15",
      documents: ["ID Document"],
      riskScore: 45,
    },
    {
      id: "3",
      distributorName: "Emma Davis",
      email: "emma.davis@example.com",
      kycLevel: "intermediate",
      status: "expired",
      submissionDate: "2023-02-20",
      verificationDate: "2023-02-25",
      expiryDate: "2024-02-25",
      documents: ["ID Document", "Proof of Address"],
      riskScore: 75,
    },
  ];

  const securityAlerts: SecurityAlert[] = [
    {
      id: "1",
      type: "ip_anomaly",
      severity: "high",
      description: "Unusual login pattern detected from multiple IP addresses",
      affectedUser: "john.smith@example.com",
      timestamp: "2024-02-20 13:45:00",
      status: "investigating",
      details: "User logged in from 3 different countries within 2 hours",
    },
    {
      id: "2",
      type: "multiple_logins",
      severity: "medium",
      description: "Concurrent sessions detected",
      affectedUser: "emma.davis@example.com",
      timestamp: "2024-02-20 12:30:00",
      status: "resolved",
      details: "User had active sessions on mobile and desktop simultaneously",
    },
    {
      id: "3",
      type: "suspicious_activity",
      severity: "critical",
      description: "Rapid service submissions detected",
      affectedUser: "michael.brown@example.com",
      timestamp: "2024-02-20 11:15:00",
      status: "open",
      details: "15 service events submitted within 5 minutes",
    },
  ];

  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const handleExportReport = (format: "pdf" | "excel") => {
    console.log(`[v0] Exporting compliance report as ${format}`);
    setShowExportDialog(false);
  };

  return (
    <div className="min-h-screen bg-brand">
      {/* Header */}
      <header className="border-outline bg-surface">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-heading">Compliance & Audit Portal</h1>
                <p className="text-secondary">
                  Monitor compliance and generate audit reports
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge
                variant={
                  complianceMetrics.riskLevel === "low"
                    ? "default"
                    : complianceMetrics.riskLevel === "medium"
                    ? "secondary"
                    : "destructive"
                }
                className="flex items-center gap-1"
              >
                <Activity className="h-3 w-3" />
                Risk Level: {complianceMetrics.riskLevel.toUpperCase()}
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
            <TabsTrigger value="kyc-monitoring">KYC Monitoring</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Compliance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-surface border-outline">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-label">Compliance Score</CardTitle>
                  <BarChart3 className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {complianceMetrics.complianceScore}%
                  </div>
                  <p className="text-description">
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    +2.1% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-surface border-outline">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-label">KYC Verified</CardTitle>
                  <CheckCircle className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-brand">
                    {complianceMetrics.kycVerified}
                  </div>
                  <p className="text-description">
                    {complianceMetrics.kycPending} pending
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-surface border-outline">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-label">Security Alerts</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {complianceMetrics.securityAlerts}
                  </div>
                  <p className="text-description">
                    {complianceMetrics.criticalAlerts} critical
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-surface border-outline">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-label">Audit Logs Today</CardTitle>
                  <FileText className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-brand">
                    {complianceMetrics.todayLogs}
                  </div>
                  <p className="text-description">
                    of {complianceMetrics.totalAuditLogs} total
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Critical Alerts */}
            {securityAlerts.filter((alert) => alert.severity === "critical")
              .length > 0 && (
              <Alert className="border-destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span>
                      You have{" "}
                      {
                        securityAlerts.filter(
                          (alert) => alert.severity === "critical"
                        ).length
                      }{" "}
                      critical security alerts that require immediate attention.
                    </span>
                    <Button variant="outline" size="sm">
                      Review Alerts
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    Generate Compliance Report
                  </CardTitle>
                  <CardDescription>
                    Export detailed compliance analytics
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    KYC Compliance Review
                  </CardTitle>
                  <CardDescription>
                    Review pending KYC verifications
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Security Monitoring
                  </CardTitle>
                  <CardDescription>
                    Monitor security alerts and anomalies
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit-logs" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-heading">Audit Logs</h2>
                <p className="text-secondary">
                  Comprehensive activity history and audit trail
                </p>
              </div>
              <Dialog
                open={showExportDialog}
                onOpenChange={setShowExportDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="button flex items-center gap-2 border-outline"
                  >
                    <Download className="h-4 w-4" />
                    Export Logs
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Export Audit Logs</DialogTitle>
                    <DialogDescription>
                      Choose export format and date range
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Date Range</Label>
                      <Select defaultValue="7d">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1d">Last 24 hours</SelectItem>
                          <SelectItem value="7d">Last 7 days</SelectItem>
                          <SelectItem value="30d">Last 30 days</SelectItem>
                          <SelectItem value="90d">Last 90 days</SelectItem>
                          <SelectItem value="custom">Custom range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleExportReport("pdf")}
                        className="flex-1"
                      >
                        Export as PDF
                      </Button>
                      <Button
                        onClick={() => handleExportReport("excel")}
                        variant="outline"
                        className="flex-1"
                      >
                        Export as Excel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search audit logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="login_attempt">Login Attempts</SelectItem>
                  <SelectItem value="service_submission">
                    Service Submissions
                  </SelectItem>
                  <SelectItem value="staff_management">
                    Staff Management
                  </SelectItem>
                  <SelectItem value="service_configuration">
                    Service Config
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Today</SelectItem>
                  <SelectItem value="7d">7 days</SelectItem>
                  <SelectItem value="30d">30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Audit Logs Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAuditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {log.timestamp}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-brand">
                              {log.userName}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {log.userRole}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {log.action.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{log.resource}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {log.ipAddress}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Smartphone className="h-3 w-3" />
                            <span className="text-xs">{log.deviceInfo}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              log.status === "success"
                                ? "default"
                                : log.status === "failed"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* KYC Monitoring Tab */}
          <TabsContent value="kyc-monitoring" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-heading">KYC Compliance Monitoring</h2>
                <p className="text-secondary">
                  Track verification levels and compliance status
                </p>
              </div>
              <Button
                variant="outline"
                className="button flex items-center gap-2 border-outline"
              >
                <Download className="h-4 w-4" />
                Export KYC Report
              </Button>
            </div>

            {/* KYC Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-surface border-outline">
                <CardHeader>
                  <CardTitle className="text-lg">Verified</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {kycRecords.filter((r) => r.status === "verified").length}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-surface border-outline">
                <CardHeader>
                  <CardTitle className="text-lg">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {kycRecords.filter((r) => r.status === "pending").length}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-surface border-outline">
                <CardHeader>
                  <CardTitle className="text-lg">Expired</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {kycRecords.filter((r) => r.status === "expired").length}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-surface border-outline">
                <CardHeader>
                  <CardTitle className="text-lg">High Risk</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {kycRecords.filter((r) => r.riskScore > 70).length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* KYC Records Table */}
            <Card>
              <CardHeader>
                <CardTitle>KYC Records</CardTitle>
                <CardDescription>
                  Detailed verification status and compliance tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Distributor</TableHead>
                      <TableHead>KYC Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Submission Date</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Documents</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kycRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-brand">
                              {record.distributorName}
                            </p>
                            <p className="text-description">{record.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              record.kycLevel === "advanced"
                                ? "default"
                                : record.kycLevel === "intermediate"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {record.kycLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              record.status === "verified"
                                ? "default"
                                : record.status === "pending"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                record.riskScore <= 30
                                  ? "bg-green-500"
                                  : record.riskScore <= 70
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                            />
                            {record.riskScore}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(record.submissionDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {record.expiryDate
                            ? new Date(record.expiryDate).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {record.documents.slice(0, 2).map((doc, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {doc}
                              </Badge>
                            ))}
                            {record.documents.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{record.documents.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-heading">Security Monitoring</h2>
                <p className="text-secondary">
                  Monitor security alerts and anomalies
                </p>
              </div>
              <Button
                variant="outline"
                className="button flex items-center gap-2 border-outline"
              >
                <Download className="h-4 w-4" />
                Export Security Report
              </Button>
            </div>

            {/* Security Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Active Security Alerts</CardTitle>
                <CardDescription>Incidents requiring attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {securityAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 border rounded-lg ${
                      alert.severity === "critical"
                        ? "border-red-200 bg-red-50"
                        : alert.severity === "high"
                        ? "border-orange-200 bg-orange-50"
                        : "border-yellow-200 bg-yellow-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant={
                              alert.severity === "critical"
                                ? "destructive"
                                : alert.severity === "high"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {alert.type.replace("_", " ")}
                          </Badge>
                          <Badge
                            variant={
                              alert.status === "open"
                                ? "destructive"
                                : alert.status === "investigating"
                                ? "secondary"
                                : "default"
                            }
                          >
                            {alert.status}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-brand mb-1">
                          {alert.description}
                        </h4>
                        <p className="text-description mb-2">{alert.details}</p>
                        <div className="flex items-center gap-4 text-description">
                          <span>User: {alert.affectedUser}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {alert.timestamp}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {alert.status === "open" && (
                          <Button size="sm">Investigate</Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Security Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-surface border-outline">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-500" />
                    IP Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-option">Unique IPs (24h)</span>
                      <span className="font-semibold text-brand">247</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-option">Suspicious IPs</span>
                      <span className="font-semibold text-orange-600">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-option">Blocked IPs</span>
                      <span className="font-semibold text-red-600">1</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-surface border-outline">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-green-500" />
                    Device Fingerprinting
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-option">Unique Devices</span>
                      <span className="font-semibold text-brand">1,089</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-option">New Devices (24h)</span>
                      <span className="font-semibold text-brand">23</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-option">Flagged Devices</span>
                      <span className="font-semibold text-orange-600">2</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-surface border-outline">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    Threat Detection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-option">Failed Logins (24h)</span>
                      <span className="font-semibold text-brand">15</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-option">Brute Force Attempts</span>
                      <span className="font-semibold text-red-600">2</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-option">Anomalous Patterns</span>
                      <span className="font-semibold text-orange-600">5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
