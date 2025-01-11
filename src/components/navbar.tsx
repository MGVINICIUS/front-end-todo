import { Link } from "react-router-dom"
import { SignOutButton } from "./sign-out-button"


export function Navbar() {
  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4">
        {/* Your other navbar items */}
        <Link to="/">
          <p className="text-2xl font-bold text-white rounded-md p-2">GoalGetter</p>
        </Link>
        
        <div className="ml-auto">
          <SignOutButton variant="ghost" />
        </div>
      </div>
    </nav>
  )
}
