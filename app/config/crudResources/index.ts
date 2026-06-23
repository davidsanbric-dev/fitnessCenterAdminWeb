import type { CrudResourceConfig } from './types'
import { bookings } from './bookings'
import { trainers } from './trainers'
import { disciplines } from './disciplines'
import { memberships } from './memberships'
import { notifications } from './notifications'
import { trainerSlots } from './trainerSlots'
import { trainerBookings } from './trainerBookings'

export type {
  CrudColumn,
  MobileDetailField,
  MobileDetailView,
  MobileCellConfig,
  CrudActionField,
  CrudAction,
  CrudResourceConfig,
} from './types'
export { isTextFilter } from './types'

export const adminCrudResources: Record<string, CrudResourceConfig> = {
  bookings,
  trainers,
  disciplines,
  memberships,
  notifications,
  trainerSlots,
  trainerBookings,
}
