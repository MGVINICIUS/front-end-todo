import { LoginForm } from "@/components/login-form"
import { ModeToggle } from "./components/mode-toggle"
export default function Page() {
  return (
    <div className="flex min-h-svh w-full p-6 md:p-10 flex-col relative items-center justify-center">
      <div className="absolute top-6 right-6 md:top-10 md:right-10">
        <ModeToggle />
      </div>
        <div className="w-full max-w-sm flex justify-center">
          <LoginForm />
        </div>
    </div>
  )
}
