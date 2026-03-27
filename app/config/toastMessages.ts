export type ToastLocale = 'en' | 'es'

const toastMessages: Record<ToastLocale, Record<string, string>> = {
  en: {
    booking_update_status_success: 'Booking updated to {booking_status}.',
    booking_update_status_error: 'Could not update booking status to {booking_status}.',
    membership_create_success: 'Plan {name} was created.',
    membership_create_error: 'Could not create plan {name}.',
    membership_edit_success: 'Plan {name} was updated.',
    membership_edit_error: 'Could not update plan {name}.',
    membership_delete_success: 'Plan {name} was deleted.',
    membership_delete_error: 'Could not delete plan {name}.',
    notification_mark_read_success: 'Notification marked as read.',
    notification_mark_read_error: 'Could not mark notification as read.',
  },
  es: {
    booking_update_status_success: 'Reserva actualizada a {booking_status}.',
    booking_update_status_error: 'No se pudo actualizar la reserva a {booking_status}.',
    membership_create_success: 'Se creó el plan {name}.',
    membership_create_error: 'No se pudo crear el plan {name}.',
    membership_edit_success: 'Se actualizó el plan {name}.',
    membership_edit_error: 'No se pudo actualizar el plan {name}.',
    membership_delete_success: 'Se eliminó el plan {name}.',
    membership_delete_error: 'No se pudo eliminar el plan {name}.',
    notification_mark_read_success: 'Notificación marcada como leída.',
    notification_mark_read_error: 'No se pudo marcar la notificación como leída.',
  },
}

export const resolveToastMessage = (key: string, locale: string) => {
  const normalizedLocale: ToastLocale = locale.toLowerCase().startsWith('es') ? 'es' : 'en'
  return toastMessages[normalizedLocale][key] || toastMessages.en[key] || ''
}