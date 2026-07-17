import { UserProfileButton } from "@/components/user-profile-button"
import { HabitDashboard } from "@/components/habit-dashboard"

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <div className="fixed top-4 right-4 z-50">
        <UserProfileButton />
      </div>
      <HabitDashboard />
    </main>
  )
}
