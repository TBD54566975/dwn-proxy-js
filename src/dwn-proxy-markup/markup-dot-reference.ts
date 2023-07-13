export class MarkupDotReference {
  static resolveDotDelimited = (obj: any, value: string) => {
    const propChain = value.split('.').slice(1)
    let protoValue = obj
    for (let prop of propChain) {
      protoValue = protoValue[prop]
      if (protoValue === undefined) {
        return false
      }
    }
    return protoValue
  }

  static referenceReplace = (obj: any, replacements = {}) => {
    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        obj[key] = value.map(item => MarkupDotReference.referenceReplace(item, replacements))
      } else if (typeof value === 'object') {
        obj[key] = MarkupDotReference.referenceReplace(value, replacements)
      } else if (typeof value === 'string' && value[0] === '#') {
        const dotDelimited = value.split('.')
        if (dotDelimited.length === 1) {
          obj[key] = replacements[value]
        } else {
          obj[key] = MarkupDotReference.resolveDotDelimited(replacements[dotDelimited[0]], value)
        }
      }
    }

    return obj
  }
}
