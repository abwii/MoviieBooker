const bufferModule = require('buffer');
if (!bufferModule.SlowBuffer) {
  bufferModule.SlowBuffer = class SlowBuffer extends bufferModule.Buffer {};
}
if (bufferModule.SlowBuffer && !bufferModule.SlowBuffer.prototype) {
  bufferModule.SlowBuffer.prototype = {};
}
