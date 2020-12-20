/* eslint-env jest */
const { init } = require('./server')
const fs = require('fs')

let server

beforeAll(async () => {
  server = await init()
})

afterAll(async () => {
  await server.stop()
})

test('encode text into image: invalid usage', async () => {
  expect.assertions(1)
  const { result } = await server.inject({
    method: 'GET',
    url: '/t2q'
  })
  expect(result.statusCode).toBe(400)
})

test('encode text into image', async () => {
  expect.assertions(2)
  const { statusCode, rawPayload } = await server.inject({
    method: 'GET',
    url: '/t2q?info=hello'
  })
  const existing = fs.readFileSync('./mocks/hello.png', { encoding: 'base64' })
  expect(statusCode).toBe(200)
  expect(Buffer.from(rawPayload).toString('base64')).toBe(existing)
})
