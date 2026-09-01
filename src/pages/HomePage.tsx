import { useAuth } from '../auth/AuthProvider'
import MyAvailabilityPage from './MyAvailabilityPage'
import FixedSchedulePage from './FixedSchedulePage'

export default function HomePage() {
  const { profile } = useAuth()
  return profile?.isFixedSchedule ? <FixedSchedulePage /> : <MyAvailabilityPage />
}
