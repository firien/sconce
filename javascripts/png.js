export default (buffer) => {
  // grab 64 bytes
  let dv = new DataView(buffer, 0, 64);
  // verify PNG header
  // https://en.wikipedia.org/wiki/Portable_Network_Graphics#File_header
  if (dv.getUint32(0) === 0x89504E47 && dv.getUint32(4) === 0x0D0A1A0A) {
    // assume IHDR starts at offset 16
    return {
      width: dv.getUint32(16),
      height: dv.getUint32(20),
      depth: dv.getUint8(24)
    }
  } else {
    throw 'invalid PNG file'
  }
}

