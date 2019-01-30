(function() {
  var $icondirentryBytes, $images, addImage, dropHandler, enableGenerateButton, fileSaver, generateIco;

  $images = [];

  $icondirentryBytes = 16;

  dropHandler = function(e) {
    var file, fileReader, img, ref, url;
    img = this;
    if (((ref = e.dataTransfer.files) != null ? ref.length : void 0) === 1) {
      file = e.dataTransfer.files[0];
      e.stopPropagation();
      e.preventDefault();
      url = URL.createObjectURL(file);
      fileReader = new FileReader();
      fileReader.onloadend = function(e) {
        var buffer, err, index, png;
        buffer = e.target.result;
        try {
          png = UPNG.decode(buffer);
          if ((img.width === png.width) && (img.height === png.height)) {
            img.src = url;
            index = $images.push([png, buffer]);
            img.setAttribute('data-index', index - 1);
            return enableGenerateButton();
          } else {
            return alert('Image does not match size');
          }
        } catch (error) {
          err = error;
          return console.warn(err);
        }
      };
      return fileReader.readAsArrayBuffer(file);
    }
  };

  fileSaver = function(blob) {
    var anchor, url;
    url = URL.createObjectURL(blob);
    anchor = document.createElement('a');
    anchor.setAttribute('download', 'favicon.ico');
    anchor.href = url;
    return anchor.click();
  };

  generateIco = function(e) {
    var buffer, buffers, dataView, i, icoFile, icondirBytes, imgBuffer, indices, j, len, offset, png, size;
    indices = Array.prototype.slice.call(document.querySelectorAll('figure img[data-index]')).map(function(img) {
      return Number(img.getAttribute('data-index'));
    });
    if (indices.length > 0) {
      icondirBytes = 6;
      // ICONDIR
      size = icondirBytes + (indices.length * $icondirentryBytes);
      buffer = new ArrayBuffer(size);
      dataView = new DataView(buffer);
      dataView.setUint16(0, 0);
      dataView.setUint16(2, 1, true); // 1 for .ico
      dataView.setUint16(4, indices.length, true); // number of images
      offset = size;
      buffers = [buffer];
      for (j = 0, len = indices.length; j < len; j++) {
        i = indices[j];
        [png, imgBuffer] = $images[i];
        buffers.push(imgBuffer);
        offset = addImage(dataView, png, imgBuffer, size, i);
      }
      // generate file
      icoFile = new Blob(buffers, {
        type: 'image/x-icon'
      });
      return fileSaver(icoFile);
    }
  };

  addImage = function(dataView, png, imgBuffer, offset, i) {
    var dirOffset;
    dirOffset = i * $icondirentryBytes;
    //ICONDIRENTRY
    dataView.setUint8(6 + dirOffset, png.width); // width
    dataView.setUint8(7 + dirOffset, png.height); // width
    dataView.setUint8(8 + dirOffset, 0); // palette?
    dataView.setUint8(9 + dirOffset, 0);
    dataView.setUint16(10 + dirOffset, 1, true); // color planes
    dataView.setUint16(12 + dirOffset, png.depth * 4, true); // bits per channel (RBGA)
    dataView.setUint32(14 + dirOffset, imgBuffer.byteLength, true); // file size
    dataView.setUint32(18 + dirOffset, offset, true); // offset
    return offset + imgBuffer.byteLength;
  };

  enableGenerateButton = function() {
    return document.querySelector('#generate').disabled = false;
  };

  document.addEventListener('DOMContentLoaded', function() {
    var imgs;
    imgs = Array.prototype.slice.call(document.querySelectorAll('figure img'));
    imgs.forEach(function(img) {
      img.addEventListener('drop', dropHandler);
      return img.addEventListener('dragover', function(e) {
        return e.preventDefault();
      });
    });
    return document.querySelector('#generate').addEventListener('click', generateIco);
  });

}).call(this);
