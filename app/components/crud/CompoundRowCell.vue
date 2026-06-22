<template>
  <!--
    Mobile dispatcher: renders the resource-appropriate compound row cell from a
    single `variant` token, so the responsive card layout in DataTable stays
    declarative and each named cell remains independently reusable.
  -->
  <template v-if="variant === 'booking'">
    <div class="cc cc--split">
      <div class="cc__cell">
        <CrudCellsDateTimeStatusCell :datetime="get('booking_datetime')" :status="get('booking_status')" />
      </div>
      <div class="cc__cell">
        <CrudCellsMemberTrainerCell :member="get('member.full_name')" :trainer="get('trainer.full_name')" />
      </div>
    </div>
  </template>

  <CrudCellsNameDisciplineCell
    v-else-if="variant === 'trainer'"
    :name="get('full_name')"
    :discipline="get('discipline_name')"
  />

  <CrudCellsDisciplineDigestCell
    v-else-if="variant === 'discipline'"
    :name="get('name')"
    :description="get('description')"
    :trainers-count="get('trainers_count')"
    :code="get('discipline_code')"
  />

  <CrudCellsPlanDigestCell
    v-else-if="variant === 'plan'"
    :name="get('name')"
    :price="get('price')"
    :duration-days="get('duration_days')"
    :max-bookings="get('max_bookings_per_month')"
  />

  <CrudCellsSlotDigestCell
    v-else-if="variant === 'slot'"
    :datetime="get('slot_datetime')"
    :discipline="get('discipline_name')"
    :is-available="get('is_available')"
    :schedule-type="get('schedule_type')"
  />
</template>

<script setup lang="ts">
import { getByPath } from '~/utils/objectPath'

const props = defineProps<{
  variant: 'booking' | 'trainer' | 'discipline' | 'plan' | 'slot'
  row: Record<string, unknown>
}>()

const get = (path: string): unknown => getByPath(props.row, path)
</script>
