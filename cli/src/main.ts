import yaml from 'js-yaml'
import fs from 'fs'
import { homedir } from 'os'
import { join } from 'path'
import { ProtocolsConfigure, RecordsQuery, RecordsWrite, SignatureInput } from '@tbd54566975/dwn-sdk-js'
import { Readable } from 'node:stream'
import type { Readable as IsomorphicReadable } from 'readable-stream'

// todo since this is a different project I should use the npm packaging system
import { DwnHttpClient } from '../../src/dwn-http-client.js'
import { DwnProxy } from '../../src/dwn-proxy.js'
import { readReq } from '../../src/dwn-http-server.js'

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

type Config = {
  definition: string | any
  routes: Array<any>
}

const httpRequest = async (params) => {
  const res = await fetch(params.endpoint, {
    method : params.method,
    body   : params.body ? JSON.stringify(params.body) : undefined
  })

  if (res.headers.has('content-length') && res.headers.get('content-length') !== '0')
    return await res.json()
}

const main = async () => {
  let did: string | undefined, signatureInput: SignatureInput | undefined
  try {
    const dotfilePath = join(homedir(), '.dwnp')
    const fileContents = fs.readFileSync(dotfilePath, 'utf-8')

    // Split the contents by newline and parse key-value pairs
    const lines = fileContents.split('\n')
    for (const line of lines) {
      const [key, value] = line.split('=')
      if (key === 'did') {
        did = value
      } else if (key === 'signature_input') {
        signatureInput = JSON.parse(value)
      }
    }

    if (!did || !signatureInput)
      throw new Error('Missing required fields in .dwnp file')
  } catch (error) {
    console.error('An error occurred while parsing the .dwnp file:', error)
    process.exit(1)
  }

  const client = new DwnHttpClient()
  const didState = {
    id: did,
    signatureInput
  }
  const proxy = await DwnProxy.create({
    didState
  })

  await proxy.listen()

  const queryRecord = async (params) => {
    // TODO assumption!
    const message = (await RecordsQuery.create({
      ...params,
      authorizationSignatureInput : didState.signatureInput,
      dateSort                    : 'createdAscending'
    })).message
    const { entries } = await proxy.dwn.processMessage(didState.id, message)
    if (!entries) return undefined
    return entries[entries.length - 1]
  }

  const fetchFromBackend = async params => {
    params.dataFormat = 'application/json' // hard coded :)
    const body = await httpRequest(params)
    const { message } = await RecordsWrite.create({
      ...params,
      data                        : Buffer.from(JSON.stringify(body), 'utf-8'),
      authorizationSignatureInput : didState.signatureInput
    })
    await proxy.dwn.processMessage(
      didState.id,
      message,
      Readable.from(JSON.stringify(body)) as unknown as IsomorphicReadable)

    // todo if I don't include the messageTimestamp then I get "/descriptor: must have required property 'messageTimestamp'"
    // but if I do include the messageTimestamp, as I'm doing below, then I get a "RecordsQuery: must NOT have additional properties"
    params.dwnRequest.message = {
      ...params.dwnRequest.message,
      messageTimestamp: message.descriptor.messageTimestamp // todo wtf
    }
    const reply =  await proxy.dwn.processMessage(didState.id, params.dwnRequest.message)
    return { reply }
  }

  const forwardToBackend = async params => {
    params.body = params.dwnRequest.payload
    await httpRequest(params)
    const reply = await proxy.dwn.processMessage(
      didState.id,
      params.dwnRequest.message,
      Readable.from(JSON.stringify(params.dwnRequest.data)) as unknown as IsomorphicReadable)
    return { reply }
  }

  const sendDwnMessage = async params => {
    params.dataFormat = 'application/json' // hard coded :)
    const { message } = await RecordsWrite.create({
      ...params,
      data                        : Buffer.from(JSON.stringify(params.data), 'utf-8'),
      authorizationSignatureInput : didState.signatureInput
    })
    await proxy.dwn.processMessage(
      didState.id,
      message,
      Readable.from(JSON.stringify(params.data)) as unknown as IsomorphicReadable)
    await client.send(params.recipient, message, JSON.stringify(params.data))
  }

  // read the yml config
  const path = process.argv[2]
  if (!fs.existsSync(path))
    throw new Error('You must supply the path to the config yml')
  let config = yaml.load(fs.readFileSync(path, 'utf-8')) as Config
  config.definition = await new Promise(
    resolve => fetch(config.definition).then(res => resolve(res.json())))

  // configure the dwn protocol
  await proxy.dwn.processMessage(
    didState.id,
    (await ProtocolsConfigure.create({
      definition                  : config.definition,
      authorizationSignatureInput : didState.signatureInput
    })).message
  )

  // go ahead and replace any references to the protocol definition
  DwnProxyMarkup.populate(config.routes, { '#definition': config.definition })

  // wire-up each route
  for (const route of config.routes) {
    console.log('Configuring route', route.description)

    if (route.interface === 'DwnRequest') {
      proxy.addHandler(
        dwnRequest =>
          Object.entries(route.match).every(([key, value]) => {
            let obj = dwnRequest.message.descriptor

            for (const prop of key.split('.')) {
              obj = obj[prop]
              if (obj === undefined) return false
            }

            return obj === value
          }),
        async dwnRequest => {
          let populatePool = { '#dwnRequest': dwnRequest }

          for (let action of route.actions) {
            // we enable previous actions' outputs to be used as inputs to subsequent actions
            action.params = DwnProxyMarkup.populate(action.params, populatePool)
            action.params = { ...action.params, dwnRequest }

            if (action.action === 'REPLY')
              return action.params
            else if (action.action === 'FETCH_FROM_BACKEND')
              return await fetchFromBackend(action.params)
            else if (action.action === 'FORWARD_TO_BACKEND')
              return await forwardToBackend(action.params)
            else
              throw new Error(`Inbound action not supported ${action.action}`)
          }

          throw new Error(`Never replied to client`)
        }
      )
    } else if (route.interface === 'Restful') {
      proxy.server.api.put(
        route.path, async (req, res) => {
          let populatePool = { '#body': await readReq(req) }

          for (let action of route.actions) {
            // we enable previous actions' outputs to be used as inputs to subsequent actions
            action.params = DwnProxyMarkup.populate(action.params, populatePool)

            if (action.action === 'QUERY_RECORD')
              populatePool['#' + action.id] = await queryRecord(action.params)
            else if (action.action === 'SEND_DWN_MESSAGE')
              await sendDwnMessage(action.params)
            else
              throw new Error(`Inbound action not supported ${action.action}`)
          }

          res.status(200)
          res.end()
        })
    } else {
      throw new Error(`Route interface unsupported ${route.interface}`)
    }
  }
}

main()