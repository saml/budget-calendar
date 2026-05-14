import FullCalendar from '@fullcalendar/react'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import { useState } from 'react'
import type { Activity, Budget } from '../../types'
import { budgetDurationDays, toCalendarEvent } from '../../utils/dateUtils'
import { ActivityForm } from '../Activity/ActivityForm'

type ModalState = { date: string; activity?: Activity } | null

type CalendarViewProps = {
  budget: Budget
}

function addDays(date: string, days: number) {
  const next = new Date(`${date}T00:00:00`)
  next.setDate(next.getDate() + days)
  const y = next.getFullYear()
  const m = String(next.getMonth() + 1).padStart(2, '0')
  const d = String(next.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function CalendarView({ budget }: CalendarViewProps) {
  const [modalState, setModalState] = useState<ModalState>(null)
  const [currentView, setCurrentView] = useState('timeGridItinerary')
  const durationDays = budgetDurationDays(budget.startDate, budget.endDate)
  const isItinerary = currentView === 'timeGridItinerary'

  return (
    <div className="relative p-4">
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridItinerary"
        buttonText={{ day: 'Day', week: 'Week', today: 'Today' }}
        initialDate={budget.startDate}
        views={{
          timeGridItinerary: {
            type: 'timeGrid',
            duration: { days: durationDays },
            buttonText: 'Itinerary',
          },
        }}
        validRange={{ start: budget.startDate, end: addDays(budget.endDate, 1) }}
        headerToolbar={{
          left: isItinerary ? '' : 'prev,next today',
          center: 'title',
          right: 'timeGridDay,timeGridWeek,timeGridItinerary',
        }}
        datesSet={(info) => setCurrentView(info.view.type)}
        events={budget.days.flatMap((day) =>
          day.activities.map((activity) => toCalendarEvent(activity, day.date)),
        )}
        dateClick={(clickInfo) =>
          setModalState({ date: clickInfo.dateStr.slice(0, 10) })
        }
        eventClick={(clickInfo) =>
          setModalState({
            date: clickInfo.event.extendedProps.date as string,
            activity: clickInfo.event.extendedProps.activity as Activity,
          })
        }
      />
      {modalState ? (
        <ActivityForm
          budget={budget}
          date={modalState.date}
          activity={modalState.activity}
          onClose={() => setModalState(null)}
        />
      ) : null}
    </div>
  )
}
