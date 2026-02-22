import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Settings2, Clock, AlertTriangle, CheckCircle, AlertCircle as AlertCircleIcon, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { getRulesConfig, updateRule } from "@/api/configuration"

const Configuration = () => {
  const [rules, setRules] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingRuleName, setEditingRuleName] = useState("")
  const [editForm, setEditForm] = useState({
    escalate_if_count: 0,
    window_mins: 0,
    target_severity: "",
    auto_close_if: ""
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchRules()
  }, [])

  const fetchRules = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getRulesConfig()
      // Handle null/undefined response
      setRules(response?.data && typeof response.data === 'object' ? response.data : null)
    } catch (err) {
      const errorMessage = err.message || "Failed to fetch rules configuration"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (ruleName, ruleData) => {
    setEditingRuleName(ruleName)
    setEditForm({
      escalate_if_count: ruleData.escalate_if_count || 0,
      window_mins: ruleData.window_mins || 0,
      target_severity: ruleData.target_severity || "",
      auto_close_if: ruleData.auto_close_if || ""
    })
    setIsEditModalOpen(true)
  }

  const handleSaveRule = async () => {
    setIsSaving(true)
    try {
      await updateRule(editingRuleName, editForm)
      toast.success(`${editingRuleName} rule updated successfully!`)
      fetchRules()
      setIsEditModalOpen(false)
    } catch (err) {
      toast.error("Failed to update rule. Please try again.")
    } finally {
      setIsSaving(false)
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
          ) : rules && typeof rules === 'object' && Object.keys(rules).length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rules["Overspeeding"] && typeof rules["Overspeeding"] === 'object' && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Overspeeding
                      </CardTitle>
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick("Overspeeding", rules["Overspeeding"])}>
                        <Edit2 className="h-4 w-4 text-slate-500" />
                      </Button>
                    </div>
                    <CardDescription>Triggers when multiple violations occur.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Threshold Count</span>
                        <span className="font-medium">{rules["Overspeeding"]?.escalate_if_count || 0} alerts</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 flex items-center gap-1"><Clock className="h-3 w-3"/> Time Window</span>
                        <span className="font-medium">{rules["Overspeeding"]?.window_mins || 0} mins</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Target Severity</span>
                        <Badge variant="destructive">{rules["Overspeeding"]?.target_severity || 'N/A'}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {rules["Negative Feedback"] && typeof rules["Negative Feedback"] === 'object' && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Settings2 className="h-5 w-5 text-amber-500" />
                        Negative Feedback
                      </CardTitle>
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick("Negative Feedback", rules["Negative Feedback"])}>
                        <Edit2 className="h-4 w-4 text-slate-500" />
                      </Button>
                    </div>
                    <CardDescription>Monitors passenger ratings.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Threshold Count</span>
                        <span className="font-medium">{rules["Negative Feedback"]?.escalate_if_count || 0} alerts</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 flex items-center gap-1"><Clock className="h-3 w-3"/> Time Window</span>
                        <span className="font-medium">{rules["Negative Feedback"]?.window_mins ? (rules["Negative Feedback"].window_mins / 60) : 0} hours</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Target Severity</span>
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">{rules["Negative Feedback"]?.target_severity || 'N/A'}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {rules["Compliance"] && typeof rules["Compliance"] === 'object' && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Compliance
                      </CardTitle>
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick("Compliance", rules["Compliance"])}>
                        <Edit2 className="h-4 w-4 text-slate-500" />
                      </Button>
                    </div>
                    <CardDescription>Handles document renewals.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Condition</span>
                        <span className="font-medium">{rules["Compliance"]?.auto_close_if || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 flex items-center gap-1"><Clock className="h-3 w-3"/> Max Expiry Window</span>
                        <span className="font-medium">{rules["Compliance"]?.window_mins ? `${rules["Compliance"].window_mins / 1440} days` : "N/A"}</span>
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

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Rule: {editingRuleName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            
            {editingRuleName !== "Compliance" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Escalate If Count</label>
                  <Input 
                    type="number" 
                    value={editForm.escalate_if_count} 
                    onChange={(e) => setEditForm({...editForm, escalate_if_count: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Window (Minutes)</label>
                  <Input 
                    type="number" 
                    value={editForm.window_mins} 
                    onChange={(e) => setEditForm({...editForm, window_mins: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Severity</label>
                  <Input 
                    value={editForm.target_severity} 
                    onChange={(e) => setEditForm({...editForm, target_severity: e.target.value})}
                  />
                </div>
              </>
            )}

            {editingRuleName === "Compliance" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Auto Close Condition</label>
                  <Input 
                    value={editForm.auto_close_if} 
                    onChange={(e) => setEditForm({...editForm, auto_close_if: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Window (Minutes)</label>
                  <Input 
                    type="number" 
                    value={editForm.window_mins} 
                    onChange={(e) => setEditForm({...editForm, window_mins: parseInt(e.target.value) || 0})}
                  />
                </div>
              </>
            )}

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveRule} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Configuration