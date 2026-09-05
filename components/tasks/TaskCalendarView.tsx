'use client';

import { useState, useMemo } from 'react';
import { useAppDispatch } from '@/hooks/useRedux';
import { setActiveModal } from '@/store/uiSlice';
import type { Task } from '@/types';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';

interface TaskCalendarViewProps {
  tasks: Task[];
  projectId?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function TaskCalendarView({ tasks }: TaskCalendarViewProps) {
  const dispatch = useAppDispatch();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const { daysInMonth, startDayOfWeek } = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return {
      daysInMonth: lastDay.getDate(),
      startDayOfWeek: firstDay.getDay(),
    };
  }, [year, month]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach(t => {
      if (t.dueDate) {
        const dateKey = t.dueDate.split('T')[0];
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(t);
      }
    });
    return map;
  }, [tasks]);

  const priorityColors = {
    urgent: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#3b82f6',
    none: '#71717a',
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div
      className="rounded-xl border overflow-hidden select-none"
      style={{
        background: 'var(--bg-elevated)',
        borderColor: 'var(--border-primary)',
      }}
    >
      {/* Calendar Header */}
      <div
        className="flex items-center justify-between p-3.5"
        style={{ borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-secondary)' }}
      >
        <div className="flex items-center gap-2.5">
          <CalendarIcon size={16} style={{ color: 'var(--accent-primary)' }} />
          <h2 className="text-sm font-bold tracking-tight" style={{ color: 'var(--fg-primary)' }}>
            {MONTH_NAMES[month]} {year}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors"
            style={{ borderColor: 'var(--border-primary)', color: 'var(--fg-secondary)', background: 'var(--bg-elevated)' }}
            onMouseOver={e => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)')}
            onMouseOut={e => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)')}
          >
            Today
          </button>
          <div className="flex items-center">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-l-md border text-zinc-400 hover:text-zinc-200 transition-colors"
              style={{ borderColor: 'var(--border-primary)' }}
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-r-md border-t border-r border-b text-zinc-400 hover:text-zinc-200 transition-colors"
              style={{ borderColor: 'var(--border-primary)' }}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Weekdays Bar */}
      <div
        className="grid grid-cols-7 text-center py-2 text-[10px] font-bold uppercase tracking-wider border-b"
        style={{ borderColor: 'var(--border-primary)', color: 'var(--fg-tertiary)', background: 'var(--bg-secondary)' }}
      >
        {WEEKDAYS.map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y" style={{ borderColor: 'var(--border-primary)' }}>
        {/* Empty leading cells */}
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="min-h-[90px] p-2"
            style={{ background: 'var(--bg-secondary)', opacity: 0.5 }}
          />
        ))}

        {/* Days of Month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const monthStr = String(month + 1).padStart(2, '0');
          const dayStr = String(dayNum).padStart(2, '0');
          const fullDateStr = `${year}-${monthStr}-${dayStr}`;

          const isCurrentToday = fullDateStr === todayStr;
          const dayTasks = tasksByDate[fullDateStr] || [];

          return (
            <div
              key={dayNum}
              onClick={() => dispatch(setActiveModal('createTask'))}
              className="min-h-[100px] p-2 transition-colors flex flex-col group cursor-pointer hover:bg-[var(--bg-hover)]"
              style={{
                background: isCurrentToday ? 'var(--accent-primary-light)' : 'transparent',
              }}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCurrentToday
                      ? 'text-white shadow-sm'
                      : ''
                  }`}
                  style={{
                    background: isCurrentToday ? 'var(--accent-primary)' : 'transparent',
                    color: isCurrentToday ? '#ffffff' : 'var(--fg-secondary)',
                  }}
                >
                  {dayNum}
                </span>

                <span className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-zinc-500 hover:text-zinc-200 transition-opacity">
                  <Plus size={12} />
                </span>
              </div>

              {/* Task Event Chips */}
              <div className="space-y-1 overflow-y-auto max-h-[75px]">
                {dayTasks.map(task => {
                  const color = priorityColors[task.priority || 'none'];
                  return (
                    <button
                      key={task.id}
                      onClick={e => {
                        e.stopPropagation();
                        dispatch(setActiveModal(`task:${task.id}`));
                      }}
                      className="w-full text-left px-1.5 py-0.5 rounded text-[10px] font-semibold truncate transition-transform hover:scale-[1.01] flex items-center gap-1"
                      style={{
                        background: `${color}18`,
                        color: color,
                        borderLeft: `2.5px solid ${color}`,
                      }}
                    >
                      <span className="truncate">{task.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
