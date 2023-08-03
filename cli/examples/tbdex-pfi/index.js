import http from 'http'
import url from 'url'
import { createMessage } from '@tbd54566975/tbdex'

const readReqBody = async req =>
  new Promise(resolve => {
    let data = ''
    req.on('data', chunk => {
      data += chunk
    })
    req.on('end', () => {
      if (data)
        resolve(JSON.parse(data))
      else
        resolve(undefined)
    })
  })

const handleOffering = async (req, res) => {
  console.log('Handling offering!')

  const offering = {
    description            : 'test offering',
    pair                   : 'USD_BTC',
    unitPrice              : '100',
    min                    : '0',
    max                    : '1000',
    presentationRequestJwt : 'testjwt',
    payinInstruments       : [],
    payoutInstruments      : []
  }
  const message = createMessage({
    to   : 'todo remove b/c this is a "resource"',
    from : 'todo remove b/c this is a "resource"',
    type : 'offering',
    body : offering
  })

  res.statusCode = 202
  res.end(JSON.stringify(message))
}

const handleRfq = async (req, res) => {
  console.log('Handling RFQ!')
  const rfqTbdexMessage = await readReqBody(req)
  const quoteTbdexMessage = createMessage({
    last : rfqTbdexMessage,
    to   : rfqTbdexMessage.from,
    type : 'quote',
    body : {
      expiryTime                    : new Date().toISOString(),
      totalFee                      : '100',
      amount                        : '1000',
      paymentPresentationRequestJwt : '',
      paymentInstructions           : { payin: { link: 'fake.link.com' } }
    }
  })
  const orderStatusPendingTbdexMessage = createMessage({
    last : quoteTbdexMessage,
    to   : rfqTbdexMessage.from,
    type : 'orderstatus',
    body : {
      orderStatus: 'PENDING'
    }
  })
  const orderStatusCompletedTbdexMessage = createMessage({
    last : quoteTbdexMessage,
    to   : rfqTbdexMessage.from,
    type : 'orderstatus',
    body : {
      orderStatus: 'COMPLETED'
    }
  })

  console.log('Waiting a few seconds, then going to fire off a Quote in response...')
  setTimeout(() => {
    console.log('Firing off Quote...')
    fetch('http://localhost:8080/quote', {
      method : 'PUT',
      body   : JSON.stringify(quoteTbdexMessage)
    })
      .then(() => {
        setTimeout(() => {
          console.log('firing off PENDING')
          fetch('http://localhost:8080/order-status', {
            method : 'PUT',
            body   : JSON.stringify(orderStatusPendingTbdexMessage)
          }).then(() => {
            setTimeout(() => {
              console.log('firing off COMPLETED')
              fetch('http://localhost:8080/order-status', {
                method : 'PUT',
                body   : JSON.stringify(orderStatusCompletedTbdexMessage)
              })
            }, 4500)
          })
        }, 4500)
      })
  }, 4500)

  res.statusCode = 202
  res.end()
}

const handleOrder = async (req, res) => {
  console.log('order!')
  res.statusCode = 202
  res.end()
}

const server = http.createServer((req, res) => {
  const path = url.parse(req.url).pathname
  console.log('URL Path:', path)

  switch (path) {
    case '/tbdex/offers':
      handleOffering(req, res)
      break
    case '/tbdex/rfq':
      handleRfq(req, res)
      break
    case '/order':
      handleOrder(req, res)
      break
    default:
      res.statusCode = 404
      res.end()
  }
})

const PORT = 3001
const HOST = '0.0.0.0'
server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`)
})
