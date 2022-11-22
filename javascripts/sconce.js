import pngDimensions from './png.js';
import pwa from 'esbuild-plugin-ghpages-pwa/src/pwa.js';

let $images = [];
let $icondirentryBytes = 16;

if (window.location.protocol === 'https:') {
  pwa('sconce');
}

const readFile = (file) => {
  return new Promise((resolve, rejected) => {
    let fileReader = new FileReader();
    fileReader.onloadend = resolve;
    fileReader.readAsArrayBuffer(file);
  })
}
const dropHandler = async function(e) {
  e.stopPropagation();
  e.preventDefault();
  for (let file of e.dataTransfer.files) {
    let { target } = await readFile(file)
    let buffer = target.result;
    let png = pngDimensions(buffer);
    if (png.width === png.height) {
      if ($images.findIndex(i => i[0].width == png.width) < 0) {
        //find element
        let img = document.querySelector(`img[data-size='${png.width}']`)
        if (img) {
          img.src = URL.createObjectURL(file);
          let index = $images.push([png, buffer]);
          img.setAttribute('data-index', index - 1);
          enableGenerateButton();
          img.classList.remove('drop-active'); //prevent odd returns in try block
        }
      }
    } else {
      alert('Image does not match size');
    }
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
    img.addEventListener('drop', dropHandler);
    img.addEventListener('dragleave', function(e) {
      this.classList.remove('drop-active');
    });
    img.addEventListener('dragover', function(e) {
      e.dataTransfer.dropEffect = 'copy';
      this.classList.add('drop-active');
      e.preventDefault();
    });
  }
  window.addEventListener('drop', dropHandler);
  window.addEventListener('dragover', function(e) {
    e.dataTransfer.dropEffect = 'copy';
    e.preventDefault();
  });
document.querySelector('#generate').addEventListener('click', generateIco);
});
