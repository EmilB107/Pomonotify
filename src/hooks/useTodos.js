import { useState, useEffect } from 'react'

export function useTodos() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('pomonotify-todos')
    return saved ? JSON.parse(saved) : []
  })
  const [activeTask, setActiveTask] = useState(null)

  useEffect(() => {
    localStorage.setItem('pomonotify-todos', JSON.stringify(todos))
  }, [todos])

  function addTodo(text) {
    if (!text.trim()) return
    setTodos(prev => [...prev, { id: Date.now(), text, completed: false }])
  }

  function toggleTodo(id) {
    setTodos(prev =>
      prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    )
  }

  function deleteTodo(id) {
    setTodos(prev => prev.filter(t => t.id !== id))
    if (activeTask === id) setActiveTask(null)
  }

  function reorderTodos(newOrder) {
    setTodos(newOrder)
  }

  function clearCompleted() {
    const completedIds = new Set(todos.filter(t => t.completed).map(t => t.id))
    setTodos(prev => prev.filter(t => !t.completed))
    if (completedIds.has(activeTask)) setActiveTask(null)
  }

  return { todos, activeTask, setActiveTask, addTodo, toggleTodo, deleteTodo, reorderTodos, clearCompleted }
}
