import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { getDashboardStats, getAlertTrends, getTopOffenders, getRecentEvents } from "@/api/dashboard"
import { getAlerts } from "@/api/alerts"
import { AlertCircle, History, User, AlertTriangle, Clock, MapPin } from "lucide-react"

const Dashboard = () => {
  const [stats, setStats] = useState({ totalActive: 0, escalated: 0, autoClosed24h: 0 })
  const [chartData, setChartData] = useState([])
  const [topDrivers, setTopDrivers] = useState([])
  const [recentEvents, setRecentEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Driver detail dialog state
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [driverAlerts, setDriverAlerts] = useState([])
  const [driverHistory, setDriverHistory] = useState([])
  const [isDriverDialogOpen, setIsDriverDialogOpen] = useState(false)
  const [loadingDriverAlerts, setLoadingDriverAlerts] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [statsRes, trendsRes, driversRes, eventsRes] = await Promise.all([
        getDashboardStats(),
        getAlertTrends(7),
        getTopOffenders(5),
        getRecentEvents(5)
      ])
      
      // Handle null/undefined responses with defaults
      setStats(statsRes?.data || { totalActive: 0, escalated: 0, autoClosed24h: 0 })
      setChartData(Array.isArray(trendsRes?.data) ? trendsRes.data : [])
      setTopDrivers(Array.isArray(driversRes?.data) ? driversRes.data : [])
      setRecentEvents(Array.isArray(eventsRes?.data) ? eventsRes.data : [])
    } catch (err) {
      const errorMessage = err.message || "Failed to load dashboard data"
      setError(errorMessage)
      toast.error(errorMessage)
      console.error("Dashboard fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDriverClick = async (driver) => {
    const driverId = driver?.id || driver?.driverId
    if (!driverId) return

    setSelectedDriver(driver)
    setIsDriverDialogOpen(true)
    setLoadingDriverAlerts(true)

    try {
      const response = await getAlerts()
      const allAlerts = Array.isArray(response?.data) ? response.data : []
      
      // Filter alerts for this specific driver
      const filteredAlerts = allAlerts.filter(
        alert => alert?.metadata?.driverId === driverId
      )
      
      // Sort by timestamp, newest first
      const sortedAlerts = filteredAlerts.sort((a, b) => 
        new Date(b?.timestamp || 0) - new Date(a?.timestamp || 0)
      )
      
      // Collect all history entries from all alerts for this driver
      const allHistoryEntries = []
      sortedAlerts.forEach(alert => {
        if (alert.history && Array.isArray(alert.history)) {
          alert.history.forEach(historyEntry => {
            allHistoryEntries.push({
              ...historyEntry,
              alertId: alert.alertId,
              sourceType: alert.sourceType,
              severity: alert.severity,
              metadata: alert.metadata
            })
          })
        }
      })
      
      // Sort all history entries by time, newest first
      allHistoryEntries.sort((a, b) => new Date(b.time) - new Date(a.time))
      
      setDriverAlerts(sortedAlerts)
      setDriverHistory(allHistoryEntries)
    } catch (err) {
      toast.error("Failed to load driver alerts")
      console.error("Error fetching driver alerts:", err)
      setDriverAlerts([])
      setDriverHistory([])
    } finally {
      setLoadingDriverAlerts(false)
    }
  }

  const getStatusBadge = (status) => {
    if (status === "ESCALATED")
      return <Badge variant="destructive">{status}</Badge>
    if (status === "AUTO-CLOSED")
      return (
        <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50">
          {status}
        </Badge>
      )
    if (status === "RESOLVED")
      return <Badge variant="outline" className="text-blue-600 border-blue-600 bg-blue-50">{status}</Badge>
    if (status === "OPEN")
      return <Badge variant="outline" className="text-slate-900 border-slate-900">{status}</Badge>
    return <Badge>{status}</Badge>
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Dashboard</h3>
            <p className="text-sm text-slate-500 text-center mb-4">{error}</p>
            <button 
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {stats?.totalActive || 0}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {stats?.changePercent ? `${stats.changePercent > 0 ? '+' : ''}${stats.changePercent}% from last hour` : 'Live data'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Escalated</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats?.escalated || 0}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Requires immediate attention</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">Auto-Closed (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats?.autoClosed24h || 0}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {stats?.timeSaved ? `Saved approx. ${stats.timeSaved} hours of manual review` : 'Automated resolutions'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Trend Over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-75">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Skeleton className="h-full w-full" />
              </div>
            ) : chartData && Array.isArray(chartData) && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#64748b" strokeWidth={2} name="Total" />
                  <Line type="monotone" dataKey="escalated" stroke="#ef4444" strokeWidth={2} name="Escalated" />
                  <Line type="monotone" dataKey="autoClosed" stroke="#22c55e" strokeWidth={2} name="Auto-Closed" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                No trend data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Top Offenders (Open Alerts)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : topDrivers && Array.isArray(topDrivers) && topDrivers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver</TableHead>
                    <TableHead className="text-right">Alerts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topDrivers.map((driver) => (
                    <TableRow 
                      key={driver?.id || driver?.driverId || Math.random()}
                      className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                      onClick={() => handleDriverClick(driver)}
                    >
                      <TableCell>
                        <div className="font-medium">{driver?.name || driver?.driverName || 'Unknown'}</div>
                        <div className="text-xs text-slate-500">{driver?.id || driver?.driverId || 'N/A'}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={driver?.severity === "Critical" ? "destructive" : "secondary"}>
                          {driver?.openAlerts || driver?.alertCount || 0}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-slate-500 py-8">No driver data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Alert Lifecycle Events</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recentEvents && Array.isArray(recentEvents) && recentEvents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alert ID</TableHead>
                  <TableHead>Source Type</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentEvents.map((event) => (
                  <TableRow key={event?.id || event?.alertId || Math.random()}>
                    <TableCell className="font-medium">{event?.id || event?.alertId || 'N/A'}</TableCell>
                    <TableCell>{event?.type || event?.sourceType || 'Unknown'}</TableCell>
                    <TableCell>
                      {getStatusBadge(event?.state || event?.status || 'N/A')}
                    </TableCell>
                    <TableCell className="text-right text-slate-500 text-sm">
                      {event?.time || (event?.timestamp && new Date(event.timestamp).toLocaleString()) || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-slate-500 py-8">No recent events</div>
          )}
        </CardContent>
      </Card>

      {/* Driver Detail Dialog */}
      <Dialog open={isDriverDialogOpen} onOpenChange={setIsDriverDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Driver Details: {selectedDriver?.name || selectedDriver?.driverName || 'Unknown'}
            </DialogTitle>
            <DialogDescription>
              {selectedDriver?.id || selectedDriver?.driverId || 'N/A'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Driver Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{driverAlerts.length}</div>
                  <p className="text-xs text-slate-500">Total Alerts</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-red-600">
                    {driverAlerts.filter(a => a.status === 'ESCALATED').length}
                  </div>
                  <p className="text-xs text-slate-500">Escalated</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-600">
                    {driverAlerts.filter(a => a.status === 'RESOLVED').length}
                  </div>
                  <p className="text-xs text-slate-500">Resolved</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">
                    {driverAlerts.filter(a => a.status === 'AUTO-CLOSED').length}
                  </div>
                  <p className="text-xs text-slate-500">Auto-Closed</p>
                </CardContent>
              </Card>
            </div>

            {/* Alert Timeline */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <History className="h-4 w-4" />
                State Transition Timeline
              </h3>
              <ScrollArea className="h-[45vh] pr-4">
                {driverHistory && driverHistory.length > 0 ? (
                  <div className="relative border-l border-slate-200 dark:border-slate-800 ml-3 space-y-6">
                    {driverHistory.map((historyEntry, index) => (
                      <div key={`history-${index}`} className="pl-6 relative">
                        <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[6.5px] top-1 ring-4 ring-white dark:ring-slate-950" />
                        <div className="flex flex-col max-w-full">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-sm font-semibold break-all">
                              {historyEntry.alertId || 'N/A'}
                            </span>
                            <span className="text-xs">
                              {getStatusBadge(historyEntry.state || 'N/A')}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {historyEntry.sourceType || 'Unknown'}
                            </Badge>
                          </div>
                          <span className="text-xs text-slate-500">
                            {historyEntry.time ? new Date(historyEntry.time).toLocaleString() : 'N/A'}
                          </span>
                          <span className="text-sm mt-1 wrap-break-word">
                            {historyEntry.note || 'No details'}
                            {historyEntry.metadata?.speed && ` - Speed: ${historyEntry.metadata.speed} km/h`}
                            {historyEntry.metadata?.rating && ` - Rating: ${historyEntry.metadata.rating}/5`}
                            {historyEntry.metadata?.comments && ` - ${historyEntry.metadata.comments}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-slate-500 py-8">No history found for this driver</div>
                )}
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Dashboard