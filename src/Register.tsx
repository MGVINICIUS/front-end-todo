import { RegisterForm } from "@/components/register-form"
import { ModeToggle } from "@/components/mode-toggle"

export default function Register() {
  return (
    <div className="flex min-h-svh w-full p-6 md:p-10 flex-col relative items-center justify-center">
      <div className="absolute top-4 left-4">
        <p className="text-2xl font-bold text-white rounded-md">GoalGetter</p>      
      </div>
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <div className="w-full max-w-sm flex justify-center">
        <RegisterForm />
      </div>
    </div>
  )
}