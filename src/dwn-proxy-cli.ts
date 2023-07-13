import yaml from 'js-yaml'
import fs from 'fs'
import { homedir } from 'os'
import { join } from 'path'
import { ProtocolsConfigure, RecordsQuery, RecordsWrite, SignatureInput } from '@tbd54566975/dwn-sdk-js'
import { Readable } from 'node:stream'
import type { Readable as IsomorphicReadable } from 'readable-stream'

import { DwnHttpClient } from './dwn-http-client.js'
import { DwnProxy } from './dwn-proxy.js'
import { DwnProxyMarkup } from './dwn-proxy-markup.js'
import { readReq } from './dwn-http-server.js'

type Config = {
  definition: string | any
  routes: Array<any>
}

export const main = async () => {
  let did: string, signatureInput: SignatureInput
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

    if (!did || !signatureInput) {
      throw new Error('Missing required fields in .dwnp file')
    }
  } catch (error) {
    console.error('An error occurred while parsing the .dwnp file:', error)
    process.exit(1)
  }

  const client = new DwnHttpClient()
  const didState = {
    id: did,
    signatureInput
  }
  const proxy = new DwnProxy({
    didState
  })

  await proxy.listen()

  const httpRequest = async (params) => {
    const res = await fetch(params.endpoint, {
      method : params.method,
      body   : params.body ? JSON.stringify(params.body) : undefined
    })

    if (res.headers.has('content-length') && res.headers.get('content-length') !== '0')
      return await res.json()
  }

  const createRecordsWriteMessage = async (params) => {
    return (await RecordsWrite.create({
      ...params,
      data                        : Buffer.from(JSON.stringify(params.data), 'utf-8'),
      authorizationSignatureInput : didState.signatureInput
    })).message
  }

  const processMessage = async (params) => {
    return await proxy.dwn.processMessage(
      didState.id,
      params.message,
      params.data ? Readable.from(JSON.stringify(params.data)) as IsomorphicReadable : undefined)
  }

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

  const sendDwnRequest = async (params) => {
    await client.send(params.to, params.message, JSON.stringify(params.data))
  }

  const handleAction = async (action: any): Promise<any> => {
    switch (action.action) {
      case 'HTTP_REQUEST':
        return await httpRequest(action.params)
      case 'RECORD_WRITE':
        return await createRecordsWriteMessage(action.params)
      case 'PROCESS_MESSAGE':
        return await processMessage(action.params)
      case 'QUERY_RECORD':
        return await queryRecord(action.params)
      case 'SEND_DWN_REQUEST':
        return await sendDwnRequest(action.params)
      default:
        console.error('Unknown action', action.action)
    }
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

    if (route.direction === 'INBOUND') {
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

            if (action.action === 'REPLY')
              return action.params

            populatePool['#' + action.id] = await handleAction(action)
          }

          throw new Error(`Never replied to client`)
        }
      )
    } else if (route.direction === 'OUTBOUND') {
      proxy.server.api.put(
        route.path, async (req, res) => {
          let populatePool = { '#body': await readReq(req) }

          for (let action of route.actions) {
            // we enable previous actions' outputs to be used as inputs to subsequent actions
            action.params = DwnProxyMarkup.populate(action.params, populatePool)
            populatePool['#' + action.id] = await handleAction(action)
          }

          res.status(200)
          res.end()
        })
    } else {
      throw new Error(`Route direction unsupported ${route.direction}`)
    }
  }
}