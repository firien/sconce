(() => {
  // node_modules/esbuild-plugin-ghpages-pwa/src/pwa.js
  var pwa = () => {
    if ("serviceWorker" in navigator) {
      let scope = window.location.pathname;
      navigator.serviceWorker.register(`${scope}service.js`, { scope }).then((registration) => {
        const refreshPage = (worker) => {
          if (worker.state != "activated") {
            worker.postMessage({ action: "skipWaiting" });
          }
          window.location.reload();
        };
        if (registration.waiting) {
          refreshPage(registration.waiting);
        }
        registration.addEventListener("updatefound", () => {
          let newWorker = registration.installing;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed") {
              refreshPage(newWorker);
            }
          });
        });
      });
    }
  };
  pwa();

  // javascripts/png.js
  var png_default = (buffer) => {
    let dv = new DataView(buffer, 0, 64);
    if (dv.getUint32(0) === 2303741511 && dv.getUint32(4) === 218765834) {
      return {
        width: dv.getUint32(16),
        height: dv.getUint32(20),
        depth: dv.getUint8(24)
      };
    } else {
      throw "invalid PNG file";
    }
  };

  // javascripts/sconce.js
  var $images = [];
  var $icondirentryBytes = 16;
  var readFile = (file) => {
    return new Promise((resolve, rejected) => {
      let fileReader = new FileReader();
      fileReader.onloadend = resolve;
      fileReader.readAsArrayBuffer(file);
    });
  };
  var dropHandler = async function(e) {
    e.stopPropagation();
    e.preventDefault();
    for (let file of e.dataTransfer.files) {
      let { target } = await readFile(file);
      let buffer = target.result;
      let png = png_default(buffer);
      if (png.width === png.height) {
        if ($images.findIndex((i) => i[0].width == png.width) < 0) {
          let img = document.querySelector(`img[data-size='${png.width}']`);
          if (img) {
            img.src = URL.createObjectURL(file);
            let index = $images.push([png, buffer]);
            img.setAttribute("data-index", index - 1);
            enableGenerateButton();
            img.classList.remove("drop-active");
          }
        }
      } else {
        alert("Image does not match size");
      }
    }
  };
  var fileSaver = function(blob) {
    let url = URL.createObjectURL(blob);
    let anchor = document.createElement("a");
    anchor.setAttribute("download", "favicon.ico");
    anchor.href = url;
    return anchor.click();
  };
  var generateIco = function(e) {
    let indices = Array.from(document.querySelectorAll("figure img[data-index]")).map(function(img) {
      return Number(img.getAttribute("data-index"));
    });
    if (indices.length > 0) {
      const icondirBytes = 6;
      let size = icondirBytes + indices.length * $icondirentryBytes;
      let buffer = new ArrayBuffer(size);
      let dataView = new DataView(buffer);
      dataView.setUint16(0, 0);
      dataView.setUint16(2, 1, true);
      dataView.setUint16(4, indices.length, true);
      let offset = size;
      let buffers = [buffer];
      for (let i of indices) {
        let [png, imgBuffer] = $images[i];
        buffers.push(imgBuffer);
        offset = addImage(dataView, png, imgBuffer, size, i);
      }
      let icoFile = new Blob(buffers, {
        type: "image/x-icon"
      });
      return fileSaver(icoFile);
    }
  };
  var addImage = function(dataView, png, imgBuffer, offset, i) {
    let dirOffset = i * $icondirentryBytes;
    dataView.setUint8(6 + dirOffset, png.width);
    dataView.setUint8(7 + dirOffset, png.height);
    dataView.setUint8(8 + dirOffset, 0);
    dataView.setUint8(9 + dirOffset, 0);
    dataView.setUint16(10 + dirOffset, 1, true);
    dataView.setUint16(12 + dirOffset, png.depth * 4, true);
    dataView.setUint32(14 + dirOffset, imgBuffer.byteLength, true);
    dataView.setUint32(18 + dirOffset, offset, true);
    return offset + imgBuffer.byteLength;
  };
  var enableGenerateButton = function() {
    return document.querySelector("#generate").disabled = false;
  };
  document.addEventListener("DOMContentLoaded", function() {
    for (let img of document.querySelectorAll("figure img[data-size]")) {
      img.addEventListener("drop", dropHandler);
      img.addEventListener("dragleave", function(e) {
        this.classList.remove("drop-active");
      });
      img.addEventListener("dragover", function(e) {
        e.dataTransfer.dropEffect = "copy";
        this.classList.add("drop-active");
        e.preventDefault();
      });
    }
    window.addEventListener("drop", dropHandler);
    window.addEventListener("dragover", function(e) {
      e.dataTransfer.dropEffect = "copy";
      e.preventDefault();
    });
    document.querySelector("#generate").addEventListener("click", generateIco);
  });
})();
//# sourceMappingURL=sconce-PFMOB3JU.js.map
