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
  const png = new PNG({
    fileType: -1
  })
  return new Promise(resolve => {
    png.on('parsed', () => {
      const { data, width, height } = png
      const code = jsQR(data, width, height)
      return resolve({
        info: code.data,
        width,
        height
      })
    })
    upfile.pipe(png)
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

exports.server = server

if (!module.parent) {
  server.start().then(() => {
    console.info(`server started at ${server.info.uri}`)
  })
}

process.on('unhandledRejection', err => {
  console.error(err)
  process.exit(1)
})
