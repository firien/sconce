$images = []
$icondirentryBytes = 16

dropHandler = (e) ->
  img = this
  if e.dataTransfer.files?.length == 1
    file = e.dataTransfer.files[0]
    e.stopPropagation()
    e.preventDefault()
    url = URL.createObjectURL(file)
    fileReader = new FileReader()
    fileReader.onloadend = (e) ->
      buffer = e.target.result
      try
        png = UPNG.decode(buffer)
        if (img.width == png.width) && (img.height == png.height)
          img.src = url
          $images.push([png, buffer])
          enableGenerateButton()
        else
          alert 'Image does not match size'
      catch err
        console.warn err
    fileReader.readAsArrayBuffer(file)

fileSaver = (blob) ->
  url = URL.createObjectURL(blob)
  anchor = document.createElement('a')
  anchor.setAttribute('download', 'favicon.ico')
  anchor.href = url
  anchor.click()

generateIco = (e) ->
  if $images.length > 0
    icondirBytes = 6
    # ICONDIR
    size = icondirBytes + ($images.length * $icondirentryBytes)
    buffer = new ArrayBuffer(size)
    dataView = new DataView(buffer)
    dataView.setUint16(0, 0)
    dataView.setUint16(2, 1, true)# 1 for .ico
    dataView.setUint16(4, 1, true)# number of images
    offset = size
    buffers = [buffer]
    for image, i in $images
      png = image[0]
      imgBuffer = image[1]
      buffers.push imgBuffer
      offset = addImage(dataView, png, imgBuffer, size, i)
    # generate file
    icoFile = new Blob(buffers, type: 'image/x-icon')
    fileSaver(icoFile)

addImage = (dataView, png, imgBuffer, offset, i) ->
  dirOffset = i * $icondirentryBytes
  #ICONDIRENTRY
  dataView.setUint8(6 + dirOffset, png.width)# width
  dataView.setUint8(7 + dirOffset, png.height)# width
  dataView.setUint8(8 + dirOffset, 0)# palette?
  dataView.setUint8(9 + dirOffset, 0)
  dataView.setUint16(10 + dirOffset, 1, true)# color planes
  dataView.setUint16(12 + dirOffset, png.depth * 4, true)# bits per channel (RBGA)
  dataView.setUint32(14 + dirOffset, imgBuffer.byteLength, true)# file size
  dataView.setUint32(18 + dirOffset, offset, true)# offset
  offset + imgBuffer.byteLength

enableGenerateButton = ->
  document.querySelector('#generate').disabled = false

document.addEventListener('DOMContentLoaded', ->
  imgs = Array::slice.call(document.querySelectorAll('figure img'))
  imgs.forEach((img) ->
    img.addEventListener('drop', dropHandler)
    img.addEventListener('dragover', (e) ->
      e.preventDefault()
    )
  )
  document.querySelector('#generate').addEventListener('click', generateIco)
)
