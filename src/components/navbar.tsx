import { SignOutButton } from "./sign-out-button"

export function Navbar() {
  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4">
        {/* Your other navbar items */}
        
        <div className="ml-auto">
          <SignOutButton variant="ghost" />
        </div>
      </div>
    </nav>
  )
}
