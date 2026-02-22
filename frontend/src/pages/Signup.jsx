import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react"
import { signup } from "@/api/auth"

const Signup = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await signup(formData)
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
      }
      toast.success("Account created successfully! Welcome aboard.")
      navigate("/dashboard")
    } catch (err) {
      if (err.response) {
        if (err.response.status === 409) {
           toast.error("User with this email already exists. Please login.")
        } else if (err.response.status === 400) {
           toast.error(err.response.data.error || "Invalid input data. Please check your details.")
        } else {
           toast.error(err.response.data.error || "Signup failed. Please try again later.")
        }
      } else {
        toast.error("Network error. Please check your connection.")
      }
      console.error("Signup error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 font-sans selection:bg-zinc-900 selection:text-zinc-50">
      <Card className="w-full max-w-md border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl bg-white dark:bg-zinc-900">
        <CardHeader className="space-y-1.5 px-8 pt-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 bg-zinc-900 dark:bg-zinc-50 rounded flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-zinc-50 dark:text-zinc-900" />
            </div>
            <span className="font-bold tracking-tight text-zinc-900 dark:text-zinc-50">AERS - Alert Escalation Resolution System</span>
          </div>
          <CardTitle className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Create an account
          </CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-400 text-sm">
            Enter your details below to create your operations account.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSignup}>
          <CardContent className="grid gap-4 px-8 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-zinc-700 dark:text-zinc-300">Full Name</Label>
              <Input 
                id="name" 
                placeholder="John Doe" 
                className="border-zinc-200 dark:border-zinc-800 focus-visible:ring-zinc-400"
                value={formData.name}
                onChange={handleInputChange}
                required 
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300">Work Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="admin@moveinsync.com" 
                className="border-zinc-200 dark:border-zinc-800 focus-visible:ring-zinc-400"
                value={formData.email}
                onChange={handleInputChange}
                required 
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password" className="text-zinc-700 dark:text-zinc-300">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  className="border-zinc-200 dark:border-zinc-800 pr-10 focus-visible:ring-zinc-400"
                  value={formData.password}
                  onChange={handleInputChange}
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 px-8 pb-8">
            <Button 
              type="submit" 
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-all font-medium rounded-md h-10"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Create account"
              )}
            </Button>
            
            <div className="text-sm text-center text-zinc-500 dark:text-zinc-400">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-zinc-900 hover:underline dark:text-zinc-50 underline-offset-4">
                Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default Signup