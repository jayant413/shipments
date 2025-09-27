// Client-side API calls using fetch
export function createClient() {
  return {
    from: (table: string) => {
      if (table === 'shipments') {
        return {
          select: (fields?: string) => ({
            order: (field: string, options: { ascending: boolean }) => ({
              async then(callback: (result: any) => any) {
                try {
                  const response = await fetch('/api/shipments')
                  const result = await response.json()
                  return callback({ data: result.data, error: null })
                } catch (error) {
                  return callback({ data: null, error })
                }
              }
            }),
            async then(callback: (result: any) => any) {
              try {
                const response = await fetch('/api/shipments')
                const result = await response.json()
                return callback({ data: result.data, error: null })
              } catch (error) {
                return callback({ data: null, error })
              }
            }
          }),
          insert: (documents: any[]) => ({
            select: () => ({
              single: () => ({
                async then(callback: (result: any) => any) {
                  try {
                    const response = await fetch('/api/shipments', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(documents[0])
                    })
                    const result = await response.json()
                    return callback({ data: result.data, error: null })
                  } catch (error) {
                    return callback({ data: null, error })
                  }
                }
              }),
              async then(callback: (result: any) => any) {
                try {
                  const response = await fetch('/api/shipments/bulk', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ shipments: documents })
                  })
                  const result = await response.json()
                  return callback({ data: result.data, error: null })
                } catch (error) {
                  return callback({ data: null, error })
                }
              }
            })
          }),
          update: (updateData: any) => ({
            eq: (field: string, value: any) => ({
              select: () => ({
                single: () => ({
                  async then(callback: (result: any) => any) {
                    try {
                      const response = await fetch(`/api/shipments/${value}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updateData)
                      })
                      const result = await response.json()
                      return callback({ data: result.data, error: null })
                    } catch (error) {
                      return callback({ data: null, error })
                    }
                  }
                })
              })
            })
          }),
          delete: () => ({
            eq: (field: string, value: any) => ({
              async then(callback: (result: any) => any) {
                try {
                  const response = await fetch(`/api/shipments/${value}`, {
                    method: 'DELETE'
                  })
                  const result = await response.json()
                  return callback({ error: null })
                } catch (error) {
                  return callback({ error })
                }
              }
            })
          })
        }
      }
      throw new Error(`Table ${table} not found`)
    }
  }
}
