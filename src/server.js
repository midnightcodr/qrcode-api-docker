const Hapi = require('@hapi/hapi')
const Joi = require('@hapi/joi')
const QRCode = require('qrcode')
const jsQR = require('jsqr')
const { PNG } = require('pngjs')
const Stream = require('stream')

const server = Hapi.server({
  port: parseInt(process.env.WEB_PORT || '3000')
})

const t2q = (request, h) => {
  const {
    query: { info, width }
  } = request
  const responseStream = new Stream.PassThrough()
  QRCode.toFileStream(responseStream, info, { width })
  return h.response(responseStream).type('image/png')
}

const q2t = (request, h) => {
  const { upfile } = request.payload
  const chunks = []
  upfile.on('data', chunk => chunks.push(chunk))
  return new Promise(resolve => {
    return upfile.on('end', () => {
      const content = Buffer.concat(chunks)
      const png = PNG.sync.read(content)
      const { data, width, height } = png
      const code = jsQR(data, width, height)
      return resolve(
        h.response({
          info: code.data,
          width,
          height
        })
      )
    })
  })
}

server.route([
  {
    path: '/t2q',
    method: 'GET',
    options: {
      validate: {
        query: Joi.object({
          info: Joi.string().required(),
          width: Joi.number()
            .integer()
            .min(40)
            .default(400)
        })
      }
    },
    handler: t2q
  },

  {
    path: '/q2t',
    method: 'POST',
    options: {
      validate: {
        payload: Joi.object({
          upfile: Joi.object().required()
        })
      },
      payload: {
        maxBytes: 10485760 * 2, // 20MB
        output: 'stream',
        parse: true,
        allow: 'multipart/form-data',
        multipart: true
      }
    },
    handler: q2t
  }
])

exports.init = async () => {
  await server.initialize()
  return server
}

exports.start = async () => {
  await server.start()
  console.info(`server started at ${server.info.uri}`)
}

process.on('unhandledRejection', err => {
  console.error(err)
  process.exit(1)
})
