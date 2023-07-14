export class DwnProxyMarkup {
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

  static populate = (obj: any, replacements: any): any => {
    for (const [key, value] of Object.entries(obj)) {
      if (value) {
        if (Array.isArray(value)) {
          obj[key] = value.map(item => DwnProxyMarkup.populate(item, replacements))
        } else if (typeof value === 'object') {
          obj[key] = DwnProxyMarkup.populate(value, replacements)
        } else if (typeof value === 'string' && value[0] === '#') {
          const dotDelimited = value.split('.')
          if (dotDelimited.length === 1) {
            if (replacements[value])
              obj[key] = replacements[value]
          } else {
            if (replacements[dotDelimited[0]])
              obj[key] = DwnProxyMarkup.resolveDotDelimited(replacements[dotDelimited[0]], value)
          }
        }
      }
    }

    return obj
  }
}