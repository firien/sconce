fs = require 'fs'
path = require 'path'
coffee = require 'coffeescript'

task('build', 'Build application', (options) ->
  pug = require 'pug'
  html = pug.renderFile('index.pug', pretty: true)
  filename = 'docs/index.html'
  dirname = path.dirname(filename)
  if not fs.existsSync(dirname)
    fs.mkdirSync(dirname)
  fs.writeFileSync(filename, html)
  ['sconce', 'service', 'pwa'].forEach((filename) ->
    cs = fs.readFileSync("#{filename}.coffee", 'utf8')
    js = coffee.compile cs
    fs.writeFileSync("docs/#{filename}.js", js)
  )
)

task('serve', 'serve', (options) ->
  watch = require 'watch'
  watch.watchTree(__dirname, interval: 0.3, ->
    try
      invoke 'build'
    catch e
      console.log e
  )

  http = require 'http'
  url = require 'url'
  mime = require 'mime'
  http.createServer((request, response) ->
    uri = url.parse(request.url).pathname
    filePath = path.join(process.cwd(), 'docs', uri)

    if fs.existsSync(filePath)
      if fs.statSync(filePath).isDirectory()
        filePath += '/index.html'

      stat = fs.statSync(filePath)
      ext = path.extname(filePath)
      contentType = mime.getType(ext)
      response.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': stat.size
      })

      readStream = fs.createReadStream(filePath)
      readStream.pipe(response)
    else
      response.writeHead(404, 'Content-Type': 'text/plain')
      response.write("404 Not Found\n")
      response.end()
      return
  ).listen(3010)
)
