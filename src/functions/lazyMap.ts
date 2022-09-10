import { groupArrayBySize } from '@edsolater/fnkit'
import { AnyFn } from '@/types/constants'
import { addItem } from './arrayMethods'

const invokedRecord = new Map<string, (LazyMapSettings<any, any> & { idleId: number })[]>()

type LazyMapSettings<T, U> = {
  sourceKey: string
  source: T[]
  loopFn: (item: T, index: number, group: readonly T[]) => U
  /* default 8 */
  sourceGroupSize?: number
}

/**
 * like Array's map(), but each loop will check if new task is pushed in todo queue
 * inspired by `window.requestIdleCallback()`
 * @param settings.source arr
 * @param settings.sourceKey flag for todo queue
 * @param settings.loopFn like js: array::map
 */
export function lazyMap<T, U>(setting: LazyMapSettings<T, U>): Promise<Awaited<U>[]> {
  return new Promise((resolve) => {
    const idleId = requestIdleCallback(async () => {
      const result = await lazyMapCoreMap(setting)
      resolve(result)
    })

    // cancel the last idle callback, and record new setting
    const currentKeySettings = invokedRecord.get(setting.sourceKey) ?? []
    const lastIdleId = currentKeySettings[currentKeySettings.length - 1]?.idleId
    if (lastIdleId) cancelIdleCallback(lastIdleId)
    invokedRecord.set(setting.sourceKey, addItem(invokedRecord.get(setting.sourceKey) ?? [], { ...setting, idleId }))
  })
}

function requestIdleCallback(fn: AnyFn): number {
  //@ts-expect-error code is run in window
  return globalThis.requestIdleCallback ? globalThis.requestIdleCallback(fn) : globalThis.setTimeout(fn) // Safari no't support `window.requestIdleCallback()`, so have to check first
}

function cancelIdleCallback(handleId: number): void {
  return globalThis.cancelIdleCallback ? globalThis.cancelIdleCallback(handleId) : globalThis.clearTimeout(handleId)
}

async function lazyMapCoreMap<T, U>(options: LazyMapSettings<T, U>): Promise<Awaited<U>[]> {
  const wholeResult: Awaited<U>[] = []
  for (const blockList of groupArrayBySize(options.source, options.sourceGroupSize ?? 8)) {
    await new Promise((resolve) => {
      requestIdleCallback(() => {
        Promise.all(blockList.map(options.loopFn)).then((newResultList) => {
          wholeResult.push(...newResultList)
          resolve(undefined)
        })
      })
    }) // forcely use microtask
  }
  return wholeResult
}
