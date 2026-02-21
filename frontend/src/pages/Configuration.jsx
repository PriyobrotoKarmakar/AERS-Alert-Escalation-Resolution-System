import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Settings2, Clock, AlertTriangle, CheckCircle, AlertCircle as AlertCircleIcon } from "lucide-react"
import { getRulesConfig } from "@/api/configuration"

const Configuration = () => {
  const [rules, setRules] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchRules()
  }, [])

  const fetchRules = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getRulesConfig()
      setRules(response.data)
    } catch (err) {
      const errorMessage = err.message || "Failed to fetch rules configuration"
      setError(errorMessage)
      toast.error(errorMessage)
      console.error("Rules fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertCircleIcon className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Configuration</h3>
            <p className="text-sm text-slate-500 text-center mb-4">{error}</p>
            <button 
              onClick={fetchRules}
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
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Rule Engine Configuration</h2>
        <p className="text-slate-500 dark:text-slate-400">
          Manage dynamic escalation and auto-closure thresholds.
        </p>
      </div>

      <Tabs defaultValue="visual" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="visual">Visual Overview</TabsTrigger>
          <TabsTrigger value="raw">Raw JSON</TabsTrigger>
        </TabsList>
        
        <TabsContent value="visual" className="space-y-4 mt-4">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : rules ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Overspeeding Rule */}
              {rules.overspeed && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Overspeeding
                      </CardTitle>
                      <Badge variant="outline">Escalation</Badge>
                    </div>
                    <CardDescription>Triggers when multiple violations occur.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Threshold Count</span>
                        <span className="font-medium">{rules.overspeed.escalate_if_count} alerts</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 flex items-center gap-1"><Clock className="h-3 w-3"/> Time Window</span>
                        <span className="font-medium">{rules.overspeed.window_mins} mins</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Target Severity</span>
                        <Badge variant="destructive">{rules.overspeed.severity}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Negative Feedback Rule */}
              {rules.feedback_negative && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Settings2 className="h-5 w-5 text-amber-500" />
                        Negative Feedback
                      </CardTitle>
                      <Badge variant="outline">Escalation</Badge>
                    </div>
                    <CardDescription>Monitors passenger ratings.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Threshold Count</span>
                        <span className="font-medium">{rules.feedback_negative.escalate_if_count} alerts</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 flex items-center gap-1"><Clock className="h-3 w-3"/> Time Window</span>
                        <span className="font-medium">{rules.feedback_negative.window_mins / 60} hours</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Target Severity</span>
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">{rules.feedback_negative.severity}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Compliance Rule */}
              {rules.compliance && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Compliance
                      </CardTitle>
                      <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">Auto-Close</Badge>
                    </div>
                    <CardDescription>Handles document renewals.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Condition</span>
                        <span className="font-medium">{rules.compliance.auto_close_if}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 flex items-center gap-1"><Clock className="h-3 w-3"/> Max Expiry Window</span>
                        <span className="font-medium">{rules.compliance.window_mins / 1440} days</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center text-slate-500 py-8">
              No rules configured
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="raw" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>rules.json</CardTitle>
              <CardDescription>The active configuration currently loaded in the backend memory.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : rules ? (
                <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                  {JSON.stringify(rules, null, 2)}
                </pre>
              ) : (
                <div className="text-center text-slate-500 py-8">
                  No configuration available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Configuration