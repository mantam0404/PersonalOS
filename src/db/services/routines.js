import { db } from '../schema'
import { createId, startOfDay, isSameDay } from '../helpers'
import { getDefaultDomainId } from './domains'

export async function addRoutine(title, domainId) {
  const resolvedDomainId = domainId || (await getDefaultDomainId())
  const routine = {
    id: createId(),
    title: title.trim(),
    domainId: resolvedDomainId,
    streak: 0,
    lastDoneAt: null,
    createdAt: Date.now(),
  }
  await db.routines.add(routine)
  return routine
}

export async function completeRoutine(id) {
  const routine = await db.routines.get(id)
  if (!routine) return null

  const today = startOfDay()
  if (routine.lastDoneAt && isSameDay(routine.lastDoneAt, today)) {
    return routine
  }

  const yesterday = today - 86400000
  const lastDoneDay = routine.lastDoneAt ? startOfDay(routine.lastDoneAt) : null

  let streak = 1
  if (lastDoneDay === yesterday) {
    streak = (routine.streak || 0) + 1
  }

  await db.routines.update(id, { streak, lastDoneAt: Date.now() })
  return { ...routine, streak, lastDoneAt: Date.now() }
}

export async function deleteRoutine(id) {
  await db.routines.delete(id)
}

export function isRoutineDoneToday(routine) {
  return routine.lastDoneAt && isSameDay(routine.lastDoneAt, Date.now())
}
