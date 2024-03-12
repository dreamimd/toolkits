export function cloneDeep<T = any>(obj?: any) {
  return _cloneDeep(obj) as T
}

function _cloneDeep(obj?: any, map = new WeakMap()) {
  if (!obj || typeof obj !== 'object')
    return obj

  const target = map.get(obj)
  if (target)
    return target

  const result: Record<any, any> = Array.isArray(obj) ? [] : {}
  const source: Record<any, any> = obj
  map.set(source, result)

  for (const key in source)
    result[key] = _cloneDeep(source[key], map)

  return result
}
