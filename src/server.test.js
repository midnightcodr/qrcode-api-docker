/* eslint-env jest */
const { server } = require('./index')
const fs = require('fs')
const FormData = require('form-data')

afterAll(done => {
  server.events.on('stop', done)
  server.stop()
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

test('decode qrcode into text', async () => {
  expect.assertions(2)
  const form = new FormData()
  form.append('upfile', fs.createReadStream('./mocks/hello.png'))
  process.nextTick(() => {
    form.resume()
  })
  const { statusCode, result } = await server.inject({
    method: 'POST',
    url: '/q2t',
    payload: form,
    headers: form.getHeaders()
  })
  expect(statusCode).toBe(200)
  expect(result.info).toBe('hello')
})
