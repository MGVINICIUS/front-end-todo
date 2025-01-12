import { LoginForm } from "@/components/login-form"
import { ModeToggle } from "./components/mode-toggle"
export default function Page() {
  return (
    <div className="flex min-h-svh w-full p-4 flex-col relative items-center justify-center">
    <div className="absolute top-4 left-4">
      <p className="text-2xl font-bold text-white rounded-md">GoalGetter</p>    
    </div>
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
        <div className="w-full max-w-sm flex justify-center">
          <LoginForm />
        </div>
    </div>
  )
}
