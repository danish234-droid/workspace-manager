'use client';

import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { moveTask, reorderTasks } from '@/store/taskSlice';
import { addColumn, updateColumn, deleteColumn } from '@/store/projectSlice';
import { setActiveModal, addToast } from '@/store/uiSlice';
import TaskCard from './TaskCard';
import type { Project, KanbanColumn, Task, TaskStatus } from '@/types';
import { Plus, MoreHorizontal, Edit2, Trash2, Check, X } from 'lucide-react';

interface KanbanBoardProps {
  project: Project;
  filteredTasks: Task[];
}

export default function KanbanBoard({ project, filteredTasks }: KanbanBoardProps) {
  const dispatch = useAppDispatch();
  const allTasks = useAppSelector(state => state.task.tasks);

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [newColTitle, setNewColTitle] = useState('');
  const [isAddingCol, setIsAddingCol] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columns = useMemo(() => project.columns || [], [project.columns]);

  const tasksByColumn = useMemo(() => {
    const map: Record<string, Task[]> = {};
    columns.forEach(col => {
      map[col.id] = filteredTasks
        .filter(t => t.status === col.status)
        .sort((a, b) => a.order - b.order);
    });
    return map;
  }, [columns, filteredTasks]);

  const activeTask = useMemo(
    () => (activeTaskId ? allTasks.find(t => t.id === activeTaskId) : null),
    [activeTaskId, allTasks]
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTaskId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTaskId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const task = allTasks.find(t => t.id === activeId);
    if (!task) return;

    const overColumn = columns.find(c => c.id === overId);
    if (overColumn) {
      if (task.status !== overColumn.status) {
        const colTasks = tasksByColumn[overColumn.id] || [];
        dispatch(
          moveTask({
            taskId: activeId,
            newStatus: overColumn.status,
            newOrder: colTasks.length,
          })
        );
      }
      return;
    }

    const overTask = allTasks.find(t => t.id === overId);
    if (overTask) {
      const sameColumn = task.status === overTask.status;
      if (!sameColumn) {
        dispatch(
          moveTask({
            taskId: activeId,
            newStatus: overTask.status,
            newOrder: overTask.order,
          })
        );
      } else {
        const targetCol = columns.find(c => c.status === task.status);
        if (!targetCol) return;
        const colTasks = [...(tasksByColumn[targetCol.id] || [])];
        const oldIndex = colTasks.findIndex(t => t.id === activeId);
        const newIndex = colTasks.findIndex(t => t.id === overId);

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const [moved] = colTasks.splice(oldIndex, 1);
          colTasks.splice(newIndex, 0, moved);

          const updates = colTasks.map((t, idx) => ({
            id: t.id,
            order: idx,
            status: t.status,
          }));

          dispatch(reorderTasks({ tasks: updates }));
        }
      }
    }
  };

  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColTitle.trim()) return;

    const newCol: KanbanColumn = {
      id: `col-${Date.now()}`,
      title: newColTitle.trim(),
      status: (newColTitle.toLowerCase().replace(/\s+/g, '-') as TaskStatus) || 'todo',
      order: columns.length,
      color: '#8b5cf6',
    };

    dispatch(addColumn({ projectId: project.id, column: newCol }));
    setNewColTitle('');
    setIsAddingCol(false);
    dispatch(addToast({ type: 'success', message: `Column "${newCol.title}" created!` }));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3.5 overflow-x-auto pb-6 items-start min-h-[520px] select-none">
        {columns.map(column => {
          const colTasks = tasksByColumn[column.id] || [];

          return (
            <BoardColumn
              key={column.id}
              column={column}
              tasks={colTasks}
              projectId={project.id}
            />
          );
        })}

        {/* Add Column */}
        <div className="w-72 flex-shrink-0">
          {isAddingCol ? (
            <form
              onSubmit={handleAddColumn}
              className="p-3 rounded-lg border space-y-2.5"
              style={{
                background: 'var(--bg-elevated)',
                borderColor: 'var(--border-primary)',
              }}
            >
              <input
                type="text"
                value={newColTitle}
                onChange={e => setNewColTitle(e.target.value)}
                placeholder="Column title..."
                autoFocus
                className="w-full px-2.5 py-1.5 text-xs rounded-md border outline-none"
                style={{
                  background: 'var(--bg-input)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--fg-primary)',
                }}
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-3 py-1 rounded text-xs font-semibold text-white"
                  style={{ background: 'var(--accent-primary)' }}
                >
                  Add Column
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingCol(false)}
                  className="p-1 rounded text-zinc-400 hover:text-zinc-200"
                >
                  <X size={14} />
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingCol(true)}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed text-xs font-medium transition-colors hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
              style={{
                borderColor: 'var(--border-primary)',
                color: 'var(--fg-tertiary)',
                background: 'var(--bg-secondary)',
              }}
            >
              <Plus size={14} />
              <span>Add Column</span>
            </button>
          )}
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function BoardColumn({
  column,
  tasks,
  projectId,
}: {
  column: KanbanColumn;
  tasks: Task[];
  projectId: string;
}) {
  const dispatch = useAppDispatch();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [colTitle, setColTitle] = useState(column.title);

  const { setNodeRef } = useSortable({
    id: column.id,
    data: { type: 'column', column },
  });

  const handleSaveTitle = () => {
    if (colTitle.trim() && colTitle.trim() !== column.title) {
      dispatch(updateColumn({ projectId, columnId: column.id, updates: { title: colTitle.trim() } }));
    }
    setIsEditingTitle(false);
  };

  const handleDeleteColumn = () => {
    if (confirm(`Delete column "${column.title}"? Tasks will not be deleted.`)) {
      dispatch(deleteColumn({ projectId, columnId: column.id }));
      dispatch(addToast({ type: 'info', message: `Column "${column.title}" removed.` }));
    }
    setMenuOpen(false);
  };

  const columnDotColors: Record<string, string> = {
    backlog: '#71717a',
    todo: '#60a5fa',
    'in-progress': '#a78bfa',
    review: '#fb923c',
    done: '#34d399',
  };

  const dotColor = column.color || columnDotColors[column.status] || '#8b5cf6';

  return (
    <div
      ref={setNodeRef}
      className="w-72 flex-shrink-0 flex flex-col max-h-[calc(100vh-230px)] rounded-xl border transition-all"
      style={{
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border-primary)',
      }}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-3 pb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: dotColor }}
          />
          {isEditingTitle ? (
            <div className="flex items-center gap-1 flex-1">
              <input
                type="text"
                value={colTitle}
                onChange={e => setColTitle(e.target.value)}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleSaveTitle()}
                className="w-full text-xs font-semibold px-1.5 py-0.5 rounded border outline-none"
                style={{
                  background: 'var(--bg-elevated)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--fg-primary)',
                }}
              />
              <button onClick={handleSaveTitle} className="p-0.5 text-emerald-500">
                <Check size={13} />
              </button>
            </div>
          ) : (
            <h3
              className="text-xs font-semibold tracking-tight truncate"
              style={{ color: 'var(--fg-primary)' }}
            >
              {column.title}
            </h3>
          )}
          <span
            className="text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold"
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--fg-tertiary)',
            }}
          >
            {tasks.length}
          </span>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            onClick={() => dispatch(setActiveModal('createTask'))}
            title="Add task to column"
            className="p-1 rounded text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <Plus size={13} />
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <MoreHorizontal size={13} />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-full mt-1 w-32 rounded-md border shadow-lg py-1 z-30 text-xs animate-scale-in"
                style={{
                  background: 'var(--bg-elevated)',
                  borderColor: 'var(--border-primary)',
                }}
              >
                <button
                  onClick={() => {
                    setIsEditingTitle(true);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-[var(--bg-hover)]"
                >
                  <Edit2 size={13} /> Rename
                </button>
                <button
                  onClick={handleDeleteColumn}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-red-500 hover:bg-red-500/10"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Column Tasks */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[120px]">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="h-20 flex items-center justify-center rounded-lg border border-dashed border-zinc-800 text-[11px] text-zinc-500 select-none">
            Empty column
          </div>
        )}
      </div>
    </div>
  );
}
