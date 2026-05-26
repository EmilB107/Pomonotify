import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button, AddButton, TrashButton, SectionLabel } from './Button'


function DragHandle({ listeners, attributes }) {
  return (
    <button
      type="button"
      className="touch-none cursor-grab active:cursor-grabbing text-[#888] dark:text-[#666] hover:text-[#666] dark:hover:text-[#aaa] transition-colors flex-shrink-0"
      {...listeners}
      {...attributes}
      aria-label="Drag to reorder"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" />
        <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
        <circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" />
      </svg>
    </button>
  )
}

function SortableItem({ todo, activeTask, setActiveTask, onToggle, deleteMode, selected, toggleSelect }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: todo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${
        deleteMode
          ? selected.has(todo.id)
            ? 'bg-red-400/10 cursor-pointer'
            : 'hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer'
          : activeTask === todo.id
            ? 'bg-[#84a98c]/10 cursor-pointer'
            : 'hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer'
      }`}
      onClick={() => deleteMode
        ? toggleSelect(todo.id)
        : setActiveTask(activeTask === todo.id ? null : todo.id)
      }
    >
      {!deleteMode && <DragHandle listeners={listeners} attributes={attributes} />}

      {deleteMode ? (
        <div className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          selected.has(todo.id) ? 'bg-red-400 border-red-400' : 'border-black/20 dark:border-white/20'
        }`}>
          {selected.has(todo.id) && (
            <svg className="w-full h-full p-0.5" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M2 6l3 3 5-5" />
            </svg>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onToggle(todo.id) }}
          className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer ${
            todo.completed ? 'bg-[#52796f] border-[#52796f]' : 'border-black/20 dark:border-white/20 hover:border-[#52796f]'
          }`}
        >
          {todo.completed && (
            <svg className="w-full h-full p-0.5" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M2 6l3 3 5-5" />
            </svg>
          )}
        </button>
      )}

      <span className={`flex-1 text-base transition-colors ${
        deleteMode
          ? selected.has(todo.id) ? 'text-red-400' : 'text-[#1a1a1a] dark:text-[#e8e8e8]'
          : todo.completed
            ? 'line-through text-[#666] dark:text-[#777]'
            : activeTask === todo.id
              ? 'text-[#52796f] dark:text-[#84a98c] font-medium'
              : 'text-[#1a1a1a] dark:text-[#e8e8e8]'
      }`}>
        {todo.text}
      </span>
    </li>
  )
}

export function TodoList({ todos, activeTask, setActiveTask, addTodo, toggleTodo, deleteTodo, reorderTodos, clearCompleted, showAdd, setShowAdd }) {
  const [input, setInput] = useState('')
  const [deleteMode, setDeleteMode] = useState(false)
  const [selected, setSelected] = useState(new Set())
  const [pinBottom, setPinBottom] = useState(new Set())

  const displayTodos = [
    ...todos.filter(t => !t.completed && !pinBottom.has(t.id)),
    ...todos.filter(t => t.completed || pinBottom.has(t.id)),
  ]

  function handleToggle(id) {
    const todo = todos.find(t => t.id === id)
    if (todo.completed) {
      setPinBottom(prev => new Set([...prev, id]))
      setTimeout(() => setPinBottom(prev => { const next = new Set(prev); next.delete(id); return next }), 200)
    }
    toggleTodo(id)
  }

  const allSelected = todos.length > 0 && selected.size === todos.length

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  )

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return
    const oldIndex = displayTodos.findIndex(t => t.id === active.id)
    const newIndex = displayTodos.findIndex(t => t.id === over.id)
    reorderTodos(arrayMove(displayTodos, oldIndex, newIndex))
  }

  function handleSave() {
    if (!input.trim()) return
    addTodo(input)
    setInput('')
    setShowAdd(false)
  }

  function handleCancel() {
    setInput('')
    setShowAdd(false)
  }

  function enterDeleteMode() {
    setDeleteMode(true)
    setSelected(new Set())
    setShowAdd(false)
  }

  function exitDeleteMode() {
    setDeleteMode(false)
    setSelected(new Set())
  }

  function toggleSelect(id) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    setSelected(allSelected ? new Set() : new Set(todos.map(t => t.id)))
  }

  function deleteSelected() {
    selected.forEach(id => deleteTodo(id))
    exitDeleteMode()
  }

  return (
    <div className="bg-white dark:bg-[#242424] rounded-3xl p-5 flex flex-col gap-4">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SectionLabel>Tasks</SectionLabel>
          {!deleteMode && todos.some(t => t.completed) && (
            <button
              type="button"
              onClick={clearCompleted}
              className="text-xs text-[#666] dark:text-[#aaa] hover:text-red-400 dark:hover:text-red-400 transition-colors"
            >
              Clear done
            </button>
          )}
        </div>

        {deleteMode ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-xs text-[#666] dark:text-[#aaa] hover:text-[#52796f] dark:hover:text-[#84a98c] transition-colors"
            >
              {allSelected ? 'Deselect all' : 'Select all'}
            </button>
            <Button
              size="none"
              variant="primary"
              className="px-3 py-1.5 text-xs bg-red-400 hover:bg-red-500"
              onClick={deleteSelected}
              disabled={selected.size === 0}
            >
              Delete {selected.size > 0 ? `(${selected.size})` : ''}
            </Button>
            <Button size="none" variant="ghost" className="px-3 py-1.5 text-xs" onClick={exitDeleteMode}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center">
            {todos.length > 0 && (
              <TrashButton onClick={enterDeleteMode} aria-label="Delete tasks" />
            )}
            {!showAdd && <AddButton onClick={() => setShowAdd(true)} aria-label="Add task" />}
          </div>
        )}
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="flex flex-col gap-2">
          <input
            autoFocus
            className="w-full text-sm bg-black/5 dark:bg-white/5 rounded-2xl px-4 py-3 outline-none placeholder:text-[#666] dark:placeholder:text-[#aaa] focus:ring-1 focus:ring-[#52796f] dark:focus:ring-[#84a98c] transition-all"
            placeholder="Add a task..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel() }}
          />
          <div className="flex gap-2 justify-end">
            <Button size="none" variant="ghost" className="px-4 py-2 text-sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="none" variant="primary" className="px-4 py-2 text-sm" onClick={handleSave} disabled={!input.trim()}>
              Save
            </Button>
          </div>
        </div>
      )}

      {todos.length === 0 ? (
        <p className="text-sm text-center text-[#666] dark:text-[#aaa] py-4">No tasks yet</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={displayTodos.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <ul className="flex flex-col gap-1">
              {displayTodos.map(todo => (
                <SortableItem
                  key={todo.id}
                  todo={todo}
                  activeTask={activeTask}
                  setActiveTask={setActiveTask}
                  onToggle={handleToggle}
                  deleteMode={deleteMode}
                  selected={selected}
                  toggleSelect={toggleSelect}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
