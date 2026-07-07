import type { ServiceRegistry } from '../container'

export interface IServiceProvider {
  name: string
  initialize(): Promise<void> | void
  getServices(): Partial<ServiceRegistry>
}
