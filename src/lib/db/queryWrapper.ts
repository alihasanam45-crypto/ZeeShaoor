type Document = Record<string, unknown>

export class QueryWrapper<T extends Document> {
  private collection: T[] = []

  constructor(private name: string) {}

  async findById(id: string): Promise<T | null> {
    return this.collection.find((doc) => (doc as unknown as { id: string }).id === id) || null
  }

  async findAll(filter?: Partial<T>): Promise<T[]> {
    if (!filter) return [...this.collection]
    return this.collection.filter((doc) =>
      Object.entries(filter).every(([key, value]) => doc[key] === value)
    )
  }

  async create(data: T): Promise<T> {
    this.collection.push(data)
    return data
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const idx = this.collection.findIndex((doc) => (doc as unknown as { id: string }).id === id)
    if (idx === -1) return null
    this.collection[idx] = { ...this.collection[idx], ...data }
    return this.collection[idx]
  }

  async delete(id: string): Promise<boolean> {
    const idx = this.collection.findIndex((doc) => (doc as unknown as { id: string }).id === id)
    if (idx === -1) return false
    this.collection.splice(idx, 1)
    return true
  }

  count(): number {
    return this.collection.length
  }
}
