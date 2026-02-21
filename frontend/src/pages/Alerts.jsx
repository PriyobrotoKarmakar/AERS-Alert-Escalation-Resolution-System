import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, History, CheckCircle2, AlertCircle } from "lucide-react";
import { getAlerts, getAlertDetails, resolveAlertManual } from "@/api/alerts";

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAlerts();
      setAlerts(response.data);
    } catch (err) {
      setError(err.message || "Failed to fetch alerts");
      console.error("Alerts fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const openAlertDetails = async (alert) => {
    try {
      const response = await getAlertDetails(alert.id || alert.alertId);
      setSelectedAlert(response.data);
      setIsDialogOpen(true);
    } catch (err) {
      console.error("Failed to fetch alert details:", err);
      // Fallback to showing the alert from the list
      setSelectedAlert(alert);
      setIsDialogOpen(true);
    }
  };

  const handleResolve = async () => {
  if (!selectedAlert) return;

  setResolving(true);
  try {
    await resolveAlertManual(selectedAlert.id || selectedAlert.alertId);
    // Update local state
    setAlerts(
      alerts.map((a) =>
        (a.id || a.alertId) === (selectedAlert.id || selectedAlert.alertId)
          ? { ...a, status: "RESOLVED" }
          : a
      )
    );
    setSelectedAlert({ ...selectedAlert, status: "RESOLVED" });
  } catch (err) {
    console.error("Failed to resolve alert:", err);
    alert("Failed to resolve alert. Please try again.");
  } finally {
    setResolving(false);
  }
};
  const filteredAlerts = alerts.filter(
    (alert) =>
      (alert.id || alert.alertId || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (alert.driverId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alert.sourceType || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusBadge = (status) => {
    if (status === "ESCALATED")
      return <Badge variant="destructive">{status}</Badge>;
    if (status === "AUTO-CLOSED")
      return (
        <Badge variant="outline" className="text-green-600 border-green-600">
          {status}
        </Badge>
      );
    if (status === "RESOLVED")
      return <Badge variant="secondary">{status}</Badge>;
    return <Badge>{status}</Badge>;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Failed to Load Alerts
            </h3>
            <p className="text-sm text-slate-500 text-center mb-4">{error}</p>
            <button
              onClick={fetchAlerts}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          Alert Investigation
        </h2>
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search alerts or drivers..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg bg-white dark:bg-slate-950">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Alert ID</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Driver ID</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => (
                <TableRow
                  key={alert.id || alert.alertId}
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900"
                  onClick={() => openAlertDetails(alert)}
                >
                  <TableCell className="font-medium">
                    {alert.id || alert.alertId}
                  </TableCell>
                  <TableCell>{alert.sourceType}</TableCell>
                  <TableCell>{alert.driverId}</TableCell>
                  <TableCell>
                    <span
                      className={`text-sm ${alert.severity === "Critical" ? "text-red-600 font-semibold" : ""}`}
                    >
                      {alert.severity}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(alert.status)}</TableCell>
                  <TableCell className="text-right text-slate-500">
                    {alert.timestamp
                      ? new Date(alert.timestamp).toLocaleString()
                      : "-"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-slate-500"
                >
                  No alerts found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedAlert && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Alert Details: {selectedAlert.id}</span>
                  {getStatusBadge(selectedAlert.status)}
                </DialogTitle>
                <DialogDescription>
                  Detailed metadata and state transition history.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500">
                    Driver ID
                  </p>
                  <p className="font-medium">{selectedAlert.driverId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500">Vehicle</p>
                  <p className="font-medium">{selectedAlert.vehicle}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500">
                    Source Type
                  </p>
                  <p className="font-medium">{selectedAlert.sourceType}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500">
                    Event Count
                  </p>
                  <p className="font-medium">{selectedAlert.eventCount}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <History className="h-4 w-4" /> State Transition Timeline
                </h4>
                <div className="relative border-l border-slate-200 dark:border-slate-800 ml-3 space-y-6">
                  {selectedAlert.history.map((evt, idx) => (
                    <div key={idx} className="pl-6 relative">
                      <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[6.5px] top-1 ring-4 ring-white dark:ring-slate-950" />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">
                          {evt.state}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(evt.time).toLocaleString()}
                        </span>
                        <span className="text-sm mt-1">{evt.note}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t mt-4">
                {(selectedAlert.status === "OPEN" ||
                  selectedAlert.status === "ESCALATED") && (
                  <Button
                    onClick={handleResolve}
                    disabled={resolving}
                    className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {resolving ? "Resolving..." : "Manually Resolve"}
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Alerts;
