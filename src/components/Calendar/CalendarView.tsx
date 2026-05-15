import FullCalendar from '@fullcalendar/react'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import { useEffect, useState } from 'react'
import type { Activity, Budget } from '../../types'
import { budgetDurationDays, getCategoryColor, toCalendarEvent } from '../../utils/dateUtils'
import { ActivityForm } from '../Activity/ActivityForm'
import { useBudgetStore } from '../../store/budgetStore'

type ModalState =
  | {
      date: string
      activity?: Activity
      initialValues?: Partial<Omit<Activity, 'id'>>
    }
  | null

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
  const [selectedActivity, setSelectedActivity] = useState<{
    date: string
    activity: Activity
  } | null>(null)
  const [clipboard, setClipboard] = useState<{
    date: string
    activity: Activity
  } | null>(null)
  const [currentView, setCurrentView] = useState('timeGridItinerary')
  const updateActivity = useBudgetStore((state) => state.updateActivity)
  const moveActivity = useBudgetStore((state) => state.moveActivity)
  const durationDays = budgetDurationDays(budget.startDate, budget.endDate)
  const isItinerary = currentView === 'timeGridItinerary'

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isCopy = (event.metaKey || event.ctrlKey) && event.key === 'c'
      const isPaste = (event.metaKey || event.ctrlKey) && event.key === 'v'

      if (isCopy && selectedActivity) {
        event.preventDefault()
        setClipboard(selectedActivity)
      }

      if (isPaste && clipboard) {
        event.preventDefault()
        setModalState({
          date: clipboard.date,
          initialValues: {
            time: clipboard.activity.time,
            description: clipboard.activity.description,
            cost: clipboard.activity.cost,
            count: clipboard.activity.count,
            duration: clipboard.activity.duration,
            categoryId: clipboard.activity.categoryId,
          },
        })
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedActivity, clipboard])

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
        editable
        headerToolbar={{
          left: isItinerary ? '' : 'prev,next today',
          center: 'title',
          right: 'timeGridDay,timeGridWeek,timeGridItinerary',
        }}
        datesSet={(info) => setCurrentView(info.view.type)}
        events={budget.days.flatMap((day) =>
          day.activities.map((activity) => {
            const color = getCategoryColor(budget.categories, activity.categoryId)
            return toCalendarEvent(activity, day.date, color)
          }),
        )}
        dateClick={(clickInfo) =>
          setModalState({
            date: clickInfo.dateStr.slice(0, 10),
            initialValues: {
              time: clickInfo.dateStr.length > 10 ? clickInfo.dateStr.slice(11, 16) : '',
            },
          })
        }
        eventClick={(clickInfo) => {
          const date = clickInfo.event.extendedProps.date as string
          const activity = clickInfo.event.extendedProps.activity as Activity

          if (clickInfo.jsEvent.metaKey || clickInfo.jsEvent.ctrlKey) {
            setSelectedActivity((prev) =>
              prev?.activity.id === activity.id ? null : { date, activity },
            )
            return
          }

          setModalState({
            date,
            activity,
          })
        }}
        eventClassNames={(arg) =>
          arg.event.extendedProps.activity?.id === selectedActivity?.activity.id
            ? ['ring-2', 'ring-offset-1', 'ring-blue-500']
            : []
        }
        eventDrop={(dropInfo) => {
          const fromDate = dropInfo.oldEvent.extendedProps.date as string
          const toDate = dropInfo.event.startStr.slice(0, 10)
          const newTime = dropInfo.event.startStr.slice(11, 16)
          const activity = dropInfo.event.extendedProps.activity as Activity

          moveActivity(fromDate, toDate, {
            ...activity,
            time: newTime,
          })
        }}
        eventResize={(resizeInfo) => {
          const date = resizeInfo.event.extendedProps.date as string
          const activity = resizeInfo.event.extendedProps.activity as Activity
          const start = resizeInfo.event.start!
          const end = resizeInfo.event.end!
          const newDuration = Math.round((end.getTime() - start.getTime()) / 60000)

          updateActivity(date, { ...activity, duration: newDuration })
        }}
      />
      {modalState ? (
        <ActivityForm
          budget={budget}
          date={modalState.date}
          activity={modalState.activity}
          initialValues={modalState.initialValues}
          onClose={() => setModalState(null)}
        />
      ) : null}
    </div>
  )
}
