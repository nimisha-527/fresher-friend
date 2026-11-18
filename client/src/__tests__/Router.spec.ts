import { describe, expect, it } from 'vitest'
import router from '../router'
import { routePaths } from '../router/paths'

describe('router', () => {
  it('registers the home and navigation destinations', () => {
    const registeredPaths = router.getRoutes().map((route) => route.path)

    expect(registeredPaths.sort()).toEqual(Object.values(routePaths).sort())
    expect(router.resolve(routePaths.home).name).toBe('home')
  })
})
