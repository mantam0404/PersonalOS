const OPEN_LIBRARY_SEARCH = 'https://openlibrary.org/search.json'
const OPEN_LIBRARY_COVERS = 'https://covers.openlibrary.org/b/id'

export async function fetchBookCover(title, author = '') {
  if (!title?.trim()) return null

  try {
    const params = new URLSearchParams({ title: title.trim(), limit: '1' })
    if (author?.trim()) params.set('author', author.trim())

    const response = await fetch(`${OPEN_LIBRARY_SEARCH}?${params}`)
    if (!response.ok) return null

    const data = await response.json()
    const doc = data.docs?.[0]
    if (!doc?.cover_i) return null

    return {
      coverUrl: `${OPEN_LIBRARY_COVERS}/${doc.cover_i}-M.jpg`,
      openLibraryKey: doc.key,
      author: doc.author_name?.[0] || author,
    }
  } catch (err) {
    console.warn('[BookCover] fetch failed', err)
    return null
  }
}
