export const extend = function(properties) {
  for (const key in properties) {
    const value = properties[key]
    this[key] = value
  }
  return this
}
