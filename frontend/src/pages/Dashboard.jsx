import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { getDashboardStats, getAlertTrends, getTopOffenders, getRecentEvents } from "@/api/dashboard"
import { AlertCircle } from "lucide-react"

const Dashboard = () => {
  const [stats, setStats] = useState({ totalActive: 0, escalated: 0, autoClosed24h: 0 })
  const [chartData, setChartData] = useState([])
  const [topDrivers, setTopDrivers] = useState([])
  const [recentEvents, setRecentEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
      
      setStats(statsRes.data)
      setChartData(trendsRes.data)
      setTopDrivers(driversRes.data)
      setRecentEvents(eventsRes.data)
    } catch (err) {
      setError(err.message || "Failed to load dashboard data")
      console.error("Dashboard fetch error:", err)
    } finally {
      setLoading(false)
    }
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
                  {stats.totalActive || 0}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {stats.changePercent ? `${stats.changePercent > 0 ? '+' : ''}${stats.changePercent}% from last hour` : 'Live data'}
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
                  {stats.escalated || 0}
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
                  {stats.autoClosed24h || 0}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {stats.timeSaved ? `Saved approx. ${stats.timeSaved} hours of manual review` : 'Automated resolutions'}
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
          <CardContent className="h-[300px]">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Skeleton className="h-full w-full" />
              </div>
            ) : chartData.length > 0 ? (
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
            ) : topDrivers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver</TableHead>
                    <TableHead className="text-right">Alerts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topDrivers.map((driver) => (
                    <TableRow key={driver.id || driver.driverId}>
                      <TableCell>
                        <div className="font-medium">{driver.name || driver.driverName}</div>
                        <div className="text-xs text-slate-500">{driver.id || driver.driverId}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={driver.severity === "Critical" ? "destructive" : "secondary"}>
                          {driver.openAlerts || driver.alertCount}
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
          ) : recentEvents.length > 0 ? (
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
                  <TableRow key={event.id || event.alertId}>
                    <TableCell className="font-medium">{event.id || event.alertId}</TableCell>
                    <TableCell>{event.type || event.sourceType}</TableCell>
                    <TableCell>
                      <Badge variant={event.state === "ESCALATED" ? "destructive" : event.state === "AUTO-CLOSED" ? "outline" : "default"}>
                        {event.state || event.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-slate-500 text-sm">
                      {event.time || (event.timestamp && new Date(event.timestamp).toLocaleString())}
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
    </div>
  )
}

export default Dashboard