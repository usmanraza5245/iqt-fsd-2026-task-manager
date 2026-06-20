"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, type TaskInput } from "@/utils/api";
import type { Task } from "@/utils/types";
import { getErrorMessage } from "@/utils/getErrorMessage";

export type EditableFields = { title: string; description: string };

/**
 * Owns the task collection and all server interactions, exposing a small
 * imperative API to the UI. Mutations are optimistic and roll back on failure.
 *
 * Operations that the UI needs to react to (create/edit) rethrow on failure so
 * the caller can keep a form open; toggle/delete swallow the error after
 * surfacing it via `error`, since there is no form state to preserve.
 */
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mirror of `tasks` so stable callbacks can read the latest list (e.g. to
  // snapshot it for rollback) without taking it as a dependency.
  const tasksRef = useRef(tasks);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    let active = true;
    api
      .list()
      .then((data) => active && setTasks(data))
      .catch((e) => active && setError(getErrorMessage(e)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const create = useCallback(async (input: TaskInput) => {
    setError(null);
    try {
      const task = await api.create(input);
      setTasks((prev) => [task, ...prev]);
    } catch (e) {
      setError(getErrorMessage(e));
      throw e;
    }
  }, []);

  const toggle = useCallback(async (task: Task) => {
    setError(null);
    const completed = !task.completed;
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed } : t)),
    );
    try {
      await api.update(task.id, { completed });
    } catch (e) {
      setError(getErrorMessage(e));
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, completed: task.completed } : t,
        ),
      );
    }
  }, []);

  const edit = useCallback(async (task: Task, fields: EditableFields) => {
    setError(null);
    try {
      const updated = await api.update(task.id, fields);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch (e) {
      setError(getErrorMessage(e));
      throw e;
    }
  }, []);

  const remove = useCallback(async (task: Task) => {
    setError(null);
    const previous = tasksRef.current;
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    try {
      await api.remove(task.id);
    } catch (e) {
      setError(getErrorMessage(e));
      setTasks(previous); // restore the list as it was before deletion
    }
  }, []);

  return { tasks, loading, error, create, toggle, edit, remove };
}
