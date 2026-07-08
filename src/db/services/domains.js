import { db } from '../schema'
import { createId } from '../helpers'

export async function getDomains() {
  const items = await db.domains.orderBy('sortOrder').toArray()
  return items
}

export async function getDomain(id) {
  return db.domains.get(id)
}

export async function addDomain(name, color = '#64748b') {
  const domains = await getDomains()
  const domain = {
    id: createId(),
    name: name.trim(),
    color,
    sortOrder: domains.length,
    createdAt: Date.now(),
  }
  await db.domains.add(domain)
  return domain
}

export async function updateDomain(id, updates) {
  await db.domains.update(id, updates)
  return db.domains.get(id)
}

export async function deleteDomain(id) {
  const fallback = await db.domains.orderBy('sortOrder').first()
  if (!fallback) return

  await db.transaction('rw', db.domains, db.tasks, db.projects, db.routines, db.studyItems, async () => {
    await db.tasks.where('domainId').equals(id).modify({ domainId: fallback.id })
    await db.projects.where('domainId').equals(id).modify({ domainId: fallback.id })
    await db.routines.where('domainId').equals(id).modify({ domainId: fallback.id })
    await db.studyItems.where('domainId').equals(id).modify({ domainId: fallback.id })
    await db.domains.delete(id)
  })
}

export async function getDefaultDomainId() {
  const domain = await db.domains.orderBy('sortOrder').first()
  return domain?.id ?? null
}
