$images = []
$icondirentryBytes = 16

dropHandler = (e, img, size) ->
  if e.dataTransfer.files?.length == 1
    file = e.dataTransfer.files[0]
    e.stopPropagation()
    e.preventDefault()
    fileReader = new FileReader()
    fileReader.onloadend = (e) ->
      buffer = e.target.result
      try
        png = UPNG.decode(buffer)
        if (size == png.width) && (size == png.height)
          img.src = URL.createObjectURL(file)
          index = $images.push([png, buffer])
          img.setAttribute('data-index', index-1)
          enableGenerateButton()
        else
          alert 'Image does not match size'
      catch err
        alert err
      finally
        img.classList.remove('drop-active')
      return#prevent odd returns in try block
    fileReader.readAsArrayBuffer(file)

fileSaver = (blob) ->
  url = URL.createObjectURL(blob)
  anchor = document.createElement('a')
  anchor.setAttribute('download', 'favicon.ico')
  anchor.href = url
  anchor.click()

generateIco = (e) ->
  # get indices for images
  # because a user can drop multiple images over top one another
  # it is not always every img in $images
  indices = Array::slice.call(document.querySelectorAll('figure img[data-index]')).map((img) ->
    Number(img.getAttribute('data-index'))
  )
  if indices.length > 0
    icondirBytes = 6
    # ICONDIR
    size = icondirBytes + (indices.length * $icondirentryBytes)
    buffer = new ArrayBuffer(size)
    dataView = new DataView(buffer)
    dataView.setUint16(0, 0)
    dataView.setUint16(2, 1, true)# 1 for .ico
    dataView.setUint16(4, indices.length, true)# number of images
    offset = size
    buffers = [buffer]
    for i in indices
      [png, imgBuffer] = $images[i]
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
  imgs = Array::slice.call(document.querySelectorAll('figure img[data-size]'))
  imgs.forEach((img) ->
    # read in size on page load, so DOM modification does not effect code
    size = Number(img.getAttribute('data-size'))
    img.addEventListener('drop', (e) ->
      dropHandler(e, img, size)
    )
    img.addEventListener('dragleave', (e) ->
      this.classList.remove('drop-active')
    )
    img.addEventListener('dragover', (e) ->
      e.dataTransfer.dropEffect = 'copy'
      this.classList.add('drop-active')
      e.preventDefault()
    )
  )
  document.querySelector('#generate').addEventListener('click', generateIco)
)
