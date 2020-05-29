let $images = [];
let $icondirentryBytes = 16;

const dropHandler = function(e, img, size) {
  var file, fileReader, ref;
  if (((ref = e.dataTransfer.files) != null ? ref.length : void 0) === 1) {
    file = e.dataTransfer.files[0];
    e.stopPropagation();
    e.preventDefault();
    fileReader = new FileReader();
    fileReader.onloadend = function(e) {
      var buffer, err, index, png;
      buffer = e.target.result;
      try {
        png = UPNG.decode(buffer);
        if ((size === png.width) && (size === png.height)) {
          img.src = URL.createObjectURL(file);
          index = $images.push([png, buffer]);
          img.setAttribute('data-index', index - 1);
          enableGenerateButton();
        } else {
          alert('Image does not match size');
        }
      } catch (error) {
        err = error;
        alert(err);
      } finally {
        img.classList.remove('drop-active'); //prevent odd returns in try block
      }
    };
    return fileReader.readAsArrayBuffer(file);
  }
};

const fileSaver = function(blob) {
  let url = URL.createObjectURL(blob);
  let anchor = document.createElement('a');
  anchor.setAttribute('download', 'favicon.ico');
  anchor.href = url;
  return anchor.click();
};

const generateIco = function(e) {
  // get indices for images
  // because a user can drop multiple images over top one another
  // it is not always every img in $images
  let indices = Array.from(document.querySelectorAll('figure img[data-index]')).map(function(img) {
    return Number(img.getAttribute('data-index'));
  });
  if (indices.length > 0) {
    const icondirBytes = 6;
    // ICONDIR
    let size = icondirBytes + (indices.length * $icondirentryBytes);
    let buffer = new ArrayBuffer(size);
    let dataView = new DataView(buffer);
    dataView.setUint16(0, 0);
    dataView.setUint16(2, 1, true); // 1 for .ico
    dataView.setUint16(4, indices.length, true); // number of images
    let offset = size;
    let buffers = [buffer];
    for (let i of indices) {
      let [png, imgBuffer] = $images[i];
      buffers.push(imgBuffer);
      offset = addImage(dataView, png, imgBuffer, size, i);
    }
    // generate file
    let icoFile = new Blob(buffers, {
      type: 'image/x-icon'
    });
    return fileSaver(icoFile);
  }
};

const addImage = function(dataView, png, imgBuffer, offset, i) {
  let dirOffset = i * $icondirentryBytes;
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

const enableGenerateButton = function() {
  return document.querySelector('#generate').disabled = false;
};

document.addEventListener('DOMContentLoaded', function() {
  for (let img of document.querySelectorAll('figure img[data-size]')) {
    // read in size on page load, so DOM modification does not effect code
    let size = Number(img.getAttribute('data-size'));
    img.addEventListener('drop', function(e) {
      return dropHandler(e, img, size);
    });
    img.addEventListener('dragleave', function(e) {
      return this.classList.remove('drop-active');
    });
    img.addEventListener('dragover', function(e) {
      e.dataTransfer.dropEffect = 'copy';
      this.classList.add('drop-active');
      return e.preventDefault();
    });
  }
  return document.querySelector('#generate').addEventListener('click', generateIco);
});
