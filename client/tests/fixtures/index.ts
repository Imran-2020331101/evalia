export const axiosError = (data: any = 'server said no') => ({ response: { data } })
export const networkError = () => new Error('Network Error')
export const sampleUser = { user: { id: 'u1', name: 'Test', email: 't@x.io', roles: ['USER'] } }
export const sampleJob = { _id: 'j1', title: 'Engineer', applications: [] }
