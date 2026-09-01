import type { Route } from "next";

/**
 * Typed builders for dynamic routes. `typedRoutes` can't infer a bare template
 * literal passed through a prop, so we centralise the one cast here.
 */
export const classHref = (id: string) => `/classes/${id}` as Route;
export const editClassHref = (id: string) => `/classes/${id}/edit` as Route;
export const semesterHref = (id: string) => `/semesters/${id}` as Route;
export const editSemesterHref = (id: string) => `/semesters/${id}/edit` as Route;
export const newClassHref = (semesterId: string) =>
  `/classes/new?semester=${semesterId}` as Route;

/** List view for a semester's classes: the active one lives at /classes. */
export const classesHref = (semesterId: string, isActive: boolean): Route =>
  isActive ? "/classes" : semesterHref(semesterId);

export const taskHref = (id: string) => `/tasks/${id}` as Route;
export const editTaskHref = (id: string) => `/tasks/${id}/edit` as Route;
export const activityHref = (id: string) => `/extracurriculars/${id}` as Route;
export const editActivityHref = (id: string) => `/extracurriculars/${id}/edit` as Route;
export const eventHref = (id: string) => `/events/${id}` as Route;
export const editEventHref = (id: string) => `/events/${id}/edit` as Route;
export const newEventHref = (dateKey?: string) =>
  (dateKey ? `/events/new?date=${dateKey}` : "/events/new") as Route;
