/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@babel/runtime/helpers/interopRequireDefault.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/interopRequireDefault.js ***!
  \**********************************************************************/
/***/ ((module) => {

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/typeof.js":
/*!*******************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/typeof.js ***!
  \*******************************************************/
/***/ ((module) => {

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    module.exports = _typeof = function _typeof(obj) {
      return typeof obj;
    };

    module.exports["default"] = module.exports, module.exports.__esModule = true;
  } else {
    module.exports = _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    module.exports["default"] = module.exports, module.exports.__esModule = true;
  }

  return _typeof(obj);
}

module.exports = _typeof;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),

/***/ "./node_modules/@luma.gl/engine/dist/esm/lib/animation-loop.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@luma.gl/engine/dist/esm/lib/animation-loop.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ AnimationLoop)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/init.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/query.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/request-animation-frame.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/framebuffer.js");
/* harmony import */ var probe_gl_env__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! probe.gl/env */ "./node_modules/probe.gl/dist/es5/env/index.js");
/* provided dependency */ var Promise = __webpack_require__(/*! es6-promise */ "./node_modules/es6-promise/dist/es6-promise.js");



const isPage = (0,probe_gl_env__WEBPACK_IMPORTED_MODULE_1__.isBrowser)() && typeof document !== 'undefined';
let statIdCounter = 0;
class AnimationLoop {
  constructor(props = {}) {
    const {
      onCreateContext = opts => (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.createGLContext)(opts),
      onAddHTML = null,
      onInitialize = () => {},
      onRender = () => {},
      onFinalize = () => {},
      onError,
      gl = null,
      glOptions = {},
      debug = false,
      createFramebuffer = false,
      autoResizeViewport = true,
      autoResizeDrawingBuffer = true,
      stats = _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_2__.lumaStats.get(`animation-loop-${statIdCounter++}`)
    } = props;
    let {
      useDevicePixels = true
    } = props;

    if ('useDevicePixelRatio' in props) {
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.deprecated('useDevicePixelRatio', 'useDevicePixels')();
      useDevicePixels = props.useDevicePixelRatio;
    }

    this.props = {
      onCreateContext,
      onAddHTML,
      onInitialize,
      onRender,
      onFinalize,
      onError,
      gl,
      glOptions,
      debug,
      createFramebuffer
    };
    this.gl = gl;
    this.needsRedraw = null;
    this.timeline = null;
    this.stats = stats;
    this.cpuTime = this.stats.get('CPU Time');
    this.gpuTime = this.stats.get('GPU Time');
    this.frameRate = this.stats.get('Frame Rate');
    this._initialized = false;
    this._running = false;
    this._animationFrameId = null;
    this._nextFramePromise = null;
    this._resolveNextFrame = null;
    this._cpuStartTime = 0;
    this.setProps({
      autoResizeViewport,
      autoResizeDrawingBuffer,
      useDevicePixels
    });
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this._pageLoadPromise = null;
    this._onMousemove = this._onMousemove.bind(this);
    this._onMouseleave = this._onMouseleave.bind(this);
  }

  delete() {
    this.stop();

    this._setDisplay(null);
  }

  setNeedsRedraw(reason) {
    (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_3__.assert)(typeof reason === 'string');
    this.needsRedraw = this.needsRedraw || reason;
    return this;
  }

  setProps(props) {
    if ('autoResizeViewport' in props) {
      this.autoResizeViewport = props.autoResizeViewport;
    }

    if ('autoResizeDrawingBuffer' in props) {
      this.autoResizeDrawingBuffer = props.autoResizeDrawingBuffer;
    }

    if ('useDevicePixels' in props) {
      this.useDevicePixels = props.useDevicePixels;
    }

    return this;
  }

  start(opts = {}) {
    if (this._running) {
      return this;
    }

    this._running = true;

    const startPromise = this._getPageLoadPromise().then(() => {
      if (!this._running || this._initialized) {
        return null;
      }

      this._createWebGLContext(opts);

      this._createFramebuffer();

      this._startEventHandling();

      this._initializeCallbackData();

      this._updateCallbackData();

      this._resizeCanvasDrawingBuffer();

      this._resizeViewport();

      this._gpuTimeQuery = _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_4__["default"].isSupported(this.gl, ['timers']) ? new _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_4__["default"](this.gl) : null;
      this._initialized = true;
      return this.onInitialize(this.animationProps);
    }).then(appContext => {
      if (this._running) {
        this._addCallbackData(appContext || {});

        if (appContext !== false) {
          this._startLoop();
        }
      }
    });

    if (this.props.onError) {
      startPromise.catch(this.props.onError);
    }

    return this;
  }

  redraw() {
    if (this.isContextLost()) {
      return this;
    }

    this._beginTimers();

    this._setupFrame();

    this._updateCallbackData();

    this._renderFrame(this.animationProps);

    this._clearNeedsRedraw();

    if (this.offScreen && this.gl.commit) {
      this.gl.commit();
    }

    if (this._resolveNextFrame) {
      this._resolveNextFrame(this);

      this._nextFramePromise = null;
      this._resolveNextFrame = null;
    }

    this._endTimers();

    return this;
  }

  stop() {
    if (this._running) {
      this._finalizeCallbackData();

      this._cancelAnimationFrame(this._animationFrameId);

      this._nextFramePromise = null;
      this._resolveNextFrame = null;
      this._animationFrameId = null;
      this._running = false;
    }

    return this;
  }

  attachTimeline(timeline) {
    this.timeline = timeline;
    return this.timeline;
  }

  detachTimeline() {
    this.timeline = null;
  }

  waitForRender() {
    this.setNeedsRedraw('waitForRender');

    if (!this._nextFramePromise) {
      this._nextFramePromise = new Promise(resolve => {
        this._resolveNextFrame = resolve;
      });
    }

    return this._nextFramePromise;
  }

  async toDataURL() {
    this.setNeedsRedraw('toDataURL');
    await this.waitForRender();
    return this.gl.canvas.toDataURL();
  }

  isContextLost() {
    return this.gl.isContextLost();
  }

  onCreateContext(...args) {
    return this.props.onCreateContext(...args);
  }

  onInitialize(...args) {
    return this.props.onInitialize(...args);
  }

  onRender(...args) {
    return this.props.onRender(...args);
  }

  onFinalize(...args) {
    return this.props.onFinalize(...args);
  }

  getHTMLControlValue(id, defaultValue = 1) {
    const element = document.getElementById(id);
    return element ? Number(element.value) : defaultValue;
  }

  setViewParameters() {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.removed('AnimationLoop.setViewParameters', 'AnimationLoop.setProps')();
    return this;
  }

  _startLoop() {
    const renderFrame = () => {
      if (!this._running) {
        return;
      }

      this.redraw();
      this._animationFrameId = this._requestAnimationFrame(renderFrame);
    };

    this._cancelAnimationFrame(this._animationFrameId);

    this._animationFrameId = this._requestAnimationFrame(renderFrame);
  }

  _getPageLoadPromise() {
    if (!this._pageLoadPromise) {
      this._pageLoadPromise = isPage ? new Promise((resolve, reject) => {
        if (isPage && document.readyState === 'complete') {
          resolve(document);
          return;
        }

        window.addEventListener('load', () => {
          resolve(document);
        });
      }) : Promise.resolve({});
    }

    return this._pageLoadPromise;
  }

  _setDisplay(display) {
    if (this.display) {
      this.display.delete();
      this.display.animationLoop = null;
    }

    if (display) {
      display.animationLoop = this;
    }

    this.display = display;
  }

  _cancelAnimationFrame(animationFrameId) {
    if (this.display && this.display.cancelAnimationFrame) {
      return this.display.cancelAnimationFrame(animationFrameId);
    }

    return (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_5__.cancelAnimationFrame)(animationFrameId);
  }

  _requestAnimationFrame(renderFrameCallback) {
    if (this._running) {
      if (this.display && this.display.requestAnimationFrame) {
        return this.display.requestAnimationFrame(renderFrameCallback);
      }

      return (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_5__.requestAnimationFrame)(renderFrameCallback);
    }

    return undefined;
  }

  _renderFrame(...args) {
    if (this.display) {
      this.display._renderFrame(...args);

      return;
    }

    this.onRender(...args);
  }

  _clearNeedsRedraw() {
    this.needsRedraw = null;
  }

  _setupFrame() {
    this._resizeCanvasDrawingBuffer();

    this._resizeViewport();

    this._resizeFramebuffer();
  }

  _initializeCallbackData() {
    this.animationProps = {
      gl: this.gl,
      stop: this.stop,
      canvas: this.gl.canvas,
      framebuffer: this.framebuffer,
      useDevicePixels: this.useDevicePixels,
      needsRedraw: null,
      startTime: Date.now(),
      engineTime: 0,
      tick: 0,
      tock: 0,
      time: 0,
      _timeline: this.timeline,
      _loop: this,
      _animationLoop: this,
      _mousePosition: null
    };
  }

  _updateCallbackData() {
    const {
      width,
      height,
      aspect
    } = this._getSizeAndAspect();

    if (width !== this.animationProps.width || height !== this.animationProps.height) {
      this.setNeedsRedraw('drawing buffer resized');
    }

    if (aspect !== this.animationProps.aspect) {
      this.setNeedsRedraw('drawing buffer aspect changed');
    }

    this.animationProps.width = width;
    this.animationProps.height = height;
    this.animationProps.aspect = aspect;
    this.animationProps.needsRedraw = this.needsRedraw;
    this.animationProps.engineTime = Date.now() - this.animationProps.startTime;

    if (this.timeline) {
      this.timeline.update(this.animationProps.engineTime);
    }

    this.animationProps.tick = Math.floor(this.animationProps.time / 1000 * 60);
    this.animationProps.tock++;
    this.animationProps.time = this.timeline ? this.timeline.getTime() : this.animationProps.engineTime;
    this.animationProps._offScreen = this.offScreen;
  }

  _finalizeCallbackData() {
    this.onFinalize(this.animationProps);
  }

  _addCallbackData(appContext) {
    if (typeof appContext === 'object' && appContext !== null) {
      this.animationProps = Object.assign({}, this.animationProps, appContext);
    }
  }

  _createWebGLContext(opts) {
    this.offScreen = opts.canvas && typeof OffscreenCanvas !== 'undefined' && opts.canvas instanceof OffscreenCanvas;
    opts = Object.assign({}, opts, this.props.glOptions);
    this.gl = this.props.gl ? (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.instrumentGLContext)(this.props.gl, opts) : this.onCreateContext(opts);

    if (!(0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL)(this.gl)) {
      throw new Error('AnimationLoop.onCreateContext - illegal context returned');
    }

    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.resetParameters)(this.gl);

    this._createInfoDiv();
  }

  _createInfoDiv() {
    if (this.gl.canvas && this.props.onAddHTML) {
      const wrapperDiv = document.createElement('div');
      document.body.appendChild(wrapperDiv);
      wrapperDiv.style.position = 'relative';
      const div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.left = '10px';
      div.style.bottom = '10px';
      div.style.width = '300px';
      div.style.background = 'white';
      wrapperDiv.appendChild(this.gl.canvas);
      wrapperDiv.appendChild(div);
      const html = this.props.onAddHTML(div);

      if (html) {
        div.innerHTML = html;
      }
    }
  }

  _getSizeAndAspect() {
    const width = this.gl.drawingBufferWidth;
    const height = this.gl.drawingBufferHeight;
    let aspect = 1;
    const {
      canvas
    } = this.gl;

    if (canvas && canvas.clientHeight) {
      aspect = canvas.clientWidth / canvas.clientHeight;
    } else if (width > 0 && height > 0) {
      aspect = width / height;
    }

    return {
      width,
      height,
      aspect
    };
  }

  _resizeViewport() {
    if (this.autoResizeViewport) {
      this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
    }
  }

  _resizeCanvasDrawingBuffer() {
    if (this.autoResizeDrawingBuffer) {
      (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.resizeGLContext)(this.gl, {
        useDevicePixels: this.useDevicePixels
      });
    }
  }

  _createFramebuffer() {
    if (this.props.createFramebuffer) {
      this.framebuffer = new _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_6__["default"](this.gl);
    }
  }

  _resizeFramebuffer() {
    if (this.framebuffer) {
      this.framebuffer.resize({
        width: this.gl.drawingBufferWidth,
        height: this.gl.drawingBufferHeight
      });
    }
  }

  _beginTimers() {
    this.frameRate.timeEnd();
    this.frameRate.timeStart();

    if (this._gpuTimeQuery && this._gpuTimeQuery.isResultAvailable() && !this._gpuTimeQuery.isTimerDisjoint()) {
      this.stats.get('GPU Time').addTime(this._gpuTimeQuery.getTimerMilliseconds());
    }

    if (this._gpuTimeQuery) {
      this._gpuTimeQuery.beginTimeElapsedQuery();
    }

    this.cpuTime.timeStart();
  }

  _endTimers() {
    this.cpuTime.timeEnd();

    if (this._gpuTimeQuery) {
      this._gpuTimeQuery.end();
    }
  }

  _startEventHandling() {
    const {
      canvas
    } = this.gl;

    if (canvas) {
      canvas.addEventListener('mousemove', this._onMousemove);
      canvas.addEventListener('mouseleave', this._onMouseleave);
    }
  }

  _onMousemove(e) {
    this.animationProps._mousePosition = [e.offsetX, e.offsetY];
  }

  _onMouseleave(e) {
    this.animationProps._mousePosition = null;
  }

}
//# sourceMappingURL=animation-loop.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/engine/dist/esm/lib/model-utils.js":
/*!******************************************************************!*\
  !*** ./node_modules/@luma.gl/engine/dist/esm/lib/model-utils.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getBuffersFromGeometry": () => (/* binding */ getBuffersFromGeometry),
/* harmony export */   "inferAttributeAccessor": () => (/* binding */ inferAttributeAccessor)
/* harmony export */ });
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");

const GLTF_TO_LUMA_ATTRIBUTE_MAP = {
  POSITION: 'positions',
  NORMAL: 'normals',
  COLOR_0: 'colors',
  TEXCOORD_0: 'texCoords',
  TEXCOORD_1: 'texCoords1',
  TEXCOORD_2: 'texCoords2'
};
function getBuffersFromGeometry(gl, geometry, options) {
  const buffers = {};
  let indices = geometry.indices;

  for (const name in geometry.attributes) {
    const attribute = geometry.attributes[name];
    const remappedName = mapAttributeName(name, options);

    if (name === 'indices') {
      indices = attribute;
    } else if (attribute.constant) {
      buffers[remappedName] = attribute.value;
    } else {
      const typedArray = attribute.value;
      const accessor = { ...attribute
      };
      delete accessor.value;
      buffers[remappedName] = [new _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_0__["default"](gl, typedArray), accessor];
      inferAttributeAccessor(name, accessor);
    }
  }

  if (indices) {
    const data = indices.value || indices;
    (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__.assert)(data instanceof Uint16Array || data instanceof Uint32Array, 'attribute array for "indices" must be of integer type');
    const accessor = {
      size: 1,
      isIndexed: indices.isIndexed === undefined ? true : indices.isIndexed
    };
    buffers.indices = [new _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_0__["default"](gl, {
      data,
      target: 34963
    }), accessor];
  }

  return buffers;
}

function mapAttributeName(name, options) {
  const {
    attributeMap = GLTF_TO_LUMA_ATTRIBUTE_MAP
  } = options || {};
  return attributeMap && attributeMap[name] || name;
}

function inferAttributeAccessor(attributeName, attribute) {
  let category;

  switch (attributeName) {
    case 'texCoords':
    case 'texCoord1':
    case 'texCoord2':
    case 'texCoord3':
      category = 'uvs';
      break;

    case 'vertices':
    case 'positions':
    case 'normals':
    case 'pickingColors':
      category = 'vectors';
      break;

    default:
  }

  switch (category) {
    case 'vectors':
      attribute.size = attribute.size || 3;
      break;

    case 'uvs':
      attribute.size = attribute.size || 2;
      break;

    default:
  }

  (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__.assert)(Number.isFinite(attribute.size), `attribute ${attributeName} needs size`);
}
//# sourceMappingURL=model-utils.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/engine/dist/esm/lib/model.js":
/*!************************************************************!*\
  !*** ./node_modules/@luma.gl/engine/dist/esm/lib/model.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Model)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _program_manager__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./program-manager */ "./node_modules/@luma.gl/engine/dist/esm/lib/program-manager.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/utils/utils.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/clear.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/program.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/vertex-array.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/transform-feedback.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/debug/debug-vertex-array.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/debug/debug-uniforms.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/debug/debug-program-configuration.js");
/* harmony import */ var _model_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./model-utils */ "./node_modules/@luma.gl/engine/dist/esm/lib/model-utils.js");





const LOG_DRAW_PRIORITY = 2;
const LOG_DRAW_TIMEOUT = 10000;
const ERR_MODEL_PARAMS = 'Model needs drawMode and vertexCount';

const NOOP = () => {};

const DRAW_PARAMS = {};
class Model {
  constructor(gl, props = {}) {
    const {
      id = (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__.uid)('model')
    } = props;
    (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_2__.assert)((0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL)(gl));
    this.id = id;
    this.gl = gl;
    this.id = props.id || (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__.uid)('Model');
    this.lastLogTime = 0;
    this.animated = false;
    this.initialize(props);
  }

  initialize(props) {
    this.props = {};
    this.programManager = props.programManager || _program_manager__WEBPACK_IMPORTED_MODULE_3__["default"].getDefaultProgramManager(this.gl);
    this._programManagerState = -1;
    this._managedProgram = false;
    const {
      program = null,
      vs,
      fs,
      modules,
      defines,
      inject,
      varyings,
      bufferMode,
      transpileToGLSL100
    } = props;
    this.programProps = {
      program,
      vs,
      fs,
      modules,
      defines,
      inject,
      varyings,
      bufferMode,
      transpileToGLSL100
    };
    this.program = null;
    this.vertexArray = null;
    this._programDirty = true;
    this.userData = {};
    this.needsRedraw = true;
    this._attributes = {};
    this.attributes = {};
    this.uniforms = {};
    this.pickable = true;

    this._checkProgram();

    this.setUniforms(Object.assign({}, this.getModuleUniforms(props.moduleSettings)));
    this.drawMode = props.drawMode !== undefined ? props.drawMode : 4;
    this.vertexCount = props.vertexCount || 0;
    this.geometryBuffers = {};
    this.isInstanced = props.isInstanced || props.instanced || props.instanceCount > 0;

    this._setModelProps(props);

    this.geometry = {};
    (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_2__.assert)(this.drawMode !== undefined && Number.isFinite(this.vertexCount), ERR_MODEL_PARAMS);
  }

  setProps(props) {
    this._setModelProps(props);
  }

  delete() {
    for (const key in this._attributes) {
      if (this._attributes[key] !== this.attributes[key]) {
        this._attributes[key].delete();
      }
    }

    if (this._managedProgram) {
      this.programManager.release(this.program);
      this._managedProgram = false;
    }

    this.vertexArray.delete();

    this._deleteGeometryBuffers();
  }

  getDrawMode() {
    return this.drawMode;
  }

  getVertexCount() {
    return this.vertexCount;
  }

  getInstanceCount() {
    return this.instanceCount;
  }

  getAttributes() {
    return this.attributes;
  }

  getProgram() {
    return this.program;
  }

  setProgram(props) {
    const {
      program,
      vs,
      fs,
      modules,
      defines,
      inject,
      varyings,
      bufferMode,
      transpileToGLSL100
    } = props;
    this.programProps = {
      program,
      vs,
      fs,
      modules,
      defines,
      inject,
      varyings,
      bufferMode,
      transpileToGLSL100
    };
    this._programDirty = true;
  }

  getUniforms() {
    return this.uniforms;
  }

  setDrawMode(drawMode) {
    this.drawMode = drawMode;
    return this;
  }

  setVertexCount(vertexCount) {
    (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_2__.assert)(Number.isFinite(vertexCount));
    this.vertexCount = vertexCount;
    return this;
  }

  setInstanceCount(instanceCount) {
    (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_2__.assert)(Number.isFinite(instanceCount));
    this.instanceCount = instanceCount;
    return this;
  }

  setGeometry(geometry) {
    this.drawMode = geometry.drawMode;
    this.vertexCount = geometry.getVertexCount();

    this._deleteGeometryBuffers();

    this.geometryBuffers = (0,_model_utils__WEBPACK_IMPORTED_MODULE_4__.getBuffersFromGeometry)(this.gl, geometry);
    this.vertexArray.setAttributes(this.geometryBuffers);
    return this;
  }

  setAttributes(attributes = {}) {
    if ((0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__.isObjectEmpty)(attributes)) {
      return this;
    }

    const normalizedAttributes = {};

    for (const name in attributes) {
      const attribute = attributes[name];
      normalizedAttributes[name] = attribute.getValue ? attribute.getValue() : attribute;
    }

    this.vertexArray.setAttributes(normalizedAttributes);
    return this;
  }

  setUniforms(uniforms = {}) {
    Object.assign(this.uniforms, uniforms);
    return this;
  }

  getModuleUniforms(opts) {
    this._checkProgram();

    const getUniforms = this.programManager.getUniforms(this.program);

    if (getUniforms) {
      return getUniforms(opts);
    }

    return {};
  }

  updateModuleSettings(opts) {
    const uniforms = this.getModuleUniforms(opts || {});
    return this.setUniforms(uniforms);
  }

  clear(opts) {
    (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_5__.clear)(this.program.gl, opts);
    return this;
  }

  draw(opts = {}) {
    this._checkProgram();

    const {
      moduleSettings = null,
      framebuffer,
      uniforms = {},
      attributes = {},
      transformFeedback = this.transformFeedback,
      parameters = {},
      vertexArray = this.vertexArray
    } = opts;
    this.setAttributes(attributes);
    this.updateModuleSettings(moduleSettings);
    this.setUniforms(uniforms);
    let logPriority;

    if (_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.priority >= LOG_DRAW_PRIORITY) {
      logPriority = this._logDrawCallStart(LOG_DRAW_PRIORITY);
    }

    const drawParams = this.vertexArray.getDrawParams();
    const {
      isIndexed = drawParams.isIndexed,
      indexType = drawParams.indexType,
      indexOffset = drawParams.indexOffset,
      vertexArrayInstanced = drawParams.isInstanced
    } = this.props;

    if (vertexArrayInstanced && !this.isInstanced) {
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.warn('Found instanced attributes on non-instanced model', this.id)();
    }

    const {
      isInstanced,
      instanceCount
    } = this;
    const {
      onBeforeRender = NOOP,
      onAfterRender = NOOP
    } = this.props;
    onBeforeRender();
    this.program.setUniforms(this.uniforms);
    const didDraw = this.program.draw(Object.assign(DRAW_PARAMS, opts, {
      logPriority,
      uniforms: null,
      framebuffer,
      parameters,
      drawMode: this.getDrawMode(),
      vertexCount: this.getVertexCount(),
      vertexArray,
      transformFeedback,
      isIndexed,
      indexType,
      isInstanced,
      instanceCount,
      offset: isIndexed ? indexOffset : 0
    }));
    onAfterRender();

    if (_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.priority >= LOG_DRAW_PRIORITY) {
      this._logDrawCallEnd(logPriority, vertexArray, framebuffer);
    }

    return didDraw;
  }

  transform(opts = {}) {
    const {
      discard = true,
      feedbackBuffers,
      unbindModels = []
    } = opts;
    let {
      parameters
    } = opts;

    if (feedbackBuffers) {
      this._setFeedbackBuffers(feedbackBuffers);
    }

    if (discard) {
      parameters = Object.assign({}, parameters, {
        [35977]: discard
      });
    }

    unbindModels.forEach(model => model.vertexArray.unbindBuffers());

    try {
      this.draw(Object.assign({}, opts, {
        parameters
      }));
    } finally {
      unbindModels.forEach(model => model.vertexArray.bindBuffers());
    }

    return this;
  }

  render(uniforms = {}) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.warn('Model.render() is deprecated. Use Model.setUniforms() and Model.draw()')();
    return this.setUniforms(uniforms).draw();
  }

  _setModelProps(props) {
    Object.assign(this.props, props);

    if ('uniforms' in props) {
      this.setUniforms(props.uniforms);
    }

    if ('pickable' in props) {
      this.pickable = props.pickable;
    }

    if ('instanceCount' in props) {
      this.instanceCount = props.instanceCount;
    }

    if ('geometry' in props) {
      this.setGeometry(props.geometry);
    }

    if ('attributes' in props) {
      this.setAttributes(props.attributes);
    }

    if ('_feedbackBuffers' in props) {
      this._setFeedbackBuffers(props._feedbackBuffers);
    }
  }

  _checkProgram() {
    const needsUpdate = this._programDirty || this.programManager.stateHash !== this._programManagerState;

    if (!needsUpdate) {
      return;
    }

    let {
      program
    } = this.programProps;

    if (program) {
      this._managedProgram = false;
    } else {
      const {
        vs,
        fs,
        modules,
        inject,
        defines,
        varyings,
        bufferMode,
        transpileToGLSL100
      } = this.programProps;
      program = this.programManager.get({
        vs,
        fs,
        modules,
        inject,
        defines,
        varyings,
        bufferMode,
        transpileToGLSL100
      });

      if (this.program && this._managedProgram) {
        this.programManager.release(this.program);
      }

      this._programManagerState = this.programManager.stateHash;
      this._managedProgram = true;
    }

    (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_2__.assert)(program instanceof _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_6__["default"], 'Model needs a program');
    this._programDirty = false;

    if (program === this.program) {
      return;
    }

    this.program = program;

    if (this.vertexArray) {
      this.vertexArray.setProps({
        program: this.program,
        attributes: this.vertexArray.attributes
      });
    } else {
      this.vertexArray = new _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_7__["default"](this.gl, {
        program: this.program
      });
    }

    this.setUniforms(Object.assign({}, this.getModuleUniforms()));
  }

  _deleteGeometryBuffers() {
    for (const name in this.geometryBuffers) {
      const buffer = this.geometryBuffers[name][0] || this.geometryBuffers[name];

      if (buffer instanceof _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_8__["default"]) {
        buffer.delete();
      }
    }
  }

  _setAnimationProps(animationProps) {
    if (this.animated) {
      (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_2__.assert)(animationProps, 'Model.draw(): animated uniforms but no animationProps');
    }
  }

  _setFeedbackBuffers(feedbackBuffers = {}) {
    if ((0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__.isObjectEmpty)(feedbackBuffers)) {
      return this;
    }

    const {
      gl
    } = this.program;
    this.transformFeedback = this.transformFeedback || new _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_9__["default"](gl, {
      program: this.program
    });
    this.transformFeedback.setBuffers(feedbackBuffers);
    return this;
  }

  _logDrawCallStart(logLevel) {
    const logDrawTimeout = logLevel > 3 ? 0 : LOG_DRAW_TIMEOUT;

    if (Date.now() - this.lastLogTime < logDrawTimeout) {
      return undefined;
    }

    this.lastLogTime = Date.now();
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.group(LOG_DRAW_PRIORITY, `>>> DRAWING MODEL ${this.id}`, {
      collapsed: _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.level <= 2
    })();
    return logLevel;
  }

  _logDrawCallEnd(logLevel, vertexArray, uniforms, framebuffer) {
    if (logLevel === undefined) {
      return;
    }

    const attributeTable = (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_10__.getDebugTableForVertexArray)({
      vertexArray,
      header: `${this.id} attributes`,
      attributes: this._attributes
    });
    const {
      table: uniformTable,
      unusedTable,
      unusedCount
    } = (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_11__.getDebugTableForUniforms)({
      header: `${this.id} uniforms`,
      program: this.program,
      uniforms: Object.assign({}, this.program.uniforms, uniforms)
    });
    const {
      table: missingTable,
      count: missingCount
    } = (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_11__.getDebugTableForUniforms)({
      header: `${this.id} uniforms`,
      program: this.program,
      uniforms: Object.assign({}, this.program.uniforms, uniforms),
      undefinedOnly: true
    });

    if (missingCount > 0) {
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.log('MISSING UNIFORMS', Object.keys(missingTable))();
    }

    if (unusedCount > 0) {
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.log('UNUSED UNIFORMS', Object.keys(unusedTable))();
    }

    const configTable = (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_12__.getDebugTableForProgramConfiguration)(this.vertexArray.configuration);
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.table(logLevel, attributeTable)();
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.table(logLevel, uniformTable)();
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.table(logLevel + 1, configTable)();

    if (framebuffer) {
      framebuffer.log({
        logLevel: LOG_DRAW_PRIORITY,
        message: `Rendered to ${framebuffer.id}`
      });
    }

    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.groupEnd(LOG_DRAW_PRIORITY, `>>> DRAWING MODEL ${this.id}`)();
  }

}
//# sourceMappingURL=model.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/engine/dist/esm/lib/program-manager.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@luma.gl/engine/dist/esm/lib/program-manager.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ProgramManager)
/* harmony export */ });
/* harmony import */ var _luma_gl_shadertools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/shadertools */ "./node_modules/@luma.gl/shadertools/dist/esm/lib/assemble-shaders.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/program.js");


class ProgramManager {
  static getDefaultProgramManager(gl) {
    gl.luma = gl.luma || {};
    gl.luma.defaultProgramManager = gl.luma.defaultProgramManager || new ProgramManager(gl);
    return gl.luma.defaultProgramManager;
  }

  constructor(gl) {
    this.gl = gl;
    this._programCache = {};
    this._getUniforms = {};
    this._registeredModules = {};
    this._hookFunctions = [];
    this._defaultModules = [];
    this._hashes = {};
    this._hashCounter = 0;
    this.stateHash = 0;
    this._useCounts = {};
  }

  addDefaultModule(module) {
    if (!this._defaultModules.find(m => m.name === module.name)) {
      this._defaultModules.push(module);
    }

    this.stateHash++;
  }

  removeDefaultModule(module) {
    const moduleName = typeof module === 'string' ? module : module.name;
    this._defaultModules = this._defaultModules.filter(m => m.name !== moduleName);
    this.stateHash++;
  }

  addShaderHook(hook, opts) {
    if (opts) {
      hook = Object.assign(opts, {
        hook
      });
    }

    this._hookFunctions.push(hook);

    this.stateHash++;
  }

  get(props = {}) {
    const {
      vs = '',
      fs = '',
      defines = {},
      inject = {},
      varyings = [],
      bufferMode = 0x8c8d,
      transpileToGLSL100 = false
    } = props;

    const modules = this._getModuleList(props.modules);

    const vsHash = this._getHash(vs);

    const fsHash = this._getHash(fs);

    const moduleHashes = modules.map(m => this._getHash(m.name)).sort();
    const varyingHashes = varyings.map(v => this._getHash(v));
    const defineKeys = Object.keys(defines).sort();
    const injectKeys = Object.keys(inject).sort();
    const defineHashes = [];
    const injectHashes = [];

    for (const key of defineKeys) {
      defineHashes.push(this._getHash(key));
      defineHashes.push(this._getHash(defines[key]));
    }

    for (const key of injectKeys) {
      injectHashes.push(this._getHash(key));
      injectHashes.push(this._getHash(inject[key]));
    }

    const hash = `${vsHash}/${fsHash}D${defineHashes.join('/')}M${moduleHashes.join('/')}I${injectHashes.join('/')}V${varyingHashes.join('/')}H${this.stateHash}B${bufferMode}${transpileToGLSL100 ? 'T' : ''}`;

    if (!this._programCache[hash]) {
      const assembled = (0,_luma_gl_shadertools__WEBPACK_IMPORTED_MODULE_0__.assembleShaders)(this.gl, {
        vs,
        fs,
        modules,
        inject,
        defines,
        hookFunctions: this._hookFunctions,
        transpileToGLSL100
      });
      this._programCache[hash] = new _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__["default"](this.gl, {
        hash,
        vs: assembled.vs,
        fs: assembled.fs,
        varyings,
        bufferMode
      });

      this._getUniforms[hash] = assembled.getUniforms || (x => {});

      this._useCounts[hash] = 0;
    }

    this._useCounts[hash]++;
    return this._programCache[hash];
  }

  getUniforms(program) {
    return this._getUniforms[program.hash] || null;
  }

  release(program) {
    const hash = program.hash;
    this._useCounts[hash]--;

    if (this._useCounts[hash] === 0) {
      this._programCache[hash].delete();

      delete this._programCache[hash];
      delete this._getUniforms[hash];
      delete this._useCounts[hash];
    }
  }

  _getHash(key) {
    if (this._hashes[key] === undefined) {
      this._hashes[key] = this._hashCounter++;
    }

    return this._hashes[key];
  }

  _getModuleList(appModules = []) {
    const modules = new Array(this._defaultModules.length + appModules.length);
    const seen = {};
    let count = 0;

    for (let i = 0, len = this._defaultModules.length; i < len; ++i) {
      const module = this._defaultModules[i];
      const name = module.name;
      modules[count++] = module;
      seen[name] = true;
    }

    for (let i = 0, len = appModules.length; i < len; ++i) {
      const module = appModules[i];
      const name = module.name;

      if (!seen[name]) {
        modules[count++] = module;
        seen[name] = true;
      }
    }

    modules.length = count;
    return modules;
  }

}
//# sourceMappingURL=program-manager.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/context/context.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/context/context.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createGLContext": () => (/* binding */ createGLContext),
/* harmony export */   "instrumentGLContext": () => (/* binding */ instrumentGLContext),
/* harmony export */   "getContextDebugInfo": () => (/* binding */ getContextDebugInfo),
/* harmony export */   "resizeGLContext": () => (/* binding */ resizeGLContext)
/* harmony export */ });
/* harmony import */ var probe_gl_env__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! probe.gl/env */ "./node_modules/probe.gl/dist/es5/env/index.js");
/* harmony import */ var _state_tracker_track_context_state__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../state-tracker/track-context-state */ "./node_modules/@luma.gl/gltools/dist/esm/state-tracker/track-context-state.js");
/* harmony import */ var _utils_log__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/log */ "./node_modules/@luma.gl/gltools/dist/esm/utils/log.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/gltools/dist/esm/utils/assert.js");
/* harmony import */ var _utils_device_pixels__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/device-pixels */ "./node_modules/@luma.gl/gltools/dist/esm/utils/device-pixels.js");
/* harmony import */ var _utils_webgl_checks__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/webgl-checks */ "./node_modules/@luma.gl/gltools/dist/esm/utils/webgl-checks.js");






const isBrowser = (0,probe_gl_env__WEBPACK_IMPORTED_MODULE_5__.isBrowser)();
const isPage = isBrowser && typeof document !== 'undefined';
const CONTEXT_DEFAULTS = {
  webgl2: true,
  webgl1: true,
  throwOnError: true,
  manageState: true,
  canvas: null,
  debug: false,
  width: 800,
  height: 600
};
function createGLContext(options = {}) {
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(isBrowser, "createGLContext only available in the browser.\nCreate your own headless context or use 'createHeadlessContext' from @luma.gl/test-utils");
  options = Object.assign({}, CONTEXT_DEFAULTS, options);
  const {
    width,
    height
  } = options;

  function onError(message) {
    if (options.throwOnError) {
      throw new Error(message);
    }

    console.error(message);
    return null;
  }

  options.onError = onError;
  let gl;
  const {
    canvas
  } = options;
  const targetCanvas = getCanvas({
    canvas,
    width,
    height,
    onError
  });
  gl = createBrowserContext(targetCanvas, options);

  if (!gl) {
    return null;
  }

  gl = instrumentGLContext(gl, options);
  logInfo(gl);
  return gl;
}
function instrumentGLContext(gl, options = {}) {
  if (!gl || gl._instrumented) {
    return gl;
  }

  gl._version = gl._version || getVersion(gl);
  gl.luma = gl.luma || {};
  gl.luma.canvasSizeInfo = gl.luma.canvasSizeInfo || {};
  options = Object.assign({}, CONTEXT_DEFAULTS, options);
  const {
    manageState,
    debug
  } = options;

  if (manageState) {
    (0,_state_tracker_track_context_state__WEBPACK_IMPORTED_MODULE_0__.trackContextState)(gl, {
      copyState: false,
      log: (...args) => _utils_log__WEBPACK_IMPORTED_MODULE_1__.log.log(1, ...args)()
    });
  }

  if (isBrowser && debug) {
    if (!probe_gl_env__WEBPACK_IMPORTED_MODULE_5__.global.makeDebugContext) {
      _utils_log__WEBPACK_IMPORTED_MODULE_1__.log.warn('WebGL debug mode not activated. import "@luma.gl/debug" to enable.')();
    } else {
      gl = probe_gl_env__WEBPACK_IMPORTED_MODULE_5__.global.makeDebugContext(gl, options);
      _utils_log__WEBPACK_IMPORTED_MODULE_1__.log.level = Math.max(_utils_log__WEBPACK_IMPORTED_MODULE_1__.log.level, 1);
    }
  }

  gl._instrumented = true;
  return gl;
}
function getContextDebugInfo(gl) {
  const vendorMasked = gl.getParameter(7936);
  const rendererMasked = gl.getParameter(7937);
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const vendorUnmasked = ext && gl.getParameter(ext.UNMASKED_VENDOR_WEBGL || 7936);
  const rendererUnmasked = ext && gl.getParameter(ext.UNMASKED_RENDERER_WEBGL || 7937);
  return {
    vendor: vendorUnmasked || vendorMasked,
    renderer: rendererUnmasked || rendererMasked,
    vendorMasked,
    rendererMasked,
    version: gl.getParameter(7938),
    shadingLanguageVersion: gl.getParameter(35724)
  };
}
function resizeGLContext(gl, options = {}) {
  if (gl.canvas) {
    const devicePixelRatio = (0,_utils_device_pixels__WEBPACK_IMPORTED_MODULE_3__.getDevicePixelRatio)(options.useDevicePixels);
    setDevicePixelRatio(gl, devicePixelRatio, options);
    return;
  }

  const ext = gl.getExtension('STACKGL_resize_drawingbuffer');

  if (ext && `width` in options && `height` in options) {
    ext.resize(options.width, options.height);
  }
}

function createBrowserContext(canvas, options) {
  const {
    onError
  } = options;
  let errorMessage = null;

  const onCreateError = error => errorMessage = error.statusMessage || errorMessage;

  canvas.addEventListener('webglcontextcreationerror', onCreateError, false);
  const {
    webgl1 = true,
    webgl2 = true
  } = options;
  let gl = null;

  if (webgl2) {
    gl = gl || canvas.getContext('webgl2', options);
    gl = gl || canvas.getContext('experimental-webgl2', options);
  }

  if (webgl1) {
    gl = gl || canvas.getContext('webgl', options);
    gl = gl || canvas.getContext('experimental-webgl', options);
  }

  canvas.removeEventListener('webglcontextcreationerror', onCreateError, false);

  if (!gl) {
    return onError(`Failed to create ${webgl2 && !webgl1 ? 'WebGL2' : 'WebGL'} context: ${errorMessage || 'Unknown error'}`);
  }

  if (options.onContextLost) {
    canvas.addEventListener('webglcontextlost', options.onContextLost, false);
  }

  if (options.onContextRestored) {
    canvas.addEventListener('webglcontextrestored', options.onContextRestored, false);
  }

  return gl;
}

function getCanvas({
  canvas,
  width = 800,
  height = 600,
  onError
}) {
  let targetCanvas;

  if (typeof canvas === 'string') {
    const isPageLoaded = isPage && document.readyState === 'complete';

    if (!isPageLoaded) {
      onError(`createGLContext called on canvas '${canvas}' before page was loaded`);
    }

    targetCanvas = document.getElementById(canvas);
  } else if (canvas) {
    targetCanvas = canvas;
  } else {
    targetCanvas = document.createElement('canvas');
    targetCanvas.id = 'lumagl-canvas';
    targetCanvas.style.width = Number.isFinite(width) ? `${width}px` : '100%';
    targetCanvas.style.height = Number.isFinite(height) ? `${height}px` : '100%';
    document.body.insertBefore(targetCanvas, document.body.firstChild);
  }

  return targetCanvas;
}

function logInfo(gl) {
  const webGL = (0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_4__.isWebGL2)(gl) ? 'WebGL2' : 'WebGL1';
  const info = getContextDebugInfo(gl);
  const driver = info ? `(${info.vendor},${info.renderer})` : '';
  const debug = gl.debug ? ' debug' : '';
  _utils_log__WEBPACK_IMPORTED_MODULE_1__.log.info(1, `${webGL}${debug} context ${driver}`)();
}

function getVersion(gl) {
  if (typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext) {
    return 2;
  }

  return 1;
}

function setDevicePixelRatio(gl, devicePixelRatio, options) {
  let clientWidth = 'width' in options ? options.width : gl.canvas.clientWidth;
  let clientHeight = 'height' in options ? options.height : gl.canvas.clientHeight;

  if (!clientWidth || !clientHeight) {
    _utils_log__WEBPACK_IMPORTED_MODULE_1__.log.log(1, 'Canvas clientWidth/clientHeight is 0')();
    devicePixelRatio = 1;
    clientWidth = gl.canvas.width || 1;
    clientHeight = gl.canvas.height || 1;
  }

  gl.luma = gl.luma || {};
  gl.luma.canvasSizeInfo = gl.luma.canvasSizeInfo || {};
  const cachedSize = gl.luma.canvasSizeInfo;

  if (cachedSize.clientWidth !== clientWidth || cachedSize.clientHeight !== clientHeight || cachedSize.devicePixelRatio !== devicePixelRatio) {
    let clampedPixelRatio = devicePixelRatio;
    const canvasWidth = Math.floor(clientWidth * clampedPixelRatio);
    const canvasHeight = Math.floor(clientHeight * clampedPixelRatio);
    gl.canvas.width = canvasWidth;
    gl.canvas.height = canvasHeight;

    if (gl.drawingBufferWidth !== canvasWidth || gl.drawingBufferHeight !== canvasHeight) {
      _utils_log__WEBPACK_IMPORTED_MODULE_1__.log.warn(`Device pixel ratio clamped`)();
      clampedPixelRatio = Math.min(gl.drawingBufferWidth / clientWidth, gl.drawingBufferHeight / clientHeight);
      gl.canvas.width = Math.floor(clientWidth * clampedPixelRatio);
      gl.canvas.height = Math.floor(clientHeight * clampedPixelRatio);
    }

    Object.assign(gl.luma.canvasSizeInfo, {
      clientWidth,
      clientHeight,
      devicePixelRatio
    });
  }
}
//# sourceMappingURL=context.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/index.js":
/*!*********************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/index.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "log": () => (/* reexport safe */ _utils_log__WEBPACK_IMPORTED_MODULE_0__.log),
/* harmony export */   "isWebGL": () => (/* reexport safe */ _utils_webgl_checks__WEBPACK_IMPORTED_MODULE_1__.isWebGL),
/* harmony export */   "isWebGL2": () => (/* reexport safe */ _utils_webgl_checks__WEBPACK_IMPORTED_MODULE_1__.isWebGL2),
/* harmony export */   "getWebGL2Context": () => (/* reexport safe */ _utils_webgl_checks__WEBPACK_IMPORTED_MODULE_1__.getWebGL2Context),
/* harmony export */   "assertWebGLContext": () => (/* reexport safe */ _utils_webgl_checks__WEBPACK_IMPORTED_MODULE_1__.assertWebGLContext),
/* harmony export */   "assertWebGL2Context": () => (/* reexport safe */ _utils_webgl_checks__WEBPACK_IMPORTED_MODULE_1__.assertWebGL2Context),
/* harmony export */   "polyfillContext": () => (/* reexport safe */ _polyfill_polyfill_context__WEBPACK_IMPORTED_MODULE_2__.polyfillContext),
/* harmony export */   "getParameters": () => (/* reexport safe */ _state_tracker_unified_parameter_api__WEBPACK_IMPORTED_MODULE_3__.getParameters),
/* harmony export */   "setParameters": () => (/* reexport safe */ _state_tracker_unified_parameter_api__WEBPACK_IMPORTED_MODULE_3__.setParameters),
/* harmony export */   "resetParameters": () => (/* reexport safe */ _state_tracker_unified_parameter_api__WEBPACK_IMPORTED_MODULE_3__.resetParameters),
/* harmony export */   "withParameters": () => (/* reexport safe */ _state_tracker_unified_parameter_api__WEBPACK_IMPORTED_MODULE_3__.withParameters),
/* harmony export */   "trackContextState": () => (/* reexport safe */ _state_tracker_track_context_state__WEBPACK_IMPORTED_MODULE_4__.trackContextState),
/* harmony export */   "pushContextState": () => (/* reexport safe */ _state_tracker_track_context_state__WEBPACK_IMPORTED_MODULE_4__.pushContextState),
/* harmony export */   "popContextState": () => (/* reexport safe */ _state_tracker_track_context_state__WEBPACK_IMPORTED_MODULE_4__.popContextState),
/* harmony export */   "createGLContext": () => (/* reexport safe */ _context_context__WEBPACK_IMPORTED_MODULE_5__.createGLContext),
/* harmony export */   "resizeGLContext": () => (/* reexport safe */ _context_context__WEBPACK_IMPORTED_MODULE_5__.resizeGLContext),
/* harmony export */   "instrumentGLContext": () => (/* reexport safe */ _context_context__WEBPACK_IMPORTED_MODULE_5__.instrumentGLContext),
/* harmony export */   "getContextDebugInfo": () => (/* reexport safe */ _context_context__WEBPACK_IMPORTED_MODULE_5__.getContextDebugInfo),
/* harmony export */   "cssToDeviceRatio": () => (/* reexport safe */ _utils_device_pixels__WEBPACK_IMPORTED_MODULE_6__.cssToDeviceRatio),
/* harmony export */   "cssToDevicePixels": () => (/* reexport safe */ _utils_device_pixels__WEBPACK_IMPORTED_MODULE_6__.cssToDevicePixels)
/* harmony export */ });
/* harmony import */ var _utils_log__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils/log */ "./node_modules/@luma.gl/gltools/dist/esm/utils/log.js");
/* harmony import */ var _utils_webgl_checks__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils/webgl-checks */ "./node_modules/@luma.gl/gltools/dist/esm/utils/webgl-checks.js");
/* harmony import */ var _polyfill_polyfill_context__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./polyfill/polyfill-context */ "./node_modules/@luma.gl/gltools/dist/esm/polyfill/polyfill-context.js");
/* harmony import */ var _state_tracker_unified_parameter_api__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./state-tracker/unified-parameter-api */ "./node_modules/@luma.gl/gltools/dist/esm/state-tracker/unified-parameter-api.js");
/* harmony import */ var _state_tracker_track_context_state__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./state-tracker/track-context-state */ "./node_modules/@luma.gl/gltools/dist/esm/state-tracker/track-context-state.js");
/* harmony import */ var _context_context__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./context/context */ "./node_modules/@luma.gl/gltools/dist/esm/context/context.js");
/* harmony import */ var _utils_device_pixels__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./utils/device-pixels */ "./node_modules/@luma.gl/gltools/dist/esm/utils/device-pixels.js");







//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/polyfill/get-parameter-polyfill.js":
/*!***********************************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/polyfill/get-parameter-polyfill.js ***!
  \***********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getParameterPolyfill": () => (/* binding */ getParameterPolyfill)
/* harmony export */ });
/* harmony import */ var _utils_webgl_checks__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/webgl-checks */ "./node_modules/@luma.gl/gltools/dist/esm/utils/webgl-checks.js");

const OES_element_index = 'OES_element_index';
const WEBGL_draw_buffers = 'WEBGL_draw_buffers';
const EXT_disjoint_timer_query = 'EXT_disjoint_timer_query';
const EXT_disjoint_timer_query_webgl2 = 'EXT_disjoint_timer_query_webgl2';
const EXT_texture_filter_anisotropic = 'EXT_texture_filter_anisotropic';
const WEBGL_debug_renderer_info = 'WEBGL_debug_renderer_info';
const GL_FRAGMENT_SHADER_DERIVATIVE_HINT = 0x8b8b;
const GL_DONT_CARE = 0x1100;
const GL_GPU_DISJOINT_EXT = 0x8fbb;
const GL_MAX_TEXTURE_MAX_ANISOTROPY_EXT = 0x84ff;
const GL_UNMASKED_VENDOR_WEBGL = 0x9245;
const GL_UNMASKED_RENDERER_WEBGL = 0x9246;

const getWebGL2ValueOrZero = gl => !(0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl) ? 0 : undefined;

const WEBGL_PARAMETERS = {
  [3074]: gl => !(0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl) ? 36064 : undefined,
  [GL_FRAGMENT_SHADER_DERIVATIVE_HINT]: gl => !(0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl) ? GL_DONT_CARE : undefined,
  [35977]: getWebGL2ValueOrZero,
  [32937]: getWebGL2ValueOrZero,
  [GL_GPU_DISJOINT_EXT]: (gl, getParameter) => {
    const ext = (0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl) ? gl.getExtension(EXT_disjoint_timer_query_webgl2) : gl.getExtension(EXT_disjoint_timer_query);
    return ext && ext.GPU_DISJOINT_EXT ? getParameter(ext.GPU_DISJOINT_EXT) : 0;
  },
  [GL_UNMASKED_VENDOR_WEBGL]: (gl, getParameter) => {
    const ext = gl.getExtension(WEBGL_debug_renderer_info);
    return getParameter(ext && ext.UNMASKED_VENDOR_WEBGL || 7936);
  },
  [GL_UNMASKED_RENDERER_WEBGL]: (gl, getParameter) => {
    const ext = gl.getExtension(WEBGL_debug_renderer_info);
    return getParameter(ext && ext.UNMASKED_RENDERER_WEBGL || 7937);
  },
  [GL_MAX_TEXTURE_MAX_ANISOTROPY_EXT]: (gl, getParameter) => {
    const ext = gl.luma.extensions[EXT_texture_filter_anisotropic];
    return ext ? getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 1.0;
  },
  [32883]: getWebGL2ValueOrZero,
  [35071]: getWebGL2ValueOrZero,
  [37447]: getWebGL2ValueOrZero,
  [36063]: (gl, getParameter) => {
    if (!(0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl)) {
      const ext = gl.getExtension(WEBGL_draw_buffers);
      return ext ? getParameter(ext.MAX_COLOR_ATTACHMENTS_WEBGL) : 0;
    }

    return undefined;
  },
  [35379]: getWebGL2ValueOrZero,
  [35374]: getWebGL2ValueOrZero,
  [35377]: getWebGL2ValueOrZero,
  [34852]: gl => {
    if (!(0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl)) {
      const ext = gl.getExtension(WEBGL_draw_buffers);
      return ext ? ext.MAX_DRAW_BUFFERS_WEBGL : 0;
    }

    return undefined;
  },
  [36203]: gl => gl.getExtension(OES_element_index) ? 2147483647 : 65535,
  [33001]: gl => gl.getExtension(OES_element_index) ? 16777216 : 65535,
  [33000]: gl => 16777216,
  [37157]: getWebGL2ValueOrZero,
  [35373]: getWebGL2ValueOrZero,
  [35657]: getWebGL2ValueOrZero,
  [36183]: getWebGL2ValueOrZero,
  [37137]: getWebGL2ValueOrZero,
  [34045]: getWebGL2ValueOrZero,
  [35978]: getWebGL2ValueOrZero,
  [35979]: getWebGL2ValueOrZero,
  [35968]: getWebGL2ValueOrZero,
  [35376]: getWebGL2ValueOrZero,
  [35375]: getWebGL2ValueOrZero,
  [35659]: getWebGL2ValueOrZero,
  [37154]: getWebGL2ValueOrZero,
  [35371]: getWebGL2ValueOrZero,
  [35658]: getWebGL2ValueOrZero,
  [35076]: getWebGL2ValueOrZero,
  [35077]: getWebGL2ValueOrZero,
  [35380]: getWebGL2ValueOrZero
};
function getParameterPolyfill(gl, originalGetParameter, pname) {
  const limit = WEBGL_PARAMETERS[pname];
  const value = typeof limit === 'function' ? limit(gl, originalGetParameter, pname) : limit;
  const result = value !== undefined ? value : originalGetParameter(pname);
  return result;
}
//# sourceMappingURL=get-parameter-polyfill.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/polyfill/polyfill-context.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/polyfill/polyfill-context.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "polyfillContext": () => (/* binding */ polyfillContext)
/* harmony export */ });
/* harmony import */ var _polyfill_vertex_array_object__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./polyfill-vertex-array-object */ "./node_modules/@luma.gl/gltools/dist/esm/polyfill/polyfill-vertex-array-object.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/gltools/dist/esm/utils/assert.js");
/* harmony import */ var _polyfill_table__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./polyfill-table */ "./node_modules/@luma.gl/gltools/dist/esm/polyfill/polyfill-table.js");



function polyfillContext(gl) {
  gl.luma = gl.luma || {};
  const {
    luma
  } = gl;

  if (!luma.polyfilled) {
    (0,_polyfill_vertex_array_object__WEBPACK_IMPORTED_MODULE_0__.polyfillVertexArrayObject)(gl);
    initializeExtensions(gl);
    installPolyfills(gl, _polyfill_table__WEBPACK_IMPORTED_MODULE_2__.WEBGL2_CONTEXT_POLYFILLS);
    installOverrides(gl, {
      target: luma,
      target2: gl
    });
    luma.polyfilled = true;
  }

  return gl;
}
const global_ = typeof __webpack_require__.g !== 'undefined' ? __webpack_require__.g : window;
global_.polyfillContext = polyfillContext;

function initializeExtensions(gl) {
  gl.luma.extensions = {};
  const EXTENSIONS = gl.getSupportedExtensions() || [];

  for (const extension of EXTENSIONS) {
    gl.luma[extension] = gl.getExtension(extension);
  }
}

function installOverrides(gl, {
  target,
  target2
}) {
  Object.keys(_polyfill_table__WEBPACK_IMPORTED_MODULE_2__.WEBGL2_CONTEXT_OVERRIDES).forEach(key => {
    if (typeof _polyfill_table__WEBPACK_IMPORTED_MODULE_2__.WEBGL2_CONTEXT_OVERRIDES[key] === 'function') {
      const originalFunc = gl[key] ? gl[key].bind(gl) : () => {};
      const polyfill = _polyfill_table__WEBPACK_IMPORTED_MODULE_2__.WEBGL2_CONTEXT_OVERRIDES[key].bind(null, gl, originalFunc);
      target[key] = polyfill;
      target2[key] = polyfill;
    }
  });
}

function installPolyfills(gl, polyfills) {
  for (const extension of Object.getOwnPropertyNames(polyfills)) {
    if (extension !== 'overrides') {
      polyfillExtension(gl, {
        extension,
        target: gl.luma,
        target2: gl
      });
    }
  }
}

function polyfillExtension(gl, {
  extension,
  target,
  target2
}) {
  const defaults = _polyfill_table__WEBPACK_IMPORTED_MODULE_2__.WEBGL2_CONTEXT_POLYFILLS[extension];
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_1__.assert)(defaults);
  const {
    meta = {}
  } = defaults;
  const {
    suffix = ''
  } = meta;
  const ext = gl.getExtension(extension);

  for (const key of Object.keys(defaults)) {
    const extKey = `${key}${suffix}`;
    let polyfill = null;

    if (key === 'meta') {} else if (typeof gl[key] === 'function') {} else if (ext && typeof ext[extKey] === 'function') {
      polyfill = (...args) => ext[extKey](...args);
    } else if (typeof defaults[key] === 'function') {
      polyfill = defaults[key].bind(target);
    }

    if (polyfill) {
      target[key] = polyfill;
      target2[key] = polyfill;
    }
  }
}
//# sourceMappingURL=polyfill-context.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/polyfill/polyfill-table.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/polyfill/polyfill-table.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "WEBGL2_CONTEXT_POLYFILLS": () => (/* binding */ WEBGL2_CONTEXT_POLYFILLS),
/* harmony export */   "WEBGL2_CONTEXT_OVERRIDES": () => (/* binding */ WEBGL2_CONTEXT_OVERRIDES)
/* harmony export */ });
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/gltools/dist/esm/utils/assert.js");
/* harmony import */ var _utils_webgl_checks__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/webgl-checks */ "./node_modules/@luma.gl/gltools/dist/esm/utils/webgl-checks.js");
/* harmony import */ var _get_parameter_polyfill__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./get-parameter-polyfill */ "./node_modules/@luma.gl/gltools/dist/esm/polyfill/get-parameter-polyfill.js");



const OES_vertex_array_object = 'OES_vertex_array_object';
const ANGLE_instanced_arrays = 'ANGLE_instanced_arrays';
const WEBGL_draw_buffers = 'WEBGL_draw_buffers';
const EXT_disjoint_timer_query = 'EXT_disjoint_timer_query';
const EXT_texture_filter_anisotropic = 'EXT_texture_filter_anisotropic';
const ERR_VAO_NOT_SUPPORTED = 'VertexArray requires WebGL2 or OES_vertex_array_object extension';

function getExtensionData(gl, extension) {
  return {
    webgl2: (0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_1__.isWebGL2)(gl),
    ext: gl.getExtension(extension)
  };
}

const WEBGL2_CONTEXT_POLYFILLS = {
  [OES_vertex_array_object]: {
    meta: {
      suffix: 'OES'
    },
    createVertexArray: () => {
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(false, ERR_VAO_NOT_SUPPORTED);
    },
    deleteVertexArray: () => {},
    bindVertexArray: () => {},
    isVertexArray: () => false
  },
  [ANGLE_instanced_arrays]: {
    meta: {
      suffix: 'ANGLE'
    },

    vertexAttribDivisor(location, divisor) {
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(divisor === 0, 'WebGL instanced rendering not supported');
    },

    drawElementsInstanced: () => {},
    drawArraysInstanced: () => {}
  },
  [WEBGL_draw_buffers]: {
    meta: {
      suffix: 'WEBGL'
    },
    drawBuffers: () => {
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(false);
    }
  },
  [EXT_disjoint_timer_query]: {
    meta: {
      suffix: 'EXT'
    },
    createQuery: () => {
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(false);
    },
    deleteQuery: () => {
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(false);
    },
    beginQuery: () => {
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(false);
    },
    endQuery: () => {},

    getQuery(handle, pname) {
      return this.getQueryObject(handle, pname);
    },

    getQueryParameter(handle, pname) {
      return this.getQueryObject(handle, pname);
    },

    getQueryObject: () => {}
  }
};
const WEBGL2_CONTEXT_OVERRIDES = {
  readBuffer: (gl, originalFunc, attachment) => {
    if ((0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_1__.isWebGL2)(gl)) {
      originalFunc(attachment);
    } else {}
  },
  getVertexAttrib: (gl, originalFunc, location, pname) => {
    const {
      webgl2,
      ext
    } = getExtensionData(gl, ANGLE_instanced_arrays);
    let result;

    switch (pname) {
      case 35069:
        result = !webgl2 ? false : undefined;
        break;

      case 35070:
        result = !webgl2 && !ext ? 0 : undefined;
        break;

      default:
    }

    return result !== undefined ? result : originalFunc(location, pname);
  },
  getProgramParameter: (gl, originalFunc, program, pname) => {
    if (!(0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_1__.isWebGL2)(gl)) {
      switch (pname) {
        case 35967:
          return 35981;

        case 35971:
          return 0;

        case 35382:
          return 0;

        default:
      }
    }

    return originalFunc(program, pname);
  },
  getInternalformatParameter: (gl, originalFunc, target, format, pname) => {
    if (!(0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_1__.isWebGL2)(gl)) {
      switch (pname) {
        case 32937:
          return new Int32Array([0]);

        default:
      }
    }

    return gl.getInternalformatParameter(target, format, pname);
  },

  getTexParameter(gl, originalFunc, target, pname) {
    switch (pname) {
      case 34046:
        const {
          extensions
        } = gl.luma;
        const ext = extensions[EXT_texture_filter_anisotropic];
        pname = ext && ext.TEXTURE_MAX_ANISOTROPY_EXT || 34046;
        break;

      default:
    }

    return originalFunc(target, pname);
  },

  getParameter: _get_parameter_polyfill__WEBPACK_IMPORTED_MODULE_2__.getParameterPolyfill,

  hint(gl, originalFunc, pname, value) {
    return originalFunc(pname, value);
  }

};
//# sourceMappingURL=polyfill-table.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/polyfill/polyfill-vertex-array-object.js":
/*!*****************************************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/polyfill/polyfill-vertex-array-object.js ***!
  \*****************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "polyfillVertexArrayObject": () => (/* binding */ polyfillVertexArrayObject)
/* harmony export */ });
/* harmony import */ var probe_gl_env__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! probe.gl/env */ "./node_modules/probe.gl/dist/es5/env/index.js");

const glErrorShadow = {};

function error(msg) {
  if (probe_gl_env__WEBPACK_IMPORTED_MODULE_0__.global.console && probe_gl_env__WEBPACK_IMPORTED_MODULE_0__.global.console.error) {
    probe_gl_env__WEBPACK_IMPORTED_MODULE_0__.global.console.error(msg);
  }
}

function log(msg) {
  if (probe_gl_env__WEBPACK_IMPORTED_MODULE_0__.global.console && probe_gl_env__WEBPACK_IMPORTED_MODULE_0__.global.console.log) {
    probe_gl_env__WEBPACK_IMPORTED_MODULE_0__.global.console.log(msg);
  }
}

function synthesizeGLError(err, opt_msg) {
  glErrorShadow[err] = true;

  if (opt_msg !== undefined) {
    error(opt_msg);
  }
}

function wrapGLError(gl) {
  const f = gl.getError;

  gl.getError = function getError() {
    let err;

    do {
      err = f.apply(gl);

      if (err !== 0) {
        glErrorShadow[err] = true;
      }
    } while (err !== 0);

    for (err in glErrorShadow) {
      if (glErrorShadow[err]) {
        delete glErrorShadow[err];
        return parseInt(err, 10);
      }
    }

    return 0;
  };
}

const WebGLVertexArrayObjectOES = function WebGLVertexArrayObjectOES(ext) {
  const gl = ext.gl;
  this.ext = ext;
  this.isAlive = true;
  this.hasBeenBound = false;
  this.elementArrayBuffer = null;
  this.attribs = new Array(ext.maxVertexAttribs);

  for (let n = 0; n < this.attribs.length; n++) {
    const attrib = new WebGLVertexArrayObjectOES.VertexAttrib(gl);
    this.attribs[n] = attrib;
  }

  this.maxAttrib = 0;
};

WebGLVertexArrayObjectOES.VertexAttrib = function VertexAttrib(gl) {
  this.enabled = false;
  this.buffer = null;
  this.size = 4;
  this.type = 5126;
  this.normalized = false;
  this.stride = 16;
  this.offset = 0;
  this.cached = '';
  this.recache();
};

WebGLVertexArrayObjectOES.VertexAttrib.prototype.recache = function recache() {
  this.cached = [this.size, this.type, this.normalized, this.stride, this.offset].join(':');
};

const OESVertexArrayObject = function OESVertexArrayObject(gl) {
  const self = this;
  this.gl = gl;
  wrapGLError(gl);
  const original = this.original = {
    getParameter: gl.getParameter,
    enableVertexAttribArray: gl.enableVertexAttribArray,
    disableVertexAttribArray: gl.disableVertexAttribArray,
    bindBuffer: gl.bindBuffer,
    getVertexAttrib: gl.getVertexAttrib,
    vertexAttribPointer: gl.vertexAttribPointer
  };

  gl.getParameter = function getParameter(pname) {
    if (pname === self.VERTEX_ARRAY_BINDING_OES) {
      if (self.currentVertexArrayObject === self.defaultVertexArrayObject) {
        return null;
      }

      return self.currentVertexArrayObject;
    }

    return original.getParameter.apply(this, arguments);
  };

  gl.enableVertexAttribArray = function enableVertexAttribArray(index) {
    const vao = self.currentVertexArrayObject;
    vao.maxAttrib = Math.max(vao.maxAttrib, index);
    const attrib = vao.attribs[index];
    attrib.enabled = true;
    return original.enableVertexAttribArray.apply(this, arguments);
  };

  gl.disableVertexAttribArray = function disableVertexAttribArray(index) {
    const vao = self.currentVertexArrayObject;
    vao.maxAttrib = Math.max(vao.maxAttrib, index);
    const attrib = vao.attribs[index];
    attrib.enabled = false;
    return original.disableVertexAttribArray.apply(this, arguments);
  };

  gl.bindBuffer = function bindBuffer(target, buffer) {
    switch (target) {
      case 34962:
        self.currentArrayBuffer = buffer;
        break;

      case 34963:
        self.currentVertexArrayObject.elementArrayBuffer = buffer;
        break;

      default:
    }

    return original.bindBuffer.apply(this, arguments);
  };

  gl.getVertexAttrib = function getVertexAttrib(index, pname) {
    const vao = self.currentVertexArrayObject;
    const attrib = vao.attribs[index];

    switch (pname) {
      case 34975:
        return attrib.buffer;

      case 34338:
        return attrib.enabled;

      case 34339:
        return attrib.size;

      case 34340:
        return attrib.stride;

      case 34341:
        return attrib.type;

      case 34922:
        return attrib.normalized;

      default:
        return original.getVertexAttrib.apply(this, arguments);
    }
  };

  gl.vertexAttribPointer = function vertexAttribPointer(indx, size, type, normalized, stride, offset) {
    const vao = self.currentVertexArrayObject;
    vao.maxAttrib = Math.max(vao.maxAttrib, indx);
    const attrib = vao.attribs[indx];
    attrib.buffer = self.currentArrayBuffer;
    attrib.size = size;
    attrib.type = type;
    attrib.normalized = normalized;
    attrib.stride = stride;
    attrib.offset = offset;
    attrib.recache();
    return original.vertexAttribPointer.apply(this, arguments);
  };

  if (gl.instrumentExtension) {
    gl.instrumentExtension(this, 'OES_vertex_array_object');
  }

  if (gl.canvas) {
    gl.canvas.addEventListener('webglcontextrestored', () => {
      log('OESVertexArrayObject emulation library context restored');
      self.reset_();
    }, true);
  }

  this.reset_();
};

OESVertexArrayObject.prototype.VERTEX_ARRAY_BINDING_OES = 0x85b5;

OESVertexArrayObject.prototype.reset_ = function reset_() {
  const contextWasLost = this.vertexArrayObjects !== undefined;

  if (contextWasLost) {
    for (let ii = 0; ii < this.vertexArrayObjects.length; ++ii) {
      this.vertexArrayObjects.isAlive = false;
    }
  }

  const gl = this.gl;
  this.maxVertexAttribs = gl.getParameter(34921);
  this.defaultVertexArrayObject = new WebGLVertexArrayObjectOES(this);
  this.currentVertexArrayObject = null;
  this.currentArrayBuffer = null;
  this.vertexArrayObjects = [this.defaultVertexArrayObject];
  this.bindVertexArrayOES(null);
};

OESVertexArrayObject.prototype.createVertexArrayOES = function createVertexArrayOES() {
  const arrayObject = new WebGLVertexArrayObjectOES(this);
  this.vertexArrayObjects.push(arrayObject);
  return arrayObject;
};

OESVertexArrayObject.prototype.deleteVertexArrayOES = function deleteVertexArrayOES(arrayObject) {
  arrayObject.isAlive = false;
  this.vertexArrayObjects.splice(this.vertexArrayObjects.indexOf(arrayObject), 1);

  if (this.currentVertexArrayObject === arrayObject) {
    this.bindVertexArrayOES(null);
  }
};

OESVertexArrayObject.prototype.isVertexArrayOES = function isVertexArrayOES(arrayObject) {
  if (arrayObject && arrayObject instanceof WebGLVertexArrayObjectOES) {
    if (arrayObject.hasBeenBound && arrayObject.ext === this) {
      return true;
    }
  }

  return false;
};

OESVertexArrayObject.prototype.bindVertexArrayOES = function bindVertexArrayOES(arrayObject) {
  const gl = this.gl;

  if (arrayObject && !arrayObject.isAlive) {
    synthesizeGLError(1282, 'bindVertexArrayOES: attempt to bind deleted arrayObject');
    return;
  }

  const original = this.original;
  const oldVAO = this.currentVertexArrayObject;
  this.currentVertexArrayObject = arrayObject || this.defaultVertexArrayObject;
  this.currentVertexArrayObject.hasBeenBound = true;
  const newVAO = this.currentVertexArrayObject;

  if (oldVAO === newVAO) {
    return;
  }

  if (!oldVAO || newVAO.elementArrayBuffer !== oldVAO.elementArrayBuffer) {
    original.bindBuffer.call(gl, 34963, newVAO.elementArrayBuffer);
  }

  let currentBinding = this.currentArrayBuffer;
  const maxAttrib = Math.max(oldVAO ? oldVAO.maxAttrib : 0, newVAO.maxAttrib);

  for (let n = 0; n <= maxAttrib; n++) {
    const attrib = newVAO.attribs[n];
    const oldAttrib = oldVAO ? oldVAO.attribs[n] : null;

    if (!oldVAO || attrib.enabled !== oldAttrib.enabled) {
      if (attrib.enabled) {
        original.enableVertexAttribArray.call(gl, n);
      } else {
        original.disableVertexAttribArray.call(gl, n);
      }
    }

    if (attrib.enabled) {
      let bufferChanged = false;

      if (!oldVAO || attrib.buffer !== oldAttrib.buffer) {
        if (currentBinding !== attrib.buffer) {
          original.bindBuffer.call(gl, 34962, attrib.buffer);
          currentBinding = attrib.buffer;
        }

        bufferChanged = true;
      }

      if (bufferChanged || attrib.cached !== oldAttrib.cached) {
        original.vertexAttribPointer.call(gl, n, attrib.size, attrib.type, attrib.normalized, attrib.stride, attrib.offset);
      }
    }
  }

  if (this.currentArrayBuffer !== currentBinding) {
    original.bindBuffer.call(gl, 34962, this.currentArrayBuffer);
  }
};

function polyfillVertexArrayObject(gl) {
  if (typeof gl.createVertexArray === 'function') {
    return;
  }

  const original_getSupportedExtensions = gl.getSupportedExtensions;

  gl.getSupportedExtensions = function getSupportedExtensions() {
    const list = original_getSupportedExtensions.call(this) || [];

    if (list.indexOf('OES_vertex_array_object') < 0) {
      list.push('OES_vertex_array_object');
    }

    return list;
  };

  const original_getExtension = gl.getExtension;

  gl.getExtension = function getExtension(name) {
    const ext = original_getExtension.call(this, name);

    if (ext) {
      return ext;
    }

    if (name !== 'OES_vertex_array_object') {
      return null;
    }

    if (!gl.__OESVertexArrayObject) {
      this.__OESVertexArrayObject = new OESVertexArrayObject(this);
    }

    return this.__OESVertexArrayObject;
  };
}
//# sourceMappingURL=polyfill-vertex-array-object.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/state-tracker/track-context-state.js":
/*!*************************************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/state-tracker/track-context-state.js ***!
  \*************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "trackContextState": () => (/* binding */ trackContextState),
/* harmony export */   "pushContextState": () => (/* binding */ pushContextState),
/* harmony export */   "popContextState": () => (/* binding */ popContextState)
/* harmony export */ });
/* harmony import */ var _webgl_parameter_tables__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./webgl-parameter-tables */ "./node_modules/@luma.gl/gltools/dist/esm/state-tracker/webgl-parameter-tables.js");
/* harmony import */ var _unified_parameter_api__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./unified-parameter-api */ "./node_modules/@luma.gl/gltools/dist/esm/state-tracker/unified-parameter-api.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/gltools/dist/esm/utils/assert.js");
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/utils */ "./node_modules/@luma.gl/gltools/dist/esm/utils/utils.js");





function installGetterOverride(gl, functionName) {
  const originalGetterFunc = gl[functionName].bind(gl);

  gl[functionName] = function get(...params) {
    const pname = params[0];

    if (!(pname in gl.state.cache)) {
      return originalGetterFunc(...params);
    }

    return gl.state.enable ? gl.state.cache[pname] : originalGetterFunc(...params);
  };

  Object.defineProperty(gl[functionName], 'name', {
    value: `${functionName}-from-cache`,
    configurable: false
  });
}

function installSetterSpy(gl, functionName, setter) {
  const originalSetterFunc = gl[functionName].bind(gl);

  gl[functionName] = function set(...params) {
    const {
      valueChanged,
      oldValue
    } = setter(gl.state._updateCache, ...params);

    if (valueChanged) {
      originalSetterFunc(...params);
    }

    return oldValue;
  };

  Object.defineProperty(gl[functionName], 'name', {
    value: `${functionName}-to-cache`,
    configurable: false
  });
}

function installProgramSpy(gl) {
  const originalUseProgram = gl.useProgram.bind(gl);

  gl.useProgram = function useProgramLuma(handle) {
    if (gl.state.program !== handle) {
      originalUseProgram(handle);
      gl.state.program = handle;
    }
  };
}

class GLState {
  constructor(gl, {
    copyState = false,
    log = () => {}
  } = {}) {
    this.gl = gl;
    this.program = null;
    this.stateStack = [];
    this.enable = true;
    this.cache = copyState ? (0,_unified_parameter_api__WEBPACK_IMPORTED_MODULE_1__.getParameters)(gl) : Object.assign({}, _webgl_parameter_tables__WEBPACK_IMPORTED_MODULE_0__.GL_PARAMETER_DEFAULTS);
    this.log = log;
    this._updateCache = this._updateCache.bind(this);
    Object.seal(this);
  }

  push(values = {}) {
    this.stateStack.push({});
  }

  pop() {
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(this.stateStack.length > 0);
    const oldValues = this.stateStack[this.stateStack.length - 1];
    (0,_unified_parameter_api__WEBPACK_IMPORTED_MODULE_1__.setParameters)(this.gl, oldValues);
    this.stateStack.pop();
  }

  _updateCache(values) {
    let valueChanged = false;
    let oldValue;
    const oldValues = this.stateStack.length > 0 && this.stateStack[this.stateStack.length - 1];

    for (const key in values) {
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(key !== undefined);
      const value = values[key];
      const cached = this.cache[key];

      if (!(0,_utils_utils__WEBPACK_IMPORTED_MODULE_3__.deepArrayEqual)(value, cached)) {
        valueChanged = true;
        oldValue = cached;

        if (oldValues && !(key in oldValues)) {
          oldValues[key] = cached;
        }

        this.cache[key] = value;
      }
    }

    return {
      valueChanged,
      oldValue
    };
  }

}

function trackContextState(gl, options = {}) {
  const {
    enable = true,
    copyState
  } = options;
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(copyState !== undefined);

  if (!gl.state) {
    const global_ = typeof __webpack_require__.g !== 'undefined' ? __webpack_require__.g : window;
    const {
      polyfillContext
    } = global_;

    if (polyfillContext) {
      polyfillContext(gl);
    }

    gl.state = new GLState(gl, {
      copyState
    });
    installProgramSpy(gl);

    for (const key in _webgl_parameter_tables__WEBPACK_IMPORTED_MODULE_0__.GL_HOOKED_SETTERS) {
      const setter = _webgl_parameter_tables__WEBPACK_IMPORTED_MODULE_0__.GL_HOOKED_SETTERS[key];
      installSetterSpy(gl, key, setter);
    }

    installGetterOverride(gl, 'getParameter');
    installGetterOverride(gl, 'isEnabled');
  }

  gl.state.enable = enable;
  return gl;
}
function pushContextState(gl) {
  if (!gl.state) {
    trackContextState(gl, {
      copyState: false
    });
  }

  gl.state.push();
}
function popContextState(gl) {
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(gl.state);
  gl.state.pop();
}
//# sourceMappingURL=track-context-state.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/state-tracker/unified-parameter-api.js":
/*!***************************************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/state-tracker/unified-parameter-api.js ***!
  \***************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "setParameters": () => (/* binding */ setParameters),
/* harmony export */   "getParameters": () => (/* binding */ getParameters),
/* harmony export */   "resetParameters": () => (/* binding */ resetParameters),
/* harmony export */   "withParameters": () => (/* binding */ withParameters)
/* harmony export */ });
/* harmony import */ var _webgl_parameter_tables__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./webgl-parameter-tables */ "./node_modules/@luma.gl/gltools/dist/esm/state-tracker/webgl-parameter-tables.js");
/* harmony import */ var _track_context_state__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./track-context-state */ "./node_modules/@luma.gl/gltools/dist/esm/state-tracker/track-context-state.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/gltools/dist/esm/utils/assert.js");
/* harmony import */ var _utils_webgl_checks__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/webgl-checks */ "./node_modules/@luma.gl/gltools/dist/esm/utils/webgl-checks.js");
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/utils */ "./node_modules/@luma.gl/gltools/dist/esm/utils/utils.js");





function setParameters(gl, values) {
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)((0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_3__.isWebGL)(gl), 'setParameters requires a WebGL context');

  if ((0,_utils_utils__WEBPACK_IMPORTED_MODULE_4__.isObjectEmpty)(values)) {
    return;
  }

  const compositeSetters = {};

  for (const key in values) {
    const glConstant = Number(key);
    const setter = _webgl_parameter_tables__WEBPACK_IMPORTED_MODULE_0__.GL_PARAMETER_SETTERS[key];

    if (setter) {
      if (typeof setter === 'string') {
        compositeSetters[setter] = true;
      } else {
        setter(gl, values[key], glConstant);
      }
    }
  }

  const cache = gl.state && gl.state.cache;

  if (cache) {
    for (const key in compositeSetters) {
      const compositeSetter = _webgl_parameter_tables__WEBPACK_IMPORTED_MODULE_0__.GL_COMPOSITE_PARAMETER_SETTERS[key];
      compositeSetter(gl, values, cache);
    }
  }
}
function getParameters(gl, parameters) {
  parameters = parameters || _webgl_parameter_tables__WEBPACK_IMPORTED_MODULE_0__.GL_PARAMETER_DEFAULTS;

  if (typeof parameters === 'number') {
    const key = parameters;
    const getter = _webgl_parameter_tables__WEBPACK_IMPORTED_MODULE_0__.GL_PARAMETER_GETTERS[key];
    return getter ? getter(gl, key) : gl.getParameter(key);
  }

  const parameterKeys = Array.isArray(parameters) ? parameters : Object.keys(parameters);
  const state = {};

  for (const key of parameterKeys) {
    const getter = _webgl_parameter_tables__WEBPACK_IMPORTED_MODULE_0__.GL_PARAMETER_GETTERS[key];
    state[key] = getter ? getter(gl, Number(key)) : gl.getParameter(Number(key));
  }

  return state;
}
function resetParameters(gl) {
  setParameters(gl, _webgl_parameter_tables__WEBPACK_IMPORTED_MODULE_0__.GL_PARAMETER_DEFAULTS);
}
function withParameters(gl, parameters, func) {
  if ((0,_utils_utils__WEBPACK_IMPORTED_MODULE_4__.isObjectEmpty)(parameters)) {
    return func(gl);
  }

  const {
    nocatch = true
  } = parameters;
  (0,_track_context_state__WEBPACK_IMPORTED_MODULE_1__.pushContextState)(gl);
  setParameters(gl, parameters);
  let value;

  if (nocatch) {
    value = func(gl);
    (0,_track_context_state__WEBPACK_IMPORTED_MODULE_1__.popContextState)(gl);
  } else {
    try {
      value = func(gl);
    } finally {
      (0,_track_context_state__WEBPACK_IMPORTED_MODULE_1__.popContextState)(gl);
    }
  }

  return value;
}
//# sourceMappingURL=unified-parameter-api.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/state-tracker/webgl-parameter-tables.js":
/*!****************************************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/state-tracker/webgl-parameter-tables.js ***!
  \****************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "GL_PARAMETER_DEFAULTS": () => (/* binding */ GL_PARAMETER_DEFAULTS),
/* harmony export */   "GL_PARAMETER_SETTERS": () => (/* binding */ GL_PARAMETER_SETTERS),
/* harmony export */   "GL_COMPOSITE_PARAMETER_SETTERS": () => (/* binding */ GL_COMPOSITE_PARAMETER_SETTERS),
/* harmony export */   "GL_HOOKED_SETTERS": () => (/* binding */ GL_HOOKED_SETTERS),
/* harmony export */   "GL_PARAMETER_GETTERS": () => (/* binding */ GL_PARAMETER_GETTERS)
/* harmony export */ });
/* harmony import */ var _utils_webgl_checks__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/webgl-checks */ "./node_modules/@luma.gl/gltools/dist/esm/utils/webgl-checks.js");

const GL_PARAMETER_DEFAULTS = {
  [3042]: false,
  [32773]: new Float32Array([0, 0, 0, 0]),
  [32777]: 32774,
  [34877]: 32774,
  [32969]: 1,
  [32968]: 0,
  [32971]: 1,
  [32970]: 0,
  [3106]: new Float32Array([0, 0, 0, 0]),
  [3107]: [true, true, true, true],
  [2884]: false,
  [2885]: 1029,
  [2929]: false,
  [2931]: 1,
  [2932]: 513,
  [2928]: new Float32Array([0, 1]),
  [2930]: true,
  [3024]: true,
  [36006]: null,
  [2886]: 2305,
  [33170]: 4352,
  [2849]: 1,
  [32823]: false,
  [32824]: 0,
  [10752]: 0,
  [32938]: 1.0,
  [32939]: false,
  [3089]: false,
  [3088]: new Int32Array([0, 0, 1024, 1024]),
  [2960]: false,
  [2961]: 0,
  [2968]: 0xffffffff,
  [36005]: 0xffffffff,
  [2962]: 519,
  [2967]: 0,
  [2963]: 0xffffffff,
  [34816]: 519,
  [36003]: 0,
  [36004]: 0xffffffff,
  [2964]: 7680,
  [2965]: 7680,
  [2966]: 7680,
  [34817]: 7680,
  [34818]: 7680,
  [34819]: 7680,
  [2978]: [0, 0, 1024, 1024],
  [3333]: 4,
  [3317]: 4,
  [37440]: false,
  [37441]: false,
  [37443]: 37444,
  [35723]: 4352,
  [36010]: null,
  [35977]: false,
  [3330]: 0,
  [3332]: 0,
  [3331]: 0,
  [3314]: 0,
  [32878]: 0,
  [3316]: 0,
  [3315]: 0,
  [32877]: 0
};

const enable = (gl, value, key) => value ? gl.enable(key) : gl.disable(key);

const hint = (gl, value, key) => gl.hint(key, value);

const pixelStorei = (gl, value, key) => gl.pixelStorei(key, value);

const drawFramebuffer = (gl, value) => {
  const target = (0,_utils_webgl_checks__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl) ? 36009 : 36160;
  return gl.bindFramebuffer(target, value);
};

const readFramebuffer = (gl, value) => {
  return gl.bindFramebuffer(36008, value);
};

function isArray(array) {
  return Array.isArray(array) || ArrayBuffer.isView(array);
}

const GL_PARAMETER_SETTERS = {
  [3042]: enable,
  [32773]: (gl, value) => gl.blendColor(...value),
  [32777]: 'blendEquation',
  [34877]: 'blendEquation',
  [32969]: 'blendFunc',
  [32968]: 'blendFunc',
  [32971]: 'blendFunc',
  [32970]: 'blendFunc',
  [3106]: (gl, value) => gl.clearColor(...value),
  [3107]: (gl, value) => gl.colorMask(...value),
  [2884]: enable,
  [2885]: (gl, value) => gl.cullFace(value),
  [2929]: enable,
  [2931]: (gl, value) => gl.clearDepth(value),
  [2932]: (gl, value) => gl.depthFunc(value),
  [2928]: (gl, value) => gl.depthRange(...value),
  [2930]: (gl, value) => gl.depthMask(value),
  [3024]: enable,
  [35723]: hint,
  [36006]: drawFramebuffer,
  [2886]: (gl, value) => gl.frontFace(value),
  [33170]: hint,
  [2849]: (gl, value) => gl.lineWidth(value),
  [32823]: enable,
  [32824]: 'polygonOffset',
  [10752]: 'polygonOffset',
  [35977]: enable,
  [32938]: 'sampleCoverage',
  [32939]: 'sampleCoverage',
  [3089]: enable,
  [3088]: (gl, value) => gl.scissor(...value),
  [2960]: enable,
  [2961]: (gl, value) => gl.clearStencil(value),
  [2968]: (gl, value) => gl.stencilMaskSeparate(1028, value),
  [36005]: (gl, value) => gl.stencilMaskSeparate(1029, value),
  [2962]: 'stencilFuncFront',
  [2967]: 'stencilFuncFront',
  [2963]: 'stencilFuncFront',
  [34816]: 'stencilFuncBack',
  [36003]: 'stencilFuncBack',
  [36004]: 'stencilFuncBack',
  [2964]: 'stencilOpFront',
  [2965]: 'stencilOpFront',
  [2966]: 'stencilOpFront',
  [34817]: 'stencilOpBack',
  [34818]: 'stencilOpBack',
  [34819]: 'stencilOpBack',
  [2978]: (gl, value) => gl.viewport(...value),
  [3333]: pixelStorei,
  [3317]: pixelStorei,
  [37440]: pixelStorei,
  [37441]: pixelStorei,
  [37443]: pixelStorei,
  [3330]: pixelStorei,
  [3332]: pixelStorei,
  [3331]: pixelStorei,
  [36010]: readFramebuffer,
  [3314]: pixelStorei,
  [32878]: pixelStorei,
  [3316]: pixelStorei,
  [3315]: pixelStorei,
  [32877]: pixelStorei,
  framebuffer: (gl, framebuffer) => {
    const handle = framebuffer && 'handle' in framebuffer ? framebuffer.handle : framebuffer;
    return gl.bindFramebuffer(36160, handle);
  },
  blend: (gl, value) => value ? gl.enable(3042) : gl.disable(3042),
  blendColor: (gl, value) => gl.blendColor(...value),
  blendEquation: (gl, args) => {
    args = isArray(args) ? args : [args, args];
    gl.blendEquationSeparate(...args);
  },
  blendFunc: (gl, args) => {
    args = isArray(args) && args.length === 2 ? [...args, ...args] : args;
    gl.blendFuncSeparate(...args);
  },
  clearColor: (gl, value) => gl.clearColor(...value),
  clearDepth: (gl, value) => gl.clearDepth(value),
  clearStencil: (gl, value) => gl.clearStencil(value),
  colorMask: (gl, value) => gl.colorMask(...value),
  cull: (gl, value) => value ? gl.enable(2884) : gl.disable(2884),
  cullFace: (gl, value) => gl.cullFace(value),
  depthTest: (gl, value) => value ? gl.enable(2929) : gl.disable(2929),
  depthFunc: (gl, value) => gl.depthFunc(value),
  depthMask: (gl, value) => gl.depthMask(value),
  depthRange: (gl, value) => gl.depthRange(...value),
  dither: (gl, value) => value ? gl.enable(3024) : gl.disable(3024),
  derivativeHint: (gl, value) => {
    gl.hint(35723, value);
  },
  frontFace: (gl, value) => gl.frontFace(value),
  mipmapHint: (gl, value) => gl.hint(33170, value),
  lineWidth: (gl, value) => gl.lineWidth(value),
  polygonOffsetFill: (gl, value) => value ? gl.enable(32823) : gl.disable(32823),
  polygonOffset: (gl, value) => gl.polygonOffset(...value),
  sampleCoverage: (gl, value) => gl.sampleCoverage(...value),
  scissorTest: (gl, value) => value ? gl.enable(3089) : gl.disable(3089),
  scissor: (gl, value) => gl.scissor(...value),
  stencilTest: (gl, value) => value ? gl.enable(2960) : gl.disable(2960),
  stencilMask: (gl, value) => {
    value = isArray(value) ? value : [value, value];
    const [mask, backMask] = value;
    gl.stencilMaskSeparate(1028, mask);
    gl.stencilMaskSeparate(1029, backMask);
  },
  stencilFunc: (gl, args) => {
    args = isArray(args) && args.length === 3 ? [...args, ...args] : args;
    const [func, ref, mask, backFunc, backRef, backMask] = args;
    gl.stencilFuncSeparate(1028, func, ref, mask);
    gl.stencilFuncSeparate(1029, backFunc, backRef, backMask);
  },
  stencilOp: (gl, args) => {
    args = isArray(args) && args.length === 3 ? [...args, ...args] : args;
    const [sfail, dpfail, dppass, backSfail, backDpfail, backDppass] = args;
    gl.stencilOpSeparate(1028, sfail, dpfail, dppass);
    gl.stencilOpSeparate(1029, backSfail, backDpfail, backDppass);
  },
  viewport: (gl, value) => gl.viewport(...value)
};

function getValue(glEnum, values, cache) {
  return values[glEnum] !== undefined ? values[glEnum] : cache[glEnum];
}

const GL_COMPOSITE_PARAMETER_SETTERS = {
  blendEquation: (gl, values, cache) => gl.blendEquationSeparate(getValue(32777, values, cache), getValue(34877, values, cache)),
  blendFunc: (gl, values, cache) => gl.blendFuncSeparate(getValue(32969, values, cache), getValue(32968, values, cache), getValue(32971, values, cache), getValue(32970, values, cache)),
  polygonOffset: (gl, values, cache) => gl.polygonOffset(getValue(32824, values, cache), getValue(10752, values, cache)),
  sampleCoverage: (gl, values, cache) => gl.sampleCoverage(getValue(32938, values, cache), getValue(32939, values, cache)),
  stencilFuncFront: (gl, values, cache) => gl.stencilFuncSeparate(1028, getValue(2962, values, cache), getValue(2967, values, cache), getValue(2963, values, cache)),
  stencilFuncBack: (gl, values, cache) => gl.stencilFuncSeparate(1029, getValue(34816, values, cache), getValue(36003, values, cache), getValue(36004, values, cache)),
  stencilOpFront: (gl, values, cache) => gl.stencilOpSeparate(1028, getValue(2964, values, cache), getValue(2965, values, cache), getValue(2966, values, cache)),
  stencilOpBack: (gl, values, cache) => gl.stencilOpSeparate(1029, getValue(34817, values, cache), getValue(34818, values, cache), getValue(34819, values, cache))
};
const GL_HOOKED_SETTERS = {
  enable: (update, capability) => update({
    [capability]: true
  }),
  disable: (update, capability) => update({
    [capability]: false
  }),
  pixelStorei: (update, pname, value) => update({
    [pname]: value
  }),
  hint: (update, pname, hint) => update({
    [pname]: hint
  }),
  bindFramebuffer: (update, target, framebuffer) => {
    switch (target) {
      case 36160:
        return update({
          [36006]: framebuffer,
          [36010]: framebuffer
        });

      case 36009:
        return update({
          [36006]: framebuffer
        });

      case 36008:
        return update({
          [36010]: framebuffer
        });

      default:
        return null;
    }
  },
  blendColor: (update, r, g, b, a) => update({
    [32773]: new Float32Array([r, g, b, a])
  }),
  blendEquation: (update, mode) => update({
    [32777]: mode,
    [34877]: mode
  }),
  blendEquationSeparate: (update, modeRGB, modeAlpha) => update({
    [32777]: modeRGB,
    [34877]: modeAlpha
  }),
  blendFunc: (update, src, dst) => update({
    [32969]: src,
    [32968]: dst,
    [32971]: src,
    [32970]: dst
  }),
  blendFuncSeparate: (update, srcRGB, dstRGB, srcAlpha, dstAlpha) => update({
    [32969]: srcRGB,
    [32968]: dstRGB,
    [32971]: srcAlpha,
    [32970]: dstAlpha
  }),
  clearColor: (update, r, g, b, a) => update({
    [3106]: new Float32Array([r, g, b, a])
  }),
  clearDepth: (update, depth) => update({
    [2931]: depth
  }),
  clearStencil: (update, s) => update({
    [2961]: s
  }),
  colorMask: (update, r, g, b, a) => update({
    [3107]: [r, g, b, a]
  }),
  cullFace: (update, mode) => update({
    [2885]: mode
  }),
  depthFunc: (update, func) => update({
    [2932]: func
  }),
  depthRange: (update, zNear, zFar) => update({
    [2928]: new Float32Array([zNear, zFar])
  }),
  depthMask: (update, mask) => update({
    [2930]: mask
  }),
  frontFace: (update, face) => update({
    [2886]: face
  }),
  lineWidth: (update, width) => update({
    [2849]: width
  }),
  polygonOffset: (update, factor, units) => update({
    [32824]: factor,
    [10752]: units
  }),
  sampleCoverage: (update, value, invert) => update({
    [32938]: value,
    [32939]: invert
  }),
  scissor: (update, x, y, width, height) => update({
    [3088]: new Int32Array([x, y, width, height])
  }),
  stencilMask: (update, mask) => update({
    [2968]: mask,
    [36005]: mask
  }),
  stencilMaskSeparate: (update, face, mask) => update({
    [face === 1028 ? 2968 : 36005]: mask
  }),
  stencilFunc: (update, func, ref, mask) => update({
    [2962]: func,
    [2967]: ref,
    [2963]: mask,
    [34816]: func,
    [36003]: ref,
    [36004]: mask
  }),
  stencilFuncSeparate: (update, face, func, ref, mask) => update({
    [face === 1028 ? 2962 : 34816]: func,
    [face === 1028 ? 2967 : 36003]: ref,
    [face === 1028 ? 2963 : 36004]: mask
  }),
  stencilOp: (update, fail, zfail, zpass) => update({
    [2964]: fail,
    [2965]: zfail,
    [2966]: zpass,
    [34817]: fail,
    [34818]: zfail,
    [34819]: zpass
  }),
  stencilOpSeparate: (update, face, fail, zfail, zpass) => update({
    [face === 1028 ? 2964 : 34817]: fail,
    [face === 1028 ? 2965 : 34818]: zfail,
    [face === 1028 ? 2966 : 34819]: zpass
  }),
  viewport: (update, x, y, width, height) => update({
    [2978]: [x, y, width, height]
  })
};

const isEnabled = (gl, key) => gl.isEnabled(key);

const GL_PARAMETER_GETTERS = {
  [3042]: isEnabled,
  [2884]: isEnabled,
  [2929]: isEnabled,
  [3024]: isEnabled,
  [32823]: isEnabled,
  [32926]: isEnabled,
  [32928]: isEnabled,
  [3089]: isEnabled,
  [2960]: isEnabled,
  [35977]: isEnabled
};
//# sourceMappingURL=webgl-parameter-tables.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/utils/assert.js":
/*!****************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/utils/assert.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "assert": () => (/* binding */ assert)
/* harmony export */ });
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'luma.gl: assertion failed.');
  }
}
//# sourceMappingURL=assert.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/utils/device-pixels.js":
/*!***********************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/utils/device-pixels.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "cssToDeviceRatio": () => (/* binding */ cssToDeviceRatio),
/* harmony export */   "cssToDevicePixels": () => (/* binding */ cssToDevicePixels),
/* harmony export */   "getDevicePixelRatio": () => (/* binding */ getDevicePixelRatio)
/* harmony export */ });
function cssToDeviceRatio(gl) {
  const {
    luma
  } = gl;

  if (gl.canvas && luma) {
    const {
      clientWidth
    } = luma.canvasSizeInfo;
    return clientWidth ? gl.drawingBufferWidth / clientWidth : 1;
  }

  return 1;
}
function cssToDevicePixels(gl, cssPixel, yInvert = true) {
  const ratio = cssToDeviceRatio(gl);
  const width = gl.drawingBufferWidth;
  const height = gl.drawingBufferHeight;
  return scalePixels(cssPixel, ratio, width, height, yInvert);
}
function getDevicePixelRatio(useDevicePixels) {
  const windowRatio = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;

  if (Number.isFinite(useDevicePixels)) {
    return useDevicePixels <= 0 ? 1 : useDevicePixels;
  }

  return useDevicePixels ? windowRatio : 1;
}

function scalePixels(pixel, ratio, width, height, yInvert) {
  const x = scaleX(pixel[0], ratio, width);
  let y = scaleY(pixel[1], ratio, height, yInvert);
  let t = scaleX(pixel[0] + 1, ratio, width);
  const xHigh = t === width - 1 ? t : t - 1;
  t = scaleY(pixel[1] + 1, ratio, height, yInvert);
  let yHigh;

  if (yInvert) {
    t = t === 0 ? t : t + 1;
    yHigh = y;
    y = t;
  } else {
    yHigh = t === height - 1 ? t : t - 1;
  }

  return {
    x,
    y,
    width: Math.max(xHigh - x + 1, 1),
    height: Math.max(yHigh - y + 1, 1)
  };
}

function scaleX(x, ratio, width) {
  const r = Math.min(Math.round(x * ratio), width - 1);
  return r;
}

function scaleY(y, ratio, height, yInvert) {
  return yInvert ? Math.max(0, height - 1 - Math.round(y * ratio)) : Math.min(Math.round(y * ratio), height - 1);
}
//# sourceMappingURL=device-pixels.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/utils/log.js":
/*!*************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/utils/log.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "log": () => (/* binding */ log)
/* harmony export */ });
/* harmony import */ var probe_gl__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! probe.gl */ "./node_modules/probe.gl/dist/esm/lib/log.js");

const log = new probe_gl__WEBPACK_IMPORTED_MODULE_0__["default"]({
  id: 'luma.gl'
});
//# sourceMappingURL=log.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/utils/utils.js":
/*!***************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/utils/utils.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isObjectEmpty": () => (/* binding */ isObjectEmpty),
/* harmony export */   "deepArrayEqual": () => (/* binding */ deepArrayEqual)
/* harmony export */ });
function isObjectEmpty(object) {
  for (const key in object) {
    return false;
  }

  return true;
}
function deepArrayEqual(x, y) {
  if (x === y) {
    return true;
  }

  const isArrayX = Array.isArray(x) || ArrayBuffer.isView(x);
  const isArrayY = Array.isArray(y) || ArrayBuffer.isView(y);

  if (isArrayX && isArrayY && x.length === y.length) {
    for (let i = 0; i < x.length; ++i) {
      if (x[i] !== y[i]) {
        return false;
      }
    }

    return true;
  }

  return false;
}
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/gltools/dist/esm/utils/webgl-checks.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@luma.gl/gltools/dist/esm/utils/webgl-checks.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ERR_WEBGL": () => (/* binding */ ERR_WEBGL),
/* harmony export */   "ERR_WEBGL2": () => (/* binding */ ERR_WEBGL2),
/* harmony export */   "isWebGL": () => (/* binding */ isWebGL),
/* harmony export */   "isWebGL2": () => (/* binding */ isWebGL2),
/* harmony export */   "getWebGL2Context": () => (/* binding */ getWebGL2Context),
/* harmony export */   "assertWebGLContext": () => (/* binding */ assertWebGLContext),
/* harmony export */   "assertWebGL2Context": () => (/* binding */ assertWebGL2Context)
/* harmony export */ });
/* harmony import */ var _assert__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./assert */ "./node_modules/@luma.gl/gltools/dist/esm/utils/assert.js");

const ERR_CONTEXT = 'Invalid WebGLRenderingContext';
const ERR_WEBGL = ERR_CONTEXT;
const ERR_WEBGL2 = 'Requires WebGL2';
function isWebGL(gl) {
  if (typeof WebGLRenderingContext !== 'undefined' && gl instanceof WebGLRenderingContext) {
    return true;
  }

  if (typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext) {
    return true;
  }

  return Boolean(gl && Number.isFinite(gl._version));
}
function isWebGL2(gl) {
  if (typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext) {
    return true;
  }

  return Boolean(gl && gl._version === 2);
}
function getWebGL2Context(gl) {
  return isWebGL2(gl) ? gl : null;
}
function assertWebGLContext(gl) {
  (0,_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(isWebGL(gl), ERR_CONTEXT);
  return gl;
}
function assertWebGL2Context(gl) {
  (0,_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(isWebGL2(gl), ERR_WEBGL2);
  return gl;
}
//# sourceMappingURL=webgl-checks.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/lib/assemble-shaders.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/lib/assemble-shaders.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "assembleShaders": () => (/* binding */ assembleShaders)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./constants */ "./node_modules/@luma.gl/shadertools/dist/esm/lib/constants.js");
/* harmony import */ var _resolve_modules__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./resolve-modules */ "./node_modules/@luma.gl/shadertools/dist/esm/lib/resolve-modules.js");
/* harmony import */ var _platform_defines__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./platform-defines */ "./node_modules/@luma.gl/shadertools/dist/esm/lib/platform-defines.js");
/* harmony import */ var _inject_shader__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./inject-shader */ "./node_modules/@luma.gl/shadertools/dist/esm/lib/inject-shader.js");
/* harmony import */ var _transpile_shader__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./transpile-shader */ "./node_modules/@luma.gl/shadertools/dist/esm/lib/transpile-shader.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils */ "./node_modules/@luma.gl/shadertools/dist/esm/utils/assert.js");






const INJECT_SHADER_DECLARATIONS = `\n\n${_inject_shader__WEBPACK_IMPORTED_MODULE_0__.DECLARATION_INJECT_MARKER}\n\n`;
const SHADER_TYPE = {
  [_constants__WEBPACK_IMPORTED_MODULE_1__.VERTEX_SHADER]: 'vertex',
  [_constants__WEBPACK_IMPORTED_MODULE_1__.FRAGMENT_SHADER]: 'fragment'
};
const FRAGMENT_SHADER_PROLOGUE = `\
precision highp float;

`;
function assembleShaders(gl, opts) {
  const {
    vs,
    fs
  } = opts;
  const modules = (0,_resolve_modules__WEBPACK_IMPORTED_MODULE_2__.resolveModules)(opts.modules || []);
  return {
    gl,
    vs: assembleShader(gl, Object.assign({}, opts, {
      source: vs,
      type: _constants__WEBPACK_IMPORTED_MODULE_1__.VERTEX_SHADER,
      modules
    })),
    fs: assembleShader(gl, Object.assign({}, opts, {
      source: fs,
      type: _constants__WEBPACK_IMPORTED_MODULE_1__.FRAGMENT_SHADER,
      modules
    })),
    getUniforms: assembleGetUniforms(modules)
  };
}

function assembleShader(gl, {
  id,
  source,
  type,
  modules,
  defines = {},
  hookFunctions = [],
  inject = {},
  transpileToGLSL100 = false,
  prologue = true,
  log
}) {
  (0,_utils__WEBPACK_IMPORTED_MODULE_3__["default"])(typeof source === 'string', 'shader source must be a string');
  const isVertex = type === _constants__WEBPACK_IMPORTED_MODULE_1__.VERTEX_SHADER;
  const sourceLines = source.split('\n');
  let glslVersion = 100;
  let versionLine = '';
  let coreSource = source;

  if (sourceLines[0].indexOf('#version ') === 0) {
    glslVersion = 300;
    versionLine = sourceLines[0];
    coreSource = sourceLines.slice(1).join('\n');
  } else {
    versionLine = `#version ${glslVersion}`;
  }

  const allDefines = {};
  modules.forEach(module => {
    Object.assign(allDefines, module.getDefines());
  });
  Object.assign(allDefines, defines);
  let assembledSource = prologue ? `\
${versionLine}
${getShaderName({
    id,
    source,
    type
  })}
${getShaderType({
    type
  })}
${(0,_platform_defines__WEBPACK_IMPORTED_MODULE_4__.getPlatformShaderDefines)(gl)}
${(0,_platform_defines__WEBPACK_IMPORTED_MODULE_4__.getVersionDefines)(gl, glslVersion, !isVertex)}
${getApplicationDefines(allDefines)}
${isVertex ? '' : FRAGMENT_SHADER_PROLOGUE}
` : `${versionLine}
`;
  const hookFunctionMap = normalizeHookFunctions(hookFunctions);
  const hookInjections = {};
  const declInjections = {};
  const mainInjections = {};

  for (const key in inject) {
    const injection = typeof inject[key] === 'string' ? {
      injection: inject[key],
      order: 0
    } : inject[key];
    const match = key.match(/^(v|f)s:(#)?([\w-]+)$/);

    if (match) {
      const hash = match[2];
      const name = match[3];

      if (hash) {
        if (name === 'decl') {
          declInjections[key] = [injection];
        } else {
          mainInjections[key] = [injection];
        }
      } else {
        hookInjections[key] = [injection];
      }
    } else {
      mainInjections[key] = [injection];
    }
  }

  for (const module of modules) {
    if (log) {
      module.checkDeprecations(coreSource, log);
    }

    const moduleSource = module.getModuleSource(type, glslVersion);
    assembledSource += moduleSource;
    const injections = module.injections[type];

    for (const key in injections) {
      const match = key.match(/^(v|f)s:#([\w-]+)$/);

      if (match) {
        const name = match[2];
        const injectionType = name === 'decl' ? declInjections : mainInjections;
        injectionType[key] = injectionType[key] || [];
        injectionType[key].push(injections[key]);
      } else {
        hookInjections[key] = hookInjections[key] || [];
        hookInjections[key].push(injections[key]);
      }
    }
  }

  assembledSource += INJECT_SHADER_DECLARATIONS;
  assembledSource = (0,_inject_shader__WEBPACK_IMPORTED_MODULE_0__["default"])(assembledSource, type, declInjections);
  assembledSource += getHookFunctions(hookFunctionMap[type], hookInjections);
  assembledSource += coreSource;
  assembledSource = (0,_inject_shader__WEBPACK_IMPORTED_MODULE_0__["default"])(assembledSource, type, mainInjections);
  assembledSource = (0,_transpile_shader__WEBPACK_IMPORTED_MODULE_5__["default"])(assembledSource, transpileToGLSL100 ? 100 : glslVersion, isVertex);
  return assembledSource;
}

function assembleGetUniforms(modules) {
  return function getUniforms(opts) {
    const uniforms = {};

    for (const module of modules) {
      const moduleUniforms = module.getUniforms(opts, uniforms);
      Object.assign(uniforms, moduleUniforms);
    }

    return uniforms;
  };
}

function getShaderType({
  type
}) {
  return `
#define SHADER_TYPE_${SHADER_TYPE[type].toUpperCase()}
`;
}

function getShaderName({
  id,
  source,
  type
}) {
  const injectShaderName = id && typeof id === 'string' && source.indexOf('SHADER_NAME') === -1;
  return injectShaderName ? `
#define SHADER_NAME ${id}_${SHADER_TYPE[type]}

` : '';
}

function getApplicationDefines(defines = {}) {
  let count = 0;
  let sourceText = '';

  for (const define in defines) {
    if (count === 0) {
      sourceText += '\n// APPLICATION DEFINES\n';
    }

    count++;
    const value = defines[define];

    if (value || Number.isFinite(value)) {
      sourceText += `#define ${define.toUpperCase()} ${defines[define]}\n`;
    }
  }

  if (count === 0) {
    sourceText += '\n';
  }

  return sourceText;
}

function getHookFunctions(hookFunctions, hookInjections) {
  let result = '';

  for (const hookName in hookFunctions) {
    const hookFunction = hookFunctions[hookName];
    result += `void ${hookFunction.signature} {\n`;

    if (hookFunction.header) {
      result += `  ${hookFunction.header}`;
    }

    if (hookInjections[hookName]) {
      const injections = hookInjections[hookName];
      injections.sort((a, b) => a.order - b.order);

      for (const injection of injections) {
        result += `  ${injection.injection}\n`;
      }
    }

    if (hookFunction.footer) {
      result += `  ${hookFunction.footer}`;
    }

    result += '}\n';
  }

  return result;
}

function normalizeHookFunctions(hookFunctions) {
  const result = {
    vs: {},
    fs: {}
  };
  hookFunctions.forEach(hook => {
    let opts;

    if (typeof hook !== 'string') {
      opts = hook;
      hook = opts.hook;
    } else {
      opts = {};
    }

    hook = hook.trim();
    const [stage, signature] = hook.split(':');
    const name = hook.replace(/\(.+/, '');
    result[stage][name] = Object.assign(opts, {
      signature
    });
  });
  return result;
}
//# sourceMappingURL=assemble-shaders.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/lib/constants.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/lib/constants.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "VERTEX_SHADER": () => (/* binding */ VERTEX_SHADER),
/* harmony export */   "FRAGMENT_SHADER": () => (/* binding */ FRAGMENT_SHADER)
/* harmony export */ });
const VERTEX_SHADER = 'vs';
const FRAGMENT_SHADER = 'fs';
//# sourceMappingURL=constants.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/lib/filters/prop-types.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/lib/filters/prop-types.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "parsePropTypes": () => (/* binding */ parsePropTypes)
/* harmony export */ });
const TYPE_DEFINITIONS = {
  number: {
    validate(value, propType) {
      return Number.isFinite(value) && (!('max' in propType) || value <= propType.max) && (!('min' in propType) || value >= propType.min);
    }

  },
  array: {
    validate(value, propType) {
      return Array.isArray(value) || ArrayBuffer.isView(value);
    }

  }
};
function parsePropTypes(propDefs) {
  const propTypes = {};

  for (const propName in propDefs) {
    const propDef = propDefs[propName];
    const propType = parsePropType(propDef);
    propTypes[propName] = propType;
  }

  return propTypes;
}

function parsePropType(propDef) {
  let type = getTypeOf(propDef);

  if (type === 'object') {
    if (!propDef) {
      return {
        type: 'object',
        value: null
      };
    }

    if ('type' in propDef) {
      return Object.assign({}, propDef, TYPE_DEFINITIONS[propDef.type]);
    }

    if (!('value' in propDef)) {
      return {
        type: 'object',
        value: propDef
      };
    }

    type = getTypeOf(propDef.value);
    return Object.assign({
      type
    }, propDef, TYPE_DEFINITIONS[type]);
  }

  return Object.assign({
    type,
    value: propDef
  }, TYPE_DEFINITIONS[type]);
}

function getTypeOf(value) {
  if (Array.isArray(value) || ArrayBuffer.isView(value)) {
    return 'array';
  }

  return typeof value;
}
//# sourceMappingURL=prop-types.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/lib/inject-shader.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/lib/inject-shader.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DECLARATION_INJECT_MARKER": () => (/* binding */ DECLARATION_INJECT_MARKER),
/* harmony export */   "default": () => (/* binding */ injectShader),
/* harmony export */   "combineInjects": () => (/* binding */ combineInjects)
/* harmony export */ });
/* harmony import */ var _modules_module_injectors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../modules/module-injectors */ "./node_modules/@luma.gl/shadertools/dist/esm/modules/module-injectors.js");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./node_modules/@luma.gl/shadertools/dist/esm/lib/constants.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils */ "./node_modules/@luma.gl/shadertools/dist/esm/utils/assert.js");



const MODULE_INJECTORS = {
  [_constants__WEBPACK_IMPORTED_MODULE_0__.VERTEX_SHADER]: _modules_module_injectors__WEBPACK_IMPORTED_MODULE_1__.MODULE_INJECTORS_VS,
  [_constants__WEBPACK_IMPORTED_MODULE_0__.FRAGMENT_SHADER]: _modules_module_injectors__WEBPACK_IMPORTED_MODULE_1__.MODULE_INJECTORS_FS
};
const DECLARATION_INJECT_MARKER = '__LUMA_INJECT_DECLARATIONS__';
const REGEX_START_OF_MAIN = /void\s+main\s*\([^)]*\)\s*\{\n?/;
const REGEX_END_OF_MAIN = /}\n?[^{}]*$/;
const fragments = [];
function injectShader(source, type, inject, injectStandardStubs = false) {
  const isVertex = type === _constants__WEBPACK_IMPORTED_MODULE_0__.VERTEX_SHADER;

  for (const key in inject) {
    const fragmentData = inject[key];
    fragmentData.sort((a, b) => a.order - b.order);
    fragments.length = fragmentData.length;

    for (let i = 0, len = fragmentData.length; i < len; ++i) {
      fragments[i] = fragmentData[i].injection;
    }

    const fragmentString = `${fragments.join('\n')}\n`;

    switch (key) {
      case 'vs:#decl':
        if (isVertex) {
          source = source.replace(DECLARATION_INJECT_MARKER, fragmentString);
        }

        break;

      case 'vs:#main-start':
        if (isVertex) {
          source = source.replace(REGEX_START_OF_MAIN, match => match + fragmentString);
        }

        break;

      case 'vs:#main-end':
        if (isVertex) {
          source = source.replace(REGEX_END_OF_MAIN, match => fragmentString + match);
        }

        break;

      case 'fs:#decl':
        if (!isVertex) {
          source = source.replace(DECLARATION_INJECT_MARKER, fragmentString);
        }

        break;

      case 'fs:#main-start':
        if (!isVertex) {
          source = source.replace(REGEX_START_OF_MAIN, match => match + fragmentString);
        }

        break;

      case 'fs:#main-end':
        if (!isVertex) {
          source = source.replace(REGEX_END_OF_MAIN, match => fragmentString + match);
        }

        break;

      default:
        source = source.replace(key, match => match + fragmentString);
    }
  }

  source = source.replace(DECLARATION_INJECT_MARKER, '');

  if (injectStandardStubs) {
    source = source.replace(/\}\s*$/, match => match + MODULE_INJECTORS[type]);
  }

  return source;
}
function combineInjects(injects) {
  const result = {};
  (0,_utils__WEBPACK_IMPORTED_MODULE_2__["default"])(Array.isArray(injects) && injects.length > 1);
  injects.forEach(inject => {
    for (const key in inject) {
      result[key] = result[key] ? `${result[key]}\n${inject[key]}` : inject[key];
    }
  });
  return result;
}
//# sourceMappingURL=inject-shader.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/lib/platform-defines.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/lib/platform-defines.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getPlatformShaderDefines": () => (/* binding */ getPlatformShaderDefines),
/* harmony export */   "getVersionDefines": () => (/* binding */ getVersionDefines)
/* harmony export */ });
/* harmony import */ var _utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/webgl-info */ "./node_modules/@luma.gl/shadertools/dist/esm/utils/webgl-info.js");

function getPlatformShaderDefines(gl) {
  const debugInfo = (0,_utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.getContextInfo)(gl);

  switch (debugInfo.gpuVendor.toLowerCase()) {
    case 'nvidia':
      return `\
#define NVIDIA_GPU
// Nvidia optimizes away the calculation necessary for emulated fp64
#define LUMA_FP64_CODE_ELIMINATION_WORKAROUND 1
`;

    case 'intel':
      return `\
#define INTEL_GPU
// Intel optimizes away the calculation necessary for emulated fp64
#define LUMA_FP64_CODE_ELIMINATION_WORKAROUND 1
// Intel's built-in 'tan' function doesn't have acceptable precision
#define LUMA_FP32_TAN_PRECISION_WORKAROUND 1
// Intel GPU doesn't have full 32 bits precision in same cases, causes overflow
#define LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND 1
`;

    case 'amd':
      return `\
#define AMD_GPU
`;

    default:
      return `\
#define DEFAULT_GPU
// Prevent driver from optimizing away the calculation necessary for emulated fp64
#define LUMA_FP64_CODE_ELIMINATION_WORKAROUND 1
// Intel's built-in 'tan' function doesn't have acceptable precision
#define LUMA_FP32_TAN_PRECISION_WORKAROUND 1
// Intel GPU doesn't have full 32 bits precision in same cases, causes overflow
#define LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND 1
`;
  }
}
function getVersionDefines(gl, glslVersion, isFragment) {
  let versionDefines = `\
#if (__VERSION__ > 120)

# define FEATURE_GLSL_DERIVATIVES
# define FEATURE_GLSL_DRAW_BUFFERS
# define FEATURE_GLSL_FRAG_DEPTH
# define FEATURE_GLSL_TEXTURE_LOD

// DEPRECATED FLAGS, remove in v9
# define FRAG_DEPTH
# define DERIVATIVES
# define DRAW_BUFFERS
# define TEXTURE_LOD

#endif // __VERSION
`;

  if ((0,_utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.hasFeatures)(gl, _utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.FEATURES.GLSL_FRAG_DEPTH)) {
    versionDefines += `\

// FRAG_DEPTH => gl_FragDepth is available
#ifdef GL_EXT_frag_depth
#extension GL_EXT_frag_depth : enable
# define FEATURE_GLSL_FRAG_DEPTH
# define FRAG_DEPTH
# define gl_FragDepth gl_FragDepthEXT
#endif
`;
  }

  if ((0,_utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.hasFeatures)(gl, _utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.FEATURES.GLSL_DERIVATIVES) && (0,_utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.canCompileGLGSExtension)(gl, _utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.FEATURES.GLSL_DERIVATIVES)) {
    versionDefines += `\

// DERIVATIVES => dxdF, dxdY and fwidth are available
#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
# define FEATURE_GLSL_DERIVATIVES
# define DERIVATIVES
#endif
`;
  }

  if ((0,_utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.hasFeatures)(gl, _utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.FEATURES.GLSL_FRAG_DATA) && (0,_utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.canCompileGLGSExtension)(gl, _utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.FEATURES.GLSL_FRAG_DATA, {
    behavior: 'require'
  })) {
    versionDefines += `\

// DRAW_BUFFERS => gl_FragData[] is available
#ifdef GL_EXT_draw_buffers
#extension GL_EXT_draw_buffers : require
#define FEATURE_GLSL_DRAW_BUFFERS
#define DRAW_BUFFERS
#endif
`;
  }

  if ((0,_utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.hasFeatures)(gl, _utils_webgl_info__WEBPACK_IMPORTED_MODULE_0__.FEATURES.GLSL_TEXTURE_LOD)) {
    versionDefines += `\
// TEXTURE_LOD => texture2DLod etc are available
#ifdef GL_EXT_shader_texture_lod
#extension GL_EXT_shader_texture_lod : enable

# define FEATURE_GLSL_TEXTURE_LOD
# define TEXTURE_LOD

#endif
`;
  }

  return versionDefines;
}
//# sourceMappingURL=platform-defines.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/lib/resolve-modules.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/lib/resolve-modules.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "resolveModules": () => (/* binding */ resolveModules),
/* harmony export */   "TEST_EXPORTS": () => (/* binding */ TEST_EXPORTS)
/* harmony export */ });
/* harmony import */ var _shader_module__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./shader-module */ "./node_modules/@luma.gl/shadertools/dist/esm/lib/shader-module.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "./node_modules/@luma.gl/shadertools/dist/esm/utils/assert.js");


function resolveModules(modules) {
  return getShaderDependencies(instantiateModules(modules));
}

function getShaderDependencies(modules) {
  const moduleMap = {};
  const moduleDepth = {};
  getDependencyGraph({
    modules,
    level: 0,
    moduleMap,
    moduleDepth
  });
  return Object.keys(moduleDepth).sort((a, b) => moduleDepth[b] - moduleDepth[a]).map(name => moduleMap[name]);
}

function getDependencyGraph({
  modules,
  level,
  moduleMap,
  moduleDepth
}) {
  if (level >= 5) {
    throw new Error('Possible loop in shader dependency graph');
  }

  for (const module of modules) {
    moduleMap[module.name] = module;

    if (moduleDepth[module.name] === undefined || moduleDepth[module.name] < level) {
      moduleDepth[module.name] = level;
    }
  }

  for (const module of modules) {
    if (module.dependencies) {
      getDependencyGraph({
        modules: module.dependencies,
        level: level + 1,
        moduleMap,
        moduleDepth
      });
    }
  }
}

function instantiateModules(modules, seen) {
  return modules.map(module => {
    if (module instanceof _shader_module__WEBPACK_IMPORTED_MODULE_0__["default"]) {
      return module;
    }

    (0,_utils__WEBPACK_IMPORTED_MODULE_1__["default"])(typeof module !== 'string', `Shader module use by name is deprecated. Import shader module '${module}' and use it directly.`);
    (0,_utils__WEBPACK_IMPORTED_MODULE_1__["default"])(module.name, 'shader module has no name');
    module = new _shader_module__WEBPACK_IMPORTED_MODULE_0__["default"](module);
    module.dependencies = instantiateModules(module.dependencies);
    return module;
  });
}

const TEST_EXPORTS = {
  getShaderDependencies,
  getDependencyGraph
};
//# sourceMappingURL=resolve-modules.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/lib/shader-module.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/lib/shader-module.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ShaderModule),
/* harmony export */   "normalizeShaderModule": () => (/* binding */ normalizeShaderModule)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./node_modules/@luma.gl/shadertools/dist/esm/utils/assert.js");
/* harmony import */ var _filters_prop_types__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./filters/prop-types */ "./node_modules/@luma.gl/shadertools/dist/esm/lib/filters/prop-types.js");


const VERTEX_SHADER = 'vs';
const FRAGMENT_SHADER = 'fs';
class ShaderModule {
  constructor({
    name,
    vs,
    fs,
    dependencies = [],
    uniforms,
    getUniforms,
    deprecations = [],
    defines = {},
    inject = {},
    vertexShader,
    fragmentShader
  }) {
    (0,_utils__WEBPACK_IMPORTED_MODULE_0__["default"])(typeof name === 'string');
    this.name = name;
    this.vs = vs || vertexShader;
    this.fs = fs || fragmentShader;
    this.getModuleUniforms = getUniforms;
    this.dependencies = dependencies;
    this.deprecations = this._parseDeprecationDefinitions(deprecations);
    this.defines = defines;
    this.injections = normalizeInjections(inject);

    if (uniforms) {
      this.uniforms = (0,_filters_prop_types__WEBPACK_IMPORTED_MODULE_1__.parsePropTypes)(uniforms);
    }
  }

  getModuleSource(type) {
    let moduleSource;

    switch (type) {
      case VERTEX_SHADER:
        moduleSource = this.vs || '';
        break;

      case FRAGMENT_SHADER:
        moduleSource = this.fs || '';
        break;

      default:
        (0,_utils__WEBPACK_IMPORTED_MODULE_0__["default"])(false);
    }

    return `\
#define MODULE_${this.name.toUpperCase().replace(/[^0-9a-z]/gi, '_')}
${moduleSource}\
// END MODULE_${this.name}

`;
  }

  getUniforms(opts, uniforms) {
    if (this.getModuleUniforms) {
      return this.getModuleUniforms(opts, uniforms);
    }

    if (this.uniforms) {
      return this._defaultGetUniforms(opts);
    }

    return {};
  }

  getDefines() {
    return this.defines;
  }

  checkDeprecations(shaderSource, log) {
    this.deprecations.forEach(def => {
      if (def.regex.test(shaderSource)) {
        if (def.deprecated) {
          log.deprecated(def.old, def.new)();
        } else {
          log.removed(def.old, def.new)();
        }
      }
    });
  }

  _parseDeprecationDefinitions(deprecations) {
    deprecations.forEach(def => {
      switch (def.type) {
        case 'function':
          def.regex = new RegExp(`\\b${def.old}\\(`);
          break;

        default:
          def.regex = new RegExp(`${def.type} ${def.old};`);
      }
    });
    return deprecations;
  }

  _defaultGetUniforms(opts = {}) {
    const uniforms = {};
    const propTypes = this.uniforms;

    for (const key in propTypes) {
      const propDef = propTypes[key];

      if (key in opts && !propDef.private) {
        if (propDef.validate) {
          (0,_utils__WEBPACK_IMPORTED_MODULE_0__["default"])(propDef.validate(opts[key], propDef), `${this.name}: invalid ${key}`);
        }

        uniforms[key] = opts[key];
      } else {
        uniforms[key] = propDef.value;
      }
    }

    return uniforms;
  }

}
function normalizeShaderModule(module) {
  if (!module.normalized) {
    module.normalized = true;

    if (module.uniforms && !module.getUniforms) {
      const shaderModule = new ShaderModule(module);
      module.getUniforms = shaderModule.getUniforms.bind(shaderModule);
    }
  }

  return module;
}

function normalizeInjections(injections) {
  const result = {
    vs: {},
    fs: {}
  };

  for (const hook in injections) {
    let injection = injections[hook];
    const stage = hook.slice(0, 2);

    if (typeof injection === 'string') {
      injection = {
        order: 0,
        injection
      };
    }

    result[stage][hook] = injection;
  }

  return result;
}
//# sourceMappingURL=shader-module.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/lib/transpile-shader.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/lib/transpile-shader.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ transpileShader)
/* harmony export */ });
function testVariable(qualifier) {
  return new RegExp(`\\b${qualifier}[ \\t]+(\\w+[ \\t]+\\w+(\\[\\w+\\])?;)`, 'g');
}

const ES300_REPLACEMENTS = [[/^(#version[ \t]+(100|300[ \t]+es))?[ \t]*\n/, '#version 300 es\n'], [/\btexture(2D|2DProj|Cube)Lod(EXT)?\(/g, 'textureLod('], [/\btexture(2D|2DProj|Cube)(EXT)?\(/g, 'texture(']];
const ES300_VERTEX_REPLACEMENTS = [...ES300_REPLACEMENTS, [testVariable('attribute'), 'in $1'], [testVariable('varying'), 'out $1']];
const ES300_FRAGMENT_REPLACEMENTS = [...ES300_REPLACEMENTS, [testVariable('varying'), 'in $1']];
const ES100_REPLACEMENTS = [[/^#version[ \t]+300[ \t]+es/, '#version 100'], [/\btexture(2D|2DProj|Cube)Lod\(/g, 'texture$1LodEXT('], [/\btexture\(/g, 'texture2D('], [/\btextureLod\(/g, 'texture2DLodEXT(']];
const ES100_VERTEX_REPLACEMENTS = [...ES100_REPLACEMENTS, [testVariable('in'), 'attribute $1'], [testVariable('out'), 'varying $1']];
const ES100_FRAGMENT_REPLACEMENTS = [...ES100_REPLACEMENTS, [testVariable('in'), 'varying $1']];
const ES100_FRAGMENT_OUTPUT_NAME = 'gl_FragColor';
const ES300_FRAGMENT_OUTPUT_REGEX = /\bout[ \t]+vec4[ \t]+(\w+)[ \t]*;\n?/;
const REGEX_START_OF_MAIN = /void\s+main\s*\([^)]*\)\s*\{\n?/;
function transpileShader(source, targetGLSLVersion, isVertex) {
  switch (targetGLSLVersion) {
    case 300:
      return isVertex ? convertShader(source, ES300_VERTEX_REPLACEMENTS) : convertFragmentShaderTo300(source);

    case 100:
      return isVertex ? convertShader(source, ES100_VERTEX_REPLACEMENTS) : convertFragmentShaderTo100(source);

    default:
      throw new Error(`unknown GLSL version ${targetGLSLVersion}`);
  }
}

function convertShader(source, replacements) {
  for (const [pattern, replacement] of replacements) {
    source = source.replace(pattern, replacement);
  }

  return source;
}

function convertFragmentShaderTo300(source) {
  source = convertShader(source, ES300_FRAGMENT_REPLACEMENTS);
  const outputMatch = source.match(ES300_FRAGMENT_OUTPUT_REGEX);

  if (outputMatch) {
    const outputName = outputMatch[1];
    source = source.replace(new RegExp(`\\b${ES100_FRAGMENT_OUTPUT_NAME}\\b`, 'g'), outputName);
  } else {
    const outputName = 'fragmentColor';
    source = source.replace(REGEX_START_OF_MAIN, match => `out vec4 ${outputName};\n${match}`).replace(new RegExp(`\\b${ES100_FRAGMENT_OUTPUT_NAME}\\b`, 'g'), outputName);
  }

  return source;
}

function convertFragmentShaderTo100(source) {
  source = convertShader(source, ES100_FRAGMENT_REPLACEMENTS);
  const outputMatch = source.match(ES300_FRAGMENT_OUTPUT_REGEX);

  if (outputMatch) {
    const outputName = outputMatch[1];
    source = source.replace(ES300_FRAGMENT_OUTPUT_REGEX, '').replace(new RegExp(`\\b${outputName}\\b`, 'g'), ES100_FRAGMENT_OUTPUT_NAME);
  }

  return source;
}
//# sourceMappingURL=transpile-shader.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/modules/module-injectors.js":
/*!********************************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/modules/module-injectors.js ***!
  \********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "MODULE_INJECTORS_VS": () => (/* binding */ MODULE_INJECTORS_VS),
/* harmony export */   "MODULE_INJECTORS_FS": () => (/* binding */ MODULE_INJECTORS_FS)
/* harmony export */ });
const MODULE_INJECTORS_VS = `\
#ifdef MODULE_LOGDEPTH
  logdepth_adjustPosition(gl_Position);
#endif
`;
const MODULE_INJECTORS_FS = `\
#ifdef MODULE_MATERIAL
  gl_FragColor = material_filterColor(gl_FragColor);
#endif

#ifdef MODULE_LIGHTING
  gl_FragColor = lighting_filterColor(gl_FragColor);
#endif

#ifdef MODULE_FOG
  gl_FragColor = fog_filterColor(gl_FragColor);
#endif

#ifdef MODULE_PICKING
  gl_FragColor = picking_filterHighlightColor(gl_FragColor);
  gl_FragColor = picking_filterPickingColor(gl_FragColor);
#endif

#ifdef MODULE_LOGDEPTH
  logdepth_setFragDepth();
#endif
`;
//# sourceMappingURL=module-injectors.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/utils/assert.js":
/*!********************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/utils/assert.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ assert)
/* harmony export */ });
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'shadertools: assertion failed.');
  }
}
//# sourceMappingURL=assert.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/utils/is-old-ie.js":
/*!***********************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/utils/is-old-ie.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ isOldIE)
/* harmony export */ });
function isOldIE(opts = {}) {
  const navigator = typeof window !== 'undefined' ? window.navigator || {} : {};
  const userAgent = opts.userAgent || navigator.userAgent || '';
  const isMSIE = userAgent.indexOf('MSIE ') !== -1;
  const isTrident = userAgent.indexOf('Trident/') !== -1;
  return isMSIE || isTrident;
}
//# sourceMappingURL=is-old-ie.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/shadertools/dist/esm/utils/webgl-info.js":
/*!************************************************************************!*\
  !*** ./node_modules/@luma.gl/shadertools/dist/esm/utils/webgl-info.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "FEATURES": () => (/* binding */ FEATURES),
/* harmony export */   "getContextInfo": () => (/* binding */ getContextInfo),
/* harmony export */   "canCompileGLGSExtension": () => (/* binding */ canCompileGLGSExtension),
/* harmony export */   "hasFeatures": () => (/* binding */ hasFeatures)
/* harmony export */ });
/* harmony import */ var _is_old_ie__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./is-old-ie */ "./node_modules/@luma.gl/shadertools/dist/esm/utils/is-old-ie.js");
/* harmony import */ var _assert__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./assert */ "./node_modules/@luma.gl/shadertools/dist/esm/utils/assert.js");


const GL_VENDOR = 0x1f00;
const GL_RENDERER = 0x1f01;
const GL_VERSION = 0x1f02;
const GL_SHADING_LANGUAGE_VERSION = 0x8b8c;
const WEBGL_FEATURES = {
  GLSL_FRAG_DATA: ['WEBGL_draw_buffers', true],
  GLSL_FRAG_DEPTH: ['EXT_frag_depth', true],
  GLSL_DERIVATIVES: ['OES_standard_derivatives', true],
  GLSL_TEXTURE_LOD: ['EXT_shader_texture_lod', true]
};
const FEATURES = {};
Object.keys(WEBGL_FEATURES).forEach(key => {
  FEATURES[key] = key;
});


function isWebGL2(gl) {
  if (typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext) {
    return true;
  }

  return Boolean(gl && gl._version === 2);
}

function getContextInfo(gl) {
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  const vendor = gl.getParameter(info && info.UNMASKED_VENDOR_WEBGL || GL_VENDOR);
  const renderer = gl.getParameter(info && info.UNMASKED_RENDERER_WEBGL || GL_RENDERER);
  const gpuVendor = identifyGPUVendor(vendor, renderer);
  const gpuInfo = {
    gpuVendor,
    vendor,
    renderer,
    version: gl.getParameter(GL_VERSION),
    shadingLanguageVersion: gl.getParameter(GL_SHADING_LANGUAGE_VERSION)
  };
  return gpuInfo;
}

function identifyGPUVendor(vendor, renderer) {
  if (vendor.match(/NVIDIA/i) || renderer.match(/NVIDIA/i)) {
    return 'NVIDIA';
  }

  if (vendor.match(/INTEL/i) || renderer.match(/INTEL/i)) {
    return 'INTEL';
  }

  if (vendor.match(/AMD/i) || renderer.match(/AMD/i) || vendor.match(/ATI/i) || renderer.match(/ATI/i)) {
    return 'AMD';
  }

  return 'UNKNOWN GPU';
}

const compiledGlslExtensions = {};
function canCompileGLGSExtension(gl, cap, opts = {}) {
  const feature = WEBGL_FEATURES[cap];
  (0,_assert__WEBPACK_IMPORTED_MODULE_0__["default"])(feature, cap);

  if (!(0,_is_old_ie__WEBPACK_IMPORTED_MODULE_1__["default"])(opts)) {
    return true;
  }

  if (cap in compiledGlslExtensions) {
    return compiledGlslExtensions[cap];
  }

  const extensionName = feature[0];
  const behavior = opts.behavior || 'enable';
  const source = `#extension GL_${extensionName} : ${behavior}\nvoid main(void) {}`;
  const shader = gl.createShader(35633);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const canCompile = gl.getShaderParameter(shader, 35713);
  gl.deleteShader(shader);
  compiledGlslExtensions[cap] = canCompile;
  return canCompile;
}

function getFeature(gl, cap) {
  const feature = WEBGL_FEATURES[cap];
  (0,_assert__WEBPACK_IMPORTED_MODULE_0__["default"])(feature, cap);
  const extensionName = isWebGL2(gl) ? feature[1] || feature[0] : feature[0];
  const value = typeof extensionName === 'string' ? Boolean(gl.getExtension(extensionName)) : extensionName;
  (0,_assert__WEBPACK_IMPORTED_MODULE_0__["default"])(value === false || value === true);
  return value;
}

function hasFeatures(gl, features) {
  features = Array.isArray(features) ? features : [features];
  return features.every(feature => getFeature(gl, feature));
}
//# sourceMappingURL=webgl-info.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/accessor.js":
/*!******************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/accessor.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Accessor),
/* harmony export */   "DEFAULT_ACCESSOR_VALUES": () => (/* binding */ DEFAULT_ACCESSOR_VALUES)
/* harmony export */ });
/* harmony import */ var _webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../webgl-utils/typed-array-utils */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/typed-array-utils.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* harmony import */ var _utils_check_props__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/check-props */ "./node_modules/@luma.gl/webgl/dist/esm/utils/check-props.js");



const DEFAULT_ACCESSOR_VALUES = {
  offset: 0,
  stride: 0,
  type: 5126,
  size: 1,
  divisor: 0,
  normalized: false,
  integer: false
};
const PROP_CHECKS = {
  deprecatedProps: {
    instanced: 'divisor',
    isInstanced: 'divisor'
  }
};
class Accessor {
  static getBytesPerElement(accessor) {
    const ArrayType = (0,_webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_0__.getTypedArrayFromGLType)(accessor.type || 5126);
    return ArrayType.BYTES_PER_ELEMENT;
  }

  static getBytesPerVertex(accessor) {
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_1__.assert)(accessor.size);
    const ArrayType = (0,_webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_0__.getTypedArrayFromGLType)(accessor.type || 5126);
    return ArrayType.BYTES_PER_ELEMENT * accessor.size;
  }

  static resolve(...accessors) {
    return new Accessor(...[DEFAULT_ACCESSOR_VALUES, ...accessors]);
  }

  constructor(...accessors) {
    accessors.forEach(accessor => this._assign(accessor));
    Object.freeze(this);
  }

  toString() {
    return JSON.stringify(this);
  }

  get BYTES_PER_ELEMENT() {
    return Accessor.getBytesPerElement(this);
  }

  get BYTES_PER_VERTEX() {
    return Accessor.getBytesPerVertex(this);
  }

  _assign(props = {}) {
    props = (0,_utils_check_props__WEBPACK_IMPORTED_MODULE_2__.checkProps)('Accessor', props, PROP_CHECKS);

    if (props.type !== undefined) {
      this.type = props.type;

      if (props.type === 5124 || props.type === 5125) {
        this.integer = true;
      }
    }

    if (props.size !== undefined) {
      this.size = props.size;
    }

    if (props.offset !== undefined) {
      this.offset = props.offset;
    }

    if (props.stride !== undefined) {
      this.stride = props.stride;
    }

    if (props.normalized !== undefined) {
      this.normalized = props.normalized;
    }

    if (props.integer !== undefined) {
      this.integer = props.integer;
    }

    if (props.divisor !== undefined) {
      this.divisor = props.divisor;
    }

    if (props.buffer !== undefined) {
      this.buffer = props.buffer;
    }

    if (props.index !== undefined) {
      if (typeof props.index === 'boolean') {
        this.index = props.index ? 1 : 0;
      } else {
        this.index = props.index;
      }
    }

    if (props.instanced !== undefined) {
      this.divisor = props.instanced ? 1 : 0;
    }

    if (props.isInstanced !== undefined) {
      this.divisor = props.isInstanced ? 1 : 0;
    }

    return this;
  }

}

//# sourceMappingURL=accessor.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js":
/*!****************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Buffer)
/* harmony export */ });
/* harmony import */ var _resource__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./resource */ "./node_modules/@luma.gl/webgl/dist/esm/classes/resource.js");
/* harmony import */ var _accessor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./accessor */ "./node_modules/@luma.gl/webgl/dist/esm/classes/accessor.js");
/* harmony import */ var _webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../webgl-utils/typed-array-utils */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/typed-array-utils.js");
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* harmony import */ var _utils_check_props__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/check-props */ "./node_modules/@luma.gl/webgl/dist/esm/utils/check-props.js");






const DEBUG_DATA_LENGTH = 10;
const DEPRECATED_PROPS = {
  offset: 'accessor.offset',
  stride: 'accessor.stride',
  type: 'accessor.type',
  size: 'accessor.size',
  divisor: 'accessor.divisor',
  normalized: 'accessor.normalized',
  integer: 'accessor.integer',
  instanced: 'accessor.divisor',
  isInstanced: 'accessor.divisor'
};
const PROP_CHECKS_INITIALIZE = {
  removedProps: {},
  replacedProps: {
    bytes: 'byteLength'
  },
  deprecatedProps: DEPRECATED_PROPS
};
const PROP_CHECKS_SET_PROPS = {
  removedProps: DEPRECATED_PROPS
};
class Buffer extends _resource__WEBPACK_IMPORTED_MODULE_1__["default"] {
  constructor(gl, props = {}) {
    super(gl, props);
    this.stubRemovedMethods('Buffer', 'v6.0', ['layout', 'setLayout', 'getIndexedParameter']);
    this.target = props.target || (this.gl.webgl2 ? 36662 : 34962);
    this.initialize(props);
    Object.seal(this);
  }

  getElementCount(accessor = this.accessor) {
    return Math.round(this.byteLength / _accessor__WEBPACK_IMPORTED_MODULE_2__["default"].getBytesPerElement(accessor));
  }

  getVertexCount(accessor = this.accessor) {
    return Math.round(this.byteLength / _accessor__WEBPACK_IMPORTED_MODULE_2__["default"].getBytesPerVertex(accessor));
  }

  initialize(props = {}) {
    if (ArrayBuffer.isView(props)) {
      props = {
        data: props
      };
    }

    if (Number.isFinite(props)) {
      props = {
        byteLength: props
      };
    }

    props = (0,_utils_check_props__WEBPACK_IMPORTED_MODULE_3__.checkProps)('Buffer', props, PROP_CHECKS_INITIALIZE);
    this.usage = props.usage || 35044;
    this.debugData = null;
    this.setAccessor(Object.assign({}, props, props.accessor));

    if (props.data) {
      this._setData(props.data, props.offset, props.byteLength);
    } else {
      this._setByteLength(props.byteLength || 0);
    }

    return this;
  }

  setProps(props) {
    props = (0,_utils_check_props__WEBPACK_IMPORTED_MODULE_3__.checkProps)('Buffer', props, PROP_CHECKS_SET_PROPS);

    if ('accessor' in props) {
      this.setAccessor(props.accessor);
    }

    return this;
  }

  setAccessor(accessor) {
    accessor = Object.assign({}, accessor);
    delete accessor.buffer;
    this.accessor = new _accessor__WEBPACK_IMPORTED_MODULE_2__["default"](accessor);
    return this;
  }

  reallocate(byteLength) {
    if (byteLength > this.byteLength) {
      this._setByteLength(byteLength);

      return true;
    }

    this.bytesUsed = byteLength;
    return false;
  }

  setData(props) {
    return this.initialize(props);
  }

  subData(props) {
    if (ArrayBuffer.isView(props)) {
      props = {
        data: props
      };
    }

    const {
      data,
      offset = 0,
      srcOffset = 0
    } = props;
    const byteLength = props.byteLength || props.length;
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_4__.assert)(data);
    const target = this.gl.webgl2 ? 36663 : this.target;
    this.gl.bindBuffer(target, this.handle);

    if (srcOffset !== 0 || byteLength !== undefined) {
      (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(this.gl);
      this.gl.bufferSubData(this.target, offset, data, srcOffset, byteLength);
    } else {
      this.gl.bufferSubData(target, offset, data);
    }

    this.gl.bindBuffer(target, null);
    this.debugData = null;

    this._inferType(data);

    return this;
  }

  copyData({
    sourceBuffer,
    readOffset = 0,
    writeOffset = 0,
    size
  }) {
    const {
      gl
    } = this;
    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(gl);
    gl.bindBuffer(36662, sourceBuffer.handle);
    gl.bindBuffer(36663, this.handle);
    gl.copyBufferSubData(36662, 36663, readOffset, writeOffset, size);
    gl.bindBuffer(36662, null);
    gl.bindBuffer(36663, null);
    this.debugData = null;
    return this;
  }

  getData({
    dstData = null,
    srcByteOffset = 0,
    dstOffset = 0,
    length = 0
  } = {}) {
    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(this.gl);
    const ArrayType = (0,_webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_5__.getTypedArrayFromGLType)(this.accessor.type || 5126, {
      clamped: false
    });

    const sourceAvailableElementCount = this._getAvailableElementCount(srcByteOffset);

    const dstElementOffset = dstOffset;
    let dstAvailableElementCount;
    let dstElementCount;

    if (dstData) {
      dstElementCount = dstData.length;
      dstAvailableElementCount = dstElementCount - dstElementOffset;
    } else {
      dstAvailableElementCount = Math.min(sourceAvailableElementCount, length || sourceAvailableElementCount);
      dstElementCount = dstElementOffset + dstAvailableElementCount;
    }

    const copyElementCount = Math.min(sourceAvailableElementCount, dstAvailableElementCount);
    length = length || copyElementCount;
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_4__.assert)(length <= copyElementCount);
    dstData = dstData || new ArrayType(dstElementCount);
    this.gl.bindBuffer(36662, this.handle);
    this.gl.getBufferSubData(36662, srcByteOffset, dstData, dstOffset, length);
    this.gl.bindBuffer(36662, null);
    return dstData;
  }

  bind({
    target = this.target,
    index = this.accessor && this.accessor.index,
    offset = 0,
    size
  } = {}) {
    if (target === 35345 || target === 35982) {
      if (size !== undefined) {
        this.gl.bindBufferRange(target, index, this.handle, offset, size);
      } else {
        (0,_utils_assert__WEBPACK_IMPORTED_MODULE_4__.assert)(offset === 0);
        this.gl.bindBufferBase(target, index, this.handle);
      }
    } else {
      this.gl.bindBuffer(target, this.handle);
    }

    return this;
  }

  unbind({
    target = this.target,
    index = this.accessor && this.accessor.index
  } = {}) {
    const isIndexedBuffer = target === 35345 || target === 35982;

    if (isIndexedBuffer) {
      this.gl.bindBufferBase(target, index, null);
    } else {
      this.gl.bindBuffer(target, null);
    }

    return this;
  }

  getDebugData() {
    if (!this.debugData) {
      this.debugData = this.getData({
        length: Math.min(DEBUG_DATA_LENGTH, this.byteLength)
      });
      return {
        data: this.debugData,
        changed: true
      };
    }

    return {
      data: this.debugData,
      changed: false
    };
  }

  invalidateDebugData() {
    this.debugData = null;
  }

  _setData(data, offset = 0, byteLength = data.byteLength + offset) {
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_4__.assert)(ArrayBuffer.isView(data));

    this._trackDeallocatedMemory();

    const target = this._getTarget();

    this.gl.bindBuffer(target, this.handle);
    this.gl.bufferData(target, byteLength, this.usage);
    this.gl.bufferSubData(target, offset, data);
    this.gl.bindBuffer(target, null);
    this.debugData = data.slice(0, DEBUG_DATA_LENGTH);
    this.bytesUsed = byteLength;

    this._trackAllocatedMemory(byteLength);

    const type = (0,_webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_5__.getGLTypeFromTypedArray)(data);
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_4__.assert)(type);
    this.setAccessor(new _accessor__WEBPACK_IMPORTED_MODULE_2__["default"](this.accessor, {
      type
    }));
    return this;
  }

  _setByteLength(byteLength, usage = this.usage) {
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_4__.assert)(byteLength >= 0);

    this._trackDeallocatedMemory();

    let data = byteLength;

    if (byteLength === 0) {
      data = new Float32Array(0);
    }

    const target = this._getTarget();

    this.gl.bindBuffer(target, this.handle);
    this.gl.bufferData(target, data, usage);
    this.gl.bindBuffer(target, null);
    this.usage = usage;
    this.debugData = null;
    this.bytesUsed = byteLength;

    this._trackAllocatedMemory(byteLength);

    return this;
  }

  _getTarget() {
    return this.gl.webgl2 ? 36663 : this.target;
  }

  _getAvailableElementCount(srcByteOffset) {
    const ArrayType = (0,_webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_5__.getTypedArrayFromGLType)(this.accessor.type || 5126, {
      clamped: false
    });
    const sourceElementOffset = srcByteOffset / ArrayType.BYTES_PER_ELEMENT;
    return this.getElementCount() - sourceElementOffset;
  }

  _inferType(data) {
    if (!this.accessor.type) {
      this.setAccessor(new _accessor__WEBPACK_IMPORTED_MODULE_2__["default"](this.accessor, {
        type: (0,_webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_5__.getGLTypeFromTypedArray)(data)
      }));
    }
  }

  _createHandle() {
    return this.gl.createBuffer();
  }

  _deleteHandle() {
    this.gl.deleteBuffer(this.handle);

    this._trackDeallocatedMemory();
  }

  _getParameter(pname) {
    this.gl.bindBuffer(this.target, this.handle);
    const value = this.gl.getBufferParameter(this.target, pname);
    this.gl.bindBuffer(this.target, null);
    return value;
  }

  get type() {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.deprecated('Buffer.type', 'Buffer.accessor.type')();
    return this.accessor.type;
  }

  get bytes() {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.deprecated('Buffer.bytes', 'Buffer.byteLength')();
    return this.byteLength;
  }

  setByteLength(byteLength) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.deprecated('setByteLength', 'reallocate')();
    return this.reallocate(byteLength);
  }

  updateAccessor(opts) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.deprecated('updateAccessor(...)', 'setAccessor(new Accessor(buffer.accessor, ...)')();
    this.accessor = new _accessor__WEBPACK_IMPORTED_MODULE_2__["default"](this.accessor, opts);
    return this;
  }

}
//# sourceMappingURL=buffer.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/clear.js":
/*!***************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/clear.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "clear": () => (/* binding */ clear),
/* harmony export */   "clearBuffer": () => (/* binding */ clearBuffer)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");


const GL_DEPTH_BUFFER_BIT = 0x00000100;
const GL_STENCIL_BUFFER_BIT = 0x00000400;
const GL_COLOR_BUFFER_BIT = 0x00004000;
const GL_COLOR = 0x1800;
const GL_DEPTH = 0x1801;
const GL_STENCIL = 0x1802;
const GL_DEPTH_STENCIL = 0x84f9;
const ERR_ARGUMENTS = 'clear: bad arguments';
function clear(gl, {
  framebuffer = null,
  color = null,
  depth = null,
  stencil = null
} = {}) {
  const parameters = {};

  if (framebuffer) {
    parameters.framebuffer = framebuffer;
  }

  let clearFlags = 0;

  if (color) {
    clearFlags |= GL_COLOR_BUFFER_BIT;

    if (color !== true) {
      parameters.clearColor = color;
    }
  }

  if (depth) {
    clearFlags |= GL_DEPTH_BUFFER_BIT;

    if (depth !== true) {
      parameters.clearDepth = depth;
    }
  }

  if (stencil) {
    clearFlags |= GL_STENCIL_BUFFER_BIT;

    if (depth !== true) {
      parameters.clearStencil = depth;
    }
  }

  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_1__.assert)(clearFlags !== 0, ERR_ARGUMENTS);
  (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.withParameters)(gl, parameters, () => {
    gl.clear(clearFlags);
  });
}
function clearBuffer(gl, {
  framebuffer = null,
  buffer = GL_COLOR,
  drawBuffer = 0,
  value = [0, 0, 0, 0]
} = {}) {
  (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(gl);
  (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.withParameters)(gl, {
    framebuffer
  }, () => {
    switch (buffer) {
      case GL_COLOR:
        switch (value.constructor) {
          case Int32Array:
            gl.clearBufferiv(buffer, drawBuffer, value);
            break;

          case Uint32Array:
            gl.clearBufferuiv(buffer, drawBuffer, value);
            break;

          case Float32Array:
          default:
            gl.clearBufferfv(buffer, drawBuffer, value);
        }

        break;

      case GL_DEPTH:
        gl.clearBufferfv(GL_DEPTH, 0, [value]);
        break;

      case GL_STENCIL:
        gl.clearBufferiv(GL_STENCIL, 0, [value]);
        break;

      case GL_DEPTH_STENCIL:
        const [depth, stencil] = value;
        gl.clearBufferfi(GL_DEPTH_STENCIL, 0, depth, stencil);
        break;

      default:
        (0,_utils_assert__WEBPACK_IMPORTED_MODULE_1__.assert)(false, ERR_ARGUMENTS);
    }
  });
}
//# sourceMappingURL=clear.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/copy-and-blit.js":
/*!***********************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/copy-and-blit.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "readPixelsToArray": () => (/* binding */ readPixelsToArray),
/* harmony export */   "readPixelsToBuffer": () => (/* binding */ readPixelsToBuffer),
/* harmony export */   "copyToDataUrl": () => (/* binding */ copyToDataUrl),
/* harmony export */   "copyToImage": () => (/* binding */ copyToImage),
/* harmony export */   "copyToTexture": () => (/* binding */ copyToTexture),
/* harmony export */   "blit": () => (/* binding */ blit)
/* harmony export */ });
/* harmony import */ var _buffer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./buffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js");
/* harmony import */ var _framebuffer__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./framebuffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/framebuffer.js");
/* harmony import */ var _texture__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./texture */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture.js");
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../webgl-utils/typed-array-utils */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/typed-array-utils.js");
/* harmony import */ var _webgl_utils_format_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../webgl-utils/format-utils */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/format-utils.js");
/* harmony import */ var _webgl_utils_texture_utils__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../webgl-utils/texture-utils */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/texture-utils.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");









function readPixelsToArray(source, options = {}) {
  const {
    sourceX = 0,
    sourceY = 0,
    sourceFormat = 6408
  } = options;
  let {
    sourceAttachment = 36064,
    target = null,
    sourceWidth,
    sourceHeight,
    sourceType
  } = options;
  const {
    framebuffer,
    deleteFramebuffer
  } = getFramebuffer(source);
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_1__.assert)(framebuffer);
  const {
    gl,
    handle,
    attachments
  } = framebuffer;
  sourceWidth = sourceWidth || framebuffer.width;
  sourceHeight = sourceHeight || framebuffer.height;

  if (sourceAttachment === 36064 && handle === null) {
    sourceAttachment = 1028;
  }

  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_1__.assert)(attachments[sourceAttachment]);
  sourceType = sourceType || attachments[sourceAttachment].type;
  target = getPixelArray(target, sourceType, sourceFormat, sourceWidth, sourceHeight);
  sourceType = sourceType || (0,_webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_2__.getGLTypeFromTypedArray)(target);
  const prevHandle = gl.bindFramebuffer(36160, handle);
  gl.readPixels(sourceX, sourceY, sourceWidth, sourceHeight, sourceFormat, sourceType, target);
  gl.bindFramebuffer(36160, prevHandle || null);

  if (deleteFramebuffer) {
    framebuffer.delete();
  }

  return target;
}
function readPixelsToBuffer(source, {
  sourceX = 0,
  sourceY = 0,
  sourceFormat = 6408,
  target = null,
  targetByteOffset = 0,
  sourceWidth,
  sourceHeight,
  sourceType
}) {
  const {
    framebuffer,
    deleteFramebuffer
  } = getFramebuffer(source);
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_1__.assert)(framebuffer);
  sourceWidth = sourceWidth || framebuffer.width;
  sourceHeight = sourceHeight || framebuffer.height;
  const gl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(framebuffer.gl);
  sourceType = sourceType || (target ? target.type : 5121);

  if (!target) {
    const components = (0,_webgl_utils_format_utils__WEBPACK_IMPORTED_MODULE_3__.glFormatToComponents)(sourceFormat);
    const byteCount = (0,_webgl_utils_format_utils__WEBPACK_IMPORTED_MODULE_3__.glTypeToBytes)(sourceType);
    const byteLength = targetByteOffset + sourceWidth * sourceHeight * components * byteCount;
    target = new _buffer__WEBPACK_IMPORTED_MODULE_4__["default"](gl2, {
      byteLength,
      accessor: {
        type: sourceType,
        size: components
      }
    });
  }

  target.bind({
    target: 35051
  });
  (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.withParameters)(gl2, {
    framebuffer
  }, () => {
    gl2.readPixels(sourceX, sourceY, sourceWidth, sourceHeight, sourceFormat, sourceType, targetByteOffset);
  });
  target.unbind({
    target: 35051
  });

  if (deleteFramebuffer) {
    framebuffer.delete();
  }

  return target;
}
function copyToDataUrl(source, {
  sourceAttachment = 36064,
  targetMaxHeight = Number.MAX_SAFE_INTEGER
} = {}) {
  let data = readPixelsToArray(source, {
    sourceAttachment
  });
  let {
    width,
    height
  } = source;

  while (height > targetMaxHeight) {
    ({
      data,
      width,
      height
    } = (0,_webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_2__.scalePixels)({
      data,
      width,
      height
    }));
  }

  (0,_webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_2__.flipRows)({
    data,
    width,
    height
  });
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  const imageData = context.createImageData(width, height);
  imageData.data.set(data);
  context.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
}
function copyToImage(source, {
  sourceAttachment = 36064,
  targetImage = null
} = {}) {
  const dataUrl = copyToDataUrl(source, {
    sourceAttachment
  });
  targetImage = targetImage || new Image();
  targetImage.src = dataUrl;
  return targetImage;
}
function copyToTexture(source, target, options = {}) {
  const {
    sourceX = 0,
    sourceY = 0,
    targetMipmaplevel = 0,
    targetInternalFormat = 6408
  } = options;
  let {
    targetX,
    targetY,
    targetZ,
    width,
    height
  } = options;
  const {
    framebuffer,
    deleteFramebuffer
  } = getFramebuffer(source);
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_1__.assert)(framebuffer);
  const {
    gl,
    handle
  } = framebuffer;
  const isSubCopy = typeof targetX !== 'undefined' || typeof targetY !== 'undefined' || typeof targetZ !== 'undefined';
  targetX = targetX || 0;
  targetY = targetY || 0;
  targetZ = targetZ || 0;
  const prevHandle = gl.bindFramebuffer(36160, handle);
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_1__.assert)(target);
  let texture = null;

  if (target instanceof _texture__WEBPACK_IMPORTED_MODULE_5__["default"]) {
    texture = target;
    width = Number.isFinite(width) ? width : texture.width;
    height = Number.isFinite(height) ? height : texture.height;
    texture.bind(0);
    target = texture.target;
  }

  if (!isSubCopy) {
    gl.copyTexImage2D(target, targetMipmaplevel, targetInternalFormat, sourceX, sourceY, width, height, 0);
  } else {
    switch (target) {
      case 3553:
      case 34067:
        gl.copyTexSubImage2D(target, targetMipmaplevel, targetX, targetY, sourceX, sourceY, width, height);
        break;

      case 35866:
      case 32879:
        const gl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(gl);
        gl2.copyTexSubImage3D(target, targetMipmaplevel, targetX, targetY, targetZ, sourceX, sourceY, width, height);
        break;

      default:
    }
  }

  if (texture) {
    texture.unbind();
  }

  gl.bindFramebuffer(36160, prevHandle || null);

  if (deleteFramebuffer) {
    framebuffer.delete();
  }

  return texture;
}
function blit(source, target, options = {}) {
  const {
    sourceX0 = 0,
    sourceY0 = 0,
    targetX0 = 0,
    targetY0 = 0,
    color = true,
    depth = false,
    stencil = false,
    filter = 9728
  } = options;
  let {
    sourceX1,
    sourceY1,
    targetX1,
    targetY1,
    sourceAttachment = 36064,
    mask = 0
  } = options;
  const {
    framebuffer: srcFramebuffer,
    deleteFramebuffer: deleteSrcFramebuffer
  } = getFramebuffer(source);
  const {
    framebuffer: dstFramebuffer,
    deleteFramebuffer: deleteDstFramebuffer
  } = getFramebuffer(target);
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_1__.assert)(srcFramebuffer);
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_1__.assert)(dstFramebuffer);
  const {
    gl,
    handle,
    width,
    height,
    readBuffer
  } = dstFramebuffer;
  const gl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(gl);

  if (!srcFramebuffer.handle && sourceAttachment === 36064) {
    sourceAttachment = 1028;
  }

  if (color) {
    mask |= 16384;
  }

  if (depth) {
    mask |= 256;
  }

  if (stencil) {
    mask |= 1024;
  }

  if (deleteSrcFramebuffer || deleteDstFramebuffer) {
    if (mask & (256 | 1024)) {
      mask = 16384;
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.warn('Blitting from or into a Texture object, forcing mask to GL.COLOR_BUFFER_BIT')();
    }
  }

  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_1__.assert)(mask);
  sourceX1 = sourceX1 === undefined ? srcFramebuffer.width : sourceX1;
  sourceY1 = sourceY1 === undefined ? srcFramebuffer.height : sourceY1;
  targetX1 = targetX1 === undefined ? width : targetX1;
  targetY1 = targetY1 === undefined ? height : targetY1;
  const prevDrawHandle = gl.bindFramebuffer(36009, handle);
  const prevReadHandle = gl.bindFramebuffer(36008, srcFramebuffer.handle);
  gl2.readBuffer(sourceAttachment);
  gl2.blitFramebuffer(sourceX0, sourceY0, sourceX1, sourceY1, targetX0, targetY0, targetX1, targetY1, mask, filter);
  gl2.readBuffer(readBuffer);
  gl2.bindFramebuffer(36008, prevReadHandle || null);
  gl2.bindFramebuffer(36009, prevDrawHandle || null);

  if (deleteSrcFramebuffer) {
    srcFramebuffer.delete();
  }

  if (deleteDstFramebuffer) {
    dstFramebuffer.delete();
  }

  return dstFramebuffer;
}

function getFramebuffer(source) {
  if (!(source instanceof _framebuffer__WEBPACK_IMPORTED_MODULE_6__["default"])) {
    return {
      framebuffer: (0,_webgl_utils_texture_utils__WEBPACK_IMPORTED_MODULE_7__.toFramebuffer)(source),
      deleteFramebuffer: true
    };
  }

  return {
    framebuffer: source,
    deleteFramebuffer: false
  };
}

function getPixelArray(pixelArray, type, format, width, height) {
  if (pixelArray) {
    return pixelArray;
  }

  type = type || 5121;
  const ArrayType = (0,_webgl_utils_typed_array_utils__WEBPACK_IMPORTED_MODULE_2__.getTypedArrayFromGLType)(type, {
    clamped: false
  });
  const components = (0,_webgl_utils_format_utils__WEBPACK_IMPORTED_MODULE_3__.glFormatToComponents)(format);
  return new ArrayType(width * height * components);
}
//# sourceMappingURL=copy-and-blit.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/framebuffer.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/framebuffer.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Framebuffer),
/* harmony export */   "FRAMEBUFFER_ATTACHMENT_PARAMETERS": () => (/* binding */ FRAMEBUFFER_ATTACHMENT_PARAMETERS)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _resource__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./resource */ "./node_modules/@luma.gl/webgl/dist/esm/classes/resource.js");
/* harmony import */ var _texture_2d__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./texture-2d */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture-2d.js");
/* harmony import */ var _renderbuffer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./renderbuffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/renderbuffer.js");
/* harmony import */ var _clear__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./clear */ "./node_modules/@luma.gl/webgl/dist/esm/classes/clear.js");
/* harmony import */ var _copy_and_blit_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./copy-and-blit.js */ "./node_modules/@luma.gl/webgl/dist/esm/classes/copy-and-blit.js");
/* harmony import */ var _features__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../features */ "./node_modules/@luma.gl/webgl/dist/esm/features/features.js");
/* harmony import */ var _webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../webgl-utils/constants-to-keys */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/constants-to-keys.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");









const ERR_MULTIPLE_RENDERTARGETS = 'Multiple render targets not supported';
class Framebuffer extends _resource__WEBPACK_IMPORTED_MODULE_1__["default"] {
  static isSupported(gl, options = {}) {
    const {
      colorBufferFloat,
      colorBufferHalfFloat
    } = options;
    let supported = true;

    if (colorBufferFloat) {
      supported = Boolean(gl.getExtension('EXT_color_buffer_float') || gl.getExtension('WEBGL_color_buffer_float') || gl.getExtension('OES_texture_float'));
    }

    if (colorBufferHalfFloat) {
      supported = supported && Boolean(gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float'));
    }

    return supported;
  }

  static getDefaultFramebuffer(gl) {
    gl.luma = gl.luma || {};
    gl.luma.defaultFramebuffer = gl.luma.defaultFramebuffer || new Framebuffer(gl, {
      id: 'default-framebuffer',
      handle: null,
      attachments: {}
    });
    return gl.luma.defaultFramebuffer;
  }

  get MAX_COLOR_ATTACHMENTS() {
    const gl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(this.gl);
    return gl2.getParameter(gl2.MAX_COLOR_ATTACHMENTS);
  }

  get MAX_DRAW_BUFFERS() {
    const gl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(this.gl);
    return gl2.getParameter(gl2.MAX_DRAW_BUFFERS);
  }

  constructor(gl, opts = {}) {
    super(gl, opts);
    this.width = null;
    this.height = null;
    this.attachments = {};
    this.readBuffer = 36064;
    this.drawBuffers = [36064];
    this.ownResources = [];
    this.initialize(opts);
    Object.seal(this);
  }

  get color() {
    return this.attachments[36064] || null;
  }

  get texture() {
    return this.attachments[36064] || null;
  }

  get depth() {
    return this.attachments[36096] || this.attachments[33306] || null;
  }

  get stencil() {
    return this.attachments[36128] || this.attachments[33306] || null;
  }

  initialize({
    width = 1,
    height = 1,
    attachments = null,
    color = true,
    depth = true,
    stencil = false,
    check = true,
    readBuffer = undefined,
    drawBuffers = undefined
  }) {
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(width >= 0 && height >= 0, 'Width and height need to be integers');
    this.width = width;
    this.height = height;

    if (attachments) {
      for (const attachment in attachments) {
        const target = attachments[attachment];
        const object = Array.isArray(target) ? target[0] : target;
        object.resize({
          width,
          height
        });
      }
    } else {
      attachments = this._createDefaultAttachments(color, depth, stencil, width, height);
    }

    this.update({
      clearAttachments: true,
      attachments,
      readBuffer,
      drawBuffers
    });

    if (attachments && check) {
      this.checkStatus();
    }
  }

  delete() {
    for (const resource of this.ownResources) {
      resource.delete();
    }

    super.delete();
    return this;
  }

  update({
    attachments = {},
    readBuffer,
    drawBuffers,
    clearAttachments = false,
    resizeAttachments = true
  }) {
    this.attach(attachments, {
      clearAttachments,
      resizeAttachments
    });
    const {
      gl
    } = this;
    const prevHandle = gl.bindFramebuffer(36160, this.handle);

    if (readBuffer) {
      this._setReadBuffer(readBuffer);
    }

    if (drawBuffers) {
      this._setDrawBuffers(drawBuffers);
    }

    gl.bindFramebuffer(36160, prevHandle || null);
    return this;
  }

  resize(options = {}) {
    let {
      width,
      height
    } = options;

    if (this.handle === null) {
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(width === undefined && height === undefined);
      this.width = this.gl.drawingBufferWidth;
      this.height = this.gl.drawingBufferHeight;
      return this;
    }

    if (width === undefined) {
      width = this.gl.drawingBufferWidth;
    }

    if (height === undefined) {
      height = this.gl.drawingBufferHeight;
    }

    if (width !== this.width && height !== this.height) {
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.log(2, `Resizing framebuffer ${this.id} to ${width}x${height}`)();
    }

    for (const attachmentPoint in this.attachments) {
      this.attachments[attachmentPoint].resize({
        width,
        height
      });
    }

    this.width = width;
    this.height = height;
    return this;
  }

  attach(attachments, {
    clearAttachments = false,
    resizeAttachments = true
  } = {}) {
    const newAttachments = {};

    if (clearAttachments) {
      Object.keys(this.attachments).forEach(key => {
        newAttachments[key] = null;
      });
    }

    Object.assign(newAttachments, attachments);
    const prevHandle = this.gl.bindFramebuffer(36160, this.handle);

    for (const key in newAttachments) {
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(key !== undefined, 'Misspelled framebuffer binding point?');
      const attachment = Number(key);
      const descriptor = newAttachments[attachment];
      let object = descriptor;

      if (!object) {
        this._unattach(attachment);
      } else if (object instanceof _renderbuffer__WEBPACK_IMPORTED_MODULE_3__["default"]) {
        this._attachRenderbuffer({
          attachment,
          renderbuffer: object
        });
      } else if (Array.isArray(descriptor)) {
        const [texture, layer = 0, level = 0] = descriptor;
        object = texture;

        this._attachTexture({
          attachment,
          texture,
          layer,
          level
        });
      } else {
        this._attachTexture({
          attachment,
          texture: object,
          layer: 0,
          level: 0
        });
      }

      if (resizeAttachments && object) {
        object.resize({
          width: this.width,
          height: this.height
        });
      }
    }

    this.gl.bindFramebuffer(36160, prevHandle || null);
    Object.assign(this.attachments, attachments);
    Object.keys(this.attachments).filter(key => !this.attachments[key]).forEach(key => {
      delete this.attachments[key];
    });
  }

  checkStatus() {
    const {
      gl
    } = this;
    const status = this.getStatus();

    if (status !== 36053) {
      throw new Error(_getFrameBufferStatus(status));
    }

    return this;
  }

  getStatus() {
    const {
      gl
    } = this;
    const prevHandle = gl.bindFramebuffer(36160, this.handle);
    const status = gl.checkFramebufferStatus(36160);
    gl.bindFramebuffer(36160, prevHandle || null);
    return status;
  }

  clear(options = {}) {
    const {
      color,
      depth,
      stencil,
      drawBuffers = []
    } = options;
    const prevHandle = this.gl.bindFramebuffer(36160, this.handle);

    if (color || depth || stencil) {
      (0,_clear__WEBPACK_IMPORTED_MODULE_4__.clear)(this.gl, {
        color,
        depth,
        stencil
      });
    }

    drawBuffers.forEach((value, drawBuffer) => {
      (0,_clear__WEBPACK_IMPORTED_MODULE_4__.clearBuffer)(this.gl, {
        drawBuffer,
        value
      });
    });
    this.gl.bindFramebuffer(36160, prevHandle || null);
    return this;
  }

  readPixels(opts = {}) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.error('Framebuffer.readPixels() is no logner supported, use readPixelsToArray(framebuffer)')();
    return null;
  }

  readPixelsToBuffer(opts = {}) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.error('Framebuffer.readPixelsToBuffer()is no logner supported, use readPixelsToBuffer(framebuffer)')();
    return null;
  }

  copyToDataUrl(opts = {}) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.error('Framebuffer.copyToDataUrl() is no logner supported, use copyToDataUrl(framebuffer)')();
    return null;
  }

  copyToImage(opts = {}) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.error('Framebuffer.copyToImage() is no logner supported, use copyToImage(framebuffer)')();
    return null;
  }

  copyToTexture(opts = {}) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.error('Framebuffer.copyToTexture({...}) is no logner supported, use copyToTexture(source, target, opts})')();
    return null;
  }

  blit(opts = {}) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.error('Framebuffer.blit({...}) is no logner supported, use blit(source, target, opts)')();
    return null;
  }

  invalidate({
    attachments = [],
    x = 0,
    y = 0,
    width,
    height
  }) {
    const gl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(this.gl);
    const prevHandle = gl2.bindFramebuffer(36008, this.handle);
    const invalidateAll = x === 0 && y === 0 && width === undefined && height === undefined;

    if (invalidateAll) {
      gl2.invalidateFramebuffer(36008, attachments);
    } else {
      gl2.invalidateFramebuffer(36008, attachments, x, y, width, height);
    }

    gl2.bindFramebuffer(36008, prevHandle);
    return this;
  }

  getAttachmentParameter(attachment, pname, keys) {
    let value = this._getAttachmentParameterFallback(pname);

    if (value === null) {
      this.gl.bindFramebuffer(36160, this.handle);
      value = this.gl.getFramebufferAttachmentParameter(36160, attachment, pname);
      this.gl.bindFramebuffer(36160, null);
    }

    if (keys && value > 1000) {
      value = (0,_webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_5__.getKey)(this.gl, value);
    }

    return value;
  }

  getAttachmentParameters(attachment = 36064, keys, parameters = this.constructor.ATTACHMENT_PARAMETERS || []) {
    const values = {};

    for (const pname of parameters) {
      const key = keys ? (0,_webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_5__.getKey)(this.gl, pname) : pname;
      values[key] = this.getAttachmentParameter(attachment, pname, keys);
    }

    return values;
  }

  getParameters(keys = true) {
    const attachments = Object.keys(this.attachments);
    const parameters = {};

    for (const attachmentName of attachments) {
      const attachment = Number(attachmentName);
      const key = keys ? (0,_webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_5__.getKey)(this.gl, attachment) : attachment;
      parameters[key] = this.getAttachmentParameters(attachment, keys);
    }

    return parameters;
  }

  show() {
    if (typeof window !== 'undefined') {
      window.open((0,_copy_and_blit_js__WEBPACK_IMPORTED_MODULE_6__.copyToDataUrl)(this), 'luma-debug-texture');
    }

    return this;
  }

  log(logLevel = 0, message = '') {
    if (logLevel > _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.level || typeof window === 'undefined') {
      return this;
    }

    message = message || `Framebuffer ${this.id}`;
    const image = (0,_copy_and_blit_js__WEBPACK_IMPORTED_MODULE_6__.copyToDataUrl)(this, {
      targetMaxHeight: 100
    });
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.image({
      logLevel,
      message,
      image
    }, message)();
    return this;
  }

  bind({
    target = 36160
  } = {}) {
    this.gl.bindFramebuffer(target, this.handle);
    return this;
  }

  unbind({
    target = 36160
  } = {}) {
    this.gl.bindFramebuffer(target, null);
    return this;
  }

  _createDefaultAttachments(color, depth, stencil, width, height) {
    let defaultAttachments = null;

    if (color) {
      defaultAttachments = defaultAttachments || {};
      defaultAttachments[36064] = new _texture_2d__WEBPACK_IMPORTED_MODULE_7__["default"](this.gl, {
        id: `${this.id}-color0`,
        pixels: null,
        format: 6408,
        type: 5121,
        width,
        height,
        mipmaps: false,
        parameters: {
          [10241]: 9729,
          [10240]: 9729,
          [10242]: 33071,
          [10243]: 33071
        }
      });
      this.ownResources.push(defaultAttachments[36064]);
    }

    if (depth && stencil) {
      defaultAttachments = defaultAttachments || {};
      defaultAttachments[33306] = new _renderbuffer__WEBPACK_IMPORTED_MODULE_3__["default"](this.gl, {
        id: `${this.id}-depth-stencil`,
        format: 35056,
        width,
        height: 111
      });
      this.ownResources.push(defaultAttachments[33306]);
    } else if (depth) {
      defaultAttachments = defaultAttachments || {};
      defaultAttachments[36096] = new _renderbuffer__WEBPACK_IMPORTED_MODULE_3__["default"](this.gl, {
        id: `${this.id}-depth`,
        format: 33189,
        width,
        height
      });
      this.ownResources.push(defaultAttachments[36096]);
    } else if (stencil) {
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(false);
    }

    return defaultAttachments;
  }

  _unattach(attachment) {
    const oldAttachment = this.attachments[attachment];

    if (!oldAttachment) {
      return;
    }

    if (oldAttachment instanceof _renderbuffer__WEBPACK_IMPORTED_MODULE_3__["default"]) {
      this.gl.framebufferRenderbuffer(36160, attachment, 36161, null);
    } else {
      this.gl.framebufferTexture2D(36160, attachment, 3553, null, 0);
    }

    delete this.attachments[attachment];
  }

  _attachRenderbuffer({
    attachment = 36064,
    renderbuffer
  }) {
    const {
      gl
    } = this;
    gl.framebufferRenderbuffer(36160, attachment, 36161, renderbuffer.handle);
    this.attachments[attachment] = renderbuffer;
  }

  _attachTexture({
    attachment = 36064,
    texture,
    layer,
    level
  }) {
    const {
      gl
    } = this;
    gl.bindTexture(texture.target, texture.handle);

    switch (texture.target) {
      case 35866:
      case 32879:
        const gl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(gl);
        gl2.framebufferTextureLayer(36160, attachment, texture.target, level, layer);
        break;

      case 34067:
        const face = mapIndexToCubeMapFace(layer);
        gl.framebufferTexture2D(36160, attachment, face, texture.handle, level);
        break;

      case 3553:
        gl.framebufferTexture2D(36160, attachment, 3553, texture.handle, level);
        break;

      default:
        (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(false, 'Illegal texture type');
    }

    gl.bindTexture(texture.target, null);
    this.attachments[attachment] = texture;
  }

  _setReadBuffer(readBuffer) {
    const gl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.getWebGL2Context)(this.gl);

    if (gl2) {
      gl2.readBuffer(readBuffer);
    } else {
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(readBuffer === 36064 || readBuffer === 1029, ERR_MULTIPLE_RENDERTARGETS);
    }

    this.readBuffer = readBuffer;
  }

  _setDrawBuffers(drawBuffers) {
    const {
      gl
    } = this;
    const gl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(gl);

    if (gl2) {
      gl2.drawBuffers(drawBuffers);
    } else {
      const ext = gl.getExtension('WEBGL_draw_buffers');

      if (ext) {
        ext.drawBuffersWEBGL(drawBuffers);
      } else {
        (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(drawBuffers.length === 1 && (drawBuffers[0] === 36064 || drawBuffers[0] === 1029), ERR_MULTIPLE_RENDERTARGETS);
      }
    }

    this.drawBuffers = drawBuffers;
  }

  _getAttachmentParameterFallback(pname) {
    const caps = (0,_features__WEBPACK_IMPORTED_MODULE_8__.getFeatures)(this.gl);

    switch (pname) {
      case 36052:
        return !caps.WEBGL2 ? 0 : null;

      case 33298:
      case 33299:
      case 33300:
      case 33301:
      case 33302:
      case 33303:
        return !caps.WEBGL2 ? 8 : null;

      case 33297:
        return !caps.WEBGL2 ? 5125 : null;

      case 33296:
        return !caps.WEBGL2 && !caps.EXT_sRGB ? 9729 : null;

      default:
        return null;
    }
  }

  _createHandle() {
    return this.gl.createFramebuffer();
  }

  _deleteHandle() {
    this.gl.deleteFramebuffer(this.handle);
  }

  _bindHandle(handle) {
    return this.gl.bindFramebuffer(36160, handle);
  }

}

function mapIndexToCubeMapFace(layer) {
  return layer < 34069 ? layer + 34069 : layer;
}

function _getFrameBufferStatus(status) {
  const STATUS = Framebuffer.STATUS || {};
  return STATUS[status] || `Framebuffer error ${status}`;
}

const FRAMEBUFFER_ATTACHMENT_PARAMETERS = [36049, 36048, 33296, 33298, 33299, 33300, 33301, 33302, 33303];
Framebuffer.ATTACHMENT_PARAMETERS = FRAMEBUFFER_ATTACHMENT_PARAMETERS;
//# sourceMappingURL=framebuffer.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/program-configuration.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/program-configuration.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ProgramConfiguration)
/* harmony export */ });
/* harmony import */ var _accessor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./accessor */ "./node_modules/@luma.gl/webgl/dist/esm/classes/accessor.js");
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _webgl_utils_attribute_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../webgl-utils/attribute-utils */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/attribute-utils.js");



class ProgramConfiguration {
  constructor(program) {
    this.id = program.id;
    this.attributeInfos = [];
    this.attributeInfosByName = {};
    this.attributeInfosByLocation = [];
    this.varyingInfos = [];
    this.varyingInfosByName = {};
    Object.seal(this);

    this._readAttributesFromProgram(program);

    this._readVaryingsFromProgram(program);
  }

  getAttributeInfo(locationOrName) {
    const location = Number(locationOrName);

    if (Number.isFinite(location)) {
      return this.attributeInfosByLocation[location];
    }

    return this.attributeInfosByName[locationOrName] || null;
  }

  getAttributeLocation(locationOrName) {
    const attributeInfo = this.getAttributeInfo(locationOrName);
    return attributeInfo ? attributeInfo.location : -1;
  }

  getAttributeAccessor(locationOrName) {
    const attributeInfo = this.getAttributeInfo(locationOrName);
    return attributeInfo ? attributeInfo.accessor : null;
  }

  getVaryingInfo(locationOrName) {
    const location = Number(locationOrName);

    if (Number.isFinite(location)) {
      return this.varyingInfos[location];
    }

    return this.varyingInfosByName[locationOrName] || null;
  }

  getVaryingIndex(locationOrName) {
    const varying = this.getVaryingInfo();
    return varying ? varying.location : -1;
  }

  getVaryingAccessor(locationOrName) {
    const varying = this.getVaryingInfo();
    return varying ? varying.accessor : null;
  }

  _readAttributesFromProgram(program) {
    const {
      gl
    } = program;
    const count = gl.getProgramParameter(program.handle, 35721);

    for (let index = 0; index < count; index++) {
      const {
        name,
        type,
        size
      } = gl.getActiveAttrib(program.handle, index);
      const location = gl.getAttribLocation(program.handle, name);

      if (location >= 0) {
        this._addAttribute(location, name, type, size);
      }
    }

    this.attributeInfos.sort((a, b) => a.location - b.location);
  }

  _readVaryingsFromProgram(program) {
    const {
      gl
    } = program;

    if (!(0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl)) {
      return;
    }

    const count = gl.getProgramParameter(program.handle, 35971);

    for (let location = 0; location < count; location++) {
      const {
        name,
        type,
        size
      } = gl.getTransformFeedbackVarying(program.handle, location);

      this._addVarying(location, name, type, size);
    }

    this.varyingInfos.sort((a, b) => a.location - b.location);
  }

  _addAttribute(location, name, compositeType, size) {
    const {
      type,
      components
    } = (0,_webgl_utils_attribute_utils__WEBPACK_IMPORTED_MODULE_1__.decomposeCompositeGLType)(compositeType);
    const accessor = {
      type,
      size: size * components
    };

    this._inferProperties(location, name, accessor);

    const attributeInfo = {
      location,
      name,
      accessor: new _accessor__WEBPACK_IMPORTED_MODULE_2__["default"](accessor)
    };
    this.attributeInfos.push(attributeInfo);
    this.attributeInfosByLocation[location] = attributeInfo;
    this.attributeInfosByName[attributeInfo.name] = attributeInfo;
  }

  _inferProperties(location, name, accessor) {
    if (/instance/i.test(name)) {
      accessor.divisor = 1;
    }
  }

  _addVarying(location, name, compositeType, size) {
    const {
      type,
      components
    } = (0,_webgl_utils_attribute_utils__WEBPACK_IMPORTED_MODULE_1__.decomposeCompositeGLType)(compositeType);
    const accessor = new _accessor__WEBPACK_IMPORTED_MODULE_2__["default"]({
      type,
      size: size * components
    });
    const varying = {
      location,
      name,
      accessor
    };
    this.varyingInfos.push(varying);
    this.varyingInfosByName[varying.name] = varying;
  }

}
//# sourceMappingURL=program-configuration.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/program.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/program.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Program)
/* harmony export */ });
/* harmony import */ var _resource__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./resource */ "./node_modules/@luma.gl/webgl/dist/esm/classes/resource.js");
/* harmony import */ var _texture__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./texture */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture.js");
/* harmony import */ var _framebuffer__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./framebuffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/framebuffer.js");
/* harmony import */ var _uniforms__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./uniforms */ "./node_modules/@luma.gl/webgl/dist/esm/classes/uniforms.js");
/* harmony import */ var _shader__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./shader */ "./node_modules/@luma.gl/webgl/dist/esm/classes/shader.js");
/* harmony import */ var _program_configuration__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./program-configuration */ "./node_modules/@luma.gl/webgl/dist/esm/classes/program-configuration.js");
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../webgl-utils/constants-to-keys */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/constants-to-keys.js");
/* harmony import */ var _webgl_utils_attribute_utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../webgl-utils/attribute-utils */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/attribute-utils.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../utils/utils */ "./node_modules/@luma.gl/webgl/dist/esm/utils/utils.js");












const LOG_PROGRAM_PERF_PRIORITY = 4;
const GL_SEPARATE_ATTRIBS = 0x8c8d;
const V6_DEPRECATED_METHODS = ['setVertexArray', 'setAttributes', 'setBuffers', 'unsetBuffers', 'use', 'getUniformCount', 'getUniformInfo', 'getUniformLocation', 'getUniformValue', 'getVarying', 'getFragDataLocation', 'getAttachedShaders', 'getAttributeCount', 'getAttributeLocation', 'getAttributeInfo'];
class Program extends _resource__WEBPACK_IMPORTED_MODULE_1__["default"] {
  constructor(gl, props = {}) {
    super(gl, props);
    this.stubRemovedMethods('Program', 'v6.0', V6_DEPRECATED_METHODS);
    this._isCached = false;
    this.initialize(props);
    Object.seal(this);

    this._setId(props.id);
  }

  initialize(props = {}) {
    const {
      hash,
      vs,
      fs,
      varyings,
      bufferMode = GL_SEPARATE_ATTRIBS
    } = props;
    this.hash = hash || '';
    this.vs = typeof vs === 'string' ? new _shader__WEBPACK_IMPORTED_MODULE_2__.VertexShader(this.gl, {
      id: `${props.id}-vs`,
      source: vs
    }) : vs;
    this.fs = typeof fs === 'string' ? new _shader__WEBPACK_IMPORTED_MODULE_2__.FragmentShader(this.gl, {
      id: `${props.id}-fs`,
      source: fs
    }) : fs;
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)(this.vs instanceof _shader__WEBPACK_IMPORTED_MODULE_2__.VertexShader);
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)(this.fs instanceof _shader__WEBPACK_IMPORTED_MODULE_2__.FragmentShader);
    this.uniforms = {};
    this._textureUniforms = {};

    if (varyings && varyings.length > 0) {
      (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(this.gl);
      this.varyings = varyings;
      this.gl2.transformFeedbackVaryings(this.handle, varyings, bufferMode);
    }

    this._compileAndLink();

    this._readUniformLocationsFromLinkedProgram();

    this.configuration = new _program_configuration__WEBPACK_IMPORTED_MODULE_4__["default"](this);
    return this.setProps(props);
  }

  delete(options = {}) {
    if (this._isCached) {
      return this;
    }

    return super.delete(options);
  }

  setProps(props) {
    if ('uniforms' in props) {
      this.setUniforms(props.uniforms);
    }

    return this;
  }

  draw({
    logPriority,
    drawMode = 4,
    vertexCount,
    offset = 0,
    start,
    end,
    isIndexed = false,
    indexType = 5123,
    instanceCount = 0,
    isInstanced = instanceCount > 0,
    vertexArray = null,
    transformFeedback,
    framebuffer,
    parameters = {},
    uniforms,
    samplers
  }) {
    if (uniforms || samplers) {
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.deprecated('Program.draw({uniforms})', 'Program.setUniforms(uniforms)')();
      this.setUniforms(uniforms || {});
    }

    if (_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.priority >= logPriority) {
      const fb = framebuffer ? framebuffer.id : 'default';
      const message = `mode=${(0,_webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_5__.getKey)(this.gl, drawMode)} verts=${vertexCount} ` + `instances=${instanceCount} indexType=${(0,_webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_5__.getKey)(this.gl, indexType)} ` + `isInstanced=${isInstanced} isIndexed=${isIndexed} ` + `Framebuffer=${fb}`;
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.log(logPriority, message)();
    }

    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)(vertexArray);
    this.gl.useProgram(this.handle);

    if (!this._areTexturesRenderable() || vertexCount === 0 || isInstanced && instanceCount === 0) {
      return false;
    }

    vertexArray.bindForDraw(vertexCount, instanceCount, () => {
      if (framebuffer !== undefined) {
        parameters = Object.assign({}, parameters, {
          framebuffer
        });
      }

      if (transformFeedback) {
        const primitiveMode = (0,_webgl_utils_attribute_utils__WEBPACK_IMPORTED_MODULE_6__.getPrimitiveDrawMode)(drawMode);
        transformFeedback.begin(primitiveMode);
      }

      this._bindTextures();

      (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.withParameters)(this.gl, parameters, () => {
        if (isIndexed && isInstanced) {
          this.gl2.drawElementsInstanced(drawMode, vertexCount, indexType, offset, instanceCount);
        } else if (isIndexed && (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(this.gl) && !isNaN(start) && !isNaN(end)) {
          this.gl2.drawRangeElements(drawMode, start, end, vertexCount, indexType, offset);
        } else if (isIndexed) {
          this.gl.drawElements(drawMode, vertexCount, indexType, offset);
        } else if (isInstanced) {
          this.gl2.drawArraysInstanced(drawMode, offset, vertexCount, instanceCount);
        } else {
          this.gl.drawArrays(drawMode, offset, vertexCount);
        }
      });

      if (transformFeedback) {
        transformFeedback.end();
      }
    });
    return true;
  }

  setUniforms(uniforms = {}) {
    if (_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.priority >= 2) {
      (0,_uniforms__WEBPACK_IMPORTED_MODULE_7__.checkUniformValues)(uniforms, this.id, this._uniformSetters);
    }

    this.gl.useProgram(this.handle);

    for (const uniformName in uniforms) {
      const uniform = uniforms[uniformName];
      const uniformSetter = this._uniformSetters[uniformName];

      if (uniformSetter) {
        let value = uniform;
        let textureUpdate = false;

        if (value instanceof _framebuffer__WEBPACK_IMPORTED_MODULE_8__["default"]) {
          value = value.texture;
        }

        if (value instanceof _texture__WEBPACK_IMPORTED_MODULE_9__["default"]) {
          textureUpdate = this.uniforms[uniformName] !== uniform;

          if (textureUpdate) {
            if (uniformSetter.textureIndex === undefined) {
              uniformSetter.textureIndex = this._textureIndexCounter++;
            }

            const texture = value;
            const {
              textureIndex
            } = uniformSetter;
            texture.bind(textureIndex);
            value = textureIndex;
            this._textureUniforms[uniformName] = texture;
          } else {
            value = uniformSetter.textureIndex;
          }
        } else if (this._textureUniforms[uniformName]) {
          delete this._textureUniforms[uniformName];
        }

        if (uniformSetter(value) || textureUpdate) {
          (0,_uniforms__WEBPACK_IMPORTED_MODULE_7__.copyUniform)(this.uniforms, uniformName, uniform);
        }
      }
    }

    return this;
  }

  _areTexturesRenderable() {
    let texturesRenderable = true;

    for (const uniformName in this._textureUniforms) {
      const texture = this._textureUniforms[uniformName];
      texture.update();
      texturesRenderable = texturesRenderable && texture.loaded;
    }

    return texturesRenderable;
  }

  _bindTextures() {
    for (const uniformName in this._textureUniforms) {
      const textureIndex = this._uniformSetters[uniformName].textureIndex;

      this._textureUniforms[uniformName].bind(textureIndex);
    }
  }

  _createHandle() {
    return this.gl.createProgram();
  }

  _deleteHandle() {
    this.gl.deleteProgram(this.handle);
  }

  _getOptionsFromHandle(handle) {
    const shaderHandles = this.gl.getAttachedShaders(handle);
    const opts = {};

    for (const shaderHandle of shaderHandles) {
      const type = this.gl.getShaderParameter(this.handle, 35663);

      switch (type) {
        case 35633:
          opts.vs = new _shader__WEBPACK_IMPORTED_MODULE_2__.VertexShader({
            handle: shaderHandle
          });
          break;

        case 35632:
          opts.fs = new _shader__WEBPACK_IMPORTED_MODULE_2__.FragmentShader({
            handle: shaderHandle
          });
          break;

        default:
      }
    }

    return opts;
  }

  _getParameter(pname) {
    return this.gl.getProgramParameter(this.handle, pname);
  }

  _setId(id) {
    if (!id) {
      const programName = this._getName();

      this.id = (0,_utils_utils__WEBPACK_IMPORTED_MODULE_10__.uid)(programName);
    }
  }

  _getName() {
    let programName = this.vs.getName() || this.fs.getName();
    programName = programName.replace(/shader/i, '');
    programName = programName ? `${programName}-program` : 'program';
    return programName;
  }

  _compileAndLink() {
    const {
      gl
    } = this;
    gl.attachShader(this.handle, this.vs.handle);
    gl.attachShader(this.handle, this.fs.handle);
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.time(LOG_PROGRAM_PERF_PRIORITY, `linkProgram for ${this._getName()}`)();
    gl.linkProgram(this.handle);
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.timeEnd(LOG_PROGRAM_PERF_PRIORITY, `linkProgram for ${this._getName()}`)();

    if (gl.debug || _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.level > 0) {
      const linked = gl.getProgramParameter(this.handle, 35714);

      if (!linked) {
        throw new Error(`Error linking: ${gl.getProgramInfoLog(this.handle)}`);
      }

      gl.validateProgram(this.handle);
      const validated = gl.getProgramParameter(this.handle, 35715);

      if (!validated) {
        throw new Error(`Error validating: ${gl.getProgramInfoLog(this.handle)}`);
      }
    }
  }

  _readUniformLocationsFromLinkedProgram() {
    const {
      gl
    } = this;
    this._uniformSetters = {};
    this._uniformCount = this._getParameter(35718);

    for (let i = 0; i < this._uniformCount; i++) {
      const info = this.gl.getActiveUniform(this.handle, i);
      const {
        name
      } = (0,_uniforms__WEBPACK_IMPORTED_MODULE_7__.parseUniformName)(info.name);
      let location = gl.getUniformLocation(this.handle, name);
      this._uniformSetters[name] = (0,_uniforms__WEBPACK_IMPORTED_MODULE_7__.getUniformSetter)(gl, location, info);

      if (info.size > 1) {
        for (let l = 0; l < info.size; l++) {
          location = gl.getUniformLocation(this.handle, `${name}[${l}]`);
          this._uniformSetters[`${name}[${l}]`] = (0,_uniforms__WEBPACK_IMPORTED_MODULE_7__.getUniformSetter)(gl, location, info);
        }
      }
    }

    this._textureIndexCounter = 0;
  }

  getActiveUniforms(uniformIndices, pname) {
    return this.gl2.getActiveUniforms(this.handle, uniformIndices, pname);
  }

  getUniformBlockIndex(blockName) {
    return this.gl2.getUniformBlockIndex(this.handle, blockName);
  }

  getActiveUniformBlockParameter(blockIndex, pname) {
    return this.gl2.getActiveUniformBlockParameter(this.handle, blockIndex, pname);
  }

  uniformBlockBinding(blockIndex, blockBinding) {
    this.gl2.uniformBlockBinding(this.handle, blockIndex, blockBinding);
  }

}
//# sourceMappingURL=program.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/query.js":
/*!***************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/query.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Query)
/* harmony export */ });
/* harmony import */ var _resource__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./resource */ "./node_modules/@luma.gl/webgl/dist/esm/classes/resource.js");
/* harmony import */ var _features__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../features */ "./node_modules/@luma.gl/webgl/dist/esm/features/features.js");
/* harmony import */ var _features__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../features */ "./node_modules/@luma.gl/webgl/dist/esm/features/webgl-features-table.js");
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* provided dependency */ var Promise = __webpack_require__(/*! es6-promise */ "./node_modules/es6-promise/dist/es6-promise.js");




const GL_QUERY_RESULT = 0x8866;
const GL_QUERY_RESULT_AVAILABLE = 0x8867;
const GL_TIME_ELAPSED_EXT = 0x88bf;
const GL_GPU_DISJOINT_EXT = 0x8fbb;
const GL_TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN = 0x8c88;
const GL_ANY_SAMPLES_PASSED = 0x8c2f;
const GL_ANY_SAMPLES_PASSED_CONSERVATIVE = 0x8d6a;
class Query extends _resource__WEBPACK_IMPORTED_MODULE_1__["default"] {
  static isSupported(gl, opts = []) {
    const webgl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl);
    const hasTimerQuery = (0,_features__WEBPACK_IMPORTED_MODULE_2__.hasFeatures)(gl, _features__WEBPACK_IMPORTED_MODULE_3__.FEATURES.TIMER_QUERY);
    let supported = webgl2 || hasTimerQuery;

    for (const key of opts) {
      switch (key) {
        case 'queries':
          supported = supported && webgl2;
          break;

        case 'timers':
          supported = supported && hasTimerQuery;
          break;

        default:
          (0,_utils_assert__WEBPACK_IMPORTED_MODULE_4__.assert)(false);
      }
    }

    return supported;
  }

  constructor(gl, opts = {}) {
    super(gl, opts);
    this.target = null;
    this._queryPending = false;
    this._pollingPromise = null;
    Object.seal(this);
  }

  beginTimeElapsedQuery() {
    return this.begin(GL_TIME_ELAPSED_EXT);
  }

  beginOcclusionQuery({
    conservative = false
  } = {}) {
    return this.begin(conservative ? GL_ANY_SAMPLES_PASSED_CONSERVATIVE : GL_ANY_SAMPLES_PASSED);
  }

  beginTransformFeedbackQuery() {
    return this.begin(GL_TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN);
  }

  begin(target) {
    if (this._queryPending) {
      return this;
    }

    this.target = target;
    this.gl2.beginQuery(this.target, this.handle);
    return this;
  }

  end() {
    if (this._queryPending) {
      return this;
    }

    if (this.target) {
      this.gl2.endQuery(this.target);
      this.target = null;
      this._queryPending = true;
    }

    return this;
  }

  isResultAvailable() {
    if (!this._queryPending) {
      return false;
    }

    const resultAvailable = this.gl2.getQueryParameter(this.handle, GL_QUERY_RESULT_AVAILABLE);

    if (resultAvailable) {
      this._queryPending = false;
    }

    return resultAvailable;
  }

  isTimerDisjoint() {
    return this.gl2.getParameter(GL_GPU_DISJOINT_EXT);
  }

  getResult() {
    return this.gl2.getQueryParameter(this.handle, GL_QUERY_RESULT);
  }

  getTimerMilliseconds() {
    return this.getResult() / 1e6;
  }

  createPoll(limit = Number.POSITIVE_INFINITY) {
    if (this._pollingPromise) {
      return this._pollingPromise;
    }

    let counter = 0;
    this._pollingPromise = new Promise((resolve, reject) => {
      const poll = () => {
        if (this.isResultAvailable()) {
          resolve(this.getResult());
          this._pollingPromise = null;
        } else if (counter++ > limit) {
          reject('Timed out');
          this._pollingPromise = null;
        } else {
          requestAnimationFrame(poll);
        }
      };

      requestAnimationFrame(poll);
    });
    return this._pollingPromise;
  }

  _createHandle() {
    return Query.isSupported(this.gl) ? this.gl2.createQuery() : null;
  }

  _deleteHandle() {
    this.gl2.deleteQuery(this.handle);
  }

}
//# sourceMappingURL=query.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/renderbuffer-formats.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/renderbuffer-formats.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const EXT_FLOAT_WEBGL2 = 'EXT_color_buffer_float';
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  [33189]: {
    bpp: 2
  },
  [33190]: {
    gl2: true,
    bpp: 3
  },
  [36012]: {
    gl2: true,
    bpp: 4
  },
  [36168]: {
    bpp: 1
  },
  [34041]: {
    bpp: 4
  },
  [35056]: {
    gl2: true,
    bpp: 4
  },
  [36013]: {
    gl2: true,
    bpp: 5
  },
  [32854]: {
    bpp: 2
  },
  [36194]: {
    bpp: 2
  },
  [32855]: {
    bpp: 2
  },
  [33321]: {
    gl2: true,
    bpp: 1
  },
  [33330]: {
    gl2: true,
    bpp: 1
  },
  [33329]: {
    gl2: true,
    bpp: 1
  },
  [33332]: {
    gl2: true,
    bpp: 2
  },
  [33331]: {
    gl2: true,
    bpp: 2
  },
  [33334]: {
    gl2: true,
    bpp: 4
  },
  [33333]: {
    gl2: true,
    bpp: 4
  },
  [33323]: {
    gl2: true,
    bpp: 2
  },
  [33336]: {
    gl2: true,
    bpp: 2
  },
  [33335]: {
    gl2: true,
    bpp: 2
  },
  [33338]: {
    gl2: true,
    bpp: 4
  },
  [33337]: {
    gl2: true,
    bpp: 4
  },
  [33340]: {
    gl2: true,
    bpp: 8
  },
  [33339]: {
    gl2: true,
    bpp: 8
  },
  [32849]: {
    gl2: true,
    bpp: 3
  },
  [32856]: {
    gl2: true,
    bpp: 4
  },
  [32857]: {
    gl2: true,
    bpp: 4
  },
  [36220]: {
    gl2: true,
    bpp: 4
  },
  [36238]: {
    gl2: true,
    bpp: 4
  },
  [36975]: {
    gl2: true,
    bpp: 4
  },
  [36214]: {
    gl2: true,
    bpp: 8
  },
  [36232]: {
    gl2: true,
    bpp: 8
  },
  [36226]: {
    gl2: true,
    bpp: 16
  },
  [36208]: {
    gl2: true,
    bpp: 16
  },
  [33325]: {
    gl2: EXT_FLOAT_WEBGL2,
    bpp: 2
  },
  [33327]: {
    gl2: EXT_FLOAT_WEBGL2,
    bpp: 4
  },
  [34842]: {
    gl2: EXT_FLOAT_WEBGL2,
    bpp: 8
  },
  [33326]: {
    gl2: EXT_FLOAT_WEBGL2,
    bpp: 4
  },
  [33328]: {
    gl2: EXT_FLOAT_WEBGL2,
    bpp: 8
  },
  [34836]: {
    gl2: EXT_FLOAT_WEBGL2,
    bpp: 16
  },
  [35898]: {
    gl2: EXT_FLOAT_WEBGL2,
    bpp: 4
  }
});
//# sourceMappingURL=renderbuffer-formats.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/renderbuffer.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/renderbuffer.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Renderbuffer)
/* harmony export */ });
/* harmony import */ var _resource__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./resource */ "./node_modules/@luma.gl/webgl/dist/esm/classes/resource.js");
/* harmony import */ var _renderbuffer_formats__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./renderbuffer-formats */ "./node_modules/@luma.gl/webgl/dist/esm/classes/renderbuffer-formats.js");
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");





function isFormatSupported(gl, format, formats) {
  const info = formats[format];

  if (!info) {
    return false;
  }

  const value = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl) ? info.gl2 || info.gl1 : info.gl1;

  if (typeof value === 'string') {
    return gl.getExtension(value);
  }

  return value;
}

class Renderbuffer extends _resource__WEBPACK_IMPORTED_MODULE_1__["default"] {
  static isSupported(gl, {
    format
  } = {
    format: null
  }) {
    return !format || isFormatSupported(gl, format, _renderbuffer_formats__WEBPACK_IMPORTED_MODULE_2__["default"]);
  }

  static getSamplesForFormat(gl, {
    format
  }) {
    return gl.getInternalformatParameter(36161, format, 32937);
  }

  constructor(gl, opts = {}) {
    super(gl, opts);
    this.initialize(opts);
    Object.seal(this);
  }

  initialize({
    format,
    width = 1,
    height = 1,
    samples = 0
  }) {
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)(format, 'Needs format');

    this._trackDeallocatedMemory();

    this.gl.bindRenderbuffer(36161, this.handle);

    if (samples !== 0 && (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(this.gl)) {
      this.gl.renderbufferStorageMultisample(36161, samples, format, width, height);
    } else {
      this.gl.renderbufferStorage(36161, format, width, height);
    }

    this.format = format;
    this.width = width;
    this.height = height;
    this.samples = samples;

    this._trackAllocatedMemory(this.width * this.height * (this.samples || 1) * _renderbuffer_formats__WEBPACK_IMPORTED_MODULE_2__["default"][this.format].bpp);

    return this;
  }

  resize({
    width,
    height
  }) {
    if (width !== this.width || height !== this.height) {
      return this.initialize({
        width,
        height,
        format: this.format,
        samples: this.samples
      });
    }

    return this;
  }

  _createHandle() {
    return this.gl.createRenderbuffer();
  }

  _deleteHandle() {
    this.gl.deleteRenderbuffer(this.handle);

    this._trackDeallocatedMemory();
  }

  _bindHandle(handle) {
    this.gl.bindRenderbuffer(36161, handle);
  }

  _syncHandle(handle) {
    this.format = this.getParameter(36164);
    this.width = this.getParameter(36162);
    this.height = this.getParameter(36163);
    this.samples = this.getParameter(36011);
  }

  _getParameter(pname) {
    this.gl.bindRenderbuffer(36161, this.handle);
    const value = this.gl.getRenderbufferParameter(36161, pname);
    return value;
  }

}
//# sourceMappingURL=renderbuffer.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/resource.js":
/*!******************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/resource.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Resource)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _init__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../init */ "./node_modules/@luma.gl/webgl/dist/esm/init.js");
/* harmony import */ var _webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../webgl-utils/constants-to-keys */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/constants-to-keys.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/utils */ "./node_modules/@luma.gl/webgl/dist/esm/utils/utils.js");
/* harmony import */ var _utils_stub_methods__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/stub-methods */ "./node_modules/@luma.gl/webgl/dist/esm/utils/stub-methods.js");






const ERR_RESOURCE_METHOD_UNDEFINED = 'Resource subclass must define virtual methods';
class Resource {
  constructor(gl, opts = {}) {
    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGLContext)(gl);
    const {
      id,
      userData = {}
    } = opts;
    this.gl = gl;
    this.gl2 = gl;
    this.id = id || (0,_utils_utils__WEBPACK_IMPORTED_MODULE_1__.uid)(this.constructor.name);
    this.userData = userData;
    this._bound = false;
    this._handle = opts.handle;

    if (this._handle === undefined) {
      this._handle = this._createHandle();
    }

    this.byteLength = 0;

    this._addStats();
  }

  toString() {
    return `${this.constructor.name}(${this.id})`;
  }

  get handle() {
    return this._handle;
  }

  delete({
    deleteChildren = false
  } = {}) {
    const children = this._handle && this._deleteHandle(this._handle);

    if (this._handle) {
      this._removeStats();
    }

    this._handle = null;

    if (children && deleteChildren) {
      children.filter(Boolean).forEach(child => child.delete());
    }

    return this;
  }

  bind(funcOrHandle = this.handle) {
    if (typeof funcOrHandle !== 'function') {
      this._bindHandle(funcOrHandle);

      return this;
    }

    let value;

    if (!this._bound) {
      this._bindHandle(this.handle);

      this._bound = true;
      value = funcOrHandle();
      this._bound = false;

      this._bindHandle(null);
    } else {
      value = funcOrHandle();
    }

    return value;
  }

  unbind() {
    this.bind(null);
  }

  getParameter(pname, opts = {}) {
    pname = (0,_webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_2__.getKeyValue)(this.gl, pname);
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)(pname);
    const parameters = this.constructor.PARAMETERS || {};
    const parameter = parameters[pname];

    if (parameter) {
      const isWebgl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(this.gl);
      const parameterAvailable = (!('webgl2' in parameter) || isWebgl2) && (!('extension' in parameter) || this.gl.getExtension(parameter.extension));

      if (!parameterAvailable) {
        const webgl1Default = parameter.webgl1;
        const webgl2Default = 'webgl2' in parameter ? parameter.webgl2 : parameter.webgl1;
        const defaultValue = isWebgl2 ? webgl2Default : webgl1Default;
        return defaultValue;
      }
    }

    return this._getParameter(pname, opts);
  }

  getParameters(options = {}) {
    const {
      parameters,
      keys
    } = options;
    const PARAMETERS = this.constructor.PARAMETERS || {};
    const isWebgl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(this.gl);
    const values = {};
    const parameterKeys = parameters || Object.keys(PARAMETERS);

    for (const pname of parameterKeys) {
      const parameter = PARAMETERS[pname];
      const parameterAvailable = parameter && (!('webgl2' in parameter) || isWebgl2) && (!('extension' in parameter) || this.gl.getExtension(parameter.extension));

      if (parameterAvailable) {
        const key = keys ? (0,_webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_2__.getKey)(this.gl, pname) : pname;
        values[key] = this.getParameter(pname, options);

        if (keys && parameter.type === 'GLenum') {
          values[key] = (0,_webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_2__.getKey)(this.gl, values[key]);
        }
      }
    }

    return values;
  }

  setParameter(pname, value) {
    pname = (0,_webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_2__.getKeyValue)(this.gl, pname);
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)(pname);
    const parameters = this.constructor.PARAMETERS || {};
    const parameter = parameters[pname];

    if (parameter) {
      const isWebgl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(this.gl);
      const parameterAvailable = (!('webgl2' in parameter) || isWebgl2) && (!('extension' in parameter) || this.gl.getExtension(parameter.extension));

      if (!parameterAvailable) {
        throw new Error('Parameter not available on this platform');
      }

      if (parameter.type === 'GLenum') {
        value = (0,_webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_2__.getKeyValue)(value);
      }
    }

    this._setParameter(pname, value);

    return this;
  }

  setParameters(parameters) {
    for (const pname in parameters) {
      this.setParameter(pname, parameters[pname]);
    }

    return this;
  }

  stubRemovedMethods(className, version, methodNames) {
    return (0,_utils_stub_methods__WEBPACK_IMPORTED_MODULE_4__.stubRemovedMethods)(this, className, version, methodNames);
  }

  initialize(opts) {}

  _createHandle() {
    throw new Error(ERR_RESOURCE_METHOD_UNDEFINED);
  }

  _deleteHandle() {
    throw new Error(ERR_RESOURCE_METHOD_UNDEFINED);
  }

  _bindHandle(handle) {
    throw new Error(ERR_RESOURCE_METHOD_UNDEFINED);
  }

  _getOptsFromHandle() {
    throw new Error(ERR_RESOURCE_METHOD_UNDEFINED);
  }

  _getParameter(pname, opts) {
    throw new Error(ERR_RESOURCE_METHOD_UNDEFINED);
  }

  _setParameter(pname, value) {
    throw new Error(ERR_RESOURCE_METHOD_UNDEFINED);
  }

  _context() {
    this.gl.luma = this.gl.luma || {};
    return this.gl.luma;
  }

  _addStats() {
    const name = this.constructor.name;
    const stats = _init__WEBPACK_IMPORTED_MODULE_5__.lumaStats.get('Resource Counts');
    stats.get('Resources Created').incrementCount();
    stats.get(`${name}s Created`).incrementCount();
    stats.get(`${name}s Active`).incrementCount();
  }

  _removeStats() {
    const name = this.constructor.name;
    const stats = _init__WEBPACK_IMPORTED_MODULE_5__.lumaStats.get('Resource Counts');
    stats.get(`${name}s Active`).decrementCount();
  }

  _trackAllocatedMemory(bytes, name = this.constructor.name) {
    const stats = _init__WEBPACK_IMPORTED_MODULE_5__.lumaStats.get('Memory Usage');
    stats.get('GPU Memory').addCount(bytes);
    stats.get(`${name} Memory`).addCount(bytes);
    this.byteLength = bytes;
  }

  _trackDeallocatedMemory(name = this.constructor.name) {
    const stats = _init__WEBPACK_IMPORTED_MODULE_5__.lumaStats.get('Memory Usage');
    stats.get('GPU Memory').subtractCount(this.byteLength);
    stats.get(`${name} Memory`).subtractCount(this.byteLength);
    this.byteLength = 0;
  }

}
//# sourceMappingURL=resource.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/shader.js":
/*!****************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/shader.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Shader": () => (/* binding */ Shader),
/* harmony export */   "VertexShader": () => (/* binding */ VertexShader),
/* harmony export */   "FragmentShader": () => (/* binding */ FragmentShader)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _glsl_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../glsl-utils */ "./node_modules/@luma.gl/webgl/dist/esm/glsl-utils/get-shader-name.js");
/* harmony import */ var _glsl_utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../glsl-utils */ "./node_modules/@luma.gl/webgl/dist/esm/glsl-utils/format-glsl-error.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/utils */ "./node_modules/@luma.gl/webgl/dist/esm/utils/utils.js");
/* harmony import */ var _resource__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./resource */ "./node_modules/@luma.gl/webgl/dist/esm/classes/resource.js");





const ERR_SOURCE = 'Shader: GLSL source code must be a JavaScript string';
class Shader extends _resource__WEBPACK_IMPORTED_MODULE_1__["default"] {
  static getTypeName(shaderType) {
    switch (shaderType) {
      case 35633:
        return 'vertex-shader';

      case 35632:
        return 'fragment-shader';

      default:
        (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(false);
        return 'unknown';
    }
  }

  constructor(gl, props) {
    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGLContext)(gl);
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(typeof props.source === 'string', ERR_SOURCE);
    const id = (0,_glsl_utils__WEBPACK_IMPORTED_MODULE_3__["default"])(props.source, null) || props.id || (0,_utils_utils__WEBPACK_IMPORTED_MODULE_4__.uid)(`unnamed ${Shader.getTypeName(props.shaderType)}`);
    super(gl, {
      id
    });
    this.shaderType = props.shaderType;
    this.source = props.source;
    this.initialize(props);
  }

  initialize({
    source
  }) {
    const shaderName = (0,_glsl_utils__WEBPACK_IMPORTED_MODULE_3__["default"])(source, null);

    if (shaderName) {
      this.id = (0,_utils_utils__WEBPACK_IMPORTED_MODULE_4__.uid)(shaderName);
    }

    this._compile(source);
  }

  getParameter(pname) {
    return this.gl.getShaderParameter(this.handle, pname);
  }

  toString() {
    return `${Shader.getTypeName(this.shaderType)}:${this.id}`;
  }

  getName() {
    return (0,_glsl_utils__WEBPACK_IMPORTED_MODULE_3__["default"])(this.source) || 'unnamed-shader';
  }

  getSource() {
    return this.gl.getShaderSource(this.handle);
  }

  getTranslatedSource() {
    const extension = this.gl.getExtension('WEBGL_debug_shaders');
    return extension ? extension.getTranslatedShaderSource(this.handle) : 'No translated source available. WEBGL_debug_shaders not implemented';
  }

  _compile(source = this.source) {
    if (!source.startsWith('#version ')) {
      source = `#version 100\n${source}`;
    }

    this.source = source;
    this.gl.shaderSource(this.handle, this.source);
    this.gl.compileShader(this.handle);
    const compileStatus = this.getParameter(35713);

    if (!compileStatus) {
      const infoLog = this.gl.getShaderInfoLog(this.handle);
      const {
        shaderName,
        errors,
        warnings
      } = (0,_glsl_utils__WEBPACK_IMPORTED_MODULE_5__.parseGLSLCompilerError)(infoLog, this.source, this.shaderType, this.id);
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.error(`GLSL compilation errors in ${shaderName}\n${errors}`)();
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.warn(`GLSL compilation warnings in ${shaderName}\n${warnings}`)();
      throw new Error(`GLSL compilation errors in ${shaderName}`);
    }
  }

  _deleteHandle() {
    this.gl.deleteShader(this.handle);
  }

  _getOptsFromHandle() {
    return {
      type: this.getParameter(35663),
      source: this.getSource()
    };
  }

}
class VertexShader extends Shader {
  constructor(gl, props) {
    if (typeof props === 'string') {
      props = {
        source: props
      };
    }

    super(gl, Object.assign({}, props, {
      shaderType: 35633
    }));
  }

  _createHandle() {
    return this.gl.createShader(35633);
  }

}
class FragmentShader extends Shader {
  constructor(gl, props) {
    if (typeof props === 'string') {
      props = {
        source: props
      };
    }

    super(gl, Object.assign({}, props, {
      shaderType: 35632
    }));
  }

  _createHandle() {
    return this.gl.createShader(35632);
  }

}
//# sourceMappingURL=shader.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture-2d.js":
/*!********************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/texture-2d.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Texture2D)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _texture__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./texture */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture.js");
/* harmony import */ var _utils_load_file__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/load-file */ "./node_modules/@luma.gl/webgl/dist/esm/utils/load-file.js");
/* provided dependency */ var Promise = __webpack_require__(/*! es6-promise */ "./node_modules/es6-promise/dist/es6-promise.js");



class Texture2D extends _texture__WEBPACK_IMPORTED_MODULE_1__["default"] {
  static isSupported(gl, opts) {
    return _texture__WEBPACK_IMPORTED_MODULE_1__["default"].isSupported(gl, opts);
  }

  constructor(gl, props = {}) {
    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGLContext)(gl);

    if (props instanceof Promise || typeof props === 'string') {
      props = {
        data: props
      };
    }

    if (typeof props.data === 'string') {
      props = Object.assign({}, props, {
        data: (0,_utils_load_file__WEBPACK_IMPORTED_MODULE_2__.loadImage)(props.data)
      });
    }

    super(gl, Object.assign({}, props, {
      target: 3553
    }));
    this.initialize(props);
    Object.seal(this);
  }

}
//# sourceMappingURL=texture-2d.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture-3d.js":
/*!********************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/texture-3d.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Texture3D)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _texture__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./texture */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture.js");
/* harmony import */ var _texture_formats__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./texture-formats */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture-formats.js");
/* harmony import */ var _buffer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./buffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js");




class Texture3D extends _texture__WEBPACK_IMPORTED_MODULE_1__["default"] {
  static isSupported(gl) {
    return (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl);
  }

  constructor(gl, props = {}) {
    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(gl);
    props = Object.assign({
      depth: 1
    }, props, {
      target: 32879,
      unpackFlipY: false
    });
    super(gl, props);
    this.initialize(props);
    Object.seal(this);
  }

  setImageData({
    level = 0,
    dataFormat = 6408,
    width,
    height,
    depth = 1,
    border = 0,
    format,
    type = 5121,
    offset = 0,
    data,
    parameters = {}
  }) {
    this._trackDeallocatedMemory('Texture');

    this.gl.bindTexture(this.target, this.handle);
    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.withParameters)(this.gl, parameters, () => {
      if (ArrayBuffer.isView(data)) {
        this.gl.texImage3D(this.target, level, dataFormat, width, height, depth, border, format, type, data);
      }

      if (data instanceof _buffer__WEBPACK_IMPORTED_MODULE_2__["default"]) {
        this.gl.bindBuffer(35052, data.handle);
        this.gl.texImage3D(this.target, level, dataFormat, width, height, depth, border, format, type, offset);
      }
    });

    if (data && data.byteLength) {
      this._trackAllocatedMemory(data.byteLength, 'Texture');
    } else {
      const channels = _texture_formats__WEBPACK_IMPORTED_MODULE_3__.DATA_FORMAT_CHANNELS[this.dataFormat] || 4;
      const channelSize = _texture_formats__WEBPACK_IMPORTED_MODULE_3__.TYPE_SIZES[this.type] || 1;

      this._trackAllocatedMemory(this.width * this.height * this.depth * channels * channelSize, 'Texture');
    }

    this.loaded = true;
    return this;
  }

}
//# sourceMappingURL=texture-3d.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture-cube.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/texture-cube.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ TextureCube)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _texture__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./texture */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture.js");
/* provided dependency */ var Promise = __webpack_require__(/*! es6-promise */ "./node_modules/es6-promise/dist/es6-promise.js");


const FACES = [34069, 34070, 34071, 34072, 34073, 34074];
class TextureCube extends _texture__WEBPACK_IMPORTED_MODULE_1__["default"] {
  constructor(gl, props = {}) {
    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGLContext)(gl);
    super(gl, Object.assign({}, props, {
      target: 34067
    }));
    this.initialize(props);
    Object.seal(this);
  }

  initialize(props = {}) {
    const {
      mipmaps = true,
      parameters = {}
    } = props;
    this.opts = props;
    this.setCubeMapImageData(props).then(() => {
      this.loaded = true;

      if (mipmaps) {
        this.generateMipmap(props);
      }

      this.setParameters(parameters);
    });
    return this;
  }

  subImage({
    face,
    data,
    x = 0,
    y = 0,
    mipmapLevel = 0
  }) {
    return this._subImage({
      target: face,
      data,
      x,
      y,
      mipmapLevel
    });
  }

  async setCubeMapImageData({
    width,
    height,
    pixels,
    data,
    border = 0,
    format = 6408,
    type = 5121
  }) {
    const {
      gl
    } = this;
    const imageDataMap = pixels || data;
    const resolvedFaces = await Promise.all(FACES.map(face => {
      const facePixels = imageDataMap[face];
      return Promise.all(Array.isArray(facePixels) ? facePixels : [facePixels]);
    }));
    this.bind();
    FACES.forEach((face, index) => {
      if (resolvedFaces[index].length > 1 && this.opts.mipmaps !== false) {
        _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.warn(`${this.id} has mipmap and multiple LODs.`)();
      }

      resolvedFaces[index].forEach((image, lodLevel) => {
        if (width && height) {
          gl.texImage2D(face, lodLevel, format, width, height, border, format, type, image);
        } else {
          gl.texImage2D(face, lodLevel, format, format, type, image);
        }
      });
    });
    this.unbind();
  }

  setImageDataForFace(options) {
    const {
      face,
      width,
      height,
      pixels,
      data,
      border = 0,
      format = 6408,
      type = 5121
    } = options;
    const {
      gl
    } = this;
    const imageData = pixels || data;
    this.bind();

    if (imageData instanceof Promise) {
      imageData.then(resolvedImageData => this.setImageDataForFace(Object.assign({}, options, {
        face,
        data: resolvedImageData,
        pixels: resolvedImageData
      })));
    } else if (this.width || this.height) {
      gl.texImage2D(face, 0, format, width, height, border, format, type, imageData);
    } else {
      gl.texImage2D(face, 0, format, format, type, imageData);
    }

    return this;
  }

}
TextureCube.FACES = FACES;
//# sourceMappingURL=texture-cube.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture-formats.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/texture-formats.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TEXTURE_FORMATS": () => (/* binding */ TEXTURE_FORMATS),
/* harmony export */   "DATA_FORMAT_CHANNELS": () => (/* binding */ DATA_FORMAT_CHANNELS),
/* harmony export */   "TYPE_SIZES": () => (/* binding */ TYPE_SIZES),
/* harmony export */   "isFormatSupported": () => (/* binding */ isFormatSupported),
/* harmony export */   "isLinearFilteringSupported": () => (/* binding */ isLinearFilteringSupported)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");

const TEXTURE_FORMATS = {
  [6407]: {
    dataFormat: 6407,
    types: [5121, 33635]
  },
  [6408]: {
    dataFormat: 6408,
    types: [5121, 32819, 32820]
  },
  [6406]: {
    dataFormat: 6406,
    types: [5121]
  },
  [6409]: {
    dataFormat: 6409,
    types: [5121]
  },
  [6410]: {
    dataFormat: 6410,
    types: [5121]
  },
  [33326]: {
    dataFormat: 6403,
    types: [5126],
    gl2: true
  },
  [33328]: {
    dataFormat: 33319,
    types: [5126],
    gl2: true
  },
  [34837]: {
    dataFormat: 6407,
    types: [5126],
    gl2: true
  },
  [34836]: {
    dataFormat: 6408,
    types: [5126],
    gl2: true
  }
};
const DATA_FORMAT_CHANNELS = {
  [6403]: 1,
  [36244]: 1,
  [33319]: 2,
  [33320]: 2,
  [6407]: 3,
  [36248]: 3,
  [6408]: 4,
  [36249]: 4,
  [6402]: 1,
  [34041]: 1,
  [6406]: 1,
  [6409]: 1,
  [6410]: 2
};
const TYPE_SIZES = {
  [5126]: 4,
  [5125]: 4,
  [5124]: 4,
  [5123]: 2,
  [5122]: 2,
  [5131]: 2,
  [5120]: 1,
  [5121]: 1
};
function isFormatSupported(gl, format) {
  const info = TEXTURE_FORMATS[format];

  if (!info) {
    return false;
  }

  if (info.gl1 === undefined && info.gl2 === undefined) {
    return true;
  }

  const value = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl) ? info.gl2 || info.gl1 : info.gl1;
  return typeof value === 'string' ? gl.getExtension(value) : value;
}
function isLinearFilteringSupported(gl, format) {
  const info = TEXTURE_FORMATS[format];

  switch (info && info.types[0]) {
    case 5126:
      return gl.getExtension('OES_texture_float_linear');

    case 5131:
      return gl.getExtension('OES_texture_half_float_linear');

    default:
      return true;
  }
}
//# sourceMappingURL=texture-formats.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/texture.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Texture)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var probe_gl_env__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! probe.gl/env */ "./node_modules/probe.gl/dist/es5/env/index.js");
/* harmony import */ var _resource__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./resource */ "./node_modules/@luma.gl/webgl/dist/esm/classes/resource.js");
/* harmony import */ var _buffer__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./buffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js");
/* harmony import */ var _texture_formats__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./texture-formats */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture-formats.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/utils */ "./node_modules/@luma.gl/webgl/dist/esm/utils/utils.js");
/* provided dependency */ var Promise = __webpack_require__(/*! es6-promise */ "./node_modules/es6-promise/dist/es6-promise.js");







const NPOT_MIN_FILTERS = [9729, 9728];

const WebGLBuffer = probe_gl_env__WEBPACK_IMPORTED_MODULE_1__.global.WebGLBuffer || function WebGLBuffer() {};

class Texture extends _resource__WEBPACK_IMPORTED_MODULE_2__["default"] {
  static isSupported(gl, opts = {}) {
    const {
      format,
      linearFiltering
    } = opts;
    let supported = true;

    if (format) {
      supported = supported && (0,_texture_formats__WEBPACK_IMPORTED_MODULE_3__.isFormatSupported)(gl, format);
      supported = supported && (!linearFiltering || (0,_texture_formats__WEBPACK_IMPORTED_MODULE_3__.isLinearFilteringSupported)(gl, format));
    }

    return supported;
  }

  constructor(gl, props) {
    const {
      id = (0,_utils_utils__WEBPACK_IMPORTED_MODULE_4__.uid)('texture'),
      handle,
      target
    } = props;
    super(gl, {
      id,
      handle
    });
    this.target = target;
    this.textureUnit = undefined;
    this.loaded = false;
    this.width = undefined;
    this.height = undefined;
    this.depth = undefined;
    this.format = undefined;
    this.type = undefined;
    this.dataFormat = undefined;
    this.border = undefined;
    this.textureUnit = undefined;
    this.mipmaps = undefined;
  }

  toString() {
    return `Texture(${this.id},${this.width}x${this.height})`;
  }

  initialize(props = {}) {
    let data = props.data;

    if (data instanceof Promise) {
      data.then(resolvedImageData => this.initialize(Object.assign({}, props, {
        pixels: resolvedImageData,
        data: resolvedImageData
      })));
      return this;
    }

    const isVideo = typeof HTMLVideoElement !== 'undefined' && data instanceof HTMLVideoElement;

    if (isVideo && data.readyState < HTMLVideoElement.HAVE_METADATA) {
      this._video = null;
      data.addEventListener('loadeddata', () => this.initialize(props));
      return this;
    }

    const {
      pixels = null,
      format = 6408,
      border = 0,
      recreate = false,
      parameters = {},
      pixelStore = {},
      textureUnit = undefined
    } = props;

    if (!data) {
      data = pixels;
    }

    let {
      width,
      height,
      dataFormat,
      type,
      compressed = false,
      mipmaps = true
    } = props;
    const {
      depth = 0
    } = props;
    ({
      width,
      height,
      compressed,
      dataFormat,
      type
    } = this._deduceParameters({
      format,
      type,
      dataFormat,
      compressed,
      data,
      width,
      height
    }));
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.format = format;
    this.type = type;
    this.dataFormat = dataFormat;
    this.border = border;
    this.textureUnit = textureUnit;

    if (Number.isFinite(this.textureUnit)) {
      this.gl.activeTexture(33984 + this.textureUnit);
      this.gl.bindTexture(this.target, this.handle);
    }

    if (mipmaps && this._isNPOT()) {
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.warn(`texture: ${this} is Non-Power-Of-Two, disabling mipmaping`)();
      mipmaps = false;

      this._updateForNPOT(parameters);
    }

    this.mipmaps = mipmaps;
    this.setImageData({
      data,
      width,
      height,
      depth,
      format,
      type,
      dataFormat,
      border,
      mipmaps,
      parameters: pixelStore,
      compressed
    });

    if (mipmaps) {
      this.generateMipmap();
    }

    this.setParameters(parameters);

    if (recreate) {
      this.data = data;
    }

    if (isVideo) {
      this._video = {
        video: data,
        parameters,
        lastTime: data.readyState >= HTMLVideoElement.HAVE_CURRENT_DATA ? data.currentTime : -1
      };
    }

    return this;
  }

  update() {
    if (this._video) {
      const {
        video,
        parameters,
        lastTime
      } = this._video;

      if (lastTime === video.currentTime || video.readyState < HTMLVideoElement.HAVE_CURRENT_DATA) {
        return;
      }

      this.setSubImageData({
        data: video,
        parameters
      });

      if (this.mipmaps) {
        this.generateMipmap();
      }

      this._video.lastTime = video.currentTime;
    }
  }

  resize({
    height,
    width,
    mipmaps = false
  }) {
    if (width !== this.width || height !== this.height) {
      return this.initialize({
        width,
        height,
        format: this.format,
        type: this.type,
        dataFormat: this.dataFormat,
        border: this.border,
        mipmaps
      });
    }

    return this;
  }

  generateMipmap(params = {}) {
    if (this._isNPOT()) {
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.warn(`texture: ${this} is Non-Power-Of-Two, disabling mipmaping`)();
      return this;
    }

    this.mipmaps = true;
    this.gl.bindTexture(this.target, this.handle);
    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.withParameters)(this.gl, params, () => {
      this.gl.generateMipmap(this.target);
    });
    this.gl.bindTexture(this.target, null);
    return this;
  }

  setImageData(options) {
    this._trackDeallocatedMemory('Texture');

    const {
      target = this.target,
      pixels = null,
      level = 0,
      format = this.format,
      border = this.border,
      offset = 0,
      parameters = {}
    } = options;
    let {
      data = null,
      type = this.type,
      width = this.width,
      height = this.height,
      dataFormat = this.dataFormat,
      compressed = false
    } = options;

    if (!data) {
      data = pixels;
    }

    ({
      type,
      dataFormat,
      compressed,
      width,
      height
    } = this._deduceParameters({
      format,
      type,
      dataFormat,
      compressed,
      data,
      width,
      height
    }));
    const {
      gl
    } = this;
    gl.bindTexture(this.target, this.handle);
    let dataType = null;
    ({
      data,
      dataType
    } = this._getDataType({
      data,
      compressed
    }));
    let gl2;
    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.withParameters)(this.gl, parameters, () => {
      switch (dataType) {
        case 'null':
          gl.texImage2D(target, level, format, width, height, border, dataFormat, type, data);
          break;

        case 'typed-array':
          gl.texImage2D(target, level, format, width, height, border, dataFormat, type, data, offset);
          break;

        case 'buffer':
          gl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(gl);
          gl2.bindBuffer(35052, data.handle || data);
          gl2.texImage2D(target, level, format, width, height, border, dataFormat, type, offset);
          gl2.bindBuffer(35052, null);
          break;

        case 'browser-object':
          if ((0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl)) {
            gl.texImage2D(target, level, format, width, height, border, dataFormat, type, data);
          } else {
            gl.texImage2D(target, level, format, dataFormat, type, data);
          }

          break;

        case 'compressed':
          for (const [levelIndex, levelData] of data.entries()) {
            gl.compressedTexImage2D(target, levelIndex, levelData.format, levelData.width, levelData.height, border, levelData.data);
          }

          break;

        default:
          (0,_utils_assert__WEBPACK_IMPORTED_MODULE_5__.assert)(false, 'Unknown image data type');
      }
    });

    if (data && data.byteLength) {
      this._trackAllocatedMemory(data.byteLength, 'Texture');
    } else {
      const channels = _texture_formats__WEBPACK_IMPORTED_MODULE_3__.DATA_FORMAT_CHANNELS[this.dataFormat] || 4;
      const channelSize = _texture_formats__WEBPACK_IMPORTED_MODULE_3__.TYPE_SIZES[this.type] || 1;

      this._trackAllocatedMemory(this.width * this.height * channels * channelSize, 'Texture');
    }

    this.loaded = true;
    return this;
  }

  setSubImageData({
    target = this.target,
    pixels = null,
    data = null,
    x = 0,
    y = 0,
    width = this.width,
    height = this.height,
    level = 0,
    format = this.format,
    type = this.type,
    dataFormat = this.dataFormat,
    compressed = false,
    offset = 0,
    border = this.border,
    parameters = {}
  }) {
    ({
      type,
      dataFormat,
      compressed,
      width,
      height
    } = this._deduceParameters({
      format,
      type,
      dataFormat,
      compressed,
      data,
      width,
      height
    }));
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_5__.assert)(this.depth === 0, 'texSubImage not supported for 3D textures');

    if (!data) {
      data = pixels;
    }

    if (data && data.data) {
      const ndarray = data;
      data = ndarray.data;
      width = ndarray.shape[0];
      height = ndarray.shape[1];
    }

    if (data instanceof _buffer__WEBPACK_IMPORTED_MODULE_6__["default"]) {
      data = data.handle;
    }

    this.gl.bindTexture(this.target, this.handle);
    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.withParameters)(this.gl, parameters, () => {
      if (compressed) {
        this.gl.compressedTexSubImage2D(target, level, x, y, width, height, format, data);
      } else if (data === null) {
        this.gl.texSubImage2D(target, level, x, y, width, height, dataFormat, type, null);
      } else if (ArrayBuffer.isView(data)) {
        this.gl.texSubImage2D(target, level, x, y, width, height, dataFormat, type, data, offset);
      } else if (data instanceof WebGLBuffer) {
        const gl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(this.gl);
        gl2.bindBuffer(35052, data);
        gl2.texSubImage2D(target, level, x, y, width, height, dataFormat, type, offset);
        gl2.bindBuffer(35052, null);
      } else if ((0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(this.gl)) {
        const gl2 = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(this.gl);
        gl2.texSubImage2D(target, level, x, y, width, height, dataFormat, type, data);
      } else {
        this.gl.texSubImage2D(target, level, x, y, dataFormat, type, data);
      }
    });
    this.gl.bindTexture(this.target, null);
  }

  copyFramebuffer(opts = {}) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.error('Texture.copyFramebuffer({...}) is no logner supported, use copyToTexture(source, target, opts})')();
    return null;
  }

  getActiveUnit() {
    return this.gl.getParameter(34016) - 33984;
  }

  bind(textureUnit = this.textureUnit) {
    const {
      gl
    } = this;

    if (textureUnit !== undefined) {
      this.textureUnit = textureUnit;
      gl.activeTexture(33984 + textureUnit);
    }

    gl.bindTexture(this.target, this.handle);
    return textureUnit;
  }

  unbind(textureUnit = this.textureUnit) {
    const {
      gl
    } = this;

    if (textureUnit !== undefined) {
      this.textureUnit = textureUnit;
      gl.activeTexture(33984 + textureUnit);
    }

    gl.bindTexture(this.target, null);
    return textureUnit;
  }

  _getDataType({
    data,
    compressed = false
  }) {
    if (compressed) {
      return {
        data,
        dataType: 'compressed'
      };
    }

    if (data === null) {
      return {
        data,
        dataType: 'null'
      };
    }

    if (ArrayBuffer.isView(data)) {
      return {
        data,
        dataType: 'typed-array'
      };
    }

    if (data instanceof _buffer__WEBPACK_IMPORTED_MODULE_6__["default"]) {
      return {
        data: data.handle,
        dataType: 'buffer'
      };
    }

    if (data instanceof WebGLBuffer) {
      return {
        data,
        dataType: 'buffer'
      };
    }

    return {
      data,
      dataType: 'browser-object'
    };
  }

  _deduceParameters(opts) {
    const {
      format,
      data
    } = opts;
    let {
      width,
      height,
      dataFormat,
      type,
      compressed
    } = opts;
    const textureFormat = _texture_formats__WEBPACK_IMPORTED_MODULE_3__.TEXTURE_FORMATS[format];
    dataFormat = dataFormat || textureFormat && textureFormat.dataFormat;
    type = type || textureFormat && textureFormat.types[0];
    compressed = compressed || textureFormat && textureFormat.compressed;
    ({
      width,
      height
    } = this._deduceImageSize(data, width, height));
    return {
      dataFormat,
      type,
      compressed,
      width,
      height,
      format,
      data
    };
  }

  _deduceImageSize(data, width, height) {
    let size;

    if (typeof ImageData !== 'undefined' && data instanceof ImageData) {
      size = {
        width: data.width,
        height: data.height
      };
    } else if (typeof HTMLImageElement !== 'undefined' && data instanceof HTMLImageElement) {
      size = {
        width: data.naturalWidth,
        height: data.naturalHeight
      };
    } else if (typeof HTMLCanvasElement !== 'undefined' && data instanceof HTMLCanvasElement) {
      size = {
        width: data.width,
        height: data.height
      };
    } else if (typeof ImageBitmap !== 'undefined' && data instanceof ImageBitmap) {
      size = {
        width: data.width,
        height: data.height
      };
    } else if (typeof HTMLVideoElement !== 'undefined' && data instanceof HTMLVideoElement) {
      size = {
        width: data.videoWidth,
        height: data.videoHeight
      };
    } else if (!data) {
      size = {
        width: width >= 0 ? width : 1,
        height: height >= 0 ? height : 1
      };
    } else {
      size = {
        width,
        height
      };
    }

    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_5__.assert)(size, 'Could not deduced texture size');
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_5__.assert)(width === undefined || size.width === width, 'Deduced texture width does not match supplied width');
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_5__.assert)(height === undefined || size.height === height, 'Deduced texture height does not match supplied height');
    return size;
  }

  _createHandle() {
    return this.gl.createTexture();
  }

  _deleteHandle() {
    this.gl.deleteTexture(this.handle);

    this._trackDeallocatedMemory('Texture');
  }

  _getParameter(pname) {
    switch (pname) {
      case 4096:
        return this.width;

      case 4097:
        return this.height;

      default:
        this.gl.bindTexture(this.target, this.handle);
        const value = this.gl.getTexParameter(this.target, pname);
        this.gl.bindTexture(this.target, null);
        return value;
    }
  }

  _setParameter(pname, param) {
    this.gl.bindTexture(this.target, this.handle);
    param = this._getNPOTParam(pname, param);

    switch (pname) {
      case 33082:
      case 33083:
        this.gl.texParameterf(this.handle, pname, param);
        break;

      case 4096:
      case 4097:
        (0,_utils_assert__WEBPACK_IMPORTED_MODULE_5__.assert)(false);
        break;

      default:
        this.gl.texParameteri(this.target, pname, param);
        break;
    }

    this.gl.bindTexture(this.target, null);
    return this;
  }

  _isNPOT() {
    if ((0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(this.gl)) {
      return false;
    }

    if (!this.width || !this.height) {
      return false;
    }

    return !(0,_utils_utils__WEBPACK_IMPORTED_MODULE_4__.isPowerOfTwo)(this.width) || !(0,_utils_utils__WEBPACK_IMPORTED_MODULE_4__.isPowerOfTwo)(this.height);
  }

  _updateForNPOT(parameters) {
    if (parameters[this.gl.TEXTURE_MIN_FILTER] === undefined) {
      parameters[this.gl.TEXTURE_MIN_FILTER] = this.gl.LINEAR;
    }

    if (parameters[this.gl.TEXTURE_WRAP_S] === undefined) {
      parameters[this.gl.TEXTURE_WRAP_S] = this.gl.CLAMP_TO_EDGE;
    }

    if (parameters[this.gl.TEXTURE_WRAP_T] === undefined) {
      parameters[this.gl.TEXTURE_WRAP_T] = this.gl.CLAMP_TO_EDGE;
    }
  }

  _getNPOTParam(pname, param) {
    if (this._isNPOT()) {
      switch (pname) {
        case 10241:
          if (NPOT_MIN_FILTERS.indexOf(param) === -1) {
            param = 9729;
          }

          break;

        case 10242:
        case 10243:
          if (param !== 33071) {
            param = 33071;
          }

          break;

        default:
          break;
      }
    }

    return param;
  }

}
//# sourceMappingURL=texture.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/transform-feedback.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/transform-feedback.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ TransformFeedback)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _resource__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./resource */ "./node_modules/@luma.gl/webgl/dist/esm/classes/resource.js");
/* harmony import */ var _buffer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./buffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js");
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/utils */ "./node_modules/@luma.gl/webgl/dist/esm/utils/utils.js");




class TransformFeedback extends _resource__WEBPACK_IMPORTED_MODULE_1__["default"] {
  static isSupported(gl) {
    return (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl);
  }

  constructor(gl, props = {}) {
    (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.assertWebGL2Context)(gl);
    super(gl, props);
    this.initialize(props);
    this.stubRemovedMethods('TransformFeedback', 'v6.0', ['pause', 'resume']);
    Object.seal(this);
  }

  initialize(props = {}) {
    this.buffers = {};
    this.unused = {};
    this.configuration = null;
    this.bindOnUse = true;

    if (!(0,_utils_utils__WEBPACK_IMPORTED_MODULE_2__.isObjectEmpty)(this.buffers)) {
      this.bind(() => this._unbindBuffers());
    }

    this.setProps(props);
    return this;
  }

  setProps(props) {
    if ('program' in props) {
      this.configuration = props.program && props.program.configuration;
    }

    if ('configuration' in props) {
      this.configuration = props.configuration;
    }

    if ('bindOnUse' in props) {
      props = props.bindOnUse;
    }

    if ('buffers' in props) {
      this.setBuffers(props.buffers);
    }
  }

  setBuffers(buffers = {}) {
    this.bind(() => {
      for (const bufferName in buffers) {
        this.setBuffer(bufferName, buffers[bufferName]);
      }
    });
    return this;
  }

  setBuffer(locationOrName, bufferOrParams) {
    const location = this._getVaryingIndex(locationOrName);

    const {
      buffer,
      byteSize,
      byteOffset
    } = this._getBufferParams(bufferOrParams);

    if (location < 0) {
      this.unused[locationOrName] = buffer;
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.warn(() => `${this.id} unused varying buffer ${locationOrName}`)();
      return this;
    }

    this.buffers[location] = bufferOrParams;

    if (!this.bindOnUse) {
      this._bindBuffer(location, buffer, byteOffset, byteSize);
    }

    return this;
  }

  begin(primitiveMode = 0) {
    this.gl.bindTransformFeedback(36386, this.handle);

    this._bindBuffers();

    this.gl.beginTransformFeedback(primitiveMode);
    return this;
  }

  end() {
    this.gl.endTransformFeedback();

    this._unbindBuffers();

    this.gl.bindTransformFeedback(36386, null);
    return this;
  }

  _getBufferParams(bufferOrParams) {
    let byteOffset;
    let byteSize;
    let buffer;

    if (bufferOrParams instanceof _buffer__WEBPACK_IMPORTED_MODULE_3__["default"] === false) {
      buffer = bufferOrParams.buffer;
      byteSize = bufferOrParams.byteSize;
      byteOffset = bufferOrParams.byteOffset;
    } else {
      buffer = bufferOrParams;
    }

    if (byteOffset !== undefined || byteSize !== undefined) {
      byteOffset = byteOffset || 0;
      byteSize = byteSize || buffer.byteLength - byteOffset;
    }

    return {
      buffer,
      byteOffset,
      byteSize
    };
  }

  _getVaryingInfo(locationOrName) {
    return this.configuration && this.configuration.getVaryingInfo(locationOrName);
  }

  _getVaryingIndex(locationOrName) {
    if (this.configuration) {
      return this.configuration.getVaryingInfo(locationOrName).location;
    }

    const location = Number(locationOrName);
    return Number.isFinite(location) ? location : -1;
  }

  _bindBuffers() {
    if (this.bindOnUse) {
      for (const bufferIndex in this.buffers) {
        const {
          buffer,
          byteSize,
          byteOffset
        } = this._getBufferParams(this.buffers[bufferIndex]);

        this._bindBuffer(bufferIndex, buffer, byteOffset, byteSize);
      }
    }
  }

  _unbindBuffers() {
    if (this.bindOnUse) {
      for (const bufferIndex in this.buffers) {
        this._bindBuffer(bufferIndex, null);
      }
    }
  }

  _bindBuffer(index, buffer, byteOffset = 0, byteSize) {
    const handle = buffer && buffer.handle;

    if (!handle || byteSize === undefined) {
      this.gl.bindBufferBase(35982, index, handle);
    } else {
      this.gl.bindBufferRange(35982, index, handle, byteOffset, byteSize);
    }

    return this;
  }

  _createHandle() {
    return this.gl.createTransformFeedback();
  }

  _deleteHandle() {
    this.gl.deleteTransformFeedback(this.handle);
  }

  _bindHandle(handle) {
    this.gl.bindTransformFeedback(36386, this.handle);
  }

}
//# sourceMappingURL=transform-feedback.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/uniforms.js":
/*!******************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/uniforms.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getUniformSetter": () => (/* binding */ getUniformSetter),
/* harmony export */   "parseUniformName": () => (/* binding */ parseUniformName),
/* harmony export */   "checkUniformValues": () => (/* binding */ checkUniformValues),
/* harmony export */   "copyUniform": () => (/* binding */ copyUniform)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _framebuffer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./framebuffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/framebuffer.js");
/* harmony import */ var _renderbuffer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./renderbuffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/renderbuffer.js");
/* harmony import */ var _texture__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./texture */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");





const UNIFORM_SETTERS = {
  [5126]: getArraySetter.bind(null, 'uniform1fv', toFloatArray, 1, setVectorUniform),
  [35664]: getArraySetter.bind(null, 'uniform2fv', toFloatArray, 2, setVectorUniform),
  [35665]: getArraySetter.bind(null, 'uniform3fv', toFloatArray, 3, setVectorUniform),
  [35666]: getArraySetter.bind(null, 'uniform4fv', toFloatArray, 4, setVectorUniform),
  [5124]: getArraySetter.bind(null, 'uniform1iv', toIntArray, 1, setVectorUniform),
  [35667]: getArraySetter.bind(null, 'uniform2iv', toIntArray, 2, setVectorUniform),
  [35668]: getArraySetter.bind(null, 'uniform3iv', toIntArray, 3, setVectorUniform),
  [35669]: getArraySetter.bind(null, 'uniform4iv', toIntArray, 4, setVectorUniform),
  [35670]: getArraySetter.bind(null, 'uniform1iv', toIntArray, 1, setVectorUniform),
  [35671]: getArraySetter.bind(null, 'uniform2iv', toIntArray, 2, setVectorUniform),
  [35672]: getArraySetter.bind(null, 'uniform3iv', toIntArray, 3, setVectorUniform),
  [35673]: getArraySetter.bind(null, 'uniform4iv', toIntArray, 4, setVectorUniform),
  [35674]: getArraySetter.bind(null, 'uniformMatrix2fv', toFloatArray, 4, setMatrixUniform),
  [35675]: getArraySetter.bind(null, 'uniformMatrix3fv', toFloatArray, 9, setMatrixUniform),
  [35676]: getArraySetter.bind(null, 'uniformMatrix4fv', toFloatArray, 16, setMatrixUniform),
  [35678]: getSamplerSetter,
  [35680]: getSamplerSetter,
  [5125]: getArraySetter.bind(null, 'uniform1uiv', toUIntArray, 1, setVectorUniform),
  [36294]: getArraySetter.bind(null, 'uniform2uiv', toUIntArray, 2, setVectorUniform),
  [36295]: getArraySetter.bind(null, 'uniform3uiv', toUIntArray, 3, setVectorUniform),
  [36296]: getArraySetter.bind(null, 'uniform4uiv', toUIntArray, 4, setVectorUniform),
  [35685]: getArraySetter.bind(null, 'uniformMatrix2x3fv', toFloatArray, 6, setMatrixUniform),
  [35686]: getArraySetter.bind(null, 'uniformMatrix2x4fv', toFloatArray, 8, setMatrixUniform),
  [35687]: getArraySetter.bind(null, 'uniformMatrix3x2fv', toFloatArray, 6, setMatrixUniform),
  [35688]: getArraySetter.bind(null, 'uniformMatrix3x4fv', toFloatArray, 12, setMatrixUniform),
  [35689]: getArraySetter.bind(null, 'uniformMatrix4x2fv', toFloatArray, 8, setMatrixUniform),
  [35690]: getArraySetter.bind(null, 'uniformMatrix4x3fv', toFloatArray, 12, setMatrixUniform),
  [35678]: getSamplerSetter,
  [35680]: getSamplerSetter,
  [35679]: getSamplerSetter,
  [35682]: getSamplerSetter,
  [36289]: getSamplerSetter,
  [36292]: getSamplerSetter,
  [36293]: getSamplerSetter,
  [36298]: getSamplerSetter,
  [36299]: getSamplerSetter,
  [36300]: getSamplerSetter,
  [36303]: getSamplerSetter,
  [36306]: getSamplerSetter,
  [36307]: getSamplerSetter,
  [36308]: getSamplerSetter,
  [36311]: getSamplerSetter
};
const FLOAT_ARRAY = {};
const INT_ARRAY = {};
const UINT_ARRAY = {};
const array1 = [0];

function toTypedArray(value, uniformLength, Type, cache) {
  if (uniformLength === 1 && typeof value === 'boolean') {
    value = value ? 1 : 0;
  }

  if (Number.isFinite(value)) {
    array1[0] = value;
    value = array1;
  }

  const length = value.length;

  if (length % uniformLength) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.warn(`Uniform size should be multiples of ${uniformLength}`, value)();
  }

  if (value instanceof Type) {
    return value;
  }

  let result = cache[length];

  if (!result) {
    result = new Type(length);
    cache[length] = result;
  }

  for (let i = 0; i < length; i++) {
    result[i] = value[i];
  }

  return result;
}

function toFloatArray(value, uniformLength) {
  return toTypedArray(value, uniformLength, Float32Array, FLOAT_ARRAY);
}

function toIntArray(value, uniformLength) {
  return toTypedArray(value, uniformLength, Int32Array, INT_ARRAY);
}

function toUIntArray(value, uniformLength) {
  return toTypedArray(value, uniformLength, Uint32Array, UINT_ARRAY);
}

function getUniformSetter(gl, location, info) {
  const setter = UNIFORM_SETTERS[info.type];

  if (!setter) {
    throw new Error(`Unknown GLSL uniform type ${info.type}`);
  }

  return setter().bind(null, gl, location);
}
function parseUniformName(name) {
  if (name[name.length - 1] !== ']') {
    return {
      name,
      length: 1,
      isArray: false
    };
  }

  const UNIFORM_NAME_REGEXP = /([^[]*)(\[[0-9]+\])?/;
  const matches = name.match(UNIFORM_NAME_REGEXP);

  if (!matches || matches.length < 2) {
    throw new Error(`Failed to parse GLSL uniform name ${name}`);
  }

  return {
    name: matches[1],
    length: matches[2] || 1,
    isArray: Boolean(matches[2])
  };
}
function checkUniformValues(uniforms, source, uniformMap) {
  for (const uniformName in uniforms) {
    const value = uniforms[uniformName];
    const shouldCheck = !uniformMap || Boolean(uniformMap[uniformName]);

    if (shouldCheck && !checkUniformValue(value)) {
      source = source ? `${source} ` : '';
      console.error(`${source} Bad uniform ${uniformName}`, value);
      throw new Error(`${source} Bad uniform ${uniformName}`);
    }
  }

  return true;
}

function checkUniformValue(value) {
  if (Array.isArray(value) || ArrayBuffer.isView(value)) {
    return checkUniformArray(value);
  }

  if (isFinite(value)) {
    return true;
  } else if (value === true || value === false) {
    return true;
  } else if (value instanceof _texture__WEBPACK_IMPORTED_MODULE_1__["default"]) {
    return true;
  } else if (value instanceof _renderbuffer__WEBPACK_IMPORTED_MODULE_2__["default"]) {
    return true;
  } else if (value instanceof _framebuffer__WEBPACK_IMPORTED_MODULE_3__["default"]) {
    return Boolean(value.texture);
  }

  return false;
}

function copyUniform(uniforms, key, value) {
  if (Array.isArray(value) || ArrayBuffer.isView(value)) {
    if (uniforms[key]) {
      const dest = uniforms[key];

      for (let i = 0, len = value.length; i < len; ++i) {
        dest[i] = value[i];
      }
    } else {
      uniforms[key] = value.slice();
    }
  } else {
    uniforms[key] = value;
  }
}

function checkUniformArray(value) {
  if (value.length === 0) {
    return false;
  }

  const checkLength = Math.min(value.length, 16);

  for (let i = 0; i < checkLength; ++i) {
    if (!Number.isFinite(value[i])) {
      return false;
    }
  }

  return true;
}

function getSamplerSetter() {
  let cache = null;
  return (gl, location, value) => {
    const update = cache !== value;

    if (update) {
      gl.uniform1i(location, value);
      cache = value;
    }

    return update;
  };
}

function getArraySetter(functionName, toArray, size, uniformSetter) {
  let cache = null;
  let cacheLength = null;
  return (gl, location, value) => {
    const arrayValue = toArray(value, size);
    const length = arrayValue.length;
    let update = false;

    if (cache === null) {
      cache = new Float32Array(length);
      cacheLength = length;
      update = true;
    } else {
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_4__.assert)(cacheLength === length, 'Uniform length cannot change.');

      for (let i = 0; i < length; ++i) {
        if (arrayValue[i] !== cache[i]) {
          update = true;
          break;
        }
      }
    }

    if (update) {
      uniformSetter(gl, functionName, location, arrayValue);
      cache.set(arrayValue);
    }

    return update;
  };
}

function setVectorUniform(gl, functionName, location, value) {
  gl[functionName](location, value);
}

function setMatrixUniform(gl, functionName, location, value) {
  gl[functionName](location, false, value);
}
//# sourceMappingURL=uniforms.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/vertex-array-object.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/vertex-array-object.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ VertexArrayObject)
/* harmony export */ });
/* harmony import */ var _resource__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./resource */ "./node_modules/@luma.gl/webgl/dist/esm/classes/resource.js");
/* harmony import */ var _buffer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./buffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js");
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _utils_array_utils_flat__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/array-utils-flat */ "./node_modules/@luma.gl/webgl/dist/esm/utils/array-utils-flat.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* harmony import */ var probe_gl__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! probe.gl */ "./node_modules/probe.gl/dist/esm/env/get-browser.js");






const ERR_ELEMENTS = 'elements must be GL.ELEMENT_ARRAY_BUFFER';
class VertexArrayObject extends _resource__WEBPACK_IMPORTED_MODULE_1__["default"] {
  static isSupported(gl, options = {}) {
    if (options.constantAttributeZero) {
      return (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl) || (0,probe_gl__WEBPACK_IMPORTED_MODULE_2__["default"])() === 'Chrome';
    }

    return true;
  }

  static getDefaultArray(gl) {
    gl.luma = gl.luma || {};

    if (!gl.luma.defaultVertexArray) {
      gl.luma.defaultVertexArray = new VertexArrayObject(gl, {
        handle: null,
        isDefaultArray: true
      });
    }

    return gl.luma.defaultVertexArray;
  }

  static getMaxAttributes(gl) {
    VertexArrayObject.MAX_ATTRIBUTES = VertexArrayObject.MAX_ATTRIBUTES || gl.getParameter(34921);
    return VertexArrayObject.MAX_ATTRIBUTES;
  }

  static setConstant(gl, location, array) {
    switch (array.constructor) {
      case Float32Array:
        VertexArrayObject._setConstantFloatArray(gl, location, array);

        break;

      case Int32Array:
        VertexArrayObject._setConstantIntArray(gl, location, array);

        break;

      case Uint32Array:
        VertexArrayObject._setConstantUintArray(gl, location, array);

        break;

      default:
        (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)(false);
    }
  }

  constructor(gl, opts = {}) {
    const id = opts.id || opts.program && opts.program.id;
    super(gl, Object.assign({}, opts, {
      id
    }));
    this.buffer = null;
    this.bufferValue = null;
    this.isDefaultArray = opts.isDefaultArray || false;
    this.gl2 = gl;
    this.initialize(opts);
    Object.seal(this);
  }

  delete() {
    super.delete();

    if (this.buffer) {
      this.buffer.delete();
    }

    return this;
  }

  get MAX_ATTRIBUTES() {
    return VertexArrayObject.getMaxAttributes(this.gl);
  }

  initialize(props = {}) {
    return this.setProps(props);
  }

  setProps(props) {
    return this;
  }

  setElementBuffer(elementBuffer = null, opts = {}) {
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)(!elementBuffer || elementBuffer.target === 34963, ERR_ELEMENTS);
    this.bind(() => {
      this.gl.bindBuffer(34963, elementBuffer ? elementBuffer.handle : null);
    });
    return this;
  }

  setBuffer(location, buffer, accessor) {
    if (buffer.target === 34963) {
      return this.setElementBuffer(buffer, accessor);
    }

    const {
      size,
      type,
      stride,
      offset,
      normalized,
      integer,
      divisor
    } = accessor;
    const {
      gl,
      gl2
    } = this;
    location = Number(location);
    this.bind(() => {
      gl.bindBuffer(34962, buffer.handle);

      if (integer) {
        (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)((0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl));
        gl2.vertexAttribIPointer(location, size, type, stride, offset);
      } else {
        gl.vertexAttribPointer(location, size, type, normalized, stride, offset);
      }

      gl.enableVertexAttribArray(location);
      gl2.vertexAttribDivisor(location, divisor || 0);
    });
    return this;
  }

  enable(location, enable = true) {
    const disablingAttributeZero = !enable && location === 0 && !VertexArrayObject.isSupported(this.gl, {
      constantAttributeZero: true
    });

    if (!disablingAttributeZero) {
      location = Number(location);
      this.bind(() => enable ? this.gl.enableVertexAttribArray(location) : this.gl.disableVertexAttribArray(location));
    }

    return this;
  }

  getConstantBuffer(elementCount, value) {
    const constantValue = this._normalizeConstantArrayValue(value);

    const byteLength = constantValue.byteLength * elementCount;
    const length = constantValue.length * elementCount;
    let updateNeeded = !this.buffer;
    this.buffer = this.buffer || new _buffer__WEBPACK_IMPORTED_MODULE_4__["default"](this.gl, byteLength);
    updateNeeded = updateNeeded || this.buffer.reallocate(byteLength);
    updateNeeded = updateNeeded || !this._compareConstantArrayValues(constantValue, this.bufferValue);

    if (updateNeeded) {
      const typedArray = (0,_utils_array_utils_flat__WEBPACK_IMPORTED_MODULE_5__.getScratchArray)(value.constructor, length);
      (0,_utils_array_utils_flat__WEBPACK_IMPORTED_MODULE_5__.fillArray)({
        target: typedArray,
        source: constantValue,
        start: 0,
        count: length
      });
      this.buffer.subData(typedArray);
      this.bufferValue = value;
    }

    return this.buffer;
  }

  _normalizeConstantArrayValue(arrayValue) {
    if (Array.isArray(arrayValue)) {
      return new Float32Array(arrayValue);
    }

    return arrayValue;
  }

  _compareConstantArrayValues(v1, v2) {
    if (!v1 || !v2 || v1.length !== v2.length || v1.constructor !== v2.constructor) {
      return false;
    }

    for (let i = 0; i < v1.length; ++i) {
      if (v1[i] !== v2[i]) {
        return false;
      }
    }

    return true;
  }

  static _setConstantFloatArray(gl, location, array) {
    switch (array.length) {
      case 1:
        gl.vertexAttrib1fv(location, array);
        break;

      case 2:
        gl.vertexAttrib2fv(location, array);
        break;

      case 3:
        gl.vertexAttrib3fv(location, array);
        break;

      case 4:
        gl.vertexAttrib4fv(location, array);
        break;

      default:
        (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)(false);
    }
  }

  static _setConstantIntArray(gl, location, array) {
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)((0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl));

    switch (array.length) {
      case 1:
        gl.vertexAttribI1iv(location, array);
        break;

      case 2:
        gl.vertexAttribI2iv(location, array);
        break;

      case 3:
        gl.vertexAttribI3iv(location, array);
        break;

      case 4:
        gl.vertexAttribI4iv(location, array);
        break;

      default:
        (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)(false);
    }
  }

  static _setConstantUintArray(gl, location, array) {
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)((0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl));

    switch (array.length) {
      case 1:
        gl.vertexAttribI1uiv(location, array);
        break;

      case 2:
        gl.vertexAttribI2uiv(location, array);
        break;

      case 3:
        gl.vertexAttribI3uiv(location, array);
        break;

      case 4:
        gl.vertexAttribI4uiv(location, array);
        break;

      default:
        (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)(false);
    }
  }

  _createHandle() {
    const gl2 = this.gl;
    return gl2.createVertexArray();
  }

  _deleteHandle(handle) {
    this.gl2.deleteVertexArray(handle);
    return [this.elements];
  }

  _bindHandle(handle) {
    this.gl2.bindVertexArray(handle);
  }

  _getParameter(pname, {
    location
  }) {
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_3__.assert)(Number.isFinite(location));
    return this.bind(() => {
      switch (pname) {
        case 34373:
          return this.gl.getVertexAttribOffset(location, pname);

        default:
          return this.gl.getVertexAttrib(location, pname);
      }
    });
  }

}
//# sourceMappingURL=vertex-array-object.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/classes/vertex-array.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/classes/vertex-array.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ VertexArray)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _accessor__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./accessor */ "./node_modules/@luma.gl/webgl/dist/esm/classes/accessor.js");
/* harmony import */ var _buffer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./buffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js");
/* harmony import */ var _vertex_array_object__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./vertex-array-object */ "./node_modules/@luma.gl/webgl/dist/esm/classes/vertex-array-object.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* harmony import */ var _utils_stub_methods__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/stub-methods */ "./node_modules/@luma.gl/webgl/dist/esm/utils/stub-methods.js");






const ERR_ATTRIBUTE_TYPE = 'VertexArray: attributes must be Buffers or constants (i.e. typed array)';
const MULTI_LOCATION_ATTRIBUTE_REGEXP = /^(.+)__LOCATION_([0-9]+)$/;
const DEPRECATIONS_V6 = ['setBuffers', 'setGeneric', 'clearBindings', 'setLocations', 'setGenericValues', 'setDivisor', 'enable', 'disable'];
class VertexArray {
  constructor(gl, opts = {}) {
    const id = opts.id || opts.program && opts.program.id;
    this.id = id;
    this.gl = gl;
    this.configuration = null;
    this.elements = null;
    this.elementsAccessor = null;
    this.values = null;
    this.accessors = null;
    this.unused = null;
    this.drawParams = null;
    this.buffer = null;
    this.attributes = {};
    this.vertexArrayObject = new _vertex_array_object__WEBPACK_IMPORTED_MODULE_1__["default"](gl);
    (0,_utils_stub_methods__WEBPACK_IMPORTED_MODULE_2__.stubRemovedMethods)(this, 'VertexArray', 'v6.0', DEPRECATIONS_V6);
    this.initialize(opts);
    Object.seal(this);
  }

  delete() {
    if (this.buffer) {
      this.buffer.delete();
    }

    this.vertexArrayObject.delete();
  }

  initialize(props = {}) {
    this.reset();
    this.configuration = null;
    this.bindOnUse = false;
    return this.setProps(props);
  }

  reset() {
    this.elements = null;
    this.elementsAccessor = null;
    const {
      MAX_ATTRIBUTES
    } = this.vertexArrayObject;
    this.values = new Array(MAX_ATTRIBUTES).fill(null);
    this.accessors = new Array(MAX_ATTRIBUTES).fill(null);
    this.unused = {};
    this.drawParams = null;
    return this;
  }

  setProps(props) {
    if ('program' in props) {
      this.configuration = props.program && props.program.configuration;
    }

    if ('configuration' in props) {
      this.configuration = props.configuration;
    }

    if ('attributes' in props) {
      this.setAttributes(props.attributes);
    }

    if ('elements' in props) {
      this.setElementBuffer(props.elements);
    }

    if ('bindOnUse' in props) {
      props = props.bindOnUse;
    }

    return this;
  }

  clearDrawParams() {
    this.drawParams = null;
  }

  getDrawParams() {
    this.drawParams = this.drawParams || this._updateDrawParams();
    return this.drawParams;
  }

  setAttributes(attributes) {
    Object.assign(this.attributes, attributes);
    this.vertexArrayObject.bind(() => {
      for (const locationOrName in attributes) {
        const value = attributes[locationOrName];

        this._setAttribute(locationOrName, value);
      }

      this.gl.bindBuffer(34962, null);
    });
    return this;
  }

  setElementBuffer(elementBuffer = null, accessor = {}) {
    this.elements = elementBuffer;
    this.elementsAccessor = accessor;
    this.clearDrawParams();
    this.vertexArrayObject.setElementBuffer(elementBuffer, accessor);
    return this;
  }

  setBuffer(locationOrName, buffer, appAccessor = {}) {
    if (buffer.target === 34963) {
      return this.setElementBuffer(buffer, appAccessor);
    }

    const {
      location,
      accessor
    } = this._resolveLocationAndAccessor(locationOrName, buffer, buffer.accessor, appAccessor);

    if (location >= 0) {
      this.values[location] = buffer;
      this.accessors[location] = accessor;
      this.clearDrawParams();
      this.vertexArrayObject.setBuffer(location, buffer, accessor);
    }

    return this;
  }

  setConstant(locationOrName, arrayValue, appAccessor = {}) {
    const {
      location,
      accessor
    } = this._resolveLocationAndAccessor(locationOrName, arrayValue, Object.assign({
      size: arrayValue.length
    }, appAccessor));

    if (location >= 0) {
      arrayValue = this.vertexArrayObject._normalizeConstantArrayValue(arrayValue);
      this.values[location] = arrayValue;
      this.accessors[location] = accessor;
      this.clearDrawParams();
      this.vertexArrayObject.enable(location, false);
    }

    return this;
  }

  unbindBuffers() {
    this.vertexArrayObject.bind(() => {
      if (this.elements) {
        this.vertexArrayObject.setElementBuffer(null);
      }

      this.buffer = this.buffer || new _buffer__WEBPACK_IMPORTED_MODULE_3__["default"](this.gl, {
        accessor: {
          size: 4
        }
      });

      for (let location = 0; location < this.vertexArrayObject.MAX_ATTRIBUTES; location++) {
        if (this.values[location] instanceof _buffer__WEBPACK_IMPORTED_MODULE_3__["default"]) {
          this.gl.disableVertexAttribArray(location);
          this.gl.bindBuffer(34962, this.buffer.handle);
          this.gl.vertexAttribPointer(location, 1, 5126, false, 0, 0);
        }
      }
    });
    return this;
  }

  bindBuffers() {
    this.vertexArrayObject.bind(() => {
      if (this.elements) {
        this.setElementBuffer(this.elements);
      }

      for (let location = 0; location < this.vertexArrayObject.MAX_ATTRIBUTES; location++) {
        const buffer = this.values[location];

        if (buffer instanceof _buffer__WEBPACK_IMPORTED_MODULE_3__["default"]) {
          this.setBuffer(location, buffer);
        }
      }
    });
    return this;
  }

  bindForDraw(vertexCount, instanceCount, func) {
    let value;
    this.vertexArrayObject.bind(() => {
      this._setConstantAttributes(vertexCount, instanceCount);

      value = func();
    });
    return value;
  }

  _resolveLocationAndAccessor(locationOrName, value, valueAccessor, appAccessor) {
    const INVALID_RESULT = {
      location: -1,
      accessor: null
    };

    const {
      location,
      name
    } = this._getAttributeIndex(locationOrName);

    if (!Number.isFinite(location) || location < 0) {
      this.unused[locationOrName] = value;
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.once(3, () => `unused value ${locationOrName} in ${this.id}`)();
      return INVALID_RESULT;
    }

    const accessInfo = this._getAttributeInfo(name || location);

    if (!accessInfo) {
      return INVALID_RESULT;
    }

    const currentAccessor = this.accessors[location] || {};
    const accessor = _accessor__WEBPACK_IMPORTED_MODULE_4__["default"].resolve(accessInfo.accessor, currentAccessor, valueAccessor, appAccessor);
    const {
      size,
      type
    } = accessor;
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_5__.assert)(Number.isFinite(size) && Number.isFinite(type));
    return {
      location,
      accessor
    };
  }

  _getAttributeInfo(attributeName) {
    return this.configuration && this.configuration.getAttributeInfo(attributeName);
  }

  _getAttributeIndex(locationOrName) {
    const location = Number(locationOrName);

    if (Number.isFinite(location)) {
      return {
        location
      };
    }

    const multiLocation = MULTI_LOCATION_ATTRIBUTE_REGEXP.exec(locationOrName);
    const name = multiLocation ? multiLocation[1] : locationOrName;
    const locationOffset = multiLocation ? Number(multiLocation[2]) : 0;

    if (this.configuration) {
      return {
        location: this.configuration.getAttributeLocation(name) + locationOffset,
        name
      };
    }

    return {
      location: -1
    };
  }

  _setAttribute(locationOrName, value) {
    if (value instanceof _buffer__WEBPACK_IMPORTED_MODULE_3__["default"]) {
      this.setBuffer(locationOrName, value);
    } else if (Array.isArray(value) && value.length && value[0] instanceof _buffer__WEBPACK_IMPORTED_MODULE_3__["default"]) {
      const buffer = value[0];
      const accessor = value[1];
      this.setBuffer(locationOrName, buffer, accessor);
    } else if (ArrayBuffer.isView(value) || Array.isArray(value)) {
      const constant = value;
      this.setConstant(locationOrName, constant);
    } else if (value.buffer instanceof _buffer__WEBPACK_IMPORTED_MODULE_3__["default"]) {
      const accessor = value;
      this.setBuffer(locationOrName, accessor.buffer, accessor);
    } else {
      throw new Error(ERR_ATTRIBUTE_TYPE);
    }
  }

  _setConstantAttributes(vertexCount, instanceCount) {
    const elementCount = Math.max(vertexCount | 0, instanceCount | 0);
    let constant = this.values[0];

    if (ArrayBuffer.isView(constant)) {
      this._setConstantAttributeZero(constant, elementCount);
    }

    for (let location = 1; location < this.vertexArrayObject.MAX_ATTRIBUTES; location++) {
      constant = this.values[location];

      if (ArrayBuffer.isView(constant)) {
        this._setConstantAttribute(location, constant);
      }
    }
  }

  _setConstantAttributeZero(constant, elementCount) {
    if (_vertex_array_object__WEBPACK_IMPORTED_MODULE_1__["default"].isSupported(this.gl, {
      constantAttributeZero: true
    })) {
      this._setConstantAttribute(0, constant);

      return;
    }

    const buffer = this.vertexArrayObject.getConstantBuffer(elementCount, constant);
    this.vertexArrayObject.setBuffer(0, buffer, this.accessors[0]);
  }

  _setConstantAttribute(location, constant) {
    _vertex_array_object__WEBPACK_IMPORTED_MODULE_1__["default"].setConstant(this.gl, location, constant);
  }

  _updateDrawParams() {
    const drawParams = {
      isIndexed: false,
      isInstanced: false,
      indexCount: Infinity,
      vertexCount: Infinity,
      instanceCount: Infinity
    };

    for (let location = 0; location < this.vertexArrayObject.MAX_ATTRIBUTES; location++) {
      this._updateDrawParamsForLocation(drawParams, location);
    }

    if (this.elements) {
      drawParams.elementCount = this.elements.getElementCount(this.elements.accessor);
      drawParams.isIndexed = true;
      drawParams.indexType = this.elementsAccessor.type || this.elements.accessor.type;
      drawParams.indexOffset = this.elementsAccessor.offset || 0;
    }

    if (drawParams.indexCount === Infinity) {
      drawParams.indexCount = 0;
    }

    if (drawParams.vertexCount === Infinity) {
      drawParams.vertexCount = 0;
    }

    if (drawParams.instanceCount === Infinity) {
      drawParams.instanceCount = 0;
    }

    return drawParams;
  }

  _updateDrawParamsForLocation(drawParams, location) {
    const value = this.values[location];
    const accessor = this.accessors[location];

    if (!value) {
      return;
    }

    const {
      divisor
    } = accessor;
    const isInstanced = divisor > 0;
    drawParams.isInstanced = drawParams.isInstanced || isInstanced;

    if (value instanceof _buffer__WEBPACK_IMPORTED_MODULE_3__["default"]) {
      const buffer = value;

      if (isInstanced) {
        const instanceCount = buffer.getVertexCount(accessor);
        drawParams.instanceCount = Math.min(drawParams.instanceCount, instanceCount);
      } else {
        const vertexCount = buffer.getVertexCount(accessor);
        drawParams.vertexCount = Math.min(drawParams.vertexCount, vertexCount);
      }
    }
  }

  setElements(elementBuffer = null, accessor = {}) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.deprecated('setElements', 'setElementBuffer')();
    return this.setElementBuffer(elementBuffer, accessor);
  }

}
//# sourceMappingURL=vertex-array.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/debug/debug-program-configuration.js":
/*!***********************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/debug/debug-program-configuration.js ***!
  \***********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getDebugTableForProgramConfiguration": () => (/* binding */ getDebugTableForProgramConfiguration)
/* harmony export */ });
/* harmony import */ var _webgl_utils_attribute_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../webgl-utils/attribute-utils */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/attribute-utils.js");

function getDebugTableForProgramConfiguration(config) {
  const table = {};
  const header = `Accessors for ${config.id}`;

  for (const attributeInfo of config.attributeInfos) {
    if (attributeInfo) {
      const glslDeclaration = getGLSLDeclaration(attributeInfo);
      table[`in ${glslDeclaration}`] = {
        [header]: JSON.stringify(attributeInfo.accessor)
      };
    }
  }

  for (const varyingInfo of config.varyingInfos) {
    if (varyingInfo) {
      const glslDeclaration = getGLSLDeclaration(varyingInfo);
      table[`out ${glslDeclaration}`] = {
        [header]: JSON.stringify(varyingInfo.accessor)
      };
    }
  }

  return table;
}

function getGLSLDeclaration(attributeInfo) {
  const {
    type,
    size
  } = attributeInfo.accessor;
  const typeAndName = (0,_webgl_utils_attribute_utils__WEBPACK_IMPORTED_MODULE_0__.getCompositeGLType)(type, size);

  if (typeAndName) {
    return `${typeAndName.name} ${attributeInfo.name}`;
  }

  return attributeInfo.name;
}
//# sourceMappingURL=debug-program-configuration.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/debug/debug-uniforms.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/debug/debug-uniforms.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getDebugTableForUniforms": () => (/* binding */ getDebugTableForUniforms)
/* harmony export */ });
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* harmony import */ var _utils_format_value__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/format-value */ "./node_modules/@luma.gl/webgl/dist/esm/utils/format-value.js");


function getDebugTableForUniforms({
  header = 'Uniforms',
  program,
  uniforms,
  undefinedOnly = false
}) {
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(program);
  const SHADER_MODULE_UNIFORM_REGEXP = '.*_.*';
  const PROJECT_MODULE_UNIFORM_REGEXP = '.*Matrix';
  const uniformLocations = program._uniformSetters;
  const table = {};
  const uniformNames = Object.keys(uniformLocations).sort();
  let count = 0;

  for (const uniformName of uniformNames) {
    if (!uniformName.match(SHADER_MODULE_UNIFORM_REGEXP) && !uniformName.match(PROJECT_MODULE_UNIFORM_REGEXP)) {
      if (addUniformToTable({
        table,
        header,
        uniforms,
        uniformName,
        undefinedOnly
      })) {
        count++;
      }
    }
  }

  for (const uniformName of uniformNames) {
    if (uniformName.match(PROJECT_MODULE_UNIFORM_REGEXP)) {
      if (addUniformToTable({
        table,
        header,
        uniforms,
        uniformName,
        undefinedOnly
      })) {
        count++;
      }
    }
  }

  for (const uniformName of uniformNames) {
    if (!table[uniformName]) {
      if (addUniformToTable({
        table,
        header,
        uniforms,
        uniformName,
        undefinedOnly
      })) {
        count++;
      }
    }
  }

  let unusedCount = 0;
  const unusedTable = {};

  if (!undefinedOnly) {
    for (const uniformName in uniforms) {
      const uniform = uniforms[uniformName];

      if (!table[uniformName]) {
        unusedCount++;
        unusedTable[uniformName] = {
          Type: `NOT USED: ${uniform}`,
          [header]: (0,_utils_format_value__WEBPACK_IMPORTED_MODULE_1__.formatValue)(uniform)
        };
      }
    }
  }

  return {
    table,
    count,
    unusedTable,
    unusedCount
  };
}

function addUniformToTable({
  table,
  header,
  uniforms,
  uniformName,
  undefinedOnly
}) {
  const value = uniforms[uniformName];
  const isDefined = isUniformDefined(value);

  if (!undefinedOnly || !isDefined) {
    table[uniformName] = {
      [header]: isDefined ? (0,_utils_format_value__WEBPACK_IMPORTED_MODULE_1__.formatValue)(value) : 'N/A',
      'Uniform Type': isDefined ? value : 'NOT PROVIDED'
    };
    return true;
  }

  return false;
}

function isUniformDefined(value) {
  return value !== undefined && value !== null;
}
//# sourceMappingURL=debug-uniforms.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/debug/debug-vertex-array.js":
/*!**************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/debug/debug-vertex-array.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getDebugTableForVertexArray": () => (/* binding */ getDebugTableForVertexArray)
/* harmony export */ });
/* harmony import */ var _classes_buffer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../classes/buffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js");
/* harmony import */ var _webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../webgl-utils/constants-to-keys */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/constants-to-keys.js");
/* harmony import */ var _webgl_utils_attribute_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../webgl-utils/attribute-utils */ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/attribute-utils.js");
/* harmony import */ var _utils_format_value__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/format-value */ "./node_modules/@luma.gl/webgl/dist/esm/utils/format-value.js");




function getDebugTableForVertexArray({
  vertexArray,
  header = 'Attributes'
}) {
  if (!vertexArray.configuration) {
    return {};
  }

  const table = {};

  if (vertexArray.elements) {
    table.ELEMENT_ARRAY_BUFFER = getDebugTableRow(vertexArray, vertexArray.elements, null, header);
  }

  const attributes = vertexArray.values;

  for (const attributeLocation in attributes) {
    const info = vertexArray._getAttributeInfo(attributeLocation);

    if (info) {
      let rowHeader = `${attributeLocation}: ${info.name}`;
      const accessor = vertexArray.accessors[info.location];

      if (accessor) {
        rowHeader = `${attributeLocation}: ${getGLSLDeclaration(info.name, accessor)}`;
      }

      table[rowHeader] = getDebugTableRow(vertexArray, attributes[attributeLocation], accessor, header);
    }
  }

  return table;
}

function getDebugTableRow(vertexArray, attribute, accessor, header) {
  const {
    gl
  } = vertexArray;

  if (!attribute) {
    return {
      [header]: 'null',
      'Format ': 'N/A'
    };
  }

  let type = 'NOT PROVIDED';
  let size = 1;
  let verts = 0;
  let bytes = 0;
  let isInteger;
  let marker;
  let value;

  if (accessor) {
    type = accessor.type;
    size = accessor.size;
    type = String(type).replace('Array', '');
    isInteger = type.indexOf('nt') !== -1;
  }

  if (attribute instanceof _classes_buffer__WEBPACK_IMPORTED_MODULE_0__["default"]) {
    const buffer = attribute;
    const {
      data,
      changed
    } = buffer.getDebugData();
    marker = changed ? '*' : '';
    value = data;
    bytes = buffer.byteLength;
    verts = bytes / data.BYTES_PER_ELEMENT / size;
    let format;

    if (accessor) {
      const instanced = accessor.divisor > 0;
      format = `${instanced ? 'I ' : 'P '} ${verts} (x${size}=${bytes} bytes ${(0,_webgl_utils_constants_to_keys__WEBPACK_IMPORTED_MODULE_1__.getKey)(gl, type)})`;
    } else {
      isInteger = true;
      format = `${bytes} bytes`;
    }

    return {
      [header]: `${marker}${(0,_utils_format_value__WEBPACK_IMPORTED_MODULE_2__.formatValue)(value, {
        size,
        isInteger
      })}`,
      'Format ': format
    };
  }

  value = attribute;
  size = attribute.length;
  type = String(attribute.constructor.name).replace('Array', '');
  isInteger = type.indexOf('nt') !== -1;
  return {
    [header]: `${(0,_utils_format_value__WEBPACK_IMPORTED_MODULE_2__.formatValue)(value, {
      size,
      isInteger
    })} (constant)`,
    'Format ': `${size}x${type} (constant)`
  };
}

function getGLSLDeclaration(name, accessor) {
  const {
    type,
    size
  } = accessor;
  const typeAndName = (0,_webgl_utils_attribute_utils__WEBPACK_IMPORTED_MODULE_3__.getCompositeGLType)(type, size);
  return typeAndName ? `${name} (${typeAndName.name})` : name;
}
//# sourceMappingURL=debug-vertex-array.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/features/features.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/features/features.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "hasFeature": () => (/* binding */ hasFeature),
/* harmony export */   "hasFeatures": () => (/* binding */ hasFeatures),
/* harmony export */   "getFeatures": () => (/* binding */ getFeatures)
/* harmony export */ });
/* harmony import */ var _webgl_features_table__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./webgl-features-table */ "./node_modules/@luma.gl/webgl/dist/esm/features/webgl-features-table.js");
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");



const LOG_UNSUPPORTED_FEATURE = 2;
function hasFeature(gl, feature) {
  return hasFeatures(gl, feature);
}
function hasFeatures(gl, features) {
  features = Array.isArray(features) ? features : [features];
  return features.every(feature => {
    return isFeatureSupported(gl, feature);
  });
}
function getFeatures(gl) {
  gl.luma = gl.luma || {};
  gl.luma.caps = gl.luma.caps || {};

  for (const cap in _webgl_features_table__WEBPACK_IMPORTED_MODULE_1__["default"]) {
    if (gl.luma.caps[cap] === undefined) {
      gl.luma.caps[cap] = isFeatureSupported(gl, cap);
    }
  }

  return gl.luma.caps;
}

function isFeatureSupported(gl, cap) {
  gl.luma = gl.luma || {};
  gl.luma.caps = gl.luma.caps || {};

  if (gl.luma.caps[cap] === undefined) {
    gl.luma.caps[cap] = queryFeature(gl, cap);
  }

  if (!gl.luma.caps[cap]) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.log(LOG_UNSUPPORTED_FEATURE, `Feature: ${cap} not supported`)();
  }

  return gl.luma.caps[cap];
}

function queryFeature(gl, cap) {
  const feature = _webgl_features_table__WEBPACK_IMPORTED_MODULE_1__["default"][cap];
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(feature, cap);
  let isSupported;
  const featureDefinition = (0,_luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.isWebGL2)(gl) ? feature[1] || feature[0] : feature[0];

  if (typeof featureDefinition === 'function') {
    isSupported = featureDefinition(gl);
  } else if (Array.isArray(featureDefinition)) {
    isSupported = true;

    for (const extension of featureDefinition) {
      isSupported = isSupported && Boolean(gl.getExtension(extension));
    }
  } else if (typeof featureDefinition === 'string') {
    isSupported = Boolean(gl.getExtension(featureDefinition));
  } else if (typeof featureDefinition === 'boolean') {
    isSupported = featureDefinition;
  } else {
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_2__.assert)(false);
  }

  return isSupported;
}
//# sourceMappingURL=features.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/features/webgl-features-table.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/features/webgl-features-table.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "FEATURES": () => (/* binding */ FEATURES),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _classes_framebuffer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../classes/framebuffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/framebuffer.js");
/* harmony import */ var _classes_texture_2d__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../classes/texture-2d */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture-2d.js");


const FEATURES = {
  WEBGL2: 'WEBGL2',
  VERTEX_ARRAY_OBJECT: 'VERTEX_ARRAY_OBJECT',
  TIMER_QUERY: 'TIMER_QUERY',
  INSTANCED_RENDERING: 'INSTANCED_RENDERING',
  MULTIPLE_RENDER_TARGETS: 'MULTIPLE_RENDER_TARGETS',
  ELEMENT_INDEX_UINT32: 'ELEMENT_INDEX_UINT32',
  BLEND_EQUATION_MINMAX: 'BLEND_EQUATION_MINMAX',
  FLOAT_BLEND: 'FLOAT_BLEND',
  COLOR_ENCODING_SRGB: 'COLOR_ENCODING_SRGB',
  TEXTURE_DEPTH: 'TEXTURE_DEPTH',
  TEXTURE_FLOAT: 'TEXTURE_FLOAT',
  TEXTURE_HALF_FLOAT: 'TEXTURE_HALF_FLOAT',
  TEXTURE_FILTER_LINEAR_FLOAT: 'TEXTURE_FILTER_LINEAR_FLOAT',
  TEXTURE_FILTER_LINEAR_HALF_FLOAT: 'TEXTURE_FILTER_LINEAR_HALF_FLOAT',
  TEXTURE_FILTER_ANISOTROPIC: 'TEXTURE_FILTER_ANISOTROPIC',
  COLOR_ATTACHMENT_RGBA32F: 'COLOR_ATTACHMENT_RGBA32F',
  COLOR_ATTACHMENT_FLOAT: 'COLOR_ATTACHMENT_FLOAT',
  COLOR_ATTACHMENT_HALF_FLOAT: 'COLOR_ATTACHMENT_HALF_FLOAT',
  GLSL_FRAG_DATA: 'GLSL_FRAG_DATA',
  GLSL_FRAG_DEPTH: 'GLSL_FRAG_DEPTH',
  GLSL_DERIVATIVES: 'GLSL_DERIVATIVES',
  GLSL_TEXTURE_LOD: 'GLSL_TEXTURE_LOD'
};

function checkFloat32ColorAttachment(gl) {
  const testTexture = new _classes_texture_2d__WEBPACK_IMPORTED_MODULE_0__["default"](gl, {
    format: 6408,
    type: 5126,
    dataFormat: 6408
  });
  const testFb = new _classes_framebuffer__WEBPACK_IMPORTED_MODULE_1__["default"](gl, {
    id: `test-framebuffer`,
    check: false,
    attachments: {
      [36064]: testTexture
    }
  });
  const status = testFb.getStatus();
  testTexture.delete();
  testFb.delete();
  return status === 36053;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  [FEATURES.WEBGL2]: [false, true],
  [FEATURES.VERTEX_ARRAY_OBJECT]: ['OES_vertex_array_object', true],
  [FEATURES.TIMER_QUERY]: ['EXT_disjoint_timer_query', 'EXT_disjoint_timer_query_webgl2'],
  [FEATURES.INSTANCED_RENDERING]: ['ANGLE_instanced_arrays', true],
  [FEATURES.MULTIPLE_RENDER_TARGETS]: ['WEBGL_draw_buffers', true],
  [FEATURES.ELEMENT_INDEX_UINT32]: ['OES_element_index_uint', true],
  [FEATURES.BLEND_EQUATION_MINMAX]: ['EXT_blend_minmax', true],
  [FEATURES.FLOAT_BLEND]: ['EXT_float_blend'],
  [FEATURES.COLOR_ENCODING_SRGB]: ['EXT_sRGB', true],
  [FEATURES.TEXTURE_DEPTH]: ['WEBGL_depth_texture', true],
  [FEATURES.TEXTURE_FLOAT]: ['OES_texture_float', true],
  [FEATURES.TEXTURE_HALF_FLOAT]: ['OES_texture_half_float', true],
  [FEATURES.TEXTURE_FILTER_LINEAR_FLOAT]: ['OES_texture_float_linear'],
  [FEATURES.TEXTURE_FILTER_LINEAR_HALF_FLOAT]: ['OES_texture_half_float_linear'],
  [FEATURES.TEXTURE_FILTER_ANISOTROPIC]: ['EXT_texture_filter_anisotropic'],
  [FEATURES.COLOR_ATTACHMENT_RGBA32F]: [checkFloat32ColorAttachment, 'EXT_color_buffer_float'],
  [FEATURES.COLOR_ATTACHMENT_FLOAT]: [false, 'EXT_color_buffer_float'],
  [FEATURES.COLOR_ATTACHMENT_HALF_FLOAT]: ['EXT_color_buffer_half_float'],
  [FEATURES.GLSL_FRAG_DATA]: ['WEBGL_draw_buffers', true],
  [FEATURES.GLSL_FRAG_DEPTH]: ['EXT_frag_depth', true],
  [FEATURES.GLSL_DERIVATIVES]: ['OES_standard_derivatives', true],
  [FEATURES.GLSL_TEXTURE_LOD]: ['EXT_shader_texture_lod', true]
});
//# sourceMappingURL=webgl-features-table.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/glsl-utils/format-glsl-error.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/glsl-utils/format-glsl-error.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ formatGLSLCompilerError),
/* harmony export */   "parseGLSLCompilerError": () => (/* binding */ parseGLSLCompilerError)
/* harmony export */ });
/* harmony import */ var _get_shader_name__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./get-shader-name */ "./node_modules/@luma.gl/webgl/dist/esm/glsl-utils/get-shader-name.js");
/* harmony import */ var _get_shader_type_name__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./get-shader-type-name */ "./node_modules/@luma.gl/webgl/dist/esm/glsl-utils/get-shader-type-name.js");


function formatGLSLCompilerError(errLog, src, shaderType) {
  const {
    shaderName,
    errors,
    warnings
  } = parseGLSLCompilerError(errLog, src, shaderType);
  return `GLSL compilation error in ${shaderName}\n\n${errors}\n${warnings}`;
}
function parseGLSLCompilerError(errLog, src, shaderType, shaderName) {
  const errorStrings = errLog.split(/\r?\n/);
  const errors = {};
  const warnings = {};
  const name = shaderName || (0,_get_shader_name__WEBPACK_IMPORTED_MODULE_0__["default"])(src) || '(unnamed)';
  const shaderDescription = `${(0,_get_shader_type_name__WEBPACK_IMPORTED_MODULE_1__["default"])(shaderType)} shader ${name}`;

  for (let i = 0; i < errorStrings.length; i++) {
    const errorString = errorStrings[i];

    if (errorString.length <= 1) {
      continue;
    }

    const segments = errorString.split(':');
    const type = segments[0];
    const line = parseInt(segments[2], 10);

    if (isNaN(line)) {
      throw new Error(`GLSL compilation error in ${shaderDescription}: ${errLog}`);
    }

    if (type !== 'WARNING') {
      errors[line] = errorString;
    } else {
      warnings[line] = errorString;
    }
  }

  const lines = addLineNumbers(src);
  return {
    shaderName: shaderDescription,
    errors: formatErrors(errors, lines),
    warnings: formatErrors(warnings, lines)
  };
}

function formatErrors(errors, lines) {
  let message = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!errors[i + 3] && !errors[i + 2] && !errors[i + 1]) {
      continue;
    }

    message += `${line}\n`;

    if (errors[i + 1]) {
      const error = errors[i + 1];
      const segments = error.split(':', 3);
      const type = segments[0];
      const column = parseInt(segments[1], 10) || 0;
      const err = error.substring(segments.join(':').length + 1).trim();
      message += padLeft(`^^^ ${type}: ${err}\n\n`, column);
    }
  }

  return message;
}

function addLineNumbers(string, start = 1, delim = ': ') {
  const lines = string.split(/\r?\n/);
  const maxDigits = String(lines.length + start - 1).length;
  return lines.map((line, i) => {
    const lineNumber = String(i + start);
    const digits = lineNumber.length;
    const prefix = padLeft(lineNumber, maxDigits - digits);
    return prefix + delim + line;
  });
}

function padLeft(string, digits) {
  let result = '';

  for (let i = 0; i < digits; ++i) {
    result += ' ';
  }

  return `${result}${string}`;
}
//# sourceMappingURL=format-glsl-error.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/glsl-utils/get-shader-name.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/glsl-utils/get-shader-name.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ getShaderName)
/* harmony export */ });
function getShaderName(shader, defaultName = 'unnamed') {
  const SHADER_NAME_REGEXP = /#define[\s*]SHADER_NAME[\s*]([A-Za-z0-9_-]+)[\s*]/;
  const match = shader.match(SHADER_NAME_REGEXP);
  return match ? match[1] : defaultName;
}
//# sourceMappingURL=get-shader-name.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/glsl-utils/get-shader-type-name.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/glsl-utils/get-shader-type-name.js ***!
  \*********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ getShaderTypeName)
/* harmony export */ });
const GL_FRAGMENT_SHADER = 0x8b30;
const GL_VERTEX_SHADER = 0x8b31;
function getShaderTypeName(type) {
  switch (type) {
    case GL_FRAGMENT_SHADER:
      return 'fragment';

    case GL_VERTEX_SHADER:
      return 'vertex';

    default:
      return 'unknown type';
  }
}
//# sourceMappingURL=get-shader-type-name.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/init.js":
/*!******************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/init.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "lumaStats": () => (/* binding */ lumaStats),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");
/* harmony import */ var probe_gl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! probe.gl */ "./node_modules/@probe.gl/stats/dist/esm/index.js");
/* harmony import */ var probe_gl_env__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! probe.gl/env */ "./node_modules/probe.gl/dist/es5/env/index.js");



const VERSION =  true ? "8.5.10" : 0;
const STARTUP_MESSAGE = 'set luma.log.level=1 (or higher) to trace rendering';

class StatsManager {
  constructor() {
    this.stats = new Map();
  }

  get(name) {
    if (!this.stats.has(name)) {
      this.stats.set(name, new probe_gl__WEBPACK_IMPORTED_MODULE_1__.Stats({
        id: name
      }));
    }

    return this.stats.get(name);
  }

}

const lumaStats = new StatsManager();

if (probe_gl_env__WEBPACK_IMPORTED_MODULE_2__.global.luma && probe_gl_env__WEBPACK_IMPORTED_MODULE_2__.global.luma.VERSION !== VERSION) {
  throw new Error(`luma.gl - multiple VERSIONs detected: ${probe_gl_env__WEBPACK_IMPORTED_MODULE_2__.global.luma.VERSION} vs ${VERSION}`);
}

if (!probe_gl_env__WEBPACK_IMPORTED_MODULE_2__.global.luma) {
  if ((0,probe_gl_env__WEBPACK_IMPORTED_MODULE_2__.isBrowser)()) {
    _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.log(1, `luma.gl ${VERSION} - ${STARTUP_MESSAGE}`)();
  }

  probe_gl_env__WEBPACK_IMPORTED_MODULE_2__.global.luma = probe_gl_env__WEBPACK_IMPORTED_MODULE_2__.global.luma || {
    VERSION,
    version: VERSION,
    log: _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log,
    stats: lumaStats,
    globals: {
      modules: {},
      nodeIO: {}
    }
  };
}


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (probe_gl_env__WEBPACK_IMPORTED_MODULE_2__.global.luma);
//# sourceMappingURL=init.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/utils/array-utils-flat.js":
/*!************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/utils/array-utils-flat.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getScratchArrayBuffer": () => (/* binding */ getScratchArrayBuffer),
/* harmony export */   "getScratchArray": () => (/* binding */ getScratchArray),
/* harmony export */   "fillArray": () => (/* binding */ fillArray)
/* harmony export */ });
let arrayBuffer = null;
function getScratchArrayBuffer(byteLength) {
  if (!arrayBuffer || arrayBuffer.byteLength < byteLength) {
    arrayBuffer = new ArrayBuffer(byteLength);
  }

  return arrayBuffer;
}
function getScratchArray(Type, length) {
  const scratchArrayBuffer = getScratchArrayBuffer(Type.BYTES_PER_ELEMENT * length);
  return new Type(scratchArrayBuffer, 0, length);
}
function fillArray({
  target,
  source,
  start = 0,
  count = 1
}) {
  const length = source.length;
  const total = count * length;
  let copied = 0;

  for (let i = start; copied < length; copied++) {
    target[i++] = source[copied];
  }

  while (copied < total) {
    if (copied < total - copied) {
      target.copyWithin(start + copied, start, start + copied);
      copied *= 2;
    } else {
      target.copyWithin(start + copied, start, start + total - copied);
      copied = total;
    }
  }

  return target;
}
//# sourceMappingURL=array-utils-flat.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js":
/*!**************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "assert": () => (/* binding */ assert)
/* harmony export */ });
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'luma.gl: assertion failed.');
  }
}
//# sourceMappingURL=assert.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/utils/check-props.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/utils/check-props.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "checkProps": () => (/* binding */ checkProps)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");

function checkProps(className, props, propChecks) {
  const {
    removedProps = {},
    deprecatedProps = {},
    replacedProps = {}
  } = propChecks;

  for (const propName in removedProps) {
    if (propName in props) {
      const replacementProp = removedProps[propName];
      const replacement = replacementProp ? `${className}.${removedProps[propName]}` : 'N/A';
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.removed(`${className}.${propName}`, replacement)();
    }
  }

  for (const propName in deprecatedProps) {
    if (propName in props) {
      const replacementProp = deprecatedProps[propName];
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.deprecated(`${className}.${propName}`, `${className}.${replacementProp}`)();
    }
  }

  let newProps = null;

  for (const propName in replacedProps) {
    if (propName in props) {
      const replacementProp = replacedProps[propName];
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.deprecated(`${className}.${propName}`, `${className}.${replacementProp}`)();
      newProps = newProps || Object.assign({}, props);
      newProps[replacementProp] = props[propName];
      delete newProps[propName];
    }
  }

  return newProps || props;
}
//# sourceMappingURL=check-props.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/utils/format-value.js":
/*!********************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/utils/format-value.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "formatValue": () => (/* binding */ formatValue)
/* harmony export */ });
function formatArrayValue(v, opts) {
  const {
    maxElts = 16,
    size = 1
  } = opts;
  let string = '[';

  for (let i = 0; i < v.length && i < maxElts; ++i) {
    if (i > 0) {
      string += `,${i % size === 0 ? ' ' : ''}`;
    }

    string += formatValue(v[i], opts);
  }

  const terminator = v.length > maxElts ? '...' : ']';
  return `${string}${terminator}`;
}

function formatValue(v, opts = {}) {
  const EPSILON = 1e-16;
  const {
    isInteger = false
  } = opts;

  if (Array.isArray(v) || ArrayBuffer.isView(v)) {
    return formatArrayValue(v, opts);
  }

  if (!Number.isFinite(v)) {
    return String(v);
  }

  if (Math.abs(v) < EPSILON) {
    return isInteger ? '0' : '0.';
  }

  if (isInteger) {
    return v.toFixed(0);
  }

  if (Math.abs(v) > 100 && Math.abs(v) < 10000) {
    return v.toFixed(0);
  }

  const string = v.toPrecision(2);
  const decimal = string.indexOf('.0');
  return decimal === string.length - 2 ? string.slice(0, -1) : string;
}
//# sourceMappingURL=format-value.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/utils/load-file.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/utils/load-file.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "setPathPrefix": () => (/* binding */ setPathPrefix),
/* harmony export */   "loadFile": () => (/* binding */ loadFile),
/* harmony export */   "loadImage": () => (/* binding */ loadImage)
/* harmony export */ });
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");
/* provided dependency */ var Promise = __webpack_require__(/*! es6-promise */ "./node_modules/es6-promise/dist/es6-promise.js");

let pathPrefix = '';
function setPathPrefix(prefix) {
  pathPrefix = prefix;
}
function loadFile(url, options = {}) {
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(typeof url === 'string');
  url = pathPrefix + url;
  const dataType = options.dataType || 'text';
  return fetch(url, options).then(res => res[dataType]());
}
function loadImage(url, opts) {
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(typeof url === 'string');
  url = pathPrefix + url;
  return new Promise((resolve, reject) => {
    try {
      const image = new Image();

      image.onload = () => resolve(image);

      image.onerror = () => reject(new Error(`Could not load image ${url}.`));

      image.crossOrigin = opts && opts.crossOrigin || 'anonymous';
      image.src = url;
    } catch (error) {
      reject(error);
    }
  });
}
//# sourceMappingURL=load-file.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/utils/stub-methods.js":
/*!********************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/utils/stub-methods.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "stubRemovedMethods": () => (/* binding */ stubRemovedMethods)
/* harmony export */ });
/* harmony import */ var _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/gltools */ "./node_modules/@luma.gl/gltools/dist/esm/index.js");

function stubRemovedMethods(instance, className, version, methodNames) {
  const upgradeMessage = `See luma.gl ${version} Upgrade Guide at \
https://luma.gl/docs/upgrade-guide`;
  const prototype = Object.getPrototypeOf(instance);
  methodNames.forEach(methodName => {
    if (prototype.methodName) {
      return;
    }

    prototype[methodName] = () => {
      _luma_gl_gltools__WEBPACK_IMPORTED_MODULE_0__.log.removed(`Calling removed method ${className}.${methodName}: `, upgradeMessage)();
      throw new Error(methodName);
    };
  });
}
//# sourceMappingURL=stub-methods.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/utils/utils.js":
/*!*************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/utils/utils.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "uid": () => (/* binding */ uid),
/* harmony export */   "isPowerOfTwo": () => (/* binding */ isPowerOfTwo),
/* harmony export */   "isObjectEmpty": () => (/* binding */ isObjectEmpty)
/* harmony export */ });
/* harmony import */ var _assert__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");

const uidCounters = {};
function uid(id = 'id') {
  uidCounters[id] = uidCounters[id] || 1;
  const count = uidCounters[id]++;
  return `${id}-${count}`;
}
function isPowerOfTwo(n) {
  (0,_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(typeof n === 'number', 'Input must be a number');
  return n && (n & n - 1) === 0;
}
function isObjectEmpty(obj) {
  let isEmpty = true;

  for (const key in obj) {
    isEmpty = false;
    break;
  }

  return isEmpty;
}
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/attribute-utils.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/attribute-utils.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getPrimitiveDrawMode": () => (/* binding */ getPrimitiveDrawMode),
/* harmony export */   "getPrimitiveCount": () => (/* binding */ getPrimitiveCount),
/* harmony export */   "getVertexCount": () => (/* binding */ getVertexCount),
/* harmony export */   "decomposeCompositeGLType": () => (/* binding */ decomposeCompositeGLType),
/* harmony export */   "getCompositeGLType": () => (/* binding */ getCompositeGLType)
/* harmony export */ });
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");

const GL_BYTE = 0x1400;
const GL_UNSIGNED_BYTE = 0x1401;
const GL_SHORT = 0x1402;
const GL_UNSIGNED_SHORT = 0x1403;
const GL_POINTS = 0x0;
const GL_LINES = 0x1;
const GL_LINE_LOOP = 0x2;
const GL_LINE_STRIP = 0x3;
const GL_TRIANGLES = 0x4;
const GL_TRIANGLE_STRIP = 0x5;
const GL_TRIANGLE_FAN = 0x6;
const GL_FLOAT = 0x1406;
const GL_FLOAT_VEC2 = 0x8b50;
const GL_FLOAT_VEC3 = 0x8b51;
const GL_FLOAT_VEC4 = 0x8b52;
const GL_INT = 0x1404;
const GL_INT_VEC2 = 0x8b53;
const GL_INT_VEC3 = 0x8b54;
const GL_INT_VEC4 = 0x8b55;
const GL_UNSIGNED_INT = 0x1405;
const GL_UNSIGNED_INT_VEC2 = 0x8dc6;
const GL_UNSIGNED_INT_VEC3 = 0x8dc7;
const GL_UNSIGNED_INT_VEC4 = 0x8dc8;
const GL_BOOL = 0x8b56;
const GL_BOOL_VEC2 = 0x8b57;
const GL_BOOL_VEC3 = 0x8b58;
const GL_BOOL_VEC4 = 0x8b59;
const GL_FLOAT_MAT2 = 0x8b5a;
const GL_FLOAT_MAT3 = 0x8b5b;
const GL_FLOAT_MAT4 = 0x8b5c;
const GL_FLOAT_MAT2x3 = 0x8b65;
const GL_FLOAT_MAT2x4 = 0x8b66;
const GL_FLOAT_MAT3x2 = 0x8b67;
const GL_FLOAT_MAT3x4 = 0x8b68;
const GL_FLOAT_MAT4x2 = 0x8b69;
const GL_FLOAT_MAT4x3 = 0x8b6a;
const COMPOSITE_GL_TYPES = {
  [GL_FLOAT]: [GL_FLOAT, 1, 'float'],
  [GL_FLOAT_VEC2]: [GL_FLOAT, 2, 'vec2'],
  [GL_FLOAT_VEC3]: [GL_FLOAT, 3, 'vec3'],
  [GL_FLOAT_VEC4]: [GL_FLOAT, 4, 'vec4'],
  [GL_INT]: [GL_INT, 1, 'int'],
  [GL_INT_VEC2]: [GL_INT, 2, 'ivec2'],
  [GL_INT_VEC3]: [GL_INT, 3, 'ivec3'],
  [GL_INT_VEC4]: [GL_INT, 4, 'ivec4'],
  [GL_UNSIGNED_INT]: [GL_UNSIGNED_INT, 1, 'uint'],
  [GL_UNSIGNED_INT_VEC2]: [GL_UNSIGNED_INT, 2, 'uvec2'],
  [GL_UNSIGNED_INT_VEC3]: [GL_UNSIGNED_INT, 3, 'uvec3'],
  [GL_UNSIGNED_INT_VEC4]: [GL_UNSIGNED_INT, 4, 'uvec4'],
  [GL_BOOL]: [GL_FLOAT, 1, 'bool'],
  [GL_BOOL_VEC2]: [GL_FLOAT, 2, 'bvec2'],
  [GL_BOOL_VEC3]: [GL_FLOAT, 3, 'bvec3'],
  [GL_BOOL_VEC4]: [GL_FLOAT, 4, 'bvec4'],
  [GL_FLOAT_MAT2]: [GL_FLOAT, 8, 'mat2'],
  [GL_FLOAT_MAT2x3]: [GL_FLOAT, 8, 'mat2x3'],
  [GL_FLOAT_MAT2x4]: [GL_FLOAT, 8, 'mat2x4'],
  [GL_FLOAT_MAT3]: [GL_FLOAT, 12, 'mat3'],
  [GL_FLOAT_MAT3x2]: [GL_FLOAT, 12, 'mat3x2'],
  [GL_FLOAT_MAT3x4]: [GL_FLOAT, 12, 'mat3x4'],
  [GL_FLOAT_MAT4]: [GL_FLOAT, 16, 'mat4'],
  [GL_FLOAT_MAT4x2]: [GL_FLOAT, 16, 'mat4x2'],
  [GL_FLOAT_MAT4x3]: [GL_FLOAT, 16, 'mat4x3']
};
function getPrimitiveDrawMode(drawMode) {
  switch (drawMode) {
    case GL_POINTS:
      return GL_POINTS;

    case GL_LINES:
      return GL_LINES;

    case GL_LINE_STRIP:
      return GL_LINES;

    case GL_LINE_LOOP:
      return GL_LINES;

    case GL_TRIANGLES:
      return GL_TRIANGLES;

    case GL_TRIANGLE_STRIP:
      return GL_TRIANGLES;

    case GL_TRIANGLE_FAN:
      return GL_TRIANGLES;

    default:
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(false);
      return 0;
  }
}
function getPrimitiveCount({
  drawMode,
  vertexCount
}) {
  switch (drawMode) {
    case GL_POINTS:
    case GL_LINE_LOOP:
      return vertexCount;

    case GL_LINES:
      return vertexCount / 2;

    case GL_LINE_STRIP:
      return vertexCount - 1;

    case GL_TRIANGLES:
      return vertexCount / 3;

    case GL_TRIANGLE_STRIP:
    case GL_TRIANGLE_FAN:
      return vertexCount - 2;

    default:
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(false);
      return 0;
  }
}
function getVertexCount({
  drawMode,
  vertexCount
}) {
  const primitiveCount = getPrimitiveCount({
    drawMode,
    vertexCount
  });

  switch (getPrimitiveDrawMode(drawMode)) {
    case GL_POINTS:
      return primitiveCount;

    case GL_LINES:
      return primitiveCount * 2;

    case GL_TRIANGLES:
      return primitiveCount * 3;

    default:
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(false);
      return 0;
  }
}
function decomposeCompositeGLType(compositeGLType) {
  const typeAndSize = COMPOSITE_GL_TYPES[compositeGLType];

  if (!typeAndSize) {
    return null;
  }

  const [type, components] = typeAndSize;
  return {
    type,
    components
  };
}
function getCompositeGLType(type, components) {
  switch (type) {
    case GL_BYTE:
    case GL_UNSIGNED_BYTE:
    case GL_SHORT:
    case GL_UNSIGNED_SHORT:
      type = GL_FLOAT;
      break;

    default:
  }

  for (const glType in COMPOSITE_GL_TYPES) {
    const [compType, compComponents, name] = COMPOSITE_GL_TYPES[glType];

    if (compType === type && compComponents === components) {
      return {
        glType,
        name
      };
    }
  }

  return null;
}
//# sourceMappingURL=attribute-utils.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/constants-to-keys.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/constants-to-keys.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getKeyValue": () => (/* binding */ getKeyValue),
/* harmony export */   "getKey": () => (/* binding */ getKey),
/* harmony export */   "getKeyType": () => (/* binding */ getKeyType)
/* harmony export */ });
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");

function getKeyValue(gl, name) {
  if (typeof name !== 'string') {
    return name;
  }

  const number = Number(name);

  if (!isNaN(number)) {
    return number;
  }

  name = name.replace(/^.*\./, '');
  const value = gl[name];
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(value !== undefined, `Accessing undefined constant GL.${name}`);
  return value;
}
function getKey(gl, value) {
  value = Number(value);

  for (const key in gl) {
    if (gl[key] === value) {
      return `GL.${key}`;
    }
  }

  return String(value);
}
function getKeyType(gl, value) {
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(value !== undefined, 'undefined key');
  value = Number(value);

  for (const key in gl) {
    if (gl[key] === value) {
      return `GL.${key}`;
    }
  }

  return String(value);
}
//# sourceMappingURL=constants-to-keys.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/format-utils.js":
/*!**************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/format-utils.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "glFormatToComponents": () => (/* binding */ glFormatToComponents),
/* harmony export */   "glTypeToBytes": () => (/* binding */ glTypeToBytes)
/* harmony export */ });
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");

function glFormatToComponents(format) {
  switch (format) {
    case 6406:
    case 33326:
    case 6403:
      return 1;

    case 33328:
    case 33319:
      return 2;

    case 6407:
    case 34837:
      return 3;

    case 6408:
    case 34836:
      return 4;

    default:
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(false);
      return 0;
  }
}
function glTypeToBytes(type) {
  switch (type) {
    case 5121:
      return 1;

    case 33635:
    case 32819:
    case 32820:
      return 2;

    case 5126:
      return 4;

    default:
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(false);
      return 0;
  }
}
//# sourceMappingURL=format-utils.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/request-animation-frame.js":
/*!*************************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/request-animation-frame.js ***!
  \*************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "requestAnimationFrame": () => (/* binding */ requestAnimationFrame),
/* harmony export */   "cancelAnimationFrame": () => (/* binding */ cancelAnimationFrame)
/* harmony export */ });
function requestAnimationFrame(callback) {
  return typeof window !== 'undefined' && window.requestAnimationFrame ? window.requestAnimationFrame(callback) : setTimeout(callback, 1000 / 60);
}
function cancelAnimationFrame(timerId) {
  return typeof window !== 'undefined' && window.cancelAnimationFrame ? window.cancelAnimationFrame(timerId) : clearTimeout(timerId);
}
//# sourceMappingURL=request-animation-frame.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/texture-utils.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/texture-utils.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "cloneTextureFrom": () => (/* binding */ cloneTextureFrom),
/* harmony export */   "toFramebuffer": () => (/* binding */ toFramebuffer)
/* harmony export */ });
/* harmony import */ var _classes_texture_2d__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../classes/texture-2d */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture-2d.js");
/* harmony import */ var _classes_texture_cube__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../classes/texture-cube */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture-cube.js");
/* harmony import */ var _classes_texture_3d__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../classes/texture-3d */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture-3d.js");
/* harmony import */ var _classes_framebuffer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../classes/framebuffer */ "./node_modules/@luma.gl/webgl/dist/esm/classes/framebuffer.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/@luma.gl/webgl/dist/esm/utils/assert.js");





function cloneTextureFrom(refTexture, overrides) {
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(refTexture instanceof _classes_texture_2d__WEBPACK_IMPORTED_MODULE_1__["default"] || refTexture instanceof _classes_texture_cube__WEBPACK_IMPORTED_MODULE_2__["default"] || refTexture instanceof _classes_texture_3d__WEBPACK_IMPORTED_MODULE_3__["default"]);
  const TextureType = refTexture.constructor;
  const {
    gl,
    width,
    height,
    format,
    type,
    dataFormat,
    border,
    mipmaps
  } = refTexture;
  const textureOptions = Object.assign({
    width,
    height,
    format,
    type,
    dataFormat,
    border,
    mipmaps
  }, overrides);
  return new TextureType(gl, textureOptions);
}
function toFramebuffer(texture, opts) {
  const {
    gl,
    width,
    height,
    id
  } = texture;
  const framebuffer = new _classes_framebuffer__WEBPACK_IMPORTED_MODULE_4__["default"](gl, Object.assign({}, opts, {
    id: `framebuffer-for-${id}`,
    width,
    height,
    attachments: {
      [36064]: texture
    }
  }));
  return framebuffer;
}
//# sourceMappingURL=texture-utils.js.map

/***/ }),

/***/ "./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/typed-array-utils.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@luma.gl/webgl/dist/esm/webgl-utils/typed-array-utils.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getGLTypeFromTypedArray": () => (/* binding */ getGLTypeFromTypedArray),
/* harmony export */   "getTypedArrayFromGLType": () => (/* binding */ getTypedArrayFromGLType),
/* harmony export */   "flipRows": () => (/* binding */ flipRows),
/* harmony export */   "scalePixels": () => (/* binding */ scalePixels)
/* harmony export */ });
const ERR_TYPE_DEDUCTION = 'Failed to deduce GL constant from typed array';
function getGLTypeFromTypedArray(arrayOrType) {
  const type = ArrayBuffer.isView(arrayOrType) ? arrayOrType.constructor : arrayOrType;

  switch (type) {
    case Float32Array:
      return 5126;

    case Uint16Array:
      return 5123;

    case Uint32Array:
      return 5125;

    case Uint8Array:
      return 5121;

    case Uint8ClampedArray:
      return 5121;

    case Int8Array:
      return 5120;

    case Int16Array:
      return 5122;

    case Int32Array:
      return 5124;

    default:
      throw new Error(ERR_TYPE_DEDUCTION);
  }
}
function getTypedArrayFromGLType(glType, {
  clamped = true
} = {}) {
  switch (glType) {
    case 5126:
      return Float32Array;

    case 5123:
    case 33635:
    case 32819:
    case 32820:
      return Uint16Array;

    case 5125:
      return Uint32Array;

    case 5121:
      return clamped ? Uint8ClampedArray : Uint8Array;

    case 5120:
      return Int8Array;

    case 5122:
      return Int16Array;

    case 5124:
      return Int32Array;

    default:
      throw new Error('Failed to deduce typed array type from GL constant');
  }
}
function flipRows({
  data,
  width,
  height,
  bytesPerPixel = 4,
  temp
}) {
  const bytesPerRow = width * bytesPerPixel;
  temp = temp || new Uint8Array(bytesPerRow);

  for (let y = 0; y < height / 2; ++y) {
    const topOffset = y * bytesPerRow;
    const bottomOffset = (height - y - 1) * bytesPerRow;
    temp.set(data.subarray(topOffset, topOffset + bytesPerRow));
    data.copyWithin(topOffset, bottomOffset, bottomOffset + bytesPerRow);
    data.set(temp, bottomOffset);
  }
}
function scalePixels({
  data,
  width,
  height
}) {
  const newWidth = Math.round(width / 2);
  const newHeight = Math.round(height / 2);
  const newData = new Uint8Array(newWidth * newHeight * 4);

  for (let y = 0; y < newHeight; y++) {
    for (let x = 0; x < newWidth; x++) {
      for (let c = 0; c < 4; c++) {
        newData[(y * newWidth + x) * 4 + c] = data[(y * 2 * width + x * 2) * 4 + c];
      }
    }
  }

  return {
    data: newData,
    width: newWidth,
    height: newHeight
  };
}
//# sourceMappingURL=typed-array-utils.js.map

/***/ }),

/***/ "./node_modules/@probe.gl/stats/dist/esm/index.js":
/*!********************************************************!*\
  !*** ./node_modules/@probe.gl/stats/dist/esm/index.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Stats": () => (/* reexport safe */ _lib_stats__WEBPACK_IMPORTED_MODULE_0__["default"]),
/* harmony export */   "Stat": () => (/* reexport safe */ _lib_stat__WEBPACK_IMPORTED_MODULE_1__["default"]),
/* harmony export */   "_getHiResTimestamp": () => (/* reexport safe */ _utils_hi_res_timestamp__WEBPACK_IMPORTED_MODULE_2__["default"])
/* harmony export */ });
/* harmony import */ var _lib_stats__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./lib/stats */ "./node_modules/@probe.gl/stats/dist/esm/lib/stats.js");
/* harmony import */ var _lib_stat__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./lib/stat */ "./node_modules/@probe.gl/stats/dist/esm/lib/stat.js");
/* harmony import */ var _utils_hi_res_timestamp__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils/hi-res-timestamp */ "./node_modules/@probe.gl/stats/dist/esm/utils/hi-res-timestamp.js");



//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@probe.gl/stats/dist/esm/lib/stat.js":
/*!***********************************************************!*\
  !*** ./node_modules/@probe.gl/stats/dist/esm/lib/stat.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Stat)
/* harmony export */ });
/* harmony import */ var _utils_hi_res_timestamp__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/hi-res-timestamp */ "./node_modules/@probe.gl/stats/dist/esm/utils/hi-res-timestamp.js");

class Stat {
  constructor(name, type) {
    this.name = name;
    this.type = type;
    this.sampleSize = 1;
    this.reset();
  }

  setSampleSize(samples) {
    this.sampleSize = samples;
    return this;
  }

  incrementCount() {
    this.addCount(1);
    return this;
  }

  decrementCount() {
    this.subtractCount(1);
    return this;
  }

  addCount(value) {
    this._count += value;
    this._samples++;

    this._checkSampling();

    return this;
  }

  subtractCount(value) {
    this._count -= value;
    this._samples++;

    this._checkSampling();

    return this;
  }

  addTime(time) {
    this._time += time;
    this.lastTiming = time;
    this._samples++;

    this._checkSampling();

    return this;
  }

  timeStart() {
    this._startTime = (0,_utils_hi_res_timestamp__WEBPACK_IMPORTED_MODULE_0__["default"])();
    this._timerPending = true;
    return this;
  }

  timeEnd() {
    if (!this._timerPending) {
      return this;
    }

    this.addTime((0,_utils_hi_res_timestamp__WEBPACK_IMPORTED_MODULE_0__["default"])() - this._startTime);
    this._timerPending = false;

    this._checkSampling();

    return this;
  }

  getSampleAverageCount() {
    return this.sampleSize > 0 ? this.lastSampleCount / this.sampleSize : 0;
  }

  getSampleAverageTime() {
    return this.sampleSize > 0 ? this.lastSampleTime / this.sampleSize : 0;
  }

  getSampleHz() {
    return this.lastSampleTime > 0 ? this.sampleSize / (this.lastSampleTime / 1000) : 0;
  }

  getAverageCount() {
    return this.samples > 0 ? this.count / this.samples : 0;
  }

  getAverageTime() {
    return this.samples > 0 ? this.time / this.samples : 0;
  }

  getHz() {
    return this.time > 0 ? this.samples / (this.time / 1000) : 0;
  }

  reset() {
    this.time = 0;
    this.count = 0;
    this.samples = 0;
    this.lastTiming = 0;
    this.lastSampleTime = 0;
    this.lastSampleCount = 0;
    this._count = 0;
    this._time = 0;
    this._samples = 0;
    this._startTime = 0;
    this._timerPending = false;
    return this;
  }

  _checkSampling() {
    if (this._samples === this.sampleSize) {
      this.lastSampleTime = this._time;
      this.lastSampleCount = this._count;
      this.count += this._count;
      this.time += this._time;
      this.samples += this._samples;
      this._time = 0;
      this._count = 0;
      this._samples = 0;
    }
  }

}
//# sourceMappingURL=stat.js.map

/***/ }),

/***/ "./node_modules/@probe.gl/stats/dist/esm/lib/stats.js":
/*!************************************************************!*\
  !*** ./node_modules/@probe.gl/stats/dist/esm/lib/stats.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Stats)
/* harmony export */ });
/* harmony import */ var _stat__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./stat */ "./node_modules/@probe.gl/stats/dist/esm/lib/stat.js");

class Stats {
  constructor({
    id,
    stats
  }) {
    this.id = id;
    this.stats = {};

    this._initializeStats(stats);

    Object.seal(this);
  }

  get(name, type = 'count') {
    return this._getOrCreate({
      name,
      type
    });
  }

  get size() {
    return Object.keys(this.stats).length;
  }

  reset() {
    for (const key in this.stats) {
      this.stats[key].reset();
    }

    return this;
  }

  forEach(fn) {
    for (const key in this.stats) {
      fn(this.stats[key]);
    }
  }

  getTable() {
    const table = {};
    this.forEach(stat => {
      table[stat.name] = {
        time: stat.time || 0,
        count: stat.count || 0,
        average: stat.getAverageTime() || 0,
        hz: stat.getHz() || 0
      };
    });
    return table;
  }

  _initializeStats(stats = []) {
    stats.forEach(stat => this._getOrCreate(stat));
  }

  _getOrCreate(stat) {
    if (!stat || !stat.name) {
      return null;
    }

    const {
      name,
      type
    } = stat;

    if (!this.stats[name]) {
      if (stat instanceof _stat__WEBPACK_IMPORTED_MODULE_0__["default"]) {
        this.stats[name] = stat;
      } else {
        this.stats[name] = new _stat__WEBPACK_IMPORTED_MODULE_0__["default"](name, type);
      }
    }

    return this.stats[name];
  }

}
//# sourceMappingURL=stats.js.map

/***/ }),

/***/ "./node_modules/@probe.gl/stats/dist/esm/utils/hi-res-timestamp.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@probe.gl/stats/dist/esm/utils/hi-res-timestamp.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ getHiResTimestamp)
/* harmony export */ });
function getHiResTimestamp() {
  let timestamp;

  if (typeof window !== 'undefined' && window.performance) {
    timestamp = window.performance.now();
  } else if (typeof process !== 'undefined' && process.hrtime) {
    const timeParts = process.hrtime();
    timestamp = timeParts[0] * 1000 + timeParts[1] / 1e6;
  } else {
    timestamp = Date.now();
  }

  return timestamp;
}
//# sourceMappingURL=hi-res-timestamp.js.map

/***/ }),

/***/ "./node_modules/es6-promise/dist/es6-promise.js":
/*!******************************************************!*\
  !*** ./node_modules/es6-promise/dist/es6-promise.js ***!
  \******************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   v4.2.8+1e68dce6
 */

(function (global, factory) {
	 true ? module.exports = factory() :
	0;
}(this, (function () { 'use strict';

function objectOrFunction(x) {
  var type = typeof x;
  return x !== null && (type === 'object' || type === 'function');
}

function isFunction(x) {
  return typeof x === 'function';
}



var _isArray = void 0;
if (Array.isArray) {
  _isArray = Array.isArray;
} else {
  _isArray = function (x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
}

var isArray = _isArray;

var len = 0;
var vertxNext = void 0;
var customSchedulerFn = void 0;

var asap = function asap(callback, arg) {
  queue[len] = callback;
  queue[len + 1] = arg;
  len += 2;
  if (len === 2) {
    // If len is 2, that means that we need to schedule an async flush.
    // If additional callbacks are queued before the queue is flushed, they
    // will be processed by this flush that we are scheduling.
    if (customSchedulerFn) {
      customSchedulerFn(flush);
    } else {
      scheduleFlush();
    }
  }
};

function setScheduler(scheduleFn) {
  customSchedulerFn = scheduleFn;
}

function setAsap(asapFn) {
  asap = asapFn;
}

var browserWindow = typeof window !== 'undefined' ? window : undefined;
var browserGlobal = browserWindow || {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

// test for web worker but not in IE10
var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

// node
function useNextTick() {
  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
  // see https://github.com/cujojs/when/issues/410 for details
  return function () {
    return process.nextTick(flush);
  };
}

// vertx
function useVertxTimer() {
  if (typeof vertxNext !== 'undefined') {
    return function () {
      vertxNext(flush);
    };
  }

  return useSetTimeout();
}

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function () {
    node.data = iterations = ++iterations % 2;
  };
}

// web worker
function useMessageChannel() {
  var channel = new MessageChannel();
  channel.port1.onmessage = flush;
  return function () {
    return channel.port2.postMessage(0);
  };
}

function useSetTimeout() {
  // Store setTimeout reference so es6-promise will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var globalSetTimeout = setTimeout;
  return function () {
    return globalSetTimeout(flush, 1);
  };
}

var queue = new Array(1000);
function flush() {
  for (var i = 0; i < len; i += 2) {
    var callback = queue[i];
    var arg = queue[i + 1];

    callback(arg);

    queue[i] = undefined;
    queue[i + 1] = undefined;
  }

  len = 0;
}

function attemptVertx() {
  try {
    var vertx = Function('return this')().require('vertx');
    vertxNext = vertx.runOnLoop || vertx.runOnContext;
    return useVertxTimer();
  } catch (e) {
    return useSetTimeout();
  }
}

var scheduleFlush = void 0;
// Decide what async method to use to triggering processing of queued callbacks:
if (isNode) {
  scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else if (isWorker) {
  scheduleFlush = useMessageChannel();
} else if (browserWindow === undefined && "function" === 'function') {
  scheduleFlush = attemptVertx();
} else {
  scheduleFlush = useSetTimeout();
}

function then(onFulfillment, onRejection) {
  var parent = this;

  var child = new this.constructor(noop);

  if (child[PROMISE_ID] === undefined) {
    makePromise(child);
  }

  var _state = parent._state;


  if (_state) {
    var callback = arguments[_state - 1];
    asap(function () {
      return invokeCallback(_state, child, callback, parent._result);
    });
  } else {
    subscribe(parent, child, onFulfillment, onRejection);
  }

  return child;
}

/**
  `Promise.resolve` returns a promise that will become resolved with the
  passed `value`. It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    resolve(1);
  });

  promise.then(function(value){
    // value === 1
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.resolve(1);

  promise.then(function(value){
    // value === 1
  });
  ```

  @method resolve
  @static
  @param {Any} value value that the returned promise will be resolved with
  Useful for tooling.
  @return {Promise} a promise that will become fulfilled with the given
  `value`
*/
function resolve$1(object) {
  /*jshint validthis:true */
  var Constructor = this;

  if (object && typeof object === 'object' && object.constructor === Constructor) {
    return object;
  }

  var promise = new Constructor(noop);
  resolve(promise, object);
  return promise;
}

var PROMISE_ID = Math.random().toString(36).substring(2);

function noop() {}

var PENDING = void 0;
var FULFILLED = 1;
var REJECTED = 2;

function selfFulfillment() {
  return new TypeError("You cannot resolve a promise with itself");
}

function cannotReturnOwn() {
  return new TypeError('A promises callback cannot return that same promise.');
}

function tryThen(then$$1, value, fulfillmentHandler, rejectionHandler) {
  try {
    then$$1.call(value, fulfillmentHandler, rejectionHandler);
  } catch (e) {
    return e;
  }
}

function handleForeignThenable(promise, thenable, then$$1) {
  asap(function (promise) {
    var sealed = false;
    var error = tryThen(then$$1, thenable, function (value) {
      if (sealed) {
        return;
      }
      sealed = true;
      if (thenable !== value) {
        resolve(promise, value);
      } else {
        fulfill(promise, value);
      }
    }, function (reason) {
      if (sealed) {
        return;
      }
      sealed = true;

      reject(promise, reason);
    }, 'Settle: ' + (promise._label || ' unknown promise'));

    if (!sealed && error) {
      sealed = true;
      reject(promise, error);
    }
  }, promise);
}

function handleOwnThenable(promise, thenable) {
  if (thenable._state === FULFILLED) {
    fulfill(promise, thenable._result);
  } else if (thenable._state === REJECTED) {
    reject(promise, thenable._result);
  } else {
    subscribe(thenable, undefined, function (value) {
      return resolve(promise, value);
    }, function (reason) {
      return reject(promise, reason);
    });
  }
}

function handleMaybeThenable(promise, maybeThenable, then$$1) {
  if (maybeThenable.constructor === promise.constructor && then$$1 === then && maybeThenable.constructor.resolve === resolve$1) {
    handleOwnThenable(promise, maybeThenable);
  } else {
    if (then$$1 === undefined) {
      fulfill(promise, maybeThenable);
    } else if (isFunction(then$$1)) {
      handleForeignThenable(promise, maybeThenable, then$$1);
    } else {
      fulfill(promise, maybeThenable);
    }
  }
}

function resolve(promise, value) {
  if (promise === value) {
    reject(promise, selfFulfillment());
  } else if (objectOrFunction(value)) {
    var then$$1 = void 0;
    try {
      then$$1 = value.then;
    } catch (error) {
      reject(promise, error);
      return;
    }
    handleMaybeThenable(promise, value, then$$1);
  } else {
    fulfill(promise, value);
  }
}

function publishRejection(promise) {
  if (promise._onerror) {
    promise._onerror(promise._result);
  }

  publish(promise);
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) {
    return;
  }

  promise._result = value;
  promise._state = FULFILLED;

  if (promise._subscribers.length !== 0) {
    asap(publish, promise);
  }
}

function reject(promise, reason) {
  if (promise._state !== PENDING) {
    return;
  }
  promise._state = REJECTED;
  promise._result = reason;

  asap(publishRejection, promise);
}

function subscribe(parent, child, onFulfillment, onRejection) {
  var _subscribers = parent._subscribers;
  var length = _subscribers.length;


  parent._onerror = null;

  _subscribers[length] = child;
  _subscribers[length + FULFILLED] = onFulfillment;
  _subscribers[length + REJECTED] = onRejection;

  if (length === 0 && parent._state) {
    asap(publish, parent);
  }
}

function publish(promise) {
  var subscribers = promise._subscribers;
  var settled = promise._state;

  if (subscribers.length === 0) {
    return;
  }

  var child = void 0,
      callback = void 0,
      detail = promise._result;

  for (var i = 0; i < subscribers.length; i += 3) {
    child = subscribers[i];
    callback = subscribers[i + settled];

    if (child) {
      invokeCallback(settled, child, callback, detail);
    } else {
      callback(detail);
    }
  }

  promise._subscribers.length = 0;
}

function invokeCallback(settled, promise, callback, detail) {
  var hasCallback = isFunction(callback),
      value = void 0,
      error = void 0,
      succeeded = true;

  if (hasCallback) {
    try {
      value = callback(detail);
    } catch (e) {
      succeeded = false;
      error = e;
    }

    if (promise === value) {
      reject(promise, cannotReturnOwn());
      return;
    }
  } else {
    value = detail;
  }

  if (promise._state !== PENDING) {
    // noop
  } else if (hasCallback && succeeded) {
    resolve(promise, value);
  } else if (succeeded === false) {
    reject(promise, error);
  } else if (settled === FULFILLED) {
    fulfill(promise, value);
  } else if (settled === REJECTED) {
    reject(promise, value);
  }
}

function initializePromise(promise, resolver) {
  try {
    resolver(function resolvePromise(value) {
      resolve(promise, value);
    }, function rejectPromise(reason) {
      reject(promise, reason);
    });
  } catch (e) {
    reject(promise, e);
  }
}

var id = 0;
function nextId() {
  return id++;
}

function makePromise(promise) {
  promise[PROMISE_ID] = id++;
  promise._state = undefined;
  promise._result = undefined;
  promise._subscribers = [];
}

function validationError() {
  return new Error('Array Methods must be provided an Array');
}

var Enumerator = function () {
  function Enumerator(Constructor, input) {
    this._instanceConstructor = Constructor;
    this.promise = new Constructor(noop);

    if (!this.promise[PROMISE_ID]) {
      makePromise(this.promise);
    }

    if (isArray(input)) {
      this.length = input.length;
      this._remaining = input.length;

      this._result = new Array(this.length);

      if (this.length === 0) {
        fulfill(this.promise, this._result);
      } else {
        this.length = this.length || 0;
        this._enumerate(input);
        if (this._remaining === 0) {
          fulfill(this.promise, this._result);
        }
      }
    } else {
      reject(this.promise, validationError());
    }
  }

  Enumerator.prototype._enumerate = function _enumerate(input) {
    for (var i = 0; this._state === PENDING && i < input.length; i++) {
      this._eachEntry(input[i], i);
    }
  };

  Enumerator.prototype._eachEntry = function _eachEntry(entry, i) {
    var c = this._instanceConstructor;
    var resolve$$1 = c.resolve;


    if (resolve$$1 === resolve$1) {
      var _then = void 0;
      var error = void 0;
      var didError = false;
      try {
        _then = entry.then;
      } catch (e) {
        didError = true;
        error = e;
      }

      if (_then === then && entry._state !== PENDING) {
        this._settledAt(entry._state, i, entry._result);
      } else if (typeof _then !== 'function') {
        this._remaining--;
        this._result[i] = entry;
      } else if (c === Promise$1) {
        var promise = new c(noop);
        if (didError) {
          reject(promise, error);
        } else {
          handleMaybeThenable(promise, entry, _then);
        }
        this._willSettleAt(promise, i);
      } else {
        this._willSettleAt(new c(function (resolve$$1) {
          return resolve$$1(entry);
        }), i);
      }
    } else {
      this._willSettleAt(resolve$$1(entry), i);
    }
  };

  Enumerator.prototype._settledAt = function _settledAt(state, i, value) {
    var promise = this.promise;


    if (promise._state === PENDING) {
      this._remaining--;

      if (state === REJECTED) {
        reject(promise, value);
      } else {
        this._result[i] = value;
      }
    }

    if (this._remaining === 0) {
      fulfill(promise, this._result);
    }
  };

  Enumerator.prototype._willSettleAt = function _willSettleAt(promise, i) {
    var enumerator = this;

    subscribe(promise, undefined, function (value) {
      return enumerator._settledAt(FULFILLED, i, value);
    }, function (reason) {
      return enumerator._settledAt(REJECTED, i, reason);
    });
  };

  return Enumerator;
}();

/**
  `Promise.all` accepts an array of promises, and returns a new promise which
  is fulfilled with an array of fulfillment values for the passed promises, or
  rejected with the reason of the first passed promise to be rejected. It casts all
  elements of the passed iterable to promises as it runs this algorithm.

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = resolve(2);
  let promise3 = resolve(3);
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = reject(new Error("2"));
  let promise3 = reject(new Error("3"));
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  @method all
  @static
  @param {Array} entries array of promises
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
  @static
*/
function all(entries) {
  return new Enumerator(this, entries).promise;
}

/**
  `Promise.race` returns a new promise which is settled in the same way as the
  first passed promise to settle.

  Example:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 2');
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // result === 'promise 2' because it was resolved before promise1
    // was resolved.
  });
  ```

  `Promise.race` is deterministic in that only the state of the first
  settled promise matters. For example, even if other promises given to the
  `promises` array argument are resolved, but the first settled promise has
  become rejected before the other promises became fulfilled, the returned
  promise will become rejected:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error('promise 2'));
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // Code here never runs
  }, function(reason){
    // reason.message === 'promise 2' because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  An example real-world use case is implementing timeouts:

  ```javascript
  Promise.race([ajax('foo.json'), timeout(5000)])
  ```

  @method race
  @static
  @param {Array} promises array of promises to observe
  Useful for tooling.
  @return {Promise} a promise which settles in the same way as the first passed
  promise to settle.
*/
function race(entries) {
  /*jshint validthis:true */
  var Constructor = this;

  if (!isArray(entries)) {
    return new Constructor(function (_, reject) {
      return reject(new TypeError('You must pass an array to race.'));
    });
  } else {
    return new Constructor(function (resolve, reject) {
      var length = entries.length;
      for (var i = 0; i < length; i++) {
        Constructor.resolve(entries[i]).then(resolve, reject);
      }
    });
  }
}

/**
  `Promise.reject` returns a promise rejected with the passed `reason`.
  It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.reject(new Error('WHOOPS'));

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  @method reject
  @static
  @param {Any} reason value that the returned promise will be rejected with.
  Useful for tooling.
  @return {Promise} a promise rejected with the given `reason`.
*/
function reject$1(reason) {
  /*jshint validthis:true */
  var Constructor = this;
  var promise = new Constructor(noop);
  reject(promise, reason);
  return promise;
}

function needsResolver() {
  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
}

function needsNew() {
  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
}

/**
  Promise objects represent the eventual result of an asynchronous operation. The
  primary way of interacting with a promise is through its `then` method, which
  registers callbacks to receive either a promise's eventual value or the reason
  why the promise cannot be fulfilled.

  Terminology
  -----------

  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
  - `thenable` is an object or function that defines a `then` method.
  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
  - `exception` is a value that is thrown using the throw statement.
  - `reason` is a value that indicates why a promise was rejected.
  - `settled` the final resting state of a promise, fulfilled or rejected.

  A promise can be in one of three states: pending, fulfilled, or rejected.

  Promises that are fulfilled have a fulfillment value and are in the fulfilled
  state.  Promises that are rejected have a rejection reason and are in the
  rejected state.  A fulfillment value is never a thenable.

  Promises can also be said to *resolve* a value.  If this value is also a
  promise, then the original promise's settled state will match the value's
  settled state.  So a promise that *resolves* a promise that rejects will
  itself reject, and a promise that *resolves* a promise that fulfills will
  itself fulfill.


  Basic Usage:
  ------------

  ```js
  let promise = new Promise(function(resolve, reject) {
    // on success
    resolve(value);

    // on failure
    reject(reason);
  });

  promise.then(function(value) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Advanced Usage:
  ---------------

  Promises shine when abstracting away asynchronous interactions such as
  `XMLHttpRequest`s.

  ```js
  function getJSON(url) {
    return new Promise(function(resolve, reject){
      let xhr = new XMLHttpRequest();

      xhr.open('GET', url);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
          }
        }
      };
    });
  }

  getJSON('/posts.json').then(function(json) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Unlike callbacks, promises are great composable primitives.

  ```js
  Promise.all([
    getJSON('/posts'),
    getJSON('/comments')
  ]).then(function(values){
    values[0] // => postsJSON
    values[1] // => commentsJSON

    return values;
  });
  ```

  @class Promise
  @param {Function} resolver
  Useful for tooling.
  @constructor
*/

var Promise$1 = function () {
  function Promise(resolver) {
    this[PROMISE_ID] = nextId();
    this._result = this._state = undefined;
    this._subscribers = [];

    if (noop !== resolver) {
      typeof resolver !== 'function' && needsResolver();
      this instanceof Promise ? initializePromise(this, resolver) : needsNew();
    }
  }

  /**
  The primary way of interacting with a promise is through its `then` method,
  which registers callbacks to receive either a promise's eventual value or the
  reason why the promise cannot be fulfilled.
   ```js
  findUser().then(function(user){
    // user is available
  }, function(reason){
    // user is unavailable, and you are given the reason why
  });
  ```
   Chaining
  --------
   The return value of `then` is itself a promise.  This second, 'downstream'
  promise is resolved with the return value of the first promise's fulfillment
  or rejection handler, or rejected if the handler throws an exception.
   ```js
  findUser().then(function (user) {
    return user.name;
  }, function (reason) {
    return 'default name';
  }).then(function (userName) {
    // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
    // will be `'default name'`
  });
   findUser().then(function (user) {
    throw new Error('Found user, but still unhappy');
  }, function (reason) {
    throw new Error('`findUser` rejected and we're unhappy');
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
    // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
  });
  ```
  If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
   ```js
  findUser().then(function (user) {
    throw new PedagogicalException('Upstream error');
  }).then(function (value) {
    // never reached
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // The `PedgagocialException` is propagated all the way down to here
  });
  ```
   Assimilation
  ------------
   Sometimes the value you want to propagate to a downstream promise can only be
  retrieved asynchronously. This can be achieved by returning a promise in the
  fulfillment or rejection handler. The downstream promise will then be pending
  until the returned promise is settled. This is called *assimilation*.
   ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // The user's comments are now available
  });
  ```
   If the assimliated promise rejects, then the downstream promise will also reject.
   ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // If `findCommentsByAuthor` fulfills, we'll have the value here
  }, function (reason) {
    // If `findCommentsByAuthor` rejects, we'll have the reason here
  });
  ```
   Simple Example
  --------------
   Synchronous Example
   ```javascript
  let result;
   try {
    result = findResult();
    // success
  } catch(reason) {
    // failure
  }
  ```
   Errback Example
   ```js
  findResult(function(result, err){
    if (err) {
      // failure
    } else {
      // success
    }
  });
  ```
   Promise Example;
   ```javascript
  findResult().then(function(result){
    // success
  }, function(reason){
    // failure
  });
  ```
   Advanced Example
  --------------
   Synchronous Example
   ```javascript
  let author, books;
   try {
    author = findAuthor();
    books  = findBooksByAuthor(author);
    // success
  } catch(reason) {
    // failure
  }
  ```
   Errback Example
   ```js
   function foundBooks(books) {
   }
   function failure(reason) {
   }
   findAuthor(function(author, err){
    if (err) {
      failure(err);
      // failure
    } else {
      try {
        findBoooksByAuthor(author, function(books, err) {
          if (err) {
            failure(err);
          } else {
            try {
              foundBooks(books);
            } catch(reason) {
              failure(reason);
            }
          }
        });
      } catch(error) {
        failure(err);
      }
      // success
    }
  });
  ```
   Promise Example;
   ```javascript
  findAuthor().
    then(findBooksByAuthor).
    then(function(books){
      // found books
  }).catch(function(reason){
    // something went wrong
  });
  ```
   @method then
  @param {Function} onFulfilled
  @param {Function} onRejected
  Useful for tooling.
  @return {Promise}
  */

  /**
  `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
  as the catch block of a try/catch statement.
  ```js
  function findAuthor(){
  throw new Error('couldn't find that author');
  }
  // synchronous
  try {
  findAuthor();
  } catch(reason) {
  // something went wrong
  }
  // async with promises
  findAuthor().catch(function(reason){
  // something went wrong
  });
  ```
  @method catch
  @param {Function} onRejection
  Useful for tooling.
  @return {Promise}
  */


  Promise.prototype.catch = function _catch(onRejection) {
    return this.then(null, onRejection);
  };

  /**
    `finally` will be invoked regardless of the promise's fate just as native
    try/catch/finally behaves
  
    Synchronous example:
  
    ```js
    findAuthor() {
      if (Math.random() > 0.5) {
        throw new Error();
      }
      return new Author();
    }
  
    try {
      return findAuthor(); // succeed or fail
    } catch(error) {
      return findOtherAuther();
    } finally {
      // always runs
      // doesn't affect the return value
    }
    ```
  
    Asynchronous example:
  
    ```js
    findAuthor().catch(function(reason){
      return findOtherAuther();
    }).finally(function(){
      // author was either found, or not
    });
    ```
  
    @method finally
    @param {Function} callback
    @return {Promise}
  */


  Promise.prototype.finally = function _finally(callback) {
    var promise = this;
    var constructor = promise.constructor;

    if (isFunction(callback)) {
      return promise.then(function (value) {
        return constructor.resolve(callback()).then(function () {
          return value;
        });
      }, function (reason) {
        return constructor.resolve(callback()).then(function () {
          throw reason;
        });
      });
    }

    return promise.then(callback, callback);
  };

  return Promise;
}();

Promise$1.prototype.then = then;
Promise$1.all = all;
Promise$1.race = race;
Promise$1.resolve = resolve$1;
Promise$1.reject = reject$1;
Promise$1._setScheduler = setScheduler;
Promise$1._setAsap = setAsap;
Promise$1._asap = asap;

/*global self*/
function polyfill() {
  var local = void 0;

  if (typeof __webpack_require__.g !== 'undefined') {
    local = __webpack_require__.g;
  } else if (typeof self !== 'undefined') {
    local = self;
  } else {
    try {
      local = Function('return this')();
    } catch (e) {
      throw new Error('polyfill failed because global object is unavailable in this environment');
    }
  }

  var P = local.Promise;

  if (P) {
    var promiseToString = null;
    try {
      promiseToString = Object.prototype.toString.call(P.resolve());
    } catch (e) {
      // silently ignored
    }

    if (promiseToString === '[object Promise]' && !P.cast) {
      return;
    }
  }

  local.Promise = Promise$1;
}

// Strange compat..
Promise$1.polyfill = polyfill;
Promise$1.Promise = Promise$1;

return Promise$1;

})));



//# sourceMappingURL=es6-promise.map


/***/ }),

/***/ "./node_modules/probe.gl/dist/es5/env/get-browser.js":
/*!***********************************************************!*\
  !*** ./node_modules/probe.gl/dist/es5/env/get-browser.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "./node_modules/@babel/runtime/helpers/interopRequireDefault.js");

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.isMobile = isMobile;
exports["default"] = getBrowser;

var _globals = __webpack_require__(/*! ./globals */ "./node_modules/probe.gl/dist/es5/env/globals.js");

var _isBrowser = _interopRequireDefault(__webpack_require__(/*! ./is-browser */ "./node_modules/probe.gl/dist/es5/env/is-browser.js"));

var _isElectron = _interopRequireDefault(__webpack_require__(/*! ./is-electron */ "./node_modules/probe.gl/dist/es5/env/is-electron.js"));

function isMobile() {
  return typeof _globals.window.orientation !== 'undefined';
}

function getBrowser(mockUserAgent) {
  if (!mockUserAgent && !(0, _isBrowser.default)()) {
    return 'Node';
  }

  if ((0, _isElectron.default)(mockUserAgent)) {
    return 'Electron';
  }

  var navigator_ = typeof navigator !== 'undefined' ? navigator : {};
  var userAgent = mockUserAgent || navigator_.userAgent || '';

  if (userAgent.indexOf('Edge') > -1) {
    return 'Edge';
  }

  var isMSIE = userAgent.indexOf('MSIE ') !== -1;
  var isTrident = userAgent.indexOf('Trident/') !== -1;

  if (isMSIE || isTrident) {
    return 'IE';
  }

  if (_globals.window.chrome) {
    return 'Chrome';
  }

  if (_globals.window.safari) {
    return 'Safari';
  }

  if (_globals.window.mozInnerScreenX) {
    return 'Firefox';
  }

  return 'Unknown';
}
//# sourceMappingURL=get-browser.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/es5/env/globals.js":
/*!*******************************************************!*\
  !*** ./node_modules/probe.gl/dist/es5/env/globals.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "./node_modules/@babel/runtime/helpers/interopRequireDefault.js");

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.console = exports.process = exports.document = exports.global = exports.window = exports.self = void 0;

var _typeof2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/typeof.js"));

var globals = {
  self: typeof self !== 'undefined' && self,
  window: typeof window !== 'undefined' && window,
  global: typeof __webpack_require__.g !== 'undefined' && __webpack_require__.g,
  document: typeof document !== 'undefined' && document,
  process: (typeof process === "undefined" ? "undefined" : (0, _typeof2.default)(process)) === 'object' && process
};
var self_ = globals.self || globals.window || globals.global;
exports.self = self_;
var window_ = globals.window || globals.self || globals.global;
exports.window = window_;
var global_ = globals.global || globals.self || globals.window;
exports.global = global_;
var document_ = globals.document || {};
exports.document = document_;
var process_ = globals.process || {};
exports.process = process_;
var console_ = console;
exports.console = console_;
//# sourceMappingURL=globals.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/es5/env/index.js":
/*!*****************************************************!*\
  !*** ./node_modules/probe.gl/dist/es5/env/index.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "./node_modules/@babel/runtime/helpers/interopRequireDefault.js");

var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/typeof.js");

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
Object.defineProperty(exports, "self", ({
  enumerable: true,
  get: function get() {
    return _globals.self;
  }
}));
Object.defineProperty(exports, "window", ({
  enumerable: true,
  get: function get() {
    return _globals.window;
  }
}));
Object.defineProperty(exports, "global", ({
  enumerable: true,
  get: function get() {
    return _globals.global;
  }
}));
Object.defineProperty(exports, "document", ({
  enumerable: true,
  get: function get() {
    return _globals.document;
  }
}));
Object.defineProperty(exports, "process", ({
  enumerable: true,
  get: function get() {
    return _globals.process;
  }
}));
Object.defineProperty(exports, "console", ({
  enumerable: true,
  get: function get() {
    return _globals.console;
  }
}));
Object.defineProperty(exports, "isBrowser", ({
  enumerable: true,
  get: function get() {
    return _isBrowser.default;
  }
}));
Object.defineProperty(exports, "isBrowserMainThread", ({
  enumerable: true,
  get: function get() {
    return _isBrowser.isBrowserMainThread;
  }
}));
Object.defineProperty(exports, "getBrowser", ({
  enumerable: true,
  get: function get() {
    return _getBrowser.default;
  }
}));
Object.defineProperty(exports, "isMobile", ({
  enumerable: true,
  get: function get() {
    return _getBrowser.isMobile;
  }
}));
Object.defineProperty(exports, "isElectron", ({
  enumerable: true,
  get: function get() {
    return _isElectron.default;
  }
}));

var _globals = __webpack_require__(/*! ./globals */ "./node_modules/probe.gl/dist/es5/env/globals.js");

var _isBrowser = _interopRequireWildcard(__webpack_require__(/*! ./is-browser */ "./node_modules/probe.gl/dist/es5/env/is-browser.js"));

var _getBrowser = _interopRequireWildcard(__webpack_require__(/*! ./get-browser */ "./node_modules/probe.gl/dist/es5/env/get-browser.js"));

var _isElectron = _interopRequireDefault(__webpack_require__(/*! ./is-electron */ "./node_modules/probe.gl/dist/es5/env/is-electron.js"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/es5/env/is-browser.js":
/*!**********************************************************!*\
  !*** ./node_modules/probe.gl/dist/es5/env/is-browser.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "./node_modules/@babel/runtime/helpers/interopRequireDefault.js");

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isBrowser;
exports.isBrowserMainThread = isBrowserMainThread;

var _typeof2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/typeof.js"));

var _isElectron = _interopRequireDefault(__webpack_require__(/*! ./is-electron */ "./node_modules/probe.gl/dist/es5/env/is-electron.js"));

function isBrowser() {
  var isNode = (typeof process === "undefined" ? "undefined" : (0, _typeof2.default)(process)) === 'object' && String(process) === '[object process]' && !process.browser;
  return !isNode || (0, _isElectron.default)();
}

function isBrowserMainThread() {
  return isBrowser() && typeof document !== 'undefined';
}
//# sourceMappingURL=is-browser.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/es5/env/is-electron.js":
/*!***********************************************************!*\
  !*** ./node_modules/probe.gl/dist/es5/env/is-electron.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "./node_modules/@babel/runtime/helpers/interopRequireDefault.js");

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isElectron;

var _typeof2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/typeof.js"));

function isElectron(mockUserAgent) {
  if (typeof window !== 'undefined' && (0, _typeof2.default)(window.process) === 'object' && window.process.type === 'renderer') {
    return true;
  }

  if (typeof process !== 'undefined' && (0, _typeof2.default)(process.versions) === 'object' && Boolean(process.versions.electron)) {
    return true;
  }

  var realUserAgent = (typeof navigator === "undefined" ? "undefined" : (0, _typeof2.default)(navigator)) === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent;
  var userAgent = mockUserAgent || realUserAgent;

  if (userAgent && userAgent.indexOf('Electron') >= 0) {
    return true;
  }

  return false;
}
//# sourceMappingURL=is-electron.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/esm/env/get-browser.js":
/*!***********************************************************!*\
  !*** ./node_modules/probe.gl/dist/esm/env/get-browser.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isMobile": () => (/* binding */ isMobile),
/* harmony export */   "default": () => (/* binding */ getBrowser)
/* harmony export */ });
/* harmony import */ var _globals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./globals */ "./node_modules/probe.gl/dist/esm/env/globals.js");
/* harmony import */ var _is_browser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./is-browser */ "./node_modules/probe.gl/dist/esm/env/is-browser.js");
/* harmony import */ var _is_electron__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./is-electron */ "./node_modules/probe.gl/dist/esm/env/is-electron.js");



function isMobile() {
  return typeof _globals__WEBPACK_IMPORTED_MODULE_0__.window.orientation !== 'undefined';
}
function getBrowser(mockUserAgent) {
  if (!mockUserAgent && !(0,_is_browser__WEBPACK_IMPORTED_MODULE_1__["default"])()) {
    return 'Node';
  }

  if ((0,_is_electron__WEBPACK_IMPORTED_MODULE_2__["default"])(mockUserAgent)) {
    return 'Electron';
  }

  const navigator_ = typeof navigator !== 'undefined' ? navigator : {};
  const userAgent = mockUserAgent || navigator_.userAgent || '';

  if (userAgent.indexOf('Edge') > -1) {
    return 'Edge';
  }

  const isMSIE = userAgent.indexOf('MSIE ') !== -1;
  const isTrident = userAgent.indexOf('Trident/') !== -1;

  if (isMSIE || isTrident) {
    return 'IE';
  }

  if (_globals__WEBPACK_IMPORTED_MODULE_0__.window.chrome) {
    return 'Chrome';
  }

  if (_globals__WEBPACK_IMPORTED_MODULE_0__.window.safari) {
    return 'Safari';
  }

  if (_globals__WEBPACK_IMPORTED_MODULE_0__.window.mozInnerScreenX) {
    return 'Firefox';
  }

  return 'Unknown';
}
//# sourceMappingURL=get-browser.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/esm/env/globals.js":
/*!*******************************************************!*\
  !*** ./node_modules/probe.gl/dist/esm/env/globals.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "self": () => (/* binding */ self_),
/* harmony export */   "window": () => (/* binding */ window_),
/* harmony export */   "global": () => (/* binding */ global_),
/* harmony export */   "document": () => (/* binding */ document_),
/* harmony export */   "process": () => (/* binding */ process_),
/* harmony export */   "console": () => (/* binding */ console_)
/* harmony export */ });
const globals = {
  self: typeof self !== 'undefined' && self,
  window: typeof window !== 'undefined' && window,
  global: typeof __webpack_require__.g !== 'undefined' && __webpack_require__.g,
  document: typeof document !== 'undefined' && document,
  process: typeof process === 'object' && process
};
const self_ = globals.self || globals.window || globals.global;
const window_ = globals.window || globals.self || globals.global;
const global_ = globals.global || globals.self || globals.window;
const document_ = globals.document || {};
const process_ = globals.process || {};
const console_ = console;

//# sourceMappingURL=globals.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/esm/env/is-browser.js":
/*!**********************************************************!*\
  !*** ./node_modules/probe.gl/dist/esm/env/is-browser.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ isBrowser),
/* harmony export */   "isBrowserMainThread": () => (/* binding */ isBrowserMainThread)
/* harmony export */ });
/* harmony import */ var _is_electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./is-electron */ "./node_modules/probe.gl/dist/esm/env/is-electron.js");

function isBrowser() {
  const isNode = typeof process === 'object' && String(process) === '[object process]' && !process.browser;
  return !isNode || (0,_is_electron__WEBPACK_IMPORTED_MODULE_0__["default"])();
}
function isBrowserMainThread() {
  return isBrowser() && typeof document !== 'undefined';
}
//# sourceMappingURL=is-browser.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/esm/env/is-electron.js":
/*!***********************************************************!*\
  !*** ./node_modules/probe.gl/dist/esm/env/is-electron.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ isElectron)
/* harmony export */ });
function isElectron(mockUserAgent) {
  if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
    return true;
  }

  if (typeof process !== 'undefined' && typeof process.versions === 'object' && Boolean(process.versions.electron)) {
    return true;
  }

  const realUserAgent = typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent;
  const userAgent = mockUserAgent || realUserAgent;

  if (userAgent && userAgent.indexOf('Electron') >= 0) {
    return true;
  }

  return false;
}
//# sourceMappingURL=is-electron.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/esm/lib/log.js":
/*!***************************************************!*\
  !*** ./node_modules/probe.gl/dist/esm/lib/log.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Log),
/* harmony export */   "normalizeArguments": () => (/* binding */ normalizeArguments)
/* harmony export */ });
/* harmony import */ var _utils_globals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/globals */ "./node_modules/probe.gl/dist/esm/utils/globals.js");
/* harmony import */ var _utils_local_storage__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/local-storage */ "./node_modules/probe.gl/dist/esm/utils/local-storage.js");
/* harmony import */ var _utils_formatters__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/formatters */ "./node_modules/probe.gl/dist/esm/utils/formatters.js");
/* harmony import */ var _utils_color__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../utils/color */ "./node_modules/probe.gl/dist/esm/utils/color.js");
/* harmony import */ var _utils_autobind__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/autobind */ "./node_modules/probe.gl/dist/esm/utils/autobind.js");
/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/assert */ "./node_modules/probe.gl/dist/esm/utils/assert.js");
/* harmony import */ var _utils_hi_res_timestamp__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/hi-res-timestamp */ "./node_modules/probe.gl/dist/esm/utils/hi-res-timestamp.js");







const originalConsole = {
  debug: _utils_globals__WEBPACK_IMPORTED_MODULE_0__.isBrowser ? console.debug || console.log : console.log,
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error
};
const DEFAULT_SETTINGS = {
  enabled: true,
  level: 0
};

function noop() {}

const cache = {};
const ONCE = {
  once: true
};

function getTableHeader(table) {
  for (const key in table) {
    for (const title in table[key]) {
      return title || 'untitled';
    }
  }

  return 'empty';
}

class Log {
  constructor({
    id
  } = {
    id: ''
  }) {
    this.id = id;
    this.VERSION = _utils_globals__WEBPACK_IMPORTED_MODULE_0__.VERSION;
    this._startTs = (0,_utils_hi_res_timestamp__WEBPACK_IMPORTED_MODULE_1__["default"])();
    this._deltaTs = (0,_utils_hi_res_timestamp__WEBPACK_IMPORTED_MODULE_1__["default"])();
    this.LOG_THROTTLE_TIMEOUT = 0;
    this._storage = new _utils_local_storage__WEBPACK_IMPORTED_MODULE_2__["default"]("__probe-".concat(this.id, "__"), DEFAULT_SETTINGS);
    this.userData = {};
    this.timeStamp("".concat(this.id, " started"));
    (0,_utils_autobind__WEBPACK_IMPORTED_MODULE_3__.autobind)(this);
    Object.seal(this);
  }

  set level(newLevel) {
    this.setLevel(newLevel);
  }

  get level() {
    return this.getLevel();
  }

  isEnabled() {
    return this._storage.config.enabled;
  }

  getLevel() {
    return this._storage.config.level;
  }

  getTotal() {
    return Number(((0,_utils_hi_res_timestamp__WEBPACK_IMPORTED_MODULE_1__["default"])() - this._startTs).toPrecision(10));
  }

  getDelta() {
    return Number(((0,_utils_hi_res_timestamp__WEBPACK_IMPORTED_MODULE_1__["default"])() - this._deltaTs).toPrecision(10));
  }

  set priority(newPriority) {
    this.level = newPriority;
  }

  get priority() {
    return this.level;
  }

  getPriority() {
    return this.level;
  }

  enable(enabled = true) {
    this._storage.updateConfiguration({
      enabled
    });

    return this;
  }

  setLevel(level) {
    this._storage.updateConfiguration({
      level
    });

    return this;
  }

  assert(condition, message) {
    (0,_utils_assert__WEBPACK_IMPORTED_MODULE_4__["default"])(condition, message);
  }

  warn(message) {
    return this._getLogFunction(0, message, originalConsole.warn, arguments, ONCE);
  }

  error(message) {
    return this._getLogFunction(0, message, originalConsole.error, arguments);
  }

  deprecated(oldUsage, newUsage) {
    return this.warn("`".concat(oldUsage, "` is deprecated and will be removed in a later version. Use `").concat(newUsage, "` instead"));
  }

  removed(oldUsage, newUsage) {
    return this.error("`".concat(oldUsage, "` has been removed. Use `").concat(newUsage, "` instead"));
  }

  probe(logLevel, message) {
    return this._getLogFunction(logLevel, message, originalConsole.log, arguments, {
      time: true,
      once: true
    });
  }

  log(logLevel, message) {
    return this._getLogFunction(logLevel, message, originalConsole.debug, arguments);
  }

  info(logLevel, message) {
    return this._getLogFunction(logLevel, message, console.info, arguments);
  }

  once(logLevel, message) {
    return this._getLogFunction(logLevel, message, originalConsole.debug || originalConsole.info, arguments, ONCE);
  }

  table(logLevel, table, columns) {
    if (table) {
      return this._getLogFunction(logLevel, table, console.table || noop, columns && [columns], {
        tag: getTableHeader(table)
      });
    }

    return noop;
  }

  image({
    logLevel,
    priority,
    image,
    message = '',
    scale = 1
  }) {
    if (!this._shouldLog(logLevel || priority)) {
      return noop;
    }

    return _utils_globals__WEBPACK_IMPORTED_MODULE_0__.isBrowser ? logImageInBrowser({
      image,
      message,
      scale
    }) : logImageInNode({
      image,
      message,
      scale
    });
  }

  settings() {
    if (console.table) {
      console.table(this._storage.config);
    } else {
      console.log(this._storage.config);
    }
  }

  get(setting) {
    return this._storage.config[setting];
  }

  set(setting, value) {
    this._storage.updateConfiguration({
      [setting]: value
    });
  }

  time(logLevel, message) {
    return this._getLogFunction(logLevel, message, console.time ? console.time : console.info);
  }

  timeEnd(logLevel, message) {
    return this._getLogFunction(logLevel, message, console.timeEnd ? console.timeEnd : console.info);
  }

  timeStamp(logLevel, message) {
    return this._getLogFunction(logLevel, message, console.timeStamp || noop);
  }

  group(logLevel, message, opts = {
    collapsed: false
  }) {
    opts = normalizeArguments({
      logLevel,
      message,
      opts
    });
    const {
      collapsed
    } = opts;
    opts.method = (collapsed ? console.groupCollapsed : console.group) || console.info;
    return this._getLogFunction(opts);
  }

  groupCollapsed(logLevel, message, opts = {}) {
    return this.group(logLevel, message, Object.assign({}, opts, {
      collapsed: true
    }));
  }

  groupEnd(logLevel) {
    return this._getLogFunction(logLevel, '', console.groupEnd || noop);
  }

  withGroup(logLevel, message, func) {
    this.group(logLevel, message)();

    try {
      func();
    } finally {
      this.groupEnd(logLevel)();
    }
  }

  trace() {
    if (console.trace) {
      console.trace();
    }
  }

  _shouldLog(logLevel) {
    return this.isEnabled() && this.getLevel() >= normalizeLogLevel(logLevel);
  }

  _getLogFunction(logLevel, message, method, args = [], opts) {
    if (this._shouldLog(logLevel)) {
      opts = normalizeArguments({
        logLevel,
        message,
        args,
        opts
      });
      method = method || opts.method;
      (0,_utils_assert__WEBPACK_IMPORTED_MODULE_4__["default"])(method);
      opts.total = this.getTotal();
      opts.delta = this.getDelta();
      this._deltaTs = (0,_utils_hi_res_timestamp__WEBPACK_IMPORTED_MODULE_1__["default"])();
      const tag = opts.tag || opts.message;

      if (opts.once) {
        if (!cache[tag]) {
          cache[tag] = (0,_utils_hi_res_timestamp__WEBPACK_IMPORTED_MODULE_1__["default"])();
        } else {
          return noop;
        }
      }

      message = decorateMessage(this.id, opts.message, opts);
      return method.bind(console, message, ...opts.args);
    }

    return noop;
  }

}
Log.VERSION = _utils_globals__WEBPACK_IMPORTED_MODULE_0__.VERSION;

function normalizeLogLevel(logLevel) {
  if (!logLevel) {
    return 0;
  }

  let resolvedLevel;

  switch (typeof logLevel) {
    case 'number':
      resolvedLevel = logLevel;
      break;

    case 'object':
      resolvedLevel = logLevel.logLevel || logLevel.priority || 0;
      break;

    default:
      return 0;
  }

  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_4__["default"])(Number.isFinite(resolvedLevel) && resolvedLevel >= 0);
  return resolvedLevel;
}

function normalizeArguments(opts) {
  const {
    logLevel,
    message
  } = opts;
  opts.logLevel = normalizeLogLevel(logLevel);
  const args = opts.args ? Array.from(opts.args) : [];

  while (args.length && args.shift() !== message) {}

  opts.args = args;

  switch (typeof logLevel) {
    case 'string':
    case 'function':
      if (message !== undefined) {
        args.unshift(message);
      }

      opts.message = logLevel;
      break;

    case 'object':
      Object.assign(opts, logLevel);
      break;

    default:
  }

  if (typeof opts.message === 'function') {
    opts.message = opts.message();
  }

  const messageType = typeof opts.message;
  (0,_utils_assert__WEBPACK_IMPORTED_MODULE_4__["default"])(messageType === 'string' || messageType === 'object');
  return Object.assign(opts, opts.opts);
}

function decorateMessage(id, message, opts) {
  if (typeof message === 'string') {
    const time = opts.time ? (0,_utils_formatters__WEBPACK_IMPORTED_MODULE_5__.leftPad)((0,_utils_formatters__WEBPACK_IMPORTED_MODULE_5__.formatTime)(opts.total)) : '';
    message = opts.time ? "".concat(id, ": ").concat(time, "  ").concat(message) : "".concat(id, ": ").concat(message);
    message = (0,_utils_color__WEBPACK_IMPORTED_MODULE_6__.addColor)(message, opts.color, opts.background);
  }

  return message;
}

function logImageInNode({
  image,
  message = '',
  scale = 1
}) {
  let asciify = null;

  try {
    asciify = __webpack_require__(/*! asciify-image */ "?4aee");
  } catch (error) {}

  if (asciify) {
    return () => asciify(image, {
      fit: 'box',
      width: "".concat(Math.round(80 * scale), "%")
    }).then(data => console.log(data));
  }

  return noop;
}

function logImageInBrowser({
  image,
  message = '',
  scale = 1
}) {
  if (typeof image === 'string') {
    const img = new Image();

    img.onload = () => {
      const args = (0,_utils_formatters__WEBPACK_IMPORTED_MODULE_5__.formatImage)(img, message, scale);
      console.log(...args);
    };

    img.src = image;
    return noop;
  }

  const element = image.nodeName || '';

  if (element.toLowerCase() === 'img') {
    console.log(...(0,_utils_formatters__WEBPACK_IMPORTED_MODULE_5__.formatImage)(image, message, scale));
    return noop;
  }

  if (element.toLowerCase() === 'canvas') {
    const img = new Image();

    img.onload = () => console.log(...(0,_utils_formatters__WEBPACK_IMPORTED_MODULE_5__.formatImage)(img, message, scale));

    img.src = image.toDataURL();
    return noop;
  }

  return noop;
}
//# sourceMappingURL=log.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/esm/utils/assert.js":
/*!********************************************************!*\
  !*** ./node_modules/probe.gl/dist/esm/utils/assert.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ assert)
/* harmony export */ });
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}
//# sourceMappingURL=assert.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/esm/utils/autobind.js":
/*!**********************************************************!*\
  !*** ./node_modules/probe.gl/dist/esm/utils/autobind.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "autobind": () => (/* binding */ autobind)
/* harmony export */ });
function autobind(obj, predefined = ['constructor']) {
  const proto = Object.getPrototypeOf(obj);
  const propNames = Object.getOwnPropertyNames(proto);

  for (const key of propNames) {
    if (typeof obj[key] === 'function') {
      if (!predefined.find(name => key === name)) {
        obj[key] = obj[key].bind(obj);
      }
    }
  }
}
//# sourceMappingURL=autobind.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/esm/utils/color.js":
/*!*******************************************************!*\
  !*** ./node_modules/probe.gl/dist/esm/utils/color.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "COLOR": () => (/* binding */ COLOR),
/* harmony export */   "addColor": () => (/* binding */ addColor)
/* harmony export */ });
/* harmony import */ var _globals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./globals */ "./node_modules/probe.gl/dist/esm/utils/globals.js");

const COLOR = {
  BLACK: 30,
  RED: 31,
  GREEN: 32,
  YELLOW: 33,
  BLUE: 34,
  MAGENTA: 35,
  CYAN: 36,
  WHITE: 37,
  BRIGHT_BLACK: 90,
  BRIGHT_RED: 91,
  BRIGHT_GREEN: 92,
  BRIGHT_YELLOW: 93,
  BRIGHT_BLUE: 94,
  BRIGHT_MAGENTA: 95,
  BRIGHT_CYAN: 96,
  BRIGHT_WHITE: 97
};

function getColor(color) {
  return typeof color === 'string' ? COLOR[color.toUpperCase()] || COLOR.WHITE : color;
}

function addColor(string, color, background) {
  if (!_globals__WEBPACK_IMPORTED_MODULE_0__.isBrowser && typeof string === 'string') {
    if (color) {
      color = getColor(color);
      string = "\x1B[".concat(color, "m").concat(string, "\x1B[39m");
    }

    if (background) {
      color = getColor(background);
      string = "\x1B[".concat(background + 10, "m").concat(string, "\x1B[49m");
    }
  }

  return string;
}
//# sourceMappingURL=color.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/esm/utils/formatters.js":
/*!************************************************************!*\
  !*** ./node_modules/probe.gl/dist/esm/utils/formatters.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "formatTime": () => (/* binding */ formatTime),
/* harmony export */   "leftPad": () => (/* binding */ leftPad),
/* harmony export */   "rightPad": () => (/* binding */ rightPad),
/* harmony export */   "formatValue": () => (/* binding */ formatValue),
/* harmony export */   "formatImage": () => (/* binding */ formatImage)
/* harmony export */ });
function formatTime(ms) {
  let formatted;

  if (ms < 10) {
    formatted = "".concat(ms.toFixed(2), "ms");
  } else if (ms < 100) {
    formatted = "".concat(ms.toFixed(1), "ms");
  } else if (ms < 1000) {
    formatted = "".concat(ms.toFixed(0), "ms");
  } else {
    formatted = "".concat((ms / 1000).toFixed(2), "s");
  }

  return formatted;
}
function leftPad(string, length = 8) {
  const padLength = Math.max(length - string.length, 0);
  return "".concat(' '.repeat(padLength)).concat(string);
}
function rightPad(string, length = 8) {
  const padLength = Math.max(length - string.length, 0);
  return "".concat(string).concat(' '.repeat(padLength));
}
function formatValue(v, opts = {}) {
  const EPSILON = 1e-16;
  const {
    isInteger = false
  } = opts;

  if (Array.isArray(v) || ArrayBuffer.isView(v)) {
    return formatArrayValue(v, opts);
  }

  if (!Number.isFinite(v)) {
    return String(v);
  }

  if (Math.abs(v) < EPSILON) {
    return isInteger ? '0' : '0.';
  }

  if (isInteger) {
    return v.toFixed(0);
  }

  if (Math.abs(v) > 100 && Math.abs(v) < 10000) {
    return v.toFixed(0);
  }

  const string = v.toPrecision(2);
  const decimal = string.indexOf('.0');
  return decimal === string.length - 2 ? string.slice(0, -1) : string;
}

function formatArrayValue(v, opts) {
  const {
    maxElts = 16,
    size = 1
  } = opts;
  let string = '[';

  for (let i = 0; i < v.length && i < maxElts; ++i) {
    if (i > 0) {
      string += ",".concat(i % size === 0 ? ' ' : '');
    }

    string += formatValue(v[i], opts);
  }

  const terminator = v.length > maxElts ? '...' : ']';
  return "".concat(string).concat(terminator);
}

function formatImage(image, message, scale, maxWidth = 600) {
  const imageUrl = image.src.replace(/\(/g, '%28').replace(/\)/g, '%29');

  if (image.width > maxWidth) {
    scale = Math.min(scale, maxWidth / image.width);
  }

  const width = image.width * scale;
  const height = image.height * scale;
  const style = ['font-size:1px;', "padding:".concat(Math.floor(height / 2), "px ").concat(Math.floor(width / 2), "px;"), "line-height:".concat(height, "px;"), "background:url(".concat(imageUrl, ");"), "background-size:".concat(width, "px ").concat(height, "px;"), 'color:transparent;'].join('');
  return ["".concat(message, " %c+"), style];
}
//# sourceMappingURL=formatters.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/esm/utils/globals.js":
/*!*********************************************************!*\
  !*** ./node_modules/probe.gl/dist/esm/utils/globals.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "self": () => (/* reexport safe */ _env_globals__WEBPACK_IMPORTED_MODULE_0__.self),
/* harmony export */   "window": () => (/* reexport safe */ _env_globals__WEBPACK_IMPORTED_MODULE_0__.window),
/* harmony export */   "global": () => (/* reexport safe */ _env_globals__WEBPACK_IMPORTED_MODULE_0__.global),
/* harmony export */   "document": () => (/* reexport safe */ _env_globals__WEBPACK_IMPORTED_MODULE_0__.document),
/* harmony export */   "process": () => (/* reexport safe */ _env_globals__WEBPACK_IMPORTED_MODULE_0__.process),
/* harmony export */   "console": () => (/* reexport safe */ _env_globals__WEBPACK_IMPORTED_MODULE_0__.console),
/* harmony export */   "VERSION": () => (/* binding */ VERSION),
/* harmony export */   "isBrowser": () => (/* binding */ isBrowser)
/* harmony export */ });
/* harmony import */ var _env_is_browser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../env/is-browser */ "./node_modules/probe.gl/dist/esm/env/is-browser.js");
/* harmony import */ var _env_globals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../env/globals */ "./node_modules/probe.gl/dist/esm/env/globals.js");


const VERSION = typeof __VERSION__ !== 'undefined' ? __VERSION__ : 'untranspiled source';
const isBrowser = (0,_env_is_browser__WEBPACK_IMPORTED_MODULE_1__["default"])();
//# sourceMappingURL=globals.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/esm/utils/hi-res-timestamp.js":
/*!******************************************************************!*\
  !*** ./node_modules/probe.gl/dist/esm/utils/hi-res-timestamp.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ getHiResTimestamp)
/* harmony export */ });
/* harmony import */ var _globals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./globals */ "./node_modules/probe.gl/dist/esm/utils/globals.js");
/* harmony import */ var _globals__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./globals */ "./node_modules/probe.gl/dist/esm/env/globals.js");

function getHiResTimestamp() {
  let timestamp;

  if (_globals__WEBPACK_IMPORTED_MODULE_0__.isBrowser && _globals__WEBPACK_IMPORTED_MODULE_1__.window.performance) {
    timestamp = _globals__WEBPACK_IMPORTED_MODULE_1__.window.performance.now();
  } else if (_globals__WEBPACK_IMPORTED_MODULE_1__.process.hrtime) {
    const timeParts = _globals__WEBPACK_IMPORTED_MODULE_1__.process.hrtime();
    timestamp = timeParts[0] * 1000 + timeParts[1] / 1e6;
  } else {
    timestamp = Date.now();
  }

  return timestamp;
}
//# sourceMappingURL=hi-res-timestamp.js.map

/***/ }),

/***/ "./node_modules/probe.gl/dist/esm/utils/local-storage.js":
/*!***************************************************************!*\
  !*** ./node_modules/probe.gl/dist/esm/utils/local-storage.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ LocalStorage)
/* harmony export */ });
function getStorage(type) {
  try {
    const storage = window[type];
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return storage;
  } catch (e) {
    return null;
  }
}

class LocalStorage {
  constructor(id, defaultSettings, type = 'sessionStorage') {
    this.storage = getStorage(type);
    this.id = id;
    this.config = {};
    Object.assign(this.config, defaultSettings);

    this._loadConfiguration();
  }

  getConfiguration() {
    return this.config;
  }

  setConfiguration(configuration) {
    this.config = {};
    return this.updateConfiguration(configuration);
  }

  updateConfiguration(configuration) {
    Object.assign(this.config, configuration);

    if (this.storage) {
      const serialized = JSON.stringify(this.config);
      this.storage.setItem(this.id, serialized);
    }

    return this;
  }

  _loadConfiguration() {
    let configuration = {};

    if (this.storage) {
      const serializedConfiguration = this.storage.getItem(this.id);
      configuration = serializedConfiguration ? JSON.parse(serializedConfiguration) : {};
    }

    Object.assign(this.config, configuration);
    return this;
  }

}
//# sourceMappingURL=local-storage.js.map

/***/ }),

/***/ "?4aee":
/*!*******************************!*\
  !*** asciify-image (ignored) ***!
  \*******************************/
/***/ (() => {

/* (ignored) */

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!***********************!*\
  !*** ./demo/index.ts ***!
  \***********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _luma_gl_engine__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luma.gl/engine */ "./node_modules/@luma.gl/engine/dist/esm/lib/animation-loop.js");
/* harmony import */ var _luma_gl_engine__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @luma.gl/engine */ "./node_modules/@luma.gl/engine/dist/esm/lib/model.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/texture-2d.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/buffer.js");
/* harmony import */ var _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @luma.gl/webgl */ "./node_modules/@luma.gl/webgl/dist/esm/classes/clear.js");


const loop = new _luma_gl_engine__WEBPACK_IMPORTED_MODULE_0__["default"]({
    //@ts-ignore
    onInitialize({ gl }) {
        const texture = new _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_1__["default"](gl, {
            data: 'fujirgb.png',
        });
        const model = new _luma_gl_engine__WEBPACK_IMPORTED_MODULE_2__["default"](gl, {
            vs: `
                attribute vec2 position;
                varying vec2 uv;
                uniform sampler2D texture;

                vec2 getuv(vec2 xy) {
                    return vec2((xy.x + 1.0) * 0.5,  1.0 - 0.5 * (xy.y + 1.0));
                }

                void main() {
                    uv = getuv(position);
                    gl_Position = vec4(position.xy, 0.0, 1.0);
                }
            `,
            fs: `
                uniform sampler2D texture;
                varying vec2 uv;

                float rgb2height(vec3 rgb) {
                    return -10000.0 + (rgb.r * 6553.6 + rgb.g * 25.6 + rgb.b * 0.1) * 255.0;
                }

                float slope() {
                    float canvas_px_x = 1.0 / 1024.0;
                    float canvas_px_y = 1.0 / 1024.0;
                    
                    //123
                    //456
                    //789
                    //vec4 p1 = texture2D(texture, uv + vec2(-canvas_px_x, -canvas_px_y));
                    vec4 p2 = texture2D(texture, uv + vec2(0, -canvas_px_y));
                    //vec4 p3 = texture2D(texture, uv + vec2(canvas_px_x, -canvas_px_y));
                    vec4 p4 = texture2D(texture, uv + vec2(-canvas_px_x, 0));
                    //vec4 p5 = texture2D(texture, uv + vec2(0, 0));
                    vec4 p6 = texture2D(texture, uv + vec2(canvas_px_x, 0));
                    //vec4 p7 = texture2D(texture, uv + vec2(-canvas_px_x, canvas_px_y));
                    vec4 p8 = texture2D(texture, uv + vec2(0, canvas_px_y));
                    //vec4 p9 = texture2D(texture, uv + vec2(canvas_px_x, canvas_px_y));
                    
                    float h2 = rgb2height(p2.rgb);
                    float h4 = rgb2height(p4.rgb);
                    float h6 = rgb2height(p6.rgb);
                    float h8 = rgb2height(p8.rgb);
                    
                    float distPerPixel = 38.0;
                    return ((abs(h6-h4) + abs(h8-h2)) * 0.5) / distPerPixel;
                }

                float shade() {
                    float canvas_px = 1.0 / 1024.0;
                    
                    //123456789
                    vec4 p1 = texture2D(texture, uv);
                    vec4 p2 = texture2D(texture, uv + vec2(canvas_px * 1.0));
                    vec4 p3 = texture2D(texture, uv + vec2(canvas_px * 2.0));
                    vec4 p4 = texture2D(texture, uv + vec2(canvas_px * 3.0));
                    vec4 p5 = texture2D(texture, uv + vec2(canvas_px * 4.0));
                    vec4 p6 = texture2D(texture, uv + vec2(canvas_px * 5.0));
                    vec4 p7 = texture2D(texture, uv + vec2(canvas_px * 6.0));
                    vec4 p8 = texture2D(texture, uv + vec2(canvas_px * 7.0));
                    vec4 p9 = texture2D(texture, uv + vec2(canvas_px * 8.0));
                    
                    float h1 = rgb2height(p1.rgb);
                    float h2 = rgb2height(p2.rgb);
                    float h3 = rgb2height(p3.rgb);
                    float h4 = rgb2height(p4.rgb);
                    float h5 = rgb2height(p5.rgb);
                    float h6 = rgb2height(p6.rgb);
                    float h7 = rgb2height(p7.rgb);
                    float h8 = rgb2height(p8.rgb);
                    float h9 = rgb2height(p9.rgb);
                    
                    float intensity = 0.0;
                    if (h1 > h2) {
                        intensity += 0.125;
                    };

                    if (h1 > h3) {
                        intensity += 0.125;
                    };

                    if (h1 > h4) {
                        intensity += 0.125;
                    };

                    if (h1 > h5) {
                        intensity += 0.125;
                    };

                    if (h1 > h6) {
                        intensity += 0.125;
                    };

                    if (h1 > h7) {
                        intensity += 0.125;
                    };

                    if (h1 > h8) {
                        intensity += 0.125;
                    };

                    if (h1 > h9) {
                        intensity += 0.125;
                    };
                    
                    return intensity;
                }

                void main() {
                    vec4 texValue = texture2D(texture, uv);
                    float height = rgb2height(texValue.rgb);
                    float slope = slope();
                    float shade = shade();
                    gl_FragColor = vec4(vec3(0.4 * height / 4000.0 + slope * 0.3 + shade * 0.3), 1.0);
                }
            `,
            uniforms: {
                texture,
            },
            attributes: {
                position: new _luma_gl_webgl__WEBPACK_IMPORTED_MODULE_3__["default"](gl, new Float32Array([
                    -1, -1, -1, 1, 1, 1, 1, 1, 1, -1, -1, -1,
                ])),
            },
            vertexCount: 6,
        });
        return { model, texture };
    },
    //@ts-ignore
    onRender({ gl, model }) {
        (0,_luma_gl_webgl__WEBPACK_IMPORTED_MODULE_4__.clear)(gl, { color: [0, 0, 0, 1] });
        model.draw();
    },
});
loop.start({ canvas: 'canvas' });

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esa0RBQWtELGlGQUF1QztBQUN6RjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxxQ0FBcUM7QUFDckM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSxJQUFJLHNEQUFNO0FBQ1Y7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxJQUFJLHNEQUFNO0FBQ1Y7QUFDQTtBQUNBOztBQUVBO0FBQ0EsSUFBSSxzREFBTTtBQUNWO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUEsMkJBQTJCLG9FQUFzQjtBQUNqRDtBQUNBO0FBQ0E7O0FBRUEsK0JBQStCO0FBQy9CLFFBQVEsNkRBQWE7QUFDckI7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsMkJBQTJCO0FBQzNCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFD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QUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EscUJBQXFCLHFDQUFxQztBQUMxRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBLGtCQUFrQixnQkFBZ0I7QUFDbEM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FB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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBLGlCQUFpQiw2REFBUTtBQUN6QjtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7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QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsSUFBSSxJQUFJO0FBQ1I7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsK0JBQStCLE9BQU87QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQzVJQTtBQUNBLGlFQUFlO0FBQ2Y7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7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LE1BQU0sc0RBQVEsYUFBYSxNQUFNO0FBQ2pDOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFROztBQUVSO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxPQUFPOztBQUVQO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQOztBQUVBO0FBQ0E7O0FBRUEsNEJBQTRCO0FBQzVCO0FBQ0EsTUFBTSxzREFBUSxhQUFhLE1BQU07QUFDakM7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsSUFBSSxnRUFBYztBQUNsQjtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTs7QUFFTjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxnRUFBYztBQUNsQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxnQkFBZ0IscUVBQW1CO0FBQ25DO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsY0FBYywwREFBUTtBQUN0QjtBQUNBLFlBQVk7QUFDWjtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0EsVUFBVSxxREFBTTtBQUNoQjtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBLE1BQU07QUFDTix1QkFBdUIsa0VBQW9CO0FBQzNDLDBCQUEwQix3REFBVTs7QUFFcEM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLElBQUkscURBQU07O0FBRVY7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSx3QkFBd0IsK0NBQU07QUFDOUI7QUFDQTs7QUFFQTtBQUNBLElBQUksZ0VBQWM7QUFDbEI7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBLFFBQVE7QUFDUjtBQUNBLFFBQVE7QUFDUixvQkFBb0IscUVBQW1CO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBLFFBQVEsU0FBUywwREFBUTtBQUN6QixvQkFBb0IscUVBQW1CO0FBQ3ZDO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQSwyQkFBMkI7QUFDM0IsSUFBSSx1REFBUywyQkFBMkIsSUFBSSxpRUFBaUU7QUFDN0c7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBTTs7QUFFTjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBTTs7QUFFTjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLHdCQUF3QiwrQ0FBTTtBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTiwwQkFBMEIsNkRBQWU7QUFDekM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLElBQUkscURBQU07QUFDVixJQUFJLHFEQUFNO0FBQ1YsSUFBSSxxREFBTTtBQUNWO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxRQUFRLHFEQUFNO0FBQ2Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsUUFBUSwwREFBUTtBQUNoQjtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxZQUFZLDBEQUFZLGlCQUFpQiwwREFBWTtBQUNyRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM3cEJzRTtBQUNwQztBQUNKO0FBQ2lCO0FBQ2hDLGdDQUFnQyxpREFBUTtBQUN2RDtBQUNBLFdBQVcsMERBQVE7QUFDbkI7O0FBRUEsNEJBQTRCO0FBQzVCLElBQUkscUVBQW1CO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsdUJBQXVCO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVMsMkRBQWE7QUFDdEI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSx5QkFBeUI7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTs7QUFFTjtBQUNBO0FBQ0EsTUFBTSxzREFBUSxVQUFVLFNBQVMsd0JBQXdCLGVBQWU7QUFDeEU7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxrQ0FBa0MsK0NBQU07QUFDeEM7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVOztBQUVWO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN6THVDO0FBQ0M7QUFDRTtBQUNWO0FBQ1M7QUFDekM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0EsSUFBSSxzREFBUSx3Q0FBd0MsY0FBYztBQUNsRTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsa0JBQWtCLFlBQVk7QUFDOUI7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVPO0FBQ1A7O0FBRUE7QUFDQSxpREFBaUQsVUFBVTtBQUMzRDs7QUFFQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7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QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLGtCQUFrQix3QkFBd0I7QUFDMUM7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBOztBQUVBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQSxJQUFJO0FBQ0o7QUFDQSxJQUFJO0FB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O0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBLEdBQUc7QUFDSDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBLFVBQVUsVUFBVTtBQUNwQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQSxHQUFHO0FBQ0g7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0EsR0FBRztBQUNIO0FBQ0EsR0FBRztBQUNIO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQSxHQUFHO0FBQ0g7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsVUFBVSxVQUFVO0FBQ3BCLFVBQVUsVUFBVTtBQUNwQjtBQUNBLFdBQVc7QUFDWDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxVQUFVLFVBQVU7QUFDcEI7QUFDQSxXQUFXO0FBQ1g7OztBQUdBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkI7QUFDM0IsTUFBTTtBQUNOO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLFlBQVks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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQSw4QkFBOEIsc0RBQU07QUFDcEM7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBLFNBQVM7QUFDVCxpQkFBaUI7QUFDakIsS0FBSztBQUNMO0FBQ0EsZUFBZSxXQUFXO0FBQzFCLFFBQVEscURBQUssT0FBTyxxQkFBcUI7QUFDekM7QUFDQSxLQUFLO0FBQ0wsQ0FBQztBQUNELGFBQWEsa0JBQWtCIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vd2VicGFjay10ZW1wbGF0ZS8uL25vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdC5qcyIsIndlYnBhY2s6Ly93ZWJwYWNrLXRlbXBsYXRlLy4vbm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvdHlwZW9mLmpzIiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvZW5naW5lL2Rpc3QvZXNtL2xpYi9hbmltYXRpb24tbG9vcC5qcyIsIndlYnBhY2s6Ly93ZWJwYWNrLXRlbXBsYXRlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL2VuZ2luZS9kaXN0L2VzbS9saWIvbW9kZWwtdXRpbHMuanMiLCJ3ZWJwYWNrOi8vd2VicGFjay10ZW1wbGF0ZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC9lbmdpbmUvZGlzdC9lc20vbGliL21vZGVsLmpzIiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvZW5naW5lL2Rpc3QvZXNtL2xpYi9wcm9ncmFtLW1hbmFnZXIuanMiLCJ3ZWJwYWNrOi8vd2VicGFjay10ZW1wbGF0ZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC9nbHRvb2xzL2Rpc3QvZXNtL2NvbnRleHQvY29udGV4dC5qcyIsIndlYnBhY2s6Ly93ZWJwYWNrLXRlbXBsYXRlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL2dsdG9vbHMvZGlzdC9lc20vaW5kZXguanMiLCJ3ZWJwYWNrOi8vd2VicGFjay10ZW1wbGF0ZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC9nbHRvb2xzL2Rpc3QvZXNtL3BvbHlmaWxsL2dldC1wYXJhbWV0ZXItcG9seWZpbGwuanMiLCJ3ZWJwYWNrOi8vd2VicGFjay10ZW1wbGF0ZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC9nbHRvb2xzL2Rpc3QvZXNtL3BvbHlmaWxsL3BvbHlmaWxsLWNvbnRleHQuanMiLCJ3ZWJwYWNrOi8vd2VicGFjay10ZW1wbGF0ZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC9nbHRvb2xzL2Rpc3QvZXNtL3BvbHlmaWxsL3BvbHlmaWxsLXRhYmxlLmpzIiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvZ2x0b29scy9kaXN0L2VzbS9wb2x5ZmlsbC9wb2x5ZmlsbC12ZXJ0ZXgtYXJyYXktb2JqZWN0LmpzIiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvZ2x0b29scy9kaXN0L2VzbS9zdGF0ZS10cmFja2VyL3RyYWNrLWNvbnRleHQtc3RhdGUuanMiLCJ3ZWJwYWNrOi8vd2VicGFjay10ZW1wbGF0ZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC9nbHRvb2xzL2Rpc3QvZXNtL3N0YXRlLXRyYWNrZXIvdW5pZmllZC1wYXJhbWV0ZXItYXBpLmpzIiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvZ2x0b29scy9kaXN0L2VzbS9zdGF0ZS10cmFja2VyL3dlYmdsLXBhcmFtZXRlci10YWJsZXMuanMiLCJ3ZWJwYWNrOi8vd2VicGFjay10ZW1wbGF0ZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC9nbHRvb2xzL2Rpc3QvZXNtL3V0aWxzL2Fzc2VydC5qcyIsIndlYnBhY2s6Ly93ZWJwYWNrLXRlbXBsYXRlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL2dsdG9vbHMvZGlzdC9lc20vdXRpbHMvZGV2aWNlLXBpeGVscy5qcyIsIndlYnBhY2s6Ly93ZWJwYWNrLXRlbXBsYXRlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL2dsdG9vbHMvZGlzdC9lc20vdXRpbHMvbG9nLmpzIiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvZ2x0b29scy9kaXN0L2VzbS91dGlscy91dGlscy5qcyIsIndlYnBhY2s6Ly93ZWJwYWNrLXRlbXBsYXRlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL2dsdG9vbHMvZGlzdC9lc20vdXRpbHMvd2ViZ2wtY2hlY2tzLmpzIiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvc2hhZGVydG9vbHMvZGlzdC9lc20vbGliL2Fzc2VtYmxlLXNoYWRlcnMuanMiLCJ3ZWJwYWNrOi8vd2VicGFjay10ZW1wbGF0ZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC9zaGFkZXJ0b29scy9kaXN0L2VzbS9saWIvY29uc3RhbnRzLmpzIiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvc2hhZGVydG9vbHMvZGlzdC9lc20vbGliL2ZpbHRlcnMvcHJvcC10eXBlcy5qcyIsIndlYnBhY2s6Ly93ZWJwYWNrLXRlbXBsYXRlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3NoYWRlcnRvb2xzL2Rpc3QvZXNtL2xpYi9pbmplY3Qtc2hhZGVyLmpzIiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvc2hhZGVydG9vbHMvZGlzdC9lc20vbGliL3BsYXRmb3JtLWRlZmluZXMuanMiLCJ3ZWJwYWNrOi8vd2VicGFjay10ZW1wbGF0ZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC9zaGFkZXJ0b29scy9kaXN0L2VzbS9saWIvcmVzb2x2ZS1tb2R1bGVzLmpzIiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvc2hhZGVydG9vbHMvZGlzdC9lc20vbGliL3NoYWRlci1tb2R1bGUuanMiLCJ3ZWJwYWNrOi8vd2VicGFjay10ZW1wbGF0ZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC9zaGFkZXJ0b29scy9kaXN0L2VzbS9saWIvdHJhbnNwaWxlLXNoYWRlci5qcyIsIndlYnBhY2s6Ly93ZWJwYWNrLXRlbXBsYXRlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3NoYWRlcnRvb2xzL2Rpc3QvZXNtL21vZHVsZXMvbW9kdWxlLWluamVjdG9ycy5qcyIsIndlYnBhY2s6Ly93ZWJwYWNrLXRlbXBsYXRlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3NoYWRlcnRvb2xzL2Rpc3QvZXNtL3V0aWxzL2Fzc2VydC5qcyIsIndlYnBhY2s6Ly93ZWJwYWNrLXRlbXBsYXRlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3NoYWRlcnRvb2xzL2Rpc3QvZXNtL3V0aWxzL2lzLW9sZC1pZS5qcyIsIndlYnBhY2s6Ly93ZWJwYWNrLXRlbXBsYXRlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3NoYWRlcnRvb2xzL2Rpc3QvZXNtL3V0aWxzL3dlYmdsLWluZm8uanMiLCJ3ZWJwYWNrOi8vd2VicGFjay10ZW1wbGF0ZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC93ZWJnbC9kaXN0L2VzbS9jbGFzc2VzL2FjY2Vzc29yLmpzIiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvd2ViZ2wvZGlzdC9lc20vY2xhc3Nlcy9idWZmZXIuanMiLCJ3ZWJwYWNrOi8vd2VicGFjay10ZW1wbGF0ZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC93ZWJnbC9kaXN0L2VzbS9jbGFzc2VzL2NsZWFyLmpzIiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvd2ViZ2wvZGlzdC9lc20vY2xhc3Nlcy9jb3B5LWFuZC1ibGl0LmpzIiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvd2ViZ2wvZGlzdC9lc20vY2xhc3Nlcy9mcmFtZWJ1ZmZlci5qcyIsIndlYnBhY2s6Ly93ZWJwYWNrLXRlbXBsYXRlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3dlYmdsL2Rpc3QvZXNtL2NsYXNzZXMvcHJvZ3JhbS1jb25maWd1cmF0aW9uLmpzIiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvd2ViZ2wvZGlzdC9lc20vY2xhc3Nlcy9wcm9ncmFtLmpzIiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvd2ViZ2wvZGlzdC9lc20vY2xhc3Nlcy9xdWVyeS5qcyIsIndlYnBhY2s6Ly93ZWJwYWNrLXRlbXBsYXRlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3dlYmdsL2Rpc3QvZXNtL2NsYXNzZXMvcmVuZGVyYnVmZmVyLWZvcm1hdHMuanMiLCJ3ZWJwYWNrOi8vd2VicGFjay10ZW1wbGF0ZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC93ZWJnbC9kaXN0L2VzbS9jbGFzc2VzL3JlbmRlcmJ1ZmZlci5qcyIsIndlYnBhY2s6Ly93ZWJwYWNrLXRlbXBsYXRlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3dlYmdsL2Rpc3QvZXNtL2NsYXNzZXMvcmVzb3VyY2UuanMiLCJ3ZWJwYWNrOi8vd2VicGFjay10ZW1wbGF0ZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC93ZWJnbC9kaXN0L2VzbS9jbGFzc2VzL3NoYWRlci5qcyIsIndlYnBhY2s6Ly93ZWJwYWNrLXRlbXBsYXRlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3dlYmdsL2Rpc3QvZXNtL2NsYXNzZXMvdGV4dHVyZS0yZC5qcyIsIndlYnBhY2s6Ly93ZWJwYWNrLXRlbXBsYXRlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3dlYmdsL2Rpc3QvZXNtL2NsYXNzZXMvdGV4dHVyZS0zZC5qcyIsIndlYnBhY2s6Ly93ZWJwYWNrLXRlbXBsYXRlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3dlYmdsL2Rpc3QvZXNtL2NsYXNzZXMvdGV4dHVyZS1jdWJlLmpzIiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvd2ViZ2wvZGlzdC9lc20vY2xhc3Nlcy90ZXh0dXJlLWZvcm1hdHMuanMiLCJ3ZWJwYWNrOi8vd2VicGFjay10ZW1wbGF0ZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC93ZWJnbC9kaXN0L2VzbS9jbGFzc2VzL3RleHR1cmUuanMiLCJ3ZWJwYWNrOi8vd2VicGFjay10ZW1wbGF0ZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC93ZWJnbC9kaXN0L2VzbS9jbGFzc2VzL3RyYW5zZm9ybS1mZWVkYmFjay5qcyIsIndlYnBhY2s6Ly93ZWJwYWNrLXRlbXBsYXRlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3dlYmdsL2Rpc3QvZXNtL2NsYXNzZXMvdW5pZm9ybXMuanMiLCJ3ZWJwYWNrOi8vd2VicGFjay10ZW1wbGF0ZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC93ZWJnbC9kaXN0L2VzbS9jbGFzc2VzL3ZlcnRleC1hcnJheS1vYmplY3QuanMiLCJ3ZWJwYWNrOi8vd2VicGFjay10ZW1wbGF0ZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC93ZWJnbC9kaXN0L2VzbS9jbGFzc2VzL3ZlcnRleC1hcnJheS5qcyIsIndlYnBhY2s6Ly93ZWJwYWNrLXRlbXBsYXRlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3dlYmdsL2Rpc3QvZXNtL2RlYnVnL2RlYnVnLXByb2dyYW0tY29uZmlndXJhdGlvbi5qcyIsIndlYnBhY2s6Ly93ZWJwYWNrLXRlbXBsYXRlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3dlYmdsL2Rpc3QvZXNtL2RlYnVnL2RlYnVnLXVuaWZvcm1zLmpzIiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvd2ViZ2wvZGlzdC9lc20vZGVidWcvZGVidWctdmVydGV4LWFycmF5LmpzIiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvd2ViZ2wvZGlzdC9lc20vZmVhdHVyZXMvZmVhdHVyZXMuanMiLCJ3ZWJwYWNrOi8vd2VicGFjay10ZW1wbGF0ZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC93ZWJnbC9kaXN0L2VzbS9mZWF0dXJlcy93ZWJnbC1mZWF0dXJlcy10YWJsZS5qcyIsIndlYnBhY2s6Ly93ZWJwYWNrLXRlbXBsYXRlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3dlYmdsL2Rpc3QvZXNtL2dsc2wtdXRpbHMvZm9ybWF0LWdsc2wtZXJyb3IuanMiLCJ3ZWJwYWNrOi8vd2VicGFjay10ZW1wbGF0ZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC93ZWJnbC9kaXN0L2VzbS9nbHNsLXV0aWxzL2dldC1zaGFkZXItbmFtZS5qcyIsIndlYnBhY2s6Ly93ZWJwYWNrLXRlbXBsYXRlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3dlYmdsL2Rpc3QvZXNtL2dsc2wtdXRpbHMvZ2V0LXNoYWRlci10eXBlLW5hbWUuanMiLCJ3ZWJwYWNrOi8vd2VicGFjay10ZW1wbGF0ZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC93ZWJnbC9kaXN0L2VzbS9pbml0LmpzIiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvd2ViZ2wvZGlzdC9lc20vdXRpbHMvYXJyYXktdXRpbHMtZmxhdC5qcyIsIndlYnBhY2s6Ly93ZWJwYWNrLXRlbXBsYXRlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3dlYmdsL2Rpc3QvZXNtL3V0aWxzL2Fzc2VydC5qcyIsIndlYnBhY2s6Ly93ZWJwYWNrLXRlbXBsYXRlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3dlYmdsL2Rpc3QvZXNtL3V0aWxzL2NoZWNrLXByb3BzLmpzIiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvd2ViZ2wvZGlzdC9lc20vdXRpbHMvZm9ybWF0LXZhbHVlLmpzIiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvd2ViZ2wvZGlzdC9lc20vdXRpbHMvbG9hZC1maWxlLmpzIiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvd2ViZ2wvZGlzdC9lc20vdXRpbHMvc3R1Yi1tZXRob2RzLmpzIiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvd2ViZ2wvZGlzdC9lc20vdXRpbHMvdXRpbHMuanMiLCJ3ZWJwYWNrOi8vd2VicGFjay10ZW1wbGF0ZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC93ZWJnbC9kaXN0L2VzbS93ZWJnbC11dGlscy9hdHRyaWJ1dGUtdXRpbHMuanMiLCJ3ZWJwYWNrOi8vd2VicGFjay10ZW1wbGF0ZS8uL25vZGVfbW9kdWxlcy9AbHVtYS5nbC93ZWJnbC9kaXN0L2VzbS93ZWJnbC11dGlscy9jb25zdGFudHMtdG8ta2V5cy5qcyIsIndlYnBhY2s6Ly93ZWJwYWNrLXRlbXBsYXRlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3dlYmdsL2Rpc3QvZXNtL3dlYmdsLXV0aWxzL2Zvcm1hdC11dGlscy5qcyIsIndlYnBhY2s6Ly93ZWJwYWNrLXRlbXBsYXRlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3dlYmdsL2Rpc3QvZXNtL3dlYmdsLXV0aWxzL3JlcXVlc3QtYW5pbWF0aW9uLWZyYW1lLmpzIiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvLi9ub2RlX21vZHVsZXMvQGx1bWEuZ2wvd2ViZ2wvZGlzdC9lc20vd2ViZ2wtdXRpbHMvdGV4dHVyZS11dGlscy5qcyIsIndlYnBhY2s6Ly93ZWJwYWNrLXRlbXBsYXRlLy4vbm9kZV9tb2R1bGVzL0BsdW1hLmdsL3dlYmdsL2Rpc3QvZXNtL3dlYmdsLXV0aWxzL3R5cGVkLWFycmF5LXV0aWxzLmpzIiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvLi9ub2RlX21vZHVsZXMvQHByb2JlLmdsL3N0YXRzL2Rpc3QvZXNtL2luZGV4LmpzIiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvLi9ub2RlX21vZHVsZXMvQHByb2JlLmdsL3N0YXRzL2Rpc3QvZXNtL2xpYi9zdGF0LmpzIiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvLi9ub2RlX21vZHVsZXMvQHByb2JlLmdsL3N0YXRzL2Rpc3QvZXNtL2xpYi9zdGF0cy5qcyIsIndlYnBhY2s6Ly93ZWJwYWNrLXRlbXBsYXRlLy4vbm9kZV9tb2R1bGVzL0Bwcm9iZS5nbC9zdGF0cy9kaXN0L2VzbS91dGlscy9oaS1yZXMtdGltZXN0YW1wLmpzIiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvLi9ub2RlX21vZHVsZXMvZXM2LXByb21pc2UvZGlzdC9lczYtcHJvbWlzZS5qcyIsIndlYnBhY2s6Ly93ZWJwYWNrLXRlbXBsYXRlLy4vbm9kZV9tb2R1bGVzL3Byb2JlLmdsL2Rpc3QvZXM1L2Vudi9nZXQtYnJvd3Nlci5qcyIsIndlYnBhY2s6Ly93ZWJwYWNrLXRlbXBsYXRlLy4vbm9kZV9tb2R1bGVzL3Byb2JlLmdsL2Rpc3QvZXM1L2Vudi9nbG9iYWxzLmpzIiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvLi9ub2RlX21vZHVsZXMvcHJvYmUuZ2wvZGlzdC9lczUvZW52L2luZGV4LmpzIiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvLi9ub2RlX21vZHVsZXMvcHJvYmUuZ2wvZGlzdC9lczUvZW52L2lzLWJyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vd2VicGFjay10ZW1wbGF0ZS8uL25vZGVfbW9kdWxlcy9wcm9iZS5nbC9kaXN0L2VzNS9lbnYvaXMtZWxlY3Ryb24uanMiLCJ3ZWJwYWNrOi8vd2VicGFjay10ZW1wbGF0ZS8uL25vZGVfbW9kdWxlcy9wcm9iZS5nbC9kaXN0L2VzbS9lbnYvZ2V0LWJyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vd2VicGFjay10ZW1wbGF0ZS8uL25vZGVfbW9kdWxlcy9wcm9iZS5nbC9kaXN0L2VzbS9lbnYvZ2xvYmFscy5qcyIsIndlYnBhY2s6Ly93ZWJwYWNrLXRlbXBsYXRlLy4vbm9kZV9tb2R1bGVzL3Byb2JlLmdsL2Rpc3QvZXNtL2Vudi9pcy1icm93c2VyLmpzIiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvLi9ub2RlX21vZHVsZXMvcHJvYmUuZ2wvZGlzdC9lc20vZW52L2lzLWVsZWN0cm9uLmpzIiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvLi9ub2RlX21vZHVsZXMvcHJvYmUuZ2wvZGlzdC9lc20vbGliL2xvZy5qcyIsIndlYnBhY2s6Ly93ZWJwYWNrLXRlbXBsYXRlLy4vbm9kZV9tb2R1bGVzL3Byb2JlLmdsL2Rpc3QvZXNtL3V0aWxzL2Fzc2VydC5qcyIsIndlYnBhY2s6Ly93ZWJwYWNrLXRlbXBsYXRlLy4vbm9kZV9tb2R1bGVzL3Byb2JlLmdsL2Rpc3QvZXNtL3V0aWxzL2F1dG9iaW5kLmpzIiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvLi9ub2RlX21vZHVsZXMvcHJvYmUuZ2wvZGlzdC9lc20vdXRpbHMvY29sb3IuanMiLCJ3ZWJwYWNrOi8vd2VicGFjay10ZW1wbGF0ZS8uL25vZGVfbW9kdWxlcy9wcm9iZS5nbC9kaXN0L2VzbS91dGlscy9mb3JtYXR0ZXJzLmpzIiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvLi9ub2RlX21vZHVsZXMvcHJvYmUuZ2wvZGlzdC9lc20vdXRpbHMvZ2xvYmFscy5qcyIsIndlYnBhY2s6Ly93ZWJwYWNrLXRlbXBsYXRlLy4vbm9kZV9tb2R1bGVzL3Byb2JlLmdsL2Rpc3QvZXNtL3V0aWxzL2hpLXJlcy10aW1lc3RhbXAuanMiLCJ3ZWJwYWNrOi8vd2VicGFjay10ZW1wbGF0ZS8uL25vZGVfbW9kdWxlcy9wcm9iZS5nbC9kaXN0L2VzbS91dGlscy9sb2NhbC1zdG9yYWdlLmpzIiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvaWdub3JlZHwvVXNlcnMva2lndWNoaS9Eb2N1bWVudHMvZ2l0L3dlYmdsLWdpcy1leGFtcGxlL25vZGVfbW9kdWxlcy9wcm9iZS5nbC9kaXN0L2VzbS9saWJ8YXNjaWlmeS1pbWFnZSIsIndlYnBhY2s6Ly93ZWJwYWNrLXRlbXBsYXRlL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvd2VicGFjay9ydW50aW1lL2dsb2JhbCIsIndlYnBhY2s6Ly93ZWJwYWNrLXRlbXBsYXRlL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vd2VicGFjay10ZW1wbGF0ZS93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3dlYnBhY2stdGVtcGxhdGUvLi9kZW1vL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7XG4gIHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7XG4gICAgXCJkZWZhdWx0XCI6IG9ialxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQ7XG5tb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwiZnVuY3Rpb24gX3R5cGVvZihvYmopIHtcbiAgXCJAYmFiZWwvaGVscGVycyAtIHR5cGVvZlwiO1xuXG4gIGlmICh0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIikge1xuICAgIG1vZHVsZS5leHBvcnRzID0gX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7XG4gICAgICByZXR1cm4gdHlwZW9mIG9iajtcbiAgICB9O1xuXG4gICAgbW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuICB9IGVsc2Uge1xuICAgIG1vZHVsZS5leHBvcnRzID0gX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7XG4gICAgICByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajtcbiAgICB9O1xuXG4gICAgbW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIF90eXBlb2Yob2JqKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfdHlwZW9mO1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsImltcG9ydCB7IGlzV2ViR0wsIGNyZWF0ZUdMQ29udGV4dCwgaW5zdHJ1bWVudEdMQ29udGV4dCwgcmVzaXplR0xDb250ZXh0LCByZXNldFBhcmFtZXRlcnMgfSBmcm9tICdAbHVtYS5nbC9nbHRvb2xzJztcbmltcG9ydCB7IHJlcXVlc3RBbmltYXRpb25GcmFtZSwgY2FuY2VsQW5pbWF0aW9uRnJhbWUsIFF1ZXJ5LCBsdW1hU3RhdHMsIEZyYW1lYnVmZmVyLCBsb2csIGFzc2VydCB9IGZyb20gJ0BsdW1hLmdsL3dlYmdsJztcbmltcG9ydCB7IGlzQnJvd3NlciB9IGZyb20gJ3Byb2JlLmdsL2Vudic7XG5jb25zdCBpc1BhZ2UgPSBpc0Jyb3dzZXIoKSAmJiB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnO1xubGV0IHN0YXRJZENvdW50ZXIgPSAwO1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQW5pbWF0aW9uTG9vcCB7XG4gIGNvbnN0cnVjdG9yKHByb3BzID0ge30pIHtcbiAgICBjb25zdCB7XG4gICAgICBvbkNyZWF0ZUNvbnRleHQgPSBvcHRzID0+IGNyZWF0ZUdMQ29udGV4dChvcHRzKSxcbiAgICAgIG9uQWRkSFRNTCA9IG51bGwsXG4gICAgICBvbkluaXRpYWxpemUgPSAoKSA9PiB7fSxcbiAgICAgIG9uUmVuZGVyID0gKCkgPT4ge30sXG4gICAgICBvbkZpbmFsaXplID0gKCkgPT4ge30sXG4gICAgICBvbkVycm9yLFxuICAgICAgZ2wgPSBudWxsLFxuICAgICAgZ2xPcHRpb25zID0ge30sXG4gICAgICBkZWJ1ZyA9IGZhbHNlLFxuICAgICAgY3JlYXRlRnJhbWVidWZmZXIgPSBmYWxzZSxcbiAgICAgIGF1dG9SZXNpemVWaWV3cG9ydCA9IHRydWUsXG4gICAgICBhdXRvUmVzaXplRHJhd2luZ0J1ZmZlciA9IHRydWUsXG4gICAgICBzdGF0cyA9IGx1bWFTdGF0cy5nZXQoYGFuaW1hdGlvbi1sb29wLSR7c3RhdElkQ291bnRlcisrfWApXG4gICAgfSA9IHByb3BzO1xuICAgIGxldCB7XG4gICAgICB1c2VEZXZpY2VQaXhlbHMgPSB0cnVlXG4gICAgfSA9IHByb3BzO1xuXG4gICAgaWYgKCd1c2VEZXZpY2VQaXhlbFJhdGlvJyBpbiBwcm9wcykge1xuICAgICAgbG9nLmRlcHJlY2F0ZWQoJ3VzZURldmljZVBpeGVsUmF0aW8nLCAndXNlRGV2aWNlUGl4ZWxzJykoKTtcbiAgICAgIHVzZURldmljZVBpeGVscyA9IHByb3BzLnVzZURldmljZVBpeGVsUmF0aW87XG4gICAgfVxuXG4gICAgdGhpcy5wcm9wcyA9IHtcbiAgICAgIG9uQ3JlYXRlQ29udGV4dCxcbiAgICAgIG9uQWRkSFRNTCxcbiAgICAgIG9uSW5pdGlhbGl6ZSxcbiAgICAgIG9uUmVuZGVyLFxuICAgICAgb25GaW5hbGl6ZSxcbiAgICAgIG9uRXJyb3IsXG4gICAgICBnbCxcbiAgICAgIGdsT3B0aW9ucyxcbiAgICAgIGRlYnVnLFxuICAgICAgY3JlYXRlRnJhbWVidWZmZXJcbiAgICB9O1xuICAgIHRoaXMuZ2wgPSBnbDtcbiAgICB0aGlzLm5lZWRzUmVkcmF3ID0gbnVsbDtcbiAgICB0aGlzLnRpbWVsaW5lID0gbnVsbDtcbiAgICB0aGlzLnN0YXRzID0gc3RhdHM7XG4gICAgdGhpcy5jcHVUaW1lID0gdGhpcy5zdGF0cy5nZXQoJ0NQVSBUaW1lJyk7XG4gICAgdGhpcy5ncHVUaW1lID0gdGhpcy5zdGF0cy5nZXQoJ0dQVSBUaW1lJyk7XG4gICAgdGhpcy5mcmFtZVJhdGUgPSB0aGlzLnN0YXRzLmdldCgnRnJhbWUgUmF0ZScpO1xuICAgIHRoaXMuX2luaXRpYWxpemVkID0gZmFsc2U7XG4gICAgdGhpcy5fcnVubmluZyA9IGZhbHNlO1xuICAgIHRoaXMuX2FuaW1hdGlvbkZyYW1lSWQgPSBudWxsO1xuICAgIHRoaXMuX25leHRGcmFtZVByb21pc2UgPSBudWxsO1xuICAgIHRoaXMuX3Jlc29sdmVOZXh0RnJhbWUgPSBudWxsO1xuICAgIHRoaXMuX2NwdVN0YXJ0VGltZSA9IDA7XG4gICAgdGhpcy5zZXRQcm9wcyh7XG4gICAgICBhdXRvUmVzaXplVmlld3BvcnQsXG4gICAgICBhdXRvUmVzaXplRHJhd2luZ0J1ZmZlcixcbiAgICAgIHVzZURldmljZVBpeGVsc1xuICAgIH0pO1xuICAgIHRoaXMuc3RhcnQgPSB0aGlzLnN0YXJ0LmJpbmQodGhpcyk7XG4gICAgdGhpcy5zdG9wID0gdGhpcy5zdG9wLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fcGFnZUxvYWRQcm9taXNlID0gbnVsbDtcbiAgICB0aGlzLl9vbk1vdXNlbW92ZSA9IHRoaXMuX29uTW91c2Vtb3ZlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fb25Nb3VzZWxlYXZlID0gdGhpcy5fb25Nb3VzZWxlYXZlLmJpbmQodGhpcyk7XG4gIH1cblxuICBkZWxldGUoKSB7XG4gICAgdGhpcy5zdG9wKCk7XG5cbiAgICB0aGlzLl9zZXREaXNwbGF5KG51bGwpO1xuICB9XG5cbiAgc2V0TmVlZHNSZWRyYXcocmVhc29uKSB7XG4gICAgYXNzZXJ0KHR5cGVvZiByZWFzb24gPT09ICdzdHJpbmcnKTtcbiAgICB0aGlzLm5lZWRzUmVkcmF3ID0gdGhpcy5uZWVkc1JlZHJhdyB8fCByZWFzb247XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzZXRQcm9wcyhwcm9wcykge1xuICAgIGlmICgnYXV0b1Jlc2l6ZVZpZXdwb3J0JyBpbiBwcm9wcykge1xuICAgICAgdGhpcy5hdXRvUmVzaXplVmlld3BvcnQgPSBwcm9wcy5hdXRvUmVzaXplVmlld3BvcnQ7XG4gICAgfVxuXG4gICAgaWYgKCdhdXRvUmVzaXplRHJhd2luZ0J1ZmZlcicgaW4gcHJvcHMpIHtcbiAgICAgIHRoaXMuYXV0b1Jlc2l6ZURyYXdpbmdCdWZmZXIgPSBwcm9wcy5hdXRvUmVzaXplRHJhd2luZ0J1ZmZlcjtcbiAgICB9XG5cbiAgICBpZiAoJ3VzZURldmljZVBpeGVscycgaW4gcHJvcHMpIHtcbiAgICAgIHRoaXMudXNlRGV2aWNlUGl4ZWxzID0gcHJvcHMudXNlRGV2aWNlUGl4ZWxzO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc3RhcnQob3B0cyA9IHt9KSB7XG4gICAgaWYgKHRoaXMuX3J1bm5pbmcpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRoaXMuX3J1bm5pbmcgPSB0cnVlO1xuXG4gICAgY29uc3Qgc3RhcnRQcm9taXNlID0gdGhpcy5fZ2V0UGFnZUxvYWRQcm9taXNlKCkudGhlbigoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuX3J1bm5pbmcgfHwgdGhpcy5faW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2NyZWF0ZVdlYkdMQ29udGV4dChvcHRzKTtcblxuICAgICAgdGhpcy5fY3JlYXRlRnJhbWVidWZmZXIoKTtcblxuICAgICAgdGhpcy5fc3RhcnRFdmVudEhhbmRsaW5nKCk7XG5cbiAgICAgIHRoaXMuX2luaXRpYWxpemVDYWxsYmFja0RhdGEoKTtcblxuICAgICAgdGhpcy5fdXBkYXRlQ2FsbGJhY2tEYXRhKCk7XG5cbiAgICAgIHRoaXMuX3Jlc2l6ZUNhbnZhc0RyYXdpbmdCdWZmZXIoKTtcblxuICAgICAgdGhpcy5fcmVzaXplVmlld3BvcnQoKTtcblxuICAgICAgdGhpcy5fZ3B1VGltZVF1ZXJ5ID0gUXVlcnkuaXNTdXBwb3J0ZWQodGhpcy5nbCwgWyd0aW1lcnMnXSkgPyBuZXcgUXVlcnkodGhpcy5nbCkgOiBudWxsO1xuICAgICAgdGhpcy5faW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgcmV0dXJuIHRoaXMub25Jbml0aWFsaXplKHRoaXMuYW5pbWF0aW9uUHJvcHMpO1xuICAgIH0pLnRoZW4oYXBwQ29udGV4dCA9PiB7XG4gICAgICBpZiAodGhpcy5fcnVubmluZykge1xuICAgICAgICB0aGlzLl9hZGRDYWxsYmFja0RhdGEoYXBwQ29udGV4dCB8fCB7fSk7XG5cbiAgICAgICAgaWYgKGFwcENvbnRleHQgIT09IGZhbHNlKSB7XG4gICAgICAgICAgdGhpcy5fc3RhcnRMb29wKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmICh0aGlzLnByb3BzLm9uRXJyb3IpIHtcbiAgICAgIHN0YXJ0UHJvbWlzZS5jYXRjaCh0aGlzLnByb3BzLm9uRXJyb3IpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcmVkcmF3KCkge1xuICAgIGlmICh0aGlzLmlzQ29udGV4dExvc3QoKSkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdGhpcy5fYmVnaW5UaW1lcnMoKTtcblxuICAgIHRoaXMuX3NldHVwRnJhbWUoKTtcblxuICAgIHRoaXMuX3VwZGF0ZUNhbGxiYWNrRGF0YSgpO1xuXG4gICAgdGhpcy5fcmVuZGVyRnJhbWUodGhpcy5hbmltYXRpb25Qcm9wcyk7XG5cbiAgICB0aGlzLl9jbGVhck5lZWRzUmVkcmF3KCk7XG5cbiAgICBpZiAodGhpcy5vZmZTY3JlZW4gJiYgdGhpcy5nbC5jb21taXQpIHtcbiAgICAgIHRoaXMuZ2wuY29tbWl0KCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3Jlc29sdmVOZXh0RnJhbWUpIHtcbiAgICAgIHRoaXMuX3Jlc29sdmVOZXh0RnJhbWUodGhpcyk7XG5cbiAgICAgIHRoaXMuX25leHRGcmFtZVByb21pc2UgPSBudWxsO1xuICAgICAgdGhpcy5fcmVzb2x2ZU5leHRGcmFtZSA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5fZW5kVGltZXJzKCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHN0b3AoKSB7XG4gICAgaWYgKHRoaXMuX3J1bm5pbmcpIHtcbiAgICAgIHRoaXMuX2ZpbmFsaXplQ2FsbGJhY2tEYXRhKCk7XG5cbiAgICAgIHRoaXMuX2NhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX2FuaW1hdGlvbkZyYW1lSWQpO1xuXG4gICAgICB0aGlzLl9uZXh0RnJhbWVQcm9taXNlID0gbnVsbDtcbiAgICAgIHRoaXMuX3Jlc29sdmVOZXh0RnJhbWUgPSBudWxsO1xuICAgICAgdGhpcy5fYW5pbWF0aW9uRnJhbWVJZCA9IG51bGw7XG4gICAgICB0aGlzLl9ydW5uaW5nID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBhdHRhY2hUaW1lbGluZSh0aW1lbGluZSkge1xuICAgIHRoaXMudGltZWxpbmUgPSB0aW1lbGluZTtcbiAgICByZXR1cm4gdGhpcy50aW1lbGluZTtcbiAgfVxuXG4gIGRldGFjaFRpbWVsaW5lKCkge1xuICAgIHRoaXMudGltZWxpbmUgPSBudWxsO1xuICB9XG5cbiAgd2FpdEZvclJlbmRlcigpIHtcbiAgICB0aGlzLnNldE5lZWRzUmVkcmF3KCd3YWl0Rm9yUmVuZGVyJyk7XG5cbiAgICBpZiAoIXRoaXMuX25leHRGcmFtZVByb21pc2UpIHtcbiAgICAgIHRoaXMuX25leHRGcmFtZVByb21pc2UgPSBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgdGhpcy5fcmVzb2x2ZU5leHRGcmFtZSA9IHJlc29sdmU7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fbmV4dEZyYW1lUHJvbWlzZTtcbiAgfVxuXG4gIGFzeW5jIHRvRGF0YVVSTCgpIHtcbiAgICB0aGlzLnNldE5lZWRzUmVkcmF3KCd0b0RhdGFVUkwnKTtcbiAgICBhd2FpdCB0aGlzLndhaXRGb3JSZW5kZXIoKTtcbiAgICByZXR1cm4gdGhpcy5nbC5jYW52YXMudG9EYXRhVVJMKCk7XG4gIH1cblxuICBpc0NvbnRleHRMb3N0KCkge1xuICAgIHJldHVybiB0aGlzLmdsLmlzQ29udGV4dExvc3QoKTtcbiAgfVxuXG4gIG9uQ3JlYXRlQ29udGV4dCguLi5hcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMub25DcmVhdGVDb250ZXh0KC4uLmFyZ3MpO1xuICB9XG5cbiAgb25Jbml0aWFsaXplKC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5vbkluaXRpYWxpemUoLi4uYXJncyk7XG4gIH1cblxuICBvblJlbmRlciguLi5hcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMub25SZW5kZXIoLi4uYXJncyk7XG4gIH1cblxuICBvbkZpbmFsaXplKC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5vbkZpbmFsaXplKC4uLmFyZ3MpO1xuICB9XG5cbiAgZ2V0SFRNTENvbnRyb2xWYWx1ZShpZCwgZGVmYXVsdFZhbHVlID0gMSkge1xuICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG4gICAgcmV0dXJuIGVsZW1lbnQgPyBOdW1iZXIoZWxlbWVudC52YWx1ZSkgOiBkZWZhdWx0VmFsdWU7XG4gIH1cblxuICBzZXRWaWV3UGFyYW1ldGVycygpIHtcbiAgICBsb2cucmVtb3ZlZCgnQW5pbWF0aW9uTG9vcC5zZXRWaWV3UGFyYW1ldGVycycsICdBbmltYXRpb25Mb29wLnNldFByb3BzJykoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIF9zdGFydExvb3AoKSB7XG4gICAgY29uc3QgcmVuZGVyRnJhbWUgPSAoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuX3J1bm5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnJlZHJhdygpO1xuICAgICAgdGhpcy5fYW5pbWF0aW9uRnJhbWVJZCA9IHRoaXMuX3JlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXJGcmFtZSk7XG4gICAgfTtcblxuICAgIHRoaXMuX2NhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX2FuaW1hdGlvbkZyYW1lSWQpO1xuXG4gICAgdGhpcy5fYW5pbWF0aW9uRnJhbWVJZCA9IHRoaXMuX3JlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXJGcmFtZSk7XG4gIH1cblxuICBfZ2V0UGFnZUxvYWRQcm9taXNlKCkge1xuICAgIGlmICghdGhpcy5fcGFnZUxvYWRQcm9taXNlKSB7XG4gICAgICB0aGlzLl9wYWdlTG9hZFByb21pc2UgPSBpc1BhZ2UgPyBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGlmIChpc1BhZ2UgJiYgZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJykge1xuICAgICAgICAgIHJlc29sdmUoZG9jdW1lbnQpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4ge1xuICAgICAgICAgIHJlc29sdmUoZG9jdW1lbnQpO1xuICAgICAgICB9KTtcbiAgICAgIH0pIDogUHJvbWlzZS5yZXNvbHZlKHt9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fcGFnZUxvYWRQcm9taXNlO1xuICB9XG5cbiAgX3NldERpc3BsYXkoZGlzcGxheSkge1xuICAgIGlmICh0aGlzLmRpc3BsYXkpIHtcbiAgICAgIHRoaXMuZGlzcGxheS5kZWxldGUoKTtcbiAgICAgIHRoaXMuZGlzcGxheS5hbmltYXRpb25Mb29wID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoZGlzcGxheSkge1xuICAgICAgZGlzcGxheS5hbmltYXRpb25Mb29wID0gdGhpcztcbiAgICB9XG5cbiAgICB0aGlzLmRpc3BsYXkgPSBkaXNwbGF5O1xuICB9XG5cbiAgX2NhbmNlbEFuaW1hdGlvbkZyYW1lKGFuaW1hdGlvbkZyYW1lSWQpIHtcbiAgICBpZiAodGhpcy5kaXNwbGF5ICYmIHRoaXMuZGlzcGxheS5jYW5jZWxBbmltYXRpb25GcmFtZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZGlzcGxheS5jYW5jZWxBbmltYXRpb25GcmFtZShhbmltYXRpb25GcmFtZUlkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY2FuY2VsQW5pbWF0aW9uRnJhbWUoYW5pbWF0aW9uRnJhbWVJZCk7XG4gIH1cblxuICBfcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlckZyYW1lQ2FsbGJhY2spIHtcbiAgICBpZiAodGhpcy5fcnVubmluZykge1xuICAgICAgaWYgKHRoaXMuZGlzcGxheSAmJiB0aGlzLmRpc3BsYXkucmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRpc3BsYXkucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlckZyYW1lQ2FsbGJhY2spO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlckZyYW1lQ2FsbGJhY2spO1xuICAgIH1cblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBfcmVuZGVyRnJhbWUoLi4uYXJncykge1xuICAgIGlmICh0aGlzLmRpc3BsYXkpIHtcbiAgICAgIHRoaXMuZGlzcGxheS5fcmVuZGVyRnJhbWUoLi4uYXJncyk7XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLm9uUmVuZGVyKC4uLmFyZ3MpO1xuICB9XG5cbiAgX2NsZWFyTmVlZHNSZWRyYXcoKSB7XG4gICAgdGhpcy5uZWVkc1JlZHJhdyA9IG51bGw7XG4gIH1cblxuICBfc2V0dXBGcmFtZSgpIHtcbiAgICB0aGlzLl9yZXNpemVDYW52YXNEcmF3aW5nQnVmZmVyKCk7XG5cbiAgICB0aGlzLl9yZXNpemVWaWV3cG9ydCgpO1xuXG4gICAgdGhpcy5fcmVzaXplRnJhbWVidWZmZXIoKTtcbiAgfVxuXG4gIF9pbml0aWFsaXplQ2FsbGJhY2tEYXRhKCkge1xuICAgIHRoaXMuYW5pbWF0aW9uUHJvcHMgPSB7XG4gICAgICBnbDogdGhpcy5nbCxcbiAgICAgIHN0b3A6IHRoaXMuc3RvcCxcbiAgICAgIGNhbnZhczogdGhpcy5nbC5jYW52YXMsXG4gICAgICBmcmFtZWJ1ZmZlcjogdGhpcy5mcmFtZWJ1ZmZlcixcbiAgICAgIHVzZURldmljZVBpeGVsczogdGhpcy51c2VEZXZpY2VQaXhlbHMsXG4gICAgICBuZWVkc1JlZHJhdzogbnVsbCxcbiAgICAgIHN0YXJ0VGltZTogRGF0ZS5ub3coKSxcbiAgICAgIGVuZ2luZVRpbWU6IDAsXG4gICAgICB0aWNrOiAwLFxuICAgICAgdG9jazogMCxcbiAgICAgIHRpbWU6IDAsXG4gICAgICBfdGltZWxpbmU6IHRoaXMudGltZWxpbmUsXG4gICAgICBfbG9vcDogdGhpcyxcbiAgICAgIF9hbmltYXRpb25Mb29wOiB0aGlzLFxuICAgICAgX21vdXNlUG9zaXRpb246IG51bGxcbiAgICB9O1xuICB9XG5cbiAgX3VwZGF0ZUNhbGxiYWNrRGF0YSgpIHtcbiAgICBjb25zdCB7XG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodCxcbiAgICAgIGFzcGVjdFxuICAgIH0gPSB0aGlzLl9nZXRTaXplQW5kQXNwZWN0KCk7XG5cbiAgICBpZiAod2lkdGggIT09IHRoaXMuYW5pbWF0aW9uUHJvcHMud2lkdGggfHwgaGVpZ2h0ICE9PSB0aGlzLmFuaW1hdGlvblByb3BzLmhlaWdodCkge1xuICAgICAgdGhpcy5zZXROZWVkc1JlZHJhdygnZHJhd2luZyBidWZmZXIgcmVzaXplZCcpO1xuICAgIH1cblxuICAgIGlmIChhc3BlY3QgIT09IHRoaXMuYW5pbWF0aW9uUHJvcHMuYXNwZWN0KSB7XG4gICAgICB0aGlzLnNldE5lZWRzUmVkcmF3KCdkcmF3aW5nIGJ1ZmZlciBhc3BlY3QgY2hhbmdlZCcpO1xuICAgIH1cblxuICAgIHRoaXMuYW5pbWF0aW9uUHJvcHMud2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLmFuaW1hdGlvblByb3BzLmhlaWdodCA9IGhlaWdodDtcbiAgICB0aGlzLmFuaW1hdGlvblByb3BzLmFzcGVjdCA9IGFzcGVjdDtcbiAgICB0aGlzLmFuaW1hdGlvblByb3BzLm5lZWRzUmVkcmF3ID0gdGhpcy5uZWVkc1JlZHJhdztcbiAgICB0aGlzLmFuaW1hdGlvblByb3BzLmVuZ2luZVRpbWUgPSBEYXRlLm5vdygpIC0gdGhpcy5hbmltYXRpb25Qcm9wcy5zdGFydFRpbWU7XG5cbiAgICBpZiAodGhpcy50aW1lbGluZSkge1xuICAgICAgdGhpcy50aW1lbGluZS51cGRhdGUodGhpcy5hbmltYXRpb25Qcm9wcy5lbmdpbmVUaW1lKTtcbiAgICB9XG5cbiAgICB0aGlzLmFuaW1hdGlvblByb3BzLnRpY2sgPSBNYXRoLmZsb29yKHRoaXMuYW5pbWF0aW9uUHJvcHMudGltZSAvIDEwMDAgKiA2MCk7XG4gICAgdGhpcy5hbmltYXRpb25Qcm9wcy50b2NrKys7XG4gICAgdGhpcy5hbmltYXRpb25Qcm9wcy50aW1lID0gdGhpcy50aW1lbGluZSA/IHRoaXMudGltZWxpbmUuZ2V0VGltZSgpIDogdGhpcy5hbmltYXRpb25Qcm9wcy5lbmdpbmVUaW1lO1xuICAgIHRoaXMuYW5pbWF0aW9uUHJvcHMuX29mZlNjcmVlbiA9IHRoaXMub2ZmU2NyZWVuO1xuICB9XG5cbiAgX2ZpbmFsaXplQ2FsbGJhY2tEYXRhKCkge1xuICAgIHRoaXMub25GaW5hbGl6ZSh0aGlzLmFuaW1hdGlvblByb3BzKTtcbiAgfVxuXG4gIF9hZGRDYWxsYmFja0RhdGEoYXBwQ29udGV4dCkge1xuICAgIGlmICh0eXBlb2YgYXBwQ29udGV4dCA9PT0gJ29iamVjdCcgJiYgYXBwQ29udGV4dCAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5hbmltYXRpb25Qcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuYW5pbWF0aW9uUHJvcHMsIGFwcENvbnRleHQpO1xuICAgIH1cbiAgfVxuXG4gIF9jcmVhdGVXZWJHTENvbnRleHQob3B0cykge1xuICAgIHRoaXMub2ZmU2NyZWVuID0gb3B0cy5jYW52YXMgJiYgdHlwZW9mIE9mZnNjcmVlbkNhbnZhcyAhPT0gJ3VuZGVmaW5lZCcgJiYgb3B0cy5jYW52YXMgaW5zdGFuY2VvZiBPZmZzY3JlZW5DYW52YXM7XG4gICAgb3B0cyA9IE9iamVjdC5hc3NpZ24oe30sIG9wdHMsIHRoaXMucHJvcHMuZ2xPcHRpb25zKTtcbiAgICB0aGlzLmdsID0gdGhpcy5wcm9wcy5nbCA/IGluc3RydW1lbnRHTENvbnRleHQodGhpcy5wcm9wcy5nbCwgb3B0cykgOiB0aGlzLm9uQ3JlYXRlQ29udGV4dChvcHRzKTtcblxuICAgIGlmICghaXNXZWJHTCh0aGlzLmdsKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBbmltYXRpb25Mb29wLm9uQ3JlYXRlQ29udGV4dCAtIGlsbGVnYWwgY29udGV4dCByZXR1cm5lZCcpO1xuICAgIH1cblxuICAgIHJlc2V0UGFyYW1ldGVycyh0aGlzLmdsKTtcblxuICAgIHRoaXMuX2NyZWF0ZUluZm9EaXYoKTtcbiAgfVxuXG4gIF9jcmVhdGVJbmZvRGl2KCkge1xuICAgIGlmICh0aGlzLmdsLmNhbnZhcyAmJiB0aGlzLnByb3BzLm9uQWRkSFRNTCkge1xuICAgICAgY29uc3Qgd3JhcHBlckRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh3cmFwcGVyRGl2KTtcbiAgICAgIHdyYXBwZXJEaXYuc3R5bGUucG9zaXRpb24gPSAncmVsYXRpdmUnO1xuICAgICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBkaXYuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgZGl2LnN0eWxlLmxlZnQgPSAnMTBweCc7XG4gICAgICBkaXYuc3R5bGUuYm90dG9tID0gJzEwcHgnO1xuICAgICAgZGl2LnN0eWxlLndpZHRoID0gJzMwMHB4JztcbiAgICAgIGRpdi5zdHlsZS5iYWNrZ3JvdW5kID0gJ3doaXRlJztcbiAgICAgIHdyYXBwZXJEaXYuYXBwZW5kQ2hpbGQodGhpcy5nbC5jYW52YXMpO1xuICAgICAgd3JhcHBlckRpdi5hcHBlbmRDaGlsZChkaXYpO1xuICAgICAgY29uc3QgaHRtbCA9IHRoaXMucHJvcHMub25BZGRIVE1MKGRpdik7XG5cbiAgICAgIGlmIChodG1sKSB7XG4gICAgICAgIGRpdi5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9nZXRTaXplQW5kQXNwZWN0KCkge1xuICAgIGNvbnN0IHdpZHRoID0gdGhpcy5nbC5kcmF3aW5nQnVmZmVyV2lkdGg7XG4gICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5nbC5kcmF3aW5nQnVmZmVySGVpZ2h0O1xuICAgIGxldCBhc3BlY3QgPSAxO1xuICAgIGNvbnN0IHtcbiAgICAgIGNhbnZhc1xuICAgIH0gPSB0aGlzLmdsO1xuXG4gICAgaWYgKGNhbnZhcyAmJiBjYW52YXMuY2xpZW50SGVpZ2h0KSB7XG4gICAgICBhc3BlY3QgPSBjYW52YXMuY2xpZW50V2lkdGggLyBjYW52YXMuY2xpZW50SGVpZ2h0O1xuICAgIH0gZWxzZSBpZiAod2lkdGggPiAwICYmIGhlaWdodCA+IDApIHtcbiAgICAgIGFzcGVjdCA9IHdpZHRoIC8gaGVpZ2h0O1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodCxcbiAgICAgIGFzcGVjdFxuICAgIH07XG4gIH1cblxuICBfcmVzaXplVmlld3BvcnQoKSB7XG4gICAgaWYgKHRoaXMuYXV0b1Jlc2l6ZVZpZXdwb3J0KSB7XG4gICAgICB0aGlzLmdsLnZpZXdwb3J0KDAsIDAsIHRoaXMuZ2wuZHJhd2luZ0J1ZmZlcldpZHRoLCB0aGlzLmdsLmRyYXdpbmdCdWZmZXJIZWlnaHQpO1xuICAgIH1cbiAgfVxuXG4gIF9yZXNpemVDYW52YXNEcmF3aW5nQnVmZmVyKCkge1xuICAgIGlmICh0aGlzLmF1dG9SZXNpemVEcmF3aW5nQnVmZmVyKSB7XG4gICAgICByZXNpemVHTENvbnRleHQodGhpcy5nbCwge1xuICAgICAgICB1c2VEZXZpY2VQaXhlbHM6IHRoaXMudXNlRGV2aWNlUGl4ZWxzXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBfY3JlYXRlRnJhbWVidWZmZXIoKSB7XG4gICAgaWYgKHRoaXMucHJvcHMuY3JlYXRlRnJhbWVidWZmZXIpIHtcbiAgICAgIHRoaXMuZnJhbWVidWZmZXIgPSBuZXcgRnJhbWVidWZmZXIodGhpcy5nbCk7XG4gICAgfVxuICB9XG5cbiAgX3Jlc2l6ZUZyYW1lYnVmZmVyKCkge1xuICAgIGlmICh0aGlzLmZyYW1lYnVmZmVyKSB7XG4gICAgICB0aGlzLmZyYW1lYnVmZmVyLnJlc2l6ZSh7XG4gICAgICAgIHdpZHRoOiB0aGlzLmdsLmRyYXdpbmdCdWZmZXJXaWR0aCxcbiAgICAgICAgaGVpZ2h0OiB0aGlzLmdsLmRyYXdpbmdCdWZmZXJIZWlnaHRcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIF9iZWdpblRpbWVycygpIHtcbiAgICB0aGlzLmZyYW1lUmF0ZS50aW1lRW5kKCk7XG4gICAgdGhpcy5mcmFtZVJhdGUudGltZVN0YXJ0KCk7XG5cbiAgICBpZiAodGhpcy5fZ3B1VGltZVF1ZXJ5ICYmIHRoaXMuX2dwdVRpbWVRdWVyeS5pc1Jlc3VsdEF2YWlsYWJsZSgpICYmICF0aGlzLl9ncHVUaW1lUXVlcnkuaXNUaW1lckRpc2pvaW50KCkpIHtcbiAgICAgIHRoaXMuc3RhdHMuZ2V0KCdHUFUgVGltZScpLmFkZFRpbWUodGhpcy5fZ3B1VGltZVF1ZXJ5LmdldFRpbWVyTWlsbGlzZWNvbmRzKCkpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9ncHVUaW1lUXVlcnkpIHtcbiAgICAgIHRoaXMuX2dwdVRpbWVRdWVyeS5iZWdpblRpbWVFbGFwc2VkUXVlcnkoKTtcbiAgICB9XG5cbiAgICB0aGlzLmNwdVRpbWUudGltZVN0YXJ0KCk7XG4gIH1cblxuICBfZW5kVGltZXJzKCkge1xuICAgIHRoaXMuY3B1VGltZS50aW1lRW5kKCk7XG5cbiAgICBpZiAodGhpcy5fZ3B1VGltZVF1ZXJ5KSB7XG4gICAgICB0aGlzLl9ncHVUaW1lUXVlcnkuZW5kKCk7XG4gICAgfVxuICB9XG5cbiAgX3N0YXJ0RXZlbnRIYW5kbGluZygpIHtcbiAgICBjb25zdCB7XG4gICAgICBjYW52YXNcbiAgICB9ID0gdGhpcy5nbDtcblxuICAgIGlmIChjYW52YXMpIHtcbiAgICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlbW92ZSk7XG4gICAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIHRoaXMuX29uTW91c2VsZWF2ZSk7XG4gICAgfVxuICB9XG5cbiAgX29uTW91c2Vtb3ZlKGUpIHtcbiAgICB0aGlzLmFuaW1hdGlvblByb3BzLl9tb3VzZVBvc2l0aW9uID0gW2Uub2Zmc2V0WCwgZS5vZmZzZXRZXTtcbiAgfVxuXG4gIF9vbk1vdXNlbGVhdmUoZSkge1xuICAgIHRoaXMuYW5pbWF0aW9uUHJvcHMuX21vdXNlUG9zaXRpb24gPSBudWxsO1xuICB9XG5cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFuaW1hdGlvbi1sb29wLmpzLm1hcCIsImltcG9ydCB7IEJ1ZmZlciwgYXNzZXJ0IH0gZnJvbSAnQGx1bWEuZ2wvd2ViZ2wnO1xuY29uc3QgR0xURl9UT19MVU1BX0FUVFJJQlVURV9NQVAgPSB7XG4gIFBPU0lUSU9OOiAncG9zaXRpb25zJyxcbiAgTk9STUFMOiAnbm9ybWFscycsXG4gIENPTE9SXzA6ICdjb2xvcnMnLFxuICBURVhDT09SRF8wOiAndGV4Q29vcmRzJyxcbiAgVEVYQ09PUkRfMTogJ3RleENvb3JkczEnLFxuICBURVhDT09SRF8yOiAndGV4Q29vcmRzMidcbn07XG5leHBvcnQgZnVuY3Rpb24gZ2V0QnVmZmVyc0Zyb21HZW9tZXRyeShnbCwgZ2VvbWV0cnksIG9wdGlvbnMpIHtcbiAgY29uc3QgYnVmZmVycyA9IHt9O1xuICBsZXQgaW5kaWNlcyA9IGdlb21ldHJ5LmluZGljZXM7XG5cbiAgZm9yIChjb25zdCBuYW1lIGluIGdlb21ldHJ5LmF0dHJpYnV0ZXMpIHtcbiAgICBjb25zdCBhdHRyaWJ1dGUgPSBnZW9tZXRyeS5hdHRyaWJ1dGVzW25hbWVdO1xuICAgIGNvbnN0IHJlbWFwcGVkTmFtZSA9IG1hcEF0dHJpYnV0ZU5hbWUobmFtZSwgb3B0aW9ucyk7XG5cbiAgICBpZiAobmFtZSA9PT0gJ2luZGljZXMnKSB7XG4gICAgICBpbmRpY2VzID0gYXR0cmlidXRlO1xuICAgIH0gZWxzZSBpZiAoYXR0cmlidXRlLmNvbnN0YW50KSB7XG4gICAgICBidWZmZXJzW3JlbWFwcGVkTmFtZV0gPSBhdHRyaWJ1dGUudmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHR5cGVkQXJyYXkgPSBhdHRyaWJ1dGUudmFsdWU7XG4gICAgICBjb25zdCBhY2Nlc3NvciA9IHsgLi4uYXR0cmlidXRlXG4gICAgICB9O1xuICAgICAgZGVsZXRlIGFjY2Vzc29yLnZhbHVlO1xuICAgICAgYnVmZmVyc1tyZW1hcHBlZE5hbWVdID0gW25ldyBCdWZmZXIoZ2wsIHR5cGVkQXJyYXkpLCBhY2Nlc3Nvcl07XG4gICAgICBpbmZlckF0dHJpYnV0ZUFjY2Vzc29yKG5hbWUsIGFjY2Vzc29yKTtcbiAgICB9XG4gIH1cblxuICBpZiAoaW5kaWNlcykge1xuICAgIGNvbnN0IGRhdGEgPSBpbmRpY2VzLnZhbHVlIHx8IGluZGljZXM7XG4gICAgYXNzZXJ0KGRhdGEgaW5zdGFuY2VvZiBVaW50MTZBcnJheSB8fCBkYXRhIGluc3RhbmNlb2YgVWludDMyQXJyYXksICdhdHRyaWJ1dGUgYXJyYXkgZm9yIFwiaW5kaWNlc1wiIG11c3QgYmUgb2YgaW50ZWdlciB0eXBlJyk7XG4gICAgY29uc3QgYWNjZXNzb3IgPSB7XG4gICAgICBzaXplOiAxLFxuICAgICAgaXNJbmRleGVkOiBpbmRpY2VzLmlzSW5kZXhlZCA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IGluZGljZXMuaXNJbmRleGVkXG4gICAgfTtcbiAgICBidWZmZXJzLmluZGljZXMgPSBbbmV3IEJ1ZmZlcihnbCwge1xuICAgICAgZGF0YSxcbiAgICAgIHRhcmdldDogMzQ5NjNcbiAgICB9KSwgYWNjZXNzb3JdO1xuICB9XG5cbiAgcmV0dXJuIGJ1ZmZlcnM7XG59XG5cbmZ1bmN0aW9uIG1hcEF0dHJpYnV0ZU5hbWUobmFtZSwgb3B0aW9ucykge1xuICBjb25zdCB7XG4gICAgYXR0cmlidXRlTWFwID0gR0xURl9UT19MVU1BX0FUVFJJQlVURV9NQVBcbiAgfSA9IG9wdGlvbnMgfHwge307XG4gIHJldHVybiBhdHRyaWJ1dGVNYXAgJiYgYXR0cmlidXRlTWFwW25hbWVdIHx8IG5hbWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbmZlckF0dHJpYnV0ZUFjY2Vzc29yKGF0dHJpYnV0ZU5hbWUsIGF0dHJpYnV0ZSkge1xuICBsZXQgY2F0ZWdvcnk7XG5cbiAgc3dpdGNoIChhdHRyaWJ1dGVOYW1lKSB7XG4gICAgY2FzZSAndGV4Q29vcmRzJzpcbiAgICBjYXNlICd0ZXhDb29yZDEnOlxuICAgIGNhc2UgJ3RleENvb3JkMic6XG4gICAgY2FzZSAndGV4Q29vcmQzJzpcbiAgICAgIGNhdGVnb3J5ID0gJ3V2cyc7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ3ZlcnRpY2VzJzpcbiAgICBjYXNlICdwb3NpdGlvbnMnOlxuICAgIGNhc2UgJ25vcm1hbHMnOlxuICAgIGNhc2UgJ3BpY2tpbmdDb2xvcnMnOlxuICAgICAgY2F0ZWdvcnkgPSAndmVjdG9ycyc7XG4gICAgICBicmVhaztcblxuICAgIGRlZmF1bHQ6XG4gIH1cblxuICBzd2l0Y2ggKGNhdGVnb3J5KSB7XG4gICAgY2FzZSAndmVjdG9ycyc6XG4gICAgICBhdHRyaWJ1dGUuc2l6ZSA9IGF0dHJpYnV0ZS5zaXplIHx8IDM7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ3V2cyc6XG4gICAgICBhdHRyaWJ1dGUuc2l6ZSA9IGF0dHJpYnV0ZS5zaXplIHx8IDI7XG4gICAgICBicmVhaztcblxuICAgIGRlZmF1bHQ6XG4gIH1cblxuICBhc3NlcnQoTnVtYmVyLmlzRmluaXRlKGF0dHJpYnV0ZS5zaXplKSwgYGF0dHJpYnV0ZSAke2F0dHJpYnV0ZU5hbWV9IG5lZWRzIHNpemVgKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1vZGVsLXV0aWxzLmpzLm1hcCIsImltcG9ydCB7IGlzV2ViR0wgfSBmcm9tICdAbHVtYS5nbC9nbHRvb2xzJztcbmltcG9ydCBQcm9ncmFtTWFuYWdlciBmcm9tICcuL3Byb2dyYW0tbWFuYWdlcic7XG5pbXBvcnQgeyBQcm9ncmFtLCBWZXJ0ZXhBcnJheSwgY2xlYXIsIFRyYW5zZm9ybUZlZWRiYWNrLCBCdWZmZXIsIGxvZywgaXNPYmplY3RFbXB0eSwgdWlkLCBhc3NlcnQgfSBmcm9tICdAbHVtYS5nbC93ZWJnbCc7XG5pbXBvcnQgeyBnZXREZWJ1Z1RhYmxlRm9yVW5pZm9ybXMsIGdldERlYnVnVGFibGVGb3JWZXJ0ZXhBcnJheSwgZ2V0RGVidWdUYWJsZUZvclByb2dyYW1Db25maWd1cmF0aW9uIH0gZnJvbSAnQGx1bWEuZ2wvd2ViZ2wnO1xuaW1wb3J0IHsgZ2V0QnVmZmVyc0Zyb21HZW9tZXRyeSB9IGZyb20gJy4vbW9kZWwtdXRpbHMnO1xuY29uc3QgTE9HX0RSQVdfUFJJT1JJVFkgPSAyO1xuY29uc3QgTE9HX0RSQVdfVElNRU9VVCA9IDEwMDAwO1xuY29uc3QgRVJSX01PREVMX1BBUkFNUyA9ICdNb2RlbCBuZWVkcyBkcmF3TW9kZSBhbmQgdmVydGV4Q291bnQnO1xuXG5jb25zdCBOT09QID0gKCkgPT4ge307XG5cbmNvbnN0IERSQVdfUEFSQU1TID0ge307XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb2RlbCB7XG4gIGNvbnN0cnVjdG9yKGdsLCBwcm9wcyA9IHt9KSB7XG4gICAgY29uc3Qge1xuICAgICAgaWQgPSB1aWQoJ21vZGVsJylcbiAgICB9ID0gcHJvcHM7XG4gICAgYXNzZXJ0KGlzV2ViR0woZ2wpKTtcbiAgICB0aGlzLmlkID0gaWQ7XG4gICAgdGhpcy5nbCA9IGdsO1xuICAgIHRoaXMuaWQgPSBwcm9wcy5pZCB8fCB1aWQoJ01vZGVsJyk7XG4gICAgdGhpcy5sYXN0TG9nVGltZSA9IDA7XG4gICAgdGhpcy5hbmltYXRlZCA9IGZhbHNlO1xuICAgIHRoaXMuaW5pdGlhbGl6ZShwcm9wcyk7XG4gIH1cblxuICBpbml0aWFsaXplKHByb3BzKSB7XG4gICAgdGhpcy5wcm9wcyA9IHt9O1xuICAgIHRoaXMucHJvZ3JhbU1hbmFnZXIgPSBwcm9wcy5wcm9ncmFtTWFuYWdlciB8fCBQcm9ncmFtTWFuYWdlci5nZXREZWZhdWx0UHJvZ3JhbU1hbmFnZXIodGhpcy5nbCk7XG4gICAgdGhpcy5fcHJvZ3JhbU1hbmFnZXJTdGF0ZSA9IC0xO1xuICAgIHRoaXMuX21hbmFnZWRQcm9ncmFtID0gZmFsc2U7XG4gICAgY29uc3Qge1xuICAgICAgcHJvZ3JhbSA9IG51bGwsXG4gICAgICB2cyxcbiAgICAgIGZzLFxuICAgICAgbW9kdWxlcyxcbiAgICAgIGRlZmluZXMsXG4gICAgICBpbmplY3QsXG4gICAgICB2YXJ5aW5ncyxcbiAgICAgIGJ1ZmZlck1vZGUsXG4gICAgICB0cmFuc3BpbGVUb0dMU0wxMDBcbiAgICB9ID0gcHJvcHM7XG4gICAgdGhpcy5wcm9ncmFtUHJvcHMgPSB7XG4gICAgICBwcm9ncmFtLFxuICAgICAgdnMsXG4gICAgICBmcyxcbiAgICAgIG1vZHVsZXMsXG4gICAgICBkZWZpbmVzLFxuICAgICAgaW5qZWN0LFxuICAgICAgdmFyeWluZ3MsXG4gICAgICBidWZmZXJNb2RlLFxuICAgICAgdHJhbnNwaWxlVG9HTFNMMTAwXG4gICAgfTtcbiAgICB0aGlzLnByb2dyYW0gPSBudWxsO1xuICAgIHRoaXMudmVydGV4QXJyYXkgPSBudWxsO1xuICAgIHRoaXMuX3Byb2dyYW1EaXJ0eSA9IHRydWU7XG4gICAgdGhpcy51c2VyRGF0YSA9IHt9O1xuICAgIHRoaXMubmVlZHNSZWRyYXcgPSB0cnVlO1xuICAgIHRoaXMuX2F0dHJpYnV0ZXMgPSB7fTtcbiAgICB0aGlzLmF0dHJpYnV0ZXMgPSB7fTtcbiAgICB0aGlzLnVuaWZvcm1zID0ge307XG4gICAgdGhpcy5waWNrYWJsZSA9IHRydWU7XG5cbiAgICB0aGlzLl9jaGVja1Byb2dyYW0oKTtcblxuICAgIHRoaXMuc2V0VW5pZm9ybXMoT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nZXRNb2R1bGVVbmlmb3Jtcyhwcm9wcy5tb2R1bGVTZXR0aW5ncykpKTtcbiAgICB0aGlzLmRyYXdNb2RlID0gcHJvcHMuZHJhd01vZGUgIT09IHVuZGVmaW5lZCA/IHByb3BzLmRyYXdNb2RlIDogNDtcbiAgICB0aGlzLnZlcnRleENvdW50ID0gcHJvcHMudmVydGV4Q291bnQgfHwgMDtcbiAgICB0aGlzLmdlb21ldHJ5QnVmZmVycyA9IHt9O1xuICAgIHRoaXMuaXNJbnN0YW5jZWQgPSBwcm9wcy5pc0luc3RhbmNlZCB8fCBwcm9wcy5pbnN0YW5jZWQgfHwgcHJvcHMuaW5zdGFuY2VDb3VudCA+IDA7XG5cbiAgICB0aGlzLl9zZXRNb2RlbFByb3BzKHByb3BzKTtcblxuICAgIHRoaXMuZ2VvbWV0cnkgPSB7fTtcbiAgICBhc3NlcnQodGhpcy5kcmF3TW9kZSAhPT0gdW5kZWZpbmVkICYmIE51bWJlci5pc0Zpbml0ZSh0aGlzLnZlcnRleENvdW50KSwgRVJSX01PREVMX1BBUkFNUyk7XG4gIH1cblxuICBzZXRQcm9wcyhwcm9wcykge1xuICAgIHRoaXMuX3NldE1vZGVsUHJvcHMocHJvcHMpO1xuICB9XG5cbiAgZGVsZXRlKCkge1xuICAgIGZvciAoY29uc3Qga2V5IGluIHRoaXMuX2F0dHJpYnV0ZXMpIHtcbiAgICAgIGlmICh0aGlzLl9hdHRyaWJ1dGVzW2tleV0gIT09IHRoaXMuYXR0cmlidXRlc1trZXldKSB7XG4gICAgICAgIHRoaXMuX2F0dHJpYnV0ZXNba2V5XS5kZWxldGUoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5fbWFuYWdlZFByb2dyYW0pIHtcbiAgICAgIHRoaXMucHJvZ3JhbU1hbmFnZXIucmVsZWFzZSh0aGlzLnByb2dyYW0pO1xuICAgICAgdGhpcy5fbWFuYWdlZFByb2dyYW0gPSBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLnZlcnRleEFycmF5LmRlbGV0ZSgpO1xuXG4gICAgdGhpcy5fZGVsZXRlR2VvbWV0cnlCdWZmZXJzKCk7XG4gIH1cblxuICBnZXREcmF3TW9kZSgpIHtcbiAgICByZXR1cm4gdGhpcy5kcmF3TW9kZTtcbiAgfVxuXG4gIGdldFZlcnRleENvdW50KCkge1xuICAgIHJldHVybiB0aGlzLnZlcnRleENvdW50O1xuICB9XG5cbiAgZ2V0SW5zdGFuY2VDb3VudCgpIHtcbiAgICByZXR1cm4gdGhpcy5pbnN0YW5jZUNvdW50O1xuICB9XG5cbiAgZ2V0QXR0cmlidXRlcygpIHtcbiAgICByZXR1cm4gdGhpcy5hdHRyaWJ1dGVzO1xuICB9XG5cbiAgZ2V0UHJvZ3JhbSgpIHtcbiAgICByZXR1cm4gdGhpcy5wcm9ncmFtO1xuICB9XG5cbiAgc2V0UHJvZ3JhbShwcm9wcykge1xuICAgIGNvbnN0IHtcbiAgICAgIHByb2dyYW0sXG4gICAgICB2cyxcbiAgICAgIGZzLFxuICAgICAgbW9kdWxlcyxcbiAgICAgIGRlZmluZXMsXG4gICAgICBpbmplY3QsXG4gICAgICB2YXJ5aW5ncyxcbiAgICAgIGJ1ZmZlck1vZGUsXG4gICAgICB0cmFuc3BpbGVUb0dMU0wxMDBcbiAgICB9ID0gcHJvcHM7XG4gICAgdGhpcy5wcm9ncmFtUHJvcHMgPSB7XG4gICAgICBwcm9ncmFtLFxuICAgICAgdnMsXG4gICAgICBmcyxcbiAgICAgIG1vZHVsZXMsXG4gICAgICBkZWZpbmVzLFxuICAgICAgaW5qZWN0LFxuICAgICAgdmFyeWluZ3MsXG4gICAgICBidWZmZXJNb2RlLFxuICAgICAgdHJhbnNwaWxlVG9HTFNMMTAwXG4gICAgfTtcbiAgICB0aGlzLl9wcm9ncmFtRGlydHkgPSB0cnVlO1xuICB9XG5cbiAgZ2V0VW5pZm9ybXMoKSB7XG4gICAgcmV0dXJuIHRoaXMudW5pZm9ybXM7XG4gIH1cblxuICBzZXREcmF3TW9kZShkcmF3TW9kZSkge1xuICAgIHRoaXMuZHJhd01vZGUgPSBkcmF3TW9kZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHNldFZlcnRleENvdW50KHZlcnRleENvdW50KSB7XG4gICAgYXNzZXJ0KE51bWJlci5pc0Zpbml0ZSh2ZXJ0ZXhDb3VudCkpO1xuICAgIHRoaXMudmVydGV4Q291bnQgPSB2ZXJ0ZXhDb3VudDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHNldEluc3RhbmNlQ291bnQoaW5zdGFuY2VDb3VudCkge1xuICAgIGFzc2VydChOdW1iZXIuaXNGaW5pdGUoaW5zdGFuY2VDb3VudCkpO1xuICAgIHRoaXMuaW5zdGFuY2VDb3VudCA9IGluc3RhbmNlQ291bnQ7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzZXRHZW9tZXRyeShnZW9tZXRyeSkge1xuICAgIHRoaXMuZHJhd01vZGUgPSBnZW9tZXRyeS5kcmF3TW9kZTtcbiAgICB0aGlzLnZlcnRleENvdW50ID0gZ2VvbWV0cnkuZ2V0VmVydGV4Q291bnQoKTtcblxuICAgIHRoaXMuX2RlbGV0ZUdlb21ldHJ5QnVmZmVycygpO1xuXG4gICAgdGhpcy5nZW9tZXRyeUJ1ZmZlcnMgPSBnZXRCdWZmZXJzRnJvbUdlb21ldHJ5KHRoaXMuZ2wsIGdlb21ldHJ5KTtcbiAgICB0aGlzLnZlcnRleEFycmF5LnNldEF0dHJpYnV0ZXModGhpcy5nZW9tZXRyeUJ1ZmZlcnMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc2V0QXR0cmlidXRlcyhhdHRyaWJ1dGVzID0ge30pIHtcbiAgICBpZiAoaXNPYmplY3RFbXB0eShhdHRyaWJ1dGVzKSkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY29uc3Qgbm9ybWFsaXplZEF0dHJpYnV0ZXMgPSB7fTtcblxuICAgIGZvciAoY29uc3QgbmFtZSBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICBjb25zdCBhdHRyaWJ1dGUgPSBhdHRyaWJ1dGVzW25hbWVdO1xuICAgICAgbm9ybWFsaXplZEF0dHJpYnV0ZXNbbmFtZV0gPSBhdHRyaWJ1dGUuZ2V0VmFsdWUgPyBhdHRyaWJ1dGUuZ2V0VmFsdWUoKSA6IGF0dHJpYnV0ZTtcbiAgICB9XG5cbiAgICB0aGlzLnZlcnRleEFycmF5LnNldEF0dHJpYnV0ZXMobm9ybWFsaXplZEF0dHJpYnV0ZXMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc2V0VW5pZm9ybXModW5pZm9ybXMgPSB7fSkge1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy51bmlmb3JtcywgdW5pZm9ybXMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZ2V0TW9kdWxlVW5pZm9ybXMob3B0cykge1xuICAgIHRoaXMuX2NoZWNrUHJvZ3JhbSgpO1xuXG4gICAgY29uc3QgZ2V0VW5pZm9ybXMgPSB0aGlzLnByb2dyYW1NYW5hZ2VyLmdldFVuaWZvcm1zKHRoaXMucHJvZ3JhbSk7XG5cbiAgICBpZiAoZ2V0VW5pZm9ybXMpIHtcbiAgICAgIHJldHVybiBnZXRVbmlmb3JtcyhvcHRzKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge307XG4gIH1cblxuICB1cGRhdGVNb2R1bGVTZXR0aW5ncyhvcHRzKSB7XG4gICAgY29uc3QgdW5pZm9ybXMgPSB0aGlzLmdldE1vZHVsZVVuaWZvcm1zKG9wdHMgfHwge30pO1xuICAgIHJldHVybiB0aGlzLnNldFVuaWZvcm1zKHVuaWZvcm1zKTtcbiAgfVxuXG4gIGNsZWFyKG9wdHMpIHtcbiAgICBjbGVhcih0aGlzLnByb2dyYW0uZ2wsIG9wdHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZHJhdyhvcHRzID0ge30pIHtcbiAgICB0aGlzLl9jaGVja1Byb2dyYW0oKTtcblxuICAgIGNvbnN0IHtcbiAgICAgIG1vZHVsZVNldHRpbmdzID0gbnVsbCxcbiAgICAgIGZyYW1lYnVmZmVyLFxuICAgICAgdW5pZm9ybXMgPSB7fSxcbiAgICAgIGF0dHJpYnV0ZXMgPSB7fSxcbiAgICAgIHRyYW5zZm9ybUZlZWRiYWNrID0gdGhpcy50cmFuc2Zvcm1GZWVkYmFjayxcbiAgICAgIHBhcmFtZXRlcnMgPSB7fSxcbiAgICAgIHZlcnRleEFycmF5ID0gdGhpcy52ZXJ0ZXhBcnJheVxuICAgIH0gPSBvcHRzO1xuICAgIHRoaXMuc2V0QXR0cmlidXRlcyhhdHRyaWJ1dGVzKTtcbiAgICB0aGlzLnVwZGF0ZU1vZHVsZVNldHRpbmdzKG1vZHVsZVNldHRpbmdzKTtcbiAgICB0aGlzLnNldFVuaWZvcm1zKHVuaWZvcm1zKTtcbiAgICBsZXQgbG9nUHJpb3JpdHk7XG5cbiAgICBpZiAobG9nLnByaW9yaXR5ID49IExPR19EUkFXX1BSSU9SSVRZKSB7XG4gICAgICBsb2dQcmlvcml0eSA9IHRoaXMuX2xvZ0RyYXdDYWxsU3RhcnQoTE9HX0RSQVdfUFJJT1JJVFkpO1xuICAgIH1cblxuICAgIGNvbnN0IGRyYXdQYXJhbXMgPSB0aGlzLnZlcnRleEFycmF5LmdldERyYXdQYXJhbXMoKTtcbiAgICBjb25zdCB7XG4gICAgICBpc0luZGV4ZWQgPSBkcmF3UGFyYW1zLmlzSW5kZXhlZCxcbiAgICAgIGluZGV4VHlwZSA9IGRyYXdQYXJhbXMuaW5kZXhUeXBlLFxuICAgICAgaW5kZXhPZmZzZXQgPSBkcmF3UGFyYW1zLmluZGV4T2Zmc2V0LFxuICAgICAgdmVydGV4QXJyYXlJbnN0YW5jZWQgPSBkcmF3UGFyYW1zLmlzSW5zdGFuY2VkXG4gICAgfSA9IHRoaXMucHJvcHM7XG5cbiAgICBpZiAodmVydGV4QXJyYXlJbnN0YW5jZWQgJiYgIXRoaXMuaXNJbnN0YW5jZWQpIHtcbiAgICAgIGxvZy53YXJuKCdGb3VuZCBpbnN0YW5jZWQgYXR0cmlidXRlcyBvbiBub24taW5zdGFuY2VkIG1vZGVsJywgdGhpcy5pZCkoKTtcbiAgICB9XG5cbiAgICBjb25zdCB7XG4gICAgICBpc0luc3RhbmNlZCxcbiAgICAgIGluc3RhbmNlQ291bnRcbiAgICB9ID0gdGhpcztcbiAgICBjb25zdCB7XG4gICAgICBvbkJlZm9yZVJlbmRlciA9IE5PT1AsXG4gICAgICBvbkFmdGVyUmVuZGVyID0gTk9PUFxuICAgIH0gPSB0aGlzLnByb3BzO1xuICAgIG9uQmVmb3JlUmVuZGVyKCk7XG4gICAgdGhpcy5wcm9ncmFtLnNldFVuaWZvcm1zKHRoaXMudW5pZm9ybXMpO1xuICAgIGNvbnN0IGRpZERyYXcgPSB0aGlzLnByb2dyYW0uZHJhdyhPYmplY3QuYXNzaWduKERSQVdfUEFSQU1TLCBvcHRzLCB7XG4gICAgICBsb2dQcmlvcml0eSxcbiAgICAgIHVuaWZvcm1zOiBudWxsLFxuICAgICAgZnJhbWVidWZmZXIsXG4gICAgICBwYXJhbWV0ZXJzLFxuICAgICAgZHJhd01vZGU6IHRoaXMuZ2V0RHJhd01vZGUoKSxcbiAgICAgIHZlcnRleENvdW50OiB0aGlzLmdldFZlcnRleENvdW50KCksXG4gICAgICB2ZXJ0ZXhBcnJheSxcbiAgICAgIHRyYW5zZm9ybUZlZWRiYWNrLFxuICAgICAgaXNJbmRleGVkLFxuICAgICAgaW5kZXhUeXBlLFxuICAgICAgaXNJbnN0YW5jZWQsXG4gICAgICBpbnN0YW5jZUNvdW50LFxuICAgICAgb2Zmc2V0OiBpc0luZGV4ZWQgPyBpbmRleE9mZnNldCA6IDBcbiAgICB9KSk7XG4gICAgb25BZnRlclJlbmRlcigpO1xuXG4gICAgaWYgKGxvZy5wcmlvcml0eSA+PSBMT0dfRFJBV19QUklPUklUWSkge1xuICAgICAgdGhpcy5fbG9nRHJhd0NhbGxFbmQobG9nUHJpb3JpdHksIHZlcnRleEFycmF5LCBmcmFtZWJ1ZmZlcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRpZERyYXc7XG4gIH1cblxuICB0cmFuc2Zvcm0ob3B0cyA9IHt9KSB7XG4gICAgY29uc3Qge1xuICAgICAgZGlzY2FyZCA9IHRydWUsXG4gICAgICBmZWVkYmFja0J1ZmZlcnMsXG4gICAgICB1bmJpbmRNb2RlbHMgPSBbXVxuICAgIH0gPSBvcHRzO1xuICAgIGxldCB7XG4gICAgICBwYXJhbWV0ZXJzXG4gICAgfSA9IG9wdHM7XG5cbiAgICBpZiAoZmVlZGJhY2tCdWZmZXJzKSB7XG4gICAgICB0aGlzLl9zZXRGZWVkYmFja0J1ZmZlcnMoZmVlZGJhY2tCdWZmZXJzKTtcbiAgICB9XG5cbiAgICBpZiAoZGlzY2FyZCkge1xuICAgICAgcGFyYW1ldGVycyA9IE9iamVjdC5hc3NpZ24oe30sIHBhcmFtZXRlcnMsIHtcbiAgICAgICAgWzM1OTc3XTogZGlzY2FyZFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdW5iaW5kTW9kZWxzLmZvckVhY2gobW9kZWwgPT4gbW9kZWwudmVydGV4QXJyYXkudW5iaW5kQnVmZmVycygpKTtcblxuICAgIHRyeSB7XG4gICAgICB0aGlzLmRyYXcoT2JqZWN0LmFzc2lnbih7fSwgb3B0cywge1xuICAgICAgICBwYXJhbWV0ZXJzXG4gICAgICB9KSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHVuYmluZE1vZGVscy5mb3JFYWNoKG1vZGVsID0+IG1vZGVsLnZlcnRleEFycmF5LmJpbmRCdWZmZXJzKCkpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcmVuZGVyKHVuaWZvcm1zID0ge30pIHtcbiAgICBsb2cud2FybignTW9kZWwucmVuZGVyKCkgaXMgZGVwcmVjYXRlZC4gVXNlIE1vZGVsLnNldFVuaWZvcm1zKCkgYW5kIE1vZGVsLmRyYXcoKScpKCk7XG4gICAgcmV0dXJuIHRoaXMuc2V0VW5pZm9ybXModW5pZm9ybXMpLmRyYXcoKTtcbiAgfVxuXG4gIF9zZXRNb2RlbFByb3BzKHByb3BzKSB7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLnByb3BzLCBwcm9wcyk7XG5cbiAgICBpZiAoJ3VuaWZvcm1zJyBpbiBwcm9wcykge1xuICAgICAgdGhpcy5zZXRVbmlmb3Jtcyhwcm9wcy51bmlmb3Jtcyk7XG4gICAgfVxuXG4gICAgaWYgKCdwaWNrYWJsZScgaW4gcHJvcHMpIHtcbiAgICAgIHRoaXMucGlja2FibGUgPSBwcm9wcy5waWNrYWJsZTtcbiAgICB9XG5cbiAgICBpZiAoJ2luc3RhbmNlQ291bnQnIGluIHByb3BzKSB7XG4gICAgICB0aGlzLmluc3RhbmNlQ291bnQgPSBwcm9wcy5pbnN0YW5jZUNvdW50O1xuICAgIH1cblxuICAgIGlmICgnZ2VvbWV0cnknIGluIHByb3BzKSB7XG4gICAgICB0aGlzLnNldEdlb21ldHJ5KHByb3BzLmdlb21ldHJ5KTtcbiAgICB9XG5cbiAgICBpZiAoJ2F0dHJpYnV0ZXMnIGluIHByb3BzKSB7XG4gICAgICB0aGlzLnNldEF0dHJpYnV0ZXMocHJvcHMuYXR0cmlidXRlcyk7XG4gICAgfVxuXG4gICAgaWYgKCdfZmVlZGJhY2tCdWZmZXJzJyBpbiBwcm9wcykge1xuICAgICAgdGhpcy5fc2V0RmVlZGJhY2tCdWZmZXJzKHByb3BzLl9mZWVkYmFja0J1ZmZlcnMpO1xuICAgIH1cbiAgfVxuXG4gIF9jaGVja1Byb2dyYW0oKSB7XG4gICAgY29uc3QgbmVlZHNVcGRhdGUgPSB0aGlzLl9wcm9ncmFtRGlydHkgfHwgdGhpcy5wcm9ncmFtTWFuYWdlci5zdGF0ZUhhc2ggIT09IHRoaXMuX3Byb2dyYW1NYW5hZ2VyU3RhdGU7XG5cbiAgICBpZiAoIW5lZWRzVXBkYXRlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IHtcbiAgICAgIHByb2dyYW1cbiAgICB9ID0gdGhpcy5wcm9ncmFtUHJvcHM7XG5cbiAgICBpZiAocHJvZ3JhbSkge1xuICAgICAgdGhpcy5fbWFuYWdlZFByb2dyYW0gPSBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qge1xuICAgICAgICB2cyxcbiAgICAgICAgZnMsXG4gICAgICAgIG1vZHVsZXMsXG4gICAgICAgIGluamVjdCxcbiAgICAgICAgZGVmaW5lcyxcbiAgICAgICAgdmFyeWluZ3MsXG4gICAgICAgIGJ1ZmZlck1vZGUsXG4gICAgICAgIHRyYW5zcGlsZVRvR0xTTDEwMFxuICAgICAgfSA9IHRoaXMucHJvZ3JhbVByb3BzO1xuICAgICAgcHJvZ3JhbSA9IHRoaXMucHJvZ3JhbU1hbmFnZXIuZ2V0KHtcbiAgICAgICAgdnMsXG4gICAgICAgIGZzLFxuICAgICAgICBtb2R1bGVzLFxuICAgICAgICBpbmplY3QsXG4gICAgICAgIGRlZmluZXMsXG4gICAgICAgIHZhcnlpbmdzLFxuICAgICAgICBidWZmZXJNb2RlLFxuICAgICAgICB0cmFuc3BpbGVUb0dMU0wxMDBcbiAgICAgIH0pO1xuXG4gICAgICBpZiAodGhpcy5wcm9ncmFtICYmIHRoaXMuX21hbmFnZWRQcm9ncmFtKSB7XG4gICAgICAgIHRoaXMucHJvZ3JhbU1hbmFnZXIucmVsZWFzZSh0aGlzLnByb2dyYW0pO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9wcm9ncmFtTWFuYWdlclN0YXRlID0gdGhpcy5wcm9ncmFtTWFuYWdlci5zdGF0ZUhhc2g7XG4gICAgICB0aGlzLl9tYW5hZ2VkUHJvZ3JhbSA9IHRydWU7XG4gICAgfVxuXG4gICAgYXNzZXJ0KHByb2dyYW0gaW5zdGFuY2VvZiBQcm9ncmFtLCAnTW9kZWwgbmVlZHMgYSBwcm9ncmFtJyk7XG4gICAgdGhpcy5fcHJvZ3JhbURpcnR5ID0gZmFsc2U7XG5cbiAgICBpZiAocHJvZ3JhbSA9PT0gdGhpcy5wcm9ncmFtKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5wcm9ncmFtID0gcHJvZ3JhbTtcblxuICAgIGlmICh0aGlzLnZlcnRleEFycmF5KSB7XG4gICAgICB0aGlzLnZlcnRleEFycmF5LnNldFByb3BzKHtcbiAgICAgICAgcHJvZ3JhbTogdGhpcy5wcm9ncmFtLFxuICAgICAgICBhdHRyaWJ1dGVzOiB0aGlzLnZlcnRleEFycmF5LmF0dHJpYnV0ZXNcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnZlcnRleEFycmF5ID0gbmV3IFZlcnRleEFycmF5KHRoaXMuZ2wsIHtcbiAgICAgICAgcHJvZ3JhbTogdGhpcy5wcm9ncmFtXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLnNldFVuaWZvcm1zKE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0TW9kdWxlVW5pZm9ybXMoKSkpO1xuICB9XG5cbiAgX2RlbGV0ZUdlb21ldHJ5QnVmZmVycygpIHtcbiAgICBmb3IgKGNvbnN0IG5hbWUgaW4gdGhpcy5nZW9tZXRyeUJ1ZmZlcnMpIHtcbiAgICAgIGNvbnN0IGJ1ZmZlciA9IHRoaXMuZ2VvbWV0cnlCdWZmZXJzW25hbWVdWzBdIHx8IHRoaXMuZ2VvbWV0cnlCdWZmZXJzW25hbWVdO1xuXG4gICAgICBpZiAoYnVmZmVyIGluc3RhbmNlb2YgQnVmZmVyKSB7XG4gICAgICAgIGJ1ZmZlci5kZWxldGUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfc2V0QW5pbWF0aW9uUHJvcHMoYW5pbWF0aW9uUHJvcHMpIHtcbiAgICBpZiAodGhpcy5hbmltYXRlZCkge1xuICAgICAgYXNzZXJ0KGFuaW1hdGlvblByb3BzLCAnTW9kZWwuZHJhdygpOiBhbmltYXRlZCB1bmlmb3JtcyBidXQgbm8gYW5pbWF0aW9uUHJvcHMnKTtcbiAgICB9XG4gIH1cblxuICBfc2V0RmVlZGJhY2tCdWZmZXJzKGZlZWRiYWNrQnVmZmVycyA9IHt9KSB7XG4gICAgaWYgKGlzT2JqZWN0RW1wdHkoZmVlZGJhY2tCdWZmZXJzKSkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY29uc3Qge1xuICAgICAgZ2xcbiAgICB9ID0gdGhpcy5wcm9ncmFtO1xuICAgIHRoaXMudHJhbnNmb3JtRmVlZGJhY2sgPSB0aGlzLnRyYW5zZm9ybUZlZWRiYWNrIHx8IG5ldyBUcmFuc2Zvcm1GZWVkYmFjayhnbCwge1xuICAgICAgcHJvZ3JhbTogdGhpcy5wcm9ncmFtXG4gICAgfSk7XG4gICAgdGhpcy50cmFuc2Zvcm1GZWVkYmFjay5zZXRCdWZmZXJzKGZlZWRiYWNrQnVmZmVycyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfbG9nRHJhd0NhbGxTdGFydChsb2dMZXZlbCkge1xuICAgIGNvbnN0IGxvZ0RyYXdUaW1lb3V0ID0gbG9nTGV2ZWwgPiAzID8gMCA6IExPR19EUkFXX1RJTUVPVVQ7XG5cbiAgICBpZiAoRGF0ZS5ub3coKSAtIHRoaXMubGFzdExvZ1RpbWUgPCBsb2dEcmF3VGltZW91dCkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICB0aGlzLmxhc3RMb2dUaW1lID0gRGF0ZS5ub3coKTtcbiAgICBsb2cuZ3JvdXAoTE9HX0RSQVdfUFJJT1JJVFksIGA+Pj4gRFJBV0lORyBNT0RFTCAke3RoaXMuaWR9YCwge1xuICAgICAgY29sbGFwc2VkOiBsb2cubGV2ZWwgPD0gMlxuICAgIH0pKCk7XG4gICAgcmV0dXJuIGxvZ0xldmVsO1xuICB9XG5cbiAgX2xvZ0RyYXdDYWxsRW5kKGxvZ0xldmVsLCB2ZXJ0ZXhBcnJheSwgdW5pZm9ybXMsIGZyYW1lYnVmZmVyKSB7XG4gICAgaWYgKGxvZ0xldmVsID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBhdHRyaWJ1dGVUYWJsZSA9IGdldERlYnVnVGFibGVGb3JWZXJ0ZXhBcnJheSh7XG4gICAgICB2ZXJ0ZXhBcnJheSxcbiAgICAgIGhlYWRlcjogYCR7dGhpcy5pZH0gYXR0cmlidXRlc2AsXG4gICAgICBhdHRyaWJ1dGVzOiB0aGlzLl9hdHRyaWJ1dGVzXG4gICAgfSk7XG4gICAgY29uc3Qge1xuICAgICAgdGFibGU6IHVuaWZvcm1UYWJsZSxcbiAgICAgIHVudXNlZFRhYmxlLFxuICAgICAgdW51c2VkQ291bnRcbiAgICB9ID0gZ2V0RGVidWdUYWJsZUZvclVuaWZvcm1zKHtcbiAgICAgIGhlYWRlcjogYCR7dGhpcy5pZH0gdW5pZm9ybXNgLFxuICAgICAgcHJvZ3JhbTogdGhpcy5wcm9ncmFtLFxuICAgICAgdW5pZm9ybXM6IE9iamVjdC5hc3NpZ24oe30sIHRoaXMucHJvZ3JhbS51bmlmb3JtcywgdW5pZm9ybXMpXG4gICAgfSk7XG4gICAgY29uc3Qge1xuICAgICAgdGFibGU6IG1pc3NpbmdUYWJsZSxcbiAgICAgIGNvdW50OiBtaXNzaW5nQ291bnRcbiAgICB9ID0gZ2V0RGVidWdUYWJsZUZvclVuaWZvcm1zKHtcbiAgICAgIGhlYWRlcjogYCR7dGhpcy5pZH0gdW5pZm9ybXNgLFxuICAgICAgcHJvZ3JhbTogdGhpcy5wcm9ncmFtLFxuICAgICAgdW5pZm9ybXM6IE9iamVjdC5hc3NpZ24oe30sIHRoaXMucHJvZ3JhbS51bmlmb3JtcywgdW5pZm9ybXMpLFxuICAgICAgdW5kZWZpbmVkT25seTogdHJ1ZVxuICAgIH0pO1xuXG4gICAgaWYgKG1pc3NpbmdDb3VudCA+IDApIHtcbiAgICAgIGxvZy5sb2coJ01JU1NJTkcgVU5JRk9STVMnLCBPYmplY3Qua2V5cyhtaXNzaW5nVGFibGUpKSgpO1xuICAgIH1cblxuICAgIGlmICh1bnVzZWRDb3VudCA+IDApIHtcbiAgICAgIGxvZy5sb2coJ1VOVVNFRCBVTklGT1JNUycsIE9iamVjdC5rZXlzKHVudXNlZFRhYmxlKSkoKTtcbiAgICB9XG5cbiAgICBjb25zdCBjb25maWdUYWJsZSA9IGdldERlYnVnVGFibGVGb3JQcm9ncmFtQ29uZmlndXJhdGlvbih0aGlzLnZlcnRleEFycmF5LmNvbmZpZ3VyYXRpb24pO1xuICAgIGxvZy50YWJsZShsb2dMZXZlbCwgYXR0cmlidXRlVGFibGUpKCk7XG4gICAgbG9nLnRhYmxlKGxvZ0xldmVsLCB1bmlmb3JtVGFibGUpKCk7XG4gICAgbG9nLnRhYmxlKGxvZ0xldmVsICsgMSwgY29uZmlnVGFibGUpKCk7XG5cbiAgICBpZiAoZnJhbWVidWZmZXIpIHtcbiAgICAgIGZyYW1lYnVmZmVyLmxvZyh7XG4gICAgICAgIGxvZ0xldmVsOiBMT0dfRFJBV19QUklPUklUWSxcbiAgICAgICAgbWVzc2FnZTogYFJlbmRlcmVkIHRvICR7ZnJhbWVidWZmZXIuaWR9YFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgbG9nLmdyb3VwRW5kKExPR19EUkFXX1BSSU9SSVRZLCBgPj4+IERSQVdJTkcgTU9ERUwgJHt0aGlzLmlkfWApKCk7XG4gIH1cblxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bW9kZWwuanMubWFwIiwiaW1wb3J0IHsgYXNzZW1ibGVTaGFkZXJzIH0gZnJvbSAnQGx1bWEuZ2wvc2hhZGVydG9vbHMnO1xuaW1wb3J0IHsgUHJvZ3JhbSB9IGZyb20gJ0BsdW1hLmdsL3dlYmdsJztcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFByb2dyYW1NYW5hZ2VyIHtcbiAgc3RhdGljIGdldERlZmF1bHRQcm9ncmFtTWFuYWdlcihnbCkge1xuICAgIGdsLmx1bWEgPSBnbC5sdW1hIHx8IHt9O1xuICAgIGdsLmx1bWEuZGVmYXVsdFByb2dyYW1NYW5hZ2VyID0gZ2wubHVtYS5kZWZhdWx0UHJvZ3JhbU1hbmFnZXIgfHwgbmV3IFByb2dyYW1NYW5hZ2VyKGdsKTtcbiAgICByZXR1cm4gZ2wubHVtYS5kZWZhdWx0UHJvZ3JhbU1hbmFnZXI7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihnbCkge1xuICAgIHRoaXMuZ2wgPSBnbDtcbiAgICB0aGlzLl9wcm9ncmFtQ2FjaGUgPSB7fTtcbiAgICB0aGlzLl9nZXRVbmlmb3JtcyA9IHt9O1xuICAgIHRoaXMuX3JlZ2lzdGVyZWRNb2R1bGVzID0ge307XG4gICAgdGhpcy5faG9va0Z1bmN0aW9ucyA9IFtdO1xuICAgIHRoaXMuX2RlZmF1bHRNb2R1bGVzID0gW107XG4gICAgdGhpcy5faGFzaGVzID0ge307XG4gICAgdGhpcy5faGFzaENvdW50ZXIgPSAwO1xuICAgIHRoaXMuc3RhdGVIYXNoID0gMDtcbiAgICB0aGlzLl91c2VDb3VudHMgPSB7fTtcbiAgfVxuXG4gIGFkZERlZmF1bHRNb2R1bGUobW9kdWxlKSB7XG4gICAgaWYgKCF0aGlzLl9kZWZhdWx0TW9kdWxlcy5maW5kKG0gPT4gbS5uYW1lID09PSBtb2R1bGUubmFtZSkpIHtcbiAgICAgIHRoaXMuX2RlZmF1bHRNb2R1bGVzLnB1c2gobW9kdWxlKTtcbiAgICB9XG5cbiAgICB0aGlzLnN0YXRlSGFzaCsrO1xuICB9XG5cbiAgcmVtb3ZlRGVmYXVsdE1vZHVsZShtb2R1bGUpIHtcbiAgICBjb25zdCBtb2R1bGVOYW1lID0gdHlwZW9mIG1vZHVsZSA9PT0gJ3N0cmluZycgPyBtb2R1bGUgOiBtb2R1bGUubmFtZTtcbiAgICB0aGlzLl9kZWZhdWx0TW9kdWxlcyA9IHRoaXMuX2RlZmF1bHRNb2R1bGVzLmZpbHRlcihtID0+IG0ubmFtZSAhPT0gbW9kdWxlTmFtZSk7XG4gICAgdGhpcy5zdGF0ZUhhc2grKztcbiAgfVxuXG4gIGFkZFNoYWRlckhvb2soaG9vaywgb3B0cykge1xuICAgIGlmIChvcHRzKSB7XG4gICAgICBob29rID0gT2JqZWN0LmFzc2lnbihvcHRzLCB7XG4gICAgICAgIGhvb2tcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMuX2hvb2tGdW5jdGlvbnMucHVzaChob29rKTtcblxuICAgIHRoaXMuc3RhdGVIYXNoKys7XG4gIH1cblxuICBnZXQocHJvcHMgPSB7fSkge1xuICAgIGNvbnN0IHtcbiAgICAgIHZzID0gJycsXG4gICAgICBmcyA9ICcnLFxuICAgICAgZGVmaW5lcyA9IHt9LFxuICAgICAgaW5qZWN0ID0ge30sXG4gICAgICB2YXJ5aW5ncyA9IFtdLFxuICAgICAgYnVmZmVyTW9kZSA9IDB4OGM4ZCxcbiAgICAgIHRyYW5zcGlsZVRvR0xTTDEwMCA9IGZhbHNlXG4gICAgfSA9IHByb3BzO1xuXG4gICAgY29uc3QgbW9kdWxlcyA9IHRoaXMuX2dldE1vZHVsZUxpc3QocHJvcHMubW9kdWxlcyk7XG5cbiAgICBjb25zdCB2c0hhc2ggPSB0aGlzLl9nZXRIYXNoKHZzKTtcblxuICAgIGNvbnN0IGZzSGFzaCA9IHRoaXMuX2dldEhhc2goZnMpO1xuXG4gICAgY29uc3QgbW9kdWxlSGFzaGVzID0gbW9kdWxlcy5tYXAobSA9PiB0aGlzLl9nZXRIYXNoKG0ubmFtZSkpLnNvcnQoKTtcbiAgICBjb25zdCB2YXJ5aW5nSGFzaGVzID0gdmFyeWluZ3MubWFwKHYgPT4gdGhpcy5fZ2V0SGFzaCh2KSk7XG4gICAgY29uc3QgZGVmaW5lS2V5cyA9IE9iamVjdC5rZXlzKGRlZmluZXMpLnNvcnQoKTtcbiAgICBjb25zdCBpbmplY3RLZXlzID0gT2JqZWN0LmtleXMoaW5qZWN0KS5zb3J0KCk7XG4gICAgY29uc3QgZGVmaW5lSGFzaGVzID0gW107XG4gICAgY29uc3QgaW5qZWN0SGFzaGVzID0gW107XG5cbiAgICBmb3IgKGNvbnN0IGtleSBvZiBkZWZpbmVLZXlzKSB7XG4gICAgICBkZWZpbmVIYXNoZXMucHVzaCh0aGlzLl9nZXRIYXNoKGtleSkpO1xuICAgICAgZGVmaW5lSGFzaGVzLnB1c2godGhpcy5fZ2V0SGFzaChkZWZpbmVzW2tleV0pKTtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGtleSBvZiBpbmplY3RLZXlzKSB7XG4gICAgICBpbmplY3RIYXNoZXMucHVzaCh0aGlzLl9nZXRIYXNoKGtleSkpO1xuICAgICAgaW5qZWN0SGFzaGVzLnB1c2godGhpcy5fZ2V0SGFzaChpbmplY3Rba2V5XSkpO1xuICAgIH1cblxuICAgIGNvbnN0IGhhc2ggPSBgJHt2c0hhc2h9LyR7ZnNIYXNofUQke2RlZmluZUhhc2hlcy5qb2luKCcvJyl9TSR7bW9kdWxlSGFzaGVzLmpvaW4oJy8nKX1JJHtpbmplY3RIYXNoZXMuam9pbignLycpfVYke3ZhcnlpbmdIYXNoZXMuam9pbignLycpfUgke3RoaXMuc3RhdGVIYXNofUIke2J1ZmZlck1vZGV9JHt0cmFuc3BpbGVUb0dMU0wxMDAgPyAnVCcgOiAnJ31gO1xuXG4gICAgaWYgKCF0aGlzLl9wcm9ncmFtQ2FjaGVbaGFzaF0pIHtcbiAgICAgIGNvbnN0IGFzc2VtYmxlZCA9IGFzc2VtYmxlU2hhZGVycyh0aGlzLmdsLCB7XG4gICAgICAgIHZzLFxuICAgICAgICBmcyxcbiAgICAgICAgbW9kdWxlcyxcbiAgICAgICAgaW5qZWN0LFxuICAgICAgICBkZWZpbmVzLFxuICAgICAgICBob29rRnVuY3Rpb25zOiB0aGlzLl9ob29rRnVuY3Rpb25zLFxuICAgICAgICB0cmFuc3BpbGVUb0dMU0wxMDBcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fcHJvZ3JhbUNhY2hlW2hhc2hdID0gbmV3IFByb2dyYW0odGhpcy5nbCwge1xuICAgICAgICBoYXNoLFxuICAgICAgICB2czogYXNzZW1ibGVkLnZzLFxuICAgICAgICBmczogYXNzZW1ibGVkLmZzLFxuICAgICAgICB2YXJ5aW5ncyxcbiAgICAgICAgYnVmZmVyTW9kZVxuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuX2dldFVuaWZvcm1zW2hhc2hdID0gYXNzZW1ibGVkLmdldFVuaWZvcm1zIHx8ICh4ID0+IHt9KTtcblxuICAgICAgdGhpcy5fdXNlQ291bnRzW2hhc2hdID0gMDtcbiAgICB9XG5cbiAgICB0aGlzLl91c2VDb3VudHNbaGFzaF0rKztcbiAgICByZXR1cm4gdGhpcy5fcHJvZ3JhbUNhY2hlW2hhc2hdO1xuICB9XG5cbiAgZ2V0VW5pZm9ybXMocHJvZ3JhbSkge1xuICAgIHJldHVybiB0aGlzLl9nZXRVbmlmb3Jtc1twcm9ncmFtLmhhc2hdIHx8IG51bGw7XG4gIH1cblxuICByZWxlYXNlKHByb2dyYW0pIHtcbiAgICBjb25zdCBoYXNoID0gcHJvZ3JhbS5oYXNoO1xuICAgIHRoaXMuX3VzZUNvdW50c1toYXNoXS0tO1xuXG4gICAgaWYgKHRoaXMuX3VzZUNvdW50c1toYXNoXSA9PT0gMCkge1xuICAgICAgdGhpcy5fcHJvZ3JhbUNhY2hlW2hhc2hdLmRlbGV0ZSgpO1xuXG4gICAgICBkZWxldGUgdGhpcy5fcHJvZ3JhbUNhY2hlW2hhc2hdO1xuICAgICAgZGVsZXRlIHRoaXMuX2dldFVuaWZvcm1zW2hhc2hdO1xuICAgICAgZGVsZXRlIHRoaXMuX3VzZUNvdW50c1toYXNoXTtcbiAgICB9XG4gIH1cblxuICBfZ2V0SGFzaChrZXkpIHtcbiAgICBpZiAodGhpcy5faGFzaGVzW2tleV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5faGFzaGVzW2tleV0gPSB0aGlzLl9oYXNoQ291bnRlcisrO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9oYXNoZXNba2V5XTtcbiAgfVxuXG4gIF9nZXRNb2R1bGVMaXN0KGFwcE1vZHVsZXMgPSBbXSkge1xuICAgIGNvbnN0IG1vZHVsZXMgPSBuZXcgQXJyYXkodGhpcy5fZGVmYXVsdE1vZHVsZXMubGVuZ3RoICsgYXBwTW9kdWxlcy5sZW5ndGgpO1xuICAgIGNvbnN0IHNlZW4gPSB7fTtcbiAgICBsZXQgY291bnQgPSAwO1xuXG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IHRoaXMuX2RlZmF1bHRNb2R1bGVzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICBjb25zdCBtb2R1bGUgPSB0aGlzLl9kZWZhdWx0TW9kdWxlc1tpXTtcbiAgICAgIGNvbnN0IG5hbWUgPSBtb2R1bGUubmFtZTtcbiAgICAgIG1vZHVsZXNbY291bnQrK10gPSBtb2R1bGU7XG4gICAgICBzZWVuW25hbWVdID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gYXBwTW9kdWxlcy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgICAgY29uc3QgbW9kdWxlID0gYXBwTW9kdWxlc1tpXTtcbiAgICAgIGNvbnN0IG5hbWUgPSBtb2R1bGUubmFtZTtcblxuICAgICAgaWYgKCFzZWVuW25hbWVdKSB7XG4gICAgICAgIG1vZHVsZXNbY291bnQrK10gPSBtb2R1bGU7XG4gICAgICAgIHNlZW5bbmFtZV0gPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIG1vZHVsZXMubGVuZ3RoID0gY291bnQ7XG4gICAgcmV0dXJuIG1vZHVsZXM7XG4gIH1cblxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cHJvZ3JhbS1tYW5hZ2VyLmpzLm1hcCIsImltcG9ydCB7IGdsb2JhbCwgaXNCcm93c2VyIGFzIGdldElzQnJvd3NlciB9IGZyb20gJ3Byb2JlLmdsL2Vudic7XG5pbXBvcnQgeyB0cmFja0NvbnRleHRTdGF0ZSB9IGZyb20gJy4uL3N0YXRlLXRyYWNrZXIvdHJhY2stY29udGV4dC1zdGF0ZSc7XG5pbXBvcnQgeyBsb2cgfSBmcm9tICcuLi91dGlscy9sb2cnO1xuaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSAnLi4vdXRpbHMvYXNzZXJ0JztcbmltcG9ydCB7IGdldERldmljZVBpeGVsUmF0aW8gfSBmcm9tICcuLi91dGlscy9kZXZpY2UtcGl4ZWxzJztcbmltcG9ydCB7IGlzV2ViR0wyIH0gZnJvbSAnLi4vdXRpbHMvd2ViZ2wtY2hlY2tzJztcbmNvbnN0IGlzQnJvd3NlciA9IGdldElzQnJvd3NlcigpO1xuY29uc3QgaXNQYWdlID0gaXNCcm93c2VyICYmIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCc7XG5jb25zdCBDT05URVhUX0RFRkFVTFRTID0ge1xuICB3ZWJnbDI6IHRydWUsXG4gIHdlYmdsMTogdHJ1ZSxcbiAgdGhyb3dPbkVycm9yOiB0cnVlLFxuICBtYW5hZ2VTdGF0ZTogdHJ1ZSxcbiAgY2FudmFzOiBudWxsLFxuICBkZWJ1ZzogZmFsc2UsXG4gIHdpZHRoOiA4MDAsXG4gIGhlaWdodDogNjAwXG59O1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUdMQ29udGV4dChvcHRpb25zID0ge30pIHtcbiAgYXNzZXJ0KGlzQnJvd3NlciwgXCJjcmVhdGVHTENvbnRleHQgb25seSBhdmFpbGFibGUgaW4gdGhlIGJyb3dzZXIuXFxuQ3JlYXRlIHlvdXIgb3duIGhlYWRsZXNzIGNvbnRleHQgb3IgdXNlICdjcmVhdGVIZWFkbGVzc0NvbnRleHQnIGZyb20gQGx1bWEuZ2wvdGVzdC11dGlsc1wiKTtcbiAgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIENPTlRFWFRfREVGQVVMVFMsIG9wdGlvbnMpO1xuICBjb25zdCB7XG4gICAgd2lkdGgsXG4gICAgaGVpZ2h0XG4gIH0gPSBvcHRpb25zO1xuXG4gIGZ1bmN0aW9uIG9uRXJyb3IobWVzc2FnZSkge1xuICAgIGlmIChvcHRpb25zLnRocm93T25FcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICAgIH1cblxuICAgIGNvbnNvbGUuZXJyb3IobWVzc2FnZSk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBvcHRpb25zLm9uRXJyb3IgPSBvbkVycm9yO1xuICBsZXQgZ2w7XG4gIGNvbnN0IHtcbiAgICBjYW52YXNcbiAgfSA9IG9wdGlvbnM7XG4gIGNvbnN0IHRhcmdldENhbnZhcyA9IGdldENhbnZhcyh7XG4gICAgY2FudmFzLFxuICAgIHdpZHRoLFxuICAgIGhlaWdodCxcbiAgICBvbkVycm9yXG4gIH0pO1xuICBnbCA9IGNyZWF0ZUJyb3dzZXJDb250ZXh0KHRhcmdldENhbnZhcywgb3B0aW9ucyk7XG5cbiAgaWYgKCFnbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgZ2wgPSBpbnN0cnVtZW50R0xDb250ZXh0KGdsLCBvcHRpb25zKTtcbiAgbG9nSW5mbyhnbCk7XG4gIHJldHVybiBnbDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBpbnN0cnVtZW50R0xDb250ZXh0KGdsLCBvcHRpb25zID0ge30pIHtcbiAgaWYgKCFnbCB8fCBnbC5faW5zdHJ1bWVudGVkKSB7XG4gICAgcmV0dXJuIGdsO1xuICB9XG5cbiAgZ2wuX3ZlcnNpb24gPSBnbC5fdmVyc2lvbiB8fCBnZXRWZXJzaW9uKGdsKTtcbiAgZ2wubHVtYSA9IGdsLmx1bWEgfHwge307XG4gIGdsLmx1bWEuY2FudmFzU2l6ZUluZm8gPSBnbC5sdW1hLmNhbnZhc1NpemVJbmZvIHx8IHt9O1xuICBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgQ09OVEVYVF9ERUZBVUxUUywgb3B0aW9ucyk7XG4gIGNvbnN0IHtcbiAgICBtYW5hZ2VTdGF0ZSxcbiAgICBkZWJ1Z1xuICB9ID0gb3B0aW9ucztcblxuICBpZiAobWFuYWdlU3RhdGUpIHtcbiAgICB0cmFja0NvbnRleHRTdGF0ZShnbCwge1xuICAgICAgY29weVN0YXRlOiBmYWxzZSxcbiAgICAgIGxvZzogKC4uLmFyZ3MpID0+IGxvZy5sb2coMSwgLi4uYXJncykoKVxuICAgIH0pO1xuICB9XG5cbiAgaWYgKGlzQnJvd3NlciAmJiBkZWJ1Zykge1xuICAgIGlmICghZ2xvYmFsLm1ha2VEZWJ1Z0NvbnRleHQpIHtcbiAgICAgIGxvZy53YXJuKCdXZWJHTCBkZWJ1ZyBtb2RlIG5vdCBhY3RpdmF0ZWQuIGltcG9ydCBcIkBsdW1hLmdsL2RlYnVnXCIgdG8gZW5hYmxlLicpKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGdsID0gZ2xvYmFsLm1ha2VEZWJ1Z0NvbnRleHQoZ2wsIG9wdGlvbnMpO1xuICAgICAgbG9nLmxldmVsID0gTWF0aC5tYXgobG9nLmxldmVsLCAxKTtcbiAgICB9XG4gIH1cblxuICBnbC5faW5zdHJ1bWVudGVkID0gdHJ1ZTtcbiAgcmV0dXJuIGdsO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbnRleHREZWJ1Z0luZm8oZ2wpIHtcbiAgY29uc3QgdmVuZG9yTWFza2VkID0gZ2wuZ2V0UGFyYW1ldGVyKDc5MzYpO1xuICBjb25zdCByZW5kZXJlck1hc2tlZCA9IGdsLmdldFBhcmFtZXRlcig3OTM3KTtcbiAgY29uc3QgZXh0ID0gZ2wuZ2V0RXh0ZW5zaW9uKCdXRUJHTF9kZWJ1Z19yZW5kZXJlcl9pbmZvJyk7XG4gIGNvbnN0IHZlbmRvclVubWFza2VkID0gZXh0ICYmIGdsLmdldFBhcmFtZXRlcihleHQuVU5NQVNLRURfVkVORE9SX1dFQkdMIHx8IDc5MzYpO1xuICBjb25zdCByZW5kZXJlclVubWFza2VkID0gZXh0ICYmIGdsLmdldFBhcmFtZXRlcihleHQuVU5NQVNLRURfUkVOREVSRVJfV0VCR0wgfHwgNzkzNyk7XG4gIHJldHVybiB7XG4gICAgdmVuZG9yOiB2ZW5kb3JVbm1hc2tlZCB8fCB2ZW5kb3JNYXNrZWQsXG4gICAgcmVuZGVyZXI6IHJlbmRlcmVyVW5tYXNrZWQgfHwgcmVuZGVyZXJNYXNrZWQsXG4gICAgdmVuZG9yTWFza2VkLFxuICAgIHJlbmRlcmVyTWFza2VkLFxuICAgIHZlcnNpb246IGdsLmdldFBhcmFtZXRlcig3OTM4KSxcbiAgICBzaGFkaW5nTGFuZ3VhZ2VWZXJzaW9uOiBnbC5nZXRQYXJhbWV0ZXIoMzU3MjQpXG4gIH07XG59XG5leHBvcnQgZnVuY3Rpb24gcmVzaXplR0xDb250ZXh0KGdsLCBvcHRpb25zID0ge30pIHtcbiAgaWYgKGdsLmNhbnZhcykge1xuICAgIGNvbnN0IGRldmljZVBpeGVsUmF0aW8gPSBnZXREZXZpY2VQaXhlbFJhdGlvKG9wdGlvbnMudXNlRGV2aWNlUGl4ZWxzKTtcbiAgICBzZXREZXZpY2VQaXhlbFJhdGlvKGdsLCBkZXZpY2VQaXhlbFJhdGlvLCBvcHRpb25zKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBleHQgPSBnbC5nZXRFeHRlbnNpb24oJ1NUQUNLR0xfcmVzaXplX2RyYXdpbmdidWZmZXInKTtcblxuICBpZiAoZXh0ICYmIGB3aWR0aGAgaW4gb3B0aW9ucyAmJiBgaGVpZ2h0YCBpbiBvcHRpb25zKSB7XG4gICAgZXh0LnJlc2l6ZShvcHRpb25zLndpZHRoLCBvcHRpb25zLmhlaWdodCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlQnJvd3NlckNvbnRleHQoY2FudmFzLCBvcHRpb25zKSB7XG4gIGNvbnN0IHtcbiAgICBvbkVycm9yXG4gIH0gPSBvcHRpb25zO1xuICBsZXQgZXJyb3JNZXNzYWdlID0gbnVsbDtcblxuICBjb25zdCBvbkNyZWF0ZUVycm9yID0gZXJyb3IgPT4gZXJyb3JNZXNzYWdlID0gZXJyb3Iuc3RhdHVzTWVzc2FnZSB8fCBlcnJvck1lc3NhZ2U7XG5cbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3dlYmdsY29udGV4dGNyZWF0aW9uZXJyb3InLCBvbkNyZWF0ZUVycm9yLCBmYWxzZSk7XG4gIGNvbnN0IHtcbiAgICB3ZWJnbDEgPSB0cnVlLFxuICAgIHdlYmdsMiA9IHRydWVcbiAgfSA9IG9wdGlvbnM7XG4gIGxldCBnbCA9IG51bGw7XG5cbiAgaWYgKHdlYmdsMikge1xuICAgIGdsID0gZ2wgfHwgY2FudmFzLmdldENvbnRleHQoJ3dlYmdsMicsIG9wdGlvbnMpO1xuICAgIGdsID0gZ2wgfHwgY2FudmFzLmdldENvbnRleHQoJ2V4cGVyaW1lbnRhbC13ZWJnbDInLCBvcHRpb25zKTtcbiAgfVxuXG4gIGlmICh3ZWJnbDEpIHtcbiAgICBnbCA9IGdsIHx8IGNhbnZhcy5nZXRDb250ZXh0KCd3ZWJnbCcsIG9wdGlvbnMpO1xuICAgIGdsID0gZ2wgfHwgY2FudmFzLmdldENvbnRleHQoJ2V4cGVyaW1lbnRhbC13ZWJnbCcsIG9wdGlvbnMpO1xuICB9XG5cbiAgY2FudmFzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3dlYmdsY29udGV4dGNyZWF0aW9uZXJyb3InLCBvbkNyZWF0ZUVycm9yLCBmYWxzZSk7XG5cbiAgaWYgKCFnbCkge1xuICAgIHJldHVybiBvbkVycm9yKGBGYWlsZWQgdG8gY3JlYXRlICR7d2ViZ2wyICYmICF3ZWJnbDEgPyAnV2ViR0wyJyA6ICdXZWJHTCd9IGNvbnRleHQ6ICR7ZXJyb3JNZXNzYWdlIHx8ICdVbmtub3duIGVycm9yJ31gKTtcbiAgfVxuXG4gIGlmIChvcHRpb25zLm9uQ29udGV4dExvc3QpIHtcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignd2ViZ2xjb250ZXh0bG9zdCcsIG9wdGlvbnMub25Db250ZXh0TG9zdCwgZmFsc2UpO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMub25Db250ZXh0UmVzdG9yZWQpIHtcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignd2ViZ2xjb250ZXh0cmVzdG9yZWQnLCBvcHRpb25zLm9uQ29udGV4dFJlc3RvcmVkLCBmYWxzZSk7XG4gIH1cblxuICByZXR1cm4gZ2w7XG59XG5cbmZ1bmN0aW9uIGdldENhbnZhcyh7XG4gIGNhbnZhcyxcbiAgd2lkdGggPSA4MDAsXG4gIGhlaWdodCA9IDYwMCxcbiAgb25FcnJvclxufSkge1xuICBsZXQgdGFyZ2V0Q2FudmFzO1xuXG4gIGlmICh0eXBlb2YgY2FudmFzID09PSAnc3RyaW5nJykge1xuICAgIGNvbnN0IGlzUGFnZUxvYWRlZCA9IGlzUGFnZSAmJiBkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnO1xuXG4gICAgaWYgKCFpc1BhZ2VMb2FkZWQpIHtcbiAgICAgIG9uRXJyb3IoYGNyZWF0ZUdMQ29udGV4dCBjYWxsZWQgb24gY2FudmFzICcke2NhbnZhc30nIGJlZm9yZSBwYWdlIHdhcyBsb2FkZWRgKTtcbiAgICB9XG5cbiAgICB0YXJnZXRDYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjYW52YXMpO1xuICB9IGVsc2UgaWYgKGNhbnZhcykge1xuICAgIHRhcmdldENhbnZhcyA9IGNhbnZhcztcbiAgfSBlbHNlIHtcbiAgICB0YXJnZXRDYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICB0YXJnZXRDYW52YXMuaWQgPSAnbHVtYWdsLWNhbnZhcyc7XG4gICAgdGFyZ2V0Q2FudmFzLnN0eWxlLndpZHRoID0gTnVtYmVyLmlzRmluaXRlKHdpZHRoKSA/IGAke3dpZHRofXB4YCA6ICcxMDAlJztcbiAgICB0YXJnZXRDYW52YXMuc3R5bGUuaGVpZ2h0ID0gTnVtYmVyLmlzRmluaXRlKGhlaWdodCkgPyBgJHtoZWlnaHR9cHhgIDogJzEwMCUnO1xuICAgIGRvY3VtZW50LmJvZHkuaW5zZXJ0QmVmb3JlKHRhcmdldENhbnZhcywgZG9jdW1lbnQuYm9keS5maXJzdENoaWxkKTtcbiAgfVxuXG4gIHJldHVybiB0YXJnZXRDYW52YXM7XG59XG5cbmZ1bmN0aW9uIGxvZ0luZm8oZ2wpIHtcbiAgY29uc3Qgd2ViR0wgPSBpc1dlYkdMMihnbCkgPyAnV2ViR0wyJyA6ICdXZWJHTDEnO1xuICBjb25zdCBpbmZvID0gZ2V0Q29udGV4dERlYnVnSW5mbyhnbCk7XG4gIGNvbnN0IGRyaXZlciA9IGluZm8gPyBgKCR7aW5mby52ZW5kb3J9LCR7aW5mby5yZW5kZXJlcn0pYCA6ICcnO1xuICBjb25zdCBkZWJ1ZyA9IGdsLmRlYnVnID8gJyBkZWJ1ZycgOiAnJztcbiAgbG9nLmluZm8oMSwgYCR7d2ViR0x9JHtkZWJ1Z30gY29udGV4dCAke2RyaXZlcn1gKSgpO1xufVxuXG5mdW5jdGlvbiBnZXRWZXJzaW9uKGdsKSB7XG4gIGlmICh0eXBlb2YgV2ViR0wyUmVuZGVyaW5nQ29udGV4dCAhPT0gJ3VuZGVmaW5lZCcgJiYgZ2wgaW5zdGFuY2VvZiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0KSB7XG4gICAgcmV0dXJuIDI7XG4gIH1cblxuICByZXR1cm4gMTtcbn1cblxuZnVuY3Rpb24gc2V0RGV2aWNlUGl4ZWxSYXRpbyhnbCwgZGV2aWNlUGl4ZWxSYXRpbywgb3B0aW9ucykge1xuICBsZXQgY2xpZW50V2lkdGggPSAnd2lkdGgnIGluIG9wdGlvbnMgPyBvcHRpb25zLndpZHRoIDogZ2wuY2FudmFzLmNsaWVudFdpZHRoO1xuICBsZXQgY2xpZW50SGVpZ2h0ID0gJ2hlaWdodCcgaW4gb3B0aW9ucyA/IG9wdGlvbnMuaGVpZ2h0IDogZ2wuY2FudmFzLmNsaWVudEhlaWdodDtcblxuICBpZiAoIWNsaWVudFdpZHRoIHx8ICFjbGllbnRIZWlnaHQpIHtcbiAgICBsb2cubG9nKDEsICdDYW52YXMgY2xpZW50V2lkdGgvY2xpZW50SGVpZ2h0IGlzIDAnKSgpO1xuICAgIGRldmljZVBpeGVsUmF0aW8gPSAxO1xuICAgIGNsaWVudFdpZHRoID0gZ2wuY2FudmFzLndpZHRoIHx8IDE7XG4gICAgY2xpZW50SGVpZ2h0ID0gZ2wuY2FudmFzLmhlaWdodCB8fCAxO1xuICB9XG5cbiAgZ2wubHVtYSA9IGdsLmx1bWEgfHwge307XG4gIGdsLmx1bWEuY2FudmFzU2l6ZUluZm8gPSBnbC5sdW1hLmNhbnZhc1NpemVJbmZvIHx8IHt9O1xuICBjb25zdCBjYWNoZWRTaXplID0gZ2wubHVtYS5jYW52YXNTaXplSW5mbztcblxuICBpZiAoY2FjaGVkU2l6ZS5jbGllbnRXaWR0aCAhPT0gY2xpZW50V2lkdGggfHwgY2FjaGVkU2l6ZS5jbGllbnRIZWlnaHQgIT09IGNsaWVudEhlaWdodCB8fCBjYWNoZWRTaXplLmRldmljZVBpeGVsUmF0aW8gIT09IGRldmljZVBpeGVsUmF0aW8pIHtcbiAgICBsZXQgY2xhbXBlZFBpeGVsUmF0aW8gPSBkZXZpY2VQaXhlbFJhdGlvO1xuICAgIGNvbnN0IGNhbnZhc1dpZHRoID0gTWF0aC5mbG9vcihjbGllbnRXaWR0aCAqIGNsYW1wZWRQaXhlbFJhdGlvKTtcbiAgICBjb25zdCBjYW52YXNIZWlnaHQgPSBNYXRoLmZsb29yKGNsaWVudEhlaWdodCAqIGNsYW1wZWRQaXhlbFJhdGlvKTtcbiAgICBnbC5jYW52YXMud2lkdGggPSBjYW52YXNXaWR0aDtcbiAgICBnbC5jYW52YXMuaGVpZ2h0ID0gY2FudmFzSGVpZ2h0O1xuXG4gICAgaWYgKGdsLmRyYXdpbmdCdWZmZXJXaWR0aCAhPT0gY2FudmFzV2lkdGggfHwgZ2wuZHJhd2luZ0J1ZmZlckhlaWdodCAhPT0gY2FudmFzSGVpZ2h0KSB7XG4gICAgICBsb2cud2FybihgRGV2aWNlIHBpeGVsIHJhdGlvIGNsYW1wZWRgKSgpO1xuICAgICAgY2xhbXBlZFBpeGVsUmF0aW8gPSBNYXRoLm1pbihnbC5kcmF3aW5nQnVmZmVyV2lkdGggLyBjbGllbnRXaWR0aCwgZ2wuZHJhd2luZ0J1ZmZlckhlaWdodCAvIGNsaWVudEhlaWdodCk7XG4gICAgICBnbC5jYW52YXMud2lkdGggPSBNYXRoLmZsb29yKGNsaWVudFdpZHRoICogY2xhbXBlZFBpeGVsUmF0aW8pO1xuICAgICAgZ2wuY2FudmFzLmhlaWdodCA9IE1hdGguZmxvb3IoY2xpZW50SGVpZ2h0ICogY2xhbXBlZFBpeGVsUmF0aW8pO1xuICAgIH1cblxuICAgIE9iamVjdC5hc3NpZ24oZ2wubHVtYS5jYW52YXNTaXplSW5mbywge1xuICAgICAgY2xpZW50V2lkdGgsXG4gICAgICBjbGllbnRIZWlnaHQsXG4gICAgICBkZXZpY2VQaXhlbFJhdGlvXG4gICAgfSk7XG4gIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvbnRleHQuanMubWFwIiwiZXhwb3J0IHsgbG9nIH0gZnJvbSAnLi91dGlscy9sb2cnO1xuZXhwb3J0IHsgaXNXZWJHTCwgaXNXZWJHTDIsIGdldFdlYkdMMkNvbnRleHQsIGFzc2VydFdlYkdMQ29udGV4dCwgYXNzZXJ0V2ViR0wyQ29udGV4dCB9IGZyb20gJy4vdXRpbHMvd2ViZ2wtY2hlY2tzJztcbmV4cG9ydCB7IHBvbHlmaWxsQ29udGV4dCB9IGZyb20gJy4vcG9seWZpbGwvcG9seWZpbGwtY29udGV4dCc7XG5leHBvcnQgeyBnZXRQYXJhbWV0ZXJzLCBzZXRQYXJhbWV0ZXJzLCByZXNldFBhcmFtZXRlcnMsIHdpdGhQYXJhbWV0ZXJzIH0gZnJvbSAnLi9zdGF0ZS10cmFja2VyL3VuaWZpZWQtcGFyYW1ldGVyLWFwaSc7XG5leHBvcnQgeyB0cmFja0NvbnRleHRTdGF0ZSwgcHVzaENvbnRleHRTdGF0ZSwgcG9wQ29udGV4dFN0YXRlIH0gZnJvbSAnLi9zdGF0ZS10cmFja2VyL3RyYWNrLWNvbnRleHQtc3RhdGUnO1xuZXhwb3J0IHsgY3JlYXRlR0xDb250ZXh0LCByZXNpemVHTENvbnRleHQsIGluc3RydW1lbnRHTENvbnRleHQsIGdldENvbnRleHREZWJ1Z0luZm8gfSBmcm9tICcuL2NvbnRleHQvY29udGV4dCc7XG5leHBvcnQgeyBjc3NUb0RldmljZVJhdGlvLCBjc3NUb0RldmljZVBpeGVscyB9IGZyb20gJy4vdXRpbHMvZGV2aWNlLXBpeGVscyc7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiLCJpbXBvcnQgeyBpc1dlYkdMMiB9IGZyb20gJy4uL3V0aWxzL3dlYmdsLWNoZWNrcyc7XG5jb25zdCBPRVNfZWxlbWVudF9pbmRleCA9ICdPRVNfZWxlbWVudF9pbmRleCc7XG5jb25zdCBXRUJHTF9kcmF3X2J1ZmZlcnMgPSAnV0VCR0xfZHJhd19idWZmZXJzJztcbmNvbnN0IEVYVF9kaXNqb2ludF90aW1lcl9xdWVyeSA9ICdFWFRfZGlzam9pbnRfdGltZXJfcXVlcnknO1xuY29uc3QgRVhUX2Rpc2pvaW50X3RpbWVyX3F1ZXJ5X3dlYmdsMiA9ICdFWFRfZGlzam9pbnRfdGltZXJfcXVlcnlfd2ViZ2wyJztcbmNvbnN0IEVYVF90ZXh0dXJlX2ZpbHRlcl9hbmlzb3Ryb3BpYyA9ICdFWFRfdGV4dHVyZV9maWx0ZXJfYW5pc290cm9waWMnO1xuY29uc3QgV0VCR0xfZGVidWdfcmVuZGVyZXJfaW5mbyA9ICdXRUJHTF9kZWJ1Z19yZW5kZXJlcl9pbmZvJztcbmNvbnN0IEdMX0ZSQUdNRU5UX1NIQURFUl9ERVJJVkFUSVZFX0hJTlQgPSAweDhiOGI7XG5jb25zdCBHTF9ET05UX0NBUkUgPSAweDExMDA7XG5jb25zdCBHTF9HUFVfRElTSk9JTlRfRVhUID0gMHg4ZmJiO1xuY29uc3QgR0xfTUFYX1RFWFRVUkVfTUFYX0FOSVNPVFJPUFlfRVhUID0gMHg4NGZmO1xuY29uc3QgR0xfVU5NQVNLRURfVkVORE9SX1dFQkdMID0gMHg5MjQ1O1xuY29uc3QgR0xfVU5NQVNLRURfUkVOREVSRVJfV0VCR0wgPSAweDkyNDY7XG5cbmNvbnN0IGdldFdlYkdMMlZhbHVlT3JaZXJvID0gZ2wgPT4gIWlzV2ViR0wyKGdsKSA/IDAgOiB1bmRlZmluZWQ7XG5cbmNvbnN0IFdFQkdMX1BBUkFNRVRFUlMgPSB7XG4gIFszMDc0XTogZ2wgPT4gIWlzV2ViR0wyKGdsKSA/IDM2MDY0IDogdW5kZWZpbmVkLFxuICBbR0xfRlJBR01FTlRfU0hBREVSX0RFUklWQVRJVkVfSElOVF06IGdsID0+ICFpc1dlYkdMMihnbCkgPyBHTF9ET05UX0NBUkUgOiB1bmRlZmluZWQsXG4gIFszNTk3N106IGdldFdlYkdMMlZhbHVlT3JaZXJvLFxuICBbMzI5MzddOiBnZXRXZWJHTDJWYWx1ZU9yWmVybyxcbiAgW0dMX0dQVV9ESVNKT0lOVF9FWFRdOiAoZ2wsIGdldFBhcmFtZXRlcikgPT4ge1xuICAgIGNvbnN0IGV4dCA9IGlzV2ViR0wyKGdsKSA/IGdsLmdldEV4dGVuc2lvbihFWFRfZGlzam9pbnRfdGltZXJfcXVlcnlfd2ViZ2wyKSA6IGdsLmdldEV4dGVuc2lvbihFWFRfZGlzam9pbnRfdGltZXJfcXVlcnkpO1xuICAgIHJldHVybiBleHQgJiYgZXh0LkdQVV9ESVNKT0lOVF9FWFQgPyBnZXRQYXJhbWV0ZXIoZXh0LkdQVV9ESVNKT0lOVF9FWFQpIDogMDtcbiAgfSxcbiAgW0dMX1VOTUFTS0VEX1ZFTkRPUl9XRUJHTF06IChnbCwgZ2V0UGFyYW1ldGVyKSA9PiB7XG4gICAgY29uc3QgZXh0ID0gZ2wuZ2V0RXh0ZW5zaW9uKFdFQkdMX2RlYnVnX3JlbmRlcmVyX2luZm8pO1xuICAgIHJldHVybiBnZXRQYXJhbWV0ZXIoZXh0ICYmIGV4dC5VTk1BU0tFRF9WRU5ET1JfV0VCR0wgfHwgNzkzNik7XG4gIH0sXG4gIFtHTF9VTk1BU0tFRF9SRU5ERVJFUl9XRUJHTF06IChnbCwgZ2V0UGFyYW1ldGVyKSA9PiB7XG4gICAgY29uc3QgZXh0ID0gZ2wuZ2V0RXh0ZW5zaW9uKFdFQkdMX2RlYnVnX3JlbmRlcmVyX2luZm8pO1xuICAgIHJldHVybiBnZXRQYXJhbWV0ZXIoZXh0ICYmIGV4dC5VTk1BU0tFRF9SRU5ERVJFUl9XRUJHTCB8fCA3OTM3KTtcbiAgfSxcbiAgW0dMX01BWF9URVhUVVJFX01BWF9BTklTT1RST1BZX0VYVF06IChnbCwgZ2V0UGFyYW1ldGVyKSA9PiB7XG4gICAgY29uc3QgZXh0ID0gZ2wubHVtYS5leHRlbnNpb25zW0VYVF90ZXh0dXJlX2ZpbHRlcl9hbmlzb3Ryb3BpY107XG4gICAgcmV0dXJuIGV4dCA/IGdldFBhcmFtZXRlcihleHQuTUFYX1RFWFRVUkVfTUFYX0FOSVNPVFJPUFlfRVhUKSA6IDEuMDtcbiAgfSxcbiAgWzMyODgzXTogZ2V0V2ViR0wyVmFsdWVPclplcm8sXG4gIFszNTA3MV06IGdldFdlYkdMMlZhbHVlT3JaZXJvLFxuICBbMzc0NDddOiBnZXRXZWJHTDJWYWx1ZU9yWmVybyxcbiAgWzM2MDYzXTogKGdsLCBnZXRQYXJhbWV0ZXIpID0+IHtcbiAgICBpZiAoIWlzV2ViR0wyKGdsKSkge1xuICAgICAgY29uc3QgZXh0ID0gZ2wuZ2V0RXh0ZW5zaW9uKFdFQkdMX2RyYXdfYnVmZmVycyk7XG4gICAgICByZXR1cm4gZXh0ID8gZ2V0UGFyYW1ldGVyKGV4dC5NQVhfQ09MT1JfQVRUQUNITUVOVFNfV0VCR0wpIDogMDtcbiAgICB9XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9LFxuICBbMzUzNzldOiBnZXRXZWJHTDJWYWx1ZU9yWmVybyxcbiAgWzM1Mzc0XTogZ2V0V2ViR0wyVmFsdWVPclplcm8sXG4gIFszNTM3N106IGdldFdlYkdMMlZhbHVlT3JaZXJvLFxuICBbMzQ4NTJdOiBnbCA9PiB7XG4gICAgaWYgKCFpc1dlYkdMMihnbCkpIHtcbiAgICAgIGNvbnN0IGV4dCA9IGdsLmdldEV4dGVuc2lvbihXRUJHTF9kcmF3X2J1ZmZlcnMpO1xuICAgICAgcmV0dXJuIGV4dCA/IGV4dC5NQVhfRFJBV19CVUZGRVJTX1dFQkdMIDogMDtcbiAgICB9XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9LFxuICBbMzYyMDNdOiBnbCA9PiBnbC5nZXRFeHRlbnNpb24oT0VTX2VsZW1lbnRfaW5kZXgpID8gMjE0NzQ4MzY0NyA6IDY1NTM1LFxuICBbMzMwMDFdOiBnbCA9PiBnbC5nZXRFeHRlbnNpb24oT0VTX2VsZW1lbnRfaW5kZXgpID8gMTY3NzcyMTYgOiA2NTUzNSxcbiAgWzMzMDAwXTogZ2wgPT4gMTY3NzcyMTYsXG4gIFszNzE1N106IGdldFdlYkdMMlZhbHVlT3JaZXJvLFxuICBbMzUzNzNdOiBnZXRXZWJHTDJWYWx1ZU9yWmVybyxcbiAgWzM1NjU3XTogZ2V0V2ViR0wyVmFsdWVPclplcm8sXG4gIFszNjE4M106IGdldFdlYkdMMlZhbHVlT3JaZXJvLFxuICBbMzcxMzddOiBnZXRXZWJHTDJWYWx1ZU9yWmVybyxcbiAgWzM0MDQ1XTogZ2V0V2ViR0wyVmFsdWVPclplcm8sXG4gIFszNTk3OF06IGdldFdlYkdMMlZhbHVlT3JaZXJvLFxuICBbMzU5NzldOiBnZXRXZWJHTDJWYWx1ZU9yWmVybyxcbiAgWzM1OTY4XTogZ2V0V2ViR0wyVmFsdWVPclplcm8sXG4gIFszNTM3Nl06IGdldFdlYkdMMlZhbHVlT3JaZXJvLFxuICBbMzUzNzVdOiBnZXRXZWJHTDJWYWx1ZU9yWmVybyxcbiAgWzM1NjU5XTogZ2V0V2ViR0wyVmFsdWVPclplcm8sXG4gIFszNzE1NF06IGdldFdlYkdMMlZhbHVlT3JaZXJvLFxuICBbMzUzNzFdOiBnZXRXZWJHTDJWYWx1ZU9yWmVybyxcbiAgWzM1NjU4XTogZ2V0V2ViR0wyVmFsdWVPclplcm8sXG4gIFszNTA3Nl06IGdldFdlYkdMMlZhbHVlT3JaZXJvLFxuICBbMzUwNzddOiBnZXRXZWJHTDJWYWx1ZU9yWmVybyxcbiAgWzM1MzgwXTogZ2V0V2ViR0wyVmFsdWVPclplcm9cbn07XG5leHBvcnQgZnVuY3Rpb24gZ2V0UGFyYW1ldGVyUG9seWZpbGwoZ2wsIG9yaWdpbmFsR2V0UGFyYW1ldGVyLCBwbmFtZSkge1xuICBjb25zdCBsaW1pdCA9IFdFQkdMX1BBUkFNRVRFUlNbcG5hbWVdO1xuICBjb25zdCB2YWx1ZSA9IHR5cGVvZiBsaW1pdCA9PT0gJ2Z1bmN0aW9uJyA/IGxpbWl0KGdsLCBvcmlnaW5hbEdldFBhcmFtZXRlciwgcG5hbWUpIDogbGltaXQ7XG4gIGNvbnN0IHJlc3VsdCA9IHZhbHVlICE9PSB1bmRlZmluZWQgPyB2YWx1ZSA6IG9yaWdpbmFsR2V0UGFyYW1ldGVyKHBuYW1lKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWdldC1wYXJhbWV0ZXItcG9seWZpbGwuanMubWFwIiwiaW1wb3J0IHsgcG9seWZpbGxWZXJ0ZXhBcnJheU9iamVjdCB9IGZyb20gJy4vcG9seWZpbGwtdmVydGV4LWFycmF5LW9iamVjdCc7XG5pbXBvcnQgeyBhc3NlcnQgfSBmcm9tICcuLi91dGlscy9hc3NlcnQnO1xuaW1wb3J0IHsgV0VCR0wyX0NPTlRFWFRfUE9MWUZJTExTLCBXRUJHTDJfQ09OVEVYVF9PVkVSUklERVMgfSBmcm9tICcuL3BvbHlmaWxsLXRhYmxlJztcbmV4cG9ydCBmdW5jdGlvbiBwb2x5ZmlsbENvbnRleHQoZ2wpIHtcbiAgZ2wubHVtYSA9IGdsLmx1bWEgfHwge307XG4gIGNvbnN0IHtcbiAgICBsdW1hXG4gIH0gPSBnbDtcblxuICBpZiAoIWx1bWEucG9seWZpbGxlZCkge1xuICAgIHBvbHlmaWxsVmVydGV4QXJyYXlPYmplY3QoZ2wpO1xuICAgIGluaXRpYWxpemVFeHRlbnNpb25zKGdsKTtcbiAgICBpbnN0YWxsUG9seWZpbGxzKGdsLCBXRUJHTDJfQ09OVEVYVF9QT0xZRklMTFMpO1xuICAgIGluc3RhbGxPdmVycmlkZXMoZ2wsIHtcbiAgICAgIHRhcmdldDogbHVtYSxcbiAgICAgIHRhcmdldDI6IGdsXG4gICAgfSk7XG4gICAgbHVtYS5wb2x5ZmlsbGVkID0gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBnbDtcbn1cbmNvbnN0IGdsb2JhbF8gPSB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbCA6IHdpbmRvdztcbmdsb2JhbF8ucG9seWZpbGxDb250ZXh0ID0gcG9seWZpbGxDb250ZXh0O1xuXG5mdW5jdGlvbiBpbml0aWFsaXplRXh0ZW5zaW9ucyhnbCkge1xuICBnbC5sdW1hLmV4dGVuc2lvbnMgPSB7fTtcbiAgY29uc3QgRVhURU5TSU9OUyA9IGdsLmdldFN1cHBvcnRlZEV4dGVuc2lvbnMoKSB8fCBbXTtcblxuICBmb3IgKGNvbnN0IGV4dGVuc2lvbiBvZiBFWFRFTlNJT05TKSB7XG4gICAgZ2wubHVtYVtleHRlbnNpb25dID0gZ2wuZ2V0RXh0ZW5zaW9uKGV4dGVuc2lvbik7XG4gIH1cbn1cblxuZnVuY3Rpb24gaW5zdGFsbE92ZXJyaWRlcyhnbCwge1xuICB0YXJnZXQsXG4gIHRhcmdldDJcbn0pIHtcbiAgT2JqZWN0LmtleXMoV0VCR0wyX0NPTlRFWFRfT1ZFUlJJREVTKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgaWYgKHR5cGVvZiBXRUJHTDJfQ09OVEVYVF9PVkVSUklERVNba2V5XSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc3Qgb3JpZ2luYWxGdW5jID0gZ2xba2V5XSA/IGdsW2tleV0uYmluZChnbCkgOiAoKSA9PiB7fTtcbiAgICAgIGNvbnN0IHBvbHlmaWxsID0gV0VCR0wyX0NPTlRFWFRfT1ZFUlJJREVTW2tleV0uYmluZChudWxsLCBnbCwgb3JpZ2luYWxGdW5jKTtcbiAgICAgIHRhcmdldFtrZXldID0gcG9seWZpbGw7XG4gICAgICB0YXJnZXQyW2tleV0gPSBwb2x5ZmlsbDtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBpbnN0YWxsUG9seWZpbGxzKGdsLCBwb2x5ZmlsbHMpIHtcbiAgZm9yIChjb25zdCBleHRlbnNpb24gb2YgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMocG9seWZpbGxzKSkge1xuICAgIGlmIChleHRlbnNpb24gIT09ICdvdmVycmlkZXMnKSB7XG4gICAgICBwb2x5ZmlsbEV4dGVuc2lvbihnbCwge1xuICAgICAgICBleHRlbnNpb24sXG4gICAgICAgIHRhcmdldDogZ2wubHVtYSxcbiAgICAgICAgdGFyZ2V0MjogZ2xcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBwb2x5ZmlsbEV4dGVuc2lvbihnbCwge1xuICBleHRlbnNpb24sXG4gIHRhcmdldCxcbiAgdGFyZ2V0MlxufSkge1xuICBjb25zdCBkZWZhdWx0cyA9IFdFQkdMMl9DT05URVhUX1BPTFlGSUxMU1tleHRlbnNpb25dO1xuICBhc3NlcnQoZGVmYXVsdHMpO1xuICBjb25zdCB7XG4gICAgbWV0YSA9IHt9XG4gIH0gPSBkZWZhdWx0cztcbiAgY29uc3Qge1xuICAgIHN1ZmZpeCA9ICcnXG4gIH0gPSBtZXRhO1xuICBjb25zdCBleHQgPSBnbC5nZXRFeHRlbnNpb24oZXh0ZW5zaW9uKTtcblxuICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhkZWZhdWx0cykpIHtcbiAgICBjb25zdCBleHRLZXkgPSBgJHtrZXl9JHtzdWZmaXh9YDtcbiAgICBsZXQgcG9seWZpbGwgPSBudWxsO1xuXG4gICAgaWYgKGtleSA9PT0gJ21ldGEnKSB7fSBlbHNlIGlmICh0eXBlb2YgZ2xba2V5XSA9PT0gJ2Z1bmN0aW9uJykge30gZWxzZSBpZiAoZXh0ICYmIHR5cGVvZiBleHRbZXh0S2V5XSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcG9seWZpbGwgPSAoLi4uYXJncykgPT4gZXh0W2V4dEtleV0oLi4uYXJncyk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZGVmYXVsdHNba2V5XSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcG9seWZpbGwgPSBkZWZhdWx0c1trZXldLmJpbmQodGFyZ2V0KTtcbiAgICB9XG5cbiAgICBpZiAocG9seWZpbGwpIHtcbiAgICAgIHRhcmdldFtrZXldID0gcG9seWZpbGw7XG4gICAgICB0YXJnZXQyW2tleV0gPSBwb2x5ZmlsbDtcbiAgICB9XG4gIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBvbHlmaWxsLWNvbnRleHQuanMubWFwIiwiaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSAnLi4vdXRpbHMvYXNzZXJ0JztcbmltcG9ydCB7IGlzV2ViR0wyIH0gZnJvbSAnLi4vdXRpbHMvd2ViZ2wtY2hlY2tzJztcbmltcG9ydCB7IGdldFBhcmFtZXRlclBvbHlmaWxsIH0gZnJvbSAnLi9nZXQtcGFyYW1ldGVyLXBvbHlmaWxsJztcbmNvbnN0IE9FU192ZXJ0ZXhfYXJyYXlfb2JqZWN0ID0gJ09FU192ZXJ0ZXhfYXJyYXlfb2JqZWN0JztcbmNvbnN0IEFOR0xFX2luc3RhbmNlZF9hcnJheXMgPSAnQU5HTEVfaW5zdGFuY2VkX2FycmF5cyc7XG5jb25zdCBXRUJHTF9kcmF3X2J1ZmZlcnMgPSAnV0VCR0xfZHJhd19idWZmZXJzJztcbmNvbnN0IEVYVF9kaXNqb2ludF90aW1lcl9xdWVyeSA9ICdFWFRfZGlzam9pbnRfdGltZXJfcXVlcnknO1xuY29uc3QgRVhUX3RleHR1cmVfZmlsdGVyX2FuaXNvdHJvcGljID0gJ0VYVF90ZXh0dXJlX2ZpbHRlcl9hbmlzb3Ryb3BpYyc7XG5jb25zdCBFUlJfVkFPX05PVF9TVVBQT1JURUQgPSAnVmVydGV4QXJyYXkgcmVxdWlyZXMgV2ViR0wyIG9yIE9FU192ZXJ0ZXhfYXJyYXlfb2JqZWN0IGV4dGVuc2lvbic7XG5cbmZ1bmN0aW9uIGdldEV4dGVuc2lvbkRhdGEoZ2wsIGV4dGVuc2lvbikge1xuICByZXR1cm4ge1xuICAgIHdlYmdsMjogaXNXZWJHTDIoZ2wpLFxuICAgIGV4dDogZ2wuZ2V0RXh0ZW5zaW9uKGV4dGVuc2lvbilcbiAgfTtcbn1cblxuZXhwb3J0IGNvbnN0IFdFQkdMMl9DT05URVhUX1BPTFlGSUxMUyA9IHtcbiAgW09FU192ZXJ0ZXhfYXJyYXlfb2JqZWN0XToge1xuICAgIG1ldGE6IHtcbiAgICAgIHN1ZmZpeDogJ09FUydcbiAgICB9LFxuICAgIGNyZWF0ZVZlcnRleEFycmF5OiAoKSA9PiB7XG4gICAgICBhc3NlcnQoZmFsc2UsIEVSUl9WQU9fTk9UX1NVUFBPUlRFRCk7XG4gICAgfSxcbiAgICBkZWxldGVWZXJ0ZXhBcnJheTogKCkgPT4ge30sXG4gICAgYmluZFZlcnRleEFycmF5OiAoKSA9PiB7fSxcbiAgICBpc1ZlcnRleEFycmF5OiAoKSA9PiBmYWxzZVxuICB9LFxuICBbQU5HTEVfaW5zdGFuY2VkX2FycmF5c106IHtcbiAgICBtZXRhOiB7XG4gICAgICBzdWZmaXg6ICdBTkdMRSdcbiAgICB9LFxuXG4gICAgdmVydGV4QXR0cmliRGl2aXNvcihsb2NhdGlvbiwgZGl2aXNvcikge1xuICAgICAgYXNzZXJ0KGRpdmlzb3IgPT09IDAsICdXZWJHTCBpbnN0YW5jZWQgcmVuZGVyaW5nIG5vdCBzdXBwb3J0ZWQnKTtcbiAgICB9LFxuXG4gICAgZHJhd0VsZW1lbnRzSW5zdGFuY2VkOiAoKSA9PiB7fSxcbiAgICBkcmF3QXJyYXlzSW5zdGFuY2VkOiAoKSA9PiB7fVxuICB9LFxuICBbV0VCR0xfZHJhd19idWZmZXJzXToge1xuICAgIG1ldGE6IHtcbiAgICAgIHN1ZmZpeDogJ1dFQkdMJ1xuICAgIH0sXG4gICAgZHJhd0J1ZmZlcnM6ICgpID0+IHtcbiAgICAgIGFzc2VydChmYWxzZSk7XG4gICAgfVxuICB9LFxuICBbRVhUX2Rpc2pvaW50X3RpbWVyX3F1ZXJ5XToge1xuICAgIG1ldGE6IHtcbiAgICAgIHN1ZmZpeDogJ0VYVCdcbiAgICB9LFxuICAgIGNyZWF0ZVF1ZXJ5OiAoKSA9PiB7XG4gICAgICBhc3NlcnQoZmFsc2UpO1xuICAgIH0sXG4gICAgZGVsZXRlUXVlcnk6ICgpID0+IHtcbiAgICAgIGFzc2VydChmYWxzZSk7XG4gICAgfSxcbiAgICBiZWdpblF1ZXJ5OiAoKSA9PiB7XG4gICAgICBhc3NlcnQoZmFsc2UpO1xuICAgIH0sXG4gICAgZW5kUXVlcnk6ICgpID0+IHt9LFxuXG4gICAgZ2V0UXVlcnkoaGFuZGxlLCBwbmFtZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0UXVlcnlPYmplY3QoaGFuZGxlLCBwbmFtZSk7XG4gICAgfSxcblxuICAgIGdldFF1ZXJ5UGFyYW1ldGVyKGhhbmRsZSwgcG5hbWUpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFF1ZXJ5T2JqZWN0KGhhbmRsZSwgcG5hbWUpO1xuICAgIH0sXG5cbiAgICBnZXRRdWVyeU9iamVjdDogKCkgPT4ge31cbiAgfVxufTtcbmV4cG9ydCBjb25zdCBXRUJHTDJfQ09OVEVYVF9PVkVSUklERVMgPSB7XG4gIHJlYWRCdWZmZXI6IChnbCwgb3JpZ2luYWxGdW5jLCBhdHRhY2htZW50KSA9PiB7XG4gICAgaWYgKGlzV2ViR0wyKGdsKSkge1xuICAgICAgb3JpZ2luYWxGdW5jKGF0dGFjaG1lbnQpO1xuICAgIH0gZWxzZSB7fVxuICB9LFxuICBnZXRWZXJ0ZXhBdHRyaWI6IChnbCwgb3JpZ2luYWxGdW5jLCBsb2NhdGlvbiwgcG5hbWUpID0+IHtcbiAgICBjb25zdCB7XG4gICAgICB3ZWJnbDIsXG4gICAgICBleHRcbiAgICB9ID0gZ2V0RXh0ZW5zaW9uRGF0YShnbCwgQU5HTEVfaW5zdGFuY2VkX2FycmF5cyk7XG4gICAgbGV0IHJlc3VsdDtcblxuICAgIHN3aXRjaCAocG5hbWUpIHtcbiAgICAgIGNhc2UgMzUwNjk6XG4gICAgICAgIHJlc3VsdCA9ICF3ZWJnbDIgPyBmYWxzZSA6IHVuZGVmaW5lZDtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgMzUwNzA6XG4gICAgICAgIHJlc3VsdCA9ICF3ZWJnbDIgJiYgIWV4dCA/IDAgOiB1bmRlZmluZWQ7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQgIT09IHVuZGVmaW5lZCA/IHJlc3VsdCA6IG9yaWdpbmFsRnVuYyhsb2NhdGlvbiwgcG5hbWUpO1xuICB9LFxuICBnZXRQcm9ncmFtUGFyYW1ldGVyOiAoZ2wsIG9yaWdpbmFsRnVuYywgcHJvZ3JhbSwgcG5hbWUpID0+IHtcbiAgICBpZiAoIWlzV2ViR0wyKGdsKSkge1xuICAgICAgc3dpdGNoIChwbmFtZSkge1xuICAgICAgICBjYXNlIDM1OTY3OlxuICAgICAgICAgIHJldHVybiAzNTk4MTtcblxuICAgICAgICBjYXNlIDM1OTcxOlxuICAgICAgICAgIHJldHVybiAwO1xuXG4gICAgICAgIGNhc2UgMzUzODI6XG4gICAgICAgICAgcmV0dXJuIDA7XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb3JpZ2luYWxGdW5jKHByb2dyYW0sIHBuYW1lKTtcbiAgfSxcbiAgZ2V0SW50ZXJuYWxmb3JtYXRQYXJhbWV0ZXI6IChnbCwgb3JpZ2luYWxGdW5jLCB0YXJnZXQsIGZvcm1hdCwgcG5hbWUpID0+IHtcbiAgICBpZiAoIWlzV2ViR0wyKGdsKSkge1xuICAgICAgc3dpdGNoIChwbmFtZSkge1xuICAgICAgICBjYXNlIDMyOTM3OlxuICAgICAgICAgIHJldHVybiBuZXcgSW50MzJBcnJheShbMF0pO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGdsLmdldEludGVybmFsZm9ybWF0UGFyYW1ldGVyKHRhcmdldCwgZm9ybWF0LCBwbmFtZSk7XG4gIH0sXG5cbiAgZ2V0VGV4UGFyYW1ldGVyKGdsLCBvcmlnaW5hbEZ1bmMsIHRhcmdldCwgcG5hbWUpIHtcbiAgICBzd2l0Y2ggKHBuYW1lKSB7XG4gICAgICBjYXNlIDM0MDQ2OlxuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgZXh0ZW5zaW9uc1xuICAgICAgICB9ID0gZ2wubHVtYTtcbiAgICAgICAgY29uc3QgZXh0ID0gZXh0ZW5zaW9uc1tFWFRfdGV4dHVyZV9maWx0ZXJfYW5pc290cm9waWNdO1xuICAgICAgICBwbmFtZSA9IGV4dCAmJiBleHQuVEVYVFVSRV9NQVhfQU5JU09UUk9QWV9FWFQgfHwgMzQwNDY7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgIH1cblxuICAgIHJldHVybiBvcmlnaW5hbEZ1bmModGFyZ2V0LCBwbmFtZSk7XG4gIH0sXG5cbiAgZ2V0UGFyYW1ldGVyOiBnZXRQYXJhbWV0ZXJQb2x5ZmlsbCxcblxuICBoaW50KGdsLCBvcmlnaW5hbEZ1bmMsIHBuYW1lLCB2YWx1ZSkge1xuICAgIHJldHVybiBvcmlnaW5hbEZ1bmMocG5hbWUsIHZhbHVlKTtcbiAgfVxuXG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cG9seWZpbGwtdGFibGUuanMubWFwIiwiaW1wb3J0IHsgZ2xvYmFsIH0gZnJvbSAncHJvYmUuZ2wvZW52JztcbmNvbnN0IGdsRXJyb3JTaGFkb3cgPSB7fTtcblxuZnVuY3Rpb24gZXJyb3IobXNnKSB7XG4gIGlmIChnbG9iYWwuY29uc29sZSAmJiBnbG9iYWwuY29uc29sZS5lcnJvcikge1xuICAgIGdsb2JhbC5jb25zb2xlLmVycm9yKG1zZyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbG9nKG1zZykge1xuICBpZiAoZ2xvYmFsLmNvbnNvbGUgJiYgZ2xvYmFsLmNvbnNvbGUubG9nKSB7XG4gICAgZ2xvYmFsLmNvbnNvbGUubG9nKG1zZyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc3ludGhlc2l6ZUdMRXJyb3IoZXJyLCBvcHRfbXNnKSB7XG4gIGdsRXJyb3JTaGFkb3dbZXJyXSA9IHRydWU7XG5cbiAgaWYgKG9wdF9tc2cgIT09IHVuZGVmaW5lZCkge1xuICAgIGVycm9yKG9wdF9tc2cpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHdyYXBHTEVycm9yKGdsKSB7XG4gIGNvbnN0IGYgPSBnbC5nZXRFcnJvcjtcblxuICBnbC5nZXRFcnJvciA9IGZ1bmN0aW9uIGdldEVycm9yKCkge1xuICAgIGxldCBlcnI7XG5cbiAgICBkbyB7XG4gICAgICBlcnIgPSBmLmFwcGx5KGdsKTtcblxuICAgICAgaWYgKGVyciAhPT0gMCkge1xuICAgICAgICBnbEVycm9yU2hhZG93W2Vycl0gPSB0cnVlO1xuICAgICAgfVxuICAgIH0gd2hpbGUgKGVyciAhPT0gMCk7XG5cbiAgICBmb3IgKGVyciBpbiBnbEVycm9yU2hhZG93KSB7XG4gICAgICBpZiAoZ2xFcnJvclNoYWRvd1tlcnJdKSB7XG4gICAgICAgIGRlbGV0ZSBnbEVycm9yU2hhZG93W2Vycl07XG4gICAgICAgIHJldHVybiBwYXJzZUludChlcnIsIDEwKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gMDtcbiAgfTtcbn1cblxuY29uc3QgV2ViR0xWZXJ0ZXhBcnJheU9iamVjdE9FUyA9IGZ1bmN0aW9uIFdlYkdMVmVydGV4QXJyYXlPYmplY3RPRVMoZXh0KSB7XG4gIGNvbnN0IGdsID0gZXh0LmdsO1xuICB0aGlzLmV4dCA9IGV4dDtcbiAgdGhpcy5pc0FsaXZlID0gdHJ1ZTtcbiAgdGhpcy5oYXNCZWVuQm91bmQgPSBmYWxzZTtcbiAgdGhpcy5lbGVtZW50QXJyYXlCdWZmZXIgPSBudWxsO1xuICB0aGlzLmF0dHJpYnMgPSBuZXcgQXJyYXkoZXh0Lm1heFZlcnRleEF0dHJpYnMpO1xuXG4gIGZvciAobGV0IG4gPSAwOyBuIDwgdGhpcy5hdHRyaWJzLmxlbmd0aDsgbisrKSB7XG4gICAgY29uc3QgYXR0cmliID0gbmV3IFdlYkdMVmVydGV4QXJyYXlPYmplY3RPRVMuVmVydGV4QXR0cmliKGdsKTtcbiAgICB0aGlzLmF0dHJpYnNbbl0gPSBhdHRyaWI7XG4gIH1cblxuICB0aGlzLm1heEF0dHJpYiA9IDA7XG59O1xuXG5XZWJHTFZlcnRleEFycmF5T2JqZWN0T0VTLlZlcnRleEF0dHJpYiA9IGZ1bmN0aW9uIFZlcnRleEF0dHJpYihnbCkge1xuICB0aGlzLmVuYWJsZWQgPSBmYWxzZTtcbiAgdGhpcy5idWZmZXIgPSBudWxsO1xuICB0aGlzLnNpemUgPSA0O1xuICB0aGlzLnR5cGUgPSA1MTI2O1xuICB0aGlzLm5vcm1hbGl6ZWQgPSBmYWxzZTtcbiAgdGhpcy5zdHJpZGUgPSAxNjtcbiAgdGhpcy5vZmZzZXQgPSAwO1xuICB0aGlzLmNhY2hlZCA9ICcnO1xuICB0aGlzLnJlY2FjaGUoKTtcbn07XG5cbldlYkdMVmVydGV4QXJyYXlPYmplY3RPRVMuVmVydGV4QXR0cmliLnByb3RvdHlwZS5yZWNhY2hlID0gZnVuY3Rpb24gcmVjYWNoZSgpIHtcbiAgdGhpcy5jYWNoZWQgPSBbdGhpcy5zaXplLCB0aGlzLnR5cGUsIHRoaXMubm9ybWFsaXplZCwgdGhpcy5zdHJpZGUsIHRoaXMub2Zmc2V0XS5qb2luKCc6Jyk7XG59O1xuXG5jb25zdCBPRVNWZXJ0ZXhBcnJheU9iamVjdCA9IGZ1bmN0aW9uIE9FU1ZlcnRleEFycmF5T2JqZWN0KGdsKSB7XG4gIGNvbnN0IHNlbGYgPSB0aGlzO1xuICB0aGlzLmdsID0gZ2w7XG4gIHdyYXBHTEVycm9yKGdsKTtcbiAgY29uc3Qgb3JpZ2luYWwgPSB0aGlzLm9yaWdpbmFsID0ge1xuICAgIGdldFBhcmFtZXRlcjogZ2wuZ2V0UGFyYW1ldGVyLFxuICAgIGVuYWJsZVZlcnRleEF0dHJpYkFycmF5OiBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSxcbiAgICBkaXNhYmxlVmVydGV4QXR0cmliQXJyYXk6IGdsLmRpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheSxcbiAgICBiaW5kQnVmZmVyOiBnbC5iaW5kQnVmZmVyLFxuICAgIGdldFZlcnRleEF0dHJpYjogZ2wuZ2V0VmVydGV4QXR0cmliLFxuICAgIHZlcnRleEF0dHJpYlBvaW50ZXI6IGdsLnZlcnRleEF0dHJpYlBvaW50ZXJcbiAgfTtcblxuICBnbC5nZXRQYXJhbWV0ZXIgPSBmdW5jdGlvbiBnZXRQYXJhbWV0ZXIocG5hbWUpIHtcbiAgICBpZiAocG5hbWUgPT09IHNlbGYuVkVSVEVYX0FSUkFZX0JJTkRJTkdfT0VTKSB7XG4gICAgICBpZiAoc2VsZi5jdXJyZW50VmVydGV4QXJyYXlPYmplY3QgPT09IHNlbGYuZGVmYXVsdFZlcnRleEFycmF5T2JqZWN0KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZi5jdXJyZW50VmVydGV4QXJyYXlPYmplY3Q7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9yaWdpbmFsLmdldFBhcmFtZXRlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9O1xuXG4gIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5ID0gZnVuY3Rpb24gZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoaW5kZXgpIHtcbiAgICBjb25zdCB2YW8gPSBzZWxmLmN1cnJlbnRWZXJ0ZXhBcnJheU9iamVjdDtcbiAgICB2YW8ubWF4QXR0cmliID0gTWF0aC5tYXgodmFvLm1heEF0dHJpYiwgaW5kZXgpO1xuICAgIGNvbnN0IGF0dHJpYiA9IHZhby5hdHRyaWJzW2luZGV4XTtcbiAgICBhdHRyaWIuZW5hYmxlZCA9IHRydWU7XG4gICAgcmV0dXJuIG9yaWdpbmFsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG5cbiAgZ2wuZGlzYWJsZVZlcnRleEF0dHJpYkFycmF5ID0gZnVuY3Rpb24gZGlzYWJsZVZlcnRleEF0dHJpYkFycmF5KGluZGV4KSB7XG4gICAgY29uc3QgdmFvID0gc2VsZi5jdXJyZW50VmVydGV4QXJyYXlPYmplY3Q7XG4gICAgdmFvLm1heEF0dHJpYiA9IE1hdGgubWF4KHZhby5tYXhBdHRyaWIsIGluZGV4KTtcbiAgICBjb25zdCBhdHRyaWIgPSB2YW8uYXR0cmlic1tpbmRleF07XG4gICAgYXR0cmliLmVuYWJsZWQgPSBmYWxzZTtcbiAgICByZXR1cm4gb3JpZ2luYWwuZGlzYWJsZVZlcnRleEF0dHJpYkFycmF5LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG5cbiAgZ2wuYmluZEJ1ZmZlciA9IGZ1bmN0aW9uIGJpbmRCdWZmZXIodGFyZ2V0LCBidWZmZXIpIHtcbiAgICBzd2l0Y2ggKHRhcmdldCkge1xuICAgICAgY2FzZSAzNDk2MjpcbiAgICAgICAgc2VsZi5jdXJyZW50QXJyYXlCdWZmZXIgPSBidWZmZXI7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDM0OTYzOlxuICAgICAgICBzZWxmLmN1cnJlbnRWZXJ0ZXhBcnJheU9iamVjdC5lbGVtZW50QXJyYXlCdWZmZXIgPSBidWZmZXI7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgIH1cblxuICAgIHJldHVybiBvcmlnaW5hbC5iaW5kQnVmZmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG5cbiAgZ2wuZ2V0VmVydGV4QXR0cmliID0gZnVuY3Rpb24gZ2V0VmVydGV4QXR0cmliKGluZGV4LCBwbmFtZSkge1xuICAgIGNvbnN0IHZhbyA9IHNlbGYuY3VycmVudFZlcnRleEFycmF5T2JqZWN0O1xuICAgIGNvbnN0IGF0dHJpYiA9IHZhby5hdHRyaWJzW2luZGV4XTtcblxuICAgIHN3aXRjaCAocG5hbWUpIHtcbiAgICAgIGNhc2UgMzQ5NzU6XG4gICAgICAgIHJldHVybiBhdHRyaWIuYnVmZmVyO1xuXG4gICAgICBjYXNlIDM0MzM4OlxuICAgICAgICByZXR1cm4gYXR0cmliLmVuYWJsZWQ7XG5cbiAgICAgIGNhc2UgMzQzMzk6XG4gICAgICAgIHJldHVybiBhdHRyaWIuc2l6ZTtcblxuICAgICAgY2FzZSAzNDM0MDpcbiAgICAgICAgcmV0dXJuIGF0dHJpYi5zdHJpZGU7XG5cbiAgICAgIGNhc2UgMzQzNDE6XG4gICAgICAgIHJldHVybiBhdHRyaWIudHlwZTtcblxuICAgICAgY2FzZSAzNDkyMjpcbiAgICAgICAgcmV0dXJuIGF0dHJpYi5ub3JtYWxpemVkO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gb3JpZ2luYWwuZ2V0VmVydGV4QXR0cmliLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9O1xuXG4gIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIgPSBmdW5jdGlvbiB2ZXJ0ZXhBdHRyaWJQb2ludGVyKGluZHgsIHNpemUsIHR5cGUsIG5vcm1hbGl6ZWQsIHN0cmlkZSwgb2Zmc2V0KSB7XG4gICAgY29uc3QgdmFvID0gc2VsZi5jdXJyZW50VmVydGV4QXJyYXlPYmplY3Q7XG4gICAgdmFvLm1heEF0dHJpYiA9IE1hdGgubWF4KHZhby5tYXhBdHRyaWIsIGluZHgpO1xuICAgIGNvbnN0IGF0dHJpYiA9IHZhby5hdHRyaWJzW2luZHhdO1xuICAgIGF0dHJpYi5idWZmZXIgPSBzZWxmLmN1cnJlbnRBcnJheUJ1ZmZlcjtcbiAgICBhdHRyaWIuc2l6ZSA9IHNpemU7XG4gICAgYXR0cmliLnR5cGUgPSB0eXBlO1xuICAgIGF0dHJpYi5ub3JtYWxpemVkID0gbm9ybWFsaXplZDtcbiAgICBhdHRyaWIuc3RyaWRlID0gc3RyaWRlO1xuICAgIGF0dHJpYi5vZmZzZXQgPSBvZmZzZXQ7XG4gICAgYXR0cmliLnJlY2FjaGUoKTtcbiAgICByZXR1cm4gb3JpZ2luYWwudmVydGV4QXR0cmliUG9pbnRlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9O1xuXG4gIGlmIChnbC5pbnN0cnVtZW50RXh0ZW5zaW9uKSB7XG4gICAgZ2wuaW5zdHJ1bWVudEV4dGVuc2lvbih0aGlzLCAnT0VTX3ZlcnRleF9hcnJheV9vYmplY3QnKTtcbiAgfVxuXG4gIGlmIChnbC5jYW52YXMpIHtcbiAgICBnbC5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignd2ViZ2xjb250ZXh0cmVzdG9yZWQnLCAoKSA9PiB7XG4gICAgICBsb2coJ09FU1ZlcnRleEFycmF5T2JqZWN0IGVtdWxhdGlvbiBsaWJyYXJ5IGNvbnRleHQgcmVzdG9yZWQnKTtcbiAgICAgIHNlbGYucmVzZXRfKCk7XG4gICAgfSwgdHJ1ZSk7XG4gIH1cblxuICB0aGlzLnJlc2V0XygpO1xufTtcblxuT0VTVmVydGV4QXJyYXlPYmplY3QucHJvdG90eXBlLlZFUlRFWF9BUlJBWV9CSU5ESU5HX09FUyA9IDB4ODViNTtcblxuT0VTVmVydGV4QXJyYXlPYmplY3QucHJvdG90eXBlLnJlc2V0XyA9IGZ1bmN0aW9uIHJlc2V0XygpIHtcbiAgY29uc3QgY29udGV4dFdhc0xvc3QgPSB0aGlzLnZlcnRleEFycmF5T2JqZWN0cyAhPT0gdW5kZWZpbmVkO1xuXG4gIGlmIChjb250ZXh0V2FzTG9zdCkge1xuICAgIGZvciAobGV0IGlpID0gMDsgaWkgPCB0aGlzLnZlcnRleEFycmF5T2JqZWN0cy5sZW5ndGg7ICsraWkpIHtcbiAgICAgIHRoaXMudmVydGV4QXJyYXlPYmplY3RzLmlzQWxpdmUgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBnbCA9IHRoaXMuZ2w7XG4gIHRoaXMubWF4VmVydGV4QXR0cmlicyA9IGdsLmdldFBhcmFtZXRlcigzNDkyMSk7XG4gIHRoaXMuZGVmYXVsdFZlcnRleEFycmF5T2JqZWN0ID0gbmV3IFdlYkdMVmVydGV4QXJyYXlPYmplY3RPRVModGhpcyk7XG4gIHRoaXMuY3VycmVudFZlcnRleEFycmF5T2JqZWN0ID0gbnVsbDtcbiAgdGhpcy5jdXJyZW50QXJyYXlCdWZmZXIgPSBudWxsO1xuICB0aGlzLnZlcnRleEFycmF5T2JqZWN0cyA9IFt0aGlzLmRlZmF1bHRWZXJ0ZXhBcnJheU9iamVjdF07XG4gIHRoaXMuYmluZFZlcnRleEFycmF5T0VTKG51bGwpO1xufTtcblxuT0VTVmVydGV4QXJyYXlPYmplY3QucHJvdG90eXBlLmNyZWF0ZVZlcnRleEFycmF5T0VTID0gZnVuY3Rpb24gY3JlYXRlVmVydGV4QXJyYXlPRVMoKSB7XG4gIGNvbnN0IGFycmF5T2JqZWN0ID0gbmV3IFdlYkdMVmVydGV4QXJyYXlPYmplY3RPRVModGhpcyk7XG4gIHRoaXMudmVydGV4QXJyYXlPYmplY3RzLnB1c2goYXJyYXlPYmplY3QpO1xuICByZXR1cm4gYXJyYXlPYmplY3Q7XG59O1xuXG5PRVNWZXJ0ZXhBcnJheU9iamVjdC5wcm90b3R5cGUuZGVsZXRlVmVydGV4QXJyYXlPRVMgPSBmdW5jdGlvbiBkZWxldGVWZXJ0ZXhBcnJheU9FUyhhcnJheU9iamVjdCkge1xuICBhcnJheU9iamVjdC5pc0FsaXZlID0gZmFsc2U7XG4gIHRoaXMudmVydGV4QXJyYXlPYmplY3RzLnNwbGljZSh0aGlzLnZlcnRleEFycmF5T2JqZWN0cy5pbmRleE9mKGFycmF5T2JqZWN0KSwgMSk7XG5cbiAgaWYgKHRoaXMuY3VycmVudFZlcnRleEFycmF5T2JqZWN0ID09PSBhcnJheU9iamVjdCkge1xuICAgIHRoaXMuYmluZFZlcnRleEFycmF5T0VTKG51bGwpO1xuICB9XG59O1xuXG5PRVNWZXJ0ZXhBcnJheU9iamVjdC5wcm90b3R5cGUuaXNWZXJ0ZXhBcnJheU9FUyA9IGZ1bmN0aW9uIGlzVmVydGV4QXJyYXlPRVMoYXJyYXlPYmplY3QpIHtcbiAgaWYgKGFycmF5T2JqZWN0ICYmIGFycmF5T2JqZWN0IGluc3RhbmNlb2YgV2ViR0xWZXJ0ZXhBcnJheU9iamVjdE9FUykge1xuICAgIGlmIChhcnJheU9iamVjdC5oYXNCZWVuQm91bmQgJiYgYXJyYXlPYmplY3QuZXh0ID09PSB0aGlzKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5PRVNWZXJ0ZXhBcnJheU9iamVjdC5wcm90b3R5cGUuYmluZFZlcnRleEFycmF5T0VTID0gZnVuY3Rpb24gYmluZFZlcnRleEFycmF5T0VTKGFycmF5T2JqZWN0KSB7XG4gIGNvbnN0IGdsID0gdGhpcy5nbDtcblxuICBpZiAoYXJyYXlPYmplY3QgJiYgIWFycmF5T2JqZWN0LmlzQWxpdmUpIHtcbiAgICBzeW50aGVzaXplR0xFcnJvcigxMjgyLCAnYmluZFZlcnRleEFycmF5T0VTOiBhdHRlbXB0IHRvIGJpbmQgZGVsZXRlZCBhcnJheU9iamVjdCcpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IG9yaWdpbmFsID0gdGhpcy5vcmlnaW5hbDtcbiAgY29uc3Qgb2xkVkFPID0gdGhpcy5jdXJyZW50VmVydGV4QXJyYXlPYmplY3Q7XG4gIHRoaXMuY3VycmVudFZlcnRleEFycmF5T2JqZWN0ID0gYXJyYXlPYmplY3QgfHwgdGhpcy5kZWZhdWx0VmVydGV4QXJyYXlPYmplY3Q7XG4gIHRoaXMuY3VycmVudFZlcnRleEFycmF5T2JqZWN0Lmhhc0JlZW5Cb3VuZCA9IHRydWU7XG4gIGNvbnN0IG5ld1ZBTyA9IHRoaXMuY3VycmVudFZlcnRleEFycmF5T2JqZWN0O1xuXG4gIGlmIChvbGRWQU8gPT09IG5ld1ZBTykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICghb2xkVkFPIHx8IG5ld1ZBTy5lbGVtZW50QXJyYXlCdWZmZXIgIT09IG9sZFZBTy5lbGVtZW50QXJyYXlCdWZmZXIpIHtcbiAgICBvcmlnaW5hbC5iaW5kQnVmZmVyLmNhbGwoZ2wsIDM0OTYzLCBuZXdWQU8uZWxlbWVudEFycmF5QnVmZmVyKTtcbiAgfVxuXG4gIGxldCBjdXJyZW50QmluZGluZyA9IHRoaXMuY3VycmVudEFycmF5QnVmZmVyO1xuICBjb25zdCBtYXhBdHRyaWIgPSBNYXRoLm1heChvbGRWQU8gPyBvbGRWQU8ubWF4QXR0cmliIDogMCwgbmV3VkFPLm1heEF0dHJpYik7XG5cbiAgZm9yIChsZXQgbiA9IDA7IG4gPD0gbWF4QXR0cmliOyBuKyspIHtcbiAgICBjb25zdCBhdHRyaWIgPSBuZXdWQU8uYXR0cmlic1tuXTtcbiAgICBjb25zdCBvbGRBdHRyaWIgPSBvbGRWQU8gPyBvbGRWQU8uYXR0cmlic1tuXSA6IG51bGw7XG5cbiAgICBpZiAoIW9sZFZBTyB8fCBhdHRyaWIuZW5hYmxlZCAhPT0gb2xkQXR0cmliLmVuYWJsZWQpIHtcbiAgICAgIGlmIChhdHRyaWIuZW5hYmxlZCkge1xuICAgICAgICBvcmlnaW5hbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheS5jYWxsKGdsLCBuKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9yaWdpbmFsLmRpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheS5jYWxsKGdsLCBuKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoYXR0cmliLmVuYWJsZWQpIHtcbiAgICAgIGxldCBidWZmZXJDaGFuZ2VkID0gZmFsc2U7XG5cbiAgICAgIGlmICghb2xkVkFPIHx8IGF0dHJpYi5idWZmZXIgIT09IG9sZEF0dHJpYi5idWZmZXIpIHtcbiAgICAgICAgaWYgKGN1cnJlbnRCaW5kaW5nICE9PSBhdHRyaWIuYnVmZmVyKSB7XG4gICAgICAgICAgb3JpZ2luYWwuYmluZEJ1ZmZlci5jYWxsKGdsLCAzNDk2MiwgYXR0cmliLmJ1ZmZlcik7XG4gICAgICAgICAgY3VycmVudEJpbmRpbmcgPSBhdHRyaWIuYnVmZmVyO1xuICAgICAgICB9XG5cbiAgICAgICAgYnVmZmVyQ2hhbmdlZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChidWZmZXJDaGFuZ2VkIHx8IGF0dHJpYi5jYWNoZWQgIT09IG9sZEF0dHJpYi5jYWNoZWQpIHtcbiAgICAgICAgb3JpZ2luYWwudmVydGV4QXR0cmliUG9pbnRlci5jYWxsKGdsLCBuLCBhdHRyaWIuc2l6ZSwgYXR0cmliLnR5cGUsIGF0dHJpYi5ub3JtYWxpemVkLCBhdHRyaWIuc3RyaWRlLCBhdHRyaWIub2Zmc2V0KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAodGhpcy5jdXJyZW50QXJyYXlCdWZmZXIgIT09IGN1cnJlbnRCaW5kaW5nKSB7XG4gICAgb3JpZ2luYWwuYmluZEJ1ZmZlci5jYWxsKGdsLCAzNDk2MiwgdGhpcy5jdXJyZW50QXJyYXlCdWZmZXIpO1xuICB9XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gcG9seWZpbGxWZXJ0ZXhBcnJheU9iamVjdChnbCkge1xuICBpZiAodHlwZW9mIGdsLmNyZWF0ZVZlcnRleEFycmF5ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3Qgb3JpZ2luYWxfZ2V0U3VwcG9ydGVkRXh0ZW5zaW9ucyA9IGdsLmdldFN1cHBvcnRlZEV4dGVuc2lvbnM7XG5cbiAgZ2wuZ2V0U3VwcG9ydGVkRXh0ZW5zaW9ucyA9IGZ1bmN0aW9uIGdldFN1cHBvcnRlZEV4dGVuc2lvbnMoKSB7XG4gICAgY29uc3QgbGlzdCA9IG9yaWdpbmFsX2dldFN1cHBvcnRlZEV4dGVuc2lvbnMuY2FsbCh0aGlzKSB8fCBbXTtcblxuICAgIGlmIChsaXN0LmluZGV4T2YoJ09FU192ZXJ0ZXhfYXJyYXlfb2JqZWN0JykgPCAwKSB7XG4gICAgICBsaXN0LnB1c2goJ09FU192ZXJ0ZXhfYXJyYXlfb2JqZWN0Jyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGxpc3Q7XG4gIH07XG5cbiAgY29uc3Qgb3JpZ2luYWxfZ2V0RXh0ZW5zaW9uID0gZ2wuZ2V0RXh0ZW5zaW9uO1xuXG4gIGdsLmdldEV4dGVuc2lvbiA9IGZ1bmN0aW9uIGdldEV4dGVuc2lvbihuYW1lKSB7XG4gICAgY29uc3QgZXh0ID0gb3JpZ2luYWxfZ2V0RXh0ZW5zaW9uLmNhbGwodGhpcywgbmFtZSk7XG5cbiAgICBpZiAoZXh0KSB7XG4gICAgICByZXR1cm4gZXh0O1xuICAgIH1cblxuICAgIGlmIChuYW1lICE9PSAnT0VTX3ZlcnRleF9hcnJheV9vYmplY3QnKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoIWdsLl9fT0VTVmVydGV4QXJyYXlPYmplY3QpIHtcbiAgICAgIHRoaXMuX19PRVNWZXJ0ZXhBcnJheU9iamVjdCA9IG5ldyBPRVNWZXJ0ZXhBcnJheU9iamVjdCh0aGlzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fX09FU1ZlcnRleEFycmF5T2JqZWN0O1xuICB9O1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cG9seWZpbGwtdmVydGV4LWFycmF5LW9iamVjdC5qcy5tYXAiLCJpbXBvcnQgeyBHTF9QQVJBTUVURVJfREVGQVVMVFMsIEdMX0hPT0tFRF9TRVRURVJTIH0gZnJvbSAnLi93ZWJnbC1wYXJhbWV0ZXItdGFibGVzJztcbmltcG9ydCB7IHNldFBhcmFtZXRlcnMsIGdldFBhcmFtZXRlcnMgfSBmcm9tICcuL3VuaWZpZWQtcGFyYW1ldGVyLWFwaSc7XG5pbXBvcnQgeyBhc3NlcnQgfSBmcm9tICcuLi91dGlscy9hc3NlcnQnO1xuaW1wb3J0IHsgZGVlcEFycmF5RXF1YWwgfSBmcm9tICcuLi91dGlscy91dGlscyc7XG5cbmZ1bmN0aW9uIGluc3RhbGxHZXR0ZXJPdmVycmlkZShnbCwgZnVuY3Rpb25OYW1lKSB7XG4gIGNvbnN0IG9yaWdpbmFsR2V0dGVyRnVuYyA9IGdsW2Z1bmN0aW9uTmFtZV0uYmluZChnbCk7XG5cbiAgZ2xbZnVuY3Rpb25OYW1lXSA9IGZ1bmN0aW9uIGdldCguLi5wYXJhbXMpIHtcbiAgICBjb25zdCBwbmFtZSA9IHBhcmFtc1swXTtcblxuICAgIGlmICghKHBuYW1lIGluIGdsLnN0YXRlLmNhY2hlKSkge1xuICAgICAgcmV0dXJuIG9yaWdpbmFsR2V0dGVyRnVuYyguLi5wYXJhbXMpO1xuICAgIH1cblxuICAgIHJldHVybiBnbC5zdGF0ZS5lbmFibGUgPyBnbC5zdGF0ZS5jYWNoZVtwbmFtZV0gOiBvcmlnaW5hbEdldHRlckZ1bmMoLi4ucGFyYW1zKTtcbiAgfTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZ2xbZnVuY3Rpb25OYW1lXSwgJ25hbWUnLCB7XG4gICAgdmFsdWU6IGAke2Z1bmN0aW9uTmFtZX0tZnJvbS1jYWNoZWAsXG4gICAgY29uZmlndXJhYmxlOiBmYWxzZVxuICB9KTtcbn1cblxuZnVuY3Rpb24gaW5zdGFsbFNldHRlclNweShnbCwgZnVuY3Rpb25OYW1lLCBzZXR0ZXIpIHtcbiAgY29uc3Qgb3JpZ2luYWxTZXR0ZXJGdW5jID0gZ2xbZnVuY3Rpb25OYW1lXS5iaW5kKGdsKTtcblxuICBnbFtmdW5jdGlvbk5hbWVdID0gZnVuY3Rpb24gc2V0KC4uLnBhcmFtcykge1xuICAgIGNvbnN0IHtcbiAgICAgIHZhbHVlQ2hhbmdlZCxcbiAgICAgIG9sZFZhbHVlXG4gICAgfSA9IHNldHRlcihnbC5zdGF0ZS5fdXBkYXRlQ2FjaGUsIC4uLnBhcmFtcyk7XG5cbiAgICBpZiAodmFsdWVDaGFuZ2VkKSB7XG4gICAgICBvcmlnaW5hbFNldHRlckZ1bmMoLi4ucGFyYW1zKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb2xkVmFsdWU7XG4gIH07XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGdsW2Z1bmN0aW9uTmFtZV0sICduYW1lJywge1xuICAgIHZhbHVlOiBgJHtmdW5jdGlvbk5hbWV9LXRvLWNhY2hlYCxcbiAgICBjb25maWd1cmFibGU6IGZhbHNlXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBpbnN0YWxsUHJvZ3JhbVNweShnbCkge1xuICBjb25zdCBvcmlnaW5hbFVzZVByb2dyYW0gPSBnbC51c2VQcm9ncmFtLmJpbmQoZ2wpO1xuXG4gIGdsLnVzZVByb2dyYW0gPSBmdW5jdGlvbiB1c2VQcm9ncmFtTHVtYShoYW5kbGUpIHtcbiAgICBpZiAoZ2wuc3RhdGUucHJvZ3JhbSAhPT0gaGFuZGxlKSB7XG4gICAgICBvcmlnaW5hbFVzZVByb2dyYW0oaGFuZGxlKTtcbiAgICAgIGdsLnN0YXRlLnByb2dyYW0gPSBoYW5kbGU7XG4gICAgfVxuICB9O1xufVxuXG5jbGFzcyBHTFN0YXRlIHtcbiAgY29uc3RydWN0b3IoZ2wsIHtcbiAgICBjb3B5U3RhdGUgPSBmYWxzZSxcbiAgICBsb2cgPSAoKSA9PiB7fVxuICB9ID0ge30pIHtcbiAgICB0aGlzLmdsID0gZ2w7XG4gICAgdGhpcy5wcm9ncmFtID0gbnVsbDtcbiAgICB0aGlzLnN0YXRlU3RhY2sgPSBbXTtcbiAgICB0aGlzLmVuYWJsZSA9IHRydWU7XG4gICAgdGhpcy5jYWNoZSA9IGNvcHlTdGF0ZSA/IGdldFBhcmFtZXRlcnMoZ2wpIDogT2JqZWN0LmFzc2lnbih7fSwgR0xfUEFSQU1FVEVSX0RFRkFVTFRTKTtcbiAgICB0aGlzLmxvZyA9IGxvZztcbiAgICB0aGlzLl91cGRhdGVDYWNoZSA9IHRoaXMuX3VwZGF0ZUNhY2hlLmJpbmQodGhpcyk7XG4gICAgT2JqZWN0LnNlYWwodGhpcyk7XG4gIH1cblxuICBwdXNoKHZhbHVlcyA9IHt9KSB7XG4gICAgdGhpcy5zdGF0ZVN0YWNrLnB1c2goe30pO1xuICB9XG5cbiAgcG9wKCkge1xuICAgIGFzc2VydCh0aGlzLnN0YXRlU3RhY2subGVuZ3RoID4gMCk7XG4gICAgY29uc3Qgb2xkVmFsdWVzID0gdGhpcy5zdGF0ZVN0YWNrW3RoaXMuc3RhdGVTdGFjay5sZW5ndGggLSAxXTtcbiAgICBzZXRQYXJhbWV0ZXJzKHRoaXMuZ2wsIG9sZFZhbHVlcyk7XG4gICAgdGhpcy5zdGF0ZVN0YWNrLnBvcCgpO1xuICB9XG5cbiAgX3VwZGF0ZUNhY2hlKHZhbHVlcykge1xuICAgIGxldCB2YWx1ZUNoYW5nZWQgPSBmYWxzZTtcbiAgICBsZXQgb2xkVmFsdWU7XG4gICAgY29uc3Qgb2xkVmFsdWVzID0gdGhpcy5zdGF0ZVN0YWNrLmxlbmd0aCA+IDAgJiYgdGhpcy5zdGF0ZVN0YWNrW3RoaXMuc3RhdGVTdGFjay5sZW5ndGggLSAxXTtcblxuICAgIGZvciAoY29uc3Qga2V5IGluIHZhbHVlcykge1xuICAgICAgYXNzZXJ0KGtleSAhPT0gdW5kZWZpbmVkKTtcbiAgICAgIGNvbnN0IHZhbHVlID0gdmFsdWVzW2tleV07XG4gICAgICBjb25zdCBjYWNoZWQgPSB0aGlzLmNhY2hlW2tleV07XG5cbiAgICAgIGlmICghZGVlcEFycmF5RXF1YWwodmFsdWUsIGNhY2hlZCkpIHtcbiAgICAgICAgdmFsdWVDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgb2xkVmFsdWUgPSBjYWNoZWQ7XG5cbiAgICAgICAgaWYgKG9sZFZhbHVlcyAmJiAhKGtleSBpbiBvbGRWYWx1ZXMpKSB7XG4gICAgICAgICAgb2xkVmFsdWVzW2tleV0gPSBjYWNoZWQ7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNhY2hlW2tleV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgdmFsdWVDaGFuZ2VkLFxuICAgICAgb2xkVmFsdWVcbiAgICB9O1xuICB9XG5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyYWNrQ29udGV4dFN0YXRlKGdsLCBvcHRpb25zID0ge30pIHtcbiAgY29uc3Qge1xuICAgIGVuYWJsZSA9IHRydWUsXG4gICAgY29weVN0YXRlXG4gIH0gPSBvcHRpb25zO1xuICBhc3NlcnQoY29weVN0YXRlICE9PSB1bmRlZmluZWQpO1xuXG4gIGlmICghZ2wuc3RhdGUpIHtcbiAgICBjb25zdCBnbG9iYWxfID0gdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOiB3aW5kb3c7XG4gICAgY29uc3Qge1xuICAgICAgcG9seWZpbGxDb250ZXh0XG4gICAgfSA9IGdsb2JhbF87XG5cbiAgICBpZiAocG9seWZpbGxDb250ZXh0KSB7XG4gICAgICBwb2x5ZmlsbENvbnRleHQoZ2wpO1xuICAgIH1cblxuICAgIGdsLnN0YXRlID0gbmV3IEdMU3RhdGUoZ2wsIHtcbiAgICAgIGNvcHlTdGF0ZVxuICAgIH0pO1xuICAgIGluc3RhbGxQcm9ncmFtU3B5KGdsKTtcblxuICAgIGZvciAoY29uc3Qga2V5IGluIEdMX0hPT0tFRF9TRVRURVJTKSB7XG4gICAgICBjb25zdCBzZXR0ZXIgPSBHTF9IT09LRURfU0VUVEVSU1trZXldO1xuICAgICAgaW5zdGFsbFNldHRlclNweShnbCwga2V5LCBzZXR0ZXIpO1xuICAgIH1cblxuICAgIGluc3RhbGxHZXR0ZXJPdmVycmlkZShnbCwgJ2dldFBhcmFtZXRlcicpO1xuICAgIGluc3RhbGxHZXR0ZXJPdmVycmlkZShnbCwgJ2lzRW5hYmxlZCcpO1xuICB9XG5cbiAgZ2wuc3RhdGUuZW5hYmxlID0gZW5hYmxlO1xuICByZXR1cm4gZ2w7XG59XG5leHBvcnQgZnVuY3Rpb24gcHVzaENvbnRleHRTdGF0ZShnbCkge1xuICBpZiAoIWdsLnN0YXRlKSB7XG4gICAgdHJhY2tDb250ZXh0U3RhdGUoZ2wsIHtcbiAgICAgIGNvcHlTdGF0ZTogZmFsc2VcbiAgICB9KTtcbiAgfVxuXG4gIGdsLnN0YXRlLnB1c2goKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBwb3BDb250ZXh0U3RhdGUoZ2wpIHtcbiAgYXNzZXJ0KGdsLnN0YXRlKTtcbiAgZ2wuc3RhdGUucG9wKCk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD10cmFjay1jb250ZXh0LXN0YXRlLmpzLm1hcCIsImltcG9ydCB7IEdMX1BBUkFNRVRFUl9ERUZBVUxUUywgR0xfUEFSQU1FVEVSX1NFVFRFUlMsIEdMX0NPTVBPU0lURV9QQVJBTUVURVJfU0VUVEVSUywgR0xfUEFSQU1FVEVSX0dFVFRFUlMgfSBmcm9tICcuL3dlYmdsLXBhcmFtZXRlci10YWJsZXMnO1xuaW1wb3J0IHsgcHVzaENvbnRleHRTdGF0ZSwgcG9wQ29udGV4dFN0YXRlIH0gZnJvbSAnLi90cmFjay1jb250ZXh0LXN0YXRlJztcbmltcG9ydCB7IGFzc2VydCB9IGZyb20gJy4uL3V0aWxzL2Fzc2VydCc7XG5pbXBvcnQgeyBpc1dlYkdMIH0gZnJvbSAnLi4vdXRpbHMvd2ViZ2wtY2hlY2tzJztcbmltcG9ydCB7IGlzT2JqZWN0RW1wdHkgfSBmcm9tICcuLi91dGlscy91dGlscyc7XG5leHBvcnQgZnVuY3Rpb24gc2V0UGFyYW1ldGVycyhnbCwgdmFsdWVzKSB7XG4gIGFzc2VydChpc1dlYkdMKGdsKSwgJ3NldFBhcmFtZXRlcnMgcmVxdWlyZXMgYSBXZWJHTCBjb250ZXh0Jyk7XG5cbiAgaWYgKGlzT2JqZWN0RW1wdHkodmFsdWVzKSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IGNvbXBvc2l0ZVNldHRlcnMgPSB7fTtcblxuICBmb3IgKGNvbnN0IGtleSBpbiB2YWx1ZXMpIHtcbiAgICBjb25zdCBnbENvbnN0YW50ID0gTnVtYmVyKGtleSk7XG4gICAgY29uc3Qgc2V0dGVyID0gR0xfUEFSQU1FVEVSX1NFVFRFUlNba2V5XTtcblxuICAgIGlmIChzZXR0ZXIpIHtcbiAgICAgIGlmICh0eXBlb2Ygc2V0dGVyID09PSAnc3RyaW5nJykge1xuICAgICAgICBjb21wb3NpdGVTZXR0ZXJzW3NldHRlcl0gPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0dGVyKGdsLCB2YWx1ZXNba2V5XSwgZ2xDb25zdGFudCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29uc3QgY2FjaGUgPSBnbC5zdGF0ZSAmJiBnbC5zdGF0ZS5jYWNoZTtcblxuICBpZiAoY2FjaGUpIHtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBjb21wb3NpdGVTZXR0ZXJzKSB7XG4gICAgICBjb25zdCBjb21wb3NpdGVTZXR0ZXIgPSBHTF9DT01QT1NJVEVfUEFSQU1FVEVSX1NFVFRFUlNba2V5XTtcbiAgICAgIGNvbXBvc2l0ZVNldHRlcihnbCwgdmFsdWVzLCBjYWNoZSk7XG4gICAgfVxuICB9XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0UGFyYW1ldGVycyhnbCwgcGFyYW1ldGVycykge1xuICBwYXJhbWV0ZXJzID0gcGFyYW1ldGVycyB8fCBHTF9QQVJBTUVURVJfREVGQVVMVFM7XG5cbiAgaWYgKHR5cGVvZiBwYXJhbWV0ZXJzID09PSAnbnVtYmVyJykge1xuICAgIGNvbnN0IGtleSA9IHBhcmFtZXRlcnM7XG4gICAgY29uc3QgZ2V0dGVyID0gR0xfUEFSQU1FVEVSX0dFVFRFUlNba2V5XTtcbiAgICByZXR1cm4gZ2V0dGVyID8gZ2V0dGVyKGdsLCBrZXkpIDogZ2wuZ2V0UGFyYW1ldGVyKGtleSk7XG4gIH1cblxuICBjb25zdCBwYXJhbWV0ZXJLZXlzID0gQXJyYXkuaXNBcnJheShwYXJhbWV0ZXJzKSA/IHBhcmFtZXRlcnMgOiBPYmplY3Qua2V5cyhwYXJhbWV0ZXJzKTtcbiAgY29uc3Qgc3RhdGUgPSB7fTtcblxuICBmb3IgKGNvbnN0IGtleSBvZiBwYXJhbWV0ZXJLZXlzKSB7XG4gICAgY29uc3QgZ2V0dGVyID0gR0xfUEFSQU1FVEVSX0dFVFRFUlNba2V5XTtcbiAgICBzdGF0ZVtrZXldID0gZ2V0dGVyID8gZ2V0dGVyKGdsLCBOdW1iZXIoa2V5KSkgOiBnbC5nZXRQYXJhbWV0ZXIoTnVtYmVyKGtleSkpO1xuICB9XG5cbiAgcmV0dXJuIHN0YXRlO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0UGFyYW1ldGVycyhnbCkge1xuICBzZXRQYXJhbWV0ZXJzKGdsLCBHTF9QQVJBTUVURVJfREVGQVVMVFMpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHdpdGhQYXJhbWV0ZXJzKGdsLCBwYXJhbWV0ZXJzLCBmdW5jKSB7XG4gIGlmIChpc09iamVjdEVtcHR5KHBhcmFtZXRlcnMpKSB7XG4gICAgcmV0dXJuIGZ1bmMoZ2wpO1xuICB9XG5cbiAgY29uc3Qge1xuICAgIG5vY2F0Y2ggPSB0cnVlXG4gIH0gPSBwYXJhbWV0ZXJzO1xuICBwdXNoQ29udGV4dFN0YXRlKGdsKTtcbiAgc2V0UGFyYW1ldGVycyhnbCwgcGFyYW1ldGVycyk7XG4gIGxldCB2YWx1ZTtcblxuICBpZiAobm9jYXRjaCkge1xuICAgIHZhbHVlID0gZnVuYyhnbCk7XG4gICAgcG9wQ29udGV4dFN0YXRlKGdsKTtcbiAgfSBlbHNlIHtcbiAgICB0cnkge1xuICAgICAgdmFsdWUgPSBmdW5jKGdsKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgcG9wQ29udGV4dFN0YXRlKGdsKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdmFsdWU7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD11bmlmaWVkLXBhcmFtZXRlci1hcGkuanMubWFwIiwiaW1wb3J0IHsgaXNXZWJHTDIgfSBmcm9tICcuLi91dGlscy93ZWJnbC1jaGVja3MnO1xuZXhwb3J0IGNvbnN0IEdMX1BBUkFNRVRFUl9ERUZBVUxUUyA9IHtcbiAgWzMwNDJdOiBmYWxzZSxcbiAgWzMyNzczXTogbmV3IEZsb2F0MzJBcnJheShbMCwgMCwgMCwgMF0pLFxuICBbMzI3NzddOiAzMjc3NCxcbiAgWzM0ODc3XTogMzI3NzQsXG4gIFszMjk2OV06IDEsXG4gIFszMjk2OF06IDAsXG4gIFszMjk3MV06IDEsXG4gIFszMjk3MF06IDAsXG4gIFszMTA2XTogbmV3IEZsb2F0MzJBcnJheShbMCwgMCwgMCwgMF0pLFxuICBbMzEwN106IFt0cnVlLCB0cnVlLCB0cnVlLCB0cnVlXSxcbiAgWzI4ODRdOiBmYWxzZSxcbiAgWzI4ODVdOiAxMDI5LFxuICBbMjkyOV06IGZhbHNlLFxuICBbMjkzMV06IDEsXG4gIFsyOTMyXTogNTEzLFxuICBbMjkyOF06IG5ldyBGbG9hdDMyQXJyYXkoWzAsIDFdKSxcbiAgWzI5MzBdOiB0cnVlLFxuICBbMzAyNF06IHRydWUsXG4gIFszNjAwNl06IG51bGwsXG4gIFsyODg2XTogMjMwNSxcbiAgWzMzMTcwXTogNDM1MixcbiAgWzI4NDldOiAxLFxuICBbMzI4MjNdOiBmYWxzZSxcbiAgWzMyODI0XTogMCxcbiAgWzEwNzUyXTogMCxcbiAgWzMyOTM4XTogMS4wLFxuICBbMzI5MzldOiBmYWxzZSxcbiAgWzMwODldOiBmYWxzZSxcbiAgWzMwODhdOiBuZXcgSW50MzJBcnJheShbMCwgMCwgMTAyNCwgMTAyNF0pLFxuICBbMjk2MF06IGZhbHNlLFxuICBbMjk2MV06IDAsXG4gIFsyOTY4XTogMHhmZmZmZmZmZixcbiAgWzM2MDA1XTogMHhmZmZmZmZmZixcbiAgWzI5NjJdOiA1MTksXG4gIFsyOTY3XTogMCxcbiAgWzI5NjNdOiAweGZmZmZmZmZmLFxuICBbMzQ4MTZdOiA1MTksXG4gIFszNjAwM106IDAsXG4gIFszNjAwNF06IDB4ZmZmZmZmZmYsXG4gIFsyOTY0XTogNzY4MCxcbiAgWzI5NjVdOiA3NjgwLFxuICBbMjk2Nl06IDc2ODAsXG4gIFszNDgxN106IDc2ODAsXG4gIFszNDgxOF06IDc2ODAsXG4gIFszNDgxOV06IDc2ODAsXG4gIFsyOTc4XTogWzAsIDAsIDEwMjQsIDEwMjRdLFxuICBbMzMzM106IDQsXG4gIFszMzE3XTogNCxcbiAgWzM3NDQwXTogZmFsc2UsXG4gIFszNzQ0MV06IGZhbHNlLFxuICBbMzc0NDNdOiAzNzQ0NCxcbiAgWzM1NzIzXTogNDM1MixcbiAgWzM2MDEwXTogbnVsbCxcbiAgWzM1OTc3XTogZmFsc2UsXG4gIFszMzMwXTogMCxcbiAgWzMzMzJdOiAwLFxuICBbMzMzMV06IDAsXG4gIFszMzE0XTogMCxcbiAgWzMyODc4XTogMCxcbiAgWzMzMTZdOiAwLFxuICBbMzMxNV06IDAsXG4gIFszMjg3N106IDBcbn07XG5cbmNvbnN0IGVuYWJsZSA9IChnbCwgdmFsdWUsIGtleSkgPT4gdmFsdWUgPyBnbC5lbmFibGUoa2V5KSA6IGdsLmRpc2FibGUoa2V5KTtcblxuY29uc3QgaGludCA9IChnbCwgdmFsdWUsIGtleSkgPT4gZ2wuaGludChrZXksIHZhbHVlKTtcblxuY29uc3QgcGl4ZWxTdG9yZWkgPSAoZ2wsIHZhbHVlLCBrZXkpID0+IGdsLnBpeGVsU3RvcmVpKGtleSwgdmFsdWUpO1xuXG5jb25zdCBkcmF3RnJhbWVidWZmZXIgPSAoZ2wsIHZhbHVlKSA9PiB7XG4gIGNvbnN0IHRhcmdldCA9IGlzV2ViR0wyKGdsKSA/IDM2MDA5IDogMzYxNjA7XG4gIHJldHVybiBnbC5iaW5kRnJhbWVidWZmZXIodGFyZ2V0LCB2YWx1ZSk7XG59O1xuXG5jb25zdCByZWFkRnJhbWVidWZmZXIgPSAoZ2wsIHZhbHVlKSA9PiB7XG4gIHJldHVybiBnbC5iaW5kRnJhbWVidWZmZXIoMzYwMDgsIHZhbHVlKTtcbn07XG5cbmZ1bmN0aW9uIGlzQXJyYXkoYXJyYXkpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoYXJyYXkpIHx8IEFycmF5QnVmZmVyLmlzVmlldyhhcnJheSk7XG59XG5cbmV4cG9ydCBjb25zdCBHTF9QQVJBTUVURVJfU0VUVEVSUyA9IHtcbiAgWzMwNDJdOiBlbmFibGUsXG4gIFszMjc3M106IChnbCwgdmFsdWUpID0+IGdsLmJsZW5kQ29sb3IoLi4udmFsdWUpLFxuICBbMzI3NzddOiAnYmxlbmRFcXVhdGlvbicsXG4gIFszNDg3N106ICdibGVuZEVxdWF0aW9uJyxcbiAgWzMyOTY5XTogJ2JsZW5kRnVuYycsXG4gIFszMjk2OF06ICdibGVuZEZ1bmMnLFxuICBbMzI5NzFdOiAnYmxlbmRGdW5jJyxcbiAgWzMyOTcwXTogJ2JsZW5kRnVuYycsXG4gIFszMTA2XTogKGdsLCB2YWx1ZSkgPT4gZ2wuY2xlYXJDb2xvciguLi52YWx1ZSksXG4gIFszMTA3XTogKGdsLCB2YWx1ZSkgPT4gZ2wuY29sb3JNYXNrKC4uLnZhbHVlKSxcbiAgWzI4ODRdOiBlbmFibGUsXG4gIFsyODg1XTogKGdsLCB2YWx1ZSkgPT4gZ2wuY3VsbEZhY2UodmFsdWUpLFxuICBbMjkyOV06IGVuYWJsZSxcbiAgWzI5MzFdOiAoZ2wsIHZhbHVlKSA9PiBnbC5jbGVhckRlcHRoKHZhbHVlKSxcbiAgWzI5MzJdOiAoZ2wsIHZhbHVlKSA9PiBnbC5kZXB0aEZ1bmModmFsdWUpLFxuICBbMjkyOF06IChnbCwgdmFsdWUpID0+IGdsLmRlcHRoUmFuZ2UoLi4udmFsdWUpLFxuICBbMjkzMF06IChnbCwgdmFsdWUpID0+IGdsLmRlcHRoTWFzayh2YWx1ZSksXG4gIFszMDI0XTogZW5hYmxlLFxuICBbMzU3MjNdOiBoaW50LFxuICBbMzYwMDZdOiBkcmF3RnJhbWVidWZmZXIsXG4gIFsyODg2XTogKGdsLCB2YWx1ZSkgPT4gZ2wuZnJvbnRGYWNlKHZhbHVlKSxcbiAgWzMzMTcwXTogaGludCxcbiAgWzI4NDldOiAoZ2wsIHZhbHVlKSA9PiBnbC5saW5lV2lkdGgodmFsdWUpLFxuICBbMzI4MjNdOiBlbmFibGUsXG4gIFszMjgyNF06ICdwb2x5Z29uT2Zmc2V0JyxcbiAgWzEwNzUyXTogJ3BvbHlnb25PZmZzZXQnLFxuICBbMzU5NzddOiBlbmFibGUsXG4gIFszMjkzOF06ICdzYW1wbGVDb3ZlcmFnZScsXG4gIFszMjkzOV06ICdzYW1wbGVDb3ZlcmFnZScsXG4gIFszMDg5XTogZW5hYmxlLFxuICBbMzA4OF06IChnbCwgdmFsdWUpID0+IGdsLnNjaXNzb3IoLi4udmFsdWUpLFxuICBbMjk2MF06IGVuYWJsZSxcbiAgWzI5NjFdOiAoZ2wsIHZhbHVlKSA9PiBnbC5jbGVhclN0ZW5jaWwodmFsdWUpLFxuICBbMjk2OF06IChnbCwgdmFsdWUpID0+IGdsLnN0ZW5jaWxNYXNrU2VwYXJhdGUoMTAyOCwgdmFsdWUpLFxuICBbMzYwMDVdOiAoZ2wsIHZhbHVlKSA9PiBnbC5zdGVuY2lsTWFza1NlcGFyYXRlKDEwMjksIHZhbHVlKSxcbiAgWzI5NjJdOiAnc3RlbmNpbEZ1bmNGcm9udCcsXG4gIFsyOTY3XTogJ3N0ZW5jaWxGdW5jRnJvbnQnLFxuICBbMjk2M106ICdzdGVuY2lsRnVuY0Zyb250JyxcbiAgWzM0ODE2XTogJ3N0ZW5jaWxGdW5jQmFjaycsXG4gIFszNjAwM106ICdzdGVuY2lsRnVuY0JhY2snLFxuICBbMzYwMDRdOiAnc3RlbmNpbEZ1bmNCYWNrJyxcbiAgWzI5NjRdOiAnc3RlbmNpbE9wRnJvbnQnLFxuICBbMjk2NV06ICdzdGVuY2lsT3BGcm9udCcsXG4gIFsyOTY2XTogJ3N0ZW5jaWxPcEZyb250JyxcbiAgWzM0ODE3XTogJ3N0ZW5jaWxPcEJhY2snLFxuICBbMzQ4MThdOiAnc3RlbmNpbE9wQmFjaycsXG4gIFszNDgxOV06ICdzdGVuY2lsT3BCYWNrJyxcbiAgWzI5NzhdOiAoZ2wsIHZhbHVlKSA9PiBnbC52aWV3cG9ydCguLi52YWx1ZSksXG4gIFszMzMzXTogcGl4ZWxTdG9yZWksXG4gIFszMzE3XTogcGl4ZWxTdG9yZWksXG4gIFszNzQ0MF06IHBpeGVsU3RvcmVpLFxuICBbMzc0NDFdOiBwaXhlbFN0b3JlaSxcbiAgWzM3NDQzXTogcGl4ZWxTdG9yZWksXG4gIFszMzMwXTogcGl4ZWxTdG9yZWksXG4gIFszMzMyXTogcGl4ZWxTdG9yZWksXG4gIFszMzMxXTogcGl4ZWxTdG9yZWksXG4gIFszNjAxMF06IHJlYWRGcmFtZWJ1ZmZlcixcbiAgWzMzMTRdOiBwaXhlbFN0b3JlaSxcbiAgWzMyODc4XTogcGl4ZWxTdG9yZWksXG4gIFszMzE2XTogcGl4ZWxTdG9yZWksXG4gIFszMzE1XTogcGl4ZWxTdG9yZWksXG4gIFszMjg3N106IHBpeGVsU3RvcmVpLFxuICBmcmFtZWJ1ZmZlcjogKGdsLCBmcmFtZWJ1ZmZlcikgPT4ge1xuICAgIGNvbnN0IGhhbmRsZSA9IGZyYW1lYnVmZmVyICYmICdoYW5kbGUnIGluIGZyYW1lYnVmZmVyID8gZnJhbWVidWZmZXIuaGFuZGxlIDogZnJhbWVidWZmZXI7XG4gICAgcmV0dXJuIGdsLmJpbmRGcmFtZWJ1ZmZlcigzNjE2MCwgaGFuZGxlKTtcbiAgfSxcbiAgYmxlbmQ6IChnbCwgdmFsdWUpID0+IHZhbHVlID8gZ2wuZW5hYmxlKDMwNDIpIDogZ2wuZGlzYWJsZSgzMDQyKSxcbiAgYmxlbmRDb2xvcjogKGdsLCB2YWx1ZSkgPT4gZ2wuYmxlbmRDb2xvciguLi52YWx1ZSksXG4gIGJsZW5kRXF1YXRpb246IChnbCwgYXJncykgPT4ge1xuICAgIGFyZ3MgPSBpc0FycmF5KGFyZ3MpID8gYXJncyA6IFthcmdzLCBhcmdzXTtcbiAgICBnbC5ibGVuZEVxdWF0aW9uU2VwYXJhdGUoLi4uYXJncyk7XG4gIH0sXG4gIGJsZW5kRnVuYzogKGdsLCBhcmdzKSA9PiB7XG4gICAgYXJncyA9IGlzQXJyYXkoYXJncykgJiYgYXJncy5sZW5ndGggPT09IDIgPyBbLi4uYXJncywgLi4uYXJnc10gOiBhcmdzO1xuICAgIGdsLmJsZW5kRnVuY1NlcGFyYXRlKC4uLmFyZ3MpO1xuICB9LFxuICBjbGVhckNvbG9yOiAoZ2wsIHZhbHVlKSA9PiBnbC5jbGVhckNvbG9yKC4uLnZhbHVlKSxcbiAgY2xlYXJEZXB0aDogKGdsLCB2YWx1ZSkgPT4gZ2wuY2xlYXJEZXB0aCh2YWx1ZSksXG4gIGNsZWFyU3RlbmNpbDogKGdsLCB2YWx1ZSkgPT4gZ2wuY2xlYXJTdGVuY2lsKHZhbHVlKSxcbiAgY29sb3JNYXNrOiAoZ2wsIHZhbHVlKSA9PiBnbC5jb2xvck1hc2soLi4udmFsdWUpLFxuICBjdWxsOiAoZ2wsIHZhbHVlKSA9PiB2YWx1ZSA/IGdsLmVuYWJsZSgyODg0KSA6IGdsLmRpc2FibGUoMjg4NCksXG4gIGN1bGxGYWNlOiAoZ2wsIHZhbHVlKSA9PiBnbC5jdWxsRmFjZSh2YWx1ZSksXG4gIGRlcHRoVGVzdDogKGdsLCB2YWx1ZSkgPT4gdmFsdWUgPyBnbC5lbmFibGUoMjkyOSkgOiBnbC5kaXNhYmxlKDI5MjkpLFxuICBkZXB0aEZ1bmM6IChnbCwgdmFsdWUpID0+IGdsLmRlcHRoRnVuYyh2YWx1ZSksXG4gIGRlcHRoTWFzazogKGdsLCB2YWx1ZSkgPT4gZ2wuZGVwdGhNYXNrKHZhbHVlKSxcbiAgZGVwdGhSYW5nZTogKGdsLCB2YWx1ZSkgPT4gZ2wuZGVwdGhSYW5nZSguLi52YWx1ZSksXG4gIGRpdGhlcjogKGdsLCB2YWx1ZSkgPT4gdmFsdWUgPyBnbC5lbmFibGUoMzAyNCkgOiBnbC5kaXNhYmxlKDMwMjQpLFxuICBkZXJpdmF0aXZlSGludDogKGdsLCB2YWx1ZSkgPT4ge1xuICAgIGdsLmhpbnQoMzU3MjMsIHZhbHVlKTtcbiAgfSxcbiAgZnJvbnRGYWNlOiAoZ2wsIHZhbHVlKSA9PiBnbC5mcm9udEZhY2UodmFsdWUpLFxuICBtaXBtYXBIaW50OiAoZ2wsIHZhbHVlKSA9PiBnbC5oaW50KDMzMTcwLCB2YWx1ZSksXG4gIGxpbmVXaWR0aDogKGdsLCB2YWx1ZSkgPT4gZ2wubGluZVdpZHRoKHZhbHVlKSxcbiAgcG9seWdvbk9mZnNldEZpbGw6IChnbCwgdmFsdWUpID0+IHZhbHVlID8gZ2wuZW5hYmxlKDMyODIzKSA6IGdsLmRpc2FibGUoMzI4MjMpLFxuICBwb2x5Z29uT2Zmc2V0OiAoZ2wsIHZhbHVlKSA9PiBnbC5wb2x5Z29uT2Zmc2V0KC4uLnZhbHVlKSxcbiAgc2FtcGxlQ292ZXJhZ2U6IChnbCwgdmFsdWUpID0+IGdsLnNhbXBsZUNvdmVyYWdlKC4uLnZhbHVlKSxcbiAgc2Npc3NvclRlc3Q6IChnbCwgdmFsdWUpID0+IHZhbHVlID8gZ2wuZW5hYmxlKDMwODkpIDogZ2wuZGlzYWJsZSgzMDg5KSxcbiAgc2Npc3NvcjogKGdsLCB2YWx1ZSkgPT4gZ2wuc2Npc3NvciguLi52YWx1ZSksXG4gIHN0ZW5jaWxUZXN0OiAoZ2wsIHZhbHVlKSA9PiB2YWx1ZSA/IGdsLmVuYWJsZSgyOTYwKSA6IGdsLmRpc2FibGUoMjk2MCksXG4gIHN0ZW5jaWxNYXNrOiAoZ2wsIHZhbHVlKSA9PiB7XG4gICAgdmFsdWUgPSBpc0FycmF5KHZhbHVlKSA/IHZhbHVlIDogW3ZhbHVlLCB2YWx1ZV07XG4gICAgY29uc3QgW21hc2ssIGJhY2tNYXNrXSA9IHZhbHVlO1xuICAgIGdsLnN0ZW5jaWxNYXNrU2VwYXJhdGUoMTAyOCwgbWFzayk7XG4gICAgZ2wuc3RlbmNpbE1hc2tTZXBhcmF0ZSgxMDI5LCBiYWNrTWFzayk7XG4gIH0sXG4gIHN0ZW5jaWxGdW5jOiAoZ2wsIGFyZ3MpID0+IHtcbiAgICBhcmdzID0gaXNBcnJheShhcmdzKSAmJiBhcmdzLmxlbmd0aCA9PT0gMyA/IFsuLi5hcmdzLCAuLi5hcmdzXSA6IGFyZ3M7XG4gICAgY29uc3QgW2Z1bmMsIHJlZiwgbWFzaywgYmFja0Z1bmMsIGJhY2tSZWYsIGJhY2tNYXNrXSA9IGFyZ3M7XG4gICAgZ2wuc3RlbmNpbEZ1bmNTZXBhcmF0ZSgxMDI4LCBmdW5jLCByZWYsIG1hc2spO1xuICAgIGdsLnN0ZW5jaWxGdW5jU2VwYXJhdGUoMTAyOSwgYmFja0Z1bmMsIGJhY2tSZWYsIGJhY2tNYXNrKTtcbiAgfSxcbiAgc3RlbmNpbE9wOiAoZ2wsIGFyZ3MpID0+IHtcbiAgICBhcmdzID0gaXNBcnJheShhcmdzKSAmJiBhcmdzLmxlbmd0aCA9PT0gMyA/IFsuLi5hcmdzLCAuLi5hcmdzXSA6IGFyZ3M7XG4gICAgY29uc3QgW3NmYWlsLCBkcGZhaWwsIGRwcGFzcywgYmFja1NmYWlsLCBiYWNrRHBmYWlsLCBiYWNrRHBwYXNzXSA9IGFyZ3M7XG4gICAgZ2wuc3RlbmNpbE9wU2VwYXJhdGUoMTAyOCwgc2ZhaWwsIGRwZmFpbCwgZHBwYXNzKTtcbiAgICBnbC5zdGVuY2lsT3BTZXBhcmF0ZSgxMDI5LCBiYWNrU2ZhaWwsIGJhY2tEcGZhaWwsIGJhY2tEcHBhc3MpO1xuICB9LFxuICB2aWV3cG9ydDogKGdsLCB2YWx1ZSkgPT4gZ2wudmlld3BvcnQoLi4udmFsdWUpXG59O1xuXG5mdW5jdGlvbiBnZXRWYWx1ZShnbEVudW0sIHZhbHVlcywgY2FjaGUpIHtcbiAgcmV0dXJuIHZhbHVlc1tnbEVudW1dICE9PSB1bmRlZmluZWQgPyB2YWx1ZXNbZ2xFbnVtXSA6IGNhY2hlW2dsRW51bV07XG59XG5cbmV4cG9ydCBjb25zdCBHTF9DT01QT1NJVEVfUEFSQU1FVEVSX1NFVFRFUlMgPSB7XG4gIGJsZW5kRXF1YXRpb246IChnbCwgdmFsdWVzLCBjYWNoZSkgPT4gZ2wuYmxlbmRFcXVhdGlvblNlcGFyYXRlKGdldFZhbHVlKDMyNzc3LCB2YWx1ZXMsIGNhY2hlKSwgZ2V0VmFsdWUoMzQ4NzcsIHZhbHVlcywgY2FjaGUpKSxcbiAgYmxlbmRGdW5jOiAoZ2wsIHZhbHVlcywgY2FjaGUpID0+IGdsLmJsZW5kRnVuY1NlcGFyYXRlKGdldFZhbHVlKDMyOTY5LCB2YWx1ZXMsIGNhY2hlKSwgZ2V0VmFsdWUoMzI5NjgsIHZhbHVlcywgY2FjaGUpLCBnZXRWYWx1ZSgzMjk3MSwgdmFsdWVzLCBjYWNoZSksIGdldFZhbHVlKDMyOTcwLCB2YWx1ZXMsIGNhY2hlKSksXG4gIHBvbHlnb25PZmZzZXQ6IChnbCwgdmFsdWVzLCBjYWNoZSkgPT4gZ2wucG9seWdvbk9mZnNldChnZXRWYWx1ZSgzMjgyNCwgdmFsdWVzLCBjYWNoZSksIGdldFZhbHVlKDEwNzUyLCB2YWx1ZXMsIGNhY2hlKSksXG4gIHNhbXBsZUNvdmVyYWdlOiAoZ2wsIHZhbHVlcywgY2FjaGUpID0+IGdsLnNhbXBsZUNvdmVyYWdlKGdldFZhbHVlKDMyOTM4LCB2YWx1ZXMsIGNhY2hlKSwgZ2V0VmFsdWUoMzI5MzksIHZhbHVlcywgY2FjaGUpKSxcbiAgc3RlbmNpbEZ1bmNGcm9udDogKGdsLCB2YWx1ZXMsIGNhY2hlKSA9PiBnbC5zdGVuY2lsRnVuY1NlcGFyYXRlKDEwMjgsIGdldFZhbHVlKDI5NjIsIHZhbHVlcywgY2FjaGUpLCBnZXRWYWx1ZSgyOTY3LCB2YWx1ZXMsIGNhY2hlKSwgZ2V0VmFsdWUoMjk2MywgdmFsdWVzLCBjYWNoZSkpLFxuICBzdGVuY2lsRnVuY0JhY2s6IChnbCwgdmFsdWVzLCBjYWNoZSkgPT4gZ2wuc3RlbmNpbEZ1bmNTZXBhcmF0ZSgxMDI5LCBnZXRWYWx1ZSgzNDgxNiwgdmFsdWVzLCBjYWNoZSksIGdldFZhbHVlKDM2MDAzLCB2YWx1ZXMsIGNhY2hlKSwgZ2V0VmFsdWUoMzYwMDQsIHZhbHVlcywgY2FjaGUpKSxcbiAgc3RlbmNpbE9wRnJvbnQ6IChnbCwgdmFsdWVzLCBjYWNoZSkgPT4gZ2wuc3RlbmNpbE9wU2VwYXJhdGUoMTAyOCwgZ2V0VmFsdWUoMjk2NCwgdmFsdWVzLCBjYWNoZSksIGdldFZhbHVlKDI5NjUsIHZhbHVlcywgY2FjaGUpLCBnZXRWYWx1ZSgyOTY2LCB2YWx1ZXMsIGNhY2hlKSksXG4gIHN0ZW5jaWxPcEJhY2s6IChnbCwgdmFsdWVzLCBjYWNoZSkgPT4gZ2wuc3RlbmNpbE9wU2VwYXJhdGUoMTAyOSwgZ2V0VmFsdWUoMzQ4MTcsIHZhbHVlcywgY2FjaGUpLCBnZXRWYWx1ZSgzNDgxOCwgdmFsdWVzLCBjYWNoZSksIGdldFZhbHVlKDM0ODE5LCB2YWx1ZXMsIGNhY2hlKSlcbn07XG5leHBvcnQgY29uc3QgR0xfSE9PS0VEX1NFVFRFUlMgPSB7XG4gIGVuYWJsZTogKHVwZGF0ZSwgY2FwYWJpbGl0eSkgPT4gdXBkYXRlKHtcbiAgICBbY2FwYWJpbGl0eV06IHRydWVcbiAgfSksXG4gIGRpc2FibGU6ICh1cGRhdGUsIGNhcGFiaWxpdHkpID0+IHVwZGF0ZSh7XG4gICAgW2NhcGFiaWxpdHldOiBmYWxzZVxuICB9KSxcbiAgcGl4ZWxTdG9yZWk6ICh1cGRhdGUsIHBuYW1lLCB2YWx1ZSkgPT4gdXBkYXRlKHtcbiAgICBbcG5hbWVdOiB2YWx1ZVxuICB9KSxcbiAgaGludDogKHVwZGF0ZSwgcG5hbWUsIGhpbnQpID0+IHVwZGF0ZSh7XG4gICAgW3BuYW1lXTogaGludFxuICB9KSxcbiAgYmluZEZyYW1lYnVmZmVyOiAodXBkYXRlLCB0YXJnZXQsIGZyYW1lYnVmZmVyKSA9PiB7XG4gICAgc3dpdGNoICh0YXJnZXQpIHtcbiAgICAgIGNhc2UgMzYxNjA6XG4gICAgICAgIHJldHVybiB1cGRhdGUoe1xuICAgICAgICAgIFszNjAwNl06IGZyYW1lYnVmZmVyLFxuICAgICAgICAgIFszNjAxMF06IGZyYW1lYnVmZmVyXG4gICAgICAgIH0pO1xuXG4gICAgICBjYXNlIDM2MDA5OlxuICAgICAgICByZXR1cm4gdXBkYXRlKHtcbiAgICAgICAgICBbMzYwMDZdOiBmcmFtZWJ1ZmZlclxuICAgICAgICB9KTtcblxuICAgICAgY2FzZSAzNjAwODpcbiAgICAgICAgcmV0dXJuIHVwZGF0ZSh7XG4gICAgICAgICAgWzM2MDEwXTogZnJhbWVidWZmZXJcbiAgICAgICAgfSk7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfSxcbiAgYmxlbmRDb2xvcjogKHVwZGF0ZSwgciwgZywgYiwgYSkgPT4gdXBkYXRlKHtcbiAgICBbMzI3NzNdOiBuZXcgRmxvYXQzMkFycmF5KFtyLCBnLCBiLCBhXSlcbiAgfSksXG4gIGJsZW5kRXF1YXRpb246ICh1cGRhdGUsIG1vZGUpID0+IHVwZGF0ZSh7XG4gICAgWzMyNzc3XTogbW9kZSxcbiAgICBbMzQ4NzddOiBtb2RlXG4gIH0pLFxuICBibGVuZEVxdWF0aW9uU2VwYXJhdGU6ICh1cGRhdGUsIG1vZGVSR0IsIG1vZGVBbHBoYSkgPT4gdXBkYXRlKHtcbiAgICBbMzI3NzddOiBtb2RlUkdCLFxuICAgIFszNDg3N106IG1vZGVBbHBoYVxuICB9KSxcbiAgYmxlbmRGdW5jOiAodXBkYXRlLCBzcmMsIGRzdCkgPT4gdXBkYXRlKHtcbiAgICBbMzI5NjldOiBzcmMsXG4gICAgWzMyOTY4XTogZHN0LFxuICAgIFszMjk3MV06IHNyYyxcbiAgICBbMzI5NzBdOiBkc3RcbiAgfSksXG4gIGJsZW5kRnVuY1NlcGFyYXRlOiAodXBkYXRlLCBzcmNSR0IsIGRzdFJHQiwgc3JjQWxwaGEsIGRzdEFscGhhKSA9PiB1cGRhdGUoe1xuICAgIFszMjk2OV06IHNyY1JHQixcbiAgICBbMzI5NjhdOiBkc3RSR0IsXG4gICAgWzMyOTcxXTogc3JjQWxwaGEsXG4gICAgWzMyOTcwXTogZHN0QWxwaGFcbiAgfSksXG4gIGNsZWFyQ29sb3I6ICh1cGRhdGUsIHIsIGcsIGIsIGEpID0+IHVwZGF0ZSh7XG4gICAgWzMxMDZdOiBuZXcgRmxvYXQzMkFycmF5KFtyLCBnLCBiLCBhXSlcbiAgfSksXG4gIGNsZWFyRGVwdGg6ICh1cGRhdGUsIGRlcHRoKSA9PiB1cGRhdGUoe1xuICAgIFsyOTMxXTogZGVwdGhcbiAgfSksXG4gIGNsZWFyU3RlbmNpbDogKHVwZGF0ZSwgcykgPT4gdXBkYXRlKHtcbiAgICBbMjk2MV06IHNcbiAgfSksXG4gIGNvbG9yTWFzazogKHVwZGF0ZSwgciwgZywgYiwgYSkgPT4gdXBkYXRlKHtcbiAgICBbMzEwN106IFtyLCBnLCBiLCBhXVxuICB9KSxcbiAgY3VsbEZhY2U6ICh1cGRhdGUsIG1vZGUpID0+IHVwZGF0ZSh7XG4gICAgWzI4ODVdOiBtb2RlXG4gIH0pLFxuICBkZXB0aEZ1bmM6ICh1cGRhdGUsIGZ1bmMpID0+IHVwZGF0ZSh7XG4gICAgWzI5MzJdOiBmdW5jXG4gIH0pLFxuICBkZXB0aFJhbmdlOiAodXBkYXRlLCB6TmVhciwgekZhcikgPT4gdXBkYXRlKHtcbiAgICBbMjkyOF06IG5ldyBGbG9hdDMyQXJyYXkoW3pOZWFyLCB6RmFyXSlcbiAgfSksXG4gIGRlcHRoTWFzazogKHVwZGF0ZSwgbWFzaykgPT4gdXBkYXRlKHtcbiAgICBbMjkzMF06IG1hc2tcbiAgfSksXG4gIGZyb250RmFjZTogKHVwZGF0ZSwgZmFjZSkgPT4gdXBkYXRlKHtcbiAgICBbMjg4Nl06IGZhY2VcbiAgfSksXG4gIGxpbmVXaWR0aDogKHVwZGF0ZSwgd2lkdGgpID0+IHVwZGF0ZSh7XG4gICAgWzI4NDldOiB3aWR0aFxuICB9KSxcbiAgcG9seWdvbk9mZnNldDogKHVwZGF0ZSwgZmFjdG9yLCB1bml0cykgPT4gdXBkYXRlKHtcbiAgICBbMzI4MjRdOiBmYWN0b3IsXG4gICAgWzEwNzUyXTogdW5pdHNcbiAgfSksXG4gIHNhbXBsZUNvdmVyYWdlOiAodXBkYXRlLCB2YWx1ZSwgaW52ZXJ0KSA9PiB1cGRhdGUoe1xuICAgIFszMjkzOF06IHZhbHVlLFxuICAgIFszMjkzOV06IGludmVydFxuICB9KSxcbiAgc2Npc3NvcjogKHVwZGF0ZSwgeCwgeSwgd2lkdGgsIGhlaWdodCkgPT4gdXBkYXRlKHtcbiAgICBbMzA4OF06IG5ldyBJbnQzMkFycmF5KFt4LCB5LCB3aWR0aCwgaGVpZ2h0XSlcbiAgfSksXG4gIHN0ZW5jaWxNYXNrOiAodXBkYXRlLCBtYXNrKSA9PiB1cGRhdGUoe1xuICAgIFsyOTY4XTogbWFzayxcbiAgICBbMzYwMDVdOiBtYXNrXG4gIH0pLFxuICBzdGVuY2lsTWFza1NlcGFyYXRlOiAodXBkYXRlLCBmYWNlLCBtYXNrKSA9PiB1cGRhdGUoe1xuICAgIFtmYWNlID09PSAxMDI4ID8gMjk2OCA6IDM2MDA1XTogbWFza1xuICB9KSxcbiAgc3RlbmNpbEZ1bmM6ICh1cGRhdGUsIGZ1bmMsIHJlZiwgbWFzaykgPT4gdXBkYXRlKHtcbiAgICBbMjk2Ml06IGZ1bmMsXG4gICAgWzI5NjddOiByZWYsXG4gICAgWzI5NjNdOiBtYXNrLFxuICAgIFszNDgxNl06IGZ1bmMsXG4gICAgWzM2MDAzXTogcmVmLFxuICAgIFszNjAwNF06IG1hc2tcbiAgfSksXG4gIHN0ZW5jaWxGdW5jU2VwYXJhdGU6ICh1cGRhdGUsIGZhY2UsIGZ1bmMsIHJlZiwgbWFzaykgPT4gdXBkYXRlKHtcbiAgICBbZmFjZSA9PT0gMTAyOCA/IDI5NjIgOiAzNDgxNl06IGZ1bmMsXG4gICAgW2ZhY2UgPT09IDEwMjggPyAyOTY3IDogMzYwMDNdOiByZWYsXG4gICAgW2ZhY2UgPT09IDEwMjggPyAyOTYzIDogMzYwMDRdOiBtYXNrXG4gIH0pLFxuICBzdGVuY2lsT3A6ICh1cGRhdGUsIGZhaWwsIHpmYWlsLCB6cGFzcykgPT4gdXBkYXRlKHtcbiAgICBbMjk2NF06IGZhaWwsXG4gICAgWzI5NjVdOiB6ZmFpbCxcbiAgICBbMjk2Nl06IHpwYXNzLFxuICAgIFszNDgxN106IGZhaWwsXG4gICAgWzM0ODE4XTogemZhaWwsXG4gICAgWzM0ODE5XTogenBhc3NcbiAgfSksXG4gIHN0ZW5jaWxPcFNlcGFyYXRlOiAodXBkYXRlLCBmYWNlLCBmYWlsLCB6ZmFpbCwgenBhc3MpID0+IHVwZGF0ZSh7XG4gICAgW2ZhY2UgPT09IDEwMjggPyAyOTY0IDogMzQ4MTddOiBmYWlsLFxuICAgIFtmYWNlID09PSAxMDI4ID8gMjk2NSA6IDM0ODE4XTogemZhaWwsXG4gICAgW2ZhY2UgPT09IDEwMjggPyAyOTY2IDogMzQ4MTldOiB6cGFzc1xuICB9KSxcbiAgdmlld3BvcnQ6ICh1cGRhdGUsIHgsIHksIHdpZHRoLCBoZWlnaHQpID0+IHVwZGF0ZSh7XG4gICAgWzI5NzhdOiBbeCwgeSwgd2lkdGgsIGhlaWdodF1cbiAgfSlcbn07XG5cbmNvbnN0IGlzRW5hYmxlZCA9IChnbCwga2V5KSA9PiBnbC5pc0VuYWJsZWQoa2V5KTtcblxuZXhwb3J0IGNvbnN0IEdMX1BBUkFNRVRFUl9HRVRURVJTID0ge1xuICBbMzA0Ml06IGlzRW5hYmxlZCxcbiAgWzI4ODRdOiBpc0VuYWJsZWQsXG4gIFsyOTI5XTogaXNFbmFibGVkLFxuICBbMzAyNF06IGlzRW5hYmxlZCxcbiAgWzMyODIzXTogaXNFbmFibGVkLFxuICBbMzI5MjZdOiBpc0VuYWJsZWQsXG4gIFszMjkyOF06IGlzRW5hYmxlZCxcbiAgWzMwODldOiBpc0VuYWJsZWQsXG4gIFsyOTYwXTogaXNFbmFibGVkLFxuICBbMzU5NzddOiBpc0VuYWJsZWRcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD13ZWJnbC1wYXJhbWV0ZXItdGFibGVzLmpzLm1hcCIsImV4cG9ydCBmdW5jdGlvbiBhc3NlcnQoY29uZGl0aW9uLCBtZXNzYWdlKSB7XG4gIGlmICghY29uZGl0aW9uKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UgfHwgJ2x1bWEuZ2w6IGFzc2VydGlvbiBmYWlsZWQuJyk7XG4gIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFzc2VydC5qcy5tYXAiLCJleHBvcnQgZnVuY3Rpb24gY3NzVG9EZXZpY2VSYXRpbyhnbCkge1xuICBjb25zdCB7XG4gICAgbHVtYVxuICB9ID0gZ2w7XG5cbiAgaWYgKGdsLmNhbnZhcyAmJiBsdW1hKSB7XG4gICAgY29uc3Qge1xuICAgICAgY2xpZW50V2lkdGhcbiAgICB9ID0gbHVtYS5jYW52YXNTaXplSW5mbztcbiAgICByZXR1cm4gY2xpZW50V2lkdGggPyBnbC5kcmF3aW5nQnVmZmVyV2lkdGggLyBjbGllbnRXaWR0aCA6IDE7XG4gIH1cblxuICByZXR1cm4gMTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBjc3NUb0RldmljZVBpeGVscyhnbCwgY3NzUGl4ZWwsIHlJbnZlcnQgPSB0cnVlKSB7XG4gIGNvbnN0IHJhdGlvID0gY3NzVG9EZXZpY2VSYXRpbyhnbCk7XG4gIGNvbnN0IHdpZHRoID0gZ2wuZHJhd2luZ0J1ZmZlcldpZHRoO1xuICBjb25zdCBoZWlnaHQgPSBnbC5kcmF3aW5nQnVmZmVySGVpZ2h0O1xuICByZXR1cm4gc2NhbGVQaXhlbHMoY3NzUGl4ZWwsIHJhdGlvLCB3aWR0aCwgaGVpZ2h0LCB5SW52ZXJ0KTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXREZXZpY2VQaXhlbFJhdGlvKHVzZURldmljZVBpeGVscykge1xuICBjb25zdCB3aW5kb3dSYXRpbyA9IHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnID8gMSA6IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDE7XG5cbiAgaWYgKE51bWJlci5pc0Zpbml0ZSh1c2VEZXZpY2VQaXhlbHMpKSB7XG4gICAgcmV0dXJuIHVzZURldmljZVBpeGVscyA8PSAwID8gMSA6IHVzZURldmljZVBpeGVscztcbiAgfVxuXG4gIHJldHVybiB1c2VEZXZpY2VQaXhlbHMgPyB3aW5kb3dSYXRpbyA6IDE7XG59XG5cbmZ1bmN0aW9uIHNjYWxlUGl4ZWxzKHBpeGVsLCByYXRpbywgd2lkdGgsIGhlaWdodCwgeUludmVydCkge1xuICBjb25zdCB4ID0gc2NhbGVYKHBpeGVsWzBdLCByYXRpbywgd2lkdGgpO1xuICBsZXQgeSA9IHNjYWxlWShwaXhlbFsxXSwgcmF0aW8sIGhlaWdodCwgeUludmVydCk7XG4gIGxldCB0ID0gc2NhbGVYKHBpeGVsWzBdICsgMSwgcmF0aW8sIHdpZHRoKTtcbiAgY29uc3QgeEhpZ2ggPSB0ID09PSB3aWR0aCAtIDEgPyB0IDogdCAtIDE7XG4gIHQgPSBzY2FsZVkocGl4ZWxbMV0gKyAxLCByYXRpbywgaGVpZ2h0LCB5SW52ZXJ0KTtcbiAgbGV0IHlIaWdoO1xuXG4gIGlmICh5SW52ZXJ0KSB7XG4gICAgdCA9IHQgPT09IDAgPyB0IDogdCArIDE7XG4gICAgeUhpZ2ggPSB5O1xuICAgIHkgPSB0O1xuICB9IGVsc2Uge1xuICAgIHlIaWdoID0gdCA9PT0gaGVpZ2h0IC0gMSA/IHQgOiB0IC0gMTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgeCxcbiAgICB5LFxuICAgIHdpZHRoOiBNYXRoLm1heCh4SGlnaCAtIHggKyAxLCAxKSxcbiAgICBoZWlnaHQ6IE1hdGgubWF4KHlIaWdoIC0geSArIDEsIDEpXG4gIH07XG59XG5cbmZ1bmN0aW9uIHNjYWxlWCh4LCByYXRpbywgd2lkdGgpIHtcbiAgY29uc3QgciA9IE1hdGgubWluKE1hdGgucm91bmQoeCAqIHJhdGlvKSwgd2lkdGggLSAxKTtcbiAgcmV0dXJuIHI7XG59XG5cbmZ1bmN0aW9uIHNjYWxlWSh5LCByYXRpbywgaGVpZ2h0LCB5SW52ZXJ0KSB7XG4gIHJldHVybiB5SW52ZXJ0ID8gTWF0aC5tYXgoMCwgaGVpZ2h0IC0gMSAtIE1hdGgucm91bmQoeSAqIHJhdGlvKSkgOiBNYXRoLm1pbihNYXRoLnJvdW5kKHkgKiByYXRpbyksIGhlaWdodCAtIDEpO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGV2aWNlLXBpeGVscy5qcy5tYXAiLCJpbXBvcnQgeyBMb2cgfSBmcm9tICdwcm9iZS5nbCc7XG5leHBvcnQgY29uc3QgbG9nID0gbmV3IExvZyh7XG4gIGlkOiAnbHVtYS5nbCdcbn0pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bG9nLmpzLm1hcCIsImV4cG9ydCBmdW5jdGlvbiBpc09iamVjdEVtcHR5KG9iamVjdCkge1xuICBmb3IgKGNvbnN0IGtleSBpbiBvYmplY3QpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBkZWVwQXJyYXlFcXVhbCh4LCB5KSB7XG4gIGlmICh4ID09PSB5KSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBjb25zdCBpc0FycmF5WCA9IEFycmF5LmlzQXJyYXkoeCkgfHwgQXJyYXlCdWZmZXIuaXNWaWV3KHgpO1xuICBjb25zdCBpc0FycmF5WSA9IEFycmF5LmlzQXJyYXkoeSkgfHwgQXJyYXlCdWZmZXIuaXNWaWV3KHkpO1xuXG4gIGlmIChpc0FycmF5WCAmJiBpc0FycmF5WSAmJiB4Lmxlbmd0aCA9PT0geS5sZW5ndGgpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHgubGVuZ3RoOyArK2kpIHtcbiAgICAgIGlmICh4W2ldICE9PSB5W2ldKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXV0aWxzLmpzLm1hcCIsImltcG9ydCB7IGFzc2VydCB9IGZyb20gJy4vYXNzZXJ0JztcbmNvbnN0IEVSUl9DT05URVhUID0gJ0ludmFsaWQgV2ViR0xSZW5kZXJpbmdDb250ZXh0JztcbmV4cG9ydCBjb25zdCBFUlJfV0VCR0wgPSBFUlJfQ09OVEVYVDtcbmV4cG9ydCBjb25zdCBFUlJfV0VCR0wyID0gJ1JlcXVpcmVzIFdlYkdMMic7XG5leHBvcnQgZnVuY3Rpb24gaXNXZWJHTChnbCkge1xuICBpZiAodHlwZW9mIFdlYkdMUmVuZGVyaW5nQ29udGV4dCAhPT0gJ3VuZGVmaW5lZCcgJiYgZ2wgaW5zdGFuY2VvZiBXZWJHTFJlbmRlcmluZ0NvbnRleHQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgV2ViR0wyUmVuZGVyaW5nQ29udGV4dCAhPT0gJ3VuZGVmaW5lZCcgJiYgZ2wgaW5zdGFuY2VvZiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0KSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gQm9vbGVhbihnbCAmJiBOdW1iZXIuaXNGaW5pdGUoZ2wuX3ZlcnNpb24pKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc1dlYkdMMihnbCkge1xuICBpZiAodHlwZW9mIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQgIT09ICd1bmRlZmluZWQnICYmIGdsIGluc3RhbmNlb2YgV2ViR0wyUmVuZGVyaW5nQ29udGV4dCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIEJvb2xlYW4oZ2wgJiYgZ2wuX3ZlcnNpb24gPT09IDIpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldFdlYkdMMkNvbnRleHQoZ2wpIHtcbiAgcmV0dXJuIGlzV2ViR0wyKGdsKSA/IGdsIDogbnVsbDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRXZWJHTENvbnRleHQoZ2wpIHtcbiAgYXNzZXJ0KGlzV2ViR0woZ2wpLCBFUlJfQ09OVEVYVCk7XG4gIHJldHVybiBnbDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRXZWJHTDJDb250ZXh0KGdsKSB7XG4gIGFzc2VydChpc1dlYkdMMihnbCksIEVSUl9XRUJHTDIpO1xuICByZXR1cm4gZ2w7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD13ZWJnbC1jaGVja3MuanMubWFwIiwiaW1wb3J0IHsgVkVSVEVYX1NIQURFUiwgRlJBR01FTlRfU0hBREVSIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHsgcmVzb2x2ZU1vZHVsZXMgfSBmcm9tICcuL3Jlc29sdmUtbW9kdWxlcyc7XG5pbXBvcnQgeyBnZXRQbGF0Zm9ybVNoYWRlckRlZmluZXMsIGdldFZlcnNpb25EZWZpbmVzIH0gZnJvbSAnLi9wbGF0Zm9ybS1kZWZpbmVzJztcbmltcG9ydCBpbmplY3RTaGFkZXIsIHsgREVDTEFSQVRJT05fSU5KRUNUX01BUktFUiB9IGZyb20gJy4vaW5qZWN0LXNoYWRlcic7XG5pbXBvcnQgdHJhbnNwaWxlU2hhZGVyIGZyb20gJy4vdHJhbnNwaWxlLXNoYWRlcic7XG5pbXBvcnQgeyBhc3NlcnQgfSBmcm9tICcuLi91dGlscyc7XG5jb25zdCBJTkpFQ1RfU0hBREVSX0RFQ0xBUkFUSU9OUyA9IGBcXG5cXG4ke0RFQ0xBUkFUSU9OX0lOSkVDVF9NQVJLRVJ9XFxuXFxuYDtcbmNvbnN0IFNIQURFUl9UWVBFID0ge1xuICBbVkVSVEVYX1NIQURFUl06ICd2ZXJ0ZXgnLFxuICBbRlJBR01FTlRfU0hBREVSXTogJ2ZyYWdtZW50J1xufTtcbmNvbnN0IEZSQUdNRU5UX1NIQURFUl9QUk9MT0dVRSA9IGBcXFxucHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xuXG5gO1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VtYmxlU2hhZGVycyhnbCwgb3B0cykge1xuICBjb25zdCB7XG4gICAgdnMsXG4gICAgZnNcbiAgfSA9IG9wdHM7XG4gIGNvbnN0IG1vZHVsZXMgPSByZXNvbHZlTW9kdWxlcyhvcHRzLm1vZHVsZXMgfHwgW10pO1xuICByZXR1cm4ge1xuICAgIGdsLFxuICAgIHZzOiBhc3NlbWJsZVNoYWRlcihnbCwgT2JqZWN0LmFzc2lnbih7fSwgb3B0cywge1xuICAgICAgc291cmNlOiB2cyxcbiAgICAgIHR5cGU6IFZFUlRFWF9TSEFERVIsXG4gICAgICBtb2R1bGVzXG4gICAgfSkpLFxuICAgIGZzOiBhc3NlbWJsZVNoYWRlcihnbCwgT2JqZWN0LmFzc2lnbih7fSwgb3B0cywge1xuICAgICAgc291cmNlOiBmcyxcbiAgICAgIHR5cGU6IEZSQUdNRU5UX1NIQURFUixcbiAgICAgIG1vZHVsZXNcbiAgICB9KSksXG4gICAgZ2V0VW5pZm9ybXM6IGFzc2VtYmxlR2V0VW5pZm9ybXMobW9kdWxlcylcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXNzZW1ibGVTaGFkZXIoZ2wsIHtcbiAgaWQsXG4gIHNvdXJjZSxcbiAgdHlwZSxcbiAgbW9kdWxlcyxcbiAgZGVmaW5lcyA9IHt9LFxuICBob29rRnVuY3Rpb25zID0gW10sXG4gIGluamVjdCA9IHt9LFxuICB0cmFuc3BpbGVUb0dMU0wxMDAgPSBmYWxzZSxcbiAgcHJvbG9ndWUgPSB0cnVlLFxuICBsb2dcbn0pIHtcbiAgYXNzZXJ0KHR5cGVvZiBzb3VyY2UgPT09ICdzdHJpbmcnLCAnc2hhZGVyIHNvdXJjZSBtdXN0IGJlIGEgc3RyaW5nJyk7XG4gIGNvbnN0IGlzVmVydGV4ID0gdHlwZSA9PT0gVkVSVEVYX1NIQURFUjtcbiAgY29uc3Qgc291cmNlTGluZXMgPSBzb3VyY2Uuc3BsaXQoJ1xcbicpO1xuICBsZXQgZ2xzbFZlcnNpb24gPSAxMDA7XG4gIGxldCB2ZXJzaW9uTGluZSA9ICcnO1xuICBsZXQgY29yZVNvdXJjZSA9IHNvdXJjZTtcblxuICBpZiAoc291cmNlTGluZXNbMF0uaW5kZXhPZignI3ZlcnNpb24gJykgPT09IDApIHtcbiAgICBnbHNsVmVyc2lvbiA9IDMwMDtcbiAgICB2ZXJzaW9uTGluZSA9IHNvdXJjZUxpbmVzWzBdO1xuICAgIGNvcmVTb3VyY2UgPSBzb3VyY2VMaW5lcy5zbGljZSgxKS5qb2luKCdcXG4nKTtcbiAgfSBlbHNlIHtcbiAgICB2ZXJzaW9uTGluZSA9IGAjdmVyc2lvbiAke2dsc2xWZXJzaW9ufWA7XG4gIH1cblxuICBjb25zdCBhbGxEZWZpbmVzID0ge307XG4gIG1vZHVsZXMuZm9yRWFjaChtb2R1bGUgPT4ge1xuICAgIE9iamVjdC5hc3NpZ24oYWxsRGVmaW5lcywgbW9kdWxlLmdldERlZmluZXMoKSk7XG4gIH0pO1xuICBPYmplY3QuYXNzaWduKGFsbERlZmluZXMsIGRlZmluZXMpO1xuICBsZXQgYXNzZW1ibGVkU291cmNlID0gcHJvbG9ndWUgPyBgXFxcbiR7dmVyc2lvbkxpbmV9XG4ke2dldFNoYWRlck5hbWUoe1xuICAgIGlkLFxuICAgIHNvdXJjZSxcbiAgICB0eXBlXG4gIH0pfVxuJHtnZXRTaGFkZXJUeXBlKHtcbiAgICB0eXBlXG4gIH0pfVxuJHtnZXRQbGF0Zm9ybVNoYWRlckRlZmluZXMoZ2wpfVxuJHtnZXRWZXJzaW9uRGVmaW5lcyhnbCwgZ2xzbFZlcnNpb24sICFpc1ZlcnRleCl9XG4ke2dldEFwcGxpY2F0aW9uRGVmaW5lcyhhbGxEZWZpbmVzKX1cbiR7aXNWZXJ0ZXggPyAnJyA6IEZSQUdNRU5UX1NIQURFUl9QUk9MT0dVRX1cbmAgOiBgJHt2ZXJzaW9uTGluZX1cbmA7XG4gIGNvbnN0IGhvb2tGdW5jdGlvbk1hcCA9IG5vcm1hbGl6ZUhvb2tGdW5jdGlvbnMoaG9va0Z1bmN0aW9ucyk7XG4gIGNvbnN0IGhvb2tJbmplY3Rpb25zID0ge307XG4gIGNvbnN0IGRlY2xJbmplY3Rpb25zID0ge307XG4gIGNvbnN0IG1haW5JbmplY3Rpb25zID0ge307XG5cbiAgZm9yIChjb25zdCBrZXkgaW4gaW5qZWN0KSB7XG4gICAgY29uc3QgaW5qZWN0aW9uID0gdHlwZW9mIGluamVjdFtrZXldID09PSAnc3RyaW5nJyA/IHtcbiAgICAgIGluamVjdGlvbjogaW5qZWN0W2tleV0sXG4gICAgICBvcmRlcjogMFxuICAgIH0gOiBpbmplY3Rba2V5XTtcbiAgICBjb25zdCBtYXRjaCA9IGtleS5tYXRjaCgvXih2fGYpczooIyk/KFtcXHctXSspJC8pO1xuXG4gICAgaWYgKG1hdGNoKSB7XG4gICAgICBjb25zdCBoYXNoID0gbWF0Y2hbMl07XG4gICAgICBjb25zdCBuYW1lID0gbWF0Y2hbM107XG5cbiAgICAgIGlmIChoYXNoKSB7XG4gICAgICAgIGlmIChuYW1lID09PSAnZGVjbCcpIHtcbiAgICAgICAgICBkZWNsSW5qZWN0aW9uc1trZXldID0gW2luamVjdGlvbl07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbWFpbkluamVjdGlvbnNba2V5XSA9IFtpbmplY3Rpb25dO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBob29rSW5qZWN0aW9uc1trZXldID0gW2luamVjdGlvbl07XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG1haW5JbmplY3Rpb25zW2tleV0gPSBbaW5qZWN0aW9uXTtcbiAgICB9XG4gIH1cblxuICBmb3IgKGNvbnN0IG1vZHVsZSBvZiBtb2R1bGVzKSB7XG4gICAgaWYgKGxvZykge1xuICAgICAgbW9kdWxlLmNoZWNrRGVwcmVjYXRpb25zKGNvcmVTb3VyY2UsIGxvZyk7XG4gICAgfVxuXG4gICAgY29uc3QgbW9kdWxlU291cmNlID0gbW9kdWxlLmdldE1vZHVsZVNvdXJjZSh0eXBlLCBnbHNsVmVyc2lvbik7XG4gICAgYXNzZW1ibGVkU291cmNlICs9IG1vZHVsZVNvdXJjZTtcbiAgICBjb25zdCBpbmplY3Rpb25zID0gbW9kdWxlLmluamVjdGlvbnNbdHlwZV07XG5cbiAgICBmb3IgKGNvbnN0IGtleSBpbiBpbmplY3Rpb25zKSB7XG4gICAgICBjb25zdCBtYXRjaCA9IGtleS5tYXRjaCgvXih2fGYpczojKFtcXHctXSspJC8pO1xuXG4gICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgY29uc3QgbmFtZSA9IG1hdGNoWzJdO1xuICAgICAgICBjb25zdCBpbmplY3Rpb25UeXBlID0gbmFtZSA9PT0gJ2RlY2wnID8gZGVjbEluamVjdGlvbnMgOiBtYWluSW5qZWN0aW9ucztcbiAgICAgICAgaW5qZWN0aW9uVHlwZVtrZXldID0gaW5qZWN0aW9uVHlwZVtrZXldIHx8IFtdO1xuICAgICAgICBpbmplY3Rpb25UeXBlW2tleV0ucHVzaChpbmplY3Rpb25zW2tleV0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaG9va0luamVjdGlvbnNba2V5XSA9IGhvb2tJbmplY3Rpb25zW2tleV0gfHwgW107XG4gICAgICAgIGhvb2tJbmplY3Rpb25zW2tleV0ucHVzaChpbmplY3Rpb25zW2tleV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFzc2VtYmxlZFNvdXJjZSArPSBJTkpFQ1RfU0hBREVSX0RFQ0xBUkFUSU9OUztcbiAgYXNzZW1ibGVkU291cmNlID0gaW5qZWN0U2hhZGVyKGFzc2VtYmxlZFNvdXJjZSwgdHlwZSwgZGVjbEluamVjdGlvbnMpO1xuICBhc3NlbWJsZWRTb3VyY2UgKz0gZ2V0SG9va0Z1bmN0aW9ucyhob29rRnVuY3Rpb25NYXBbdHlwZV0sIGhvb2tJbmplY3Rpb25zKTtcbiAgYXNzZW1ibGVkU291cmNlICs9IGNvcmVTb3VyY2U7XG4gIGFzc2VtYmxlZFNvdXJjZSA9IGluamVjdFNoYWRlcihhc3NlbWJsZWRTb3VyY2UsIHR5cGUsIG1haW5JbmplY3Rpb25zKTtcbiAgYXNzZW1ibGVkU291cmNlID0gdHJhbnNwaWxlU2hhZGVyKGFzc2VtYmxlZFNvdXJjZSwgdHJhbnNwaWxlVG9HTFNMMTAwID8gMTAwIDogZ2xzbFZlcnNpb24sIGlzVmVydGV4KTtcbiAgcmV0dXJuIGFzc2VtYmxlZFNvdXJjZTtcbn1cblxuZnVuY3Rpb24gYXNzZW1ibGVHZXRVbmlmb3Jtcyhtb2R1bGVzKSB7XG4gIHJldHVybiBmdW5jdGlvbiBnZXRVbmlmb3JtcyhvcHRzKSB7XG4gICAgY29uc3QgdW5pZm9ybXMgPSB7fTtcblxuICAgIGZvciAoY29uc3QgbW9kdWxlIG9mIG1vZHVsZXMpIHtcbiAgICAgIGNvbnN0IG1vZHVsZVVuaWZvcm1zID0gbW9kdWxlLmdldFVuaWZvcm1zKG9wdHMsIHVuaWZvcm1zKTtcbiAgICAgIE9iamVjdC5hc3NpZ24odW5pZm9ybXMsIG1vZHVsZVVuaWZvcm1zKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdW5pZm9ybXM7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldFNoYWRlclR5cGUoe1xuICB0eXBlXG59KSB7XG4gIHJldHVybiBgXG4jZGVmaW5lIFNIQURFUl9UWVBFXyR7U0hBREVSX1RZUEVbdHlwZV0udG9VcHBlckNhc2UoKX1cbmA7XG59XG5cbmZ1bmN0aW9uIGdldFNoYWRlck5hbWUoe1xuICBpZCxcbiAgc291cmNlLFxuICB0eXBlXG59KSB7XG4gIGNvbnN0IGluamVjdFNoYWRlck5hbWUgPSBpZCAmJiB0eXBlb2YgaWQgPT09ICdzdHJpbmcnICYmIHNvdXJjZS5pbmRleE9mKCdTSEFERVJfTkFNRScpID09PSAtMTtcbiAgcmV0dXJuIGluamVjdFNoYWRlck5hbWUgPyBgXG4jZGVmaW5lIFNIQURFUl9OQU1FICR7aWR9XyR7U0hBREVSX1RZUEVbdHlwZV19XG5cbmAgOiAnJztcbn1cblxuZnVuY3Rpb24gZ2V0QXBwbGljYXRpb25EZWZpbmVzKGRlZmluZXMgPSB7fSkge1xuICBsZXQgY291bnQgPSAwO1xuICBsZXQgc291cmNlVGV4dCA9ICcnO1xuXG4gIGZvciAoY29uc3QgZGVmaW5lIGluIGRlZmluZXMpIHtcbiAgICBpZiAoY291bnQgPT09IDApIHtcbiAgICAgIHNvdXJjZVRleHQgKz0gJ1xcbi8vIEFQUExJQ0FUSU9OIERFRklORVNcXG4nO1xuICAgIH1cblxuICAgIGNvdW50Kys7XG4gICAgY29uc3QgdmFsdWUgPSBkZWZpbmVzW2RlZmluZV07XG5cbiAgICBpZiAodmFsdWUgfHwgTnVtYmVyLmlzRmluaXRlKHZhbHVlKSkge1xuICAgICAgc291cmNlVGV4dCArPSBgI2RlZmluZSAke2RlZmluZS50b1VwcGVyQ2FzZSgpfSAke2RlZmluZXNbZGVmaW5lXX1cXG5gO1xuICAgIH1cbiAgfVxuXG4gIGlmIChjb3VudCA9PT0gMCkge1xuICAgIHNvdXJjZVRleHQgKz0gJ1xcbic7XG4gIH1cblxuICByZXR1cm4gc291cmNlVGV4dDtcbn1cblxuZnVuY3Rpb24gZ2V0SG9va0Z1bmN0aW9ucyhob29rRnVuY3Rpb25zLCBob29rSW5qZWN0aW9ucykge1xuICBsZXQgcmVzdWx0ID0gJyc7XG5cbiAgZm9yIChjb25zdCBob29rTmFtZSBpbiBob29rRnVuY3Rpb25zKSB7XG4gICAgY29uc3QgaG9va0Z1bmN0aW9uID0gaG9va0Z1bmN0aW9uc1tob29rTmFtZV07XG4gICAgcmVzdWx0ICs9IGB2b2lkICR7aG9va0Z1bmN0aW9uLnNpZ25hdHVyZX0ge1xcbmA7XG5cbiAgICBpZiAoaG9va0Z1bmN0aW9uLmhlYWRlcikge1xuICAgICAgcmVzdWx0ICs9IGAgICR7aG9va0Z1bmN0aW9uLmhlYWRlcn1gO1xuICAgIH1cblxuICAgIGlmIChob29rSW5qZWN0aW9uc1tob29rTmFtZV0pIHtcbiAgICAgIGNvbnN0IGluamVjdGlvbnMgPSBob29rSW5qZWN0aW9uc1tob29rTmFtZV07XG4gICAgICBpbmplY3Rpb25zLnNvcnQoKGEsIGIpID0+IGEub3JkZXIgLSBiLm9yZGVyKTtcblxuICAgICAgZm9yIChjb25zdCBpbmplY3Rpb24gb2YgaW5qZWN0aW9ucykge1xuICAgICAgICByZXN1bHQgKz0gYCAgJHtpbmplY3Rpb24uaW5qZWN0aW9ufVxcbmA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGhvb2tGdW5jdGlvbi5mb290ZXIpIHtcbiAgICAgIHJlc3VsdCArPSBgICAke2hvb2tGdW5jdGlvbi5mb290ZXJ9YDtcbiAgICB9XG5cbiAgICByZXN1bHQgKz0gJ31cXG4nO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplSG9va0Z1bmN0aW9ucyhob29rRnVuY3Rpb25zKSB7XG4gIGNvbnN0IHJlc3VsdCA9IHtcbiAgICB2czoge30sXG4gICAgZnM6IHt9XG4gIH07XG4gIGhvb2tGdW5jdGlvbnMuZm9yRWFjaChob29rID0+IHtcbiAgICBsZXQgb3B0cztcblxuICAgIGlmICh0eXBlb2YgaG9vayAhPT0gJ3N0cmluZycpIHtcbiAgICAgIG9wdHMgPSBob29rO1xuICAgICAgaG9vayA9IG9wdHMuaG9vaztcbiAgICB9IGVsc2Uge1xuICAgICAgb3B0cyA9IHt9O1xuICAgIH1cblxuICAgIGhvb2sgPSBob29rLnRyaW0oKTtcbiAgICBjb25zdCBbc3RhZ2UsIHNpZ25hdHVyZV0gPSBob29rLnNwbGl0KCc6Jyk7XG4gICAgY29uc3QgbmFtZSA9IGhvb2sucmVwbGFjZSgvXFwoLisvLCAnJyk7XG4gICAgcmVzdWx0W3N0YWdlXVtuYW1lXSA9IE9iamVjdC5hc3NpZ24ob3B0cywge1xuICAgICAgc2lnbmF0dXJlXG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXNzZW1ibGUtc2hhZGVycy5qcy5tYXAiLCJleHBvcnQgY29uc3QgVkVSVEVYX1NIQURFUiA9ICd2cyc7XG5leHBvcnQgY29uc3QgRlJBR01FTlRfU0hBREVSID0gJ2ZzJztcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvbnN0YW50cy5qcy5tYXAiLCJjb25zdCBUWVBFX0RFRklOSVRJT05TID0ge1xuICBudW1iZXI6IHtcbiAgICB2YWxpZGF0ZSh2YWx1ZSwgcHJvcFR5cGUpIHtcbiAgICAgIHJldHVybiBOdW1iZXIuaXNGaW5pdGUodmFsdWUpICYmICghKCdtYXgnIGluIHByb3BUeXBlKSB8fCB2YWx1ZSA8PSBwcm9wVHlwZS5tYXgpICYmICghKCdtaW4nIGluIHByb3BUeXBlKSB8fCB2YWx1ZSA+PSBwcm9wVHlwZS5taW4pO1xuICAgIH1cblxuICB9LFxuICBhcnJheToge1xuICAgIHZhbGlkYXRlKHZhbHVlLCBwcm9wVHlwZSkge1xuICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsdWUpIHx8IEFycmF5QnVmZmVyLmlzVmlldyh2YWx1ZSk7XG4gICAgfVxuXG4gIH1cbn07XG5leHBvcnQgZnVuY3Rpb24gcGFyc2VQcm9wVHlwZXMocHJvcERlZnMpIHtcbiAgY29uc3QgcHJvcFR5cGVzID0ge307XG5cbiAgZm9yIChjb25zdCBwcm9wTmFtZSBpbiBwcm9wRGVmcykge1xuICAgIGNvbnN0IHByb3BEZWYgPSBwcm9wRGVmc1twcm9wTmFtZV07XG4gICAgY29uc3QgcHJvcFR5cGUgPSBwYXJzZVByb3BUeXBlKHByb3BEZWYpO1xuICAgIHByb3BUeXBlc1twcm9wTmFtZV0gPSBwcm9wVHlwZTtcbiAgfVxuXG4gIHJldHVybiBwcm9wVHlwZXM7XG59XG5cbmZ1bmN0aW9uIHBhcnNlUHJvcFR5cGUocHJvcERlZikge1xuICBsZXQgdHlwZSA9IGdldFR5cGVPZihwcm9wRGVmKTtcblxuICBpZiAodHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICBpZiAoIXByb3BEZWYpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICB2YWx1ZTogbnVsbFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoJ3R5cGUnIGluIHByb3BEZWYpIHtcbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBwcm9wRGVmLCBUWVBFX0RFRklOSVRJT05TW3Byb3BEZWYudHlwZV0pO1xuICAgIH1cblxuICAgIGlmICghKCd2YWx1ZScgaW4gcHJvcERlZikpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICB2YWx1ZTogcHJvcERlZlxuICAgICAgfTtcbiAgICB9XG5cbiAgICB0eXBlID0gZ2V0VHlwZU9mKHByb3BEZWYudmFsdWUpO1xuICAgIHJldHVybiBPYmplY3QuYXNzaWduKHtcbiAgICAgIHR5cGVcbiAgICB9LCBwcm9wRGVmLCBUWVBFX0RFRklOSVRJT05TW3R5cGVdKTtcbiAgfVxuXG4gIHJldHVybiBPYmplY3QuYXNzaWduKHtcbiAgICB0eXBlLFxuICAgIHZhbHVlOiBwcm9wRGVmXG4gIH0sIFRZUEVfREVGSU5JVElPTlNbdHlwZV0pO1xufVxuXG5mdW5jdGlvbiBnZXRUeXBlT2YodmFsdWUpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpIHx8IEFycmF5QnVmZmVyLmlzVmlldyh2YWx1ZSkpIHtcbiAgICByZXR1cm4gJ2FycmF5JztcbiAgfVxuXG4gIHJldHVybiB0eXBlb2YgdmFsdWU7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wcm9wLXR5cGVzLmpzLm1hcCIsImltcG9ydCB7IE1PRFVMRV9JTkpFQ1RPUlNfVlMsIE1PRFVMRV9JTkpFQ1RPUlNfRlMgfSBmcm9tICcuLi9tb2R1bGVzL21vZHVsZS1pbmplY3RvcnMnO1xuaW1wb3J0IHsgVkVSVEVYX1NIQURFUiwgRlJBR01FTlRfU0hBREVSIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSAnLi4vdXRpbHMnO1xuY29uc3QgTU9EVUxFX0lOSkVDVE9SUyA9IHtcbiAgW1ZFUlRFWF9TSEFERVJdOiBNT0RVTEVfSU5KRUNUT1JTX1ZTLFxuICBbRlJBR01FTlRfU0hBREVSXTogTU9EVUxFX0lOSkVDVE9SU19GU1xufTtcbmV4cG9ydCBjb25zdCBERUNMQVJBVElPTl9JTkpFQ1RfTUFSS0VSID0gJ19fTFVNQV9JTkpFQ1RfREVDTEFSQVRJT05TX18nO1xuY29uc3QgUkVHRVhfU1RBUlRfT0ZfTUFJTiA9IC92b2lkXFxzK21haW5cXHMqXFwoW14pXSpcXClcXHMqXFx7XFxuPy87XG5jb25zdCBSRUdFWF9FTkRfT0ZfTUFJTiA9IC99XFxuP1tee31dKiQvO1xuY29uc3QgZnJhZ21lbnRzID0gW107XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBpbmplY3RTaGFkZXIoc291cmNlLCB0eXBlLCBpbmplY3QsIGluamVjdFN0YW5kYXJkU3R1YnMgPSBmYWxzZSkge1xuICBjb25zdCBpc1ZlcnRleCA9IHR5cGUgPT09IFZFUlRFWF9TSEFERVI7XG5cbiAgZm9yIChjb25zdCBrZXkgaW4gaW5qZWN0KSB7XG4gICAgY29uc3QgZnJhZ21lbnREYXRhID0gaW5qZWN0W2tleV07XG4gICAgZnJhZ21lbnREYXRhLnNvcnQoKGEsIGIpID0+IGEub3JkZXIgLSBiLm9yZGVyKTtcbiAgICBmcmFnbWVudHMubGVuZ3RoID0gZnJhZ21lbnREYXRhLmxlbmd0aDtcblxuICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSBmcmFnbWVudERhdGEubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgIGZyYWdtZW50c1tpXSA9IGZyYWdtZW50RGF0YVtpXS5pbmplY3Rpb247XG4gICAgfVxuXG4gICAgY29uc3QgZnJhZ21lbnRTdHJpbmcgPSBgJHtmcmFnbWVudHMuam9pbignXFxuJyl9XFxuYDtcblxuICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICBjYXNlICd2czojZGVjbCc6XG4gICAgICAgIGlmIChpc1ZlcnRleCkge1xuICAgICAgICAgIHNvdXJjZSA9IHNvdXJjZS5yZXBsYWNlKERFQ0xBUkFUSU9OX0lOSkVDVF9NQVJLRVIsIGZyYWdtZW50U3RyaW5nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICd2czojbWFpbi1zdGFydCc6XG4gICAgICAgIGlmIChpc1ZlcnRleCkge1xuICAgICAgICAgIHNvdXJjZSA9IHNvdXJjZS5yZXBsYWNlKFJFR0VYX1NUQVJUX09GX01BSU4sIG1hdGNoID0+IG1hdGNoICsgZnJhZ21lbnRTdHJpbmcpO1xuICAgICAgICB9XG5cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ3ZzOiNtYWluLWVuZCc6XG4gICAgICAgIGlmIChpc1ZlcnRleCkge1xuICAgICAgICAgIHNvdXJjZSA9IHNvdXJjZS5yZXBsYWNlKFJFR0VYX0VORF9PRl9NQUlOLCBtYXRjaCA9PiBmcmFnbWVudFN0cmluZyArIG1hdGNoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdmczojZGVjbCc6XG4gICAgICAgIGlmICghaXNWZXJ0ZXgpIHtcbiAgICAgICAgICBzb3VyY2UgPSBzb3VyY2UucmVwbGFjZShERUNMQVJBVElPTl9JTkpFQ1RfTUFSS0VSLCBmcmFnbWVudFN0cmluZyk7XG4gICAgICAgIH1cblxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnZnM6I21haW4tc3RhcnQnOlxuICAgICAgICBpZiAoIWlzVmVydGV4KSB7XG4gICAgICAgICAgc291cmNlID0gc291cmNlLnJlcGxhY2UoUkVHRVhfU1RBUlRfT0ZfTUFJTiwgbWF0Y2ggPT4gbWF0Y2ggKyBmcmFnbWVudFN0cmluZyk7XG4gICAgICAgIH1cblxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnZnM6I21haW4tZW5kJzpcbiAgICAgICAgaWYgKCFpc1ZlcnRleCkge1xuICAgICAgICAgIHNvdXJjZSA9IHNvdXJjZS5yZXBsYWNlKFJFR0VYX0VORF9PRl9NQUlOLCBtYXRjaCA9PiBmcmFnbWVudFN0cmluZyArIG1hdGNoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBzb3VyY2UgPSBzb3VyY2UucmVwbGFjZShrZXksIG1hdGNoID0+IG1hdGNoICsgZnJhZ21lbnRTdHJpbmcpO1xuICAgIH1cbiAgfVxuXG4gIHNvdXJjZSA9IHNvdXJjZS5yZXBsYWNlKERFQ0xBUkFUSU9OX0lOSkVDVF9NQVJLRVIsICcnKTtcblxuICBpZiAoaW5qZWN0U3RhbmRhcmRTdHVicykge1xuICAgIHNvdXJjZSA9IHNvdXJjZS5yZXBsYWNlKC9cXH1cXHMqJC8sIG1hdGNoID0+IG1hdGNoICsgTU9EVUxFX0lOSkVDVE9SU1t0eXBlXSk7XG4gIH1cblxuICByZXR1cm4gc291cmNlO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGNvbWJpbmVJbmplY3RzKGluamVjdHMpIHtcbiAgY29uc3QgcmVzdWx0ID0ge307XG4gIGFzc2VydChBcnJheS5pc0FycmF5KGluamVjdHMpICYmIGluamVjdHMubGVuZ3RoID4gMSk7XG4gIGluamVjdHMuZm9yRWFjaChpbmplY3QgPT4ge1xuICAgIGZvciAoY29uc3Qga2V5IGluIGluamVjdCkge1xuICAgICAgcmVzdWx0W2tleV0gPSByZXN1bHRba2V5XSA/IGAke3Jlc3VsdFtrZXldfVxcbiR7aW5qZWN0W2tleV19YCA6IGluamVjdFtrZXldO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmplY3Qtc2hhZGVyLmpzLm1hcCIsImltcG9ydCB7IGdldENvbnRleHRJbmZvLCBoYXNGZWF0dXJlcywgY2FuQ29tcGlsZUdMR1NFeHRlbnNpb24sIEZFQVRVUkVTIH0gZnJvbSAnLi4vdXRpbHMvd2ViZ2wtaW5mbyc7XG5leHBvcnQgZnVuY3Rpb24gZ2V0UGxhdGZvcm1TaGFkZXJEZWZpbmVzKGdsKSB7XG4gIGNvbnN0IGRlYnVnSW5mbyA9IGdldENvbnRleHRJbmZvKGdsKTtcblxuICBzd2l0Y2ggKGRlYnVnSW5mby5ncHVWZW5kb3IudG9Mb3dlckNhc2UoKSkge1xuICAgIGNhc2UgJ252aWRpYSc6XG4gICAgICByZXR1cm4gYFxcXG4jZGVmaW5lIE5WSURJQV9HUFVcbi8vIE52aWRpYSBvcHRpbWl6ZXMgYXdheSB0aGUgY2FsY3VsYXRpb24gbmVjZXNzYXJ5IGZvciBlbXVsYXRlZCBmcDY0XG4jZGVmaW5lIExVTUFfRlA2NF9DT0RFX0VMSU1JTkFUSU9OX1dPUktBUk9VTkQgMVxuYDtcblxuICAgIGNhc2UgJ2ludGVsJzpcbiAgICAgIHJldHVybiBgXFxcbiNkZWZpbmUgSU5URUxfR1BVXG4vLyBJbnRlbCBvcHRpbWl6ZXMgYXdheSB0aGUgY2FsY3VsYXRpb24gbmVjZXNzYXJ5IGZvciBlbXVsYXRlZCBmcDY0XG4jZGVmaW5lIExVTUFfRlA2NF9DT0RFX0VMSU1JTkFUSU9OX1dPUktBUk9VTkQgMVxuLy8gSW50ZWwncyBidWlsdC1pbiAndGFuJyBmdW5jdGlvbiBkb2Vzbid0IGhhdmUgYWNjZXB0YWJsZSBwcmVjaXNpb25cbiNkZWZpbmUgTFVNQV9GUDMyX1RBTl9QUkVDSVNJT05fV09SS0FST1VORCAxXG4vLyBJbnRlbCBHUFUgZG9lc24ndCBoYXZlIGZ1bGwgMzIgYml0cyBwcmVjaXNpb24gaW4gc2FtZSBjYXNlcywgY2F1c2VzIG92ZXJmbG93XG4jZGVmaW5lIExVTUFfRlA2NF9ISUdIX0JJVFNfT1ZFUkZMT1dfV09SS0FST1VORCAxXG5gO1xuXG4gICAgY2FzZSAnYW1kJzpcbiAgICAgIHJldHVybiBgXFxcbiNkZWZpbmUgQU1EX0dQVVxuYDtcblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gYFxcXG4jZGVmaW5lIERFRkFVTFRfR1BVXG4vLyBQcmV2ZW50IGRyaXZlciBmcm9tIG9wdGltaXppbmcgYXdheSB0aGUgY2FsY3VsYXRpb24gbmVjZXNzYXJ5IGZvciBlbXVsYXRlZCBmcDY0XG4jZGVmaW5lIExVTUFfRlA2NF9DT0RFX0VMSU1JTkFUSU9OX1dPUktBUk9VTkQgMVxuLy8gSW50ZWwncyBidWlsdC1pbiAndGFuJyBmdW5jdGlvbiBkb2Vzbid0IGhhdmUgYWNjZXB0YWJsZSBwcmVjaXNpb25cbiNkZWZpbmUgTFVNQV9GUDMyX1RBTl9QUkVDSVNJT05fV09SS0FST1VORCAxXG4vLyBJbnRlbCBHUFUgZG9lc24ndCBoYXZlIGZ1bGwgMzIgYml0cyBwcmVjaXNpb24gaW4gc2FtZSBjYXNlcywgY2F1c2VzIG92ZXJmbG93XG4jZGVmaW5lIExVTUFfRlA2NF9ISUdIX0JJVFNfT1ZFUkZMT1dfV09SS0FST1VORCAxXG5gO1xuICB9XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0VmVyc2lvbkRlZmluZXMoZ2wsIGdsc2xWZXJzaW9uLCBpc0ZyYWdtZW50KSB7XG4gIGxldCB2ZXJzaW9uRGVmaW5lcyA9IGBcXFxuI2lmIChfX1ZFUlNJT05fXyA+IDEyMClcblxuIyBkZWZpbmUgRkVBVFVSRV9HTFNMX0RFUklWQVRJVkVTXG4jIGRlZmluZSBGRUFUVVJFX0dMU0xfRFJBV19CVUZGRVJTXG4jIGRlZmluZSBGRUFUVVJFX0dMU0xfRlJBR19ERVBUSFxuIyBkZWZpbmUgRkVBVFVSRV9HTFNMX1RFWFRVUkVfTE9EXG5cbi8vIERFUFJFQ0FURUQgRkxBR1MsIHJlbW92ZSBpbiB2OVxuIyBkZWZpbmUgRlJBR19ERVBUSFxuIyBkZWZpbmUgREVSSVZBVElWRVNcbiMgZGVmaW5lIERSQVdfQlVGRkVSU1xuIyBkZWZpbmUgVEVYVFVSRV9MT0RcblxuI2VuZGlmIC8vIF9fVkVSU0lPTlxuYDtcblxuICBpZiAoaGFzRmVhdHVyZXMoZ2wsIEZFQVRVUkVTLkdMU0xfRlJBR19ERVBUSCkpIHtcbiAgICB2ZXJzaW9uRGVmaW5lcyArPSBgXFxcblxuLy8gRlJBR19ERVBUSCA9PiBnbF9GcmFnRGVwdGggaXMgYXZhaWxhYmxlXG4jaWZkZWYgR0xfRVhUX2ZyYWdfZGVwdGhcbiNleHRlbnNpb24gR0xfRVhUX2ZyYWdfZGVwdGggOiBlbmFibGVcbiMgZGVmaW5lIEZFQVRVUkVfR0xTTF9GUkFHX0RFUFRIXG4jIGRlZmluZSBGUkFHX0RFUFRIXG4jIGRlZmluZSBnbF9GcmFnRGVwdGggZ2xfRnJhZ0RlcHRoRVhUXG4jZW5kaWZcbmA7XG4gIH1cblxuICBpZiAoaGFzRmVhdHVyZXMoZ2wsIEZFQVRVUkVTLkdMU0xfREVSSVZBVElWRVMpICYmIGNhbkNvbXBpbGVHTEdTRXh0ZW5zaW9uKGdsLCBGRUFUVVJFUy5HTFNMX0RFUklWQVRJVkVTKSkge1xuICAgIHZlcnNpb25EZWZpbmVzICs9IGBcXFxuXG4vLyBERVJJVkFUSVZFUyA9PiBkeGRGLCBkeGRZIGFuZCBmd2lkdGggYXJlIGF2YWlsYWJsZVxuI2lmZGVmIEdMX09FU19zdGFuZGFyZF9kZXJpdmF0aXZlc1xuI2V4dGVuc2lvbiBHTF9PRVNfc3RhbmRhcmRfZGVyaXZhdGl2ZXMgOiBlbmFibGVcbiMgZGVmaW5lIEZFQVRVUkVfR0xTTF9ERVJJVkFUSVZFU1xuIyBkZWZpbmUgREVSSVZBVElWRVNcbiNlbmRpZlxuYDtcbiAgfVxuXG4gIGlmIChoYXNGZWF0dXJlcyhnbCwgRkVBVFVSRVMuR0xTTF9GUkFHX0RBVEEpICYmIGNhbkNvbXBpbGVHTEdTRXh0ZW5zaW9uKGdsLCBGRUFUVVJFUy5HTFNMX0ZSQUdfREFUQSwge1xuICAgIGJlaGF2aW9yOiAncmVxdWlyZSdcbiAgfSkpIHtcbiAgICB2ZXJzaW9uRGVmaW5lcyArPSBgXFxcblxuLy8gRFJBV19CVUZGRVJTID0+IGdsX0ZyYWdEYXRhW10gaXMgYXZhaWxhYmxlXG4jaWZkZWYgR0xfRVhUX2RyYXdfYnVmZmVyc1xuI2V4dGVuc2lvbiBHTF9FWFRfZHJhd19idWZmZXJzIDogcmVxdWlyZVxuI2RlZmluZSBGRUFUVVJFX0dMU0xfRFJBV19CVUZGRVJTXG4jZGVmaW5lIERSQVdfQlVGRkVSU1xuI2VuZGlmXG5gO1xuICB9XG5cbiAgaWYgKGhhc0ZlYXR1cmVzKGdsLCBGRUFUVVJFUy5HTFNMX1RFWFRVUkVfTE9EKSkge1xuICAgIHZlcnNpb25EZWZpbmVzICs9IGBcXFxuLy8gVEVYVFVSRV9MT0QgPT4gdGV4dHVyZTJETG9kIGV0YyBhcmUgYXZhaWxhYmxlXG4jaWZkZWYgR0xfRVhUX3NoYWRlcl90ZXh0dXJlX2xvZFxuI2V4dGVuc2lvbiBHTF9FWFRfc2hhZGVyX3RleHR1cmVfbG9kIDogZW5hYmxlXG5cbiMgZGVmaW5lIEZFQVRVUkVfR0xTTF9URVhUVVJFX0xPRFxuIyBkZWZpbmUgVEVYVFVSRV9MT0RcblxuI2VuZGlmXG5gO1xuICB9XG5cbiAgcmV0dXJuIHZlcnNpb25EZWZpbmVzO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGxhdGZvcm0tZGVmaW5lcy5qcy5tYXAiLCJpbXBvcnQgU2hhZGVyTW9kdWxlIGZyb20gJy4vc2hhZGVyLW1vZHVsZSc7XG5pbXBvcnQgeyBhc3NlcnQgfSBmcm9tICcuLi91dGlscyc7XG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZU1vZHVsZXMobW9kdWxlcykge1xuICByZXR1cm4gZ2V0U2hhZGVyRGVwZW5kZW5jaWVzKGluc3RhbnRpYXRlTW9kdWxlcyhtb2R1bGVzKSk7XG59XG5cbmZ1bmN0aW9uIGdldFNoYWRlckRlcGVuZGVuY2llcyhtb2R1bGVzKSB7XG4gIGNvbnN0IG1vZHVsZU1hcCA9IHt9O1xuICBjb25zdCBtb2R1bGVEZXB0aCA9IHt9O1xuICBnZXREZXBlbmRlbmN5R3JhcGgoe1xuICAgIG1vZHVsZXMsXG4gICAgbGV2ZWw6IDAsXG4gICAgbW9kdWxlTWFwLFxuICAgIG1vZHVsZURlcHRoXG4gIH0pO1xuICByZXR1cm4gT2JqZWN0LmtleXMobW9kdWxlRGVwdGgpLnNvcnQoKGEsIGIpID0+IG1vZHVsZURlcHRoW2JdIC0gbW9kdWxlRGVwdGhbYV0pLm1hcChuYW1lID0+IG1vZHVsZU1hcFtuYW1lXSk7XG59XG5cbmZ1bmN0aW9uIGdldERlcGVuZGVuY3lHcmFwaCh7XG4gIG1vZHVsZXMsXG4gIGxldmVsLFxuICBtb2R1bGVNYXAsXG4gIG1vZHVsZURlcHRoXG59KSB7XG4gIGlmIChsZXZlbCA+PSA1KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdQb3NzaWJsZSBsb29wIGluIHNoYWRlciBkZXBlbmRlbmN5IGdyYXBoJyk7XG4gIH1cblxuICBmb3IgKGNvbnN0IG1vZHVsZSBvZiBtb2R1bGVzKSB7XG4gICAgbW9kdWxlTWFwW21vZHVsZS5uYW1lXSA9IG1vZHVsZTtcblxuICAgIGlmIChtb2R1bGVEZXB0aFttb2R1bGUubmFtZV0gPT09IHVuZGVmaW5lZCB8fCBtb2R1bGVEZXB0aFttb2R1bGUubmFtZV0gPCBsZXZlbCkge1xuICAgICAgbW9kdWxlRGVwdGhbbW9kdWxlLm5hbWVdID0gbGV2ZWw7XG4gICAgfVxuICB9XG5cbiAgZm9yIChjb25zdCBtb2R1bGUgb2YgbW9kdWxlcykge1xuICAgIGlmIChtb2R1bGUuZGVwZW5kZW5jaWVzKSB7XG4gICAgICBnZXREZXBlbmRlbmN5R3JhcGgoe1xuICAgICAgICBtb2R1bGVzOiBtb2R1bGUuZGVwZW5kZW5jaWVzLFxuICAgICAgICBsZXZlbDogbGV2ZWwgKyAxLFxuICAgICAgICBtb2R1bGVNYXAsXG4gICAgICAgIG1vZHVsZURlcHRoXG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaW5zdGFudGlhdGVNb2R1bGVzKG1vZHVsZXMsIHNlZW4pIHtcbiAgcmV0dXJuIG1vZHVsZXMubWFwKG1vZHVsZSA9PiB7XG4gICAgaWYgKG1vZHVsZSBpbnN0YW5jZW9mIFNoYWRlck1vZHVsZSkge1xuICAgICAgcmV0dXJuIG1vZHVsZTtcbiAgICB9XG5cbiAgICBhc3NlcnQodHlwZW9mIG1vZHVsZSAhPT0gJ3N0cmluZycsIGBTaGFkZXIgbW9kdWxlIHVzZSBieSBuYW1lIGlzIGRlcHJlY2F0ZWQuIEltcG9ydCBzaGFkZXIgbW9kdWxlICcke21vZHVsZX0nIGFuZCB1c2UgaXQgZGlyZWN0bHkuYCk7XG4gICAgYXNzZXJ0KG1vZHVsZS5uYW1lLCAnc2hhZGVyIG1vZHVsZSBoYXMgbm8gbmFtZScpO1xuICAgIG1vZHVsZSA9IG5ldyBTaGFkZXJNb2R1bGUobW9kdWxlKTtcbiAgICBtb2R1bGUuZGVwZW5kZW5jaWVzID0gaW5zdGFudGlhdGVNb2R1bGVzKG1vZHVsZS5kZXBlbmRlbmNpZXMpO1xuICAgIHJldHVybiBtb2R1bGU7XG4gIH0pO1xufVxuXG5leHBvcnQgY29uc3QgVEVTVF9FWFBPUlRTID0ge1xuICBnZXRTaGFkZXJEZXBlbmRlbmNpZXMsXG4gIGdldERlcGVuZGVuY3lHcmFwaFxufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJlc29sdmUtbW9kdWxlcy5qcy5tYXAiLCJpbXBvcnQgeyBhc3NlcnQgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgeyBwYXJzZVByb3BUeXBlcyB9IGZyb20gJy4vZmlsdGVycy9wcm9wLXR5cGVzJztcbmNvbnN0IFZFUlRFWF9TSEFERVIgPSAndnMnO1xuY29uc3QgRlJBR01FTlRfU0hBREVSID0gJ2ZzJztcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNoYWRlck1vZHVsZSB7XG4gIGNvbnN0cnVjdG9yKHtcbiAgICBuYW1lLFxuICAgIHZzLFxuICAgIGZzLFxuICAgIGRlcGVuZGVuY2llcyA9IFtdLFxuICAgIHVuaWZvcm1zLFxuICAgIGdldFVuaWZvcm1zLFxuICAgIGRlcHJlY2F0aW9ucyA9IFtdLFxuICAgIGRlZmluZXMgPSB7fSxcbiAgICBpbmplY3QgPSB7fSxcbiAgICB2ZXJ0ZXhTaGFkZXIsXG4gICAgZnJhZ21lbnRTaGFkZXJcbiAgfSkge1xuICAgIGFzc2VydCh0eXBlb2YgbmFtZSA9PT0gJ3N0cmluZycpO1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy52cyA9IHZzIHx8IHZlcnRleFNoYWRlcjtcbiAgICB0aGlzLmZzID0gZnMgfHwgZnJhZ21lbnRTaGFkZXI7XG4gICAgdGhpcy5nZXRNb2R1bGVVbmlmb3JtcyA9IGdldFVuaWZvcm1zO1xuICAgIHRoaXMuZGVwZW5kZW5jaWVzID0gZGVwZW5kZW5jaWVzO1xuICAgIHRoaXMuZGVwcmVjYXRpb25zID0gdGhpcy5fcGFyc2VEZXByZWNhdGlvbkRlZmluaXRpb25zKGRlcHJlY2F0aW9ucyk7XG4gICAgdGhpcy5kZWZpbmVzID0gZGVmaW5lcztcbiAgICB0aGlzLmluamVjdGlvbnMgPSBub3JtYWxpemVJbmplY3Rpb25zKGluamVjdCk7XG5cbiAgICBpZiAodW5pZm9ybXMpIHtcbiAgICAgIHRoaXMudW5pZm9ybXMgPSBwYXJzZVByb3BUeXBlcyh1bmlmb3Jtcyk7XG4gICAgfVxuICB9XG5cbiAgZ2V0TW9kdWxlU291cmNlKHR5cGUpIHtcbiAgICBsZXQgbW9kdWxlU291cmNlO1xuXG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlIFZFUlRFWF9TSEFERVI6XG4gICAgICAgIG1vZHVsZVNvdXJjZSA9IHRoaXMudnMgfHwgJyc7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEZSQUdNRU5UX1NIQURFUjpcbiAgICAgICAgbW9kdWxlU291cmNlID0gdGhpcy5mcyB8fCAnJztcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGFzc2VydChmYWxzZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGBcXFxuI2RlZmluZSBNT0RVTEVfJHt0aGlzLm5hbWUudG9VcHBlckNhc2UoKS5yZXBsYWNlKC9bXjAtOWEtel0vZ2ksICdfJyl9XG4ke21vZHVsZVNvdXJjZX1cXFxuLy8gRU5EIE1PRFVMRV8ke3RoaXMubmFtZX1cblxuYDtcbiAgfVxuXG4gIGdldFVuaWZvcm1zKG9wdHMsIHVuaWZvcm1zKSB7XG4gICAgaWYgKHRoaXMuZ2V0TW9kdWxlVW5pZm9ybXMpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldE1vZHVsZVVuaWZvcm1zKG9wdHMsIHVuaWZvcm1zKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy51bmlmb3Jtcykge1xuICAgICAgcmV0dXJuIHRoaXMuX2RlZmF1bHRHZXRVbmlmb3JtcyhvcHRzKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge307XG4gIH1cblxuICBnZXREZWZpbmVzKCkge1xuICAgIHJldHVybiB0aGlzLmRlZmluZXM7XG4gIH1cblxuICBjaGVja0RlcHJlY2F0aW9ucyhzaGFkZXJTb3VyY2UsIGxvZykge1xuICAgIHRoaXMuZGVwcmVjYXRpb25zLmZvckVhY2goZGVmID0+IHtcbiAgICAgIGlmIChkZWYucmVnZXgudGVzdChzaGFkZXJTb3VyY2UpKSB7XG4gICAgICAgIGlmIChkZWYuZGVwcmVjYXRlZCkge1xuICAgICAgICAgIGxvZy5kZXByZWNhdGVkKGRlZi5vbGQsIGRlZi5uZXcpKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbG9nLnJlbW92ZWQoZGVmLm9sZCwgZGVmLm5ldykoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgX3BhcnNlRGVwcmVjYXRpb25EZWZpbml0aW9ucyhkZXByZWNhdGlvbnMpIHtcbiAgICBkZXByZWNhdGlvbnMuZm9yRWFjaChkZWYgPT4ge1xuICAgICAgc3dpdGNoIChkZWYudHlwZSkge1xuICAgICAgICBjYXNlICdmdW5jdGlvbic6XG4gICAgICAgICAgZGVmLnJlZ2V4ID0gbmV3IFJlZ0V4cChgXFxcXGIke2RlZi5vbGR9XFxcXChgKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGRlZi5yZWdleCA9IG5ldyBSZWdFeHAoYCR7ZGVmLnR5cGV9ICR7ZGVmLm9sZH07YCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGRlcHJlY2F0aW9ucztcbiAgfVxuXG4gIF9kZWZhdWx0R2V0VW5pZm9ybXMob3B0cyA9IHt9KSB7XG4gICAgY29uc3QgdW5pZm9ybXMgPSB7fTtcbiAgICBjb25zdCBwcm9wVHlwZXMgPSB0aGlzLnVuaWZvcm1zO1xuXG4gICAgZm9yIChjb25zdCBrZXkgaW4gcHJvcFR5cGVzKSB7XG4gICAgICBjb25zdCBwcm9wRGVmID0gcHJvcFR5cGVzW2tleV07XG5cbiAgICAgIGlmIChrZXkgaW4gb3B0cyAmJiAhcHJvcERlZi5wcml2YXRlKSB7XG4gICAgICAgIGlmIChwcm9wRGVmLnZhbGlkYXRlKSB7XG4gICAgICAgICAgYXNzZXJ0KHByb3BEZWYudmFsaWRhdGUob3B0c1trZXldLCBwcm9wRGVmKSwgYCR7dGhpcy5uYW1lfTogaW52YWxpZCAke2tleX1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHVuaWZvcm1zW2tleV0gPSBvcHRzW2tleV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB1bmlmb3Jtc1trZXldID0gcHJvcERlZi52YWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdW5pZm9ybXM7XG4gIH1cblxufVxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVNoYWRlck1vZHVsZShtb2R1bGUpIHtcbiAgaWYgKCFtb2R1bGUubm9ybWFsaXplZCkge1xuICAgIG1vZHVsZS5ub3JtYWxpemVkID0gdHJ1ZTtcblxuICAgIGlmIChtb2R1bGUudW5pZm9ybXMgJiYgIW1vZHVsZS5nZXRVbmlmb3Jtcykge1xuICAgICAgY29uc3Qgc2hhZGVyTW9kdWxlID0gbmV3IFNoYWRlck1vZHVsZShtb2R1bGUpO1xuICAgICAgbW9kdWxlLmdldFVuaWZvcm1zID0gc2hhZGVyTW9kdWxlLmdldFVuaWZvcm1zLmJpbmQoc2hhZGVyTW9kdWxlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbW9kdWxlO1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVJbmplY3Rpb25zKGluamVjdGlvbnMpIHtcbiAgY29uc3QgcmVzdWx0ID0ge1xuICAgIHZzOiB7fSxcbiAgICBmczoge31cbiAgfTtcblxuICBmb3IgKGNvbnN0IGhvb2sgaW4gaW5qZWN0aW9ucykge1xuICAgIGxldCBpbmplY3Rpb24gPSBpbmplY3Rpb25zW2hvb2tdO1xuICAgIGNvbnN0IHN0YWdlID0gaG9vay5zbGljZSgwLCAyKTtcblxuICAgIGlmICh0eXBlb2YgaW5qZWN0aW9uID09PSAnc3RyaW5nJykge1xuICAgICAgaW5qZWN0aW9uID0ge1xuICAgICAgICBvcmRlcjogMCxcbiAgICAgICAgaW5qZWN0aW9uXG4gICAgICB9O1xuICAgIH1cblxuICAgIHJlc3VsdFtzdGFnZV1baG9va10gPSBpbmplY3Rpb247XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c2hhZGVyLW1vZHVsZS5qcy5tYXAiLCJmdW5jdGlvbiB0ZXN0VmFyaWFibGUocXVhbGlmaWVyKSB7XG4gIHJldHVybiBuZXcgUmVnRXhwKGBcXFxcYiR7cXVhbGlmaWVyfVsgXFxcXHRdKyhcXFxcdytbIFxcXFx0XStcXFxcdysoXFxcXFtcXFxcdytcXFxcXSk/OylgLCAnZycpO1xufVxuXG5jb25zdCBFUzMwMF9SRVBMQUNFTUVOVFMgPSBbWy9eKCN2ZXJzaW9uWyBcXHRdKygxMDB8MzAwWyBcXHRdK2VzKSk/WyBcXHRdKlxcbi8sICcjdmVyc2lvbiAzMDAgZXNcXG4nXSwgWy9cXGJ0ZXh0dXJlKDJEfDJEUHJvanxDdWJlKUxvZChFWFQpP1xcKC9nLCAndGV4dHVyZUxvZCgnXSwgWy9cXGJ0ZXh0dXJlKDJEfDJEUHJvanxDdWJlKShFWFQpP1xcKC9nLCAndGV4dHVyZSgnXV07XG5jb25zdCBFUzMwMF9WRVJURVhfUkVQTEFDRU1FTlRTID0gWy4uLkVTMzAwX1JFUExBQ0VNRU5UUywgW3Rlc3RWYXJpYWJsZSgnYXR0cmlidXRlJyksICdpbiAkMSddLCBbdGVzdFZhcmlhYmxlKCd2YXJ5aW5nJyksICdvdXQgJDEnXV07XG5jb25zdCBFUzMwMF9GUkFHTUVOVF9SRVBMQUNFTUVOVFMgPSBbLi4uRVMzMDBfUkVQTEFDRU1FTlRTLCBbdGVzdFZhcmlhYmxlKCd2YXJ5aW5nJyksICdpbiAkMSddXTtcbmNvbnN0IEVTMTAwX1JFUExBQ0VNRU5UUyA9IFtbL14jdmVyc2lvblsgXFx0XSszMDBbIFxcdF0rZXMvLCAnI3ZlcnNpb24gMTAwJ10sIFsvXFxidGV4dHVyZSgyRHwyRFByb2p8Q3ViZSlMb2RcXCgvZywgJ3RleHR1cmUkMUxvZEVYVCgnXSwgWy9cXGJ0ZXh0dXJlXFwoL2csICd0ZXh0dXJlMkQoJ10sIFsvXFxidGV4dHVyZUxvZFxcKC9nLCAndGV4dHVyZTJETG9kRVhUKCddXTtcbmNvbnN0IEVTMTAwX1ZFUlRFWF9SRVBMQUNFTUVOVFMgPSBbLi4uRVMxMDBfUkVQTEFDRU1FTlRTLCBbdGVzdFZhcmlhYmxlKCdpbicpLCAnYXR0cmlidXRlICQxJ10sIFt0ZXN0VmFyaWFibGUoJ291dCcpLCAndmFyeWluZyAkMSddXTtcbmNvbnN0IEVTMTAwX0ZSQUdNRU5UX1JFUExBQ0VNRU5UUyA9IFsuLi5FUzEwMF9SRVBMQUNFTUVOVFMsIFt0ZXN0VmFyaWFibGUoJ2luJyksICd2YXJ5aW5nICQxJ11dO1xuY29uc3QgRVMxMDBfRlJBR01FTlRfT1VUUFVUX05BTUUgPSAnZ2xfRnJhZ0NvbG9yJztcbmNvbnN0IEVTMzAwX0ZSQUdNRU5UX09VVFBVVF9SRUdFWCA9IC9cXGJvdXRbIFxcdF0rdmVjNFsgXFx0XSsoXFx3KylbIFxcdF0qO1xcbj8vO1xuY29uc3QgUkVHRVhfU1RBUlRfT0ZfTUFJTiA9IC92b2lkXFxzK21haW5cXHMqXFwoW14pXSpcXClcXHMqXFx7XFxuPy87XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0cmFuc3BpbGVTaGFkZXIoc291cmNlLCB0YXJnZXRHTFNMVmVyc2lvbiwgaXNWZXJ0ZXgpIHtcbiAgc3dpdGNoICh0YXJnZXRHTFNMVmVyc2lvbikge1xuICAgIGNhc2UgMzAwOlxuICAgICAgcmV0dXJuIGlzVmVydGV4ID8gY29udmVydFNoYWRlcihzb3VyY2UsIEVTMzAwX1ZFUlRFWF9SRVBMQUNFTUVOVFMpIDogY29udmVydEZyYWdtZW50U2hhZGVyVG8zMDAoc291cmNlKTtcblxuICAgIGNhc2UgMTAwOlxuICAgICAgcmV0dXJuIGlzVmVydGV4ID8gY29udmVydFNoYWRlcihzb3VyY2UsIEVTMTAwX1ZFUlRFWF9SRVBMQUNFTUVOVFMpIDogY29udmVydEZyYWdtZW50U2hhZGVyVG8xMDAoc291cmNlKTtcblxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVua25vd24gR0xTTCB2ZXJzaW9uICR7dGFyZ2V0R0xTTFZlcnNpb259YCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY29udmVydFNoYWRlcihzb3VyY2UsIHJlcGxhY2VtZW50cykge1xuICBmb3IgKGNvbnN0IFtwYXR0ZXJuLCByZXBsYWNlbWVudF0gb2YgcmVwbGFjZW1lbnRzKSB7XG4gICAgc291cmNlID0gc291cmNlLnJlcGxhY2UocGF0dGVybiwgcmVwbGFjZW1lbnQpO1xuICB9XG5cbiAgcmV0dXJuIHNvdXJjZTtcbn1cblxuZnVuY3Rpb24gY29udmVydEZyYWdtZW50U2hhZGVyVG8zMDAoc291cmNlKSB7XG4gIHNvdXJjZSA9IGNvbnZlcnRTaGFkZXIoc291cmNlLCBFUzMwMF9GUkFHTUVOVF9SRVBMQUNFTUVOVFMpO1xuICBjb25zdCBvdXRwdXRNYXRjaCA9IHNvdXJjZS5tYXRjaChFUzMwMF9GUkFHTUVOVF9PVVRQVVRfUkVHRVgpO1xuXG4gIGlmIChvdXRwdXRNYXRjaCkge1xuICAgIGNvbnN0IG91dHB1dE5hbWUgPSBvdXRwdXRNYXRjaFsxXTtcbiAgICBzb3VyY2UgPSBzb3VyY2UucmVwbGFjZShuZXcgUmVnRXhwKGBcXFxcYiR7RVMxMDBfRlJBR01FTlRfT1VUUFVUX05BTUV9XFxcXGJgLCAnZycpLCBvdXRwdXROYW1lKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBvdXRwdXROYW1lID0gJ2ZyYWdtZW50Q29sb3InO1xuICAgIHNvdXJjZSA9IHNvdXJjZS5yZXBsYWNlKFJFR0VYX1NUQVJUX09GX01BSU4sIG1hdGNoID0+IGBvdXQgdmVjNCAke291dHB1dE5hbWV9O1xcbiR7bWF0Y2h9YCkucmVwbGFjZShuZXcgUmVnRXhwKGBcXFxcYiR7RVMxMDBfRlJBR01FTlRfT1VUUFVUX05BTUV9XFxcXGJgLCAnZycpLCBvdXRwdXROYW1lKTtcbiAgfVxuXG4gIHJldHVybiBzb3VyY2U7XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRGcmFnbWVudFNoYWRlclRvMTAwKHNvdXJjZSkge1xuICBzb3VyY2UgPSBjb252ZXJ0U2hhZGVyKHNvdXJjZSwgRVMxMDBfRlJBR01FTlRfUkVQTEFDRU1FTlRTKTtcbiAgY29uc3Qgb3V0cHV0TWF0Y2ggPSBzb3VyY2UubWF0Y2goRVMzMDBfRlJBR01FTlRfT1VUUFVUX1JFR0VYKTtcblxuICBpZiAob3V0cHV0TWF0Y2gpIHtcbiAgICBjb25zdCBvdXRwdXROYW1lID0gb3V0cHV0TWF0Y2hbMV07XG4gICAgc291cmNlID0gc291cmNlLnJlcGxhY2UoRVMzMDBfRlJBR01FTlRfT1VUUFVUX1JFR0VYLCAnJykucmVwbGFjZShuZXcgUmVnRXhwKGBcXFxcYiR7b3V0cHV0TmFtZX1cXFxcYmAsICdnJyksIEVTMTAwX0ZSQUdNRU5UX09VVFBVVF9OQU1FKTtcbiAgfVxuXG4gIHJldHVybiBzb3VyY2U7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD10cmFuc3BpbGUtc2hhZGVyLmpzLm1hcCIsImV4cG9ydCBjb25zdCBNT0RVTEVfSU5KRUNUT1JTX1ZTID0gYFxcXG4jaWZkZWYgTU9EVUxFX0xPR0RFUFRIXG4gIGxvZ2RlcHRoX2FkanVzdFBvc2l0aW9uKGdsX1Bvc2l0aW9uKTtcbiNlbmRpZlxuYDtcbmV4cG9ydCBjb25zdCBNT0RVTEVfSU5KRUNUT1JTX0ZTID0gYFxcXG4jaWZkZWYgTU9EVUxFX01BVEVSSUFMXG4gIGdsX0ZyYWdDb2xvciA9IG1hdGVyaWFsX2ZpbHRlckNvbG9yKGdsX0ZyYWdDb2xvcik7XG4jZW5kaWZcblxuI2lmZGVmIE1PRFVMRV9MSUdIVElOR1xuICBnbF9GcmFnQ29sb3IgPSBsaWdodGluZ19maWx0ZXJDb2xvcihnbF9GcmFnQ29sb3IpO1xuI2VuZGlmXG5cbiNpZmRlZiBNT0RVTEVfRk9HXG4gIGdsX0ZyYWdDb2xvciA9IGZvZ19maWx0ZXJDb2xvcihnbF9GcmFnQ29sb3IpO1xuI2VuZGlmXG5cbiNpZmRlZiBNT0RVTEVfUElDS0lOR1xuICBnbF9GcmFnQ29sb3IgPSBwaWNraW5nX2ZpbHRlckhpZ2hsaWdodENvbG9yKGdsX0ZyYWdDb2xvcik7XG4gIGdsX0ZyYWdDb2xvciA9IHBpY2tpbmdfZmlsdGVyUGlja2luZ0NvbG9yKGdsX0ZyYWdDb2xvcik7XG4jZW5kaWZcblxuI2lmZGVmIE1PRFVMRV9MT0dERVBUSFxuICBsb2dkZXB0aF9zZXRGcmFnRGVwdGgoKTtcbiNlbmRpZlxuYDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1vZHVsZS1pbmplY3RvcnMuanMubWFwIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYXNzZXJ0KGNvbmRpdGlvbiwgbWVzc2FnZSkge1xuICBpZiAoIWNvbmRpdGlvbikge1xuICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlIHx8ICdzaGFkZXJ0b29sczogYXNzZXJ0aW9uIGZhaWxlZC4nKTtcbiAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXNzZXJ0LmpzLm1hcCIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGlzT2xkSUUob3B0cyA9IHt9KSB7XG4gIGNvbnN0IG5hdmlnYXRvciA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93Lm5hdmlnYXRvciB8fCB7fSA6IHt9O1xuICBjb25zdCB1c2VyQWdlbnQgPSBvcHRzLnVzZXJBZ2VudCB8fCBuYXZpZ2F0b3IudXNlckFnZW50IHx8ICcnO1xuICBjb25zdCBpc01TSUUgPSB1c2VyQWdlbnQuaW5kZXhPZignTVNJRSAnKSAhPT0gLTE7XG4gIGNvbnN0IGlzVHJpZGVudCA9IHVzZXJBZ2VudC5pbmRleE9mKCdUcmlkZW50LycpICE9PSAtMTtcbiAgcmV0dXJuIGlzTVNJRSB8fCBpc1RyaWRlbnQ7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pcy1vbGQtaWUuanMubWFwIiwiaW1wb3J0IGlzT2xkSUUgZnJvbSAnLi9pcy1vbGQtaWUnO1xuaW1wb3J0IGFzc2VydCBmcm9tICcuL2Fzc2VydCc7XG5jb25zdCBHTF9WRU5ET1IgPSAweDFmMDA7XG5jb25zdCBHTF9SRU5ERVJFUiA9IDB4MWYwMTtcbmNvbnN0IEdMX1ZFUlNJT04gPSAweDFmMDI7XG5jb25zdCBHTF9TSEFESU5HX0xBTkdVQUdFX1ZFUlNJT04gPSAweDhiOGM7XG5jb25zdCBXRUJHTF9GRUFUVVJFUyA9IHtcbiAgR0xTTF9GUkFHX0RBVEE6IFsnV0VCR0xfZHJhd19idWZmZXJzJywgdHJ1ZV0sXG4gIEdMU0xfRlJBR19ERVBUSDogWydFWFRfZnJhZ19kZXB0aCcsIHRydWVdLFxuICBHTFNMX0RFUklWQVRJVkVTOiBbJ09FU19zdGFuZGFyZF9kZXJpdmF0aXZlcycsIHRydWVdLFxuICBHTFNMX1RFWFRVUkVfTE9EOiBbJ0VYVF9zaGFkZXJfdGV4dHVyZV9sb2QnLCB0cnVlXVxufTtcbmNvbnN0IEZFQVRVUkVTID0ge307XG5PYmplY3Qua2V5cyhXRUJHTF9GRUFUVVJFUykuZm9yRWFjaChrZXkgPT4ge1xuICBGRUFUVVJFU1trZXldID0ga2V5O1xufSk7XG5leHBvcnQgeyBGRUFUVVJFUyB9O1xuXG5mdW5jdGlvbiBpc1dlYkdMMihnbCkge1xuICBpZiAodHlwZW9mIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQgIT09ICd1bmRlZmluZWQnICYmIGdsIGluc3RhbmNlb2YgV2ViR0wyUmVuZGVyaW5nQ29udGV4dCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIEJvb2xlYW4oZ2wgJiYgZ2wuX3ZlcnNpb24gPT09IDIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29udGV4dEluZm8oZ2wpIHtcbiAgY29uc3QgaW5mbyA9IGdsLmdldEV4dGVuc2lvbignV0VCR0xfZGVidWdfcmVuZGVyZXJfaW5mbycpO1xuICBjb25zdCB2ZW5kb3IgPSBnbC5nZXRQYXJhbWV0ZXIoaW5mbyAmJiBpbmZvLlVOTUFTS0VEX1ZFTkRPUl9XRUJHTCB8fCBHTF9WRU5ET1IpO1xuICBjb25zdCByZW5kZXJlciA9IGdsLmdldFBhcmFtZXRlcihpbmZvICYmIGluZm8uVU5NQVNLRURfUkVOREVSRVJfV0VCR0wgfHwgR0xfUkVOREVSRVIpO1xuICBjb25zdCBncHVWZW5kb3IgPSBpZGVudGlmeUdQVVZlbmRvcih2ZW5kb3IsIHJlbmRlcmVyKTtcbiAgY29uc3QgZ3B1SW5mbyA9IHtcbiAgICBncHVWZW5kb3IsXG4gICAgdmVuZG9yLFxuICAgIHJlbmRlcmVyLFxuICAgIHZlcnNpb246IGdsLmdldFBhcmFtZXRlcihHTF9WRVJTSU9OKSxcbiAgICBzaGFkaW5nTGFuZ3VhZ2VWZXJzaW9uOiBnbC5nZXRQYXJhbWV0ZXIoR0xfU0hBRElOR19MQU5HVUFHRV9WRVJTSU9OKVxuICB9O1xuICByZXR1cm4gZ3B1SW5mbztcbn1cblxuZnVuY3Rpb24gaWRlbnRpZnlHUFVWZW5kb3IodmVuZG9yLCByZW5kZXJlcikge1xuICBpZiAodmVuZG9yLm1hdGNoKC9OVklESUEvaSkgfHwgcmVuZGVyZXIubWF0Y2goL05WSURJQS9pKSkge1xuICAgIHJldHVybiAnTlZJRElBJztcbiAgfVxuXG4gIGlmICh2ZW5kb3IubWF0Y2goL0lOVEVML2kpIHx8IHJlbmRlcmVyLm1hdGNoKC9JTlRFTC9pKSkge1xuICAgIHJldHVybiAnSU5URUwnO1xuICB9XG5cbiAgaWYgKHZlbmRvci5tYXRjaCgvQU1EL2kpIHx8IHJlbmRlcmVyLm1hdGNoKC9BTUQvaSkgfHwgdmVuZG9yLm1hdGNoKC9BVEkvaSkgfHwgcmVuZGVyZXIubWF0Y2goL0FUSS9pKSkge1xuICAgIHJldHVybiAnQU1EJztcbiAgfVxuXG4gIHJldHVybiAnVU5LTk9XTiBHUFUnO1xufVxuXG5jb25zdCBjb21waWxlZEdsc2xFeHRlbnNpb25zID0ge307XG5leHBvcnQgZnVuY3Rpb24gY2FuQ29tcGlsZUdMR1NFeHRlbnNpb24oZ2wsIGNhcCwgb3B0cyA9IHt9KSB7XG4gIGNvbnN0IGZlYXR1cmUgPSBXRUJHTF9GRUFUVVJFU1tjYXBdO1xuICBhc3NlcnQoZmVhdHVyZSwgY2FwKTtcblxuICBpZiAoIWlzT2xkSUUob3B0cykpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGlmIChjYXAgaW4gY29tcGlsZWRHbHNsRXh0ZW5zaW9ucykge1xuICAgIHJldHVybiBjb21waWxlZEdsc2xFeHRlbnNpb25zW2NhcF07XG4gIH1cblxuICBjb25zdCBleHRlbnNpb25OYW1lID0gZmVhdHVyZVswXTtcbiAgY29uc3QgYmVoYXZpb3IgPSBvcHRzLmJlaGF2aW9yIHx8ICdlbmFibGUnO1xuICBjb25zdCBzb3VyY2UgPSBgI2V4dGVuc2lvbiBHTF8ke2V4dGVuc2lvbk5hbWV9IDogJHtiZWhhdmlvcn1cXG52b2lkIG1haW4odm9pZCkge31gO1xuICBjb25zdCBzaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIoMzU2MzMpO1xuICBnbC5zaGFkZXJTb3VyY2Uoc2hhZGVyLCBzb3VyY2UpO1xuICBnbC5jb21waWxlU2hhZGVyKHNoYWRlcik7XG4gIGNvbnN0IGNhbkNvbXBpbGUgPSBnbC5nZXRTaGFkZXJQYXJhbWV0ZXIoc2hhZGVyLCAzNTcxMyk7XG4gIGdsLmRlbGV0ZVNoYWRlcihzaGFkZXIpO1xuICBjb21waWxlZEdsc2xFeHRlbnNpb25zW2NhcF0gPSBjYW5Db21waWxlO1xuICByZXR1cm4gY2FuQ29tcGlsZTtcbn1cblxuZnVuY3Rpb24gZ2V0RmVhdHVyZShnbCwgY2FwKSB7XG4gIGNvbnN0IGZlYXR1cmUgPSBXRUJHTF9GRUFUVVJFU1tjYXBdO1xuICBhc3NlcnQoZmVhdHVyZSwgY2FwKTtcbiAgY29uc3QgZXh0ZW5zaW9uTmFtZSA9IGlzV2ViR0wyKGdsKSA/IGZlYXR1cmVbMV0gfHwgZmVhdHVyZVswXSA6IGZlYXR1cmVbMF07XG4gIGNvbnN0IHZhbHVlID0gdHlwZW9mIGV4dGVuc2lvbk5hbWUgPT09ICdzdHJpbmcnID8gQm9vbGVhbihnbC5nZXRFeHRlbnNpb24oZXh0ZW5zaW9uTmFtZSkpIDogZXh0ZW5zaW9uTmFtZTtcbiAgYXNzZXJ0KHZhbHVlID09PSBmYWxzZSB8fCB2YWx1ZSA9PT0gdHJ1ZSk7XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc0ZlYXR1cmVzKGdsLCBmZWF0dXJlcykge1xuICBmZWF0dXJlcyA9IEFycmF5LmlzQXJyYXkoZmVhdHVyZXMpID8gZmVhdHVyZXMgOiBbZmVhdHVyZXNdO1xuICByZXR1cm4gZmVhdHVyZXMuZXZlcnkoZmVhdHVyZSA9PiBnZXRGZWF0dXJlKGdsLCBmZWF0dXJlKSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD13ZWJnbC1pbmZvLmpzLm1hcCIsImltcG9ydCB7IGdldFR5cGVkQXJyYXlGcm9tR0xUeXBlIH0gZnJvbSAnLi4vd2ViZ2wtdXRpbHMvdHlwZWQtYXJyYXktdXRpbHMnO1xuaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSAnLi4vdXRpbHMvYXNzZXJ0JztcbmltcG9ydCB7IGNoZWNrUHJvcHMgfSBmcm9tICcuLi91dGlscy9jaGVjay1wcm9wcyc7XG5jb25zdCBERUZBVUxUX0FDQ0VTU09SX1ZBTFVFUyA9IHtcbiAgb2Zmc2V0OiAwLFxuICBzdHJpZGU6IDAsXG4gIHR5cGU6IDUxMjYsXG4gIHNpemU6IDEsXG4gIGRpdmlzb3I6IDAsXG4gIG5vcm1hbGl6ZWQ6IGZhbHNlLFxuICBpbnRlZ2VyOiBmYWxzZVxufTtcbmNvbnN0IFBST1BfQ0hFQ0tTID0ge1xuICBkZXByZWNhdGVkUHJvcHM6IHtcbiAgICBpbnN0YW5jZWQ6ICdkaXZpc29yJyxcbiAgICBpc0luc3RhbmNlZDogJ2Rpdmlzb3InXG4gIH1cbn07XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBY2Nlc3NvciB7XG4gIHN0YXRpYyBnZXRCeXRlc1BlckVsZW1lbnQoYWNjZXNzb3IpIHtcbiAgICBjb25zdCBBcnJheVR5cGUgPSBnZXRUeXBlZEFycmF5RnJvbUdMVHlwZShhY2Nlc3Nvci50eXBlIHx8IDUxMjYpO1xuICAgIHJldHVybiBBcnJheVR5cGUuQllURVNfUEVSX0VMRU1FTlQ7XG4gIH1cblxuICBzdGF0aWMgZ2V0Qnl0ZXNQZXJWZXJ0ZXgoYWNjZXNzb3IpIHtcbiAgICBhc3NlcnQoYWNjZXNzb3Iuc2l6ZSk7XG4gICAgY29uc3QgQXJyYXlUeXBlID0gZ2V0VHlwZWRBcnJheUZyb21HTFR5cGUoYWNjZXNzb3IudHlwZSB8fCA1MTI2KTtcbiAgICByZXR1cm4gQXJyYXlUeXBlLkJZVEVTX1BFUl9FTEVNRU5UICogYWNjZXNzb3Iuc2l6ZTtcbiAgfVxuXG4gIHN0YXRpYyByZXNvbHZlKC4uLmFjY2Vzc29ycykge1xuICAgIHJldHVybiBuZXcgQWNjZXNzb3IoLi4uW0RFRkFVTFRfQUNDRVNTT1JfVkFMVUVTLCAuLi5hY2Nlc3NvcnNdKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKC4uLmFjY2Vzc29ycykge1xuICAgIGFjY2Vzc29ycy5mb3JFYWNoKGFjY2Vzc29yID0+IHRoaXMuX2Fzc2lnbihhY2Nlc3NvcikpO1xuICAgIE9iamVjdC5mcmVlemUodGhpcyk7XG4gIH1cblxuICB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcyk7XG4gIH1cblxuICBnZXQgQllURVNfUEVSX0VMRU1FTlQoKSB7XG4gICAgcmV0dXJuIEFjY2Vzc29yLmdldEJ5dGVzUGVyRWxlbWVudCh0aGlzKTtcbiAgfVxuXG4gIGdldCBCWVRFU19QRVJfVkVSVEVYKCkge1xuICAgIHJldHVybiBBY2Nlc3Nvci5nZXRCeXRlc1BlclZlcnRleCh0aGlzKTtcbiAgfVxuXG4gIF9hc3NpZ24ocHJvcHMgPSB7fSkge1xuICAgIHByb3BzID0gY2hlY2tQcm9wcygnQWNjZXNzb3InLCBwcm9wcywgUFJPUF9DSEVDS1MpO1xuXG4gICAgaWYgKHByb3BzLnR5cGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy50eXBlID0gcHJvcHMudHlwZTtcblxuICAgICAgaWYgKHByb3BzLnR5cGUgPT09IDUxMjQgfHwgcHJvcHMudHlwZSA9PT0gNTEyNSkge1xuICAgICAgICB0aGlzLmludGVnZXIgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwcm9wcy5zaXplICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuc2l6ZSA9IHByb3BzLnNpemU7XG4gICAgfVxuXG4gICAgaWYgKHByb3BzLm9mZnNldCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLm9mZnNldCA9IHByb3BzLm9mZnNldDtcbiAgICB9XG5cbiAgICBpZiAocHJvcHMuc3RyaWRlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuc3RyaWRlID0gcHJvcHMuc3RyaWRlO1xuICAgIH1cblxuICAgIGlmIChwcm9wcy5ub3JtYWxpemVkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMubm9ybWFsaXplZCA9IHByb3BzLm5vcm1hbGl6ZWQ7XG4gICAgfVxuXG4gICAgaWYgKHByb3BzLmludGVnZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5pbnRlZ2VyID0gcHJvcHMuaW50ZWdlcjtcbiAgICB9XG5cbiAgICBpZiAocHJvcHMuZGl2aXNvciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLmRpdmlzb3IgPSBwcm9wcy5kaXZpc29yO1xuICAgIH1cblxuICAgIGlmIChwcm9wcy5idWZmZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5idWZmZXIgPSBwcm9wcy5idWZmZXI7XG4gICAgfVxuXG4gICAgaWYgKHByb3BzLmluZGV4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICh0eXBlb2YgcHJvcHMuaW5kZXggPT09ICdib29sZWFuJykge1xuICAgICAgICB0aGlzLmluZGV4ID0gcHJvcHMuaW5kZXggPyAxIDogMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuaW5kZXggPSBwcm9wcy5pbmRleDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocHJvcHMuaW5zdGFuY2VkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuZGl2aXNvciA9IHByb3BzLmluc3RhbmNlZCA/IDEgOiAwO1xuICAgIH1cblxuICAgIGlmIChwcm9wcy5pc0luc3RhbmNlZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLmRpdmlzb3IgPSBwcm9wcy5pc0luc3RhbmNlZCA/IDEgOiAwO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbn1cbmV4cG9ydCB7IERFRkFVTFRfQUNDRVNTT1JfVkFMVUVTIH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hY2Nlc3Nvci5qcy5tYXAiLCJpbXBvcnQgUmVzb3VyY2UgZnJvbSAnLi9yZXNvdXJjZSc7XG5pbXBvcnQgQWNjZXNzb3IgZnJvbSAnLi9hY2Nlc3Nvcic7XG5pbXBvcnQgeyBnZXRHTFR5cGVGcm9tVHlwZWRBcnJheSwgZ2V0VHlwZWRBcnJheUZyb21HTFR5cGUgfSBmcm9tICcuLi93ZWJnbC11dGlscy90eXBlZC1hcnJheS11dGlscyc7XG5pbXBvcnQgeyBhc3NlcnRXZWJHTDJDb250ZXh0LCBsb2cgfSBmcm9tICdAbHVtYS5nbC9nbHRvb2xzJztcbmltcG9ydCB7IGFzc2VydCB9IGZyb20gJy4uL3V0aWxzL2Fzc2VydCc7XG5pbXBvcnQgeyBjaGVja1Byb3BzIH0gZnJvbSAnLi4vdXRpbHMvY2hlY2stcHJvcHMnO1xuY29uc3QgREVCVUdfREFUQV9MRU5HVEggPSAxMDtcbmNvbnN0IERFUFJFQ0FURURfUFJPUFMgPSB7XG4gIG9mZnNldDogJ2FjY2Vzc29yLm9mZnNldCcsXG4gIHN0cmlkZTogJ2FjY2Vzc29yLnN0cmlkZScsXG4gIHR5cGU6ICdhY2Nlc3Nvci50eXBlJyxcbiAgc2l6ZTogJ2FjY2Vzc29yLnNpemUnLFxuICBkaXZpc29yOiAnYWNjZXNzb3IuZGl2aXNvcicsXG4gIG5vcm1hbGl6ZWQ6ICdhY2Nlc3Nvci5ub3JtYWxpemVkJyxcbiAgaW50ZWdlcjogJ2FjY2Vzc29yLmludGVnZXInLFxuICBpbnN0YW5jZWQ6ICdhY2Nlc3Nvci5kaXZpc29yJyxcbiAgaXNJbnN0YW5jZWQ6ICdhY2Nlc3Nvci5kaXZpc29yJ1xufTtcbmNvbnN0IFBST1BfQ0hFQ0tTX0lOSVRJQUxJWkUgPSB7XG4gIHJlbW92ZWRQcm9wczoge30sXG4gIHJlcGxhY2VkUHJvcHM6IHtcbiAgICBieXRlczogJ2J5dGVMZW5ndGgnXG4gIH0sXG4gIGRlcHJlY2F0ZWRQcm9wczogREVQUkVDQVRFRF9QUk9QU1xufTtcbmNvbnN0IFBST1BfQ0hFQ0tTX1NFVF9QUk9QUyA9IHtcbiAgcmVtb3ZlZFByb3BzOiBERVBSRUNBVEVEX1BST1BTXG59O1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQnVmZmVyIGV4dGVuZHMgUmVzb3VyY2Uge1xuICBjb25zdHJ1Y3RvcihnbCwgcHJvcHMgPSB7fSkge1xuICAgIHN1cGVyKGdsLCBwcm9wcyk7XG4gICAgdGhpcy5zdHViUmVtb3ZlZE1ldGhvZHMoJ0J1ZmZlcicsICd2Ni4wJywgWydsYXlvdXQnLCAnc2V0TGF5b3V0JywgJ2dldEluZGV4ZWRQYXJhbWV0ZXInXSk7XG4gICAgdGhpcy50YXJnZXQgPSBwcm9wcy50YXJnZXQgfHwgKHRoaXMuZ2wud2ViZ2wyID8gMzY2NjIgOiAzNDk2Mik7XG4gICAgdGhpcy5pbml0aWFsaXplKHByb3BzKTtcbiAgICBPYmplY3Quc2VhbCh0aGlzKTtcbiAgfVxuXG4gIGdldEVsZW1lbnRDb3VudChhY2Nlc3NvciA9IHRoaXMuYWNjZXNzb3IpIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZCh0aGlzLmJ5dGVMZW5ndGggLyBBY2Nlc3Nvci5nZXRCeXRlc1BlckVsZW1lbnQoYWNjZXNzb3IpKTtcbiAgfVxuXG4gIGdldFZlcnRleENvdW50KGFjY2Vzc29yID0gdGhpcy5hY2Nlc3Nvcikge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKHRoaXMuYnl0ZUxlbmd0aCAvIEFjY2Vzc29yLmdldEJ5dGVzUGVyVmVydGV4KGFjY2Vzc29yKSk7XG4gIH1cblxuICBpbml0aWFsaXplKHByb3BzID0ge30pIHtcbiAgICBpZiAoQXJyYXlCdWZmZXIuaXNWaWV3KHByb3BzKSkge1xuICAgICAgcHJvcHMgPSB7XG4gICAgICAgIGRhdGE6IHByb3BzXG4gICAgICB9O1xuICAgIH1cblxuICAgIGlmIChOdW1iZXIuaXNGaW5pdGUocHJvcHMpKSB7XG4gICAgICBwcm9wcyA9IHtcbiAgICAgICAgYnl0ZUxlbmd0aDogcHJvcHNcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcHJvcHMgPSBjaGVja1Byb3BzKCdCdWZmZXInLCBwcm9wcywgUFJPUF9DSEVDS1NfSU5JVElBTElaRSk7XG4gICAgdGhpcy51c2FnZSA9IHByb3BzLnVzYWdlIHx8IDM1MDQ0O1xuICAgIHRoaXMuZGVidWdEYXRhID0gbnVsbDtcbiAgICB0aGlzLnNldEFjY2Vzc29yKE9iamVjdC5hc3NpZ24oe30sIHByb3BzLCBwcm9wcy5hY2Nlc3NvcikpO1xuXG4gICAgaWYgKHByb3BzLmRhdGEpIHtcbiAgICAgIHRoaXMuX3NldERhdGEocHJvcHMuZGF0YSwgcHJvcHMub2Zmc2V0LCBwcm9wcy5ieXRlTGVuZ3RoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fc2V0Qnl0ZUxlbmd0aChwcm9wcy5ieXRlTGVuZ3RoIHx8IDApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc2V0UHJvcHMocHJvcHMpIHtcbiAgICBwcm9wcyA9IGNoZWNrUHJvcHMoJ0J1ZmZlcicsIHByb3BzLCBQUk9QX0NIRUNLU19TRVRfUFJPUFMpO1xuXG4gICAgaWYgKCdhY2Nlc3NvcicgaW4gcHJvcHMpIHtcbiAgICAgIHRoaXMuc2V0QWNjZXNzb3IocHJvcHMuYWNjZXNzb3IpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc2V0QWNjZXNzb3IoYWNjZXNzb3IpIHtcbiAgICBhY2Nlc3NvciA9IE9iamVjdC5hc3NpZ24oe30sIGFjY2Vzc29yKTtcbiAgICBkZWxldGUgYWNjZXNzb3IuYnVmZmVyO1xuICAgIHRoaXMuYWNjZXNzb3IgPSBuZXcgQWNjZXNzb3IoYWNjZXNzb3IpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcmVhbGxvY2F0ZShieXRlTGVuZ3RoKSB7XG4gICAgaWYgKGJ5dGVMZW5ndGggPiB0aGlzLmJ5dGVMZW5ndGgpIHtcbiAgICAgIHRoaXMuX3NldEJ5dGVMZW5ndGgoYnl0ZUxlbmd0aCk7XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHRoaXMuYnl0ZXNVc2VkID0gYnl0ZUxlbmd0aDtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBzZXREYXRhKHByb3BzKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5pdGlhbGl6ZShwcm9wcyk7XG4gIH1cblxuICBzdWJEYXRhKHByb3BzKSB7XG4gICAgaWYgKEFycmF5QnVmZmVyLmlzVmlldyhwcm9wcykpIHtcbiAgICAgIHByb3BzID0ge1xuICAgICAgICBkYXRhOiBwcm9wc1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb25zdCB7XG4gICAgICBkYXRhLFxuICAgICAgb2Zmc2V0ID0gMCxcbiAgICAgIHNyY09mZnNldCA9IDBcbiAgICB9ID0gcHJvcHM7XG4gICAgY29uc3QgYnl0ZUxlbmd0aCA9IHByb3BzLmJ5dGVMZW5ndGggfHwgcHJvcHMubGVuZ3RoO1xuICAgIGFzc2VydChkYXRhKTtcbiAgICBjb25zdCB0YXJnZXQgPSB0aGlzLmdsLndlYmdsMiA/IDM2NjYzIDogdGhpcy50YXJnZXQ7XG4gICAgdGhpcy5nbC5iaW5kQnVmZmVyKHRhcmdldCwgdGhpcy5oYW5kbGUpO1xuXG4gICAgaWYgKHNyY09mZnNldCAhPT0gMCB8fCBieXRlTGVuZ3RoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGFzc2VydFdlYkdMMkNvbnRleHQodGhpcy5nbCk7XG4gICAgICB0aGlzLmdsLmJ1ZmZlclN1YkRhdGEodGhpcy50YXJnZXQsIG9mZnNldCwgZGF0YSwgc3JjT2Zmc2V0LCBieXRlTGVuZ3RoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5nbC5idWZmZXJTdWJEYXRhKHRhcmdldCwgb2Zmc2V0LCBkYXRhKTtcbiAgICB9XG5cbiAgICB0aGlzLmdsLmJpbmRCdWZmZXIodGFyZ2V0LCBudWxsKTtcbiAgICB0aGlzLmRlYnVnRGF0YSA9IG51bGw7XG5cbiAgICB0aGlzLl9pbmZlclR5cGUoZGF0YSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGNvcHlEYXRhKHtcbiAgICBzb3VyY2VCdWZmZXIsXG4gICAgcmVhZE9mZnNldCA9IDAsXG4gICAgd3JpdGVPZmZzZXQgPSAwLFxuICAgIHNpemVcbiAgfSkge1xuICAgIGNvbnN0IHtcbiAgICAgIGdsXG4gICAgfSA9IHRoaXM7XG4gICAgYXNzZXJ0V2ViR0wyQ29udGV4dChnbCk7XG4gICAgZ2wuYmluZEJ1ZmZlcigzNjY2Miwgc291cmNlQnVmZmVyLmhhbmRsZSk7XG4gICAgZ2wuYmluZEJ1ZmZlcigzNjY2MywgdGhpcy5oYW5kbGUpO1xuICAgIGdsLmNvcHlCdWZmZXJTdWJEYXRhKDM2NjYyLCAzNjY2MywgcmVhZE9mZnNldCwgd3JpdGVPZmZzZXQsIHNpemUpO1xuICAgIGdsLmJpbmRCdWZmZXIoMzY2NjIsIG51bGwpO1xuICAgIGdsLmJpbmRCdWZmZXIoMzY2NjMsIG51bGwpO1xuICAgIHRoaXMuZGVidWdEYXRhID0gbnVsbDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGdldERhdGEoe1xuICAgIGRzdERhdGEgPSBudWxsLFxuICAgIHNyY0J5dGVPZmZzZXQgPSAwLFxuICAgIGRzdE9mZnNldCA9IDAsXG4gICAgbGVuZ3RoID0gMFxuICB9ID0ge30pIHtcbiAgICBhc3NlcnRXZWJHTDJDb250ZXh0KHRoaXMuZ2wpO1xuICAgIGNvbnN0IEFycmF5VHlwZSA9IGdldFR5cGVkQXJyYXlGcm9tR0xUeXBlKHRoaXMuYWNjZXNzb3IudHlwZSB8fCA1MTI2LCB7XG4gICAgICBjbGFtcGVkOiBmYWxzZVxuICAgIH0pO1xuXG4gICAgY29uc3Qgc291cmNlQXZhaWxhYmxlRWxlbWVudENvdW50ID0gdGhpcy5fZ2V0QXZhaWxhYmxlRWxlbWVudENvdW50KHNyY0J5dGVPZmZzZXQpO1xuXG4gICAgY29uc3QgZHN0RWxlbWVudE9mZnNldCA9IGRzdE9mZnNldDtcbiAgICBsZXQgZHN0QXZhaWxhYmxlRWxlbWVudENvdW50O1xuICAgIGxldCBkc3RFbGVtZW50Q291bnQ7XG5cbiAgICBpZiAoZHN0RGF0YSkge1xuICAgICAgZHN0RWxlbWVudENvdW50ID0gZHN0RGF0YS5sZW5ndGg7XG4gICAgICBkc3RBdmFpbGFibGVFbGVtZW50Q291bnQgPSBkc3RFbGVtZW50Q291bnQgLSBkc3RFbGVtZW50T2Zmc2V0O1xuICAgIH0gZWxzZSB7XG4gICAgICBkc3RBdmFpbGFibGVFbGVtZW50Q291bnQgPSBNYXRoLm1pbihzb3VyY2VBdmFpbGFibGVFbGVtZW50Q291bnQsIGxlbmd0aCB8fCBzb3VyY2VBdmFpbGFibGVFbGVtZW50Q291bnQpO1xuICAgICAgZHN0RWxlbWVudENvdW50ID0gZHN0RWxlbWVudE9mZnNldCArIGRzdEF2YWlsYWJsZUVsZW1lbnRDb3VudDtcbiAgICB9XG5cbiAgICBjb25zdCBjb3B5RWxlbWVudENvdW50ID0gTWF0aC5taW4oc291cmNlQXZhaWxhYmxlRWxlbWVudENvdW50LCBkc3RBdmFpbGFibGVFbGVtZW50Q291bnQpO1xuICAgIGxlbmd0aCA9IGxlbmd0aCB8fCBjb3B5RWxlbWVudENvdW50O1xuICAgIGFzc2VydChsZW5ndGggPD0gY29weUVsZW1lbnRDb3VudCk7XG4gICAgZHN0RGF0YSA9IGRzdERhdGEgfHwgbmV3IEFycmF5VHlwZShkc3RFbGVtZW50Q291bnQpO1xuICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcigzNjY2MiwgdGhpcy5oYW5kbGUpO1xuICAgIHRoaXMuZ2wuZ2V0QnVmZmVyU3ViRGF0YSgzNjY2Miwgc3JjQnl0ZU9mZnNldCwgZHN0RGF0YSwgZHN0T2Zmc2V0LCBsZW5ndGgpO1xuICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcigzNjY2MiwgbnVsbCk7XG4gICAgcmV0dXJuIGRzdERhdGE7XG4gIH1cblxuICBiaW5kKHtcbiAgICB0YXJnZXQgPSB0aGlzLnRhcmdldCxcbiAgICBpbmRleCA9IHRoaXMuYWNjZXNzb3IgJiYgdGhpcy5hY2Nlc3Nvci5pbmRleCxcbiAgICBvZmZzZXQgPSAwLFxuICAgIHNpemVcbiAgfSA9IHt9KSB7XG4gICAgaWYgKHRhcmdldCA9PT0gMzUzNDUgfHwgdGFyZ2V0ID09PSAzNTk4Mikge1xuICAgICAgaWYgKHNpemUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLmdsLmJpbmRCdWZmZXJSYW5nZSh0YXJnZXQsIGluZGV4LCB0aGlzLmhhbmRsZSwgb2Zmc2V0LCBzaXplKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFzc2VydChvZmZzZXQgPT09IDApO1xuICAgICAgICB0aGlzLmdsLmJpbmRCdWZmZXJCYXNlKHRhcmdldCwgaW5kZXgsIHRoaXMuaGFuZGxlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5nbC5iaW5kQnVmZmVyKHRhcmdldCwgdGhpcy5oYW5kbGUpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdW5iaW5kKHtcbiAgICB0YXJnZXQgPSB0aGlzLnRhcmdldCxcbiAgICBpbmRleCA9IHRoaXMuYWNjZXNzb3IgJiYgdGhpcy5hY2Nlc3Nvci5pbmRleFxuICB9ID0ge30pIHtcbiAgICBjb25zdCBpc0luZGV4ZWRCdWZmZXIgPSB0YXJnZXQgPT09IDM1MzQ1IHx8IHRhcmdldCA9PT0gMzU5ODI7XG5cbiAgICBpZiAoaXNJbmRleGVkQnVmZmVyKSB7XG4gICAgICB0aGlzLmdsLmJpbmRCdWZmZXJCYXNlKHRhcmdldCwgaW5kZXgsIG51bGwpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmdsLmJpbmRCdWZmZXIodGFyZ2V0LCBudWxsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGdldERlYnVnRGF0YSgpIHtcbiAgICBpZiAoIXRoaXMuZGVidWdEYXRhKSB7XG4gICAgICB0aGlzLmRlYnVnRGF0YSA9IHRoaXMuZ2V0RGF0YSh7XG4gICAgICAgIGxlbmd0aDogTWF0aC5taW4oREVCVUdfREFUQV9MRU5HVEgsIHRoaXMuYnl0ZUxlbmd0aClcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGF0YTogdGhpcy5kZWJ1Z0RhdGEsXG4gICAgICAgIGNoYW5nZWQ6IHRydWVcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGRhdGE6IHRoaXMuZGVidWdEYXRhLFxuICAgICAgY2hhbmdlZDogZmFsc2VcbiAgICB9O1xuICB9XG5cbiAgaW52YWxpZGF0ZURlYnVnRGF0YSgpIHtcbiAgICB0aGlzLmRlYnVnRGF0YSA9IG51bGw7XG4gIH1cblxuICBfc2V0RGF0YShkYXRhLCBvZmZzZXQgPSAwLCBieXRlTGVuZ3RoID0gZGF0YS5ieXRlTGVuZ3RoICsgb2Zmc2V0KSB7XG4gICAgYXNzZXJ0KEFycmF5QnVmZmVyLmlzVmlldyhkYXRhKSk7XG5cbiAgICB0aGlzLl90cmFja0RlYWxsb2NhdGVkTWVtb3J5KCk7XG5cbiAgICBjb25zdCB0YXJnZXQgPSB0aGlzLl9nZXRUYXJnZXQoKTtcblxuICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcih0YXJnZXQsIHRoaXMuaGFuZGxlKTtcbiAgICB0aGlzLmdsLmJ1ZmZlckRhdGEodGFyZ2V0LCBieXRlTGVuZ3RoLCB0aGlzLnVzYWdlKTtcbiAgICB0aGlzLmdsLmJ1ZmZlclN1YkRhdGEodGFyZ2V0LCBvZmZzZXQsIGRhdGEpO1xuICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcih0YXJnZXQsIG51bGwpO1xuICAgIHRoaXMuZGVidWdEYXRhID0gZGF0YS5zbGljZSgwLCBERUJVR19EQVRBX0xFTkdUSCk7XG4gICAgdGhpcy5ieXRlc1VzZWQgPSBieXRlTGVuZ3RoO1xuXG4gICAgdGhpcy5fdHJhY2tBbGxvY2F0ZWRNZW1vcnkoYnl0ZUxlbmd0aCk7XG5cbiAgICBjb25zdCB0eXBlID0gZ2V0R0xUeXBlRnJvbVR5cGVkQXJyYXkoZGF0YSk7XG4gICAgYXNzZXJ0KHR5cGUpO1xuICAgIHRoaXMuc2V0QWNjZXNzb3IobmV3IEFjY2Vzc29yKHRoaXMuYWNjZXNzb3IsIHtcbiAgICAgIHR5cGVcbiAgICB9KSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfc2V0Qnl0ZUxlbmd0aChieXRlTGVuZ3RoLCB1c2FnZSA9IHRoaXMudXNhZ2UpIHtcbiAgICBhc3NlcnQoYnl0ZUxlbmd0aCA+PSAwKTtcblxuICAgIHRoaXMuX3RyYWNrRGVhbGxvY2F0ZWRNZW1vcnkoKTtcblxuICAgIGxldCBkYXRhID0gYnl0ZUxlbmd0aDtcblxuICAgIGlmIChieXRlTGVuZ3RoID09PSAwKSB7XG4gICAgICBkYXRhID0gbmV3IEZsb2F0MzJBcnJheSgwKTtcbiAgICB9XG5cbiAgICBjb25zdCB0YXJnZXQgPSB0aGlzLl9nZXRUYXJnZXQoKTtcblxuICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcih0YXJnZXQsIHRoaXMuaGFuZGxlKTtcbiAgICB0aGlzLmdsLmJ1ZmZlckRhdGEodGFyZ2V0LCBkYXRhLCB1c2FnZSk7XG4gICAgdGhpcy5nbC5iaW5kQnVmZmVyKHRhcmdldCwgbnVsbCk7XG4gICAgdGhpcy51c2FnZSA9IHVzYWdlO1xuICAgIHRoaXMuZGVidWdEYXRhID0gbnVsbDtcbiAgICB0aGlzLmJ5dGVzVXNlZCA9IGJ5dGVMZW5ndGg7XG5cbiAgICB0aGlzLl90cmFja0FsbG9jYXRlZE1lbW9yeShieXRlTGVuZ3RoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgX2dldFRhcmdldCgpIHtcbiAgICByZXR1cm4gdGhpcy5nbC53ZWJnbDIgPyAzNjY2MyA6IHRoaXMudGFyZ2V0O1xuICB9XG5cbiAgX2dldEF2YWlsYWJsZUVsZW1lbnRDb3VudChzcmNCeXRlT2Zmc2V0KSB7XG4gICAgY29uc3QgQXJyYXlUeXBlID0gZ2V0VHlwZWRBcnJheUZyb21HTFR5cGUodGhpcy5hY2Nlc3Nvci50eXBlIHx8IDUxMjYsIHtcbiAgICAgIGNsYW1wZWQ6IGZhbHNlXG4gICAgfSk7XG4gICAgY29uc3Qgc291cmNlRWxlbWVudE9mZnNldCA9IHNyY0J5dGVPZmZzZXQgLyBBcnJheVR5cGUuQllURVNfUEVSX0VMRU1FTlQ7XG4gICAgcmV0dXJuIHRoaXMuZ2V0RWxlbWVudENvdW50KCkgLSBzb3VyY2VFbGVtZW50T2Zmc2V0O1xuICB9XG5cbiAgX2luZmVyVHlwZShkYXRhKSB7XG4gICAgaWYgKCF0aGlzLmFjY2Vzc29yLnR5cGUpIHtcbiAgICAgIHRoaXMuc2V0QWNjZXNzb3IobmV3IEFjY2Vzc29yKHRoaXMuYWNjZXNzb3IsIHtcbiAgICAgICAgdHlwZTogZ2V0R0xUeXBlRnJvbVR5cGVkQXJyYXkoZGF0YSlcbiAgICAgIH0pKTtcbiAgICB9XG4gIH1cblxuICBfY3JlYXRlSGFuZGxlKCkge1xuICAgIHJldHVybiB0aGlzLmdsLmNyZWF0ZUJ1ZmZlcigpO1xuICB9XG5cbiAgX2RlbGV0ZUhhbmRsZSgpIHtcbiAgICB0aGlzLmdsLmRlbGV0ZUJ1ZmZlcih0aGlzLmhhbmRsZSk7XG5cbiAgICB0aGlzLl90cmFja0RlYWxsb2NhdGVkTWVtb3J5KCk7XG4gIH1cblxuICBfZ2V0UGFyYW1ldGVyKHBuYW1lKSB7XG4gICAgdGhpcy5nbC5iaW5kQnVmZmVyKHRoaXMudGFyZ2V0LCB0aGlzLmhhbmRsZSk7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLmdsLmdldEJ1ZmZlclBhcmFtZXRlcih0aGlzLnRhcmdldCwgcG5hbWUpO1xuICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcih0aGlzLnRhcmdldCwgbnVsbCk7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgZ2V0IHR5cGUoKSB7XG4gICAgbG9nLmRlcHJlY2F0ZWQoJ0J1ZmZlci50eXBlJywgJ0J1ZmZlci5hY2Nlc3Nvci50eXBlJykoKTtcbiAgICByZXR1cm4gdGhpcy5hY2Nlc3Nvci50eXBlO1xuICB9XG5cbiAgZ2V0IGJ5dGVzKCkge1xuICAgIGxvZy5kZXByZWNhdGVkKCdCdWZmZXIuYnl0ZXMnLCAnQnVmZmVyLmJ5dGVMZW5ndGgnKSgpO1xuICAgIHJldHVybiB0aGlzLmJ5dGVMZW5ndGg7XG4gIH1cblxuICBzZXRCeXRlTGVuZ3RoKGJ5dGVMZW5ndGgpIHtcbiAgICBsb2cuZGVwcmVjYXRlZCgnc2V0Qnl0ZUxlbmd0aCcsICdyZWFsbG9jYXRlJykoKTtcbiAgICByZXR1cm4gdGhpcy5yZWFsbG9jYXRlKGJ5dGVMZW5ndGgpO1xuICB9XG5cbiAgdXBkYXRlQWNjZXNzb3Iob3B0cykge1xuICAgIGxvZy5kZXByZWNhdGVkKCd1cGRhdGVBY2Nlc3NvciguLi4pJywgJ3NldEFjY2Vzc29yKG5ldyBBY2Nlc3NvcihidWZmZXIuYWNjZXNzb3IsIC4uLiknKSgpO1xuICAgIHRoaXMuYWNjZXNzb3IgPSBuZXcgQWNjZXNzb3IodGhpcy5hY2Nlc3Nvciwgb3B0cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YnVmZmVyLmpzLm1hcCIsImltcG9ydCB7IGFzc2VydFdlYkdMMkNvbnRleHQsIHdpdGhQYXJhbWV0ZXJzIH0gZnJvbSAnQGx1bWEuZ2wvZ2x0b29scyc7XG5pbXBvcnQgeyBhc3NlcnQgfSBmcm9tICcuLi91dGlscy9hc3NlcnQnO1xuY29uc3QgR0xfREVQVEhfQlVGRkVSX0JJVCA9IDB4MDAwMDAxMDA7XG5jb25zdCBHTF9TVEVOQ0lMX0JVRkZFUl9CSVQgPSAweDAwMDAwNDAwO1xuY29uc3QgR0xfQ09MT1JfQlVGRkVSX0JJVCA9IDB4MDAwMDQwMDA7XG5jb25zdCBHTF9DT0xPUiA9IDB4MTgwMDtcbmNvbnN0IEdMX0RFUFRIID0gMHgxODAxO1xuY29uc3QgR0xfU1RFTkNJTCA9IDB4MTgwMjtcbmNvbnN0IEdMX0RFUFRIX1NURU5DSUwgPSAweDg0Zjk7XG5jb25zdCBFUlJfQVJHVU1FTlRTID0gJ2NsZWFyOiBiYWQgYXJndW1lbnRzJztcbmV4cG9ydCBmdW5jdGlvbiBjbGVhcihnbCwge1xuICBmcmFtZWJ1ZmZlciA9IG51bGwsXG4gIGNvbG9yID0gbnVsbCxcbiAgZGVwdGggPSBudWxsLFxuICBzdGVuY2lsID0gbnVsbFxufSA9IHt9KSB7XG4gIGNvbnN0IHBhcmFtZXRlcnMgPSB7fTtcblxuICBpZiAoZnJhbWVidWZmZXIpIHtcbiAgICBwYXJhbWV0ZXJzLmZyYW1lYnVmZmVyID0gZnJhbWVidWZmZXI7XG4gIH1cblxuICBsZXQgY2xlYXJGbGFncyA9IDA7XG5cbiAgaWYgKGNvbG9yKSB7XG4gICAgY2xlYXJGbGFncyB8PSBHTF9DT0xPUl9CVUZGRVJfQklUO1xuXG4gICAgaWYgKGNvbG9yICE9PSB0cnVlKSB7XG4gICAgICBwYXJhbWV0ZXJzLmNsZWFyQ29sb3IgPSBjb2xvcjtcbiAgICB9XG4gIH1cblxuICBpZiAoZGVwdGgpIHtcbiAgICBjbGVhckZsYWdzIHw9IEdMX0RFUFRIX0JVRkZFUl9CSVQ7XG5cbiAgICBpZiAoZGVwdGggIT09IHRydWUpIHtcbiAgICAgIHBhcmFtZXRlcnMuY2xlYXJEZXB0aCA9IGRlcHRoO1xuICAgIH1cbiAgfVxuXG4gIGlmIChzdGVuY2lsKSB7XG4gICAgY2xlYXJGbGFncyB8PSBHTF9TVEVOQ0lMX0JVRkZFUl9CSVQ7XG5cbiAgICBpZiAoZGVwdGggIT09IHRydWUpIHtcbiAgICAgIHBhcmFtZXRlcnMuY2xlYXJTdGVuY2lsID0gZGVwdGg7XG4gICAgfVxuICB9XG5cbiAgYXNzZXJ0KGNsZWFyRmxhZ3MgIT09IDAsIEVSUl9BUkdVTUVOVFMpO1xuICB3aXRoUGFyYW1ldGVycyhnbCwgcGFyYW1ldGVycywgKCkgPT4ge1xuICAgIGdsLmNsZWFyKGNsZWFyRmxhZ3MpO1xuICB9KTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBjbGVhckJ1ZmZlcihnbCwge1xuICBmcmFtZWJ1ZmZlciA9IG51bGwsXG4gIGJ1ZmZlciA9IEdMX0NPTE9SLFxuICBkcmF3QnVmZmVyID0gMCxcbiAgdmFsdWUgPSBbMCwgMCwgMCwgMF1cbn0gPSB7fSkge1xuICBhc3NlcnRXZWJHTDJDb250ZXh0KGdsKTtcbiAgd2l0aFBhcmFtZXRlcnMoZ2wsIHtcbiAgICBmcmFtZWJ1ZmZlclxuICB9LCAoKSA9PiB7XG4gICAgc3dpdGNoIChidWZmZXIpIHtcbiAgICAgIGNhc2UgR0xfQ09MT1I6XG4gICAgICAgIHN3aXRjaCAodmFsdWUuY29uc3RydWN0b3IpIHtcbiAgICAgICAgICBjYXNlIEludDMyQXJyYXk6XG4gICAgICAgICAgICBnbC5jbGVhckJ1ZmZlcml2KGJ1ZmZlciwgZHJhd0J1ZmZlciwgdmFsdWUpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBjYXNlIFVpbnQzMkFycmF5OlxuICAgICAgICAgICAgZ2wuY2xlYXJCdWZmZXJ1aXYoYnVmZmVyLCBkcmF3QnVmZmVyLCB2YWx1ZSk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGNhc2UgRmxvYXQzMkFycmF5OlxuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBnbC5jbGVhckJ1ZmZlcmZ2KGJ1ZmZlciwgZHJhd0J1ZmZlciwgdmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgR0xfREVQVEg6XG4gICAgICAgIGdsLmNsZWFyQnVmZmVyZnYoR0xfREVQVEgsIDAsIFt2YWx1ZV0pO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBHTF9TVEVOQ0lMOlxuICAgICAgICBnbC5jbGVhckJ1ZmZlcml2KEdMX1NURU5DSUwsIDAsIFt2YWx1ZV0pO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBHTF9ERVBUSF9TVEVOQ0lMOlxuICAgICAgICBjb25zdCBbZGVwdGgsIHN0ZW5jaWxdID0gdmFsdWU7XG4gICAgICAgIGdsLmNsZWFyQnVmZmVyZmkoR0xfREVQVEhfU1RFTkNJTCwgMCwgZGVwdGgsIHN0ZW5jaWwpO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYXNzZXJ0KGZhbHNlLCBFUlJfQVJHVU1FTlRTKTtcbiAgICB9XG4gIH0pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y2xlYXIuanMubWFwIiwiaW1wb3J0IEJ1ZmZlciBmcm9tICcuL2J1ZmZlcic7XG5pbXBvcnQgRnJhbWVidWZmZXIgZnJvbSAnLi9mcmFtZWJ1ZmZlcic7XG5pbXBvcnQgVGV4dHVyZSBmcm9tICcuL3RleHR1cmUnO1xuaW1wb3J0IHsgYXNzZXJ0V2ViR0wyQ29udGV4dCwgd2l0aFBhcmFtZXRlcnMsIGxvZyB9IGZyb20gJ0BsdW1hLmdsL2dsdG9vbHMnO1xuaW1wb3J0IHsgZmxpcFJvd3MsIHNjYWxlUGl4ZWxzIH0gZnJvbSAnLi4vd2ViZ2wtdXRpbHMvdHlwZWQtYXJyYXktdXRpbHMnO1xuaW1wb3J0IHsgZ2V0VHlwZWRBcnJheUZyb21HTFR5cGUsIGdldEdMVHlwZUZyb21UeXBlZEFycmF5IH0gZnJvbSAnLi4vd2ViZ2wtdXRpbHMvdHlwZWQtYXJyYXktdXRpbHMnO1xuaW1wb3J0IHsgZ2xGb3JtYXRUb0NvbXBvbmVudHMsIGdsVHlwZVRvQnl0ZXMgfSBmcm9tICcuLi93ZWJnbC11dGlscy9mb3JtYXQtdXRpbHMnO1xuaW1wb3J0IHsgdG9GcmFtZWJ1ZmZlciB9IGZyb20gJy4uL3dlYmdsLXV0aWxzL3RleHR1cmUtdXRpbHMnO1xuaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSAnLi4vdXRpbHMvYXNzZXJ0JztcbmV4cG9ydCBmdW5jdGlvbiByZWFkUGl4ZWxzVG9BcnJheShzb3VyY2UsIG9wdGlvbnMgPSB7fSkge1xuICBjb25zdCB7XG4gICAgc291cmNlWCA9IDAsXG4gICAgc291cmNlWSA9IDAsXG4gICAgc291cmNlRm9ybWF0ID0gNjQwOFxuICB9ID0gb3B0aW9ucztcbiAgbGV0IHtcbiAgICBzb3VyY2VBdHRhY2htZW50ID0gMzYwNjQsXG4gICAgdGFyZ2V0ID0gbnVsbCxcbiAgICBzb3VyY2VXaWR0aCxcbiAgICBzb3VyY2VIZWlnaHQsXG4gICAgc291cmNlVHlwZVxuICB9ID0gb3B0aW9ucztcbiAgY29uc3Qge1xuICAgIGZyYW1lYnVmZmVyLFxuICAgIGRlbGV0ZUZyYW1lYnVmZmVyXG4gIH0gPSBnZXRGcmFtZWJ1ZmZlcihzb3VyY2UpO1xuICBhc3NlcnQoZnJhbWVidWZmZXIpO1xuICBjb25zdCB7XG4gICAgZ2wsXG4gICAgaGFuZGxlLFxuICAgIGF0dGFjaG1lbnRzXG4gIH0gPSBmcmFtZWJ1ZmZlcjtcbiAgc291cmNlV2lkdGggPSBzb3VyY2VXaWR0aCB8fCBmcmFtZWJ1ZmZlci53aWR0aDtcbiAgc291cmNlSGVpZ2h0ID0gc291cmNlSGVpZ2h0IHx8IGZyYW1lYnVmZmVyLmhlaWdodDtcblxuICBpZiAoc291cmNlQXR0YWNobWVudCA9PT0gMzYwNjQgJiYgaGFuZGxlID09PSBudWxsKSB7XG4gICAgc291cmNlQXR0YWNobWVudCA9IDEwMjg7XG4gIH1cblxuICBhc3NlcnQoYXR0YWNobWVudHNbc291cmNlQXR0YWNobWVudF0pO1xuICBzb3VyY2VUeXBlID0gc291cmNlVHlwZSB8fCBhdHRhY2htZW50c1tzb3VyY2VBdHRhY2htZW50XS50eXBlO1xuICB0YXJnZXQgPSBnZXRQaXhlbEFycmF5KHRhcmdldCwgc291cmNlVHlwZSwgc291cmNlRm9ybWF0LCBzb3VyY2VXaWR0aCwgc291cmNlSGVpZ2h0KTtcbiAgc291cmNlVHlwZSA9IHNvdXJjZVR5cGUgfHwgZ2V0R0xUeXBlRnJvbVR5cGVkQXJyYXkodGFyZ2V0KTtcbiAgY29uc3QgcHJldkhhbmRsZSA9IGdsLmJpbmRGcmFtZWJ1ZmZlcigzNjE2MCwgaGFuZGxlKTtcbiAgZ2wucmVhZFBpeGVscyhzb3VyY2VYLCBzb3VyY2VZLCBzb3VyY2VXaWR0aCwgc291cmNlSGVpZ2h0LCBzb3VyY2VGb3JtYXQsIHNvdXJjZVR5cGUsIHRhcmdldCk7XG4gIGdsLmJpbmRGcmFtZWJ1ZmZlcigzNjE2MCwgcHJldkhhbmRsZSB8fCBudWxsKTtcblxuICBpZiAoZGVsZXRlRnJhbWVidWZmZXIpIHtcbiAgICBmcmFtZWJ1ZmZlci5kZWxldGUoKTtcbiAgfVxuXG4gIHJldHVybiB0YXJnZXQ7XG59XG5leHBvcnQgZnVuY3Rpb24gcmVhZFBpeGVsc1RvQnVmZmVyKHNvdXJjZSwge1xuICBzb3VyY2VYID0gMCxcbiAgc291cmNlWSA9IDAsXG4gIHNvdXJjZUZvcm1hdCA9IDY0MDgsXG4gIHRhcmdldCA9IG51bGwsXG4gIHRhcmdldEJ5dGVPZmZzZXQgPSAwLFxuICBzb3VyY2VXaWR0aCxcbiAgc291cmNlSGVpZ2h0LFxuICBzb3VyY2VUeXBlXG59KSB7XG4gIGNvbnN0IHtcbiAgICBmcmFtZWJ1ZmZlcixcbiAgICBkZWxldGVGcmFtZWJ1ZmZlclxuICB9ID0gZ2V0RnJhbWVidWZmZXIoc291cmNlKTtcbiAgYXNzZXJ0KGZyYW1lYnVmZmVyKTtcbiAgc291cmNlV2lkdGggPSBzb3VyY2VXaWR0aCB8fCBmcmFtZWJ1ZmZlci53aWR0aDtcbiAgc291cmNlSGVpZ2h0ID0gc291cmNlSGVpZ2h0IHx8IGZyYW1lYnVmZmVyLmhlaWdodDtcbiAgY29uc3QgZ2wyID0gYXNzZXJ0V2ViR0wyQ29udGV4dChmcmFtZWJ1ZmZlci5nbCk7XG4gIHNvdXJjZVR5cGUgPSBzb3VyY2VUeXBlIHx8ICh0YXJnZXQgPyB0YXJnZXQudHlwZSA6IDUxMjEpO1xuXG4gIGlmICghdGFyZ2V0KSB7XG4gICAgY29uc3QgY29tcG9uZW50cyA9IGdsRm9ybWF0VG9Db21wb25lbnRzKHNvdXJjZUZvcm1hdCk7XG4gICAgY29uc3QgYnl0ZUNvdW50ID0gZ2xUeXBlVG9CeXRlcyhzb3VyY2VUeXBlKTtcbiAgICBjb25zdCBieXRlTGVuZ3RoID0gdGFyZ2V0Qnl0ZU9mZnNldCArIHNvdXJjZVdpZHRoICogc291cmNlSGVpZ2h0ICogY29tcG9uZW50cyAqIGJ5dGVDb3VudDtcbiAgICB0YXJnZXQgPSBuZXcgQnVmZmVyKGdsMiwge1xuICAgICAgYnl0ZUxlbmd0aCxcbiAgICAgIGFjY2Vzc29yOiB7XG4gICAgICAgIHR5cGU6IHNvdXJjZVR5cGUsXG4gICAgICAgIHNpemU6IGNvbXBvbmVudHNcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHRhcmdldC5iaW5kKHtcbiAgICB0YXJnZXQ6IDM1MDUxXG4gIH0pO1xuICB3aXRoUGFyYW1ldGVycyhnbDIsIHtcbiAgICBmcmFtZWJ1ZmZlclxuICB9LCAoKSA9PiB7XG4gICAgZ2wyLnJlYWRQaXhlbHMoc291cmNlWCwgc291cmNlWSwgc291cmNlV2lkdGgsIHNvdXJjZUhlaWdodCwgc291cmNlRm9ybWF0LCBzb3VyY2VUeXBlLCB0YXJnZXRCeXRlT2Zmc2V0KTtcbiAgfSk7XG4gIHRhcmdldC51bmJpbmQoe1xuICAgIHRhcmdldDogMzUwNTFcbiAgfSk7XG5cbiAgaWYgKGRlbGV0ZUZyYW1lYnVmZmVyKSB7XG4gICAgZnJhbWVidWZmZXIuZGVsZXRlKCk7XG4gIH1cblxuICByZXR1cm4gdGFyZ2V0O1xufVxuZXhwb3J0IGZ1bmN0aW9uIGNvcHlUb0RhdGFVcmwoc291cmNlLCB7XG4gIHNvdXJjZUF0dGFjaG1lbnQgPSAzNjA2NCxcbiAgdGFyZ2V0TWF4SGVpZ2h0ID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVJcbn0gPSB7fSkge1xuICBsZXQgZGF0YSA9IHJlYWRQaXhlbHNUb0FycmF5KHNvdXJjZSwge1xuICAgIHNvdXJjZUF0dGFjaG1lbnRcbiAgfSk7XG4gIGxldCB7XG4gICAgd2lkdGgsXG4gICAgaGVpZ2h0XG4gIH0gPSBzb3VyY2U7XG5cbiAgd2hpbGUgKGhlaWdodCA+IHRhcmdldE1heEhlaWdodCkge1xuICAgICh7XG4gICAgICBkYXRhLFxuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHRcbiAgICB9ID0gc2NhbGVQaXhlbHMoe1xuICAgICAgZGF0YSxcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0XG4gICAgfSkpO1xuICB9XG5cbiAgZmxpcFJvd3Moe1xuICAgIGRhdGEsXG4gICAgd2lkdGgsXG4gICAgaGVpZ2h0XG4gIH0pO1xuICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgY2FudmFzLndpZHRoID0gd2lkdGg7XG4gIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XG4gIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgY29uc3QgaW1hZ2VEYXRhID0gY29udGV4dC5jcmVhdGVJbWFnZURhdGEod2lkdGgsIGhlaWdodCk7XG4gIGltYWdlRGF0YS5kYXRhLnNldChkYXRhKTtcbiAgY29udGV4dC5wdXRJbWFnZURhdGEoaW1hZ2VEYXRhLCAwLCAwKTtcbiAgcmV0dXJuIGNhbnZhcy50b0RhdGFVUkwoKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBjb3B5VG9JbWFnZShzb3VyY2UsIHtcbiAgc291cmNlQXR0YWNobWVudCA9IDM2MDY0LFxuICB0YXJnZXRJbWFnZSA9IG51bGxcbn0gPSB7fSkge1xuICBjb25zdCBkYXRhVXJsID0gY29weVRvRGF0YVVybChzb3VyY2UsIHtcbiAgICBzb3VyY2VBdHRhY2htZW50XG4gIH0pO1xuICB0YXJnZXRJbWFnZSA9IHRhcmdldEltYWdlIHx8IG5ldyBJbWFnZSgpO1xuICB0YXJnZXRJbWFnZS5zcmMgPSBkYXRhVXJsO1xuICByZXR1cm4gdGFyZ2V0SW1hZ2U7XG59XG5leHBvcnQgZnVuY3Rpb24gY29weVRvVGV4dHVyZShzb3VyY2UsIHRhcmdldCwgb3B0aW9ucyA9IHt9KSB7XG4gIGNvbnN0IHtcbiAgICBzb3VyY2VYID0gMCxcbiAgICBzb3VyY2VZID0gMCxcbiAgICB0YXJnZXRNaXBtYXBsZXZlbCA9IDAsXG4gICAgdGFyZ2V0SW50ZXJuYWxGb3JtYXQgPSA2NDA4XG4gIH0gPSBvcHRpb25zO1xuICBsZXQge1xuICAgIHRhcmdldFgsXG4gICAgdGFyZ2V0WSxcbiAgICB0YXJnZXRaLFxuICAgIHdpZHRoLFxuICAgIGhlaWdodFxuICB9ID0gb3B0aW9ucztcbiAgY29uc3Qge1xuICAgIGZyYW1lYnVmZmVyLFxuICAgIGRlbGV0ZUZyYW1lYnVmZmVyXG4gIH0gPSBnZXRGcmFtZWJ1ZmZlcihzb3VyY2UpO1xuICBhc3NlcnQoZnJhbWVidWZmZXIpO1xuICBjb25zdCB7XG4gICAgZ2wsXG4gICAgaGFuZGxlXG4gIH0gPSBmcmFtZWJ1ZmZlcjtcbiAgY29uc3QgaXNTdWJDb3B5ID0gdHlwZW9mIHRhcmdldFggIT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiB0YXJnZXRZICE9PSAndW5kZWZpbmVkJyB8fCB0eXBlb2YgdGFyZ2V0WiAhPT0gJ3VuZGVmaW5lZCc7XG4gIHRhcmdldFggPSB0YXJnZXRYIHx8IDA7XG4gIHRhcmdldFkgPSB0YXJnZXRZIHx8IDA7XG4gIHRhcmdldFogPSB0YXJnZXRaIHx8IDA7XG4gIGNvbnN0IHByZXZIYW5kbGUgPSBnbC5iaW5kRnJhbWVidWZmZXIoMzYxNjAsIGhhbmRsZSk7XG4gIGFzc2VydCh0YXJnZXQpO1xuICBsZXQgdGV4dHVyZSA9IG51bGw7XG5cbiAgaWYgKHRhcmdldCBpbnN0YW5jZW9mIFRleHR1cmUpIHtcbiAgICB0ZXh0dXJlID0gdGFyZ2V0O1xuICAgIHdpZHRoID0gTnVtYmVyLmlzRmluaXRlKHdpZHRoKSA/IHdpZHRoIDogdGV4dHVyZS53aWR0aDtcbiAgICBoZWlnaHQgPSBOdW1iZXIuaXNGaW5pdGUoaGVpZ2h0KSA/IGhlaWdodCA6IHRleHR1cmUuaGVpZ2h0O1xuICAgIHRleHR1cmUuYmluZCgwKTtcbiAgICB0YXJnZXQgPSB0ZXh0dXJlLnRhcmdldDtcbiAgfVxuXG4gIGlmICghaXNTdWJDb3B5KSB7XG4gICAgZ2wuY29weVRleEltYWdlMkQodGFyZ2V0LCB0YXJnZXRNaXBtYXBsZXZlbCwgdGFyZ2V0SW50ZXJuYWxGb3JtYXQsIHNvdXJjZVgsIHNvdXJjZVksIHdpZHRoLCBoZWlnaHQsIDApO1xuICB9IGVsc2Uge1xuICAgIHN3aXRjaCAodGFyZ2V0KSB7XG4gICAgICBjYXNlIDM1NTM6XG4gICAgICBjYXNlIDM0MDY3OlxuICAgICAgICBnbC5jb3B5VGV4U3ViSW1hZ2UyRCh0YXJnZXQsIHRhcmdldE1pcG1hcGxldmVsLCB0YXJnZXRYLCB0YXJnZXRZLCBzb3VyY2VYLCBzb3VyY2VZLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgMzU4NjY6XG4gICAgICBjYXNlIDMyODc5OlxuICAgICAgICBjb25zdCBnbDIgPSBhc3NlcnRXZWJHTDJDb250ZXh0KGdsKTtcbiAgICAgICAgZ2wyLmNvcHlUZXhTdWJJbWFnZTNEKHRhcmdldCwgdGFyZ2V0TWlwbWFwbGV2ZWwsIHRhcmdldFgsIHRhcmdldFksIHRhcmdldFosIHNvdXJjZVgsIHNvdXJjZVksIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICB9XG4gIH1cblxuICBpZiAodGV4dHVyZSkge1xuICAgIHRleHR1cmUudW5iaW5kKCk7XG4gIH1cblxuICBnbC5iaW5kRnJhbWVidWZmZXIoMzYxNjAsIHByZXZIYW5kbGUgfHwgbnVsbCk7XG5cbiAgaWYgKGRlbGV0ZUZyYW1lYnVmZmVyKSB7XG4gICAgZnJhbWVidWZmZXIuZGVsZXRlKCk7XG4gIH1cblxuICByZXR1cm4gdGV4dHVyZTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBibGl0KHNvdXJjZSwgdGFyZ2V0LCBvcHRpb25zID0ge30pIHtcbiAgY29uc3Qge1xuICAgIHNvdXJjZVgwID0gMCxcbiAgICBzb3VyY2VZMCA9IDAsXG4gICAgdGFyZ2V0WDAgPSAwLFxuICAgIHRhcmdldFkwID0gMCxcbiAgICBjb2xvciA9IHRydWUsXG4gICAgZGVwdGggPSBmYWxzZSxcbiAgICBzdGVuY2lsID0gZmFsc2UsXG4gICAgZmlsdGVyID0gOTcyOFxuICB9ID0gb3B0aW9ucztcbiAgbGV0IHtcbiAgICBzb3VyY2VYMSxcbiAgICBzb3VyY2VZMSxcbiAgICB0YXJnZXRYMSxcbiAgICB0YXJnZXRZMSxcbiAgICBzb3VyY2VBdHRhY2htZW50ID0gMzYwNjQsXG4gICAgbWFzayA9IDBcbiAgfSA9IG9wdGlvbnM7XG4gIGNvbnN0IHtcbiAgICBmcmFtZWJ1ZmZlcjogc3JjRnJhbWVidWZmZXIsXG4gICAgZGVsZXRlRnJhbWVidWZmZXI6IGRlbGV0ZVNyY0ZyYW1lYnVmZmVyXG4gIH0gPSBnZXRGcmFtZWJ1ZmZlcihzb3VyY2UpO1xuICBjb25zdCB7XG4gICAgZnJhbWVidWZmZXI6IGRzdEZyYW1lYnVmZmVyLFxuICAgIGRlbGV0ZUZyYW1lYnVmZmVyOiBkZWxldGVEc3RGcmFtZWJ1ZmZlclxuICB9ID0gZ2V0RnJhbWVidWZmZXIodGFyZ2V0KTtcbiAgYXNzZXJ0KHNyY0ZyYW1lYnVmZmVyKTtcbiAgYXNzZXJ0KGRzdEZyYW1lYnVmZmVyKTtcbiAgY29uc3Qge1xuICAgIGdsLFxuICAgIGhhbmRsZSxcbiAgICB3aWR0aCxcbiAgICBoZWlnaHQsXG4gICAgcmVhZEJ1ZmZlclxuICB9ID0gZHN0RnJhbWVidWZmZXI7XG4gIGNvbnN0IGdsMiA9IGFzc2VydFdlYkdMMkNvbnRleHQoZ2wpO1xuXG4gIGlmICghc3JjRnJhbWVidWZmZXIuaGFuZGxlICYmIHNvdXJjZUF0dGFjaG1lbnQgPT09IDM2MDY0KSB7XG4gICAgc291cmNlQXR0YWNobWVudCA9IDEwMjg7XG4gIH1cblxuICBpZiAoY29sb3IpIHtcbiAgICBtYXNrIHw9IDE2Mzg0O1xuICB9XG5cbiAgaWYgKGRlcHRoKSB7XG4gICAgbWFzayB8PSAyNTY7XG4gIH1cblxuICBpZiAoc3RlbmNpbCkge1xuICAgIG1hc2sgfD0gMTAyNDtcbiAgfVxuXG4gIGlmIChkZWxldGVTcmNGcmFtZWJ1ZmZlciB8fCBkZWxldGVEc3RGcmFtZWJ1ZmZlcikge1xuICAgIGlmIChtYXNrICYgKDI1NiB8IDEwMjQpKSB7XG4gICAgICBtYXNrID0gMTYzODQ7XG4gICAgICBsb2cud2FybignQmxpdHRpbmcgZnJvbSBvciBpbnRvIGEgVGV4dHVyZSBvYmplY3QsIGZvcmNpbmcgbWFzayB0byBHTC5DT0xPUl9CVUZGRVJfQklUJykoKTtcbiAgICB9XG4gIH1cblxuICBhc3NlcnQobWFzayk7XG4gIHNvdXJjZVgxID0gc291cmNlWDEgPT09IHVuZGVmaW5lZCA/IHNyY0ZyYW1lYnVmZmVyLndpZHRoIDogc291cmNlWDE7XG4gIHNvdXJjZVkxID0gc291cmNlWTEgPT09IHVuZGVmaW5lZCA/IHNyY0ZyYW1lYnVmZmVyLmhlaWdodCA6IHNvdXJjZVkxO1xuICB0YXJnZXRYMSA9IHRhcmdldFgxID09PSB1bmRlZmluZWQgPyB3aWR0aCA6IHRhcmdldFgxO1xuICB0YXJnZXRZMSA9IHRhcmdldFkxID09PSB1bmRlZmluZWQgPyBoZWlnaHQgOiB0YXJnZXRZMTtcbiAgY29uc3QgcHJldkRyYXdIYW5kbGUgPSBnbC5iaW5kRnJhbWVidWZmZXIoMzYwMDksIGhhbmRsZSk7XG4gIGNvbnN0IHByZXZSZWFkSGFuZGxlID0gZ2wuYmluZEZyYW1lYnVmZmVyKDM2MDA4LCBzcmNGcmFtZWJ1ZmZlci5oYW5kbGUpO1xuICBnbDIucmVhZEJ1ZmZlcihzb3VyY2VBdHRhY2htZW50KTtcbiAgZ2wyLmJsaXRGcmFtZWJ1ZmZlcihzb3VyY2VYMCwgc291cmNlWTAsIHNvdXJjZVgxLCBzb3VyY2VZMSwgdGFyZ2V0WDAsIHRhcmdldFkwLCB0YXJnZXRYMSwgdGFyZ2V0WTEsIG1hc2ssIGZpbHRlcik7XG4gIGdsMi5yZWFkQnVmZmVyKHJlYWRCdWZmZXIpO1xuICBnbDIuYmluZEZyYW1lYnVmZmVyKDM2MDA4LCBwcmV2UmVhZEhhbmRsZSB8fCBudWxsKTtcbiAgZ2wyLmJpbmRGcmFtZWJ1ZmZlcigzNjAwOSwgcHJldkRyYXdIYW5kbGUgfHwgbnVsbCk7XG5cbiAgaWYgKGRlbGV0ZVNyY0ZyYW1lYnVmZmVyKSB7XG4gICAgc3JjRnJhbWVidWZmZXIuZGVsZXRlKCk7XG4gIH1cblxuICBpZiAoZGVsZXRlRHN0RnJhbWVidWZmZXIpIHtcbiAgICBkc3RGcmFtZWJ1ZmZlci5kZWxldGUoKTtcbiAgfVxuXG4gIHJldHVybiBkc3RGcmFtZWJ1ZmZlcjtcbn1cblxuZnVuY3Rpb24gZ2V0RnJhbWVidWZmZXIoc291cmNlKSB7XG4gIGlmICghKHNvdXJjZSBpbnN0YW5jZW9mIEZyYW1lYnVmZmVyKSkge1xuICAgIHJldHVybiB7XG4gICAgICBmcmFtZWJ1ZmZlcjogdG9GcmFtZWJ1ZmZlcihzb3VyY2UpLFxuICAgICAgZGVsZXRlRnJhbWVidWZmZXI6IHRydWVcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBmcmFtZWJ1ZmZlcjogc291cmNlLFxuICAgIGRlbGV0ZUZyYW1lYnVmZmVyOiBmYWxzZVxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRQaXhlbEFycmF5KHBpeGVsQXJyYXksIHR5cGUsIGZvcm1hdCwgd2lkdGgsIGhlaWdodCkge1xuICBpZiAocGl4ZWxBcnJheSkge1xuICAgIHJldHVybiBwaXhlbEFycmF5O1xuICB9XG5cbiAgdHlwZSA9IHR5cGUgfHwgNTEyMTtcbiAgY29uc3QgQXJyYXlUeXBlID0gZ2V0VHlwZWRBcnJheUZyb21HTFR5cGUodHlwZSwge1xuICAgIGNsYW1wZWQ6IGZhbHNlXG4gIH0pO1xuICBjb25zdCBjb21wb25lbnRzID0gZ2xGb3JtYXRUb0NvbXBvbmVudHMoZm9ybWF0KTtcbiAgcmV0dXJuIG5ldyBBcnJheVR5cGUod2lkdGggKiBoZWlnaHQgKiBjb21wb25lbnRzKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvcHktYW5kLWJsaXQuanMubWFwIiwiaW1wb3J0IHsgZ2V0V2ViR0wyQ29udGV4dCwgYXNzZXJ0V2ViR0wyQ29udGV4dCwgbG9nIH0gZnJvbSAnQGx1bWEuZ2wvZ2x0b29scyc7XG5pbXBvcnQgUmVzb3VyY2UgZnJvbSAnLi9yZXNvdXJjZSc7XG5pbXBvcnQgVGV4dHVyZTJEIGZyb20gJy4vdGV4dHVyZS0yZCc7XG5pbXBvcnQgUmVuZGVyYnVmZmVyIGZyb20gJy4vcmVuZGVyYnVmZmVyJztcbmltcG9ydCB7IGNsZWFyLCBjbGVhckJ1ZmZlciB9IGZyb20gJy4vY2xlYXInO1xuaW1wb3J0IHsgY29weVRvRGF0YVVybCB9IGZyb20gJy4vY29weS1hbmQtYmxpdC5qcyc7XG5pbXBvcnQgeyBnZXRGZWF0dXJlcyB9IGZyb20gJy4uL2ZlYXR1cmVzJztcbmltcG9ydCB7IGdldEtleSB9IGZyb20gJy4uL3dlYmdsLXV0aWxzL2NvbnN0YW50cy10by1rZXlzJztcbmltcG9ydCB7IGFzc2VydCB9IGZyb20gJy4uL3V0aWxzL2Fzc2VydCc7XG5jb25zdCBFUlJfTVVMVElQTEVfUkVOREVSVEFSR0VUUyA9ICdNdWx0aXBsZSByZW5kZXIgdGFyZ2V0cyBub3Qgc3VwcG9ydGVkJztcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZyYW1lYnVmZmVyIGV4dGVuZHMgUmVzb3VyY2Uge1xuICBzdGF0aWMgaXNTdXBwb3J0ZWQoZ2wsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IHtcbiAgICAgIGNvbG9yQnVmZmVyRmxvYXQsXG4gICAgICBjb2xvckJ1ZmZlckhhbGZGbG9hdFxuICAgIH0gPSBvcHRpb25zO1xuICAgIGxldCBzdXBwb3J0ZWQgPSB0cnVlO1xuXG4gICAgaWYgKGNvbG9yQnVmZmVyRmxvYXQpIHtcbiAgICAgIHN1cHBvcnRlZCA9IEJvb2xlYW4oZ2wuZ2V0RXh0ZW5zaW9uKCdFWFRfY29sb3JfYnVmZmVyX2Zsb2F0JykgfHwgZ2wuZ2V0RXh0ZW5zaW9uKCdXRUJHTF9jb2xvcl9idWZmZXJfZmxvYXQnKSB8fCBnbC5nZXRFeHRlbnNpb24oJ09FU190ZXh0dXJlX2Zsb2F0JykpO1xuICAgIH1cblxuICAgIGlmIChjb2xvckJ1ZmZlckhhbGZGbG9hdCkge1xuICAgICAgc3VwcG9ydGVkID0gc3VwcG9ydGVkICYmIEJvb2xlYW4oZ2wuZ2V0RXh0ZW5zaW9uKCdFWFRfY29sb3JfYnVmZmVyX2Zsb2F0JykgfHwgZ2wuZ2V0RXh0ZW5zaW9uKCdFWFRfY29sb3JfYnVmZmVyX2hhbGZfZmxvYXQnKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN1cHBvcnRlZDtcbiAgfVxuXG4gIHN0YXRpYyBnZXREZWZhdWx0RnJhbWVidWZmZXIoZ2wpIHtcbiAgICBnbC5sdW1hID0gZ2wubHVtYSB8fCB7fTtcbiAgICBnbC5sdW1hLmRlZmF1bHRGcmFtZWJ1ZmZlciA9IGdsLmx1bWEuZGVmYXVsdEZyYW1lYnVmZmVyIHx8IG5ldyBGcmFtZWJ1ZmZlcihnbCwge1xuICAgICAgaWQ6ICdkZWZhdWx0LWZyYW1lYnVmZmVyJyxcbiAgICAgIGhhbmRsZTogbnVsbCxcbiAgICAgIGF0dGFjaG1lbnRzOiB7fVxuICAgIH0pO1xuICAgIHJldHVybiBnbC5sdW1hLmRlZmF1bHRGcmFtZWJ1ZmZlcjtcbiAgfVxuXG4gIGdldCBNQVhfQ09MT1JfQVRUQUNITUVOVFMoKSB7XG4gICAgY29uc3QgZ2wyID0gYXNzZXJ0V2ViR0wyQ29udGV4dCh0aGlzLmdsKTtcbiAgICByZXR1cm4gZ2wyLmdldFBhcmFtZXRlcihnbDIuTUFYX0NPTE9SX0FUVEFDSE1FTlRTKTtcbiAgfVxuXG4gIGdldCBNQVhfRFJBV19CVUZGRVJTKCkge1xuICAgIGNvbnN0IGdsMiA9IGFzc2VydFdlYkdMMkNvbnRleHQodGhpcy5nbCk7XG4gICAgcmV0dXJuIGdsMi5nZXRQYXJhbWV0ZXIoZ2wyLk1BWF9EUkFXX0JVRkZFUlMpO1xuICB9XG5cbiAgY29uc3RydWN0b3IoZ2wsIG9wdHMgPSB7fSkge1xuICAgIHN1cGVyKGdsLCBvcHRzKTtcbiAgICB0aGlzLndpZHRoID0gbnVsbDtcbiAgICB0aGlzLmhlaWdodCA9IG51bGw7XG4gICAgdGhpcy5hdHRhY2htZW50cyA9IHt9O1xuICAgIHRoaXMucmVhZEJ1ZmZlciA9IDM2MDY0O1xuICAgIHRoaXMuZHJhd0J1ZmZlcnMgPSBbMzYwNjRdO1xuICAgIHRoaXMub3duUmVzb3VyY2VzID0gW107XG4gICAgdGhpcy5pbml0aWFsaXplKG9wdHMpO1xuICAgIE9iamVjdC5zZWFsKHRoaXMpO1xuICB9XG5cbiAgZ2V0IGNvbG9yKCkge1xuICAgIHJldHVybiB0aGlzLmF0dGFjaG1lbnRzWzM2MDY0XSB8fCBudWxsO1xuICB9XG5cbiAgZ2V0IHRleHR1cmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuYXR0YWNobWVudHNbMzYwNjRdIHx8IG51bGw7XG4gIH1cblxuICBnZXQgZGVwdGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuYXR0YWNobWVudHNbMzYwOTZdIHx8IHRoaXMuYXR0YWNobWVudHNbMzMzMDZdIHx8IG51bGw7XG4gIH1cblxuICBnZXQgc3RlbmNpbCgpIHtcbiAgICByZXR1cm4gdGhpcy5hdHRhY2htZW50c1szNjEyOF0gfHwgdGhpcy5hdHRhY2htZW50c1szMzMwNl0gfHwgbnVsbDtcbiAgfVxuXG4gIGluaXRpYWxpemUoe1xuICAgIHdpZHRoID0gMSxcbiAgICBoZWlnaHQgPSAxLFxuICAgIGF0dGFjaG1lbnRzID0gbnVsbCxcbiAgICBjb2xvciA9IHRydWUsXG4gICAgZGVwdGggPSB0cnVlLFxuICAgIHN0ZW5jaWwgPSBmYWxzZSxcbiAgICBjaGVjayA9IHRydWUsXG4gICAgcmVhZEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBkcmF3QnVmZmVycyA9IHVuZGVmaW5lZFxuICB9KSB7XG4gICAgYXNzZXJ0KHdpZHRoID49IDAgJiYgaGVpZ2h0ID49IDAsICdXaWR0aCBhbmQgaGVpZ2h0IG5lZWQgdG8gYmUgaW50ZWdlcnMnKTtcbiAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICBpZiAoYXR0YWNobWVudHMpIHtcbiAgICAgIGZvciAoY29uc3QgYXR0YWNobWVudCBpbiBhdHRhY2htZW50cykge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBhdHRhY2htZW50c1thdHRhY2htZW50XTtcbiAgICAgICAgY29uc3Qgb2JqZWN0ID0gQXJyYXkuaXNBcnJheSh0YXJnZXQpID8gdGFyZ2V0WzBdIDogdGFyZ2V0O1xuICAgICAgICBvYmplY3QucmVzaXplKHtcbiAgICAgICAgICB3aWR0aCxcbiAgICAgICAgICBoZWlnaHRcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGF0dGFjaG1lbnRzID0gdGhpcy5fY3JlYXRlRGVmYXVsdEF0dGFjaG1lbnRzKGNvbG9yLCBkZXB0aCwgc3RlbmNpbCwgd2lkdGgsIGhlaWdodCk7XG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGUoe1xuICAgICAgY2xlYXJBdHRhY2htZW50czogdHJ1ZSxcbiAgICAgIGF0dGFjaG1lbnRzLFxuICAgICAgcmVhZEJ1ZmZlcixcbiAgICAgIGRyYXdCdWZmZXJzXG4gICAgfSk7XG5cbiAgICBpZiAoYXR0YWNobWVudHMgJiYgY2hlY2spIHtcbiAgICAgIHRoaXMuY2hlY2tTdGF0dXMoKTtcbiAgICB9XG4gIH1cblxuICBkZWxldGUoKSB7XG4gICAgZm9yIChjb25zdCByZXNvdXJjZSBvZiB0aGlzLm93blJlc291cmNlcykge1xuICAgICAgcmVzb3VyY2UuZGVsZXRlKCk7XG4gICAgfVxuXG4gICAgc3VwZXIuZGVsZXRlKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB1cGRhdGUoe1xuICAgIGF0dGFjaG1lbnRzID0ge30sXG4gICAgcmVhZEJ1ZmZlcixcbiAgICBkcmF3QnVmZmVycyxcbiAgICBjbGVhckF0dGFjaG1lbnRzID0gZmFsc2UsXG4gICAgcmVzaXplQXR0YWNobWVudHMgPSB0cnVlXG4gIH0pIHtcbiAgICB0aGlzLmF0dGFjaChhdHRhY2htZW50cywge1xuICAgICAgY2xlYXJBdHRhY2htZW50cyxcbiAgICAgIHJlc2l6ZUF0dGFjaG1lbnRzXG4gICAgfSk7XG4gICAgY29uc3Qge1xuICAgICAgZ2xcbiAgICB9ID0gdGhpcztcbiAgICBjb25zdCBwcmV2SGFuZGxlID0gZ2wuYmluZEZyYW1lYnVmZmVyKDM2MTYwLCB0aGlzLmhhbmRsZSk7XG5cbiAgICBpZiAocmVhZEJ1ZmZlcikge1xuICAgICAgdGhpcy5fc2V0UmVhZEJ1ZmZlcihyZWFkQnVmZmVyKTtcbiAgICB9XG5cbiAgICBpZiAoZHJhd0J1ZmZlcnMpIHtcbiAgICAgIHRoaXMuX3NldERyYXdCdWZmZXJzKGRyYXdCdWZmZXJzKTtcbiAgICB9XG5cbiAgICBnbC5iaW5kRnJhbWVidWZmZXIoMzYxNjAsIHByZXZIYW5kbGUgfHwgbnVsbCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICByZXNpemUob3B0aW9ucyA9IHt9KSB7XG4gICAgbGV0IHtcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0XG4gICAgfSA9IG9wdGlvbnM7XG5cbiAgICBpZiAodGhpcy5oYW5kbGUgPT09IG51bGwpIHtcbiAgICAgIGFzc2VydCh3aWR0aCA9PT0gdW5kZWZpbmVkICYmIGhlaWdodCA9PT0gdW5kZWZpbmVkKTtcbiAgICAgIHRoaXMud2lkdGggPSB0aGlzLmdsLmRyYXdpbmdCdWZmZXJXaWR0aDtcbiAgICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5nbC5kcmF3aW5nQnVmZmVySGVpZ2h0O1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgaWYgKHdpZHRoID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHdpZHRoID0gdGhpcy5nbC5kcmF3aW5nQnVmZmVyV2lkdGg7XG4gICAgfVxuXG4gICAgaWYgKGhlaWdodCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBoZWlnaHQgPSB0aGlzLmdsLmRyYXdpbmdCdWZmZXJIZWlnaHQ7XG4gICAgfVxuXG4gICAgaWYgKHdpZHRoICE9PSB0aGlzLndpZHRoICYmIGhlaWdodCAhPT0gdGhpcy5oZWlnaHQpIHtcbiAgICAgIGxvZy5sb2coMiwgYFJlc2l6aW5nIGZyYW1lYnVmZmVyICR7dGhpcy5pZH0gdG8gJHt3aWR0aH14JHtoZWlnaHR9YCkoKTtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGF0dGFjaG1lbnRQb2ludCBpbiB0aGlzLmF0dGFjaG1lbnRzKSB7XG4gICAgICB0aGlzLmF0dGFjaG1lbnRzW2F0dGFjaG1lbnRQb2ludF0ucmVzaXplKHtcbiAgICAgICAgd2lkdGgsXG4gICAgICAgIGhlaWdodFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYXR0YWNoKGF0dGFjaG1lbnRzLCB7XG4gICAgY2xlYXJBdHRhY2htZW50cyA9IGZhbHNlLFxuICAgIHJlc2l6ZUF0dGFjaG1lbnRzID0gdHJ1ZVxuICB9ID0ge30pIHtcbiAgICBjb25zdCBuZXdBdHRhY2htZW50cyA9IHt9O1xuXG4gICAgaWYgKGNsZWFyQXR0YWNobWVudHMpIHtcbiAgICAgIE9iamVjdC5rZXlzKHRoaXMuYXR0YWNobWVudHMpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgbmV3QXR0YWNobWVudHNba2V5XSA9IG51bGw7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBPYmplY3QuYXNzaWduKG5ld0F0dGFjaG1lbnRzLCBhdHRhY2htZW50cyk7XG4gICAgY29uc3QgcHJldkhhbmRsZSA9IHRoaXMuZ2wuYmluZEZyYW1lYnVmZmVyKDM2MTYwLCB0aGlzLmhhbmRsZSk7XG5cbiAgICBmb3IgKGNvbnN0IGtleSBpbiBuZXdBdHRhY2htZW50cykge1xuICAgICAgYXNzZXJ0KGtleSAhPT0gdW5kZWZpbmVkLCAnTWlzc3BlbGxlZCBmcmFtZWJ1ZmZlciBiaW5kaW5nIHBvaW50PycpO1xuICAgICAgY29uc3QgYXR0YWNobWVudCA9IE51bWJlcihrZXkpO1xuICAgICAgY29uc3QgZGVzY3JpcHRvciA9IG5ld0F0dGFjaG1lbnRzW2F0dGFjaG1lbnRdO1xuICAgICAgbGV0IG9iamVjdCA9IGRlc2NyaXB0b3I7XG5cbiAgICAgIGlmICghb2JqZWN0KSB7XG4gICAgICAgIHRoaXMuX3VuYXR0YWNoKGF0dGFjaG1lbnQpO1xuICAgICAgfSBlbHNlIGlmIChvYmplY3QgaW5zdGFuY2VvZiBSZW5kZXJidWZmZXIpIHtcbiAgICAgICAgdGhpcy5fYXR0YWNoUmVuZGVyYnVmZmVyKHtcbiAgICAgICAgICBhdHRhY2htZW50LFxuICAgICAgICAgIHJlbmRlcmJ1ZmZlcjogb2JqZWN0XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGRlc2NyaXB0b3IpKSB7XG4gICAgICAgIGNvbnN0IFt0ZXh0dXJlLCBsYXllciA9IDAsIGxldmVsID0gMF0gPSBkZXNjcmlwdG9yO1xuICAgICAgICBvYmplY3QgPSB0ZXh0dXJlO1xuXG4gICAgICAgIHRoaXMuX2F0dGFjaFRleHR1cmUoe1xuICAgICAgICAgIGF0dGFjaG1lbnQsXG4gICAgICAgICAgdGV4dHVyZSxcbiAgICAgICAgICBsYXllcixcbiAgICAgICAgICBsZXZlbFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2F0dGFjaFRleHR1cmUoe1xuICAgICAgICAgIGF0dGFjaG1lbnQsXG4gICAgICAgICAgdGV4dHVyZTogb2JqZWN0LFxuICAgICAgICAgIGxheWVyOiAwLFxuICAgICAgICAgIGxldmVsOiAwXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVzaXplQXR0YWNobWVudHMgJiYgb2JqZWN0KSB7XG4gICAgICAgIG9iamVjdC5yZXNpemUoe1xuICAgICAgICAgIHdpZHRoOiB0aGlzLndpZHRoLFxuICAgICAgICAgIGhlaWdodDogdGhpcy5oZWlnaHRcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5nbC5iaW5kRnJhbWVidWZmZXIoMzYxNjAsIHByZXZIYW5kbGUgfHwgbnVsbCk7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLmF0dGFjaG1lbnRzLCBhdHRhY2htZW50cyk7XG4gICAgT2JqZWN0LmtleXModGhpcy5hdHRhY2htZW50cykuZmlsdGVyKGtleSA9PiAhdGhpcy5hdHRhY2htZW50c1trZXldKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICBkZWxldGUgdGhpcy5hdHRhY2htZW50c1trZXldO1xuICAgIH0pO1xuICB9XG5cbiAgY2hlY2tTdGF0dXMoKSB7XG4gICAgY29uc3Qge1xuICAgICAgZ2xcbiAgICB9ID0gdGhpcztcbiAgICBjb25zdCBzdGF0dXMgPSB0aGlzLmdldFN0YXR1cygpO1xuXG4gICAgaWYgKHN0YXR1cyAhPT0gMzYwNTMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihfZ2V0RnJhbWVCdWZmZXJTdGF0dXMoc3RhdHVzKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBnZXRTdGF0dXMoKSB7XG4gICAgY29uc3Qge1xuICAgICAgZ2xcbiAgICB9ID0gdGhpcztcbiAgICBjb25zdCBwcmV2SGFuZGxlID0gZ2wuYmluZEZyYW1lYnVmZmVyKDM2MTYwLCB0aGlzLmhhbmRsZSk7XG4gICAgY29uc3Qgc3RhdHVzID0gZ2wuY2hlY2tGcmFtZWJ1ZmZlclN0YXR1cygzNjE2MCk7XG4gICAgZ2wuYmluZEZyYW1lYnVmZmVyKDM2MTYwLCBwcmV2SGFuZGxlIHx8IG51bGwpO1xuICAgIHJldHVybiBzdGF0dXM7XG4gIH1cblxuICBjbGVhcihvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCB7XG4gICAgICBjb2xvcixcbiAgICAgIGRlcHRoLFxuICAgICAgc3RlbmNpbCxcbiAgICAgIGRyYXdCdWZmZXJzID0gW11cbiAgICB9ID0gb3B0aW9ucztcbiAgICBjb25zdCBwcmV2SGFuZGxlID0gdGhpcy5nbC5iaW5kRnJhbWVidWZmZXIoMzYxNjAsIHRoaXMuaGFuZGxlKTtcblxuICAgIGlmIChjb2xvciB8fCBkZXB0aCB8fCBzdGVuY2lsKSB7XG4gICAgICBjbGVhcih0aGlzLmdsLCB7XG4gICAgICAgIGNvbG9yLFxuICAgICAgICBkZXB0aCxcbiAgICAgICAgc3RlbmNpbFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZHJhd0J1ZmZlcnMuZm9yRWFjaCgodmFsdWUsIGRyYXdCdWZmZXIpID0+IHtcbiAgICAgIGNsZWFyQnVmZmVyKHRoaXMuZ2wsIHtcbiAgICAgICAgZHJhd0J1ZmZlcixcbiAgICAgICAgdmFsdWVcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHRoaXMuZ2wuYmluZEZyYW1lYnVmZmVyKDM2MTYwLCBwcmV2SGFuZGxlIHx8IG51bGwpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcmVhZFBpeGVscyhvcHRzID0ge30pIHtcbiAgICBsb2cuZXJyb3IoJ0ZyYW1lYnVmZmVyLnJlYWRQaXhlbHMoKSBpcyBubyBsb2duZXIgc3VwcG9ydGVkLCB1c2UgcmVhZFBpeGVsc1RvQXJyYXkoZnJhbWVidWZmZXIpJykoKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJlYWRQaXhlbHNUb0J1ZmZlcihvcHRzID0ge30pIHtcbiAgICBsb2cuZXJyb3IoJ0ZyYW1lYnVmZmVyLnJlYWRQaXhlbHNUb0J1ZmZlcigpaXMgbm8gbG9nbmVyIHN1cHBvcnRlZCwgdXNlIHJlYWRQaXhlbHNUb0J1ZmZlcihmcmFtZWJ1ZmZlciknKSgpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29weVRvRGF0YVVybChvcHRzID0ge30pIHtcbiAgICBsb2cuZXJyb3IoJ0ZyYW1lYnVmZmVyLmNvcHlUb0RhdGFVcmwoKSBpcyBubyBsb2duZXIgc3VwcG9ydGVkLCB1c2UgY29weVRvRGF0YVVybChmcmFtZWJ1ZmZlciknKSgpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29weVRvSW1hZ2Uob3B0cyA9IHt9KSB7XG4gICAgbG9nLmVycm9yKCdGcmFtZWJ1ZmZlci5jb3B5VG9JbWFnZSgpIGlzIG5vIGxvZ25lciBzdXBwb3J0ZWQsIHVzZSBjb3B5VG9JbWFnZShmcmFtZWJ1ZmZlciknKSgpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29weVRvVGV4dHVyZShvcHRzID0ge30pIHtcbiAgICBsb2cuZXJyb3IoJ0ZyYW1lYnVmZmVyLmNvcHlUb1RleHR1cmUoey4uLn0pIGlzIG5vIGxvZ25lciBzdXBwb3J0ZWQsIHVzZSBjb3B5VG9UZXh0dXJlKHNvdXJjZSwgdGFyZ2V0LCBvcHRzfSknKSgpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgYmxpdChvcHRzID0ge30pIHtcbiAgICBsb2cuZXJyb3IoJ0ZyYW1lYnVmZmVyLmJsaXQoey4uLn0pIGlzIG5vIGxvZ25lciBzdXBwb3J0ZWQsIHVzZSBibGl0KHNvdXJjZSwgdGFyZ2V0LCBvcHRzKScpKCk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBpbnZhbGlkYXRlKHtcbiAgICBhdHRhY2htZW50cyA9IFtdLFxuICAgIHggPSAwLFxuICAgIHkgPSAwLFxuICAgIHdpZHRoLFxuICAgIGhlaWdodFxuICB9KSB7XG4gICAgY29uc3QgZ2wyID0gYXNzZXJ0V2ViR0wyQ29udGV4dCh0aGlzLmdsKTtcbiAgICBjb25zdCBwcmV2SGFuZGxlID0gZ2wyLmJpbmRGcmFtZWJ1ZmZlcigzNjAwOCwgdGhpcy5oYW5kbGUpO1xuICAgIGNvbnN0IGludmFsaWRhdGVBbGwgPSB4ID09PSAwICYmIHkgPT09IDAgJiYgd2lkdGggPT09IHVuZGVmaW5lZCAmJiBoZWlnaHQgPT09IHVuZGVmaW5lZDtcblxuICAgIGlmIChpbnZhbGlkYXRlQWxsKSB7XG4gICAgICBnbDIuaW52YWxpZGF0ZUZyYW1lYnVmZmVyKDM2MDA4LCBhdHRhY2htZW50cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGdsMi5pbnZhbGlkYXRlRnJhbWVidWZmZXIoMzYwMDgsIGF0dGFjaG1lbnRzLCB4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcbiAgICB9XG5cbiAgICBnbDIuYmluZEZyYW1lYnVmZmVyKDM2MDA4LCBwcmV2SGFuZGxlKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGdldEF0dGFjaG1lbnRQYXJhbWV0ZXIoYXR0YWNobWVudCwgcG5hbWUsIGtleXMpIHtcbiAgICBsZXQgdmFsdWUgPSB0aGlzLl9nZXRBdHRhY2htZW50UGFyYW1ldGVyRmFsbGJhY2socG5hbWUpO1xuXG4gICAgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgICB0aGlzLmdsLmJpbmRGcmFtZWJ1ZmZlcigzNjE2MCwgdGhpcy5oYW5kbGUpO1xuICAgICAgdmFsdWUgPSB0aGlzLmdsLmdldEZyYW1lYnVmZmVyQXR0YWNobWVudFBhcmFtZXRlcigzNjE2MCwgYXR0YWNobWVudCwgcG5hbWUpO1xuICAgICAgdGhpcy5nbC5iaW5kRnJhbWVidWZmZXIoMzYxNjAsIG51bGwpO1xuICAgIH1cblxuICAgIGlmIChrZXlzICYmIHZhbHVlID4gMTAwMCkge1xuICAgICAgdmFsdWUgPSBnZXRLZXkodGhpcy5nbCwgdmFsdWUpO1xuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIGdldEF0dGFjaG1lbnRQYXJhbWV0ZXJzKGF0dGFjaG1lbnQgPSAzNjA2NCwga2V5cywgcGFyYW1ldGVycyA9IHRoaXMuY29uc3RydWN0b3IuQVRUQUNITUVOVF9QQVJBTUVURVJTIHx8IFtdKSB7XG4gICAgY29uc3QgdmFsdWVzID0ge307XG5cbiAgICBmb3IgKGNvbnN0IHBuYW1lIG9mIHBhcmFtZXRlcnMpIHtcbiAgICAgIGNvbnN0IGtleSA9IGtleXMgPyBnZXRLZXkodGhpcy5nbCwgcG5hbWUpIDogcG5hbWU7XG4gICAgICB2YWx1ZXNba2V5XSA9IHRoaXMuZ2V0QXR0YWNobWVudFBhcmFtZXRlcihhdHRhY2htZW50LCBwbmFtZSwga2V5cyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbHVlcztcbiAgfVxuXG4gIGdldFBhcmFtZXRlcnMoa2V5cyA9IHRydWUpIHtcbiAgICBjb25zdCBhdHRhY2htZW50cyA9IE9iamVjdC5rZXlzKHRoaXMuYXR0YWNobWVudHMpO1xuICAgIGNvbnN0IHBhcmFtZXRlcnMgPSB7fTtcblxuICAgIGZvciAoY29uc3QgYXR0YWNobWVudE5hbWUgb2YgYXR0YWNobWVudHMpIHtcbiAgICAgIGNvbnN0IGF0dGFjaG1lbnQgPSBOdW1iZXIoYXR0YWNobWVudE5hbWUpO1xuICAgICAgY29uc3Qga2V5ID0ga2V5cyA/IGdldEtleSh0aGlzLmdsLCBhdHRhY2htZW50KSA6IGF0dGFjaG1lbnQ7XG4gICAgICBwYXJhbWV0ZXJzW2tleV0gPSB0aGlzLmdldEF0dGFjaG1lbnRQYXJhbWV0ZXJzKGF0dGFjaG1lbnQsIGtleXMpO1xuICAgIH1cblxuICAgIHJldHVybiBwYXJhbWV0ZXJzO1xuICB9XG5cbiAgc2hvdygpIHtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHdpbmRvdy5vcGVuKGNvcHlUb0RhdGFVcmwodGhpcyksICdsdW1hLWRlYnVnLXRleHR1cmUnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxvZyhsb2dMZXZlbCA9IDAsIG1lc3NhZ2UgPSAnJykge1xuICAgIGlmIChsb2dMZXZlbCA+IGxvZy5sZXZlbCB8fCB0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgbWVzc2FnZSA9IG1lc3NhZ2UgfHwgYEZyYW1lYnVmZmVyICR7dGhpcy5pZH1gO1xuICAgIGNvbnN0IGltYWdlID0gY29weVRvRGF0YVVybCh0aGlzLCB7XG4gICAgICB0YXJnZXRNYXhIZWlnaHQ6IDEwMFxuICAgIH0pO1xuICAgIGxvZy5pbWFnZSh7XG4gICAgICBsb2dMZXZlbCxcbiAgICAgIG1lc3NhZ2UsXG4gICAgICBpbWFnZVxuICAgIH0sIG1lc3NhZ2UpKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBiaW5kKHtcbiAgICB0YXJnZXQgPSAzNjE2MFxuICB9ID0ge30pIHtcbiAgICB0aGlzLmdsLmJpbmRGcmFtZWJ1ZmZlcih0YXJnZXQsIHRoaXMuaGFuZGxlKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHVuYmluZCh7XG4gICAgdGFyZ2V0ID0gMzYxNjBcbiAgfSA9IHt9KSB7XG4gICAgdGhpcy5nbC5iaW5kRnJhbWVidWZmZXIodGFyZ2V0LCBudWxsKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIF9jcmVhdGVEZWZhdWx0QXR0YWNobWVudHMoY29sb3IsIGRlcHRoLCBzdGVuY2lsLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgbGV0IGRlZmF1bHRBdHRhY2htZW50cyA9IG51bGw7XG5cbiAgICBpZiAoY29sb3IpIHtcbiAgICAgIGRlZmF1bHRBdHRhY2htZW50cyA9IGRlZmF1bHRBdHRhY2htZW50cyB8fCB7fTtcbiAgICAgIGRlZmF1bHRBdHRhY2htZW50c1szNjA2NF0gPSBuZXcgVGV4dHVyZTJEKHRoaXMuZ2wsIHtcbiAgICAgICAgaWQ6IGAke3RoaXMuaWR9LWNvbG9yMGAsXG4gICAgICAgIHBpeGVsczogbnVsbCxcbiAgICAgICAgZm9ybWF0OiA2NDA4LFxuICAgICAgICB0eXBlOiA1MTIxLFxuICAgICAgICB3aWR0aCxcbiAgICAgICAgaGVpZ2h0LFxuICAgICAgICBtaXBtYXBzOiBmYWxzZSxcbiAgICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICAgIFsxMDI0MV06IDk3MjksXG4gICAgICAgICAgWzEwMjQwXTogOTcyOSxcbiAgICAgICAgICBbMTAyNDJdOiAzMzA3MSxcbiAgICAgICAgICBbMTAyNDNdOiAzMzA3MVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHRoaXMub3duUmVzb3VyY2VzLnB1c2goZGVmYXVsdEF0dGFjaG1lbnRzWzM2MDY0XSk7XG4gICAgfVxuXG4gICAgaWYgKGRlcHRoICYmIHN0ZW5jaWwpIHtcbiAgICAgIGRlZmF1bHRBdHRhY2htZW50cyA9IGRlZmF1bHRBdHRhY2htZW50cyB8fCB7fTtcbiAgICAgIGRlZmF1bHRBdHRhY2htZW50c1szMzMwNl0gPSBuZXcgUmVuZGVyYnVmZmVyKHRoaXMuZ2wsIHtcbiAgICAgICAgaWQ6IGAke3RoaXMuaWR9LWRlcHRoLXN0ZW5jaWxgLFxuICAgICAgICBmb3JtYXQ6IDM1MDU2LFxuICAgICAgICB3aWR0aCxcbiAgICAgICAgaGVpZ2h0OiAxMTFcbiAgICAgIH0pO1xuICAgICAgdGhpcy5vd25SZXNvdXJjZXMucHVzaChkZWZhdWx0QXR0YWNobWVudHNbMzMzMDZdKTtcbiAgICB9IGVsc2UgaWYgKGRlcHRoKSB7XG4gICAgICBkZWZhdWx0QXR0YWNobWVudHMgPSBkZWZhdWx0QXR0YWNobWVudHMgfHwge307XG4gICAgICBkZWZhdWx0QXR0YWNobWVudHNbMzYwOTZdID0gbmV3IFJlbmRlcmJ1ZmZlcih0aGlzLmdsLCB7XG4gICAgICAgIGlkOiBgJHt0aGlzLmlkfS1kZXB0aGAsXG4gICAgICAgIGZvcm1hdDogMzMxODksXG4gICAgICAgIHdpZHRoLFxuICAgICAgICBoZWlnaHRcbiAgICAgIH0pO1xuICAgICAgdGhpcy5vd25SZXNvdXJjZXMucHVzaChkZWZhdWx0QXR0YWNobWVudHNbMzYwOTZdKTtcbiAgICB9IGVsc2UgaWYgKHN0ZW5jaWwpIHtcbiAgICAgIGFzc2VydChmYWxzZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRlZmF1bHRBdHRhY2htZW50cztcbiAgfVxuXG4gIF91bmF0dGFjaChhdHRhY2htZW50KSB7XG4gICAgY29uc3Qgb2xkQXR0YWNobWVudCA9IHRoaXMuYXR0YWNobWVudHNbYXR0YWNobWVudF07XG5cbiAgICBpZiAoIW9sZEF0dGFjaG1lbnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAob2xkQXR0YWNobWVudCBpbnN0YW5jZW9mIFJlbmRlcmJ1ZmZlcikge1xuICAgICAgdGhpcy5nbC5mcmFtZWJ1ZmZlclJlbmRlcmJ1ZmZlcigzNjE2MCwgYXR0YWNobWVudCwgMzYxNjEsIG51bGwpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmdsLmZyYW1lYnVmZmVyVGV4dHVyZTJEKDM2MTYwLCBhdHRhY2htZW50LCAzNTUzLCBudWxsLCAwKTtcbiAgICB9XG5cbiAgICBkZWxldGUgdGhpcy5hdHRhY2htZW50c1thdHRhY2htZW50XTtcbiAgfVxuXG4gIF9hdHRhY2hSZW5kZXJidWZmZXIoe1xuICAgIGF0dGFjaG1lbnQgPSAzNjA2NCxcbiAgICByZW5kZXJidWZmZXJcbiAgfSkge1xuICAgIGNvbnN0IHtcbiAgICAgIGdsXG4gICAgfSA9IHRoaXM7XG4gICAgZ2wuZnJhbWVidWZmZXJSZW5kZXJidWZmZXIoMzYxNjAsIGF0dGFjaG1lbnQsIDM2MTYxLCByZW5kZXJidWZmZXIuaGFuZGxlKTtcbiAgICB0aGlzLmF0dGFjaG1lbnRzW2F0dGFjaG1lbnRdID0gcmVuZGVyYnVmZmVyO1xuICB9XG5cbiAgX2F0dGFjaFRleHR1cmUoe1xuICAgIGF0dGFjaG1lbnQgPSAzNjA2NCxcbiAgICB0ZXh0dXJlLFxuICAgIGxheWVyLFxuICAgIGxldmVsXG4gIH0pIHtcbiAgICBjb25zdCB7XG4gICAgICBnbFxuICAgIH0gPSB0aGlzO1xuICAgIGdsLmJpbmRUZXh0dXJlKHRleHR1cmUudGFyZ2V0LCB0ZXh0dXJlLmhhbmRsZSk7XG5cbiAgICBzd2l0Y2ggKHRleHR1cmUudGFyZ2V0KSB7XG4gICAgICBjYXNlIDM1ODY2OlxuICAgICAgY2FzZSAzMjg3OTpcbiAgICAgICAgY29uc3QgZ2wyID0gYXNzZXJ0V2ViR0wyQ29udGV4dChnbCk7XG4gICAgICAgIGdsMi5mcmFtZWJ1ZmZlclRleHR1cmVMYXllcigzNjE2MCwgYXR0YWNobWVudCwgdGV4dHVyZS50YXJnZXQsIGxldmVsLCBsYXllcik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDM0MDY3OlxuICAgICAgICBjb25zdCBmYWNlID0gbWFwSW5kZXhUb0N1YmVNYXBGYWNlKGxheWVyKTtcbiAgICAgICAgZ2wuZnJhbWVidWZmZXJUZXh0dXJlMkQoMzYxNjAsIGF0dGFjaG1lbnQsIGZhY2UsIHRleHR1cmUuaGFuZGxlLCBsZXZlbCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDM1NTM6XG4gICAgICAgIGdsLmZyYW1lYnVmZmVyVGV4dHVyZTJEKDM2MTYwLCBhdHRhY2htZW50LCAzNTUzLCB0ZXh0dXJlLmhhbmRsZSwgbGV2ZWwpO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYXNzZXJ0KGZhbHNlLCAnSWxsZWdhbCB0ZXh0dXJlIHR5cGUnKTtcbiAgICB9XG5cbiAgICBnbC5iaW5kVGV4dHVyZSh0ZXh0dXJlLnRhcmdldCwgbnVsbCk7XG4gICAgdGhpcy5hdHRhY2htZW50c1thdHRhY2htZW50XSA9IHRleHR1cmU7XG4gIH1cblxuICBfc2V0UmVhZEJ1ZmZlcihyZWFkQnVmZmVyKSB7XG4gICAgY29uc3QgZ2wyID0gZ2V0V2ViR0wyQ29udGV4dCh0aGlzLmdsKTtcblxuICAgIGlmIChnbDIpIHtcbiAgICAgIGdsMi5yZWFkQnVmZmVyKHJlYWRCdWZmZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhc3NlcnQocmVhZEJ1ZmZlciA9PT0gMzYwNjQgfHwgcmVhZEJ1ZmZlciA9PT0gMTAyOSwgRVJSX01VTFRJUExFX1JFTkRFUlRBUkdFVFMpO1xuICAgIH1cblxuICAgIHRoaXMucmVhZEJ1ZmZlciA9IHJlYWRCdWZmZXI7XG4gIH1cblxuICBfc2V0RHJhd0J1ZmZlcnMoZHJhd0J1ZmZlcnMpIHtcbiAgICBjb25zdCB7XG4gICAgICBnbFxuICAgIH0gPSB0aGlzO1xuICAgIGNvbnN0IGdsMiA9IGFzc2VydFdlYkdMMkNvbnRleHQoZ2wpO1xuXG4gICAgaWYgKGdsMikge1xuICAgICAgZ2wyLmRyYXdCdWZmZXJzKGRyYXdCdWZmZXJzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZXh0ID0gZ2wuZ2V0RXh0ZW5zaW9uKCdXRUJHTF9kcmF3X2J1ZmZlcnMnKTtcblxuICAgICAgaWYgKGV4dCkge1xuICAgICAgICBleHQuZHJhd0J1ZmZlcnNXRUJHTChkcmF3QnVmZmVycyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhc3NlcnQoZHJhd0J1ZmZlcnMubGVuZ3RoID09PSAxICYmIChkcmF3QnVmZmVyc1swXSA9PT0gMzYwNjQgfHwgZHJhd0J1ZmZlcnNbMF0gPT09IDEwMjkpLCBFUlJfTVVMVElQTEVfUkVOREVSVEFSR0VUUyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5kcmF3QnVmZmVycyA9IGRyYXdCdWZmZXJzO1xuICB9XG5cbiAgX2dldEF0dGFjaG1lbnRQYXJhbWV0ZXJGYWxsYmFjayhwbmFtZSkge1xuICAgIGNvbnN0IGNhcHMgPSBnZXRGZWF0dXJlcyh0aGlzLmdsKTtcblxuICAgIHN3aXRjaCAocG5hbWUpIHtcbiAgICAgIGNhc2UgMzYwNTI6XG4gICAgICAgIHJldHVybiAhY2Fwcy5XRUJHTDIgPyAwIDogbnVsbDtcblxuICAgICAgY2FzZSAzMzI5ODpcbiAgICAgIGNhc2UgMzMyOTk6XG4gICAgICBjYXNlIDMzMzAwOlxuICAgICAgY2FzZSAzMzMwMTpcbiAgICAgIGNhc2UgMzMzMDI6XG4gICAgICBjYXNlIDMzMzAzOlxuICAgICAgICByZXR1cm4gIWNhcHMuV0VCR0wyID8gOCA6IG51bGw7XG5cbiAgICAgIGNhc2UgMzMyOTc6XG4gICAgICAgIHJldHVybiAhY2Fwcy5XRUJHTDIgPyA1MTI1IDogbnVsbDtcblxuICAgICAgY2FzZSAzMzI5NjpcbiAgICAgICAgcmV0dXJuICFjYXBzLldFQkdMMiAmJiAhY2Fwcy5FWFRfc1JHQiA/IDk3MjkgOiBudWxsO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBfY3JlYXRlSGFuZGxlKCkge1xuICAgIHJldHVybiB0aGlzLmdsLmNyZWF0ZUZyYW1lYnVmZmVyKCk7XG4gIH1cblxuICBfZGVsZXRlSGFuZGxlKCkge1xuICAgIHRoaXMuZ2wuZGVsZXRlRnJhbWVidWZmZXIodGhpcy5oYW5kbGUpO1xuICB9XG5cbiAgX2JpbmRIYW5kbGUoaGFuZGxlKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2wuYmluZEZyYW1lYnVmZmVyKDM2MTYwLCBoYW5kbGUpO1xuICB9XG5cbn1cblxuZnVuY3Rpb24gbWFwSW5kZXhUb0N1YmVNYXBGYWNlKGxheWVyKSB7XG4gIHJldHVybiBsYXllciA8IDM0MDY5ID8gbGF5ZXIgKyAzNDA2OSA6IGxheWVyO1xufVxuXG5mdW5jdGlvbiBfZ2V0RnJhbWVCdWZmZXJTdGF0dXMoc3RhdHVzKSB7XG4gIGNvbnN0IFNUQVRVUyA9IEZyYW1lYnVmZmVyLlNUQVRVUyB8fCB7fTtcbiAgcmV0dXJuIFNUQVRVU1tzdGF0dXNdIHx8IGBGcmFtZWJ1ZmZlciBlcnJvciAke3N0YXR1c31gO1xufVxuXG5leHBvcnQgY29uc3QgRlJBTUVCVUZGRVJfQVRUQUNITUVOVF9QQVJBTUVURVJTID0gWzM2MDQ5LCAzNjA0OCwgMzMyOTYsIDMzMjk4LCAzMzI5OSwgMzMzMDAsIDMzMzAxLCAzMzMwMiwgMzMzMDNdO1xuRnJhbWVidWZmZXIuQVRUQUNITUVOVF9QQVJBTUVURVJTID0gRlJBTUVCVUZGRVJfQVRUQUNITUVOVF9QQVJBTUVURVJTO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZnJhbWVidWZmZXIuanMubWFwIiwiaW1wb3J0IEFjY2Vzc29yIGZyb20gJy4vYWNjZXNzb3InO1xuaW1wb3J0IHsgaXNXZWJHTDIgfSBmcm9tICdAbHVtYS5nbC9nbHRvb2xzJztcbmltcG9ydCB7IGRlY29tcG9zZUNvbXBvc2l0ZUdMVHlwZSB9IGZyb20gJy4uL3dlYmdsLXV0aWxzL2F0dHJpYnV0ZS11dGlscyc7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQcm9ncmFtQ29uZmlndXJhdGlvbiB7XG4gIGNvbnN0cnVjdG9yKHByb2dyYW0pIHtcbiAgICB0aGlzLmlkID0gcHJvZ3JhbS5pZDtcbiAgICB0aGlzLmF0dHJpYnV0ZUluZm9zID0gW107XG4gICAgdGhpcy5hdHRyaWJ1dGVJbmZvc0J5TmFtZSA9IHt9O1xuICAgIHRoaXMuYXR0cmlidXRlSW5mb3NCeUxvY2F0aW9uID0gW107XG4gICAgdGhpcy52YXJ5aW5nSW5mb3MgPSBbXTtcbiAgICB0aGlzLnZhcnlpbmdJbmZvc0J5TmFtZSA9IHt9O1xuICAgIE9iamVjdC5zZWFsKHRoaXMpO1xuXG4gICAgdGhpcy5fcmVhZEF0dHJpYnV0ZXNGcm9tUHJvZ3JhbShwcm9ncmFtKTtcblxuICAgIHRoaXMuX3JlYWRWYXJ5aW5nc0Zyb21Qcm9ncmFtKHByb2dyYW0pO1xuICB9XG5cbiAgZ2V0QXR0cmlidXRlSW5mbyhsb2NhdGlvbk9yTmFtZSkge1xuICAgIGNvbnN0IGxvY2F0aW9uID0gTnVtYmVyKGxvY2F0aW9uT3JOYW1lKTtcblxuICAgIGlmIChOdW1iZXIuaXNGaW5pdGUobG9jYXRpb24pKSB7XG4gICAgICByZXR1cm4gdGhpcy5hdHRyaWJ1dGVJbmZvc0J5TG9jYXRpb25bbG9jYXRpb25dO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmF0dHJpYnV0ZUluZm9zQnlOYW1lW2xvY2F0aW9uT3JOYW1lXSB8fCBudWxsO1xuICB9XG5cbiAgZ2V0QXR0cmlidXRlTG9jYXRpb24obG9jYXRpb25Pck5hbWUpIHtcbiAgICBjb25zdCBhdHRyaWJ1dGVJbmZvID0gdGhpcy5nZXRBdHRyaWJ1dGVJbmZvKGxvY2F0aW9uT3JOYW1lKTtcbiAgICByZXR1cm4gYXR0cmlidXRlSW5mbyA/IGF0dHJpYnV0ZUluZm8ubG9jYXRpb24gOiAtMTtcbiAgfVxuXG4gIGdldEF0dHJpYnV0ZUFjY2Vzc29yKGxvY2F0aW9uT3JOYW1lKSB7XG4gICAgY29uc3QgYXR0cmlidXRlSW5mbyA9IHRoaXMuZ2V0QXR0cmlidXRlSW5mbyhsb2NhdGlvbk9yTmFtZSk7XG4gICAgcmV0dXJuIGF0dHJpYnV0ZUluZm8gPyBhdHRyaWJ1dGVJbmZvLmFjY2Vzc29yIDogbnVsbDtcbiAgfVxuXG4gIGdldFZhcnlpbmdJbmZvKGxvY2F0aW9uT3JOYW1lKSB7XG4gICAgY29uc3QgbG9jYXRpb24gPSBOdW1iZXIobG9jYXRpb25Pck5hbWUpO1xuXG4gICAgaWYgKE51bWJlci5pc0Zpbml0ZShsb2NhdGlvbikpIHtcbiAgICAgIHJldHVybiB0aGlzLnZhcnlpbmdJbmZvc1tsb2NhdGlvbl07XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudmFyeWluZ0luZm9zQnlOYW1lW2xvY2F0aW9uT3JOYW1lXSB8fCBudWxsO1xuICB9XG5cbiAgZ2V0VmFyeWluZ0luZGV4KGxvY2F0aW9uT3JOYW1lKSB7XG4gICAgY29uc3QgdmFyeWluZyA9IHRoaXMuZ2V0VmFyeWluZ0luZm8oKTtcbiAgICByZXR1cm4gdmFyeWluZyA/IHZhcnlpbmcubG9jYXRpb24gOiAtMTtcbiAgfVxuXG4gIGdldFZhcnlpbmdBY2Nlc3Nvcihsb2NhdGlvbk9yTmFtZSkge1xuICAgIGNvbnN0IHZhcnlpbmcgPSB0aGlzLmdldFZhcnlpbmdJbmZvKCk7XG4gICAgcmV0dXJuIHZhcnlpbmcgPyB2YXJ5aW5nLmFjY2Vzc29yIDogbnVsbDtcbiAgfVxuXG4gIF9yZWFkQXR0cmlidXRlc0Zyb21Qcm9ncmFtKHByb2dyYW0pIHtcbiAgICBjb25zdCB7XG4gICAgICBnbFxuICAgIH0gPSBwcm9ncmFtO1xuICAgIGNvbnN0IGNvdW50ID0gZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcihwcm9ncmFtLmhhbmRsZSwgMzU3MjEpO1xuXG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGNvdW50OyBpbmRleCsrKSB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIG5hbWUsXG4gICAgICAgIHR5cGUsXG4gICAgICAgIHNpemVcbiAgICAgIH0gPSBnbC5nZXRBY3RpdmVBdHRyaWIocHJvZ3JhbS5oYW5kbGUsIGluZGV4KTtcbiAgICAgIGNvbnN0IGxvY2F0aW9uID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJvZ3JhbS5oYW5kbGUsIG5hbWUpO1xuXG4gICAgICBpZiAobG9jYXRpb24gPj0gMCkge1xuICAgICAgICB0aGlzLl9hZGRBdHRyaWJ1dGUobG9jYXRpb24sIG5hbWUsIHR5cGUsIHNpemUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuYXR0cmlidXRlSW5mb3Muc29ydCgoYSwgYikgPT4gYS5sb2NhdGlvbiAtIGIubG9jYXRpb24pO1xuICB9XG5cbiAgX3JlYWRWYXJ5aW5nc0Zyb21Qcm9ncmFtKHByb2dyYW0pIHtcbiAgICBjb25zdCB7XG4gICAgICBnbFxuICAgIH0gPSBwcm9ncmFtO1xuXG4gICAgaWYgKCFpc1dlYkdMMihnbCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBjb3VudCA9IGdsLmdldFByb2dyYW1QYXJhbWV0ZXIocHJvZ3JhbS5oYW5kbGUsIDM1OTcxKTtcblxuICAgIGZvciAobGV0IGxvY2F0aW9uID0gMDsgbG9jYXRpb24gPCBjb3VudDsgbG9jYXRpb24rKykge1xuICAgICAgY29uc3Qge1xuICAgICAgICBuYW1lLFxuICAgICAgICB0eXBlLFxuICAgICAgICBzaXplXG4gICAgICB9ID0gZ2wuZ2V0VHJhbnNmb3JtRmVlZGJhY2tWYXJ5aW5nKHByb2dyYW0uaGFuZGxlLCBsb2NhdGlvbik7XG5cbiAgICAgIHRoaXMuX2FkZFZhcnlpbmcobG9jYXRpb24sIG5hbWUsIHR5cGUsIHNpemUpO1xuICAgIH1cblxuICAgIHRoaXMudmFyeWluZ0luZm9zLnNvcnQoKGEsIGIpID0+IGEubG9jYXRpb24gLSBiLmxvY2F0aW9uKTtcbiAgfVxuXG4gIF9hZGRBdHRyaWJ1dGUobG9jYXRpb24sIG5hbWUsIGNvbXBvc2l0ZVR5cGUsIHNpemUpIHtcbiAgICBjb25zdCB7XG4gICAgICB0eXBlLFxuICAgICAgY29tcG9uZW50c1xuICAgIH0gPSBkZWNvbXBvc2VDb21wb3NpdGVHTFR5cGUoY29tcG9zaXRlVHlwZSk7XG4gICAgY29uc3QgYWNjZXNzb3IgPSB7XG4gICAgICB0eXBlLFxuICAgICAgc2l6ZTogc2l6ZSAqIGNvbXBvbmVudHNcbiAgICB9O1xuXG4gICAgdGhpcy5faW5mZXJQcm9wZXJ0aWVzKGxvY2F0aW9uLCBuYW1lLCBhY2Nlc3Nvcik7XG5cbiAgICBjb25zdCBhdHRyaWJ1dGVJbmZvID0ge1xuICAgICAgbG9jYXRpb24sXG4gICAgICBuYW1lLFxuICAgICAgYWNjZXNzb3I6IG5ldyBBY2Nlc3NvcihhY2Nlc3NvcilcbiAgICB9O1xuICAgIHRoaXMuYXR0cmlidXRlSW5mb3MucHVzaChhdHRyaWJ1dGVJbmZvKTtcbiAgICB0aGlzLmF0dHJpYnV0ZUluZm9zQnlMb2NhdGlvbltsb2NhdGlvbl0gPSBhdHRyaWJ1dGVJbmZvO1xuICAgIHRoaXMuYXR0cmlidXRlSW5mb3NCeU5hbWVbYXR0cmlidXRlSW5mby5uYW1lXSA9IGF0dHJpYnV0ZUluZm87XG4gIH1cblxuICBfaW5mZXJQcm9wZXJ0aWVzKGxvY2F0aW9uLCBuYW1lLCBhY2Nlc3Nvcikge1xuICAgIGlmICgvaW5zdGFuY2UvaS50ZXN0KG5hbWUpKSB7XG4gICAgICBhY2Nlc3Nvci5kaXZpc29yID0gMTtcbiAgICB9XG4gIH1cblxuICBfYWRkVmFyeWluZyhsb2NhdGlvbiwgbmFtZSwgY29tcG9zaXRlVHlwZSwgc2l6ZSkge1xuICAgIGNvbnN0IHtcbiAgICAgIHR5cGUsXG4gICAgICBjb21wb25lbnRzXG4gICAgfSA9IGRlY29tcG9zZUNvbXBvc2l0ZUdMVHlwZShjb21wb3NpdGVUeXBlKTtcbiAgICBjb25zdCBhY2Nlc3NvciA9IG5ldyBBY2Nlc3Nvcih7XG4gICAgICB0eXBlLFxuICAgICAgc2l6ZTogc2l6ZSAqIGNvbXBvbmVudHNcbiAgICB9KTtcbiAgICBjb25zdCB2YXJ5aW5nID0ge1xuICAgICAgbG9jYXRpb24sXG4gICAgICBuYW1lLFxuICAgICAgYWNjZXNzb3JcbiAgICB9O1xuICAgIHRoaXMudmFyeWluZ0luZm9zLnB1c2godmFyeWluZyk7XG4gICAgdGhpcy52YXJ5aW5nSW5mb3NCeU5hbWVbdmFyeWluZy5uYW1lXSA9IHZhcnlpbmc7XG4gIH1cblxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cHJvZ3JhbS1jb25maWd1cmF0aW9uLmpzLm1hcCIsImltcG9ydCBSZXNvdXJjZSBmcm9tICcuL3Jlc291cmNlJztcbmltcG9ydCBUZXh0dXJlIGZyb20gJy4vdGV4dHVyZSc7XG5pbXBvcnQgRnJhbWVidWZmZXIgZnJvbSAnLi9mcmFtZWJ1ZmZlcic7XG5pbXBvcnQgeyBwYXJzZVVuaWZvcm1OYW1lLCBnZXRVbmlmb3JtU2V0dGVyIH0gZnJvbSAnLi91bmlmb3Jtcyc7XG5pbXBvcnQgeyBWZXJ0ZXhTaGFkZXIsIEZyYWdtZW50U2hhZGVyIH0gZnJvbSAnLi9zaGFkZXInO1xuaW1wb3J0IFByb2dyYW1Db25maWd1cmF0aW9uIGZyb20gJy4vcHJvZ3JhbS1jb25maWd1cmF0aW9uJztcbmltcG9ydCB7IGNvcHlVbmlmb3JtLCBjaGVja1VuaWZvcm1WYWx1ZXMgfSBmcm9tICcuL3VuaWZvcm1zJztcbmltcG9ydCB7IGlzV2ViR0wyLCBhc3NlcnRXZWJHTDJDb250ZXh0LCB3aXRoUGFyYW1ldGVycywgbG9nIH0gZnJvbSAnQGx1bWEuZ2wvZ2x0b29scyc7XG5pbXBvcnQgeyBnZXRLZXkgfSBmcm9tICcuLi93ZWJnbC11dGlscy9jb25zdGFudHMtdG8ta2V5cyc7XG5pbXBvcnQgeyBnZXRQcmltaXRpdmVEcmF3TW9kZSB9IGZyb20gJy4uL3dlYmdsLXV0aWxzL2F0dHJpYnV0ZS11dGlscyc7XG5pbXBvcnQgeyBhc3NlcnQgfSBmcm9tICcuLi91dGlscy9hc3NlcnQnO1xuaW1wb3J0IHsgdWlkIH0gZnJvbSAnLi4vdXRpbHMvdXRpbHMnO1xuY29uc3QgTE9HX1BST0dSQU1fUEVSRl9QUklPUklUWSA9IDQ7XG5jb25zdCBHTF9TRVBBUkFURV9BVFRSSUJTID0gMHg4YzhkO1xuY29uc3QgVjZfREVQUkVDQVRFRF9NRVRIT0RTID0gWydzZXRWZXJ0ZXhBcnJheScsICdzZXRBdHRyaWJ1dGVzJywgJ3NldEJ1ZmZlcnMnLCAndW5zZXRCdWZmZXJzJywgJ3VzZScsICdnZXRVbmlmb3JtQ291bnQnLCAnZ2V0VW5pZm9ybUluZm8nLCAnZ2V0VW5pZm9ybUxvY2F0aW9uJywgJ2dldFVuaWZvcm1WYWx1ZScsICdnZXRWYXJ5aW5nJywgJ2dldEZyYWdEYXRhTG9jYXRpb24nLCAnZ2V0QXR0YWNoZWRTaGFkZXJzJywgJ2dldEF0dHJpYnV0ZUNvdW50JywgJ2dldEF0dHJpYnV0ZUxvY2F0aW9uJywgJ2dldEF0dHJpYnV0ZUluZm8nXTtcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFByb2dyYW0gZXh0ZW5kcyBSZXNvdXJjZSB7XG4gIGNvbnN0cnVjdG9yKGdsLCBwcm9wcyA9IHt9KSB7XG4gICAgc3VwZXIoZ2wsIHByb3BzKTtcbiAgICB0aGlzLnN0dWJSZW1vdmVkTWV0aG9kcygnUHJvZ3JhbScsICd2Ni4wJywgVjZfREVQUkVDQVRFRF9NRVRIT0RTKTtcbiAgICB0aGlzLl9pc0NhY2hlZCA9IGZhbHNlO1xuICAgIHRoaXMuaW5pdGlhbGl6ZShwcm9wcyk7XG4gICAgT2JqZWN0LnNlYWwodGhpcyk7XG5cbiAgICB0aGlzLl9zZXRJZChwcm9wcy5pZCk7XG4gIH1cblxuICBpbml0aWFsaXplKHByb3BzID0ge30pIHtcbiAgICBjb25zdCB7XG4gICAgICBoYXNoLFxuICAgICAgdnMsXG4gICAgICBmcyxcbiAgICAgIHZhcnlpbmdzLFxuICAgICAgYnVmZmVyTW9kZSA9IEdMX1NFUEFSQVRFX0FUVFJJQlNcbiAgICB9ID0gcHJvcHM7XG4gICAgdGhpcy5oYXNoID0gaGFzaCB8fCAnJztcbiAgICB0aGlzLnZzID0gdHlwZW9mIHZzID09PSAnc3RyaW5nJyA/IG5ldyBWZXJ0ZXhTaGFkZXIodGhpcy5nbCwge1xuICAgICAgaWQ6IGAke3Byb3BzLmlkfS12c2AsXG4gICAgICBzb3VyY2U6IHZzXG4gICAgfSkgOiB2cztcbiAgICB0aGlzLmZzID0gdHlwZW9mIGZzID09PSAnc3RyaW5nJyA/IG5ldyBGcmFnbWVudFNoYWRlcih0aGlzLmdsLCB7XG4gICAgICBpZDogYCR7cHJvcHMuaWR9LWZzYCxcbiAgICAgIHNvdXJjZTogZnNcbiAgICB9KSA6IGZzO1xuICAgIGFzc2VydCh0aGlzLnZzIGluc3RhbmNlb2YgVmVydGV4U2hhZGVyKTtcbiAgICBhc3NlcnQodGhpcy5mcyBpbnN0YW5jZW9mIEZyYWdtZW50U2hhZGVyKTtcbiAgICB0aGlzLnVuaWZvcm1zID0ge307XG4gICAgdGhpcy5fdGV4dHVyZVVuaWZvcm1zID0ge307XG5cbiAgICBpZiAodmFyeWluZ3MgJiYgdmFyeWluZ3MubGVuZ3RoID4gMCkge1xuICAgICAgYXNzZXJ0V2ViR0wyQ29udGV4dCh0aGlzLmdsKTtcbiAgICAgIHRoaXMudmFyeWluZ3MgPSB2YXJ5aW5ncztcbiAgICAgIHRoaXMuZ2wyLnRyYW5zZm9ybUZlZWRiYWNrVmFyeWluZ3ModGhpcy5oYW5kbGUsIHZhcnlpbmdzLCBidWZmZXJNb2RlKTtcbiAgICB9XG5cbiAgICB0aGlzLl9jb21waWxlQW5kTGluaygpO1xuXG4gICAgdGhpcy5fcmVhZFVuaWZvcm1Mb2NhdGlvbnNGcm9tTGlua2VkUHJvZ3JhbSgpO1xuXG4gICAgdGhpcy5jb25maWd1cmF0aW9uID0gbmV3IFByb2dyYW1Db25maWd1cmF0aW9uKHRoaXMpO1xuICAgIHJldHVybiB0aGlzLnNldFByb3BzKHByb3BzKTtcbiAgfVxuXG4gIGRlbGV0ZShvcHRpb25zID0ge30pIHtcbiAgICBpZiAodGhpcy5faXNDYWNoZWQpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHJldHVybiBzdXBlci5kZWxldGUob3B0aW9ucyk7XG4gIH1cblxuICBzZXRQcm9wcyhwcm9wcykge1xuICAgIGlmICgndW5pZm9ybXMnIGluIHByb3BzKSB7XG4gICAgICB0aGlzLnNldFVuaWZvcm1zKHByb3BzLnVuaWZvcm1zKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGRyYXcoe1xuICAgIGxvZ1ByaW9yaXR5LFxuICAgIGRyYXdNb2RlID0gNCxcbiAgICB2ZXJ0ZXhDb3VudCxcbiAgICBvZmZzZXQgPSAwLFxuICAgIHN0YXJ0LFxuICAgIGVuZCxcbiAgICBpc0luZGV4ZWQgPSBmYWxzZSxcbiAgICBpbmRleFR5cGUgPSA1MTIzLFxuICAgIGluc3RhbmNlQ291bnQgPSAwLFxuICAgIGlzSW5zdGFuY2VkID0gaW5zdGFuY2VDb3VudCA+IDAsXG4gICAgdmVydGV4QXJyYXkgPSBudWxsLFxuICAgIHRyYW5zZm9ybUZlZWRiYWNrLFxuICAgIGZyYW1lYnVmZmVyLFxuICAgIHBhcmFtZXRlcnMgPSB7fSxcbiAgICB1bmlmb3JtcyxcbiAgICBzYW1wbGVyc1xuICB9KSB7XG4gICAgaWYgKHVuaWZvcm1zIHx8IHNhbXBsZXJzKSB7XG4gICAgICBsb2cuZGVwcmVjYXRlZCgnUHJvZ3JhbS5kcmF3KHt1bmlmb3Jtc30pJywgJ1Byb2dyYW0uc2V0VW5pZm9ybXModW5pZm9ybXMpJykoKTtcbiAgICAgIHRoaXMuc2V0VW5pZm9ybXModW5pZm9ybXMgfHwge30pO1xuICAgIH1cblxuICAgIGlmIChsb2cucHJpb3JpdHkgPj0gbG9nUHJpb3JpdHkpIHtcbiAgICAgIGNvbnN0IGZiID0gZnJhbWVidWZmZXIgPyBmcmFtZWJ1ZmZlci5pZCA6ICdkZWZhdWx0JztcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBgbW9kZT0ke2dldEtleSh0aGlzLmdsLCBkcmF3TW9kZSl9IHZlcnRzPSR7dmVydGV4Q291bnR9IGAgKyBgaW5zdGFuY2VzPSR7aW5zdGFuY2VDb3VudH0gaW5kZXhUeXBlPSR7Z2V0S2V5KHRoaXMuZ2wsIGluZGV4VHlwZSl9IGAgKyBgaXNJbnN0YW5jZWQ9JHtpc0luc3RhbmNlZH0gaXNJbmRleGVkPSR7aXNJbmRleGVkfSBgICsgYEZyYW1lYnVmZmVyPSR7ZmJ9YDtcbiAgICAgIGxvZy5sb2cobG9nUHJpb3JpdHksIG1lc3NhZ2UpKCk7XG4gICAgfVxuXG4gICAgYXNzZXJ0KHZlcnRleEFycmF5KTtcbiAgICB0aGlzLmdsLnVzZVByb2dyYW0odGhpcy5oYW5kbGUpO1xuXG4gICAgaWYgKCF0aGlzLl9hcmVUZXh0dXJlc1JlbmRlcmFibGUoKSB8fCB2ZXJ0ZXhDb3VudCA9PT0gMCB8fCBpc0luc3RhbmNlZCAmJiBpbnN0YW5jZUNvdW50ID09PSAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmVydGV4QXJyYXkuYmluZEZvckRyYXcodmVydGV4Q291bnQsIGluc3RhbmNlQ291bnQsICgpID0+IHtcbiAgICAgIGlmIChmcmFtZWJ1ZmZlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHBhcmFtZXRlcnMgPSBPYmplY3QuYXNzaWduKHt9LCBwYXJhbWV0ZXJzLCB7XG4gICAgICAgICAgZnJhbWVidWZmZXJcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0cmFuc2Zvcm1GZWVkYmFjaykge1xuICAgICAgICBjb25zdCBwcmltaXRpdmVNb2RlID0gZ2V0UHJpbWl0aXZlRHJhd01vZGUoZHJhd01vZGUpO1xuICAgICAgICB0cmFuc2Zvcm1GZWVkYmFjay5iZWdpbihwcmltaXRpdmVNb2RlKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fYmluZFRleHR1cmVzKCk7XG5cbiAgICAgIHdpdGhQYXJhbWV0ZXJzKHRoaXMuZ2wsIHBhcmFtZXRlcnMsICgpID0+IHtcbiAgICAgICAgaWYgKGlzSW5kZXhlZCAmJiBpc0luc3RhbmNlZCkge1xuICAgICAgICAgIHRoaXMuZ2wyLmRyYXdFbGVtZW50c0luc3RhbmNlZChkcmF3TW9kZSwgdmVydGV4Q291bnQsIGluZGV4VHlwZSwgb2Zmc2V0LCBpbnN0YW5jZUNvdW50KTtcbiAgICAgICAgfSBlbHNlIGlmIChpc0luZGV4ZWQgJiYgaXNXZWJHTDIodGhpcy5nbCkgJiYgIWlzTmFOKHN0YXJ0KSAmJiAhaXNOYU4oZW5kKSkge1xuICAgICAgICAgIHRoaXMuZ2wyLmRyYXdSYW5nZUVsZW1lbnRzKGRyYXdNb2RlLCBzdGFydCwgZW5kLCB2ZXJ0ZXhDb3VudCwgaW5kZXhUeXBlLCBvZmZzZXQpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzSW5kZXhlZCkge1xuICAgICAgICAgIHRoaXMuZ2wuZHJhd0VsZW1lbnRzKGRyYXdNb2RlLCB2ZXJ0ZXhDb3VudCwgaW5kZXhUeXBlLCBvZmZzZXQpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzSW5zdGFuY2VkKSB7XG4gICAgICAgICAgdGhpcy5nbDIuZHJhd0FycmF5c0luc3RhbmNlZChkcmF3TW9kZSwgb2Zmc2V0LCB2ZXJ0ZXhDb3VudCwgaW5zdGFuY2VDb3VudCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5nbC5kcmF3QXJyYXlzKGRyYXdNb2RlLCBvZmZzZXQsIHZlcnRleENvdW50KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmICh0cmFuc2Zvcm1GZWVkYmFjaykge1xuICAgICAgICB0cmFuc2Zvcm1GZWVkYmFjay5lbmQoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHNldFVuaWZvcm1zKHVuaWZvcm1zID0ge30pIHtcbiAgICBpZiAobG9nLnByaW9yaXR5ID49IDIpIHtcbiAgICAgIGNoZWNrVW5pZm9ybVZhbHVlcyh1bmlmb3JtcywgdGhpcy5pZCwgdGhpcy5fdW5pZm9ybVNldHRlcnMpO1xuICAgIH1cblxuICAgIHRoaXMuZ2wudXNlUHJvZ3JhbSh0aGlzLmhhbmRsZSk7XG5cbiAgICBmb3IgKGNvbnN0IHVuaWZvcm1OYW1lIGluIHVuaWZvcm1zKSB7XG4gICAgICBjb25zdCB1bmlmb3JtID0gdW5pZm9ybXNbdW5pZm9ybU5hbWVdO1xuICAgICAgY29uc3QgdW5pZm9ybVNldHRlciA9IHRoaXMuX3VuaWZvcm1TZXR0ZXJzW3VuaWZvcm1OYW1lXTtcblxuICAgICAgaWYgKHVuaWZvcm1TZXR0ZXIpIHtcbiAgICAgICAgbGV0IHZhbHVlID0gdW5pZm9ybTtcbiAgICAgICAgbGV0IHRleHR1cmVVcGRhdGUgPSBmYWxzZTtcblxuICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBGcmFtZWJ1ZmZlcikge1xuICAgICAgICAgIHZhbHVlID0gdmFsdWUudGV4dHVyZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFRleHR1cmUpIHtcbiAgICAgICAgICB0ZXh0dXJlVXBkYXRlID0gdGhpcy51bmlmb3Jtc1t1bmlmb3JtTmFtZV0gIT09IHVuaWZvcm07XG5cbiAgICAgICAgICBpZiAodGV4dHVyZVVwZGF0ZSkge1xuICAgICAgICAgICAgaWYgKHVuaWZvcm1TZXR0ZXIudGV4dHVyZUluZGV4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgdW5pZm9ybVNldHRlci50ZXh0dXJlSW5kZXggPSB0aGlzLl90ZXh0dXJlSW5kZXhDb3VudGVyKys7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHRleHR1cmUgPSB2YWx1ZTtcbiAgICAgICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAgICAgdGV4dHVyZUluZGV4XG4gICAgICAgICAgICB9ID0gdW5pZm9ybVNldHRlcjtcbiAgICAgICAgICAgIHRleHR1cmUuYmluZCh0ZXh0dXJlSW5kZXgpO1xuICAgICAgICAgICAgdmFsdWUgPSB0ZXh0dXJlSW5kZXg7XG4gICAgICAgICAgICB0aGlzLl90ZXh0dXJlVW5pZm9ybXNbdW5pZm9ybU5hbWVdID0gdGV4dHVyZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFsdWUgPSB1bmlmb3JtU2V0dGVyLnRleHR1cmVJbmRleDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fdGV4dHVyZVVuaWZvcm1zW3VuaWZvcm1OYW1lXSkge1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLl90ZXh0dXJlVW5pZm9ybXNbdW5pZm9ybU5hbWVdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHVuaWZvcm1TZXR0ZXIodmFsdWUpIHx8IHRleHR1cmVVcGRhdGUpIHtcbiAgICAgICAgICBjb3B5VW5pZm9ybSh0aGlzLnVuaWZvcm1zLCB1bmlmb3JtTmFtZSwgdW5pZm9ybSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIF9hcmVUZXh0dXJlc1JlbmRlcmFibGUoKSB7XG4gICAgbGV0IHRleHR1cmVzUmVuZGVyYWJsZSA9IHRydWU7XG5cbiAgICBmb3IgKGNvbnN0IHVuaWZvcm1OYW1lIGluIHRoaXMuX3RleHR1cmVVbmlmb3Jtcykge1xuICAgICAgY29uc3QgdGV4dHVyZSA9IHRoaXMuX3RleHR1cmVVbmlmb3Jtc1t1bmlmb3JtTmFtZV07XG4gICAgICB0ZXh0dXJlLnVwZGF0ZSgpO1xuICAgICAgdGV4dHVyZXNSZW5kZXJhYmxlID0gdGV4dHVyZXNSZW5kZXJhYmxlICYmIHRleHR1cmUubG9hZGVkO1xuICAgIH1cblxuICAgIHJldHVybiB0ZXh0dXJlc1JlbmRlcmFibGU7XG4gIH1cblxuICBfYmluZFRleHR1cmVzKCkge1xuICAgIGZvciAoY29uc3QgdW5pZm9ybU5hbWUgaW4gdGhpcy5fdGV4dHVyZVVuaWZvcm1zKSB7XG4gICAgICBjb25zdCB0ZXh0dXJlSW5kZXggPSB0aGlzLl91bmlmb3JtU2V0dGVyc1t1bmlmb3JtTmFtZV0udGV4dHVyZUluZGV4O1xuXG4gICAgICB0aGlzLl90ZXh0dXJlVW5pZm9ybXNbdW5pZm9ybU5hbWVdLmJpbmQodGV4dHVyZUluZGV4KTtcbiAgICB9XG4gIH1cblxuICBfY3JlYXRlSGFuZGxlKCkge1xuICAgIHJldHVybiB0aGlzLmdsLmNyZWF0ZVByb2dyYW0oKTtcbiAgfVxuXG4gIF9kZWxldGVIYW5kbGUoKSB7XG4gICAgdGhpcy5nbC5kZWxldGVQcm9ncmFtKHRoaXMuaGFuZGxlKTtcbiAgfVxuXG4gIF9nZXRPcHRpb25zRnJvbUhhbmRsZShoYW5kbGUpIHtcbiAgICBjb25zdCBzaGFkZXJIYW5kbGVzID0gdGhpcy5nbC5nZXRBdHRhY2hlZFNoYWRlcnMoaGFuZGxlKTtcbiAgICBjb25zdCBvcHRzID0ge307XG5cbiAgICBmb3IgKGNvbnN0IHNoYWRlckhhbmRsZSBvZiBzaGFkZXJIYW5kbGVzKSB7XG4gICAgICBjb25zdCB0eXBlID0gdGhpcy5nbC5nZXRTaGFkZXJQYXJhbWV0ZXIodGhpcy5oYW5kbGUsIDM1NjYzKTtcblxuICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgMzU2MzM6XG4gICAgICAgICAgb3B0cy52cyA9IG5ldyBWZXJ0ZXhTaGFkZXIoe1xuICAgICAgICAgICAgaGFuZGxlOiBzaGFkZXJIYW5kbGVcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIDM1NjMyOlxuICAgICAgICAgIG9wdHMuZnMgPSBuZXcgRnJhZ21lbnRTaGFkZXIoe1xuICAgICAgICAgICAgaGFuZGxlOiBzaGFkZXJIYW5kbGVcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvcHRzO1xuICB9XG5cbiAgX2dldFBhcmFtZXRlcihwbmFtZSkge1xuICAgIHJldHVybiB0aGlzLmdsLmdldFByb2dyYW1QYXJhbWV0ZXIodGhpcy5oYW5kbGUsIHBuYW1lKTtcbiAgfVxuXG4gIF9zZXRJZChpZCkge1xuICAgIGlmICghaWQpIHtcbiAgICAgIGNvbnN0IHByb2dyYW1OYW1lID0gdGhpcy5fZ2V0TmFtZSgpO1xuXG4gICAgICB0aGlzLmlkID0gdWlkKHByb2dyYW1OYW1lKTtcbiAgICB9XG4gIH1cblxuICBfZ2V0TmFtZSgpIHtcbiAgICBsZXQgcHJvZ3JhbU5hbWUgPSB0aGlzLnZzLmdldE5hbWUoKSB8fCB0aGlzLmZzLmdldE5hbWUoKTtcbiAgICBwcm9ncmFtTmFtZSA9IHByb2dyYW1OYW1lLnJlcGxhY2UoL3NoYWRlci9pLCAnJyk7XG4gICAgcHJvZ3JhbU5hbWUgPSBwcm9ncmFtTmFtZSA/IGAke3Byb2dyYW1OYW1lfS1wcm9ncmFtYCA6ICdwcm9ncmFtJztcbiAgICByZXR1cm4gcHJvZ3JhbU5hbWU7XG4gIH1cblxuICBfY29tcGlsZUFuZExpbmsoKSB7XG4gICAgY29uc3Qge1xuICAgICAgZ2xcbiAgICB9ID0gdGhpcztcbiAgICBnbC5hdHRhY2hTaGFkZXIodGhpcy5oYW5kbGUsIHRoaXMudnMuaGFuZGxlKTtcbiAgICBnbC5hdHRhY2hTaGFkZXIodGhpcy5oYW5kbGUsIHRoaXMuZnMuaGFuZGxlKTtcbiAgICBsb2cudGltZShMT0dfUFJPR1JBTV9QRVJGX1BSSU9SSVRZLCBgbGlua1Byb2dyYW0gZm9yICR7dGhpcy5fZ2V0TmFtZSgpfWApKCk7XG4gICAgZ2wubGlua1Byb2dyYW0odGhpcy5oYW5kbGUpO1xuICAgIGxvZy50aW1lRW5kKExPR19QUk9HUkFNX1BFUkZfUFJJT1JJVFksIGBsaW5rUHJvZ3JhbSBmb3IgJHt0aGlzLl9nZXROYW1lKCl9YCkoKTtcblxuICAgIGlmIChnbC5kZWJ1ZyB8fCBsb2cubGV2ZWwgPiAwKSB7XG4gICAgICBjb25zdCBsaW5rZWQgPSBnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHRoaXMuaGFuZGxlLCAzNTcxNCk7XG5cbiAgICAgIGlmICghbGlua2VkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgRXJyb3IgbGlua2luZzogJHtnbC5nZXRQcm9ncmFtSW5mb0xvZyh0aGlzLmhhbmRsZSl9YCk7XG4gICAgICB9XG5cbiAgICAgIGdsLnZhbGlkYXRlUHJvZ3JhbSh0aGlzLmhhbmRsZSk7XG4gICAgICBjb25zdCB2YWxpZGF0ZWQgPSBnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHRoaXMuaGFuZGxlLCAzNTcxNSk7XG5cbiAgICAgIGlmICghdmFsaWRhdGVkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgRXJyb3IgdmFsaWRhdGluZzogJHtnbC5nZXRQcm9ncmFtSW5mb0xvZyh0aGlzLmhhbmRsZSl9YCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX3JlYWRVbmlmb3JtTG9jYXRpb25zRnJvbUxpbmtlZFByb2dyYW0oKSB7XG4gICAgY29uc3Qge1xuICAgICAgZ2xcbiAgICB9ID0gdGhpcztcbiAgICB0aGlzLl91bmlmb3JtU2V0dGVycyA9IHt9O1xuICAgIHRoaXMuX3VuaWZvcm1Db3VudCA9IHRoaXMuX2dldFBhcmFtZXRlcigzNTcxOCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX3VuaWZvcm1Db3VudDsgaSsrKSB7XG4gICAgICBjb25zdCBpbmZvID0gdGhpcy5nbC5nZXRBY3RpdmVVbmlmb3JtKHRoaXMuaGFuZGxlLCBpKTtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgbmFtZVxuICAgICAgfSA9IHBhcnNlVW5pZm9ybU5hbWUoaW5mby5uYW1lKTtcbiAgICAgIGxldCBsb2NhdGlvbiA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbih0aGlzLmhhbmRsZSwgbmFtZSk7XG4gICAgICB0aGlzLl91bmlmb3JtU2V0dGVyc1tuYW1lXSA9IGdldFVuaWZvcm1TZXR0ZXIoZ2wsIGxvY2F0aW9uLCBpbmZvKTtcblxuICAgICAgaWYgKGluZm8uc2l6ZSA+IDEpIHtcbiAgICAgICAgZm9yIChsZXQgbCA9IDA7IGwgPCBpbmZvLnNpemU7IGwrKykge1xuICAgICAgICAgIGxvY2F0aW9uID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHRoaXMuaGFuZGxlLCBgJHtuYW1lfVske2x9XWApO1xuICAgICAgICAgIHRoaXMuX3VuaWZvcm1TZXR0ZXJzW2Ake25hbWV9WyR7bH1dYF0gPSBnZXRVbmlmb3JtU2V0dGVyKGdsLCBsb2NhdGlvbiwgaW5mbyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl90ZXh0dXJlSW5kZXhDb3VudGVyID0gMDtcbiAgfVxuXG4gIGdldEFjdGl2ZVVuaWZvcm1zKHVuaWZvcm1JbmRpY2VzLCBwbmFtZSkge1xuICAgIHJldHVybiB0aGlzLmdsMi5nZXRBY3RpdmVVbmlmb3Jtcyh0aGlzLmhhbmRsZSwgdW5pZm9ybUluZGljZXMsIHBuYW1lKTtcbiAgfVxuXG4gIGdldFVuaWZvcm1CbG9ja0luZGV4KGJsb2NrTmFtZSkge1xuICAgIHJldHVybiB0aGlzLmdsMi5nZXRVbmlmb3JtQmxvY2tJbmRleCh0aGlzLmhhbmRsZSwgYmxvY2tOYW1lKTtcbiAgfVxuXG4gIGdldEFjdGl2ZVVuaWZvcm1CbG9ja1BhcmFtZXRlcihibG9ja0luZGV4LCBwbmFtZSkge1xuICAgIHJldHVybiB0aGlzLmdsMi5nZXRBY3RpdmVVbmlmb3JtQmxvY2tQYXJhbWV0ZXIodGhpcy5oYW5kbGUsIGJsb2NrSW5kZXgsIHBuYW1lKTtcbiAgfVxuXG4gIHVuaWZvcm1CbG9ja0JpbmRpbmcoYmxvY2tJbmRleCwgYmxvY2tCaW5kaW5nKSB7XG4gICAgdGhpcy5nbDIudW5pZm9ybUJsb2NrQmluZGluZyh0aGlzLmhhbmRsZSwgYmxvY2tJbmRleCwgYmxvY2tCaW5kaW5nKTtcbiAgfVxuXG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wcm9ncmFtLmpzLm1hcCIsImltcG9ydCBSZXNvdXJjZSBmcm9tICcuL3Jlc291cmNlJztcbmltcG9ydCB7IEZFQVRVUkVTLCBoYXNGZWF0dXJlcyB9IGZyb20gJy4uL2ZlYXR1cmVzJztcbmltcG9ydCB7IGlzV2ViR0wyIH0gZnJvbSAnQGx1bWEuZ2wvZ2x0b29scyc7XG5pbXBvcnQgeyBhc3NlcnQgfSBmcm9tICcuLi91dGlscy9hc3NlcnQnO1xuY29uc3QgR0xfUVVFUllfUkVTVUxUID0gMHg4ODY2O1xuY29uc3QgR0xfUVVFUllfUkVTVUxUX0FWQUlMQUJMRSA9IDB4ODg2NztcbmNvbnN0IEdMX1RJTUVfRUxBUFNFRF9FWFQgPSAweDg4YmY7XG5jb25zdCBHTF9HUFVfRElTSk9JTlRfRVhUID0gMHg4ZmJiO1xuY29uc3QgR0xfVFJBTlNGT1JNX0ZFRURCQUNLX1BSSU1JVElWRVNfV1JJVFRFTiA9IDB4OGM4ODtcbmNvbnN0IEdMX0FOWV9TQU1QTEVTX1BBU1NFRCA9IDB4OGMyZjtcbmNvbnN0IEdMX0FOWV9TQU1QTEVTX1BBU1NFRF9DT05TRVJWQVRJVkUgPSAweDhkNmE7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBRdWVyeSBleHRlbmRzIFJlc291cmNlIHtcbiAgc3RhdGljIGlzU3VwcG9ydGVkKGdsLCBvcHRzID0gW10pIHtcbiAgICBjb25zdCB3ZWJnbDIgPSBpc1dlYkdMMihnbCk7XG4gICAgY29uc3QgaGFzVGltZXJRdWVyeSA9IGhhc0ZlYXR1cmVzKGdsLCBGRUFUVVJFUy5USU1FUl9RVUVSWSk7XG4gICAgbGV0IHN1cHBvcnRlZCA9IHdlYmdsMiB8fCBoYXNUaW1lclF1ZXJ5O1xuXG4gICAgZm9yIChjb25zdCBrZXkgb2Ygb3B0cykge1xuICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgY2FzZSAncXVlcmllcyc6XG4gICAgICAgICAgc3VwcG9ydGVkID0gc3VwcG9ydGVkICYmIHdlYmdsMjtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICd0aW1lcnMnOlxuICAgICAgICAgIHN1cHBvcnRlZCA9IHN1cHBvcnRlZCAmJiBoYXNUaW1lclF1ZXJ5O1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgYXNzZXJ0KGZhbHNlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc3VwcG9ydGVkO1xuICB9XG5cbiAgY29uc3RydWN0b3IoZ2wsIG9wdHMgPSB7fSkge1xuICAgIHN1cGVyKGdsLCBvcHRzKTtcbiAgICB0aGlzLnRhcmdldCA9IG51bGw7XG4gICAgdGhpcy5fcXVlcnlQZW5kaW5nID0gZmFsc2U7XG4gICAgdGhpcy5fcG9sbGluZ1Byb21pc2UgPSBudWxsO1xuICAgIE9iamVjdC5zZWFsKHRoaXMpO1xuICB9XG5cbiAgYmVnaW5UaW1lRWxhcHNlZFF1ZXJ5KCkge1xuICAgIHJldHVybiB0aGlzLmJlZ2luKEdMX1RJTUVfRUxBUFNFRF9FWFQpO1xuICB9XG5cbiAgYmVnaW5PY2NsdXNpb25RdWVyeSh7XG4gICAgY29uc2VydmF0aXZlID0gZmFsc2VcbiAgfSA9IHt9KSB7XG4gICAgcmV0dXJuIHRoaXMuYmVnaW4oY29uc2VydmF0aXZlID8gR0xfQU5ZX1NBTVBMRVNfUEFTU0VEX0NPTlNFUlZBVElWRSA6IEdMX0FOWV9TQU1QTEVTX1BBU1NFRCk7XG4gIH1cblxuICBiZWdpblRyYW5zZm9ybUZlZWRiYWNrUXVlcnkoKSB7XG4gICAgcmV0dXJuIHRoaXMuYmVnaW4oR0xfVFJBTlNGT1JNX0ZFRURCQUNLX1BSSU1JVElWRVNfV1JJVFRFTik7XG4gIH1cblxuICBiZWdpbih0YXJnZXQpIHtcbiAgICBpZiAodGhpcy5fcXVlcnlQZW5kaW5nKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcbiAgICB0aGlzLmdsMi5iZWdpblF1ZXJ5KHRoaXMudGFyZ2V0LCB0aGlzLmhhbmRsZSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBlbmQoKSB7XG4gICAgaWYgKHRoaXMuX3F1ZXJ5UGVuZGluZykge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMudGFyZ2V0KSB7XG4gICAgICB0aGlzLmdsMi5lbmRRdWVyeSh0aGlzLnRhcmdldCk7XG4gICAgICB0aGlzLnRhcmdldCA9IG51bGw7XG4gICAgICB0aGlzLl9xdWVyeVBlbmRpbmcgPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgaXNSZXN1bHRBdmFpbGFibGUoKSB7XG4gICAgaWYgKCF0aGlzLl9xdWVyeVBlbmRpbmcpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCByZXN1bHRBdmFpbGFibGUgPSB0aGlzLmdsMi5nZXRRdWVyeVBhcmFtZXRlcih0aGlzLmhhbmRsZSwgR0xfUVVFUllfUkVTVUxUX0FWQUlMQUJMRSk7XG5cbiAgICBpZiAocmVzdWx0QXZhaWxhYmxlKSB7XG4gICAgICB0aGlzLl9xdWVyeVBlbmRpbmcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0QXZhaWxhYmxlO1xuICB9XG5cbiAgaXNUaW1lckRpc2pvaW50KCkge1xuICAgIHJldHVybiB0aGlzLmdsMi5nZXRQYXJhbWV0ZXIoR0xfR1BVX0RJU0pPSU5UX0VYVCk7XG4gIH1cblxuICBnZXRSZXN1bHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2wyLmdldFF1ZXJ5UGFyYW1ldGVyKHRoaXMuaGFuZGxlLCBHTF9RVUVSWV9SRVNVTFQpO1xuICB9XG5cbiAgZ2V0VGltZXJNaWxsaXNlY29uZHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UmVzdWx0KCkgLyAxZTY7XG4gIH1cblxuICBjcmVhdGVQb2xsKGxpbWl0ID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKSB7XG4gICAgaWYgKHRoaXMuX3BvbGxpbmdQcm9taXNlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcG9sbGluZ1Byb21pc2U7XG4gICAgfVxuXG4gICAgbGV0IGNvdW50ZXIgPSAwO1xuICAgIHRoaXMuX3BvbGxpbmdQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgcG9sbCA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuaXNSZXN1bHRBdmFpbGFibGUoKSkge1xuICAgICAgICAgIHJlc29sdmUodGhpcy5nZXRSZXN1bHQoKSk7XG4gICAgICAgICAgdGhpcy5fcG9sbGluZ1Byb21pc2UgPSBudWxsO1xuICAgICAgICB9IGVsc2UgaWYgKGNvdW50ZXIrKyA+IGxpbWl0KSB7XG4gICAgICAgICAgcmVqZWN0KCdUaW1lZCBvdXQnKTtcbiAgICAgICAgICB0aGlzLl9wb2xsaW5nUHJvbWlzZSA9IG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHBvbGwpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocG9sbCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXMuX3BvbGxpbmdQcm9taXNlO1xuICB9XG5cbiAgX2NyZWF0ZUhhbmRsZSgpIHtcbiAgICByZXR1cm4gUXVlcnkuaXNTdXBwb3J0ZWQodGhpcy5nbCkgPyB0aGlzLmdsMi5jcmVhdGVRdWVyeSgpIDogbnVsbDtcbiAgfVxuXG4gIF9kZWxldGVIYW5kbGUoKSB7XG4gICAgdGhpcy5nbDIuZGVsZXRlUXVlcnkodGhpcy5oYW5kbGUpO1xuICB9XG5cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXF1ZXJ5LmpzLm1hcCIsImNvbnN0IEVYVF9GTE9BVF9XRUJHTDIgPSAnRVhUX2NvbG9yX2J1ZmZlcl9mbG9hdCc7XG5leHBvcnQgZGVmYXVsdCB7XG4gIFszMzE4OV06IHtcbiAgICBicHA6IDJcbiAgfSxcbiAgWzMzMTkwXToge1xuICAgIGdsMjogdHJ1ZSxcbiAgICBicHA6IDNcbiAgfSxcbiAgWzM2MDEyXToge1xuICAgIGdsMjogdHJ1ZSxcbiAgICBicHA6IDRcbiAgfSxcbiAgWzM2MTY4XToge1xuICAgIGJwcDogMVxuICB9LFxuICBbMzQwNDFdOiB7XG4gICAgYnBwOiA0XG4gIH0sXG4gIFszNTA1Nl06IHtcbiAgICBnbDI6IHRydWUsXG4gICAgYnBwOiA0XG4gIH0sXG4gIFszNjAxM106IHtcbiAgICBnbDI6IHRydWUsXG4gICAgYnBwOiA1XG4gIH0sXG4gIFszMjg1NF06IHtcbiAgICBicHA6IDJcbiAgfSxcbiAgWzM2MTk0XToge1xuICAgIGJwcDogMlxuICB9LFxuICBbMzI4NTVdOiB7XG4gICAgYnBwOiAyXG4gIH0sXG4gIFszMzMyMV06IHtcbiAgICBnbDI6IHRydWUsXG4gICAgYnBwOiAxXG4gIH0sXG4gIFszMzMzMF06IHtcbiAgICBnbDI6IHRydWUsXG4gICAgYnBwOiAxXG4gIH0sXG4gIFszMzMyOV06IHtcbiAgICBnbDI6IHRydWUsXG4gICAgYnBwOiAxXG4gIH0sXG4gIFszMzMzMl06IHtcbiAgICBnbDI6IHRydWUsXG4gICAgYnBwOiAyXG4gIH0sXG4gIFszMzMzMV06IHtcbiAgICBnbDI6IHRydWUsXG4gICAgYnBwOiAyXG4gIH0sXG4gIFszMzMzNF06IHtcbiAgICBnbDI6IHRydWUsXG4gICAgYnBwOiA0XG4gIH0sXG4gIFszMzMzM106IHtcbiAgICBnbDI6IHRydWUsXG4gICAgYnBwOiA0XG4gIH0sXG4gIFszMzMyM106IHtcbiAgICBnbDI6IHRydWUsXG4gICAgYnBwOiAyXG4gIH0sXG4gIFszMzMzNl06IHtcbiAgICBnbDI6IHRydWUsXG4gICAgYnBwOiAyXG4gIH0sXG4gIFszMzMzNV06IHtcbiAgICBnbDI6IHRydWUsXG4gICAgYnBwOiAyXG4gIH0sXG4gIFszMzMzOF06IHtcbiAgICBnbDI6IHRydWUsXG4gICAgYnBwOiA0XG4gIH0sXG4gIFszMzMzN106IHtcbiAgICBnbDI6IHRydWUsXG4gICAgYnBwOiA0XG4gIH0sXG4gIFszMzM0MF06IHtcbiAgICBnbDI6IHRydWUsXG4gICAgYnBwOiA4XG4gIH0sXG4gIFszMzMzOV06IHtcbiAgICBnbDI6IHRydWUsXG4gICAgYnBwOiA4XG4gIH0sXG4gIFszMjg0OV06IHtcbiAgICBnbDI6IHRydWUsXG4gICAgYnBwOiAzXG4gIH0sXG4gIFszMjg1Nl06IHtcbiAgICBnbDI6IHRydWUsXG4gICAgYnBwOiA0XG4gIH0sXG4gIFszMjg1N106IHtcbiAgICBnbDI6IHRydWUsXG4gICAgYnBwOiA0XG4gIH0sXG4gIFszNjIyMF06IHtcbiAgICBnbDI6IHRydWUsXG4gICAgYnBwOiA0XG4gIH0sXG4gIFszNjIzOF06IHtcbiAgICBnbDI6IHRydWUsXG4gICAgYnBwOiA0XG4gIH0sXG4gIFszNjk3NV06IHtcbiAgICBnbDI6IHRydWUsXG4gICAgYnBwOiA0XG4gIH0sXG4gIFszNjIxNF06IHtcbiAgICBnbDI6IHRydWUsXG4gICAgYnBwOiA4XG4gIH0sXG4gIFszNjIzMl06IHtcbiAgICBnbDI6IHRydWUsXG4gICAgYnBwOiA4XG4gIH0sXG4gIFszNjIyNl06IHtcbiAgICBnbDI6IHRydWUsXG4gICAgYnBwOiAxNlxuICB9LFxuICBbMzYyMDhdOiB7XG4gICAgZ2wyOiB0cnVlLFxuICAgIGJwcDogMTZcbiAgfSxcbiAgWzMzMzI1XToge1xuICAgIGdsMjogRVhUX0ZMT0FUX1dFQkdMMixcbiAgICBicHA6IDJcbiAgfSxcbiAgWzMzMzI3XToge1xuICAgIGdsMjogRVhUX0ZMT0FUX1dFQkdMMixcbiAgICBicHA6IDRcbiAgfSxcbiAgWzM0ODQyXToge1xuICAgIGdsMjogRVhUX0ZMT0FUX1dFQkdMMixcbiAgICBicHA6IDhcbiAgfSxcbiAgWzMzMzI2XToge1xuICAgIGdsMjogRVhUX0ZMT0FUX1dFQkdMMixcbiAgICBicHA6IDRcbiAgfSxcbiAgWzMzMzI4XToge1xuICAgIGdsMjogRVhUX0ZMT0FUX1dFQkdMMixcbiAgICBicHA6IDhcbiAgfSxcbiAgWzM0ODM2XToge1xuICAgIGdsMjogRVhUX0ZMT0FUX1dFQkdMMixcbiAgICBicHA6IDE2XG4gIH0sXG4gIFszNTg5OF06IHtcbiAgICBnbDI6IEVYVF9GTE9BVF9XRUJHTDIsXG4gICAgYnBwOiA0XG4gIH1cbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1yZW5kZXJidWZmZXItZm9ybWF0cy5qcy5tYXAiLCJpbXBvcnQgUmVzb3VyY2UgZnJvbSAnLi9yZXNvdXJjZSc7XG5pbXBvcnQgUkVOREVSQlVGRkVSX0ZPUk1BVFMgZnJvbSAnLi9yZW5kZXJidWZmZXItZm9ybWF0cyc7XG5pbXBvcnQgeyBpc1dlYkdMMiB9IGZyb20gJ0BsdW1hLmdsL2dsdG9vbHMnO1xuaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSAnLi4vdXRpbHMvYXNzZXJ0JztcblxuZnVuY3Rpb24gaXNGb3JtYXRTdXBwb3J0ZWQoZ2wsIGZvcm1hdCwgZm9ybWF0cykge1xuICBjb25zdCBpbmZvID0gZm9ybWF0c1tmb3JtYXRdO1xuXG4gIGlmICghaW5mbykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IHZhbHVlID0gaXNXZWJHTDIoZ2wpID8gaW5mby5nbDIgfHwgaW5mby5nbDEgOiBpbmZvLmdsMTtcblxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBnbC5nZXRFeHRlbnNpb24odmFsdWUpO1xuICB9XG5cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZW5kZXJidWZmZXIgZXh0ZW5kcyBSZXNvdXJjZSB7XG4gIHN0YXRpYyBpc1N1cHBvcnRlZChnbCwge1xuICAgIGZvcm1hdFxuICB9ID0ge1xuICAgIGZvcm1hdDogbnVsbFxuICB9KSB7XG4gICAgcmV0dXJuICFmb3JtYXQgfHwgaXNGb3JtYXRTdXBwb3J0ZWQoZ2wsIGZvcm1hdCwgUkVOREVSQlVGRkVSX0ZPUk1BVFMpO1xuICB9XG5cbiAgc3RhdGljIGdldFNhbXBsZXNGb3JGb3JtYXQoZ2wsIHtcbiAgICBmb3JtYXRcbiAgfSkge1xuICAgIHJldHVybiBnbC5nZXRJbnRlcm5hbGZvcm1hdFBhcmFtZXRlcigzNjE2MSwgZm9ybWF0LCAzMjkzNyk7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihnbCwgb3B0cyA9IHt9KSB7XG4gICAgc3VwZXIoZ2wsIG9wdHMpO1xuICAgIHRoaXMuaW5pdGlhbGl6ZShvcHRzKTtcbiAgICBPYmplY3Quc2VhbCh0aGlzKTtcbiAgfVxuXG4gIGluaXRpYWxpemUoe1xuICAgIGZvcm1hdCxcbiAgICB3aWR0aCA9IDEsXG4gICAgaGVpZ2h0ID0gMSxcbiAgICBzYW1wbGVzID0gMFxuICB9KSB7XG4gICAgYXNzZXJ0KGZvcm1hdCwgJ05lZWRzIGZvcm1hdCcpO1xuXG4gICAgdGhpcy5fdHJhY2tEZWFsbG9jYXRlZE1lbW9yeSgpO1xuXG4gICAgdGhpcy5nbC5iaW5kUmVuZGVyYnVmZmVyKDM2MTYxLCB0aGlzLmhhbmRsZSk7XG5cbiAgICBpZiAoc2FtcGxlcyAhPT0gMCAmJiBpc1dlYkdMMih0aGlzLmdsKSkge1xuICAgICAgdGhpcy5nbC5yZW5kZXJidWZmZXJTdG9yYWdlTXVsdGlzYW1wbGUoMzYxNjEsIHNhbXBsZXMsIGZvcm1hdCwgd2lkdGgsIGhlaWdodCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZ2wucmVuZGVyYnVmZmVyU3RvcmFnZSgzNjE2MSwgZm9ybWF0LCB3aWR0aCwgaGVpZ2h0KTtcbiAgICB9XG5cbiAgICB0aGlzLmZvcm1hdCA9IGZvcm1hdDtcbiAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgdGhpcy5zYW1wbGVzID0gc2FtcGxlcztcblxuICAgIHRoaXMuX3RyYWNrQWxsb2NhdGVkTWVtb3J5KHRoaXMud2lkdGggKiB0aGlzLmhlaWdodCAqICh0aGlzLnNhbXBsZXMgfHwgMSkgKiBSRU5ERVJCVUZGRVJfRk9STUFUU1t0aGlzLmZvcm1hdF0uYnBwKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcmVzaXplKHtcbiAgICB3aWR0aCxcbiAgICBoZWlnaHRcbiAgfSkge1xuICAgIGlmICh3aWR0aCAhPT0gdGhpcy53aWR0aCB8fCBoZWlnaHQgIT09IHRoaXMuaGVpZ2h0KSB7XG4gICAgICByZXR1cm4gdGhpcy5pbml0aWFsaXplKHtcbiAgICAgICAgd2lkdGgsXG4gICAgICAgIGhlaWdodCxcbiAgICAgICAgZm9ybWF0OiB0aGlzLmZvcm1hdCxcbiAgICAgICAgc2FtcGxlczogdGhpcy5zYW1wbGVzXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIF9jcmVhdGVIYW5kbGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2wuY3JlYXRlUmVuZGVyYnVmZmVyKCk7XG4gIH1cblxuICBfZGVsZXRlSGFuZGxlKCkge1xuICAgIHRoaXMuZ2wuZGVsZXRlUmVuZGVyYnVmZmVyKHRoaXMuaGFuZGxlKTtcblxuICAgIHRoaXMuX3RyYWNrRGVhbGxvY2F0ZWRNZW1vcnkoKTtcbiAgfVxuXG4gIF9iaW5kSGFuZGxlKGhhbmRsZSkge1xuICAgIHRoaXMuZ2wuYmluZFJlbmRlcmJ1ZmZlcigzNjE2MSwgaGFuZGxlKTtcbiAgfVxuXG4gIF9zeW5jSGFuZGxlKGhhbmRsZSkge1xuICAgIHRoaXMuZm9ybWF0ID0gdGhpcy5nZXRQYXJhbWV0ZXIoMzYxNjQpO1xuICAgIHRoaXMud2lkdGggPSB0aGlzLmdldFBhcmFtZXRlcigzNjE2Mik7XG4gICAgdGhpcy5oZWlnaHQgPSB0aGlzLmdldFBhcmFtZXRlcigzNjE2Myk7XG4gICAgdGhpcy5zYW1wbGVzID0gdGhpcy5nZXRQYXJhbWV0ZXIoMzYwMTEpO1xuICB9XG5cbiAgX2dldFBhcmFtZXRlcihwbmFtZSkge1xuICAgIHRoaXMuZ2wuYmluZFJlbmRlcmJ1ZmZlcigzNjE2MSwgdGhpcy5oYW5kbGUpO1xuICAgIGNvbnN0IHZhbHVlID0gdGhpcy5nbC5nZXRSZW5kZXJidWZmZXJQYXJhbWV0ZXIoMzYxNjEsIHBuYW1lKTtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cmVuZGVyYnVmZmVyLmpzLm1hcCIsImltcG9ydCB7IGlzV2ViR0wyLCBhc3NlcnRXZWJHTENvbnRleHQgfSBmcm9tICdAbHVtYS5nbC9nbHRvb2xzJztcbmltcG9ydCB7IGx1bWFTdGF0cyB9IGZyb20gJy4uL2luaXQnO1xuaW1wb3J0IHsgZ2V0S2V5LCBnZXRLZXlWYWx1ZSB9IGZyb20gJy4uL3dlYmdsLXV0aWxzL2NvbnN0YW50cy10by1rZXlzJztcbmltcG9ydCB7IGFzc2VydCB9IGZyb20gJy4uL3V0aWxzL2Fzc2VydCc7XG5pbXBvcnQgeyB1aWQgfSBmcm9tICcuLi91dGlscy91dGlscyc7XG5pbXBvcnQgeyBzdHViUmVtb3ZlZE1ldGhvZHMgfSBmcm9tICcuLi91dGlscy9zdHViLW1ldGhvZHMnO1xuY29uc3QgRVJSX1JFU09VUkNFX01FVEhPRF9VTkRFRklORUQgPSAnUmVzb3VyY2Ugc3ViY2xhc3MgbXVzdCBkZWZpbmUgdmlydHVhbCBtZXRob2RzJztcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlc291cmNlIHtcbiAgY29uc3RydWN0b3IoZ2wsIG9wdHMgPSB7fSkge1xuICAgIGFzc2VydFdlYkdMQ29udGV4dChnbCk7XG4gICAgY29uc3Qge1xuICAgICAgaWQsXG4gICAgICB1c2VyRGF0YSA9IHt9XG4gICAgfSA9IG9wdHM7XG4gICAgdGhpcy5nbCA9IGdsO1xuICAgIHRoaXMuZ2wyID0gZ2w7XG4gICAgdGhpcy5pZCA9IGlkIHx8IHVpZCh0aGlzLmNvbnN0cnVjdG9yLm5hbWUpO1xuICAgIHRoaXMudXNlckRhdGEgPSB1c2VyRGF0YTtcbiAgICB0aGlzLl9ib3VuZCA9IGZhbHNlO1xuICAgIHRoaXMuX2hhbmRsZSA9IG9wdHMuaGFuZGxlO1xuXG4gICAgaWYgKHRoaXMuX2hhbmRsZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLl9oYW5kbGUgPSB0aGlzLl9jcmVhdGVIYW5kbGUoKTtcbiAgICB9XG5cbiAgICB0aGlzLmJ5dGVMZW5ndGggPSAwO1xuXG4gICAgdGhpcy5fYWRkU3RhdHMoKTtcbiAgfVxuXG4gIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9KCR7dGhpcy5pZH0pYDtcbiAgfVxuXG4gIGdldCBoYW5kbGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2hhbmRsZTtcbiAgfVxuXG4gIGRlbGV0ZSh7XG4gICAgZGVsZXRlQ2hpbGRyZW4gPSBmYWxzZVxuICB9ID0ge30pIHtcbiAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMuX2hhbmRsZSAmJiB0aGlzLl9kZWxldGVIYW5kbGUodGhpcy5faGFuZGxlKTtcblxuICAgIGlmICh0aGlzLl9oYW5kbGUpIHtcbiAgICAgIHRoaXMuX3JlbW92ZVN0YXRzKCk7XG4gICAgfVxuXG4gICAgdGhpcy5faGFuZGxlID0gbnVsbDtcblxuICAgIGlmIChjaGlsZHJlbiAmJiBkZWxldGVDaGlsZHJlbikge1xuICAgICAgY2hpbGRyZW4uZmlsdGVyKEJvb2xlYW4pLmZvckVhY2goY2hpbGQgPT4gY2hpbGQuZGVsZXRlKCkpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYmluZChmdW5jT3JIYW5kbGUgPSB0aGlzLmhhbmRsZSkge1xuICAgIGlmICh0eXBlb2YgZnVuY09ySGFuZGxlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLl9iaW5kSGFuZGxlKGZ1bmNPckhhbmRsZSk7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGxldCB2YWx1ZTtcblxuICAgIGlmICghdGhpcy5fYm91bmQpIHtcbiAgICAgIHRoaXMuX2JpbmRIYW5kbGUodGhpcy5oYW5kbGUpO1xuXG4gICAgICB0aGlzLl9ib3VuZCA9IHRydWU7XG4gICAgICB2YWx1ZSA9IGZ1bmNPckhhbmRsZSgpO1xuICAgICAgdGhpcy5fYm91bmQgPSBmYWxzZTtcblxuICAgICAgdGhpcy5fYmluZEhhbmRsZShudWxsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgPSBmdW5jT3JIYW5kbGUoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICB1bmJpbmQoKSB7XG4gICAgdGhpcy5iaW5kKG51bGwpO1xuICB9XG5cbiAgZ2V0UGFyYW1ldGVyKHBuYW1lLCBvcHRzID0ge30pIHtcbiAgICBwbmFtZSA9IGdldEtleVZhbHVlKHRoaXMuZ2wsIHBuYW1lKTtcbiAgICBhc3NlcnQocG5hbWUpO1xuICAgIGNvbnN0IHBhcmFtZXRlcnMgPSB0aGlzLmNvbnN0cnVjdG9yLlBBUkFNRVRFUlMgfHwge307XG4gICAgY29uc3QgcGFyYW1ldGVyID0gcGFyYW1ldGVyc1twbmFtZV07XG5cbiAgICBpZiAocGFyYW1ldGVyKSB7XG4gICAgICBjb25zdCBpc1dlYmdsMiA9IGlzV2ViR0wyKHRoaXMuZ2wpO1xuICAgICAgY29uc3QgcGFyYW1ldGVyQXZhaWxhYmxlID0gKCEoJ3dlYmdsMicgaW4gcGFyYW1ldGVyKSB8fCBpc1dlYmdsMikgJiYgKCEoJ2V4dGVuc2lvbicgaW4gcGFyYW1ldGVyKSB8fCB0aGlzLmdsLmdldEV4dGVuc2lvbihwYXJhbWV0ZXIuZXh0ZW5zaW9uKSk7XG5cbiAgICAgIGlmICghcGFyYW1ldGVyQXZhaWxhYmxlKSB7XG4gICAgICAgIGNvbnN0IHdlYmdsMURlZmF1bHQgPSBwYXJhbWV0ZXIud2ViZ2wxO1xuICAgICAgICBjb25zdCB3ZWJnbDJEZWZhdWx0ID0gJ3dlYmdsMicgaW4gcGFyYW1ldGVyID8gcGFyYW1ldGVyLndlYmdsMiA6IHBhcmFtZXRlci53ZWJnbDE7XG4gICAgICAgIGNvbnN0IGRlZmF1bHRWYWx1ZSA9IGlzV2ViZ2wyID8gd2ViZ2wyRGVmYXVsdCA6IHdlYmdsMURlZmF1bHQ7XG4gICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2dldFBhcmFtZXRlcihwbmFtZSwgb3B0cyk7XG4gIH1cblxuICBnZXRQYXJhbWV0ZXJzKG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IHtcbiAgICAgIHBhcmFtZXRlcnMsXG4gICAgICBrZXlzXG4gICAgfSA9IG9wdGlvbnM7XG4gICAgY29uc3QgUEFSQU1FVEVSUyA9IHRoaXMuY29uc3RydWN0b3IuUEFSQU1FVEVSUyB8fCB7fTtcbiAgICBjb25zdCBpc1dlYmdsMiA9IGlzV2ViR0wyKHRoaXMuZ2wpO1xuICAgIGNvbnN0IHZhbHVlcyA9IHt9O1xuICAgIGNvbnN0IHBhcmFtZXRlcktleXMgPSBwYXJhbWV0ZXJzIHx8IE9iamVjdC5rZXlzKFBBUkFNRVRFUlMpO1xuXG4gICAgZm9yIChjb25zdCBwbmFtZSBvZiBwYXJhbWV0ZXJLZXlzKSB7XG4gICAgICBjb25zdCBwYXJhbWV0ZXIgPSBQQVJBTUVURVJTW3BuYW1lXTtcbiAgICAgIGNvbnN0IHBhcmFtZXRlckF2YWlsYWJsZSA9IHBhcmFtZXRlciAmJiAoISgnd2ViZ2wyJyBpbiBwYXJhbWV0ZXIpIHx8IGlzV2ViZ2wyKSAmJiAoISgnZXh0ZW5zaW9uJyBpbiBwYXJhbWV0ZXIpIHx8IHRoaXMuZ2wuZ2V0RXh0ZW5zaW9uKHBhcmFtZXRlci5leHRlbnNpb24pKTtcblxuICAgICAgaWYgKHBhcmFtZXRlckF2YWlsYWJsZSkge1xuICAgICAgICBjb25zdCBrZXkgPSBrZXlzID8gZ2V0S2V5KHRoaXMuZ2wsIHBuYW1lKSA6IHBuYW1lO1xuICAgICAgICB2YWx1ZXNba2V5XSA9IHRoaXMuZ2V0UGFyYW1ldGVyKHBuYW1lLCBvcHRpb25zKTtcblxuICAgICAgICBpZiAoa2V5cyAmJiBwYXJhbWV0ZXIudHlwZSA9PT0gJ0dMZW51bScpIHtcbiAgICAgICAgICB2YWx1ZXNba2V5XSA9IGdldEtleSh0aGlzLmdsLCB2YWx1ZXNba2V5XSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWVzO1xuICB9XG5cbiAgc2V0UGFyYW1ldGVyKHBuYW1lLCB2YWx1ZSkge1xuICAgIHBuYW1lID0gZ2V0S2V5VmFsdWUodGhpcy5nbCwgcG5hbWUpO1xuICAgIGFzc2VydChwbmFtZSk7XG4gICAgY29uc3QgcGFyYW1ldGVycyA9IHRoaXMuY29uc3RydWN0b3IuUEFSQU1FVEVSUyB8fCB7fTtcbiAgICBjb25zdCBwYXJhbWV0ZXIgPSBwYXJhbWV0ZXJzW3BuYW1lXTtcblxuICAgIGlmIChwYXJhbWV0ZXIpIHtcbiAgICAgIGNvbnN0IGlzV2ViZ2wyID0gaXNXZWJHTDIodGhpcy5nbCk7XG4gICAgICBjb25zdCBwYXJhbWV0ZXJBdmFpbGFibGUgPSAoISgnd2ViZ2wyJyBpbiBwYXJhbWV0ZXIpIHx8IGlzV2ViZ2wyKSAmJiAoISgnZXh0ZW5zaW9uJyBpbiBwYXJhbWV0ZXIpIHx8IHRoaXMuZ2wuZ2V0RXh0ZW5zaW9uKHBhcmFtZXRlci5leHRlbnNpb24pKTtcblxuICAgICAgaWYgKCFwYXJhbWV0ZXJBdmFpbGFibGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQYXJhbWV0ZXIgbm90IGF2YWlsYWJsZSBvbiB0aGlzIHBsYXRmb3JtJyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChwYXJhbWV0ZXIudHlwZSA9PT0gJ0dMZW51bScpIHtcbiAgICAgICAgdmFsdWUgPSBnZXRLZXlWYWx1ZSh2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fc2V0UGFyYW1ldGVyKHBuYW1lLCB2YWx1ZSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHNldFBhcmFtZXRlcnMocGFyYW1ldGVycykge1xuICAgIGZvciAoY29uc3QgcG5hbWUgaW4gcGFyYW1ldGVycykge1xuICAgICAgdGhpcy5zZXRQYXJhbWV0ZXIocG5hbWUsIHBhcmFtZXRlcnNbcG5hbWVdKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHN0dWJSZW1vdmVkTWV0aG9kcyhjbGFzc05hbWUsIHZlcnNpb24sIG1ldGhvZE5hbWVzKSB7XG4gICAgcmV0dXJuIHN0dWJSZW1vdmVkTWV0aG9kcyh0aGlzLCBjbGFzc05hbWUsIHZlcnNpb24sIG1ldGhvZE5hbWVzKTtcbiAgfVxuXG4gIGluaXRpYWxpemUob3B0cykge31cblxuICBfY3JlYXRlSGFuZGxlKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihFUlJfUkVTT1VSQ0VfTUVUSE9EX1VOREVGSU5FRCk7XG4gIH1cblxuICBfZGVsZXRlSGFuZGxlKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihFUlJfUkVTT1VSQ0VfTUVUSE9EX1VOREVGSU5FRCk7XG4gIH1cblxuICBfYmluZEhhbmRsZShoYW5kbGUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoRVJSX1JFU09VUkNFX01FVEhPRF9VTkRFRklORUQpO1xuICB9XG5cbiAgX2dldE9wdHNGcm9tSGFuZGxlKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihFUlJfUkVTT1VSQ0VfTUVUSE9EX1VOREVGSU5FRCk7XG4gIH1cblxuICBfZ2V0UGFyYW1ldGVyKHBuYW1lLCBvcHRzKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKEVSUl9SRVNPVVJDRV9NRVRIT0RfVU5ERUZJTkVEKTtcbiAgfVxuXG4gIF9zZXRQYXJhbWV0ZXIocG5hbWUsIHZhbHVlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKEVSUl9SRVNPVVJDRV9NRVRIT0RfVU5ERUZJTkVEKTtcbiAgfVxuXG4gIF9jb250ZXh0KCkge1xuICAgIHRoaXMuZ2wubHVtYSA9IHRoaXMuZ2wubHVtYSB8fCB7fTtcbiAgICByZXR1cm4gdGhpcy5nbC5sdW1hO1xuICB9XG5cbiAgX2FkZFN0YXRzKCkge1xuICAgIGNvbnN0IG5hbWUgPSB0aGlzLmNvbnN0cnVjdG9yLm5hbWU7XG4gICAgY29uc3Qgc3RhdHMgPSBsdW1hU3RhdHMuZ2V0KCdSZXNvdXJjZSBDb3VudHMnKTtcbiAgICBzdGF0cy5nZXQoJ1Jlc291cmNlcyBDcmVhdGVkJykuaW5jcmVtZW50Q291bnQoKTtcbiAgICBzdGF0cy5nZXQoYCR7bmFtZX1zIENyZWF0ZWRgKS5pbmNyZW1lbnRDb3VudCgpO1xuICAgIHN0YXRzLmdldChgJHtuYW1lfXMgQWN0aXZlYCkuaW5jcmVtZW50Q291bnQoKTtcbiAgfVxuXG4gIF9yZW1vdmVTdGF0cygpIHtcbiAgICBjb25zdCBuYW1lID0gdGhpcy5jb25zdHJ1Y3Rvci5uYW1lO1xuICAgIGNvbnN0IHN0YXRzID0gbHVtYVN0YXRzLmdldCgnUmVzb3VyY2UgQ291bnRzJyk7XG4gICAgc3RhdHMuZ2V0KGAke25hbWV9cyBBY3RpdmVgKS5kZWNyZW1lbnRDb3VudCgpO1xuICB9XG5cbiAgX3RyYWNrQWxsb2NhdGVkTWVtb3J5KGJ5dGVzLCBuYW1lID0gdGhpcy5jb25zdHJ1Y3Rvci5uYW1lKSB7XG4gICAgY29uc3Qgc3RhdHMgPSBsdW1hU3RhdHMuZ2V0KCdNZW1vcnkgVXNhZ2UnKTtcbiAgICBzdGF0cy5nZXQoJ0dQVSBNZW1vcnknKS5hZGRDb3VudChieXRlcyk7XG4gICAgc3RhdHMuZ2V0KGAke25hbWV9IE1lbW9yeWApLmFkZENvdW50KGJ5dGVzKTtcbiAgICB0aGlzLmJ5dGVMZW5ndGggPSBieXRlcztcbiAgfVxuXG4gIF90cmFja0RlYWxsb2NhdGVkTWVtb3J5KG5hbWUgPSB0aGlzLmNvbnN0cnVjdG9yLm5hbWUpIHtcbiAgICBjb25zdCBzdGF0cyA9IGx1bWFTdGF0cy5nZXQoJ01lbW9yeSBVc2FnZScpO1xuICAgIHN0YXRzLmdldCgnR1BVIE1lbW9yeScpLnN1YnRyYWN0Q291bnQodGhpcy5ieXRlTGVuZ3RoKTtcbiAgICBzdGF0cy5nZXQoYCR7bmFtZX0gTWVtb3J5YCkuc3VidHJhY3RDb3VudCh0aGlzLmJ5dGVMZW5ndGgpO1xuICAgIHRoaXMuYnl0ZUxlbmd0aCA9IDA7XG4gIH1cblxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cmVzb3VyY2UuanMubWFwIiwiaW1wb3J0IHsgYXNzZXJ0V2ViR0xDb250ZXh0LCBsb2cgfSBmcm9tICdAbHVtYS5nbC9nbHRvb2xzJztcbmltcG9ydCB7IHBhcnNlR0xTTENvbXBpbGVyRXJyb3IsIGdldFNoYWRlck5hbWUgfSBmcm9tICcuLi9nbHNsLXV0aWxzJztcbmltcG9ydCB7IGFzc2VydCB9IGZyb20gJy4uL3V0aWxzL2Fzc2VydCc7XG5pbXBvcnQgeyB1aWQgfSBmcm9tICcuLi91dGlscy91dGlscyc7XG5pbXBvcnQgUmVzb3VyY2UgZnJvbSAnLi9yZXNvdXJjZSc7XG5jb25zdCBFUlJfU09VUkNFID0gJ1NoYWRlcjogR0xTTCBzb3VyY2UgY29kZSBtdXN0IGJlIGEgSmF2YVNjcmlwdCBzdHJpbmcnO1xuZXhwb3J0IGNsYXNzIFNoYWRlciBleHRlbmRzIFJlc291cmNlIHtcbiAgc3RhdGljIGdldFR5cGVOYW1lKHNoYWRlclR5cGUpIHtcbiAgICBzd2l0Y2ggKHNoYWRlclR5cGUpIHtcbiAgICAgIGNhc2UgMzU2MzM6XG4gICAgICAgIHJldHVybiAndmVydGV4LXNoYWRlcic7XG5cbiAgICAgIGNhc2UgMzU2MzI6XG4gICAgICAgIHJldHVybiAnZnJhZ21lbnQtc2hhZGVyJztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYXNzZXJ0KGZhbHNlKTtcbiAgICAgICAgcmV0dXJuICd1bmtub3duJztcbiAgICB9XG4gIH1cblxuICBjb25zdHJ1Y3RvcihnbCwgcHJvcHMpIHtcbiAgICBhc3NlcnRXZWJHTENvbnRleHQoZ2wpO1xuICAgIGFzc2VydCh0eXBlb2YgcHJvcHMuc291cmNlID09PSAnc3RyaW5nJywgRVJSX1NPVVJDRSk7XG4gICAgY29uc3QgaWQgPSBnZXRTaGFkZXJOYW1lKHByb3BzLnNvdXJjZSwgbnVsbCkgfHwgcHJvcHMuaWQgfHwgdWlkKGB1bm5hbWVkICR7U2hhZGVyLmdldFR5cGVOYW1lKHByb3BzLnNoYWRlclR5cGUpfWApO1xuICAgIHN1cGVyKGdsLCB7XG4gICAgICBpZFxuICAgIH0pO1xuICAgIHRoaXMuc2hhZGVyVHlwZSA9IHByb3BzLnNoYWRlclR5cGU7XG4gICAgdGhpcy5zb3VyY2UgPSBwcm9wcy5zb3VyY2U7XG4gICAgdGhpcy5pbml0aWFsaXplKHByb3BzKTtcbiAgfVxuXG4gIGluaXRpYWxpemUoe1xuICAgIHNvdXJjZVxuICB9KSB7XG4gICAgY29uc3Qgc2hhZGVyTmFtZSA9IGdldFNoYWRlck5hbWUoc291cmNlLCBudWxsKTtcblxuICAgIGlmIChzaGFkZXJOYW1lKSB7XG4gICAgICB0aGlzLmlkID0gdWlkKHNoYWRlck5hbWUpO1xuICAgIH1cblxuICAgIHRoaXMuX2NvbXBpbGUoc291cmNlKTtcbiAgfVxuXG4gIGdldFBhcmFtZXRlcihwbmFtZSkge1xuICAgIHJldHVybiB0aGlzLmdsLmdldFNoYWRlclBhcmFtZXRlcih0aGlzLmhhbmRsZSwgcG5hbWUpO1xuICB9XG5cbiAgdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIGAke1NoYWRlci5nZXRUeXBlTmFtZSh0aGlzLnNoYWRlclR5cGUpfToke3RoaXMuaWR9YDtcbiAgfVxuXG4gIGdldE5hbWUoKSB7XG4gICAgcmV0dXJuIGdldFNoYWRlck5hbWUodGhpcy5zb3VyY2UpIHx8ICd1bm5hbWVkLXNoYWRlcic7XG4gIH1cblxuICBnZXRTb3VyY2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2wuZ2V0U2hhZGVyU291cmNlKHRoaXMuaGFuZGxlKTtcbiAgfVxuXG4gIGdldFRyYW5zbGF0ZWRTb3VyY2UoKSB7XG4gICAgY29uc3QgZXh0ZW5zaW9uID0gdGhpcy5nbC5nZXRFeHRlbnNpb24oJ1dFQkdMX2RlYnVnX3NoYWRlcnMnKTtcbiAgICByZXR1cm4gZXh0ZW5zaW9uID8gZXh0ZW5zaW9uLmdldFRyYW5zbGF0ZWRTaGFkZXJTb3VyY2UodGhpcy5oYW5kbGUpIDogJ05vIHRyYW5zbGF0ZWQgc291cmNlIGF2YWlsYWJsZS4gV0VCR0xfZGVidWdfc2hhZGVycyBub3QgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgX2NvbXBpbGUoc291cmNlID0gdGhpcy5zb3VyY2UpIHtcbiAgICBpZiAoIXNvdXJjZS5zdGFydHNXaXRoKCcjdmVyc2lvbiAnKSkge1xuICAgICAgc291cmNlID0gYCN2ZXJzaW9uIDEwMFxcbiR7c291cmNlfWA7XG4gICAgfVxuXG4gICAgdGhpcy5zb3VyY2UgPSBzb3VyY2U7XG4gICAgdGhpcy5nbC5zaGFkZXJTb3VyY2UodGhpcy5oYW5kbGUsIHRoaXMuc291cmNlKTtcbiAgICB0aGlzLmdsLmNvbXBpbGVTaGFkZXIodGhpcy5oYW5kbGUpO1xuICAgIGNvbnN0IGNvbXBpbGVTdGF0dXMgPSB0aGlzLmdldFBhcmFtZXRlcigzNTcxMyk7XG5cbiAgICBpZiAoIWNvbXBpbGVTdGF0dXMpIHtcbiAgICAgIGNvbnN0IGluZm9Mb2cgPSB0aGlzLmdsLmdldFNoYWRlckluZm9Mb2codGhpcy5oYW5kbGUpO1xuICAgICAgY29uc3Qge1xuICAgICAgICBzaGFkZXJOYW1lLFxuICAgICAgICBlcnJvcnMsXG4gICAgICAgIHdhcm5pbmdzXG4gICAgICB9ID0gcGFyc2VHTFNMQ29tcGlsZXJFcnJvcihpbmZvTG9nLCB0aGlzLnNvdXJjZSwgdGhpcy5zaGFkZXJUeXBlLCB0aGlzLmlkKTtcbiAgICAgIGxvZy5lcnJvcihgR0xTTCBjb21waWxhdGlvbiBlcnJvcnMgaW4gJHtzaGFkZXJOYW1lfVxcbiR7ZXJyb3JzfWApKCk7XG4gICAgICBsb2cud2FybihgR0xTTCBjb21waWxhdGlvbiB3YXJuaW5ncyBpbiAke3NoYWRlck5hbWV9XFxuJHt3YXJuaW5nc31gKSgpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBHTFNMIGNvbXBpbGF0aW9uIGVycm9ycyBpbiAke3NoYWRlck5hbWV9YCk7XG4gICAgfVxuICB9XG5cbiAgX2RlbGV0ZUhhbmRsZSgpIHtcbiAgICB0aGlzLmdsLmRlbGV0ZVNoYWRlcih0aGlzLmhhbmRsZSk7XG4gIH1cblxuICBfZ2V0T3B0c0Zyb21IYW5kbGUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IHRoaXMuZ2V0UGFyYW1ldGVyKDM1NjYzKSxcbiAgICAgIHNvdXJjZTogdGhpcy5nZXRTb3VyY2UoKVxuICAgIH07XG4gIH1cblxufVxuZXhwb3J0IGNsYXNzIFZlcnRleFNoYWRlciBleHRlbmRzIFNoYWRlciB7XG4gIGNvbnN0cnVjdG9yKGdsLCBwcm9wcykge1xuICAgIGlmICh0eXBlb2YgcHJvcHMgPT09ICdzdHJpbmcnKSB7XG4gICAgICBwcm9wcyA9IHtcbiAgICAgICAgc291cmNlOiBwcm9wc1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBzdXBlcihnbCwgT2JqZWN0LmFzc2lnbih7fSwgcHJvcHMsIHtcbiAgICAgIHNoYWRlclR5cGU6IDM1NjMzXG4gICAgfSkpO1xuICB9XG5cbiAgX2NyZWF0ZUhhbmRsZSgpIHtcbiAgICByZXR1cm4gdGhpcy5nbC5jcmVhdGVTaGFkZXIoMzU2MzMpO1xuICB9XG5cbn1cbmV4cG9ydCBjbGFzcyBGcmFnbWVudFNoYWRlciBleHRlbmRzIFNoYWRlciB7XG4gIGNvbnN0cnVjdG9yKGdsLCBwcm9wcykge1xuICAgIGlmICh0eXBlb2YgcHJvcHMgPT09ICdzdHJpbmcnKSB7XG4gICAgICBwcm9wcyA9IHtcbiAgICAgICAgc291cmNlOiBwcm9wc1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBzdXBlcihnbCwgT2JqZWN0LmFzc2lnbih7fSwgcHJvcHMsIHtcbiAgICAgIHNoYWRlclR5cGU6IDM1NjMyXG4gICAgfSkpO1xuICB9XG5cbiAgX2NyZWF0ZUhhbmRsZSgpIHtcbiAgICByZXR1cm4gdGhpcy5nbC5jcmVhdGVTaGFkZXIoMzU2MzIpO1xuICB9XG5cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNoYWRlci5qcy5tYXAiLCJpbXBvcnQgeyBhc3NlcnRXZWJHTENvbnRleHQgfSBmcm9tICdAbHVtYS5nbC9nbHRvb2xzJztcbmltcG9ydCBUZXh0dXJlIGZyb20gJy4vdGV4dHVyZSc7XG5pbXBvcnQgeyBsb2FkSW1hZ2UgfSBmcm9tICcuLi91dGlscy9sb2FkLWZpbGUnO1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGV4dHVyZTJEIGV4dGVuZHMgVGV4dHVyZSB7XG4gIHN0YXRpYyBpc1N1cHBvcnRlZChnbCwgb3B0cykge1xuICAgIHJldHVybiBUZXh0dXJlLmlzU3VwcG9ydGVkKGdsLCBvcHRzKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKGdsLCBwcm9wcyA9IHt9KSB7XG4gICAgYXNzZXJ0V2ViR0xDb250ZXh0KGdsKTtcblxuICAgIGlmIChwcm9wcyBpbnN0YW5jZW9mIFByb21pc2UgfHwgdHlwZW9mIHByb3BzID09PSAnc3RyaW5nJykge1xuICAgICAgcHJvcHMgPSB7XG4gICAgICAgIGRhdGE6IHByb3BzXG4gICAgICB9O1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgcHJvcHMuZGF0YSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgcHJvcHMsIHtcbiAgICAgICAgZGF0YTogbG9hZEltYWdlKHByb3BzLmRhdGEpXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBzdXBlcihnbCwgT2JqZWN0LmFzc2lnbih7fSwgcHJvcHMsIHtcbiAgICAgIHRhcmdldDogMzU1M1xuICAgIH0pKTtcbiAgICB0aGlzLmluaXRpYWxpemUocHJvcHMpO1xuICAgIE9iamVjdC5zZWFsKHRoaXMpO1xuICB9XG5cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRleHR1cmUtMmQuanMubWFwIiwiaW1wb3J0IHsgaXNXZWJHTDIsIGFzc2VydFdlYkdMMkNvbnRleHQsIHdpdGhQYXJhbWV0ZXJzIH0gZnJvbSAnQGx1bWEuZ2wvZ2x0b29scyc7XG5pbXBvcnQgVGV4dHVyZSBmcm9tICcuL3RleHR1cmUnO1xuaW1wb3J0IHsgREFUQV9GT1JNQVRfQ0hBTk5FTFMsIFRZUEVfU0laRVMgfSBmcm9tICcuL3RleHR1cmUtZm9ybWF0cyc7XG5pbXBvcnQgQnVmZmVyIGZyb20gJy4vYnVmZmVyJztcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRleHR1cmUzRCBleHRlbmRzIFRleHR1cmUge1xuICBzdGF0aWMgaXNTdXBwb3J0ZWQoZ2wpIHtcbiAgICByZXR1cm4gaXNXZWJHTDIoZ2wpO1xuICB9XG5cbiAgY29uc3RydWN0b3IoZ2wsIHByb3BzID0ge30pIHtcbiAgICBhc3NlcnRXZWJHTDJDb250ZXh0KGdsKTtcbiAgICBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgZGVwdGg6IDFcbiAgICB9LCBwcm9wcywge1xuICAgICAgdGFyZ2V0OiAzMjg3OSxcbiAgICAgIHVucGFja0ZsaXBZOiBmYWxzZVxuICAgIH0pO1xuICAgIHN1cGVyKGdsLCBwcm9wcyk7XG4gICAgdGhpcy5pbml0aWFsaXplKHByb3BzKTtcbiAgICBPYmplY3Quc2VhbCh0aGlzKTtcbiAgfVxuXG4gIHNldEltYWdlRGF0YSh7XG4gICAgbGV2ZWwgPSAwLFxuICAgIGRhdGFGb3JtYXQgPSA2NDA4LFxuICAgIHdpZHRoLFxuICAgIGhlaWdodCxcbiAgICBkZXB0aCA9IDEsXG4gICAgYm9yZGVyID0gMCxcbiAgICBmb3JtYXQsXG4gICAgdHlwZSA9IDUxMjEsXG4gICAgb2Zmc2V0ID0gMCxcbiAgICBkYXRhLFxuICAgIHBhcmFtZXRlcnMgPSB7fVxuICB9KSB7XG4gICAgdGhpcy5fdHJhY2tEZWFsbG9jYXRlZE1lbW9yeSgnVGV4dHVyZScpO1xuXG4gICAgdGhpcy5nbC5iaW5kVGV4dHVyZSh0aGlzLnRhcmdldCwgdGhpcy5oYW5kbGUpO1xuICAgIHdpdGhQYXJhbWV0ZXJzKHRoaXMuZ2wsIHBhcmFtZXRlcnMsICgpID0+IHtcbiAgICAgIGlmIChBcnJheUJ1ZmZlci5pc1ZpZXcoZGF0YSkpIHtcbiAgICAgICAgdGhpcy5nbC50ZXhJbWFnZTNEKHRoaXMudGFyZ2V0LCBsZXZlbCwgZGF0YUZvcm1hdCwgd2lkdGgsIGhlaWdodCwgZGVwdGgsIGJvcmRlciwgZm9ybWF0LCB0eXBlLCBkYXRhKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGRhdGEgaW5zdGFuY2VvZiBCdWZmZXIpIHtcbiAgICAgICAgdGhpcy5nbC5iaW5kQnVmZmVyKDM1MDUyLCBkYXRhLmhhbmRsZSk7XG4gICAgICAgIHRoaXMuZ2wudGV4SW1hZ2UzRCh0aGlzLnRhcmdldCwgbGV2ZWwsIGRhdGFGb3JtYXQsIHdpZHRoLCBoZWlnaHQsIGRlcHRoLCBib3JkZXIsIGZvcm1hdCwgdHlwZSwgb2Zmc2V0KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChkYXRhICYmIGRhdGEuYnl0ZUxlbmd0aCkge1xuICAgICAgdGhpcy5fdHJhY2tBbGxvY2F0ZWRNZW1vcnkoZGF0YS5ieXRlTGVuZ3RoLCAnVGV4dHVyZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBjaGFubmVscyA9IERBVEFfRk9STUFUX0NIQU5ORUxTW3RoaXMuZGF0YUZvcm1hdF0gfHwgNDtcbiAgICAgIGNvbnN0IGNoYW5uZWxTaXplID0gVFlQRV9TSVpFU1t0aGlzLnR5cGVdIHx8IDE7XG5cbiAgICAgIHRoaXMuX3RyYWNrQWxsb2NhdGVkTWVtb3J5KHRoaXMud2lkdGggKiB0aGlzLmhlaWdodCAqIHRoaXMuZGVwdGggKiBjaGFubmVscyAqIGNoYW5uZWxTaXplLCAnVGV4dHVyZScpO1xuICAgIH1cblxuICAgIHRoaXMubG9hZGVkID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD10ZXh0dXJlLTNkLmpzLm1hcCIsImltcG9ydCB7IGxvZywgYXNzZXJ0V2ViR0xDb250ZXh0IH0gZnJvbSAnQGx1bWEuZ2wvZ2x0b29scyc7XG5pbXBvcnQgVGV4dHVyZSBmcm9tICcuL3RleHR1cmUnO1xuY29uc3QgRkFDRVMgPSBbMzQwNjksIDM0MDcwLCAzNDA3MSwgMzQwNzIsIDM0MDczLCAzNDA3NF07XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXh0dXJlQ3ViZSBleHRlbmRzIFRleHR1cmUge1xuICBjb25zdHJ1Y3RvcihnbCwgcHJvcHMgPSB7fSkge1xuICAgIGFzc2VydFdlYkdMQ29udGV4dChnbCk7XG4gICAgc3VwZXIoZ2wsIE9iamVjdC5hc3NpZ24oe30sIHByb3BzLCB7XG4gICAgICB0YXJnZXQ6IDM0MDY3XG4gICAgfSkpO1xuICAgIHRoaXMuaW5pdGlhbGl6ZShwcm9wcyk7XG4gICAgT2JqZWN0LnNlYWwodGhpcyk7XG4gIH1cblxuICBpbml0aWFsaXplKHByb3BzID0ge30pIHtcbiAgICBjb25zdCB7XG4gICAgICBtaXBtYXBzID0gdHJ1ZSxcbiAgICAgIHBhcmFtZXRlcnMgPSB7fVxuICAgIH0gPSBwcm9wcztcbiAgICB0aGlzLm9wdHMgPSBwcm9wcztcbiAgICB0aGlzLnNldEN1YmVNYXBJbWFnZURhdGEocHJvcHMpLnRoZW4oKCkgPT4ge1xuICAgICAgdGhpcy5sb2FkZWQgPSB0cnVlO1xuXG4gICAgICBpZiAobWlwbWFwcykge1xuICAgICAgICB0aGlzLmdlbmVyYXRlTWlwbWFwKHByb3BzKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXRQYXJhbWV0ZXJzKHBhcmFtZXRlcnMpO1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc3ViSW1hZ2Uoe1xuICAgIGZhY2UsXG4gICAgZGF0YSxcbiAgICB4ID0gMCxcbiAgICB5ID0gMCxcbiAgICBtaXBtYXBMZXZlbCA9IDBcbiAgfSkge1xuICAgIHJldHVybiB0aGlzLl9zdWJJbWFnZSh7XG4gICAgICB0YXJnZXQ6IGZhY2UsXG4gICAgICBkYXRhLFxuICAgICAgeCxcbiAgICAgIHksXG4gICAgICBtaXBtYXBMZXZlbFxuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgc2V0Q3ViZU1hcEltYWdlRGF0YSh7XG4gICAgd2lkdGgsXG4gICAgaGVpZ2h0LFxuICAgIHBpeGVscyxcbiAgICBkYXRhLFxuICAgIGJvcmRlciA9IDAsXG4gICAgZm9ybWF0ID0gNjQwOCxcbiAgICB0eXBlID0gNTEyMVxuICB9KSB7XG4gICAgY29uc3Qge1xuICAgICAgZ2xcbiAgICB9ID0gdGhpcztcbiAgICBjb25zdCBpbWFnZURhdGFNYXAgPSBwaXhlbHMgfHwgZGF0YTtcbiAgICBjb25zdCByZXNvbHZlZEZhY2VzID0gYXdhaXQgUHJvbWlzZS5hbGwoRkFDRVMubWFwKGZhY2UgPT4ge1xuICAgICAgY29uc3QgZmFjZVBpeGVscyA9IGltYWdlRGF0YU1hcFtmYWNlXTtcbiAgICAgIHJldHVybiBQcm9taXNlLmFsbChBcnJheS5pc0FycmF5KGZhY2VQaXhlbHMpID8gZmFjZVBpeGVscyA6IFtmYWNlUGl4ZWxzXSk7XG4gICAgfSkpO1xuICAgIHRoaXMuYmluZCgpO1xuICAgIEZBQ0VTLmZvckVhY2goKGZhY2UsIGluZGV4KSA9PiB7XG4gICAgICBpZiAocmVzb2x2ZWRGYWNlc1tpbmRleF0ubGVuZ3RoID4gMSAmJiB0aGlzLm9wdHMubWlwbWFwcyAhPT0gZmFsc2UpIHtcbiAgICAgICAgbG9nLndhcm4oYCR7dGhpcy5pZH0gaGFzIG1pcG1hcCBhbmQgbXVsdGlwbGUgTE9Ecy5gKSgpO1xuICAgICAgfVxuXG4gICAgICByZXNvbHZlZEZhY2VzW2luZGV4XS5mb3JFYWNoKChpbWFnZSwgbG9kTGV2ZWwpID0+IHtcbiAgICAgICAgaWYgKHdpZHRoICYmIGhlaWdodCkge1xuICAgICAgICAgIGdsLnRleEltYWdlMkQoZmFjZSwgbG9kTGV2ZWwsIGZvcm1hdCwgd2lkdGgsIGhlaWdodCwgYm9yZGVyLCBmb3JtYXQsIHR5cGUsIGltYWdlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBnbC50ZXhJbWFnZTJEKGZhY2UsIGxvZExldmVsLCBmb3JtYXQsIGZvcm1hdCwgdHlwZSwgaW1hZ2UpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICB0aGlzLnVuYmluZCgpO1xuICB9XG5cbiAgc2V0SW1hZ2VEYXRhRm9yRmFjZShvcHRpb25zKSB7XG4gICAgY29uc3Qge1xuICAgICAgZmFjZSxcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgcGl4ZWxzLFxuICAgICAgZGF0YSxcbiAgICAgIGJvcmRlciA9IDAsXG4gICAgICBmb3JtYXQgPSA2NDA4LFxuICAgICAgdHlwZSA9IDUxMjFcbiAgICB9ID0gb3B0aW9ucztcbiAgICBjb25zdCB7XG4gICAgICBnbFxuICAgIH0gPSB0aGlzO1xuICAgIGNvbnN0IGltYWdlRGF0YSA9IHBpeGVscyB8fCBkYXRhO1xuICAgIHRoaXMuYmluZCgpO1xuXG4gICAgaWYgKGltYWdlRGF0YSBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgIGltYWdlRGF0YS50aGVuKHJlc29sdmVkSW1hZ2VEYXRhID0+IHRoaXMuc2V0SW1hZ2VEYXRhRm9yRmFjZShPYmplY3QuYXNzaWduKHt9LCBvcHRpb25zLCB7XG4gICAgICAgIGZhY2UsXG4gICAgICAgIGRhdGE6IHJlc29sdmVkSW1hZ2VEYXRhLFxuICAgICAgICBwaXhlbHM6IHJlc29sdmVkSW1hZ2VEYXRhXG4gICAgICB9KSkpO1xuICAgIH0gZWxzZSBpZiAodGhpcy53aWR0aCB8fCB0aGlzLmhlaWdodCkge1xuICAgICAgZ2wudGV4SW1hZ2UyRChmYWNlLCAwLCBmb3JtYXQsIHdpZHRoLCBoZWlnaHQsIGJvcmRlciwgZm9ybWF0LCB0eXBlLCBpbWFnZURhdGEpO1xuICAgIH0gZWxzZSB7XG4gICAgICBnbC50ZXhJbWFnZTJEKGZhY2UsIDAsIGZvcm1hdCwgZm9ybWF0LCB0eXBlLCBpbWFnZURhdGEpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbn1cblRleHR1cmVDdWJlLkZBQ0VTID0gRkFDRVM7XG4vLyMgc291cmNlTWFwcGluZ1VSTD10ZXh0dXJlLWN1YmUuanMubWFwIiwiaW1wb3J0IHsgaXNXZWJHTDIgfSBmcm9tICdAbHVtYS5nbC9nbHRvb2xzJztcbmV4cG9ydCBjb25zdCBURVhUVVJFX0ZPUk1BVFMgPSB7XG4gIFs2NDA3XToge1xuICAgIGRhdGFGb3JtYXQ6IDY0MDcsXG4gICAgdHlwZXM6IFs1MTIxLCAzMzYzNV1cbiAgfSxcbiAgWzY0MDhdOiB7XG4gICAgZGF0YUZvcm1hdDogNjQwOCxcbiAgICB0eXBlczogWzUxMjEsIDMyODE5LCAzMjgyMF1cbiAgfSxcbiAgWzY0MDZdOiB7XG4gICAgZGF0YUZvcm1hdDogNjQwNixcbiAgICB0eXBlczogWzUxMjFdXG4gIH0sXG4gIFs2NDA5XToge1xuICAgIGRhdGFGb3JtYXQ6IDY0MDksXG4gICAgdHlwZXM6IFs1MTIxXVxuICB9LFxuICBbNjQxMF06IHtcbiAgICBkYXRhRm9ybWF0OiA2NDEwLFxuICAgIHR5cGVzOiBbNTEyMV1cbiAgfSxcbiAgWzMzMzI2XToge1xuICAgIGRhdGFGb3JtYXQ6IDY0MDMsXG4gICAgdHlwZXM6IFs1MTI2XSxcbiAgICBnbDI6IHRydWVcbiAgfSxcbiAgWzMzMzI4XToge1xuICAgIGRhdGFGb3JtYXQ6IDMzMzE5LFxuICAgIHR5cGVzOiBbNTEyNl0sXG4gICAgZ2wyOiB0cnVlXG4gIH0sXG4gIFszNDgzN106IHtcbiAgICBkYXRhRm9ybWF0OiA2NDA3LFxuICAgIHR5cGVzOiBbNTEyNl0sXG4gICAgZ2wyOiB0cnVlXG4gIH0sXG4gIFszNDgzNl06IHtcbiAgICBkYXRhRm9ybWF0OiA2NDA4LFxuICAgIHR5cGVzOiBbNTEyNl0sXG4gICAgZ2wyOiB0cnVlXG4gIH1cbn07XG5leHBvcnQgY29uc3QgREFUQV9GT1JNQVRfQ0hBTk5FTFMgPSB7XG4gIFs2NDAzXTogMSxcbiAgWzM2MjQ0XTogMSxcbiAgWzMzMzE5XTogMixcbiAgWzMzMzIwXTogMixcbiAgWzY0MDddOiAzLFxuICBbMzYyNDhdOiAzLFxuICBbNjQwOF06IDQsXG4gIFszNjI0OV06IDQsXG4gIFs2NDAyXTogMSxcbiAgWzM0MDQxXTogMSxcbiAgWzY0MDZdOiAxLFxuICBbNjQwOV06IDEsXG4gIFs2NDEwXTogMlxufTtcbmV4cG9ydCBjb25zdCBUWVBFX1NJWkVTID0ge1xuICBbNTEyNl06IDQsXG4gIFs1MTI1XTogNCxcbiAgWzUxMjRdOiA0LFxuICBbNTEyM106IDIsXG4gIFs1MTIyXTogMixcbiAgWzUxMzFdOiAyLFxuICBbNTEyMF06IDEsXG4gIFs1MTIxXTogMVxufTtcbmV4cG9ydCBmdW5jdGlvbiBpc0Zvcm1hdFN1cHBvcnRlZChnbCwgZm9ybWF0KSB7XG4gIGNvbnN0IGluZm8gPSBURVhUVVJFX0ZPUk1BVFNbZm9ybWF0XTtcblxuICBpZiAoIWluZm8pIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoaW5mby5nbDEgPT09IHVuZGVmaW5lZCAmJiBpbmZvLmdsMiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBjb25zdCB2YWx1ZSA9IGlzV2ViR0wyKGdsKSA/IGluZm8uZ2wyIHx8IGluZm8uZ2wxIDogaW5mby5nbDE7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnID8gZ2wuZ2V0RXh0ZW5zaW9uKHZhbHVlKSA6IHZhbHVlO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzTGluZWFyRmlsdGVyaW5nU3VwcG9ydGVkKGdsLCBmb3JtYXQpIHtcbiAgY29uc3QgaW5mbyA9IFRFWFRVUkVfRk9STUFUU1tmb3JtYXRdO1xuXG4gIHN3aXRjaCAoaW5mbyAmJiBpbmZvLnR5cGVzWzBdKSB7XG4gICAgY2FzZSA1MTI2OlxuICAgICAgcmV0dXJuIGdsLmdldEV4dGVuc2lvbignT0VTX3RleHR1cmVfZmxvYXRfbGluZWFyJyk7XG5cbiAgICBjYXNlIDUxMzE6XG4gICAgICByZXR1cm4gZ2wuZ2V0RXh0ZW5zaW9uKCdPRVNfdGV4dHVyZV9oYWxmX2Zsb2F0X2xpbmVhcicpO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB0cnVlO1xuICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD10ZXh0dXJlLWZvcm1hdHMuanMubWFwIiwiaW1wb3J0IHsgaXNXZWJHTDIsIGFzc2VydFdlYkdMMkNvbnRleHQsIHdpdGhQYXJhbWV0ZXJzLCBsb2cgfSBmcm9tICdAbHVtYS5nbC9nbHRvb2xzJztcbmltcG9ydCB7IGdsb2JhbCB9IGZyb20gJ3Byb2JlLmdsL2Vudic7XG5pbXBvcnQgUmVzb3VyY2UgZnJvbSAnLi9yZXNvdXJjZSc7XG5pbXBvcnQgQnVmZmVyIGZyb20gJy4vYnVmZmVyJztcbmltcG9ydCB7IFRFWFRVUkVfRk9STUFUUywgREFUQV9GT1JNQVRfQ0hBTk5FTFMsIFRZUEVfU0laRVMsIGlzRm9ybWF0U3VwcG9ydGVkLCBpc0xpbmVhckZpbHRlcmluZ1N1cHBvcnRlZCB9IGZyb20gJy4vdGV4dHVyZS1mb3JtYXRzJztcbmltcG9ydCB7IGFzc2VydCB9IGZyb20gJy4uL3V0aWxzL2Fzc2VydCc7XG5pbXBvcnQgeyB1aWQsIGlzUG93ZXJPZlR3byB9IGZyb20gJy4uL3V0aWxzL3V0aWxzJztcbmNvbnN0IE5QT1RfTUlOX0ZJTFRFUlMgPSBbOTcyOSwgOTcyOF07XG5cbmNvbnN0IFdlYkdMQnVmZmVyID0gZ2xvYmFsLldlYkdMQnVmZmVyIHx8IGZ1bmN0aW9uIFdlYkdMQnVmZmVyKCkge307XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRleHR1cmUgZXh0ZW5kcyBSZXNvdXJjZSB7XG4gIHN0YXRpYyBpc1N1cHBvcnRlZChnbCwgb3B0cyA9IHt9KSB7XG4gICAgY29uc3Qge1xuICAgICAgZm9ybWF0LFxuICAgICAgbGluZWFyRmlsdGVyaW5nXG4gICAgfSA9IG9wdHM7XG4gICAgbGV0IHN1cHBvcnRlZCA9IHRydWU7XG5cbiAgICBpZiAoZm9ybWF0KSB7XG4gICAgICBzdXBwb3J0ZWQgPSBzdXBwb3J0ZWQgJiYgaXNGb3JtYXRTdXBwb3J0ZWQoZ2wsIGZvcm1hdCk7XG4gICAgICBzdXBwb3J0ZWQgPSBzdXBwb3J0ZWQgJiYgKCFsaW5lYXJGaWx0ZXJpbmcgfHwgaXNMaW5lYXJGaWx0ZXJpbmdTdXBwb3J0ZWQoZ2wsIGZvcm1hdCkpO1xuICAgIH1cblxuICAgIHJldHVybiBzdXBwb3J0ZWQ7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihnbCwgcHJvcHMpIHtcbiAgICBjb25zdCB7XG4gICAgICBpZCA9IHVpZCgndGV4dHVyZScpLFxuICAgICAgaGFuZGxlLFxuICAgICAgdGFyZ2V0XG4gICAgfSA9IHByb3BzO1xuICAgIHN1cGVyKGdsLCB7XG4gICAgICBpZCxcbiAgICAgIGhhbmRsZVxuICAgIH0pO1xuICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xuICAgIHRoaXMudGV4dHVyZVVuaXQgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5sb2FkZWQgPSBmYWxzZTtcbiAgICB0aGlzLndpZHRoID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuaGVpZ2h0ID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuZGVwdGggPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5mb3JtYXQgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy50eXBlID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuZGF0YUZvcm1hdCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmJvcmRlciA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnRleHR1cmVVbml0ID0gdW5kZWZpbmVkO1xuICAgIHRoaXMubWlwbWFwcyA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiBgVGV4dHVyZSgke3RoaXMuaWR9LCR7dGhpcy53aWR0aH14JHt0aGlzLmhlaWdodH0pYDtcbiAgfVxuXG4gIGluaXRpYWxpemUocHJvcHMgPSB7fSkge1xuICAgIGxldCBkYXRhID0gcHJvcHMuZGF0YTtcblxuICAgIGlmIChkYXRhIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgZGF0YS50aGVuKHJlc29sdmVkSW1hZ2VEYXRhID0+IHRoaXMuaW5pdGlhbGl6ZShPYmplY3QuYXNzaWduKHt9LCBwcm9wcywge1xuICAgICAgICBwaXhlbHM6IHJlc29sdmVkSW1hZ2VEYXRhLFxuICAgICAgICBkYXRhOiByZXNvbHZlZEltYWdlRGF0YVxuICAgICAgfSkpKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvbnN0IGlzVmlkZW8gPSB0eXBlb2YgSFRNTFZpZGVvRWxlbWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgZGF0YSBpbnN0YW5jZW9mIEhUTUxWaWRlb0VsZW1lbnQ7XG5cbiAgICBpZiAoaXNWaWRlbyAmJiBkYXRhLnJlYWR5U3RhdGUgPCBIVE1MVmlkZW9FbGVtZW50LkhBVkVfTUVUQURBVEEpIHtcbiAgICAgIHRoaXMuX3ZpZGVvID0gbnVsbDtcbiAgICAgIGRhdGEuYWRkRXZlbnRMaXN0ZW5lcignbG9hZGVkZGF0YScsICgpID0+IHRoaXMuaW5pdGlhbGl6ZShwcm9wcykpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY29uc3Qge1xuICAgICAgcGl4ZWxzID0gbnVsbCxcbiAgICAgIGZvcm1hdCA9IDY0MDgsXG4gICAgICBib3JkZXIgPSAwLFxuICAgICAgcmVjcmVhdGUgPSBmYWxzZSxcbiAgICAgIHBhcmFtZXRlcnMgPSB7fSxcbiAgICAgIHBpeGVsU3RvcmUgPSB7fSxcbiAgICAgIHRleHR1cmVVbml0ID0gdW5kZWZpbmVkXG4gICAgfSA9IHByb3BzO1xuXG4gICAgaWYgKCFkYXRhKSB7XG4gICAgICBkYXRhID0gcGl4ZWxzO1xuICAgIH1cblxuICAgIGxldCB7XG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodCxcbiAgICAgIGRhdGFGb3JtYXQsXG4gICAgICB0eXBlLFxuICAgICAgY29tcHJlc3NlZCA9IGZhbHNlLFxuICAgICAgbWlwbWFwcyA9IHRydWVcbiAgICB9ID0gcHJvcHM7XG4gICAgY29uc3Qge1xuICAgICAgZGVwdGggPSAwXG4gICAgfSA9IHByb3BzO1xuICAgICh7XG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodCxcbiAgICAgIGNvbXByZXNzZWQsXG4gICAgICBkYXRhRm9ybWF0LFxuICAgICAgdHlwZVxuICAgIH0gPSB0aGlzLl9kZWR1Y2VQYXJhbWV0ZXJzKHtcbiAgICAgIGZvcm1hdCxcbiAgICAgIHR5cGUsXG4gICAgICBkYXRhRm9ybWF0LFxuICAgICAgY29tcHJlc3NlZCxcbiAgICAgIGRhdGEsXG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodFxuICAgIH0pKTtcbiAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgdGhpcy5kZXB0aCA9IGRlcHRoO1xuICAgIHRoaXMuZm9ybWF0ID0gZm9ybWF0O1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgdGhpcy5kYXRhRm9ybWF0ID0gZGF0YUZvcm1hdDtcbiAgICB0aGlzLmJvcmRlciA9IGJvcmRlcjtcbiAgICB0aGlzLnRleHR1cmVVbml0ID0gdGV4dHVyZVVuaXQ7XG5cbiAgICBpZiAoTnVtYmVyLmlzRmluaXRlKHRoaXMudGV4dHVyZVVuaXQpKSB7XG4gICAgICB0aGlzLmdsLmFjdGl2ZVRleHR1cmUoMzM5ODQgKyB0aGlzLnRleHR1cmVVbml0KTtcbiAgICAgIHRoaXMuZ2wuYmluZFRleHR1cmUodGhpcy50YXJnZXQsIHRoaXMuaGFuZGxlKTtcbiAgICB9XG5cbiAgICBpZiAobWlwbWFwcyAmJiB0aGlzLl9pc05QT1QoKSkge1xuICAgICAgbG9nLndhcm4oYHRleHR1cmU6ICR7dGhpc30gaXMgTm9uLVBvd2VyLU9mLVR3bywgZGlzYWJsaW5nIG1pcG1hcGluZ2ApKCk7XG4gICAgICBtaXBtYXBzID0gZmFsc2U7XG5cbiAgICAgIHRoaXMuX3VwZGF0ZUZvck5QT1QocGFyYW1ldGVycyk7XG4gICAgfVxuXG4gICAgdGhpcy5taXBtYXBzID0gbWlwbWFwcztcbiAgICB0aGlzLnNldEltYWdlRGF0YSh7XG4gICAgICBkYXRhLFxuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICBkZXB0aCxcbiAgICAgIGZvcm1hdCxcbiAgICAgIHR5cGUsXG4gICAgICBkYXRhRm9ybWF0LFxuICAgICAgYm9yZGVyLFxuICAgICAgbWlwbWFwcyxcbiAgICAgIHBhcmFtZXRlcnM6IHBpeGVsU3RvcmUsXG4gICAgICBjb21wcmVzc2VkXG4gICAgfSk7XG5cbiAgICBpZiAobWlwbWFwcykge1xuICAgICAgdGhpcy5nZW5lcmF0ZU1pcG1hcCgpO1xuICAgIH1cblxuICAgIHRoaXMuc2V0UGFyYW1ldGVycyhwYXJhbWV0ZXJzKTtcblxuICAgIGlmIChyZWNyZWF0ZSkge1xuICAgICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICB9XG5cbiAgICBpZiAoaXNWaWRlbykge1xuICAgICAgdGhpcy5fdmlkZW8gPSB7XG4gICAgICAgIHZpZGVvOiBkYXRhLFxuICAgICAgICBwYXJhbWV0ZXJzLFxuICAgICAgICBsYXN0VGltZTogZGF0YS5yZWFkeVN0YXRlID49IEhUTUxWaWRlb0VsZW1lbnQuSEFWRV9DVVJSRU5UX0RBVEEgPyBkYXRhLmN1cnJlbnRUaW1lIDogLTFcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB1cGRhdGUoKSB7XG4gICAgaWYgKHRoaXMuX3ZpZGVvKSB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIHZpZGVvLFxuICAgICAgICBwYXJhbWV0ZXJzLFxuICAgICAgICBsYXN0VGltZVxuICAgICAgfSA9IHRoaXMuX3ZpZGVvO1xuXG4gICAgICBpZiAobGFzdFRpbWUgPT09IHZpZGVvLmN1cnJlbnRUaW1lIHx8IHZpZGVvLnJlYWR5U3RhdGUgPCBIVE1MVmlkZW9FbGVtZW50LkhBVkVfQ1VSUkVOVF9EQVRBKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXRTdWJJbWFnZURhdGEoe1xuICAgICAgICBkYXRhOiB2aWRlbyxcbiAgICAgICAgcGFyYW1ldGVyc1xuICAgICAgfSk7XG5cbiAgICAgIGlmICh0aGlzLm1pcG1hcHMpIHtcbiAgICAgICAgdGhpcy5nZW5lcmF0ZU1pcG1hcCgpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl92aWRlby5sYXN0VGltZSA9IHZpZGVvLmN1cnJlbnRUaW1lO1xuICAgIH1cbiAgfVxuXG4gIHJlc2l6ZSh7XG4gICAgaGVpZ2h0LFxuICAgIHdpZHRoLFxuICAgIG1pcG1hcHMgPSBmYWxzZVxuICB9KSB7XG4gICAgaWYgKHdpZHRoICE9PSB0aGlzLndpZHRoIHx8IGhlaWdodCAhPT0gdGhpcy5oZWlnaHQpIHtcbiAgICAgIHJldHVybiB0aGlzLmluaXRpYWxpemUoe1xuICAgICAgICB3aWR0aCxcbiAgICAgICAgaGVpZ2h0LFxuICAgICAgICBmb3JtYXQ6IHRoaXMuZm9ybWF0LFxuICAgICAgICB0eXBlOiB0aGlzLnR5cGUsXG4gICAgICAgIGRhdGFGb3JtYXQ6IHRoaXMuZGF0YUZvcm1hdCxcbiAgICAgICAgYm9yZGVyOiB0aGlzLmJvcmRlcixcbiAgICAgICAgbWlwbWFwc1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBnZW5lcmF0ZU1pcG1hcChwYXJhbXMgPSB7fSkge1xuICAgIGlmICh0aGlzLl9pc05QT1QoKSkge1xuICAgICAgbG9nLndhcm4oYHRleHR1cmU6ICR7dGhpc30gaXMgTm9uLVBvd2VyLU9mLVR3bywgZGlzYWJsaW5nIG1pcG1hcGluZ2ApKCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0aGlzLm1pcG1hcHMgPSB0cnVlO1xuICAgIHRoaXMuZ2wuYmluZFRleHR1cmUodGhpcy50YXJnZXQsIHRoaXMuaGFuZGxlKTtcbiAgICB3aXRoUGFyYW1ldGVycyh0aGlzLmdsLCBwYXJhbXMsICgpID0+IHtcbiAgICAgIHRoaXMuZ2wuZ2VuZXJhdGVNaXBtYXAodGhpcy50YXJnZXQpO1xuICAgIH0pO1xuICAgIHRoaXMuZ2wuYmluZFRleHR1cmUodGhpcy50YXJnZXQsIG51bGwpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc2V0SW1hZ2VEYXRhKG9wdGlvbnMpIHtcbiAgICB0aGlzLl90cmFja0RlYWxsb2NhdGVkTWVtb3J5KCdUZXh0dXJlJyk7XG5cbiAgICBjb25zdCB7XG4gICAgICB0YXJnZXQgPSB0aGlzLnRhcmdldCxcbiAgICAgIHBpeGVscyA9IG51bGwsXG4gICAgICBsZXZlbCA9IDAsXG4gICAgICBmb3JtYXQgPSB0aGlzLmZvcm1hdCxcbiAgICAgIGJvcmRlciA9IHRoaXMuYm9yZGVyLFxuICAgICAgb2Zmc2V0ID0gMCxcbiAgICAgIHBhcmFtZXRlcnMgPSB7fVxuICAgIH0gPSBvcHRpb25zO1xuICAgIGxldCB7XG4gICAgICBkYXRhID0gbnVsbCxcbiAgICAgIHR5cGUgPSB0aGlzLnR5cGUsXG4gICAgICB3aWR0aCA9IHRoaXMud2lkdGgsXG4gICAgICBoZWlnaHQgPSB0aGlzLmhlaWdodCxcbiAgICAgIGRhdGFGb3JtYXQgPSB0aGlzLmRhdGFGb3JtYXQsXG4gICAgICBjb21wcmVzc2VkID0gZmFsc2VcbiAgICB9ID0gb3B0aW9ucztcblxuICAgIGlmICghZGF0YSkge1xuICAgICAgZGF0YSA9IHBpeGVscztcbiAgICB9XG5cbiAgICAoe1xuICAgICAgdHlwZSxcbiAgICAgIGRhdGFGb3JtYXQsXG4gICAgICBjb21wcmVzc2VkLFxuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHRcbiAgICB9ID0gdGhpcy5fZGVkdWNlUGFyYW1ldGVycyh7XG4gICAgICBmb3JtYXQsXG4gICAgICB0eXBlLFxuICAgICAgZGF0YUZvcm1hdCxcbiAgICAgIGNvbXByZXNzZWQsXG4gICAgICBkYXRhLFxuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHRcbiAgICB9KSk7XG4gICAgY29uc3Qge1xuICAgICAgZ2xcbiAgICB9ID0gdGhpcztcbiAgICBnbC5iaW5kVGV4dHVyZSh0aGlzLnRhcmdldCwgdGhpcy5oYW5kbGUpO1xuICAgIGxldCBkYXRhVHlwZSA9IG51bGw7XG4gICAgKHtcbiAgICAgIGRhdGEsXG4gICAgICBkYXRhVHlwZVxuICAgIH0gPSB0aGlzLl9nZXREYXRhVHlwZSh7XG4gICAgICBkYXRhLFxuICAgICAgY29tcHJlc3NlZFxuICAgIH0pKTtcbiAgICBsZXQgZ2wyO1xuICAgIHdpdGhQYXJhbWV0ZXJzKHRoaXMuZ2wsIHBhcmFtZXRlcnMsICgpID0+IHtcbiAgICAgIHN3aXRjaCAoZGF0YVR5cGUpIHtcbiAgICAgICAgY2FzZSAnbnVsbCc6XG4gICAgICAgICAgZ2wudGV4SW1hZ2UyRCh0YXJnZXQsIGxldmVsLCBmb3JtYXQsIHdpZHRoLCBoZWlnaHQsIGJvcmRlciwgZGF0YUZvcm1hdCwgdHlwZSwgZGF0YSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAndHlwZWQtYXJyYXknOlxuICAgICAgICAgIGdsLnRleEltYWdlMkQodGFyZ2V0LCBsZXZlbCwgZm9ybWF0LCB3aWR0aCwgaGVpZ2h0LCBib3JkZXIsIGRhdGFGb3JtYXQsIHR5cGUsIGRhdGEsIG9mZnNldCk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnYnVmZmVyJzpcbiAgICAgICAgICBnbDIgPSBhc3NlcnRXZWJHTDJDb250ZXh0KGdsKTtcbiAgICAgICAgICBnbDIuYmluZEJ1ZmZlcigzNTA1MiwgZGF0YS5oYW5kbGUgfHwgZGF0YSk7XG4gICAgICAgICAgZ2wyLnRleEltYWdlMkQodGFyZ2V0LCBsZXZlbCwgZm9ybWF0LCB3aWR0aCwgaGVpZ2h0LCBib3JkZXIsIGRhdGFGb3JtYXQsIHR5cGUsIG9mZnNldCk7XG4gICAgICAgICAgZ2wyLmJpbmRCdWZmZXIoMzUwNTIsIG51bGwpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ2Jyb3dzZXItb2JqZWN0JzpcbiAgICAgICAgICBpZiAoaXNXZWJHTDIoZ2wpKSB7XG4gICAgICAgICAgICBnbC50ZXhJbWFnZTJEKHRhcmdldCwgbGV2ZWwsIGZvcm1hdCwgd2lkdGgsIGhlaWdodCwgYm9yZGVyLCBkYXRhRm9ybWF0LCB0eXBlLCBkYXRhKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZ2wudGV4SW1hZ2UyRCh0YXJnZXQsIGxldmVsLCBmb3JtYXQsIGRhdGFGb3JtYXQsIHR5cGUsIGRhdGEpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ2NvbXByZXNzZWQnOlxuICAgICAgICAgIGZvciAoY29uc3QgW2xldmVsSW5kZXgsIGxldmVsRGF0YV0gb2YgZGF0YS5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgIGdsLmNvbXByZXNzZWRUZXhJbWFnZTJEKHRhcmdldCwgbGV2ZWxJbmRleCwgbGV2ZWxEYXRhLmZvcm1hdCwgbGV2ZWxEYXRhLndpZHRoLCBsZXZlbERhdGEuaGVpZ2h0LCBib3JkZXIsIGxldmVsRGF0YS5kYXRhKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGFzc2VydChmYWxzZSwgJ1Vua25vd24gaW1hZ2UgZGF0YSB0eXBlJyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoZGF0YSAmJiBkYXRhLmJ5dGVMZW5ndGgpIHtcbiAgICAgIHRoaXMuX3RyYWNrQWxsb2NhdGVkTWVtb3J5KGRhdGEuYnl0ZUxlbmd0aCwgJ1RleHR1cmUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgY2hhbm5lbHMgPSBEQVRBX0ZPUk1BVF9DSEFOTkVMU1t0aGlzLmRhdGFGb3JtYXRdIHx8IDQ7XG4gICAgICBjb25zdCBjaGFubmVsU2l6ZSA9IFRZUEVfU0laRVNbdGhpcy50eXBlXSB8fCAxO1xuXG4gICAgICB0aGlzLl90cmFja0FsbG9jYXRlZE1lbW9yeSh0aGlzLndpZHRoICogdGhpcy5oZWlnaHQgKiBjaGFubmVscyAqIGNoYW5uZWxTaXplLCAnVGV4dHVyZScpO1xuICAgIH1cblxuICAgIHRoaXMubG9hZGVkID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHNldFN1YkltYWdlRGF0YSh7XG4gICAgdGFyZ2V0ID0gdGhpcy50YXJnZXQsXG4gICAgcGl4ZWxzID0gbnVsbCxcbiAgICBkYXRhID0gbnVsbCxcbiAgICB4ID0gMCxcbiAgICB5ID0gMCxcbiAgICB3aWR0aCA9IHRoaXMud2lkdGgsXG4gICAgaGVpZ2h0ID0gdGhpcy5oZWlnaHQsXG4gICAgbGV2ZWwgPSAwLFxuICAgIGZvcm1hdCA9IHRoaXMuZm9ybWF0LFxuICAgIHR5cGUgPSB0aGlzLnR5cGUsXG4gICAgZGF0YUZvcm1hdCA9IHRoaXMuZGF0YUZvcm1hdCxcbiAgICBjb21wcmVzc2VkID0gZmFsc2UsXG4gICAgb2Zmc2V0ID0gMCxcbiAgICBib3JkZXIgPSB0aGlzLmJvcmRlcixcbiAgICBwYXJhbWV0ZXJzID0ge31cbiAgfSkge1xuICAgICh7XG4gICAgICB0eXBlLFxuICAgICAgZGF0YUZvcm1hdCxcbiAgICAgIGNvbXByZXNzZWQsXG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodFxuICAgIH0gPSB0aGlzLl9kZWR1Y2VQYXJhbWV0ZXJzKHtcbiAgICAgIGZvcm1hdCxcbiAgICAgIHR5cGUsXG4gICAgICBkYXRhRm9ybWF0LFxuICAgICAgY29tcHJlc3NlZCxcbiAgICAgIGRhdGEsXG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodFxuICAgIH0pKTtcbiAgICBhc3NlcnQodGhpcy5kZXB0aCA9PT0gMCwgJ3RleFN1YkltYWdlIG5vdCBzdXBwb3J0ZWQgZm9yIDNEIHRleHR1cmVzJyk7XG5cbiAgICBpZiAoIWRhdGEpIHtcbiAgICAgIGRhdGEgPSBwaXhlbHM7XG4gICAgfVxuXG4gICAgaWYgKGRhdGEgJiYgZGF0YS5kYXRhKSB7XG4gICAgICBjb25zdCBuZGFycmF5ID0gZGF0YTtcbiAgICAgIGRhdGEgPSBuZGFycmF5LmRhdGE7XG4gICAgICB3aWR0aCA9IG5kYXJyYXkuc2hhcGVbMF07XG4gICAgICBoZWlnaHQgPSBuZGFycmF5LnNoYXBlWzFdO1xuICAgIH1cblxuICAgIGlmIChkYXRhIGluc3RhbmNlb2YgQnVmZmVyKSB7XG4gICAgICBkYXRhID0gZGF0YS5oYW5kbGU7XG4gICAgfVxuXG4gICAgdGhpcy5nbC5iaW5kVGV4dHVyZSh0aGlzLnRhcmdldCwgdGhpcy5oYW5kbGUpO1xuICAgIHdpdGhQYXJhbWV0ZXJzKHRoaXMuZ2wsIHBhcmFtZXRlcnMsICgpID0+IHtcbiAgICAgIGlmIChjb21wcmVzc2VkKSB7XG4gICAgICAgIHRoaXMuZ2wuY29tcHJlc3NlZFRleFN1YkltYWdlMkQodGFyZ2V0LCBsZXZlbCwgeCwgeSwgd2lkdGgsIGhlaWdodCwgZm9ybWF0LCBkYXRhKTtcbiAgICAgIH0gZWxzZSBpZiAoZGF0YSA9PT0gbnVsbCkge1xuICAgICAgICB0aGlzLmdsLnRleFN1YkltYWdlMkQodGFyZ2V0LCBsZXZlbCwgeCwgeSwgd2lkdGgsIGhlaWdodCwgZGF0YUZvcm1hdCwgdHlwZSwgbnVsbCk7XG4gICAgICB9IGVsc2UgaWYgKEFycmF5QnVmZmVyLmlzVmlldyhkYXRhKSkge1xuICAgICAgICB0aGlzLmdsLnRleFN1YkltYWdlMkQodGFyZ2V0LCBsZXZlbCwgeCwgeSwgd2lkdGgsIGhlaWdodCwgZGF0YUZvcm1hdCwgdHlwZSwgZGF0YSwgb2Zmc2V0KTtcbiAgICAgIH0gZWxzZSBpZiAoZGF0YSBpbnN0YW5jZW9mIFdlYkdMQnVmZmVyKSB7XG4gICAgICAgIGNvbnN0IGdsMiA9IGFzc2VydFdlYkdMMkNvbnRleHQodGhpcy5nbCk7XG4gICAgICAgIGdsMi5iaW5kQnVmZmVyKDM1MDUyLCBkYXRhKTtcbiAgICAgICAgZ2wyLnRleFN1YkltYWdlMkQodGFyZ2V0LCBsZXZlbCwgeCwgeSwgd2lkdGgsIGhlaWdodCwgZGF0YUZvcm1hdCwgdHlwZSwgb2Zmc2V0KTtcbiAgICAgICAgZ2wyLmJpbmRCdWZmZXIoMzUwNTIsIG51bGwpO1xuICAgICAgfSBlbHNlIGlmIChpc1dlYkdMMih0aGlzLmdsKSkge1xuICAgICAgICBjb25zdCBnbDIgPSBhc3NlcnRXZWJHTDJDb250ZXh0KHRoaXMuZ2wpO1xuICAgICAgICBnbDIudGV4U3ViSW1hZ2UyRCh0YXJnZXQsIGxldmVsLCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCBkYXRhRm9ybWF0LCB0eXBlLCBkYXRhKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZ2wudGV4U3ViSW1hZ2UyRCh0YXJnZXQsIGxldmVsLCB4LCB5LCBkYXRhRm9ybWF0LCB0eXBlLCBkYXRhKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLmdsLmJpbmRUZXh0dXJlKHRoaXMudGFyZ2V0LCBudWxsKTtcbiAgfVxuXG4gIGNvcHlGcmFtZWJ1ZmZlcihvcHRzID0ge30pIHtcbiAgICBsb2cuZXJyb3IoJ1RleHR1cmUuY29weUZyYW1lYnVmZmVyKHsuLi59KSBpcyBubyBsb2duZXIgc3VwcG9ydGVkLCB1c2UgY29weVRvVGV4dHVyZShzb3VyY2UsIHRhcmdldCwgb3B0c30pJykoKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGdldEFjdGl2ZVVuaXQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2wuZ2V0UGFyYW1ldGVyKDM0MDE2KSAtIDMzOTg0O1xuICB9XG5cbiAgYmluZCh0ZXh0dXJlVW5pdCA9IHRoaXMudGV4dHVyZVVuaXQpIHtcbiAgICBjb25zdCB7XG4gICAgICBnbFxuICAgIH0gPSB0aGlzO1xuXG4gICAgaWYgKHRleHR1cmVVbml0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMudGV4dHVyZVVuaXQgPSB0ZXh0dXJlVW5pdDtcbiAgICAgIGdsLmFjdGl2ZVRleHR1cmUoMzM5ODQgKyB0ZXh0dXJlVW5pdCk7XG4gICAgfVxuXG4gICAgZ2wuYmluZFRleHR1cmUodGhpcy50YXJnZXQsIHRoaXMuaGFuZGxlKTtcbiAgICByZXR1cm4gdGV4dHVyZVVuaXQ7XG4gIH1cblxuICB1bmJpbmQodGV4dHVyZVVuaXQgPSB0aGlzLnRleHR1cmVVbml0KSB7XG4gICAgY29uc3Qge1xuICAgICAgZ2xcbiAgICB9ID0gdGhpcztcblxuICAgIGlmICh0ZXh0dXJlVW5pdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLnRleHR1cmVVbml0ID0gdGV4dHVyZVVuaXQ7XG4gICAgICBnbC5hY3RpdmVUZXh0dXJlKDMzOTg0ICsgdGV4dHVyZVVuaXQpO1xuICAgIH1cblxuICAgIGdsLmJpbmRUZXh0dXJlKHRoaXMudGFyZ2V0LCBudWxsKTtcbiAgICByZXR1cm4gdGV4dHVyZVVuaXQ7XG4gIH1cblxuICBfZ2V0RGF0YVR5cGUoe1xuICAgIGRhdGEsXG4gICAgY29tcHJlc3NlZCA9IGZhbHNlXG4gIH0pIHtcbiAgICBpZiAoY29tcHJlc3NlZCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGF0YSxcbiAgICAgICAgZGF0YVR5cGU6ICdjb21wcmVzc2VkJ1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoZGF0YSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGF0YSxcbiAgICAgICAgZGF0YVR5cGU6ICdudWxsJ1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoQXJyYXlCdWZmZXIuaXNWaWV3KGRhdGEpKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBkYXRhLFxuICAgICAgICBkYXRhVHlwZTogJ3R5cGVkLWFycmF5J1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIEJ1ZmZlcikge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGF0YTogZGF0YS5oYW5kbGUsXG4gICAgICAgIGRhdGFUeXBlOiAnYnVmZmVyJ1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIFdlYkdMQnVmZmVyKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBkYXRhLFxuICAgICAgICBkYXRhVHlwZTogJ2J1ZmZlcidcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGRhdGEsXG4gICAgICBkYXRhVHlwZTogJ2Jyb3dzZXItb2JqZWN0J1xuICAgIH07XG4gIH1cblxuICBfZGVkdWNlUGFyYW1ldGVycyhvcHRzKSB7XG4gICAgY29uc3Qge1xuICAgICAgZm9ybWF0LFxuICAgICAgZGF0YVxuICAgIH0gPSBvcHRzO1xuICAgIGxldCB7XG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodCxcbiAgICAgIGRhdGFGb3JtYXQsXG4gICAgICB0eXBlLFxuICAgICAgY29tcHJlc3NlZFxuICAgIH0gPSBvcHRzO1xuICAgIGNvbnN0IHRleHR1cmVGb3JtYXQgPSBURVhUVVJFX0ZPUk1BVFNbZm9ybWF0XTtcbiAgICBkYXRhRm9ybWF0ID0gZGF0YUZvcm1hdCB8fCB0ZXh0dXJlRm9ybWF0ICYmIHRleHR1cmVGb3JtYXQuZGF0YUZvcm1hdDtcbiAgICB0eXBlID0gdHlwZSB8fCB0ZXh0dXJlRm9ybWF0ICYmIHRleHR1cmVGb3JtYXQudHlwZXNbMF07XG4gICAgY29tcHJlc3NlZCA9IGNvbXByZXNzZWQgfHwgdGV4dHVyZUZvcm1hdCAmJiB0ZXh0dXJlRm9ybWF0LmNvbXByZXNzZWQ7XG4gICAgKHtcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0XG4gICAgfSA9IHRoaXMuX2RlZHVjZUltYWdlU2l6ZShkYXRhLCB3aWR0aCwgaGVpZ2h0KSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRhdGFGb3JtYXQsXG4gICAgICB0eXBlLFxuICAgICAgY29tcHJlc3NlZCxcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgZm9ybWF0LFxuICAgICAgZGF0YVxuICAgIH07XG4gIH1cblxuICBfZGVkdWNlSW1hZ2VTaXplKGRhdGEsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICBsZXQgc2l6ZTtcblxuICAgIGlmICh0eXBlb2YgSW1hZ2VEYXRhICE9PSAndW5kZWZpbmVkJyAmJiBkYXRhIGluc3RhbmNlb2YgSW1hZ2VEYXRhKSB7XG4gICAgICBzaXplID0ge1xuICAgICAgICB3aWR0aDogZGF0YS53aWR0aCxcbiAgICAgICAgaGVpZ2h0OiBkYXRhLmhlaWdodFxuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBIVE1MSW1hZ2VFbGVtZW50ICE9PSAndW5kZWZpbmVkJyAmJiBkYXRhIGluc3RhbmNlb2YgSFRNTEltYWdlRWxlbWVudCkge1xuICAgICAgc2l6ZSA9IHtcbiAgICAgICAgd2lkdGg6IGRhdGEubmF0dXJhbFdpZHRoLFxuICAgICAgICBoZWlnaHQ6IGRhdGEubmF0dXJhbEhlaWdodFxuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBIVE1MQ2FudmFzRWxlbWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgZGF0YSBpbnN0YW5jZW9mIEhUTUxDYW52YXNFbGVtZW50KSB7XG4gICAgICBzaXplID0ge1xuICAgICAgICB3aWR0aDogZGF0YS53aWR0aCxcbiAgICAgICAgaGVpZ2h0OiBkYXRhLmhlaWdodFxuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBJbWFnZUJpdG1hcCAhPT0gJ3VuZGVmaW5lZCcgJiYgZGF0YSBpbnN0YW5jZW9mIEltYWdlQml0bWFwKSB7XG4gICAgICBzaXplID0ge1xuICAgICAgICB3aWR0aDogZGF0YS53aWR0aCxcbiAgICAgICAgaGVpZ2h0OiBkYXRhLmhlaWdodFxuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBIVE1MVmlkZW9FbGVtZW50ICE9PSAndW5kZWZpbmVkJyAmJiBkYXRhIGluc3RhbmNlb2YgSFRNTFZpZGVvRWxlbWVudCkge1xuICAgICAgc2l6ZSA9IHtcbiAgICAgICAgd2lkdGg6IGRhdGEudmlkZW9XaWR0aCxcbiAgICAgICAgaGVpZ2h0OiBkYXRhLnZpZGVvSGVpZ2h0XG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAoIWRhdGEpIHtcbiAgICAgIHNpemUgPSB7XG4gICAgICAgIHdpZHRoOiB3aWR0aCA+PSAwID8gd2lkdGggOiAxLFxuICAgICAgICBoZWlnaHQ6IGhlaWdodCA+PSAwID8gaGVpZ2h0IDogMVxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2l6ZSA9IHtcbiAgICAgICAgd2lkdGgsXG4gICAgICAgIGhlaWdodFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBhc3NlcnQoc2l6ZSwgJ0NvdWxkIG5vdCBkZWR1Y2VkIHRleHR1cmUgc2l6ZScpO1xuICAgIGFzc2VydCh3aWR0aCA9PT0gdW5kZWZpbmVkIHx8IHNpemUud2lkdGggPT09IHdpZHRoLCAnRGVkdWNlZCB0ZXh0dXJlIHdpZHRoIGRvZXMgbm90IG1hdGNoIHN1cHBsaWVkIHdpZHRoJyk7XG4gICAgYXNzZXJ0KGhlaWdodCA9PT0gdW5kZWZpbmVkIHx8IHNpemUuaGVpZ2h0ID09PSBoZWlnaHQsICdEZWR1Y2VkIHRleHR1cmUgaGVpZ2h0IGRvZXMgbm90IG1hdGNoIHN1cHBsaWVkIGhlaWdodCcpO1xuICAgIHJldHVybiBzaXplO1xuICB9XG5cbiAgX2NyZWF0ZUhhbmRsZSgpIHtcbiAgICByZXR1cm4gdGhpcy5nbC5jcmVhdGVUZXh0dXJlKCk7XG4gIH1cblxuICBfZGVsZXRlSGFuZGxlKCkge1xuICAgIHRoaXMuZ2wuZGVsZXRlVGV4dHVyZSh0aGlzLmhhbmRsZSk7XG5cbiAgICB0aGlzLl90cmFja0RlYWxsb2NhdGVkTWVtb3J5KCdUZXh0dXJlJyk7XG4gIH1cblxuICBfZ2V0UGFyYW1ldGVyKHBuYW1lKSB7XG4gICAgc3dpdGNoIChwbmFtZSkge1xuICAgICAgY2FzZSA0MDk2OlxuICAgICAgICByZXR1cm4gdGhpcy53aWR0aDtcblxuICAgICAgY2FzZSA0MDk3OlxuICAgICAgICByZXR1cm4gdGhpcy5oZWlnaHQ7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRoaXMuZ2wuYmluZFRleHR1cmUodGhpcy50YXJnZXQsIHRoaXMuaGFuZGxlKTtcbiAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLmdsLmdldFRleFBhcmFtZXRlcih0aGlzLnRhcmdldCwgcG5hbWUpO1xuICAgICAgICB0aGlzLmdsLmJpbmRUZXh0dXJlKHRoaXMudGFyZ2V0LCBudWxsKTtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIF9zZXRQYXJhbWV0ZXIocG5hbWUsIHBhcmFtKSB7XG4gICAgdGhpcy5nbC5iaW5kVGV4dHVyZSh0aGlzLnRhcmdldCwgdGhpcy5oYW5kbGUpO1xuICAgIHBhcmFtID0gdGhpcy5fZ2V0TlBPVFBhcmFtKHBuYW1lLCBwYXJhbSk7XG5cbiAgICBzd2l0Y2ggKHBuYW1lKSB7XG4gICAgICBjYXNlIDMzMDgyOlxuICAgICAgY2FzZSAzMzA4MzpcbiAgICAgICAgdGhpcy5nbC50ZXhQYXJhbWV0ZXJmKHRoaXMuaGFuZGxlLCBwbmFtZSwgcGFyYW0pO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSA0MDk2OlxuICAgICAgY2FzZSA0MDk3OlxuICAgICAgICBhc3NlcnQoZmFsc2UpO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhpcy5nbC50ZXhQYXJhbWV0ZXJpKHRoaXMudGFyZ2V0LCBwbmFtZSwgcGFyYW0pO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICB0aGlzLmdsLmJpbmRUZXh0dXJlKHRoaXMudGFyZ2V0LCBudWxsKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIF9pc05QT1QoKSB7XG4gICAgaWYgKGlzV2ViR0wyKHRoaXMuZ2wpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLndpZHRoIHx8ICF0aGlzLmhlaWdodCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiAhaXNQb3dlck9mVHdvKHRoaXMud2lkdGgpIHx8ICFpc1Bvd2VyT2ZUd28odGhpcy5oZWlnaHQpO1xuICB9XG5cbiAgX3VwZGF0ZUZvck5QT1QocGFyYW1ldGVycykge1xuICAgIGlmIChwYXJhbWV0ZXJzW3RoaXMuZ2wuVEVYVFVSRV9NSU5fRklMVEVSXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBwYXJhbWV0ZXJzW3RoaXMuZ2wuVEVYVFVSRV9NSU5fRklMVEVSXSA9IHRoaXMuZ2wuTElORUFSO1xuICAgIH1cblxuICAgIGlmIChwYXJhbWV0ZXJzW3RoaXMuZ2wuVEVYVFVSRV9XUkFQX1NdID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHBhcmFtZXRlcnNbdGhpcy5nbC5URVhUVVJFX1dSQVBfU10gPSB0aGlzLmdsLkNMQU1QX1RPX0VER0U7XG4gICAgfVxuXG4gICAgaWYgKHBhcmFtZXRlcnNbdGhpcy5nbC5URVhUVVJFX1dSQVBfVF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcGFyYW1ldGVyc1t0aGlzLmdsLlRFWFRVUkVfV1JBUF9UXSA9IHRoaXMuZ2wuQ0xBTVBfVE9fRURHRTtcbiAgICB9XG4gIH1cblxuICBfZ2V0TlBPVFBhcmFtKHBuYW1lLCBwYXJhbSkge1xuICAgIGlmICh0aGlzLl9pc05QT1QoKSkge1xuICAgICAgc3dpdGNoIChwbmFtZSkge1xuICAgICAgICBjYXNlIDEwMjQxOlxuICAgICAgICAgIGlmIChOUE9UX01JTl9GSUxURVJTLmluZGV4T2YocGFyYW0pID09PSAtMSkge1xuICAgICAgICAgICAgcGFyYW0gPSA5NzI5O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgMTAyNDI6XG4gICAgICAgIGNhc2UgMTAyNDM6XG4gICAgICAgICAgaWYgKHBhcmFtICE9PSAzMzA3MSkge1xuICAgICAgICAgICAgcGFyYW0gPSAzMzA3MTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBwYXJhbTtcbiAgfVxuXG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD10ZXh0dXJlLmpzLm1hcCIsImltcG9ydCB7IGlzV2ViR0wyLCBhc3NlcnRXZWJHTDJDb250ZXh0LCBsb2cgfSBmcm9tICdAbHVtYS5nbC9nbHRvb2xzJztcbmltcG9ydCBSZXNvdXJjZSBmcm9tICcuL3Jlc291cmNlJztcbmltcG9ydCBCdWZmZXIgZnJvbSAnLi9idWZmZXInO1xuaW1wb3J0IHsgaXNPYmplY3RFbXB0eSB9IGZyb20gJy4uL3V0aWxzL3V0aWxzJztcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRyYW5zZm9ybUZlZWRiYWNrIGV4dGVuZHMgUmVzb3VyY2Uge1xuICBzdGF0aWMgaXNTdXBwb3J0ZWQoZ2wpIHtcbiAgICByZXR1cm4gaXNXZWJHTDIoZ2wpO1xuICB9XG5cbiAgY29uc3RydWN0b3IoZ2wsIHByb3BzID0ge30pIHtcbiAgICBhc3NlcnRXZWJHTDJDb250ZXh0KGdsKTtcbiAgICBzdXBlcihnbCwgcHJvcHMpO1xuICAgIHRoaXMuaW5pdGlhbGl6ZShwcm9wcyk7XG4gICAgdGhpcy5zdHViUmVtb3ZlZE1ldGhvZHMoJ1RyYW5zZm9ybUZlZWRiYWNrJywgJ3Y2LjAnLCBbJ3BhdXNlJywgJ3Jlc3VtZSddKTtcbiAgICBPYmplY3Quc2VhbCh0aGlzKTtcbiAgfVxuXG4gIGluaXRpYWxpemUocHJvcHMgPSB7fSkge1xuICAgIHRoaXMuYnVmZmVycyA9IHt9O1xuICAgIHRoaXMudW51c2VkID0ge307XG4gICAgdGhpcy5jb25maWd1cmF0aW9uID0gbnVsbDtcbiAgICB0aGlzLmJpbmRPblVzZSA9IHRydWU7XG5cbiAgICBpZiAoIWlzT2JqZWN0RW1wdHkodGhpcy5idWZmZXJzKSkge1xuICAgICAgdGhpcy5iaW5kKCgpID0+IHRoaXMuX3VuYmluZEJ1ZmZlcnMoKSk7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRQcm9wcyhwcm9wcyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzZXRQcm9wcyhwcm9wcykge1xuICAgIGlmICgncHJvZ3JhbScgaW4gcHJvcHMpIHtcbiAgICAgIHRoaXMuY29uZmlndXJhdGlvbiA9IHByb3BzLnByb2dyYW0gJiYgcHJvcHMucHJvZ3JhbS5jb25maWd1cmF0aW9uO1xuICAgIH1cblxuICAgIGlmICgnY29uZmlndXJhdGlvbicgaW4gcHJvcHMpIHtcbiAgICAgIHRoaXMuY29uZmlndXJhdGlvbiA9IHByb3BzLmNvbmZpZ3VyYXRpb247XG4gICAgfVxuXG4gICAgaWYgKCdiaW5kT25Vc2UnIGluIHByb3BzKSB7XG4gICAgICBwcm9wcyA9IHByb3BzLmJpbmRPblVzZTtcbiAgICB9XG5cbiAgICBpZiAoJ2J1ZmZlcnMnIGluIHByb3BzKSB7XG4gICAgICB0aGlzLnNldEJ1ZmZlcnMocHJvcHMuYnVmZmVycyk7XG4gICAgfVxuICB9XG5cbiAgc2V0QnVmZmVycyhidWZmZXJzID0ge30pIHtcbiAgICB0aGlzLmJpbmQoKCkgPT4ge1xuICAgICAgZm9yIChjb25zdCBidWZmZXJOYW1lIGluIGJ1ZmZlcnMpIHtcbiAgICAgICAgdGhpcy5zZXRCdWZmZXIoYnVmZmVyTmFtZSwgYnVmZmVyc1tidWZmZXJOYW1lXSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzZXRCdWZmZXIobG9jYXRpb25Pck5hbWUsIGJ1ZmZlck9yUGFyYW1zKSB7XG4gICAgY29uc3QgbG9jYXRpb24gPSB0aGlzLl9nZXRWYXJ5aW5nSW5kZXgobG9jYXRpb25Pck5hbWUpO1xuXG4gICAgY29uc3Qge1xuICAgICAgYnVmZmVyLFxuICAgICAgYnl0ZVNpemUsXG4gICAgICBieXRlT2Zmc2V0XG4gICAgfSA9IHRoaXMuX2dldEJ1ZmZlclBhcmFtcyhidWZmZXJPclBhcmFtcyk7XG5cbiAgICBpZiAobG9jYXRpb24gPCAwKSB7XG4gICAgICB0aGlzLnVudXNlZFtsb2NhdGlvbk9yTmFtZV0gPSBidWZmZXI7XG4gICAgICBsb2cud2FybigoKSA9PiBgJHt0aGlzLmlkfSB1bnVzZWQgdmFyeWluZyBidWZmZXIgJHtsb2NhdGlvbk9yTmFtZX1gKSgpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdGhpcy5idWZmZXJzW2xvY2F0aW9uXSA9IGJ1ZmZlck9yUGFyYW1zO1xuXG4gICAgaWYgKCF0aGlzLmJpbmRPblVzZSkge1xuICAgICAgdGhpcy5fYmluZEJ1ZmZlcihsb2NhdGlvbiwgYnVmZmVyLCBieXRlT2Zmc2V0LCBieXRlU2l6ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBiZWdpbihwcmltaXRpdmVNb2RlID0gMCkge1xuICAgIHRoaXMuZ2wuYmluZFRyYW5zZm9ybUZlZWRiYWNrKDM2Mzg2LCB0aGlzLmhhbmRsZSk7XG5cbiAgICB0aGlzLl9iaW5kQnVmZmVycygpO1xuXG4gICAgdGhpcy5nbC5iZWdpblRyYW5zZm9ybUZlZWRiYWNrKHByaW1pdGl2ZU1vZGUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZW5kKCkge1xuICAgIHRoaXMuZ2wuZW5kVHJhbnNmb3JtRmVlZGJhY2soKTtcblxuICAgIHRoaXMuX3VuYmluZEJ1ZmZlcnMoKTtcblxuICAgIHRoaXMuZ2wuYmluZFRyYW5zZm9ybUZlZWRiYWNrKDM2Mzg2LCBudWxsKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIF9nZXRCdWZmZXJQYXJhbXMoYnVmZmVyT3JQYXJhbXMpIHtcbiAgICBsZXQgYnl0ZU9mZnNldDtcbiAgICBsZXQgYnl0ZVNpemU7XG4gICAgbGV0IGJ1ZmZlcjtcblxuICAgIGlmIChidWZmZXJPclBhcmFtcyBpbnN0YW5jZW9mIEJ1ZmZlciA9PT0gZmFsc2UpIHtcbiAgICAgIGJ1ZmZlciA9IGJ1ZmZlck9yUGFyYW1zLmJ1ZmZlcjtcbiAgICAgIGJ5dGVTaXplID0gYnVmZmVyT3JQYXJhbXMuYnl0ZVNpemU7XG4gICAgICBieXRlT2Zmc2V0ID0gYnVmZmVyT3JQYXJhbXMuYnl0ZU9mZnNldDtcbiAgICB9IGVsc2Uge1xuICAgICAgYnVmZmVyID0gYnVmZmVyT3JQYXJhbXM7XG4gICAgfVxuXG4gICAgaWYgKGJ5dGVPZmZzZXQgIT09IHVuZGVmaW5lZCB8fCBieXRlU2l6ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBieXRlT2Zmc2V0ID0gYnl0ZU9mZnNldCB8fCAwO1xuICAgICAgYnl0ZVNpemUgPSBieXRlU2l6ZSB8fCBidWZmZXIuYnl0ZUxlbmd0aCAtIGJ5dGVPZmZzZXQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGJ1ZmZlcixcbiAgICAgIGJ5dGVPZmZzZXQsXG4gICAgICBieXRlU2l6ZVxuICAgIH07XG4gIH1cblxuICBfZ2V0VmFyeWluZ0luZm8obG9jYXRpb25Pck5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5jb25maWd1cmF0aW9uICYmIHRoaXMuY29uZmlndXJhdGlvbi5nZXRWYXJ5aW5nSW5mbyhsb2NhdGlvbk9yTmFtZSk7XG4gIH1cblxuICBfZ2V0VmFyeWluZ0luZGV4KGxvY2F0aW9uT3JOYW1lKSB7XG4gICAgaWYgKHRoaXMuY29uZmlndXJhdGlvbikge1xuICAgICAgcmV0dXJuIHRoaXMuY29uZmlndXJhdGlvbi5nZXRWYXJ5aW5nSW5mbyhsb2NhdGlvbk9yTmFtZSkubG9jYXRpb247XG4gICAgfVxuXG4gICAgY29uc3QgbG9jYXRpb24gPSBOdW1iZXIobG9jYXRpb25Pck5hbWUpO1xuICAgIHJldHVybiBOdW1iZXIuaXNGaW5pdGUobG9jYXRpb24pID8gbG9jYXRpb24gOiAtMTtcbiAgfVxuXG4gIF9iaW5kQnVmZmVycygpIHtcbiAgICBpZiAodGhpcy5iaW5kT25Vc2UpIHtcbiAgICAgIGZvciAoY29uc3QgYnVmZmVySW5kZXggaW4gdGhpcy5idWZmZXJzKSB7XG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICBidWZmZXIsXG4gICAgICAgICAgYnl0ZVNpemUsXG4gICAgICAgICAgYnl0ZU9mZnNldFxuICAgICAgICB9ID0gdGhpcy5fZ2V0QnVmZmVyUGFyYW1zKHRoaXMuYnVmZmVyc1tidWZmZXJJbmRleF0pO1xuXG4gICAgICAgIHRoaXMuX2JpbmRCdWZmZXIoYnVmZmVySW5kZXgsIGJ1ZmZlciwgYnl0ZU9mZnNldCwgYnl0ZVNpemUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF91bmJpbmRCdWZmZXJzKCkge1xuICAgIGlmICh0aGlzLmJpbmRPblVzZSkge1xuICAgICAgZm9yIChjb25zdCBidWZmZXJJbmRleCBpbiB0aGlzLmJ1ZmZlcnMpIHtcbiAgICAgICAgdGhpcy5fYmluZEJ1ZmZlcihidWZmZXJJbmRleCwgbnVsbCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2JpbmRCdWZmZXIoaW5kZXgsIGJ1ZmZlciwgYnl0ZU9mZnNldCA9IDAsIGJ5dGVTaXplKSB7XG4gICAgY29uc3QgaGFuZGxlID0gYnVmZmVyICYmIGJ1ZmZlci5oYW5kbGU7XG5cbiAgICBpZiAoIWhhbmRsZSB8fCBieXRlU2l6ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLmdsLmJpbmRCdWZmZXJCYXNlKDM1OTgyLCBpbmRleCwgaGFuZGxlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5nbC5iaW5kQnVmZmVyUmFuZ2UoMzU5ODIsIGluZGV4LCBoYW5kbGUsIGJ5dGVPZmZzZXQsIGJ5dGVTaXplKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIF9jcmVhdGVIYW5kbGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2wuY3JlYXRlVHJhbnNmb3JtRmVlZGJhY2soKTtcbiAgfVxuXG4gIF9kZWxldGVIYW5kbGUoKSB7XG4gICAgdGhpcy5nbC5kZWxldGVUcmFuc2Zvcm1GZWVkYmFjayh0aGlzLmhhbmRsZSk7XG4gIH1cblxuICBfYmluZEhhbmRsZShoYW5kbGUpIHtcbiAgICB0aGlzLmdsLmJpbmRUcmFuc2Zvcm1GZWVkYmFjaygzNjM4NiwgdGhpcy5oYW5kbGUpO1xuICB9XG5cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRyYW5zZm9ybS1mZWVkYmFjay5qcy5tYXAiLCJpbXBvcnQgeyBsb2cgfSBmcm9tICdAbHVtYS5nbC9nbHRvb2xzJztcbmltcG9ydCBGcmFtZWJ1ZmZlciBmcm9tICcuL2ZyYW1lYnVmZmVyJztcbmltcG9ydCBSZW5kZXJidWZmZXIgZnJvbSAnLi9yZW5kZXJidWZmZXInO1xuaW1wb3J0IFRleHR1cmUgZnJvbSAnLi90ZXh0dXJlJztcbmltcG9ydCB7IGFzc2VydCB9IGZyb20gJy4uL3V0aWxzL2Fzc2VydCc7XG5jb25zdCBVTklGT1JNX1NFVFRFUlMgPSB7XG4gIFs1MTI2XTogZ2V0QXJyYXlTZXR0ZXIuYmluZChudWxsLCAndW5pZm9ybTFmdicsIHRvRmxvYXRBcnJheSwgMSwgc2V0VmVjdG9yVW5pZm9ybSksXG4gIFszNTY2NF06IGdldEFycmF5U2V0dGVyLmJpbmQobnVsbCwgJ3VuaWZvcm0yZnYnLCB0b0Zsb2F0QXJyYXksIDIsIHNldFZlY3RvclVuaWZvcm0pLFxuICBbMzU2NjVdOiBnZXRBcnJheVNldHRlci5iaW5kKG51bGwsICd1bmlmb3JtM2Z2JywgdG9GbG9hdEFycmF5LCAzLCBzZXRWZWN0b3JVbmlmb3JtKSxcbiAgWzM1NjY2XTogZ2V0QXJyYXlTZXR0ZXIuYmluZChudWxsLCAndW5pZm9ybTRmdicsIHRvRmxvYXRBcnJheSwgNCwgc2V0VmVjdG9yVW5pZm9ybSksXG4gIFs1MTI0XTogZ2V0QXJyYXlTZXR0ZXIuYmluZChudWxsLCAndW5pZm9ybTFpdicsIHRvSW50QXJyYXksIDEsIHNldFZlY3RvclVuaWZvcm0pLFxuICBbMzU2NjddOiBnZXRBcnJheVNldHRlci5iaW5kKG51bGwsICd1bmlmb3JtMml2JywgdG9JbnRBcnJheSwgMiwgc2V0VmVjdG9yVW5pZm9ybSksXG4gIFszNTY2OF06IGdldEFycmF5U2V0dGVyLmJpbmQobnVsbCwgJ3VuaWZvcm0zaXYnLCB0b0ludEFycmF5LCAzLCBzZXRWZWN0b3JVbmlmb3JtKSxcbiAgWzM1NjY5XTogZ2V0QXJyYXlTZXR0ZXIuYmluZChudWxsLCAndW5pZm9ybTRpdicsIHRvSW50QXJyYXksIDQsIHNldFZlY3RvclVuaWZvcm0pLFxuICBbMzU2NzBdOiBnZXRBcnJheVNldHRlci5iaW5kKG51bGwsICd1bmlmb3JtMWl2JywgdG9JbnRBcnJheSwgMSwgc2V0VmVjdG9yVW5pZm9ybSksXG4gIFszNTY3MV06IGdldEFycmF5U2V0dGVyLmJpbmQobnVsbCwgJ3VuaWZvcm0yaXYnLCB0b0ludEFycmF5LCAyLCBzZXRWZWN0b3JVbmlmb3JtKSxcbiAgWzM1NjcyXTogZ2V0QXJyYXlTZXR0ZXIuYmluZChudWxsLCAndW5pZm9ybTNpdicsIHRvSW50QXJyYXksIDMsIHNldFZlY3RvclVuaWZvcm0pLFxuICBbMzU2NzNdOiBnZXRBcnJheVNldHRlci5iaW5kKG51bGwsICd1bmlmb3JtNGl2JywgdG9JbnRBcnJheSwgNCwgc2V0VmVjdG9yVW5pZm9ybSksXG4gIFszNTY3NF06IGdldEFycmF5U2V0dGVyLmJpbmQobnVsbCwgJ3VuaWZvcm1NYXRyaXgyZnYnLCB0b0Zsb2F0QXJyYXksIDQsIHNldE1hdHJpeFVuaWZvcm0pLFxuICBbMzU2NzVdOiBnZXRBcnJheVNldHRlci5iaW5kKG51bGwsICd1bmlmb3JtTWF0cml4M2Z2JywgdG9GbG9hdEFycmF5LCA5LCBzZXRNYXRyaXhVbmlmb3JtKSxcbiAgWzM1Njc2XTogZ2V0QXJyYXlTZXR0ZXIuYmluZChudWxsLCAndW5pZm9ybU1hdHJpeDRmdicsIHRvRmxvYXRBcnJheSwgMTYsIHNldE1hdHJpeFVuaWZvcm0pLFxuICBbMzU2NzhdOiBnZXRTYW1wbGVyU2V0dGVyLFxuICBbMzU2ODBdOiBnZXRTYW1wbGVyU2V0dGVyLFxuICBbNTEyNV06IGdldEFycmF5U2V0dGVyLmJpbmQobnVsbCwgJ3VuaWZvcm0xdWl2JywgdG9VSW50QXJyYXksIDEsIHNldFZlY3RvclVuaWZvcm0pLFxuICBbMzYyOTRdOiBnZXRBcnJheVNldHRlci5iaW5kKG51bGwsICd1bmlmb3JtMnVpdicsIHRvVUludEFycmF5LCAyLCBzZXRWZWN0b3JVbmlmb3JtKSxcbiAgWzM2Mjk1XTogZ2V0QXJyYXlTZXR0ZXIuYmluZChudWxsLCAndW5pZm9ybTN1aXYnLCB0b1VJbnRBcnJheSwgMywgc2V0VmVjdG9yVW5pZm9ybSksXG4gIFszNjI5Nl06IGdldEFycmF5U2V0dGVyLmJpbmQobnVsbCwgJ3VuaWZvcm00dWl2JywgdG9VSW50QXJyYXksIDQsIHNldFZlY3RvclVuaWZvcm0pLFxuICBbMzU2ODVdOiBnZXRBcnJheVNldHRlci5iaW5kKG51bGwsICd1bmlmb3JtTWF0cml4MngzZnYnLCB0b0Zsb2F0QXJyYXksIDYsIHNldE1hdHJpeFVuaWZvcm0pLFxuICBbMzU2ODZdOiBnZXRBcnJheVNldHRlci5iaW5kKG51bGwsICd1bmlmb3JtTWF0cml4Mng0ZnYnLCB0b0Zsb2F0QXJyYXksIDgsIHNldE1hdHJpeFVuaWZvcm0pLFxuICBbMzU2ODddOiBnZXRBcnJheVNldHRlci5iaW5kKG51bGwsICd1bmlmb3JtTWF0cml4M3gyZnYnLCB0b0Zsb2F0QXJyYXksIDYsIHNldE1hdHJpeFVuaWZvcm0pLFxuICBbMzU2ODhdOiBnZXRBcnJheVNldHRlci5iaW5kKG51bGwsICd1bmlmb3JtTWF0cml4M3g0ZnYnLCB0b0Zsb2F0QXJyYXksIDEyLCBzZXRNYXRyaXhVbmlmb3JtKSxcbiAgWzM1Njg5XTogZ2V0QXJyYXlTZXR0ZXIuYmluZChudWxsLCAndW5pZm9ybU1hdHJpeDR4MmZ2JywgdG9GbG9hdEFycmF5LCA4LCBzZXRNYXRyaXhVbmlmb3JtKSxcbiAgWzM1NjkwXTogZ2V0QXJyYXlTZXR0ZXIuYmluZChudWxsLCAndW5pZm9ybU1hdHJpeDR4M2Z2JywgdG9GbG9hdEFycmF5LCAxMiwgc2V0TWF0cml4VW5pZm9ybSksXG4gIFszNTY3OF06IGdldFNhbXBsZXJTZXR0ZXIsXG4gIFszNTY4MF06IGdldFNhbXBsZXJTZXR0ZXIsXG4gIFszNTY3OV06IGdldFNhbXBsZXJTZXR0ZXIsXG4gIFszNTY4Ml06IGdldFNhbXBsZXJTZXR0ZXIsXG4gIFszNjI4OV06IGdldFNhbXBsZXJTZXR0ZXIsXG4gIFszNjI5Ml06IGdldFNhbXBsZXJTZXR0ZXIsXG4gIFszNjI5M106IGdldFNhbXBsZXJTZXR0ZXIsXG4gIFszNjI5OF06IGdldFNhbXBsZXJTZXR0ZXIsXG4gIFszNjI5OV06IGdldFNhbXBsZXJTZXR0ZXIsXG4gIFszNjMwMF06IGdldFNhbXBsZXJTZXR0ZXIsXG4gIFszNjMwM106IGdldFNhbXBsZXJTZXR0ZXIsXG4gIFszNjMwNl06IGdldFNhbXBsZXJTZXR0ZXIsXG4gIFszNjMwN106IGdldFNhbXBsZXJTZXR0ZXIsXG4gIFszNjMwOF06IGdldFNhbXBsZXJTZXR0ZXIsXG4gIFszNjMxMV06IGdldFNhbXBsZXJTZXR0ZXJcbn07XG5jb25zdCBGTE9BVF9BUlJBWSA9IHt9O1xuY29uc3QgSU5UX0FSUkFZID0ge307XG5jb25zdCBVSU5UX0FSUkFZID0ge307XG5jb25zdCBhcnJheTEgPSBbMF07XG5cbmZ1bmN0aW9uIHRvVHlwZWRBcnJheSh2YWx1ZSwgdW5pZm9ybUxlbmd0aCwgVHlwZSwgY2FjaGUpIHtcbiAgaWYgKHVuaWZvcm1MZW5ndGggPT09IDEgJiYgdHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbicpIHtcbiAgICB2YWx1ZSA9IHZhbHVlID8gMSA6IDA7XG4gIH1cblxuICBpZiAoTnVtYmVyLmlzRmluaXRlKHZhbHVlKSkge1xuICAgIGFycmF5MVswXSA9IHZhbHVlO1xuICAgIHZhbHVlID0gYXJyYXkxO1xuICB9XG5cbiAgY29uc3QgbGVuZ3RoID0gdmFsdWUubGVuZ3RoO1xuXG4gIGlmIChsZW5ndGggJSB1bmlmb3JtTGVuZ3RoKSB7XG4gICAgbG9nLndhcm4oYFVuaWZvcm0gc2l6ZSBzaG91bGQgYmUgbXVsdGlwbGVzIG9mICR7dW5pZm9ybUxlbmd0aH1gLCB2YWx1ZSkoKTtcbiAgfVxuXG4gIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFR5cGUpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICBsZXQgcmVzdWx0ID0gY2FjaGVbbGVuZ3RoXTtcblxuICBpZiAoIXJlc3VsdCkge1xuICAgIHJlc3VsdCA9IG5ldyBUeXBlKGxlbmd0aCk7XG4gICAgY2FjaGVbbGVuZ3RoXSA9IHJlc3VsdDtcbiAgfVxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICByZXN1bHRbaV0gPSB2YWx1ZVtpXTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIHRvRmxvYXRBcnJheSh2YWx1ZSwgdW5pZm9ybUxlbmd0aCkge1xuICByZXR1cm4gdG9UeXBlZEFycmF5KHZhbHVlLCB1bmlmb3JtTGVuZ3RoLCBGbG9hdDMyQXJyYXksIEZMT0FUX0FSUkFZKTtcbn1cblxuZnVuY3Rpb24gdG9JbnRBcnJheSh2YWx1ZSwgdW5pZm9ybUxlbmd0aCkge1xuICByZXR1cm4gdG9UeXBlZEFycmF5KHZhbHVlLCB1bmlmb3JtTGVuZ3RoLCBJbnQzMkFycmF5LCBJTlRfQVJSQVkpO1xufVxuXG5mdW5jdGlvbiB0b1VJbnRBcnJheSh2YWx1ZSwgdW5pZm9ybUxlbmd0aCkge1xuICByZXR1cm4gdG9UeXBlZEFycmF5KHZhbHVlLCB1bmlmb3JtTGVuZ3RoLCBVaW50MzJBcnJheSwgVUlOVF9BUlJBWSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRVbmlmb3JtU2V0dGVyKGdsLCBsb2NhdGlvbiwgaW5mbykge1xuICBjb25zdCBzZXR0ZXIgPSBVTklGT1JNX1NFVFRFUlNbaW5mby50eXBlXTtcblxuICBpZiAoIXNldHRlcikge1xuICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBHTFNMIHVuaWZvcm0gdHlwZSAke2luZm8udHlwZX1gKTtcbiAgfVxuXG4gIHJldHVybiBzZXR0ZXIoKS5iaW5kKG51bGwsIGdsLCBsb2NhdGlvbik7XG59XG5leHBvcnQgZnVuY3Rpb24gcGFyc2VVbmlmb3JtTmFtZShuYW1lKSB7XG4gIGlmIChuYW1lW25hbWUubGVuZ3RoIC0gMV0gIT09ICddJykge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lLFxuICAgICAgbGVuZ3RoOiAxLFxuICAgICAgaXNBcnJheTogZmFsc2VcbiAgICB9O1xuICB9XG5cbiAgY29uc3QgVU5JRk9STV9OQU1FX1JFR0VYUCA9IC8oW15bXSopKFxcW1swLTldK1xcXSk/LztcbiAgY29uc3QgbWF0Y2hlcyA9IG5hbWUubWF0Y2goVU5JRk9STV9OQU1FX1JFR0VYUCk7XG5cbiAgaWYgKCFtYXRjaGVzIHx8IG1hdGNoZXMubGVuZ3RoIDwgMikge1xuICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIHBhcnNlIEdMU0wgdW5pZm9ybSBuYW1lICR7bmFtZX1gKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgbmFtZTogbWF0Y2hlc1sxXSxcbiAgICBsZW5ndGg6IG1hdGNoZXNbMl0gfHwgMSxcbiAgICBpc0FycmF5OiBCb29sZWFuKG1hdGNoZXNbMl0pXG4gIH07XG59XG5leHBvcnQgZnVuY3Rpb24gY2hlY2tVbmlmb3JtVmFsdWVzKHVuaWZvcm1zLCBzb3VyY2UsIHVuaWZvcm1NYXApIHtcbiAgZm9yIChjb25zdCB1bmlmb3JtTmFtZSBpbiB1bmlmb3Jtcykge1xuICAgIGNvbnN0IHZhbHVlID0gdW5pZm9ybXNbdW5pZm9ybU5hbWVdO1xuICAgIGNvbnN0IHNob3VsZENoZWNrID0gIXVuaWZvcm1NYXAgfHwgQm9vbGVhbih1bmlmb3JtTWFwW3VuaWZvcm1OYW1lXSk7XG5cbiAgICBpZiAoc2hvdWxkQ2hlY2sgJiYgIWNoZWNrVW5pZm9ybVZhbHVlKHZhbHVlKSkge1xuICAgICAgc291cmNlID0gc291cmNlID8gYCR7c291cmNlfSBgIDogJyc7XG4gICAgICBjb25zb2xlLmVycm9yKGAke3NvdXJjZX0gQmFkIHVuaWZvcm0gJHt1bmlmb3JtTmFtZX1gLCB2YWx1ZSk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7c291cmNlfSBCYWQgdW5pZm9ybSAke3VuaWZvcm1OYW1lfWApO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBjaGVja1VuaWZvcm1WYWx1ZSh2YWx1ZSkge1xuICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkgfHwgQXJyYXlCdWZmZXIuaXNWaWV3KHZhbHVlKSkge1xuICAgIHJldHVybiBjaGVja1VuaWZvcm1BcnJheSh2YWx1ZSk7XG4gIH1cblxuICBpZiAoaXNGaW5pdGUodmFsdWUpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSBpZiAodmFsdWUgPT09IHRydWUgfHwgdmFsdWUgPT09IGZhbHNlKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBUZXh0dXJlKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBSZW5kZXJidWZmZXIpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIEZyYW1lYnVmZmVyKSB7XG4gICAgcmV0dXJuIEJvb2xlYW4odmFsdWUudGV4dHVyZSk7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb3B5VW5pZm9ybSh1bmlmb3Jtcywga2V5LCB2YWx1ZSkge1xuICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkgfHwgQXJyYXlCdWZmZXIuaXNWaWV3KHZhbHVlKSkge1xuICAgIGlmICh1bmlmb3Jtc1trZXldKSB7XG4gICAgICBjb25zdCBkZXN0ID0gdW5pZm9ybXNba2V5XTtcblxuICAgICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IHZhbHVlLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICAgIGRlc3RbaV0gPSB2YWx1ZVtpXTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdW5pZm9ybXNba2V5XSA9IHZhbHVlLnNsaWNlKCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHVuaWZvcm1zW2tleV0gPSB2YWx1ZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGVja1VuaWZvcm1BcnJheSh2YWx1ZSkge1xuICBpZiAodmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY29uc3QgY2hlY2tMZW5ndGggPSBNYXRoLm1pbih2YWx1ZS5sZW5ndGgsIDE2KTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGNoZWNrTGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoIU51bWJlci5pc0Zpbml0ZSh2YWx1ZVtpXSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gZ2V0U2FtcGxlclNldHRlcigpIHtcbiAgbGV0IGNhY2hlID0gbnVsbDtcbiAgcmV0dXJuIChnbCwgbG9jYXRpb24sIHZhbHVlKSA9PiB7XG4gICAgY29uc3QgdXBkYXRlID0gY2FjaGUgIT09IHZhbHVlO1xuXG4gICAgaWYgKHVwZGF0ZSkge1xuICAgICAgZ2wudW5pZm9ybTFpKGxvY2F0aW9uLCB2YWx1ZSk7XG4gICAgICBjYWNoZSA9IHZhbHVlO1xuICAgIH1cblxuICAgIHJldHVybiB1cGRhdGU7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldEFycmF5U2V0dGVyKGZ1bmN0aW9uTmFtZSwgdG9BcnJheSwgc2l6ZSwgdW5pZm9ybVNldHRlcikge1xuICBsZXQgY2FjaGUgPSBudWxsO1xuICBsZXQgY2FjaGVMZW5ndGggPSBudWxsO1xuICByZXR1cm4gKGdsLCBsb2NhdGlvbiwgdmFsdWUpID0+IHtcbiAgICBjb25zdCBhcnJheVZhbHVlID0gdG9BcnJheSh2YWx1ZSwgc2l6ZSk7XG4gICAgY29uc3QgbGVuZ3RoID0gYXJyYXlWYWx1ZS5sZW5ndGg7XG4gICAgbGV0IHVwZGF0ZSA9IGZhbHNlO1xuXG4gICAgaWYgKGNhY2hlID09PSBudWxsKSB7XG4gICAgICBjYWNoZSA9IG5ldyBGbG9hdDMyQXJyYXkobGVuZ3RoKTtcbiAgICAgIGNhY2hlTGVuZ3RoID0gbGVuZ3RoO1xuICAgICAgdXBkYXRlID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXNzZXJ0KGNhY2hlTGVuZ3RoID09PSBsZW5ndGgsICdVbmlmb3JtIGxlbmd0aCBjYW5ub3QgY2hhbmdlLicpO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgICAgIGlmIChhcnJheVZhbHVlW2ldICE9PSBjYWNoZVtpXSkge1xuICAgICAgICAgIHVwZGF0ZSA9IHRydWU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodXBkYXRlKSB7XG4gICAgICB1bmlmb3JtU2V0dGVyKGdsLCBmdW5jdGlvbk5hbWUsIGxvY2F0aW9uLCBhcnJheVZhbHVlKTtcbiAgICAgIGNhY2hlLnNldChhcnJheVZhbHVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdXBkYXRlO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzZXRWZWN0b3JVbmlmb3JtKGdsLCBmdW5jdGlvbk5hbWUsIGxvY2F0aW9uLCB2YWx1ZSkge1xuICBnbFtmdW5jdGlvbk5hbWVdKGxvY2F0aW9uLCB2YWx1ZSk7XG59XG5cbmZ1bmN0aW9uIHNldE1hdHJpeFVuaWZvcm0oZ2wsIGZ1bmN0aW9uTmFtZSwgbG9jYXRpb24sIHZhbHVlKSB7XG4gIGdsW2Z1bmN0aW9uTmFtZV0obG9jYXRpb24sIGZhbHNlLCB2YWx1ZSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD11bmlmb3Jtcy5qcy5tYXAiLCJpbXBvcnQgUmVzb3VyY2UgZnJvbSAnLi9yZXNvdXJjZSc7XG5pbXBvcnQgQnVmZmVyIGZyb20gJy4vYnVmZmVyJztcbmltcG9ydCB7IGlzV2ViR0wyIH0gZnJvbSAnQGx1bWEuZ2wvZ2x0b29scyc7XG5pbXBvcnQgeyBnZXRTY3JhdGNoQXJyYXksIGZpbGxBcnJheSB9IGZyb20gJy4uL3V0aWxzL2FycmF5LXV0aWxzLWZsYXQnO1xuaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSAnLi4vdXRpbHMvYXNzZXJ0JztcbmltcG9ydCB7IGdldEJyb3dzZXIgfSBmcm9tICdwcm9iZS5nbCc7XG5jb25zdCBFUlJfRUxFTUVOVFMgPSAnZWxlbWVudHMgbXVzdCBiZSBHTC5FTEVNRU5UX0FSUkFZX0JVRkZFUic7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWZXJ0ZXhBcnJheU9iamVjdCBleHRlbmRzIFJlc291cmNlIHtcbiAgc3RhdGljIGlzU3VwcG9ydGVkKGdsLCBvcHRpb25zID0ge30pIHtcbiAgICBpZiAob3B0aW9ucy5jb25zdGFudEF0dHJpYnV0ZVplcm8pIHtcbiAgICAgIHJldHVybiBpc1dlYkdMMihnbCkgfHwgZ2V0QnJvd3NlcigpID09PSAnQ2hyb21lJztcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHN0YXRpYyBnZXREZWZhdWx0QXJyYXkoZ2wpIHtcbiAgICBnbC5sdW1hID0gZ2wubHVtYSB8fCB7fTtcblxuICAgIGlmICghZ2wubHVtYS5kZWZhdWx0VmVydGV4QXJyYXkpIHtcbiAgICAgIGdsLmx1bWEuZGVmYXVsdFZlcnRleEFycmF5ID0gbmV3IFZlcnRleEFycmF5T2JqZWN0KGdsLCB7XG4gICAgICAgIGhhbmRsZTogbnVsbCxcbiAgICAgICAgaXNEZWZhdWx0QXJyYXk6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBnbC5sdW1hLmRlZmF1bHRWZXJ0ZXhBcnJheTtcbiAgfVxuXG4gIHN0YXRpYyBnZXRNYXhBdHRyaWJ1dGVzKGdsKSB7XG4gICAgVmVydGV4QXJyYXlPYmplY3QuTUFYX0FUVFJJQlVURVMgPSBWZXJ0ZXhBcnJheU9iamVjdC5NQVhfQVRUUklCVVRFUyB8fCBnbC5nZXRQYXJhbWV0ZXIoMzQ5MjEpO1xuICAgIHJldHVybiBWZXJ0ZXhBcnJheU9iamVjdC5NQVhfQVRUUklCVVRFUztcbiAgfVxuXG4gIHN0YXRpYyBzZXRDb25zdGFudChnbCwgbG9jYXRpb24sIGFycmF5KSB7XG4gICAgc3dpdGNoIChhcnJheS5jb25zdHJ1Y3Rvcikge1xuICAgICAgY2FzZSBGbG9hdDMyQXJyYXk6XG4gICAgICAgIFZlcnRleEFycmF5T2JqZWN0Ll9zZXRDb25zdGFudEZsb2F0QXJyYXkoZ2wsIGxvY2F0aW9uLCBhcnJheSk7XG5cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgSW50MzJBcnJheTpcbiAgICAgICAgVmVydGV4QXJyYXlPYmplY3QuX3NldENvbnN0YW50SW50QXJyYXkoZ2wsIGxvY2F0aW9uLCBhcnJheSk7XG5cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgVWludDMyQXJyYXk6XG4gICAgICAgIFZlcnRleEFycmF5T2JqZWN0Ll9zZXRDb25zdGFudFVpbnRBcnJheShnbCwgbG9jYXRpb24sIGFycmF5KTtcblxuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYXNzZXJ0KGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICBjb25zdHJ1Y3RvcihnbCwgb3B0cyA9IHt9KSB7XG4gICAgY29uc3QgaWQgPSBvcHRzLmlkIHx8IG9wdHMucHJvZ3JhbSAmJiBvcHRzLnByb2dyYW0uaWQ7XG4gICAgc3VwZXIoZ2wsIE9iamVjdC5hc3NpZ24oe30sIG9wdHMsIHtcbiAgICAgIGlkXG4gICAgfSkpO1xuICAgIHRoaXMuYnVmZmVyID0gbnVsbDtcbiAgICB0aGlzLmJ1ZmZlclZhbHVlID0gbnVsbDtcbiAgICB0aGlzLmlzRGVmYXVsdEFycmF5ID0gb3B0cy5pc0RlZmF1bHRBcnJheSB8fCBmYWxzZTtcbiAgICB0aGlzLmdsMiA9IGdsO1xuICAgIHRoaXMuaW5pdGlhbGl6ZShvcHRzKTtcbiAgICBPYmplY3Quc2VhbCh0aGlzKTtcbiAgfVxuXG4gIGRlbGV0ZSgpIHtcbiAgICBzdXBlci5kZWxldGUoKTtcblxuICAgIGlmICh0aGlzLmJ1ZmZlcikge1xuICAgICAgdGhpcy5idWZmZXIuZGVsZXRlKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBnZXQgTUFYX0FUVFJJQlVURVMoKSB7XG4gICAgcmV0dXJuIFZlcnRleEFycmF5T2JqZWN0LmdldE1heEF0dHJpYnV0ZXModGhpcy5nbCk7XG4gIH1cblxuICBpbml0aWFsaXplKHByb3BzID0ge30pIHtcbiAgICByZXR1cm4gdGhpcy5zZXRQcm9wcyhwcm9wcyk7XG4gIH1cblxuICBzZXRQcm9wcyhwcm9wcykge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc2V0RWxlbWVudEJ1ZmZlcihlbGVtZW50QnVmZmVyID0gbnVsbCwgb3B0cyA9IHt9KSB7XG4gICAgYXNzZXJ0KCFlbGVtZW50QnVmZmVyIHx8IGVsZW1lbnRCdWZmZXIudGFyZ2V0ID09PSAzNDk2MywgRVJSX0VMRU1FTlRTKTtcbiAgICB0aGlzLmJpbmQoKCkgPT4ge1xuICAgICAgdGhpcy5nbC5iaW5kQnVmZmVyKDM0OTYzLCBlbGVtZW50QnVmZmVyID8gZWxlbWVudEJ1ZmZlci5oYW5kbGUgOiBudWxsKTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHNldEJ1ZmZlcihsb2NhdGlvbiwgYnVmZmVyLCBhY2Nlc3Nvcikge1xuICAgIGlmIChidWZmZXIudGFyZ2V0ID09PSAzNDk2Mykge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0RWxlbWVudEJ1ZmZlcihidWZmZXIsIGFjY2Vzc29yKTtcbiAgICB9XG5cbiAgICBjb25zdCB7XG4gICAgICBzaXplLFxuICAgICAgdHlwZSxcbiAgICAgIHN0cmlkZSxcbiAgICAgIG9mZnNldCxcbiAgICAgIG5vcm1hbGl6ZWQsXG4gICAgICBpbnRlZ2VyLFxuICAgICAgZGl2aXNvclxuICAgIH0gPSBhY2Nlc3NvcjtcbiAgICBjb25zdCB7XG4gICAgICBnbCxcbiAgICAgIGdsMlxuICAgIH0gPSB0aGlzO1xuICAgIGxvY2F0aW9uID0gTnVtYmVyKGxvY2F0aW9uKTtcbiAgICB0aGlzLmJpbmQoKCkgPT4ge1xuICAgICAgZ2wuYmluZEJ1ZmZlcigzNDk2MiwgYnVmZmVyLmhhbmRsZSk7XG5cbiAgICAgIGlmIChpbnRlZ2VyKSB7XG4gICAgICAgIGFzc2VydChpc1dlYkdMMihnbCkpO1xuICAgICAgICBnbDIudmVydGV4QXR0cmliSVBvaW50ZXIobG9jYXRpb24sIHNpemUsIHR5cGUsIHN0cmlkZSwgb2Zmc2V0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIobG9jYXRpb24sIHNpemUsIHR5cGUsIG5vcm1hbGl6ZWQsIHN0cmlkZSwgb2Zmc2V0KTtcbiAgICAgIH1cblxuICAgICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkobG9jYXRpb24pO1xuICAgICAgZ2wyLnZlcnRleEF0dHJpYkRpdmlzb3IobG9jYXRpb24sIGRpdmlzb3IgfHwgMCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBlbmFibGUobG9jYXRpb24sIGVuYWJsZSA9IHRydWUpIHtcbiAgICBjb25zdCBkaXNhYmxpbmdBdHRyaWJ1dGVaZXJvID0gIWVuYWJsZSAmJiBsb2NhdGlvbiA9PT0gMCAmJiAhVmVydGV4QXJyYXlPYmplY3QuaXNTdXBwb3J0ZWQodGhpcy5nbCwge1xuICAgICAgY29uc3RhbnRBdHRyaWJ1dGVaZXJvOiB0cnVlXG4gICAgfSk7XG5cbiAgICBpZiAoIWRpc2FibGluZ0F0dHJpYnV0ZVplcm8pIHtcbiAgICAgIGxvY2F0aW9uID0gTnVtYmVyKGxvY2F0aW9uKTtcbiAgICAgIHRoaXMuYmluZCgoKSA9PiBlbmFibGUgPyB0aGlzLmdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KGxvY2F0aW9uKSA6IHRoaXMuZ2wuZGlzYWJsZVZlcnRleEF0dHJpYkFycmF5KGxvY2F0aW9uKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBnZXRDb25zdGFudEJ1ZmZlcihlbGVtZW50Q291bnQsIHZhbHVlKSB7XG4gICAgY29uc3QgY29uc3RhbnRWYWx1ZSA9IHRoaXMuX25vcm1hbGl6ZUNvbnN0YW50QXJyYXlWYWx1ZSh2YWx1ZSk7XG5cbiAgICBjb25zdCBieXRlTGVuZ3RoID0gY29uc3RhbnRWYWx1ZS5ieXRlTGVuZ3RoICogZWxlbWVudENvdW50O1xuICAgIGNvbnN0IGxlbmd0aCA9IGNvbnN0YW50VmFsdWUubGVuZ3RoICogZWxlbWVudENvdW50O1xuICAgIGxldCB1cGRhdGVOZWVkZWQgPSAhdGhpcy5idWZmZXI7XG4gICAgdGhpcy5idWZmZXIgPSB0aGlzLmJ1ZmZlciB8fCBuZXcgQnVmZmVyKHRoaXMuZ2wsIGJ5dGVMZW5ndGgpO1xuICAgIHVwZGF0ZU5lZWRlZCA9IHVwZGF0ZU5lZWRlZCB8fCB0aGlzLmJ1ZmZlci5yZWFsbG9jYXRlKGJ5dGVMZW5ndGgpO1xuICAgIHVwZGF0ZU5lZWRlZCA9IHVwZGF0ZU5lZWRlZCB8fCAhdGhpcy5fY29tcGFyZUNvbnN0YW50QXJyYXlWYWx1ZXMoY29uc3RhbnRWYWx1ZSwgdGhpcy5idWZmZXJWYWx1ZSk7XG5cbiAgICBpZiAodXBkYXRlTmVlZGVkKSB7XG4gICAgICBjb25zdCB0eXBlZEFycmF5ID0gZ2V0U2NyYXRjaEFycmF5KHZhbHVlLmNvbnN0cnVjdG9yLCBsZW5ndGgpO1xuICAgICAgZmlsbEFycmF5KHtcbiAgICAgICAgdGFyZ2V0OiB0eXBlZEFycmF5LFxuICAgICAgICBzb3VyY2U6IGNvbnN0YW50VmFsdWUsXG4gICAgICAgIHN0YXJ0OiAwLFxuICAgICAgICBjb3VudDogbGVuZ3RoXG4gICAgICB9KTtcbiAgICAgIHRoaXMuYnVmZmVyLnN1YkRhdGEodHlwZWRBcnJheSk7XG4gICAgICB0aGlzLmJ1ZmZlclZhbHVlID0gdmFsdWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyO1xuICB9XG5cbiAgX25vcm1hbGl6ZUNvbnN0YW50QXJyYXlWYWx1ZShhcnJheVZhbHVlKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoYXJyYXlWYWx1ZSkpIHtcbiAgICAgIHJldHVybiBuZXcgRmxvYXQzMkFycmF5KGFycmF5VmFsdWUpO1xuICAgIH1cblxuICAgIHJldHVybiBhcnJheVZhbHVlO1xuICB9XG5cbiAgX2NvbXBhcmVDb25zdGFudEFycmF5VmFsdWVzKHYxLCB2Mikge1xuICAgIGlmICghdjEgfHwgIXYyIHx8IHYxLmxlbmd0aCAhPT0gdjIubGVuZ3RoIHx8IHYxLmNvbnN0cnVjdG9yICE9PSB2Mi5jb25zdHJ1Y3Rvcikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdjEubGVuZ3RoOyArK2kpIHtcbiAgICAgIGlmICh2MVtpXSAhPT0gdjJbaV0pIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgc3RhdGljIF9zZXRDb25zdGFudEZsb2F0QXJyYXkoZ2wsIGxvY2F0aW9uLCBhcnJheSkge1xuICAgIHN3aXRjaCAoYXJyYXkubGVuZ3RoKSB7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIGdsLnZlcnRleEF0dHJpYjFmdihsb2NhdGlvbiwgYXJyYXkpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAyOlxuICAgICAgICBnbC52ZXJ0ZXhBdHRyaWIyZnYobG9jYXRpb24sIGFycmF5KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgMzpcbiAgICAgICAgZ2wudmVydGV4QXR0cmliM2Z2KGxvY2F0aW9uLCBhcnJheSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDQ6XG4gICAgICAgIGdsLnZlcnRleEF0dHJpYjRmdihsb2NhdGlvbiwgYXJyYXkpO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYXNzZXJ0KGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgX3NldENvbnN0YW50SW50QXJyYXkoZ2wsIGxvY2F0aW9uLCBhcnJheSkge1xuICAgIGFzc2VydChpc1dlYkdMMihnbCkpO1xuXG4gICAgc3dpdGNoIChhcnJheS5sZW5ndGgpIHtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgZ2wudmVydGV4QXR0cmliSTFpdihsb2NhdGlvbiwgYXJyYXkpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAyOlxuICAgICAgICBnbC52ZXJ0ZXhBdHRyaWJJMml2KGxvY2F0aW9uLCBhcnJheSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDM6XG4gICAgICAgIGdsLnZlcnRleEF0dHJpYkkzaXYobG9jYXRpb24sIGFycmF5KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgNDpcbiAgICAgICAgZ2wudmVydGV4QXR0cmliSTRpdihsb2NhdGlvbiwgYXJyYXkpO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYXNzZXJ0KGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgX3NldENvbnN0YW50VWludEFycmF5KGdsLCBsb2NhdGlvbiwgYXJyYXkpIHtcbiAgICBhc3NlcnQoaXNXZWJHTDIoZ2wpKTtcblxuICAgIHN3aXRjaCAoYXJyYXkubGVuZ3RoKSB7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIGdsLnZlcnRleEF0dHJpYkkxdWl2KGxvY2F0aW9uLCBhcnJheSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDI6XG4gICAgICAgIGdsLnZlcnRleEF0dHJpYkkydWl2KGxvY2F0aW9uLCBhcnJheSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDM6XG4gICAgICAgIGdsLnZlcnRleEF0dHJpYkkzdWl2KGxvY2F0aW9uLCBhcnJheSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDQ6XG4gICAgICAgIGdsLnZlcnRleEF0dHJpYkk0dWl2KGxvY2F0aW9uLCBhcnJheSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBhc3NlcnQoZmFsc2UpO1xuICAgIH1cbiAgfVxuXG4gIF9jcmVhdGVIYW5kbGUoKSB7XG4gICAgY29uc3QgZ2wyID0gdGhpcy5nbDtcbiAgICByZXR1cm4gZ2wyLmNyZWF0ZVZlcnRleEFycmF5KCk7XG4gIH1cblxuICBfZGVsZXRlSGFuZGxlKGhhbmRsZSkge1xuICAgIHRoaXMuZ2wyLmRlbGV0ZVZlcnRleEFycmF5KGhhbmRsZSk7XG4gICAgcmV0dXJuIFt0aGlzLmVsZW1lbnRzXTtcbiAgfVxuXG4gIF9iaW5kSGFuZGxlKGhhbmRsZSkge1xuICAgIHRoaXMuZ2wyLmJpbmRWZXJ0ZXhBcnJheShoYW5kbGUpO1xuICB9XG5cbiAgX2dldFBhcmFtZXRlcihwbmFtZSwge1xuICAgIGxvY2F0aW9uXG4gIH0pIHtcbiAgICBhc3NlcnQoTnVtYmVyLmlzRmluaXRlKGxvY2F0aW9uKSk7XG4gICAgcmV0dXJuIHRoaXMuYmluZCgoKSA9PiB7XG4gICAgICBzd2l0Y2ggKHBuYW1lKSB7XG4gICAgICAgIGNhc2UgMzQzNzM6XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZ2wuZ2V0VmVydGV4QXR0cmliT2Zmc2V0KGxvY2F0aW9uLCBwbmFtZSk7XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICByZXR1cm4gdGhpcy5nbC5nZXRWZXJ0ZXhBdHRyaWIobG9jYXRpb24sIHBuYW1lKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD12ZXJ0ZXgtYXJyYXktb2JqZWN0LmpzLm1hcCIsImltcG9ydCB7IGxvZyB9IGZyb20gJ0BsdW1hLmdsL2dsdG9vbHMnO1xuaW1wb3J0IEFjY2Vzc29yIGZyb20gJy4vYWNjZXNzb3InO1xuaW1wb3J0IEJ1ZmZlciBmcm9tICcuL2J1ZmZlcic7XG5pbXBvcnQgVmVydGV4QXJyYXlPYmplY3QgZnJvbSAnLi92ZXJ0ZXgtYXJyYXktb2JqZWN0JztcbmltcG9ydCB7IGFzc2VydCB9IGZyb20gJy4uL3V0aWxzL2Fzc2VydCc7XG5pbXBvcnQgeyBzdHViUmVtb3ZlZE1ldGhvZHMgfSBmcm9tICcuLi91dGlscy9zdHViLW1ldGhvZHMnO1xuY29uc3QgRVJSX0FUVFJJQlVURV9UWVBFID0gJ1ZlcnRleEFycmF5OiBhdHRyaWJ1dGVzIG11c3QgYmUgQnVmZmVycyBvciBjb25zdGFudHMgKGkuZS4gdHlwZWQgYXJyYXkpJztcbmNvbnN0IE1VTFRJX0xPQ0FUSU9OX0FUVFJJQlVURV9SRUdFWFAgPSAvXiguKylfX0xPQ0FUSU9OXyhbMC05XSspJC87XG5jb25zdCBERVBSRUNBVElPTlNfVjYgPSBbJ3NldEJ1ZmZlcnMnLCAnc2V0R2VuZXJpYycsICdjbGVhckJpbmRpbmdzJywgJ3NldExvY2F0aW9ucycsICdzZXRHZW5lcmljVmFsdWVzJywgJ3NldERpdmlzb3InLCAnZW5hYmxlJywgJ2Rpc2FibGUnXTtcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZlcnRleEFycmF5IHtcbiAgY29uc3RydWN0b3IoZ2wsIG9wdHMgPSB7fSkge1xuICAgIGNvbnN0IGlkID0gb3B0cy5pZCB8fCBvcHRzLnByb2dyYW0gJiYgb3B0cy5wcm9ncmFtLmlkO1xuICAgIHRoaXMuaWQgPSBpZDtcbiAgICB0aGlzLmdsID0gZ2w7XG4gICAgdGhpcy5jb25maWd1cmF0aW9uID0gbnVsbDtcbiAgICB0aGlzLmVsZW1lbnRzID0gbnVsbDtcbiAgICB0aGlzLmVsZW1lbnRzQWNjZXNzb3IgPSBudWxsO1xuICAgIHRoaXMudmFsdWVzID0gbnVsbDtcbiAgICB0aGlzLmFjY2Vzc29ycyA9IG51bGw7XG4gICAgdGhpcy51bnVzZWQgPSBudWxsO1xuICAgIHRoaXMuZHJhd1BhcmFtcyA9IG51bGw7XG4gICAgdGhpcy5idWZmZXIgPSBudWxsO1xuICAgIHRoaXMuYXR0cmlidXRlcyA9IHt9O1xuICAgIHRoaXMudmVydGV4QXJyYXlPYmplY3QgPSBuZXcgVmVydGV4QXJyYXlPYmplY3QoZ2wpO1xuICAgIHN0dWJSZW1vdmVkTWV0aG9kcyh0aGlzLCAnVmVydGV4QXJyYXknLCAndjYuMCcsIERFUFJFQ0FUSU9OU19WNik7XG4gICAgdGhpcy5pbml0aWFsaXplKG9wdHMpO1xuICAgIE9iamVjdC5zZWFsKHRoaXMpO1xuICB9XG5cbiAgZGVsZXRlKCkge1xuICAgIGlmICh0aGlzLmJ1ZmZlcikge1xuICAgICAgdGhpcy5idWZmZXIuZGVsZXRlKCk7XG4gICAgfVxuXG4gICAgdGhpcy52ZXJ0ZXhBcnJheU9iamVjdC5kZWxldGUoKTtcbiAgfVxuXG4gIGluaXRpYWxpemUocHJvcHMgPSB7fSkge1xuICAgIHRoaXMucmVzZXQoKTtcbiAgICB0aGlzLmNvbmZpZ3VyYXRpb24gPSBudWxsO1xuICAgIHRoaXMuYmluZE9uVXNlID0gZmFsc2U7XG4gICAgcmV0dXJuIHRoaXMuc2V0UHJvcHMocHJvcHMpO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5lbGVtZW50cyA9IG51bGw7XG4gICAgdGhpcy5lbGVtZW50c0FjY2Vzc29yID0gbnVsbDtcbiAgICBjb25zdCB7XG4gICAgICBNQVhfQVRUUklCVVRFU1xuICAgIH0gPSB0aGlzLnZlcnRleEFycmF5T2JqZWN0O1xuICAgIHRoaXMudmFsdWVzID0gbmV3IEFycmF5KE1BWF9BVFRSSUJVVEVTKS5maWxsKG51bGwpO1xuICAgIHRoaXMuYWNjZXNzb3JzID0gbmV3IEFycmF5KE1BWF9BVFRSSUJVVEVTKS5maWxsKG51bGwpO1xuICAgIHRoaXMudW51c2VkID0ge307XG4gICAgdGhpcy5kcmF3UGFyYW1zID0gbnVsbDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHNldFByb3BzKHByb3BzKSB7XG4gICAgaWYgKCdwcm9ncmFtJyBpbiBwcm9wcykge1xuICAgICAgdGhpcy5jb25maWd1cmF0aW9uID0gcHJvcHMucHJvZ3JhbSAmJiBwcm9wcy5wcm9ncmFtLmNvbmZpZ3VyYXRpb247XG4gICAgfVxuXG4gICAgaWYgKCdjb25maWd1cmF0aW9uJyBpbiBwcm9wcykge1xuICAgICAgdGhpcy5jb25maWd1cmF0aW9uID0gcHJvcHMuY29uZmlndXJhdGlvbjtcbiAgICB9XG5cbiAgICBpZiAoJ2F0dHJpYnV0ZXMnIGluIHByb3BzKSB7XG4gICAgICB0aGlzLnNldEF0dHJpYnV0ZXMocHJvcHMuYXR0cmlidXRlcyk7XG4gICAgfVxuXG4gICAgaWYgKCdlbGVtZW50cycgaW4gcHJvcHMpIHtcbiAgICAgIHRoaXMuc2V0RWxlbWVudEJ1ZmZlcihwcm9wcy5lbGVtZW50cyk7XG4gICAgfVxuXG4gICAgaWYgKCdiaW5kT25Vc2UnIGluIHByb3BzKSB7XG4gICAgICBwcm9wcyA9IHByb3BzLmJpbmRPblVzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGNsZWFyRHJhd1BhcmFtcygpIHtcbiAgICB0aGlzLmRyYXdQYXJhbXMgPSBudWxsO1xuICB9XG5cbiAgZ2V0RHJhd1BhcmFtcygpIHtcbiAgICB0aGlzLmRyYXdQYXJhbXMgPSB0aGlzLmRyYXdQYXJhbXMgfHwgdGhpcy5fdXBkYXRlRHJhd1BhcmFtcygpO1xuICAgIHJldHVybiB0aGlzLmRyYXdQYXJhbXM7XG4gIH1cblxuICBzZXRBdHRyaWJ1dGVzKGF0dHJpYnV0ZXMpIHtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMuYXR0cmlidXRlcywgYXR0cmlidXRlcyk7XG4gICAgdGhpcy52ZXJ0ZXhBcnJheU9iamVjdC5iaW5kKCgpID0+IHtcbiAgICAgIGZvciAoY29uc3QgbG9jYXRpb25Pck5hbWUgaW4gYXR0cmlidXRlcykge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGF0dHJpYnV0ZXNbbG9jYXRpb25Pck5hbWVdO1xuXG4gICAgICAgIHRoaXMuX3NldEF0dHJpYnV0ZShsb2NhdGlvbk9yTmFtZSwgdmFsdWUpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmdsLmJpbmRCdWZmZXIoMzQ5NjIsIG51bGwpO1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc2V0RWxlbWVudEJ1ZmZlcihlbGVtZW50QnVmZmVyID0gbnVsbCwgYWNjZXNzb3IgPSB7fSkge1xuICAgIHRoaXMuZWxlbWVudHMgPSBlbGVtZW50QnVmZmVyO1xuICAgIHRoaXMuZWxlbWVudHNBY2Nlc3NvciA9IGFjY2Vzc29yO1xuICAgIHRoaXMuY2xlYXJEcmF3UGFyYW1zKCk7XG4gICAgdGhpcy52ZXJ0ZXhBcnJheU9iamVjdC5zZXRFbGVtZW50QnVmZmVyKGVsZW1lbnRCdWZmZXIsIGFjY2Vzc29yKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHNldEJ1ZmZlcihsb2NhdGlvbk9yTmFtZSwgYnVmZmVyLCBhcHBBY2Nlc3NvciA9IHt9KSB7XG4gICAgaWYgKGJ1ZmZlci50YXJnZXQgPT09IDM0OTYzKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXRFbGVtZW50QnVmZmVyKGJ1ZmZlciwgYXBwQWNjZXNzb3IpO1xuICAgIH1cblxuICAgIGNvbnN0IHtcbiAgICAgIGxvY2F0aW9uLFxuICAgICAgYWNjZXNzb3JcbiAgICB9ID0gdGhpcy5fcmVzb2x2ZUxvY2F0aW9uQW5kQWNjZXNzb3IobG9jYXRpb25Pck5hbWUsIGJ1ZmZlciwgYnVmZmVyLmFjY2Vzc29yLCBhcHBBY2Nlc3Nvcik7XG5cbiAgICBpZiAobG9jYXRpb24gPj0gMCkge1xuICAgICAgdGhpcy52YWx1ZXNbbG9jYXRpb25dID0gYnVmZmVyO1xuICAgICAgdGhpcy5hY2Nlc3NvcnNbbG9jYXRpb25dID0gYWNjZXNzb3I7XG4gICAgICB0aGlzLmNsZWFyRHJhd1BhcmFtcygpO1xuICAgICAgdGhpcy52ZXJ0ZXhBcnJheU9iamVjdC5zZXRCdWZmZXIobG9jYXRpb24sIGJ1ZmZlciwgYWNjZXNzb3IpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc2V0Q29uc3RhbnQobG9jYXRpb25Pck5hbWUsIGFycmF5VmFsdWUsIGFwcEFjY2Vzc29yID0ge30pIHtcbiAgICBjb25zdCB7XG4gICAgICBsb2NhdGlvbixcbiAgICAgIGFjY2Vzc29yXG4gICAgfSA9IHRoaXMuX3Jlc29sdmVMb2NhdGlvbkFuZEFjY2Vzc29yKGxvY2F0aW9uT3JOYW1lLCBhcnJheVZhbHVlLCBPYmplY3QuYXNzaWduKHtcbiAgICAgIHNpemU6IGFycmF5VmFsdWUubGVuZ3RoXG4gICAgfSwgYXBwQWNjZXNzb3IpKTtcblxuICAgIGlmIChsb2NhdGlvbiA+PSAwKSB7XG4gICAgICBhcnJheVZhbHVlID0gdGhpcy52ZXJ0ZXhBcnJheU9iamVjdC5fbm9ybWFsaXplQ29uc3RhbnRBcnJheVZhbHVlKGFycmF5VmFsdWUpO1xuICAgICAgdGhpcy52YWx1ZXNbbG9jYXRpb25dID0gYXJyYXlWYWx1ZTtcbiAgICAgIHRoaXMuYWNjZXNzb3JzW2xvY2F0aW9uXSA9IGFjY2Vzc29yO1xuICAgICAgdGhpcy5jbGVhckRyYXdQYXJhbXMoKTtcbiAgICAgIHRoaXMudmVydGV4QXJyYXlPYmplY3QuZW5hYmxlKGxvY2F0aW9uLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB1bmJpbmRCdWZmZXJzKCkge1xuICAgIHRoaXMudmVydGV4QXJyYXlPYmplY3QuYmluZCgoKSA9PiB7XG4gICAgICBpZiAodGhpcy5lbGVtZW50cykge1xuICAgICAgICB0aGlzLnZlcnRleEFycmF5T2JqZWN0LnNldEVsZW1lbnRCdWZmZXIobnVsbCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYnVmZmVyID0gdGhpcy5idWZmZXIgfHwgbmV3IEJ1ZmZlcih0aGlzLmdsLCB7XG4gICAgICAgIGFjY2Vzc29yOiB7XG4gICAgICAgICAgc2l6ZTogNFxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgZm9yIChsZXQgbG9jYXRpb24gPSAwOyBsb2NhdGlvbiA8IHRoaXMudmVydGV4QXJyYXlPYmplY3QuTUFYX0FUVFJJQlVURVM7IGxvY2F0aW9uKyspIHtcbiAgICAgICAgaWYgKHRoaXMudmFsdWVzW2xvY2F0aW9uXSBpbnN0YW5jZW9mIEJ1ZmZlcikge1xuICAgICAgICAgIHRoaXMuZ2wuZGlzYWJsZVZlcnRleEF0dHJpYkFycmF5KGxvY2F0aW9uKTtcbiAgICAgICAgICB0aGlzLmdsLmJpbmRCdWZmZXIoMzQ5NjIsIHRoaXMuYnVmZmVyLmhhbmRsZSk7XG4gICAgICAgICAgdGhpcy5nbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKGxvY2F0aW9uLCAxLCA1MTI2LCBmYWxzZSwgMCwgMCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGJpbmRCdWZmZXJzKCkge1xuICAgIHRoaXMudmVydGV4QXJyYXlPYmplY3QuYmluZCgoKSA9PiB7XG4gICAgICBpZiAodGhpcy5lbGVtZW50cykge1xuICAgICAgICB0aGlzLnNldEVsZW1lbnRCdWZmZXIodGhpcy5lbGVtZW50cyk7XG4gICAgICB9XG5cbiAgICAgIGZvciAobGV0IGxvY2F0aW9uID0gMDsgbG9jYXRpb24gPCB0aGlzLnZlcnRleEFycmF5T2JqZWN0Lk1BWF9BVFRSSUJVVEVTOyBsb2NhdGlvbisrKSB7XG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IHRoaXMudmFsdWVzW2xvY2F0aW9uXTtcblxuICAgICAgICBpZiAoYnVmZmVyIGluc3RhbmNlb2YgQnVmZmVyKSB7XG4gICAgICAgICAgdGhpcy5zZXRCdWZmZXIobG9jYXRpb24sIGJ1ZmZlcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGJpbmRGb3JEcmF3KHZlcnRleENvdW50LCBpbnN0YW5jZUNvdW50LCBmdW5jKSB7XG4gICAgbGV0IHZhbHVlO1xuICAgIHRoaXMudmVydGV4QXJyYXlPYmplY3QuYmluZCgoKSA9PiB7XG4gICAgICB0aGlzLl9zZXRDb25zdGFudEF0dHJpYnV0ZXModmVydGV4Q291bnQsIGluc3RhbmNlQ291bnQpO1xuXG4gICAgICB2YWx1ZSA9IGZ1bmMoKTtcbiAgICB9KTtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICBfcmVzb2x2ZUxvY2F0aW9uQW5kQWNjZXNzb3IobG9jYXRpb25Pck5hbWUsIHZhbHVlLCB2YWx1ZUFjY2Vzc29yLCBhcHBBY2Nlc3Nvcikge1xuICAgIGNvbnN0IElOVkFMSURfUkVTVUxUID0ge1xuICAgICAgbG9jYXRpb246IC0xLFxuICAgICAgYWNjZXNzb3I6IG51bGxcbiAgICB9O1xuXG4gICAgY29uc3Qge1xuICAgICAgbG9jYXRpb24sXG4gICAgICBuYW1lXG4gICAgfSA9IHRoaXMuX2dldEF0dHJpYnV0ZUluZGV4KGxvY2F0aW9uT3JOYW1lKTtcblxuICAgIGlmICghTnVtYmVyLmlzRmluaXRlKGxvY2F0aW9uKSB8fCBsb2NhdGlvbiA8IDApIHtcbiAgICAgIHRoaXMudW51c2VkW2xvY2F0aW9uT3JOYW1lXSA9IHZhbHVlO1xuICAgICAgbG9nLm9uY2UoMywgKCkgPT4gYHVudXNlZCB2YWx1ZSAke2xvY2F0aW9uT3JOYW1lfSBpbiAke3RoaXMuaWR9YCkoKTtcbiAgICAgIHJldHVybiBJTlZBTElEX1JFU1VMVDtcbiAgICB9XG5cbiAgICBjb25zdCBhY2Nlc3NJbmZvID0gdGhpcy5fZ2V0QXR0cmlidXRlSW5mbyhuYW1lIHx8IGxvY2F0aW9uKTtcblxuICAgIGlmICghYWNjZXNzSW5mbykge1xuICAgICAgcmV0dXJuIElOVkFMSURfUkVTVUxUO1xuICAgIH1cblxuICAgIGNvbnN0IGN1cnJlbnRBY2Nlc3NvciA9IHRoaXMuYWNjZXNzb3JzW2xvY2F0aW9uXSB8fCB7fTtcbiAgICBjb25zdCBhY2Nlc3NvciA9IEFjY2Vzc29yLnJlc29sdmUoYWNjZXNzSW5mby5hY2Nlc3NvciwgY3VycmVudEFjY2Vzc29yLCB2YWx1ZUFjY2Vzc29yLCBhcHBBY2Nlc3Nvcik7XG4gICAgY29uc3Qge1xuICAgICAgc2l6ZSxcbiAgICAgIHR5cGVcbiAgICB9ID0gYWNjZXNzb3I7XG4gICAgYXNzZXJ0KE51bWJlci5pc0Zpbml0ZShzaXplKSAmJiBOdW1iZXIuaXNGaW5pdGUodHlwZSkpO1xuICAgIHJldHVybiB7XG4gICAgICBsb2NhdGlvbixcbiAgICAgIGFjY2Vzc29yXG4gICAgfTtcbiAgfVxuXG4gIF9nZXRBdHRyaWJ1dGVJbmZvKGF0dHJpYnV0ZU5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5jb25maWd1cmF0aW9uICYmIHRoaXMuY29uZmlndXJhdGlvbi5nZXRBdHRyaWJ1dGVJbmZvKGF0dHJpYnV0ZU5hbWUpO1xuICB9XG5cbiAgX2dldEF0dHJpYnV0ZUluZGV4KGxvY2F0aW9uT3JOYW1lKSB7XG4gICAgY29uc3QgbG9jYXRpb24gPSBOdW1iZXIobG9jYXRpb25Pck5hbWUpO1xuXG4gICAgaWYgKE51bWJlci5pc0Zpbml0ZShsb2NhdGlvbikpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxvY2F0aW9uXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNvbnN0IG11bHRpTG9jYXRpb24gPSBNVUxUSV9MT0NBVElPTl9BVFRSSUJVVEVfUkVHRVhQLmV4ZWMobG9jYXRpb25Pck5hbWUpO1xuICAgIGNvbnN0IG5hbWUgPSBtdWx0aUxvY2F0aW9uID8gbXVsdGlMb2NhdGlvblsxXSA6IGxvY2F0aW9uT3JOYW1lO1xuICAgIGNvbnN0IGxvY2F0aW9uT2Zmc2V0ID0gbXVsdGlMb2NhdGlvbiA/IE51bWJlcihtdWx0aUxvY2F0aW9uWzJdKSA6IDA7XG5cbiAgICBpZiAodGhpcy5jb25maWd1cmF0aW9uKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsb2NhdGlvbjogdGhpcy5jb25maWd1cmF0aW9uLmdldEF0dHJpYnV0ZUxvY2F0aW9uKG5hbWUpICsgbG9jYXRpb25PZmZzZXQsXG4gICAgICAgIG5hbWVcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGxvY2F0aW9uOiAtMVxuICAgIH07XG4gIH1cblxuICBfc2V0QXR0cmlidXRlKGxvY2F0aW9uT3JOYW1lLCB2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIEJ1ZmZlcikge1xuICAgICAgdGhpcy5zZXRCdWZmZXIobG9jYXRpb25Pck5hbWUsIHZhbHVlKTtcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmxlbmd0aCAmJiB2YWx1ZVswXSBpbnN0YW5jZW9mIEJ1ZmZlcikge1xuICAgICAgY29uc3QgYnVmZmVyID0gdmFsdWVbMF07XG4gICAgICBjb25zdCBhY2Nlc3NvciA9IHZhbHVlWzFdO1xuICAgICAgdGhpcy5zZXRCdWZmZXIobG9jYXRpb25Pck5hbWUsIGJ1ZmZlciwgYWNjZXNzb3IpO1xuICAgIH0gZWxzZSBpZiAoQXJyYXlCdWZmZXIuaXNWaWV3KHZhbHVlKSB8fCBBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgY29uc3QgY29uc3RhbnQgPSB2YWx1ZTtcbiAgICAgIHRoaXMuc2V0Q29uc3RhbnQobG9jYXRpb25Pck5hbWUsIGNvbnN0YW50KTtcbiAgICB9IGVsc2UgaWYgKHZhbHVlLmJ1ZmZlciBpbnN0YW5jZW9mIEJ1ZmZlcikge1xuICAgICAgY29uc3QgYWNjZXNzb3IgPSB2YWx1ZTtcbiAgICAgIHRoaXMuc2V0QnVmZmVyKGxvY2F0aW9uT3JOYW1lLCBhY2Nlc3Nvci5idWZmZXIsIGFjY2Vzc29yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKEVSUl9BVFRSSUJVVEVfVFlQRSk7XG4gICAgfVxuICB9XG5cbiAgX3NldENvbnN0YW50QXR0cmlidXRlcyh2ZXJ0ZXhDb3VudCwgaW5zdGFuY2VDb3VudCkge1xuICAgIGNvbnN0IGVsZW1lbnRDb3VudCA9IE1hdGgubWF4KHZlcnRleENvdW50IHwgMCwgaW5zdGFuY2VDb3VudCB8IDApO1xuICAgIGxldCBjb25zdGFudCA9IHRoaXMudmFsdWVzWzBdO1xuXG4gICAgaWYgKEFycmF5QnVmZmVyLmlzVmlldyhjb25zdGFudCkpIHtcbiAgICAgIHRoaXMuX3NldENvbnN0YW50QXR0cmlidXRlWmVybyhjb25zdGFudCwgZWxlbWVudENvdW50KTtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBsb2NhdGlvbiA9IDE7IGxvY2F0aW9uIDwgdGhpcy52ZXJ0ZXhBcnJheU9iamVjdC5NQVhfQVRUUklCVVRFUzsgbG9jYXRpb24rKykge1xuICAgICAgY29uc3RhbnQgPSB0aGlzLnZhbHVlc1tsb2NhdGlvbl07XG5cbiAgICAgIGlmIChBcnJheUJ1ZmZlci5pc1ZpZXcoY29uc3RhbnQpKSB7XG4gICAgICAgIHRoaXMuX3NldENvbnN0YW50QXR0cmlidXRlKGxvY2F0aW9uLCBjb25zdGFudCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX3NldENvbnN0YW50QXR0cmlidXRlWmVybyhjb25zdGFudCwgZWxlbWVudENvdW50KSB7XG4gICAgaWYgKFZlcnRleEFycmF5T2JqZWN0LmlzU3VwcG9ydGVkKHRoaXMuZ2wsIHtcbiAgICAgIGNvbnN0YW50QXR0cmlidXRlWmVybzogdHJ1ZVxuICAgIH0pKSB7XG4gICAgICB0aGlzLl9zZXRDb25zdGFudEF0dHJpYnV0ZSgwLCBjb25zdGFudCk7XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBidWZmZXIgPSB0aGlzLnZlcnRleEFycmF5T2JqZWN0LmdldENvbnN0YW50QnVmZmVyKGVsZW1lbnRDb3VudCwgY29uc3RhbnQpO1xuICAgIHRoaXMudmVydGV4QXJyYXlPYmplY3Quc2V0QnVmZmVyKDAsIGJ1ZmZlciwgdGhpcy5hY2Nlc3NvcnNbMF0pO1xuICB9XG5cbiAgX3NldENvbnN0YW50QXR0cmlidXRlKGxvY2F0aW9uLCBjb25zdGFudCkge1xuICAgIFZlcnRleEFycmF5T2JqZWN0LnNldENvbnN0YW50KHRoaXMuZ2wsIGxvY2F0aW9uLCBjb25zdGFudCk7XG4gIH1cblxuICBfdXBkYXRlRHJhd1BhcmFtcygpIHtcbiAgICBjb25zdCBkcmF3UGFyYW1zID0ge1xuICAgICAgaXNJbmRleGVkOiBmYWxzZSxcbiAgICAgIGlzSW5zdGFuY2VkOiBmYWxzZSxcbiAgICAgIGluZGV4Q291bnQ6IEluZmluaXR5LFxuICAgICAgdmVydGV4Q291bnQ6IEluZmluaXR5LFxuICAgICAgaW5zdGFuY2VDb3VudDogSW5maW5pdHlcbiAgICB9O1xuXG4gICAgZm9yIChsZXQgbG9jYXRpb24gPSAwOyBsb2NhdGlvbiA8IHRoaXMudmVydGV4QXJyYXlPYmplY3QuTUFYX0FUVFJJQlVURVM7IGxvY2F0aW9uKyspIHtcbiAgICAgIHRoaXMuX3VwZGF0ZURyYXdQYXJhbXNGb3JMb2NhdGlvbihkcmF3UGFyYW1zLCBsb2NhdGlvbik7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZWxlbWVudHMpIHtcbiAgICAgIGRyYXdQYXJhbXMuZWxlbWVudENvdW50ID0gdGhpcy5lbGVtZW50cy5nZXRFbGVtZW50Q291bnQodGhpcy5lbGVtZW50cy5hY2Nlc3Nvcik7XG4gICAgICBkcmF3UGFyYW1zLmlzSW5kZXhlZCA9IHRydWU7XG4gICAgICBkcmF3UGFyYW1zLmluZGV4VHlwZSA9IHRoaXMuZWxlbWVudHNBY2Nlc3Nvci50eXBlIHx8IHRoaXMuZWxlbWVudHMuYWNjZXNzb3IudHlwZTtcbiAgICAgIGRyYXdQYXJhbXMuaW5kZXhPZmZzZXQgPSB0aGlzLmVsZW1lbnRzQWNjZXNzb3Iub2Zmc2V0IHx8IDA7XG4gICAgfVxuXG4gICAgaWYgKGRyYXdQYXJhbXMuaW5kZXhDb3VudCA9PT0gSW5maW5pdHkpIHtcbiAgICAgIGRyYXdQYXJhbXMuaW5kZXhDb3VudCA9IDA7XG4gICAgfVxuXG4gICAgaWYgKGRyYXdQYXJhbXMudmVydGV4Q291bnQgPT09IEluZmluaXR5KSB7XG4gICAgICBkcmF3UGFyYW1zLnZlcnRleENvdW50ID0gMDtcbiAgICB9XG5cbiAgICBpZiAoZHJhd1BhcmFtcy5pbnN0YW5jZUNvdW50ID09PSBJbmZpbml0eSkge1xuICAgICAgZHJhd1BhcmFtcy5pbnN0YW5jZUNvdW50ID0gMDtcbiAgICB9XG5cbiAgICByZXR1cm4gZHJhd1BhcmFtcztcbiAgfVxuXG4gIF91cGRhdGVEcmF3UGFyYW1zRm9yTG9jYXRpb24oZHJhd1BhcmFtcywgbG9jYXRpb24pIHtcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMudmFsdWVzW2xvY2F0aW9uXTtcbiAgICBjb25zdCBhY2Nlc3NvciA9IHRoaXMuYWNjZXNzb3JzW2xvY2F0aW9uXTtcblxuICAgIGlmICghdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB7XG4gICAgICBkaXZpc29yXG4gICAgfSA9IGFjY2Vzc29yO1xuICAgIGNvbnN0IGlzSW5zdGFuY2VkID0gZGl2aXNvciA+IDA7XG4gICAgZHJhd1BhcmFtcy5pc0luc3RhbmNlZCA9IGRyYXdQYXJhbXMuaXNJbnN0YW5jZWQgfHwgaXNJbnN0YW5jZWQ7XG5cbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBCdWZmZXIpIHtcbiAgICAgIGNvbnN0IGJ1ZmZlciA9IHZhbHVlO1xuXG4gICAgICBpZiAoaXNJbnN0YW5jZWQpIHtcbiAgICAgICAgY29uc3QgaW5zdGFuY2VDb3VudCA9IGJ1ZmZlci5nZXRWZXJ0ZXhDb3VudChhY2Nlc3Nvcik7XG4gICAgICAgIGRyYXdQYXJhbXMuaW5zdGFuY2VDb3VudCA9IE1hdGgubWluKGRyYXdQYXJhbXMuaW5zdGFuY2VDb3VudCwgaW5zdGFuY2VDb3VudCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCB2ZXJ0ZXhDb3VudCA9IGJ1ZmZlci5nZXRWZXJ0ZXhDb3VudChhY2Nlc3Nvcik7XG4gICAgICAgIGRyYXdQYXJhbXMudmVydGV4Q291bnQgPSBNYXRoLm1pbihkcmF3UGFyYW1zLnZlcnRleENvdW50LCB2ZXJ0ZXhDb3VudCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc2V0RWxlbWVudHMoZWxlbWVudEJ1ZmZlciA9IG51bGwsIGFjY2Vzc29yID0ge30pIHtcbiAgICBsb2cuZGVwcmVjYXRlZCgnc2V0RWxlbWVudHMnLCAnc2V0RWxlbWVudEJ1ZmZlcicpKCk7XG4gICAgcmV0dXJuIHRoaXMuc2V0RWxlbWVudEJ1ZmZlcihlbGVtZW50QnVmZmVyLCBhY2Nlc3Nvcik7XG4gIH1cblxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dmVydGV4LWFycmF5LmpzLm1hcCIsImltcG9ydCB7IGdldENvbXBvc2l0ZUdMVHlwZSB9IGZyb20gJy4uL3dlYmdsLXV0aWxzL2F0dHJpYnV0ZS11dGlscyc7XG5leHBvcnQgZnVuY3Rpb24gZ2V0RGVidWdUYWJsZUZvclByb2dyYW1Db25maWd1cmF0aW9uKGNvbmZpZykge1xuICBjb25zdCB0YWJsZSA9IHt9O1xuICBjb25zdCBoZWFkZXIgPSBgQWNjZXNzb3JzIGZvciAke2NvbmZpZy5pZH1gO1xuXG4gIGZvciAoY29uc3QgYXR0cmlidXRlSW5mbyBvZiBjb25maWcuYXR0cmlidXRlSW5mb3MpIHtcbiAgICBpZiAoYXR0cmlidXRlSW5mbykge1xuICAgICAgY29uc3QgZ2xzbERlY2xhcmF0aW9uID0gZ2V0R0xTTERlY2xhcmF0aW9uKGF0dHJpYnV0ZUluZm8pO1xuICAgICAgdGFibGVbYGluICR7Z2xzbERlY2xhcmF0aW9ufWBdID0ge1xuICAgICAgICBbaGVhZGVyXTogSlNPTi5zdHJpbmdpZnkoYXR0cmlidXRlSW5mby5hY2Nlc3NvcilcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgZm9yIChjb25zdCB2YXJ5aW5nSW5mbyBvZiBjb25maWcudmFyeWluZ0luZm9zKSB7XG4gICAgaWYgKHZhcnlpbmdJbmZvKSB7XG4gICAgICBjb25zdCBnbHNsRGVjbGFyYXRpb24gPSBnZXRHTFNMRGVjbGFyYXRpb24odmFyeWluZ0luZm8pO1xuICAgICAgdGFibGVbYG91dCAke2dsc2xEZWNsYXJhdGlvbn1gXSA9IHtcbiAgICAgICAgW2hlYWRlcl06IEpTT04uc3RyaW5naWZ5KHZhcnlpbmdJbmZvLmFjY2Vzc29yKVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGFibGU7XG59XG5cbmZ1bmN0aW9uIGdldEdMU0xEZWNsYXJhdGlvbihhdHRyaWJ1dGVJbmZvKSB7XG4gIGNvbnN0IHtcbiAgICB0eXBlLFxuICAgIHNpemVcbiAgfSA9IGF0dHJpYnV0ZUluZm8uYWNjZXNzb3I7XG4gIGNvbnN0IHR5cGVBbmROYW1lID0gZ2V0Q29tcG9zaXRlR0xUeXBlKHR5cGUsIHNpemUpO1xuXG4gIGlmICh0eXBlQW5kTmFtZSkge1xuICAgIHJldHVybiBgJHt0eXBlQW5kTmFtZS5uYW1lfSAke2F0dHJpYnV0ZUluZm8ubmFtZX1gO1xuICB9XG5cbiAgcmV0dXJuIGF0dHJpYnV0ZUluZm8ubmFtZTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRlYnVnLXByb2dyYW0tY29uZmlndXJhdGlvbi5qcy5tYXAiLCJpbXBvcnQgeyBhc3NlcnQgfSBmcm9tICcuLi91dGlscy9hc3NlcnQnO1xuaW1wb3J0IHsgZm9ybWF0VmFsdWUgfSBmcm9tICcuLi91dGlscy9mb3JtYXQtdmFsdWUnO1xuZXhwb3J0IGZ1bmN0aW9uIGdldERlYnVnVGFibGVGb3JVbmlmb3Jtcyh7XG4gIGhlYWRlciA9ICdVbmlmb3JtcycsXG4gIHByb2dyYW0sXG4gIHVuaWZvcm1zLFxuICB1bmRlZmluZWRPbmx5ID0gZmFsc2Vcbn0pIHtcbiAgYXNzZXJ0KHByb2dyYW0pO1xuICBjb25zdCBTSEFERVJfTU9EVUxFX1VOSUZPUk1fUkVHRVhQID0gJy4qXy4qJztcbiAgY29uc3QgUFJPSkVDVF9NT0RVTEVfVU5JRk9STV9SRUdFWFAgPSAnLipNYXRyaXgnO1xuICBjb25zdCB1bmlmb3JtTG9jYXRpb25zID0gcHJvZ3JhbS5fdW5pZm9ybVNldHRlcnM7XG4gIGNvbnN0IHRhYmxlID0ge307XG4gIGNvbnN0IHVuaWZvcm1OYW1lcyA9IE9iamVjdC5rZXlzKHVuaWZvcm1Mb2NhdGlvbnMpLnNvcnQoKTtcbiAgbGV0IGNvdW50ID0gMDtcblxuICBmb3IgKGNvbnN0IHVuaWZvcm1OYW1lIG9mIHVuaWZvcm1OYW1lcykge1xuICAgIGlmICghdW5pZm9ybU5hbWUubWF0Y2goU0hBREVSX01PRFVMRV9VTklGT1JNX1JFR0VYUCkgJiYgIXVuaWZvcm1OYW1lLm1hdGNoKFBST0pFQ1RfTU9EVUxFX1VOSUZPUk1fUkVHRVhQKSkge1xuICAgICAgaWYgKGFkZFVuaWZvcm1Ub1RhYmxlKHtcbiAgICAgICAgdGFibGUsXG4gICAgICAgIGhlYWRlcixcbiAgICAgICAgdW5pZm9ybXMsXG4gICAgICAgIHVuaWZvcm1OYW1lLFxuICAgICAgICB1bmRlZmluZWRPbmx5XG4gICAgICB9KSkge1xuICAgICAgICBjb3VudCsrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZvciAoY29uc3QgdW5pZm9ybU5hbWUgb2YgdW5pZm9ybU5hbWVzKSB7XG4gICAgaWYgKHVuaWZvcm1OYW1lLm1hdGNoKFBST0pFQ1RfTU9EVUxFX1VOSUZPUk1fUkVHRVhQKSkge1xuICAgICAgaWYgKGFkZFVuaWZvcm1Ub1RhYmxlKHtcbiAgICAgICAgdGFibGUsXG4gICAgICAgIGhlYWRlcixcbiAgICAgICAgdW5pZm9ybXMsXG4gICAgICAgIHVuaWZvcm1OYW1lLFxuICAgICAgICB1bmRlZmluZWRPbmx5XG4gICAgICB9KSkge1xuICAgICAgICBjb3VudCsrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZvciAoY29uc3QgdW5pZm9ybU5hbWUgb2YgdW5pZm9ybU5hbWVzKSB7XG4gICAgaWYgKCF0YWJsZVt1bmlmb3JtTmFtZV0pIHtcbiAgICAgIGlmIChhZGRVbmlmb3JtVG9UYWJsZSh7XG4gICAgICAgIHRhYmxlLFxuICAgICAgICBoZWFkZXIsXG4gICAgICAgIHVuaWZvcm1zLFxuICAgICAgICB1bmlmb3JtTmFtZSxcbiAgICAgICAgdW5kZWZpbmVkT25seVxuICAgICAgfSkpIHtcbiAgICAgICAgY291bnQrKztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBsZXQgdW51c2VkQ291bnQgPSAwO1xuICBjb25zdCB1bnVzZWRUYWJsZSA9IHt9O1xuXG4gIGlmICghdW5kZWZpbmVkT25seSkge1xuICAgIGZvciAoY29uc3QgdW5pZm9ybU5hbWUgaW4gdW5pZm9ybXMpIHtcbiAgICAgIGNvbnN0IHVuaWZvcm0gPSB1bmlmb3Jtc1t1bmlmb3JtTmFtZV07XG5cbiAgICAgIGlmICghdGFibGVbdW5pZm9ybU5hbWVdKSB7XG4gICAgICAgIHVudXNlZENvdW50Kys7XG4gICAgICAgIHVudXNlZFRhYmxlW3VuaWZvcm1OYW1lXSA9IHtcbiAgICAgICAgICBUeXBlOiBgTk9UIFVTRUQ6ICR7dW5pZm9ybX1gLFxuICAgICAgICAgIFtoZWFkZXJdOiBmb3JtYXRWYWx1ZSh1bmlmb3JtKVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgdGFibGUsXG4gICAgY291bnQsXG4gICAgdW51c2VkVGFibGUsXG4gICAgdW51c2VkQ291bnRcbiAgfTtcbn1cblxuZnVuY3Rpb24gYWRkVW5pZm9ybVRvVGFibGUoe1xuICB0YWJsZSxcbiAgaGVhZGVyLFxuICB1bmlmb3JtcyxcbiAgdW5pZm9ybU5hbWUsXG4gIHVuZGVmaW5lZE9ubHlcbn0pIHtcbiAgY29uc3QgdmFsdWUgPSB1bmlmb3Jtc1t1bmlmb3JtTmFtZV07XG4gIGNvbnN0IGlzRGVmaW5lZCA9IGlzVW5pZm9ybURlZmluZWQodmFsdWUpO1xuXG4gIGlmICghdW5kZWZpbmVkT25seSB8fCAhaXNEZWZpbmVkKSB7XG4gICAgdGFibGVbdW5pZm9ybU5hbWVdID0ge1xuICAgICAgW2hlYWRlcl06IGlzRGVmaW5lZCA/IGZvcm1hdFZhbHVlKHZhbHVlKSA6ICdOL0EnLFxuICAgICAgJ1VuaWZvcm0gVHlwZSc6IGlzRGVmaW5lZCA/IHZhbHVlIDogJ05PVCBQUk9WSURFRCdcbiAgICB9O1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBpc1VuaWZvcm1EZWZpbmVkKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGVidWctdW5pZm9ybXMuanMubWFwIiwiaW1wb3J0IEJ1ZmZlciBmcm9tICcuLi9jbGFzc2VzL2J1ZmZlcic7XG5pbXBvcnQgeyBnZXRLZXkgfSBmcm9tICcuLi93ZWJnbC11dGlscy9jb25zdGFudHMtdG8ta2V5cyc7XG5pbXBvcnQgeyBnZXRDb21wb3NpdGVHTFR5cGUgfSBmcm9tICcuLi93ZWJnbC11dGlscy9hdHRyaWJ1dGUtdXRpbHMnO1xuaW1wb3J0IHsgZm9ybWF0VmFsdWUgfSBmcm9tICcuLi91dGlscy9mb3JtYXQtdmFsdWUnO1xuZXhwb3J0IGZ1bmN0aW9uIGdldERlYnVnVGFibGVGb3JWZXJ0ZXhBcnJheSh7XG4gIHZlcnRleEFycmF5LFxuICBoZWFkZXIgPSAnQXR0cmlidXRlcydcbn0pIHtcbiAgaWYgKCF2ZXJ0ZXhBcnJheS5jb25maWd1cmF0aW9uKSB7XG4gICAgcmV0dXJuIHt9O1xuICB9XG5cbiAgY29uc3QgdGFibGUgPSB7fTtcblxuICBpZiAodmVydGV4QXJyYXkuZWxlbWVudHMpIHtcbiAgICB0YWJsZS5FTEVNRU5UX0FSUkFZX0JVRkZFUiA9IGdldERlYnVnVGFibGVSb3codmVydGV4QXJyYXksIHZlcnRleEFycmF5LmVsZW1lbnRzLCBudWxsLCBoZWFkZXIpO1xuICB9XG5cbiAgY29uc3QgYXR0cmlidXRlcyA9IHZlcnRleEFycmF5LnZhbHVlcztcblxuICBmb3IgKGNvbnN0IGF0dHJpYnV0ZUxvY2F0aW9uIGluIGF0dHJpYnV0ZXMpIHtcbiAgICBjb25zdCBpbmZvID0gdmVydGV4QXJyYXkuX2dldEF0dHJpYnV0ZUluZm8oYXR0cmlidXRlTG9jYXRpb24pO1xuXG4gICAgaWYgKGluZm8pIHtcbiAgICAgIGxldCByb3dIZWFkZXIgPSBgJHthdHRyaWJ1dGVMb2NhdGlvbn06ICR7aW5mby5uYW1lfWA7XG4gICAgICBjb25zdCBhY2Nlc3NvciA9IHZlcnRleEFycmF5LmFjY2Vzc29yc1tpbmZvLmxvY2F0aW9uXTtcblxuICAgICAgaWYgKGFjY2Vzc29yKSB7XG4gICAgICAgIHJvd0hlYWRlciA9IGAke2F0dHJpYnV0ZUxvY2F0aW9ufTogJHtnZXRHTFNMRGVjbGFyYXRpb24oaW5mby5uYW1lLCBhY2Nlc3Nvcil9YDtcbiAgICAgIH1cblxuICAgICAgdGFibGVbcm93SGVhZGVyXSA9IGdldERlYnVnVGFibGVSb3codmVydGV4QXJyYXksIGF0dHJpYnV0ZXNbYXR0cmlidXRlTG9jYXRpb25dLCBhY2Nlc3NvciwgaGVhZGVyKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGFibGU7XG59XG5cbmZ1bmN0aW9uIGdldERlYnVnVGFibGVSb3codmVydGV4QXJyYXksIGF0dHJpYnV0ZSwgYWNjZXNzb3IsIGhlYWRlcikge1xuICBjb25zdCB7XG4gICAgZ2xcbiAgfSA9IHZlcnRleEFycmF5O1xuXG4gIGlmICghYXR0cmlidXRlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIFtoZWFkZXJdOiAnbnVsbCcsXG4gICAgICAnRm9ybWF0ICc6ICdOL0EnXG4gICAgfTtcbiAgfVxuXG4gIGxldCB0eXBlID0gJ05PVCBQUk9WSURFRCc7XG4gIGxldCBzaXplID0gMTtcbiAgbGV0IHZlcnRzID0gMDtcbiAgbGV0IGJ5dGVzID0gMDtcbiAgbGV0IGlzSW50ZWdlcjtcbiAgbGV0IG1hcmtlcjtcbiAgbGV0IHZhbHVlO1xuXG4gIGlmIChhY2Nlc3Nvcikge1xuICAgIHR5cGUgPSBhY2Nlc3Nvci50eXBlO1xuICAgIHNpemUgPSBhY2Nlc3Nvci5zaXplO1xuICAgIHR5cGUgPSBTdHJpbmcodHlwZSkucmVwbGFjZSgnQXJyYXknLCAnJyk7XG4gICAgaXNJbnRlZ2VyID0gdHlwZS5pbmRleE9mKCdudCcpICE9PSAtMTtcbiAgfVxuXG4gIGlmIChhdHRyaWJ1dGUgaW5zdGFuY2VvZiBCdWZmZXIpIHtcbiAgICBjb25zdCBidWZmZXIgPSBhdHRyaWJ1dGU7XG4gICAgY29uc3Qge1xuICAgICAgZGF0YSxcbiAgICAgIGNoYW5nZWRcbiAgICB9ID0gYnVmZmVyLmdldERlYnVnRGF0YSgpO1xuICAgIG1hcmtlciA9IGNoYW5nZWQgPyAnKicgOiAnJztcbiAgICB2YWx1ZSA9IGRhdGE7XG4gICAgYnl0ZXMgPSBidWZmZXIuYnl0ZUxlbmd0aDtcbiAgICB2ZXJ0cyA9IGJ5dGVzIC8gZGF0YS5CWVRFU19QRVJfRUxFTUVOVCAvIHNpemU7XG4gICAgbGV0IGZvcm1hdDtcblxuICAgIGlmIChhY2Nlc3Nvcikge1xuICAgICAgY29uc3QgaW5zdGFuY2VkID0gYWNjZXNzb3IuZGl2aXNvciA+IDA7XG4gICAgICBmb3JtYXQgPSBgJHtpbnN0YW5jZWQgPyAnSSAnIDogJ1AgJ30gJHt2ZXJ0c30gKHgke3NpemV9PSR7Ynl0ZXN9IGJ5dGVzICR7Z2V0S2V5KGdsLCB0eXBlKX0pYDtcbiAgICB9IGVsc2Uge1xuICAgICAgaXNJbnRlZ2VyID0gdHJ1ZTtcbiAgICAgIGZvcm1hdCA9IGAke2J5dGVzfSBieXRlc2A7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIFtoZWFkZXJdOiBgJHttYXJrZXJ9JHtmb3JtYXRWYWx1ZSh2YWx1ZSwge1xuICAgICAgICBzaXplLFxuICAgICAgICBpc0ludGVnZXJcbiAgICAgIH0pfWAsXG4gICAgICAnRm9ybWF0ICc6IGZvcm1hdFxuICAgIH07XG4gIH1cblxuICB2YWx1ZSA9IGF0dHJpYnV0ZTtcbiAgc2l6ZSA9IGF0dHJpYnV0ZS5sZW5ndGg7XG4gIHR5cGUgPSBTdHJpbmcoYXR0cmlidXRlLmNvbnN0cnVjdG9yLm5hbWUpLnJlcGxhY2UoJ0FycmF5JywgJycpO1xuICBpc0ludGVnZXIgPSB0eXBlLmluZGV4T2YoJ250JykgIT09IC0xO1xuICByZXR1cm4ge1xuICAgIFtoZWFkZXJdOiBgJHtmb3JtYXRWYWx1ZSh2YWx1ZSwge1xuICAgICAgc2l6ZSxcbiAgICAgIGlzSW50ZWdlclxuICAgIH0pfSAoY29uc3RhbnQpYCxcbiAgICAnRm9ybWF0ICc6IGAke3NpemV9eCR7dHlwZX0gKGNvbnN0YW50KWBcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0R0xTTERlY2xhcmF0aW9uKG5hbWUsIGFjY2Vzc29yKSB7XG4gIGNvbnN0IHtcbiAgICB0eXBlLFxuICAgIHNpemVcbiAgfSA9IGFjY2Vzc29yO1xuICBjb25zdCB0eXBlQW5kTmFtZSA9IGdldENvbXBvc2l0ZUdMVHlwZSh0eXBlLCBzaXplKTtcbiAgcmV0dXJuIHR5cGVBbmROYW1lID8gYCR7bmFtZX0gKCR7dHlwZUFuZE5hbWUubmFtZX0pYCA6IG5hbWU7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kZWJ1Zy12ZXJ0ZXgtYXJyYXkuanMubWFwIiwiaW1wb3J0IFdFQkdMX0ZFQVRVUkVTIGZyb20gJy4vd2ViZ2wtZmVhdHVyZXMtdGFibGUnO1xuaW1wb3J0IHsgaXNXZWJHTDIsIGxvZyB9IGZyb20gJ0BsdW1hLmdsL2dsdG9vbHMnO1xuaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSAnLi4vdXRpbHMvYXNzZXJ0JztcbmNvbnN0IExPR19VTlNVUFBPUlRFRF9GRUFUVVJFID0gMjtcbmV4cG9ydCBmdW5jdGlvbiBoYXNGZWF0dXJlKGdsLCBmZWF0dXJlKSB7XG4gIHJldHVybiBoYXNGZWF0dXJlcyhnbCwgZmVhdHVyZSk7XG59XG5leHBvcnQgZnVuY3Rpb24gaGFzRmVhdHVyZXMoZ2wsIGZlYXR1cmVzKSB7XG4gIGZlYXR1cmVzID0gQXJyYXkuaXNBcnJheShmZWF0dXJlcykgPyBmZWF0dXJlcyA6IFtmZWF0dXJlc107XG4gIHJldHVybiBmZWF0dXJlcy5ldmVyeShmZWF0dXJlID0+IHtcbiAgICByZXR1cm4gaXNGZWF0dXJlU3VwcG9ydGVkKGdsLCBmZWF0dXJlKTtcbiAgfSk7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0RmVhdHVyZXMoZ2wpIHtcbiAgZ2wubHVtYSA9IGdsLmx1bWEgfHwge307XG4gIGdsLmx1bWEuY2FwcyA9IGdsLmx1bWEuY2FwcyB8fCB7fTtcblxuICBmb3IgKGNvbnN0IGNhcCBpbiBXRUJHTF9GRUFUVVJFUykge1xuICAgIGlmIChnbC5sdW1hLmNhcHNbY2FwXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBnbC5sdW1hLmNhcHNbY2FwXSA9IGlzRmVhdHVyZVN1cHBvcnRlZChnbCwgY2FwKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZ2wubHVtYS5jYXBzO1xufVxuXG5mdW5jdGlvbiBpc0ZlYXR1cmVTdXBwb3J0ZWQoZ2wsIGNhcCkge1xuICBnbC5sdW1hID0gZ2wubHVtYSB8fCB7fTtcbiAgZ2wubHVtYS5jYXBzID0gZ2wubHVtYS5jYXBzIHx8IHt9O1xuXG4gIGlmIChnbC5sdW1hLmNhcHNbY2FwXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZ2wubHVtYS5jYXBzW2NhcF0gPSBxdWVyeUZlYXR1cmUoZ2wsIGNhcCk7XG4gIH1cblxuICBpZiAoIWdsLmx1bWEuY2Fwc1tjYXBdKSB7XG4gICAgbG9nLmxvZyhMT0dfVU5TVVBQT1JURURfRkVBVFVSRSwgYEZlYXR1cmU6ICR7Y2FwfSBub3Qgc3VwcG9ydGVkYCkoKTtcbiAgfVxuXG4gIHJldHVybiBnbC5sdW1hLmNhcHNbY2FwXTtcbn1cblxuZnVuY3Rpb24gcXVlcnlGZWF0dXJlKGdsLCBjYXApIHtcbiAgY29uc3QgZmVhdHVyZSA9IFdFQkdMX0ZFQVRVUkVTW2NhcF07XG4gIGFzc2VydChmZWF0dXJlLCBjYXApO1xuICBsZXQgaXNTdXBwb3J0ZWQ7XG4gIGNvbnN0IGZlYXR1cmVEZWZpbml0aW9uID0gaXNXZWJHTDIoZ2wpID8gZmVhdHVyZVsxXSB8fCBmZWF0dXJlWzBdIDogZmVhdHVyZVswXTtcblxuICBpZiAodHlwZW9mIGZlYXR1cmVEZWZpbml0aW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgaXNTdXBwb3J0ZWQgPSBmZWF0dXJlRGVmaW5pdGlvbihnbCk7XG4gIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShmZWF0dXJlRGVmaW5pdGlvbikpIHtcbiAgICBpc1N1cHBvcnRlZCA9IHRydWU7XG5cbiAgICBmb3IgKGNvbnN0IGV4dGVuc2lvbiBvZiBmZWF0dXJlRGVmaW5pdGlvbikge1xuICAgICAgaXNTdXBwb3J0ZWQgPSBpc1N1cHBvcnRlZCAmJiBCb29sZWFuKGdsLmdldEV4dGVuc2lvbihleHRlbnNpb24pKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZW9mIGZlYXR1cmVEZWZpbml0aW9uID09PSAnc3RyaW5nJykge1xuICAgIGlzU3VwcG9ydGVkID0gQm9vbGVhbihnbC5nZXRFeHRlbnNpb24oZmVhdHVyZURlZmluaXRpb24pKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZmVhdHVyZURlZmluaXRpb24gPT09ICdib29sZWFuJykge1xuICAgIGlzU3VwcG9ydGVkID0gZmVhdHVyZURlZmluaXRpb247XG4gIH0gZWxzZSB7XG4gICAgYXNzZXJ0KGZhbHNlKTtcbiAgfVxuXG4gIHJldHVybiBpc1N1cHBvcnRlZDtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWZlYXR1cmVzLmpzLm1hcCIsImltcG9ydCBGcmFtZWJ1ZmZlciBmcm9tICcuLi9jbGFzc2VzL2ZyYW1lYnVmZmVyJztcbmltcG9ydCBUZXh0dXJlMkQgZnJvbSAnLi4vY2xhc3Nlcy90ZXh0dXJlLTJkJztcbmV4cG9ydCBjb25zdCBGRUFUVVJFUyA9IHtcbiAgV0VCR0wyOiAnV0VCR0wyJyxcbiAgVkVSVEVYX0FSUkFZX09CSkVDVDogJ1ZFUlRFWF9BUlJBWV9PQkpFQ1QnLFxuICBUSU1FUl9RVUVSWTogJ1RJTUVSX1FVRVJZJyxcbiAgSU5TVEFOQ0VEX1JFTkRFUklORzogJ0lOU1RBTkNFRF9SRU5ERVJJTkcnLFxuICBNVUxUSVBMRV9SRU5ERVJfVEFSR0VUUzogJ01VTFRJUExFX1JFTkRFUl9UQVJHRVRTJyxcbiAgRUxFTUVOVF9JTkRFWF9VSU5UMzI6ICdFTEVNRU5UX0lOREVYX1VJTlQzMicsXG4gIEJMRU5EX0VRVUFUSU9OX01JTk1BWDogJ0JMRU5EX0VRVUFUSU9OX01JTk1BWCcsXG4gIEZMT0FUX0JMRU5EOiAnRkxPQVRfQkxFTkQnLFxuICBDT0xPUl9FTkNPRElOR19TUkdCOiAnQ09MT1JfRU5DT0RJTkdfU1JHQicsXG4gIFRFWFRVUkVfREVQVEg6ICdURVhUVVJFX0RFUFRIJyxcbiAgVEVYVFVSRV9GTE9BVDogJ1RFWFRVUkVfRkxPQVQnLFxuICBURVhUVVJFX0hBTEZfRkxPQVQ6ICdURVhUVVJFX0hBTEZfRkxPQVQnLFxuICBURVhUVVJFX0ZJTFRFUl9MSU5FQVJfRkxPQVQ6ICdURVhUVVJFX0ZJTFRFUl9MSU5FQVJfRkxPQVQnLFxuICBURVhUVVJFX0ZJTFRFUl9MSU5FQVJfSEFMRl9GTE9BVDogJ1RFWFRVUkVfRklMVEVSX0xJTkVBUl9IQUxGX0ZMT0FUJyxcbiAgVEVYVFVSRV9GSUxURVJfQU5JU09UUk9QSUM6ICdURVhUVVJFX0ZJTFRFUl9BTklTT1RST1BJQycsXG4gIENPTE9SX0FUVEFDSE1FTlRfUkdCQTMyRjogJ0NPTE9SX0FUVEFDSE1FTlRfUkdCQTMyRicsXG4gIENPTE9SX0FUVEFDSE1FTlRfRkxPQVQ6ICdDT0xPUl9BVFRBQ0hNRU5UX0ZMT0FUJyxcbiAgQ09MT1JfQVRUQUNITUVOVF9IQUxGX0ZMT0FUOiAnQ09MT1JfQVRUQUNITUVOVF9IQUxGX0ZMT0FUJyxcbiAgR0xTTF9GUkFHX0RBVEE6ICdHTFNMX0ZSQUdfREFUQScsXG4gIEdMU0xfRlJBR19ERVBUSDogJ0dMU0xfRlJBR19ERVBUSCcsXG4gIEdMU0xfREVSSVZBVElWRVM6ICdHTFNMX0RFUklWQVRJVkVTJyxcbiAgR0xTTF9URVhUVVJFX0xPRDogJ0dMU0xfVEVYVFVSRV9MT0QnXG59O1xuXG5mdW5jdGlvbiBjaGVja0Zsb2F0MzJDb2xvckF0dGFjaG1lbnQoZ2wpIHtcbiAgY29uc3QgdGVzdFRleHR1cmUgPSBuZXcgVGV4dHVyZTJEKGdsLCB7XG4gICAgZm9ybWF0OiA2NDA4LFxuICAgIHR5cGU6IDUxMjYsXG4gICAgZGF0YUZvcm1hdDogNjQwOFxuICB9KTtcbiAgY29uc3QgdGVzdEZiID0gbmV3IEZyYW1lYnVmZmVyKGdsLCB7XG4gICAgaWQ6IGB0ZXN0LWZyYW1lYnVmZmVyYCxcbiAgICBjaGVjazogZmFsc2UsXG4gICAgYXR0YWNobWVudHM6IHtcbiAgICAgIFszNjA2NF06IHRlc3RUZXh0dXJlXG4gICAgfVxuICB9KTtcbiAgY29uc3Qgc3RhdHVzID0gdGVzdEZiLmdldFN0YXR1cygpO1xuICB0ZXN0VGV4dHVyZS5kZWxldGUoKTtcbiAgdGVzdEZiLmRlbGV0ZSgpO1xuICByZXR1cm4gc3RhdHVzID09PSAzNjA1Mztcbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICBbRkVBVFVSRVMuV0VCR0wyXTogW2ZhbHNlLCB0cnVlXSxcbiAgW0ZFQVRVUkVTLlZFUlRFWF9BUlJBWV9PQkpFQ1RdOiBbJ09FU192ZXJ0ZXhfYXJyYXlfb2JqZWN0JywgdHJ1ZV0sXG4gIFtGRUFUVVJFUy5USU1FUl9RVUVSWV06IFsnRVhUX2Rpc2pvaW50X3RpbWVyX3F1ZXJ5JywgJ0VYVF9kaXNqb2ludF90aW1lcl9xdWVyeV93ZWJnbDInXSxcbiAgW0ZFQVRVUkVTLklOU1RBTkNFRF9SRU5ERVJJTkddOiBbJ0FOR0xFX2luc3RhbmNlZF9hcnJheXMnLCB0cnVlXSxcbiAgW0ZFQVRVUkVTLk1VTFRJUExFX1JFTkRFUl9UQVJHRVRTXTogWydXRUJHTF9kcmF3X2J1ZmZlcnMnLCB0cnVlXSxcbiAgW0ZFQVRVUkVTLkVMRU1FTlRfSU5ERVhfVUlOVDMyXTogWydPRVNfZWxlbWVudF9pbmRleF91aW50JywgdHJ1ZV0sXG4gIFtGRUFUVVJFUy5CTEVORF9FUVVBVElPTl9NSU5NQVhdOiBbJ0VYVF9ibGVuZF9taW5tYXgnLCB0cnVlXSxcbiAgW0ZFQVRVUkVTLkZMT0FUX0JMRU5EXTogWydFWFRfZmxvYXRfYmxlbmQnXSxcbiAgW0ZFQVRVUkVTLkNPTE9SX0VOQ09ESU5HX1NSR0JdOiBbJ0VYVF9zUkdCJywgdHJ1ZV0sXG4gIFtGRUFUVVJFUy5URVhUVVJFX0RFUFRIXTogWydXRUJHTF9kZXB0aF90ZXh0dXJlJywgdHJ1ZV0sXG4gIFtGRUFUVVJFUy5URVhUVVJFX0ZMT0FUXTogWydPRVNfdGV4dHVyZV9mbG9hdCcsIHRydWVdLFxuICBbRkVBVFVSRVMuVEVYVFVSRV9IQUxGX0ZMT0FUXTogWydPRVNfdGV4dHVyZV9oYWxmX2Zsb2F0JywgdHJ1ZV0sXG4gIFtGRUFUVVJFUy5URVhUVVJFX0ZJTFRFUl9MSU5FQVJfRkxPQVRdOiBbJ09FU190ZXh0dXJlX2Zsb2F0X2xpbmVhciddLFxuICBbRkVBVFVSRVMuVEVYVFVSRV9GSUxURVJfTElORUFSX0hBTEZfRkxPQVRdOiBbJ09FU190ZXh0dXJlX2hhbGZfZmxvYXRfbGluZWFyJ10sXG4gIFtGRUFUVVJFUy5URVhUVVJFX0ZJTFRFUl9BTklTT1RST1BJQ106IFsnRVhUX3RleHR1cmVfZmlsdGVyX2FuaXNvdHJvcGljJ10sXG4gIFtGRUFUVVJFUy5DT0xPUl9BVFRBQ0hNRU5UX1JHQkEzMkZdOiBbY2hlY2tGbG9hdDMyQ29sb3JBdHRhY2htZW50LCAnRVhUX2NvbG9yX2J1ZmZlcl9mbG9hdCddLFxuICBbRkVBVFVSRVMuQ09MT1JfQVRUQUNITUVOVF9GTE9BVF06IFtmYWxzZSwgJ0VYVF9jb2xvcl9idWZmZXJfZmxvYXQnXSxcbiAgW0ZFQVRVUkVTLkNPTE9SX0FUVEFDSE1FTlRfSEFMRl9GTE9BVF06IFsnRVhUX2NvbG9yX2J1ZmZlcl9oYWxmX2Zsb2F0J10sXG4gIFtGRUFUVVJFUy5HTFNMX0ZSQUdfREFUQV06IFsnV0VCR0xfZHJhd19idWZmZXJzJywgdHJ1ZV0sXG4gIFtGRUFUVVJFUy5HTFNMX0ZSQUdfREVQVEhdOiBbJ0VYVF9mcmFnX2RlcHRoJywgdHJ1ZV0sXG4gIFtGRUFUVVJFUy5HTFNMX0RFUklWQVRJVkVTXTogWydPRVNfc3RhbmRhcmRfZGVyaXZhdGl2ZXMnLCB0cnVlXSxcbiAgW0ZFQVRVUkVTLkdMU0xfVEVYVFVSRV9MT0RdOiBbJ0VYVF9zaGFkZXJfdGV4dHVyZV9sb2QnLCB0cnVlXVxufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXdlYmdsLWZlYXR1cmVzLXRhYmxlLmpzLm1hcCIsImltcG9ydCBnZXRTaGFkZXJOYW1lIGZyb20gJy4vZ2V0LXNoYWRlci1uYW1lJztcbmltcG9ydCBnZXRTaGFkZXJUeXBlTmFtZSBmcm9tICcuL2dldC1zaGFkZXItdHlwZS1uYW1lJztcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZvcm1hdEdMU0xDb21waWxlckVycm9yKGVyckxvZywgc3JjLCBzaGFkZXJUeXBlKSB7XG4gIGNvbnN0IHtcbiAgICBzaGFkZXJOYW1lLFxuICAgIGVycm9ycyxcbiAgICB3YXJuaW5nc1xuICB9ID0gcGFyc2VHTFNMQ29tcGlsZXJFcnJvcihlcnJMb2csIHNyYywgc2hhZGVyVHlwZSk7XG4gIHJldHVybiBgR0xTTCBjb21waWxhdGlvbiBlcnJvciBpbiAke3NoYWRlck5hbWV9XFxuXFxuJHtlcnJvcnN9XFxuJHt3YXJuaW5nc31gO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlR0xTTENvbXBpbGVyRXJyb3IoZXJyTG9nLCBzcmMsIHNoYWRlclR5cGUsIHNoYWRlck5hbWUpIHtcbiAgY29uc3QgZXJyb3JTdHJpbmdzID0gZXJyTG9nLnNwbGl0KC9cXHI/XFxuLyk7XG4gIGNvbnN0IGVycm9ycyA9IHt9O1xuICBjb25zdCB3YXJuaW5ncyA9IHt9O1xuICBjb25zdCBuYW1lID0gc2hhZGVyTmFtZSB8fCBnZXRTaGFkZXJOYW1lKHNyYykgfHwgJyh1bm5hbWVkKSc7XG4gIGNvbnN0IHNoYWRlckRlc2NyaXB0aW9uID0gYCR7Z2V0U2hhZGVyVHlwZU5hbWUoc2hhZGVyVHlwZSl9IHNoYWRlciAke25hbWV9YDtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGVycm9yU3RyaW5ncy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGVycm9yU3RyaW5nID0gZXJyb3JTdHJpbmdzW2ldO1xuXG4gICAgaWYgKGVycm9yU3RyaW5nLmxlbmd0aCA8PSAxKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBjb25zdCBzZWdtZW50cyA9IGVycm9yU3RyaW5nLnNwbGl0KCc6Jyk7XG4gICAgY29uc3QgdHlwZSA9IHNlZ21lbnRzWzBdO1xuICAgIGNvbnN0IGxpbmUgPSBwYXJzZUludChzZWdtZW50c1syXSwgMTApO1xuXG4gICAgaWYgKGlzTmFOKGxpbmUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEdMU0wgY29tcGlsYXRpb24gZXJyb3IgaW4gJHtzaGFkZXJEZXNjcmlwdGlvbn06ICR7ZXJyTG9nfWApO1xuICAgIH1cblxuICAgIGlmICh0eXBlICE9PSAnV0FSTklORycpIHtcbiAgICAgIGVycm9yc1tsaW5lXSA9IGVycm9yU3RyaW5nO1xuICAgIH0gZWxzZSB7XG4gICAgICB3YXJuaW5nc1tsaW5lXSA9IGVycm9yU3RyaW5nO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGxpbmVzID0gYWRkTGluZU51bWJlcnMoc3JjKTtcbiAgcmV0dXJuIHtcbiAgICBzaGFkZXJOYW1lOiBzaGFkZXJEZXNjcmlwdGlvbixcbiAgICBlcnJvcnM6IGZvcm1hdEVycm9ycyhlcnJvcnMsIGxpbmVzKSxcbiAgICB3YXJuaW5nczogZm9ybWF0RXJyb3JzKHdhcm5pbmdzLCBsaW5lcylcbiAgfTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0RXJyb3JzKGVycm9ycywgbGluZXMpIHtcbiAgbGV0IG1lc3NhZ2UgPSAnJztcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgbGluZSA9IGxpbmVzW2ldO1xuXG4gICAgaWYgKCFlcnJvcnNbaSArIDNdICYmICFlcnJvcnNbaSArIDJdICYmICFlcnJvcnNbaSArIDFdKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBtZXNzYWdlICs9IGAke2xpbmV9XFxuYDtcblxuICAgIGlmIChlcnJvcnNbaSArIDFdKSB7XG4gICAgICBjb25zdCBlcnJvciA9IGVycm9yc1tpICsgMV07XG4gICAgICBjb25zdCBzZWdtZW50cyA9IGVycm9yLnNwbGl0KCc6JywgMyk7XG4gICAgICBjb25zdCB0eXBlID0gc2VnbWVudHNbMF07XG4gICAgICBjb25zdCBjb2x1bW4gPSBwYXJzZUludChzZWdtZW50c1sxXSwgMTApIHx8IDA7XG4gICAgICBjb25zdCBlcnIgPSBlcnJvci5zdWJzdHJpbmcoc2VnbWVudHMuam9pbignOicpLmxlbmd0aCArIDEpLnRyaW0oKTtcbiAgICAgIG1lc3NhZ2UgKz0gcGFkTGVmdChgXl5eICR7dHlwZX06ICR7ZXJyfVxcblxcbmAsIGNvbHVtbik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG1lc3NhZ2U7XG59XG5cbmZ1bmN0aW9uIGFkZExpbmVOdW1iZXJzKHN0cmluZywgc3RhcnQgPSAxLCBkZWxpbSA9ICc6ICcpIHtcbiAgY29uc3QgbGluZXMgPSBzdHJpbmcuc3BsaXQoL1xccj9cXG4vKTtcbiAgY29uc3QgbWF4RGlnaXRzID0gU3RyaW5nKGxpbmVzLmxlbmd0aCArIHN0YXJ0IC0gMSkubGVuZ3RoO1xuICByZXR1cm4gbGluZXMubWFwKChsaW5lLCBpKSA9PiB7XG4gICAgY29uc3QgbGluZU51bWJlciA9IFN0cmluZyhpICsgc3RhcnQpO1xuICAgIGNvbnN0IGRpZ2l0cyA9IGxpbmVOdW1iZXIubGVuZ3RoO1xuICAgIGNvbnN0IHByZWZpeCA9IHBhZExlZnQobGluZU51bWJlciwgbWF4RGlnaXRzIC0gZGlnaXRzKTtcbiAgICByZXR1cm4gcHJlZml4ICsgZGVsaW0gKyBsaW5lO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gcGFkTGVmdChzdHJpbmcsIGRpZ2l0cykge1xuICBsZXQgcmVzdWx0ID0gJyc7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBkaWdpdHM7ICsraSkge1xuICAgIHJlc3VsdCArPSAnICc7XG4gIH1cblxuICByZXR1cm4gYCR7cmVzdWx0fSR7c3RyaW5nfWA7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1mb3JtYXQtZ2xzbC1lcnJvci5qcy5tYXAiLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBnZXRTaGFkZXJOYW1lKHNoYWRlciwgZGVmYXVsdE5hbWUgPSAndW5uYW1lZCcpIHtcbiAgY29uc3QgU0hBREVSX05BTUVfUkVHRVhQID0gLyNkZWZpbmVbXFxzKl1TSEFERVJfTkFNRVtcXHMqXShbQS1aYS16MC05Xy1dKylbXFxzKl0vO1xuICBjb25zdCBtYXRjaCA9IHNoYWRlci5tYXRjaChTSEFERVJfTkFNRV9SRUdFWFApO1xuICByZXR1cm4gbWF0Y2ggPyBtYXRjaFsxXSA6IGRlZmF1bHROYW1lO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Z2V0LXNoYWRlci1uYW1lLmpzLm1hcCIsImNvbnN0IEdMX0ZSQUdNRU5UX1NIQURFUiA9IDB4OGIzMDtcbmNvbnN0IEdMX1ZFUlRFWF9TSEFERVIgPSAweDhiMzE7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBnZXRTaGFkZXJUeXBlTmFtZSh0eXBlKSB7XG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgR0xfRlJBR01FTlRfU0hBREVSOlxuICAgICAgcmV0dXJuICdmcmFnbWVudCc7XG5cbiAgICBjYXNlIEdMX1ZFUlRFWF9TSEFERVI6XG4gICAgICByZXR1cm4gJ3ZlcnRleCc7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuICd1bmtub3duIHR5cGUnO1xuICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1nZXQtc2hhZGVyLXR5cGUtbmFtZS5qcy5tYXAiLCJpbXBvcnQgeyBsb2cgfSBmcm9tICdAbHVtYS5nbC9nbHRvb2xzJztcbmltcG9ydCB7IFN0YXRzIH0gZnJvbSAncHJvYmUuZ2wnO1xuaW1wb3J0IHsgaXNCcm93c2VyLCBnbG9iYWwgfSBmcm9tICdwcm9iZS5nbC9lbnYnO1xuY29uc3QgVkVSU0lPTiA9IHR5cGVvZiBcIjguNS4xMFwiICE9PSAndW5kZWZpbmVkJyA/IFwiOC41LjEwXCIgOiAndW50cmFuc3BpbGVkIHNvdXJjZSc7XG5jb25zdCBTVEFSVFVQX01FU1NBR0UgPSAnc2V0IGx1bWEubG9nLmxldmVsPTEgKG9yIGhpZ2hlcikgdG8gdHJhY2UgcmVuZGVyaW5nJztcblxuY2xhc3MgU3RhdHNNYW5hZ2VyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5zdGF0cyA9IG5ldyBNYXAoKTtcbiAgfVxuXG4gIGdldChuYW1lKSB7XG4gICAgaWYgKCF0aGlzLnN0YXRzLmhhcyhuYW1lKSkge1xuICAgICAgdGhpcy5zdGF0cy5zZXQobmFtZSwgbmV3IFN0YXRzKHtcbiAgICAgICAgaWQ6IG5hbWVcbiAgICAgIH0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5zdGF0cy5nZXQobmFtZSk7XG4gIH1cblxufVxuXG5jb25zdCBsdW1hU3RhdHMgPSBuZXcgU3RhdHNNYW5hZ2VyKCk7XG5cbmlmIChnbG9iYWwubHVtYSAmJiBnbG9iYWwubHVtYS5WRVJTSU9OICE9PSBWRVJTSU9OKSB7XG4gIHRocm93IG5ldyBFcnJvcihgbHVtYS5nbCAtIG11bHRpcGxlIFZFUlNJT05zIGRldGVjdGVkOiAke2dsb2JhbC5sdW1hLlZFUlNJT059IHZzICR7VkVSU0lPTn1gKTtcbn1cblxuaWYgKCFnbG9iYWwubHVtYSkge1xuICBpZiAoaXNCcm93c2VyKCkpIHtcbiAgICBsb2cubG9nKDEsIGBsdW1hLmdsICR7VkVSU0lPTn0gLSAke1NUQVJUVVBfTUVTU0FHRX1gKSgpO1xuICB9XG5cbiAgZ2xvYmFsLmx1bWEgPSBnbG9iYWwubHVtYSB8fCB7XG4gICAgVkVSU0lPTixcbiAgICB2ZXJzaW9uOiBWRVJTSU9OLFxuICAgIGxvZyxcbiAgICBzdGF0czogbHVtYVN0YXRzLFxuICAgIGdsb2JhbHM6IHtcbiAgICAgIG1vZHVsZXM6IHt9LFxuICAgICAgbm9kZUlPOiB7fVxuICAgIH1cbiAgfTtcbn1cblxuZXhwb3J0IHsgbHVtYVN0YXRzIH07XG5leHBvcnQgZGVmYXVsdCBnbG9iYWwubHVtYTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluaXQuanMubWFwIiwibGV0IGFycmF5QnVmZmVyID0gbnVsbDtcbmV4cG9ydCBmdW5jdGlvbiBnZXRTY3JhdGNoQXJyYXlCdWZmZXIoYnl0ZUxlbmd0aCkge1xuICBpZiAoIWFycmF5QnVmZmVyIHx8IGFycmF5QnVmZmVyLmJ5dGVMZW5ndGggPCBieXRlTGVuZ3RoKSB7XG4gICAgYXJyYXlCdWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoYnl0ZUxlbmd0aCk7XG4gIH1cblxuICByZXR1cm4gYXJyYXlCdWZmZXI7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0U2NyYXRjaEFycmF5KFR5cGUsIGxlbmd0aCkge1xuICBjb25zdCBzY3JhdGNoQXJyYXlCdWZmZXIgPSBnZXRTY3JhdGNoQXJyYXlCdWZmZXIoVHlwZS5CWVRFU19QRVJfRUxFTUVOVCAqIGxlbmd0aCk7XG4gIHJldHVybiBuZXcgVHlwZShzY3JhdGNoQXJyYXlCdWZmZXIsIDAsIGxlbmd0aCk7XG59XG5leHBvcnQgZnVuY3Rpb24gZmlsbEFycmF5KHtcbiAgdGFyZ2V0LFxuICBzb3VyY2UsXG4gIHN0YXJ0ID0gMCxcbiAgY291bnQgPSAxXG59KSB7XG4gIGNvbnN0IGxlbmd0aCA9IHNvdXJjZS5sZW5ndGg7XG4gIGNvbnN0IHRvdGFsID0gY291bnQgKiBsZW5ndGg7XG4gIGxldCBjb3BpZWQgPSAwO1xuXG4gIGZvciAobGV0IGkgPSBzdGFydDsgY29waWVkIDwgbGVuZ3RoOyBjb3BpZWQrKykge1xuICAgIHRhcmdldFtpKytdID0gc291cmNlW2NvcGllZF07XG4gIH1cblxuICB3aGlsZSAoY29waWVkIDwgdG90YWwpIHtcbiAgICBpZiAoY29waWVkIDwgdG90YWwgLSBjb3BpZWQpIHtcbiAgICAgIHRhcmdldC5jb3B5V2l0aGluKHN0YXJ0ICsgY29waWVkLCBzdGFydCwgc3RhcnQgKyBjb3BpZWQpO1xuICAgICAgY29waWVkICo9IDI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRhcmdldC5jb3B5V2l0aGluKHN0YXJ0ICsgY29waWVkLCBzdGFydCwgc3RhcnQgKyB0b3RhbCAtIGNvcGllZCk7XG4gICAgICBjb3BpZWQgPSB0b3RhbDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGFyZ2V0O1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXJyYXktdXRpbHMtZmxhdC5qcy5tYXAiLCJleHBvcnQgZnVuY3Rpb24gYXNzZXJ0KGNvbmRpdGlvbiwgbWVzc2FnZSkge1xuICBpZiAoIWNvbmRpdGlvbikge1xuICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlIHx8ICdsdW1hLmdsOiBhc3NlcnRpb24gZmFpbGVkLicpO1xuICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hc3NlcnQuanMubWFwIiwiaW1wb3J0IHsgbG9nIH0gZnJvbSAnQGx1bWEuZ2wvZ2x0b29scyc7XG5leHBvcnQgZnVuY3Rpb24gY2hlY2tQcm9wcyhjbGFzc05hbWUsIHByb3BzLCBwcm9wQ2hlY2tzKSB7XG4gIGNvbnN0IHtcbiAgICByZW1vdmVkUHJvcHMgPSB7fSxcbiAgICBkZXByZWNhdGVkUHJvcHMgPSB7fSxcbiAgICByZXBsYWNlZFByb3BzID0ge31cbiAgfSA9IHByb3BDaGVja3M7XG5cbiAgZm9yIChjb25zdCBwcm9wTmFtZSBpbiByZW1vdmVkUHJvcHMpIHtcbiAgICBpZiAocHJvcE5hbWUgaW4gcHJvcHMpIHtcbiAgICAgIGNvbnN0IHJlcGxhY2VtZW50UHJvcCA9IHJlbW92ZWRQcm9wc1twcm9wTmFtZV07XG4gICAgICBjb25zdCByZXBsYWNlbWVudCA9IHJlcGxhY2VtZW50UHJvcCA/IGAke2NsYXNzTmFtZX0uJHtyZW1vdmVkUHJvcHNbcHJvcE5hbWVdfWAgOiAnTi9BJztcbiAgICAgIGxvZy5yZW1vdmVkKGAke2NsYXNzTmFtZX0uJHtwcm9wTmFtZX1gLCByZXBsYWNlbWVudCkoKTtcbiAgICB9XG4gIH1cblxuICBmb3IgKGNvbnN0IHByb3BOYW1lIGluIGRlcHJlY2F0ZWRQcm9wcykge1xuICAgIGlmIChwcm9wTmFtZSBpbiBwcm9wcykge1xuICAgICAgY29uc3QgcmVwbGFjZW1lbnRQcm9wID0gZGVwcmVjYXRlZFByb3BzW3Byb3BOYW1lXTtcbiAgICAgIGxvZy5kZXByZWNhdGVkKGAke2NsYXNzTmFtZX0uJHtwcm9wTmFtZX1gLCBgJHtjbGFzc05hbWV9LiR7cmVwbGFjZW1lbnRQcm9wfWApKCk7XG4gICAgfVxuICB9XG5cbiAgbGV0IG5ld1Byb3BzID0gbnVsbDtcblxuICBmb3IgKGNvbnN0IHByb3BOYW1lIGluIHJlcGxhY2VkUHJvcHMpIHtcbiAgICBpZiAocHJvcE5hbWUgaW4gcHJvcHMpIHtcbiAgICAgIGNvbnN0IHJlcGxhY2VtZW50UHJvcCA9IHJlcGxhY2VkUHJvcHNbcHJvcE5hbWVdO1xuICAgICAgbG9nLmRlcHJlY2F0ZWQoYCR7Y2xhc3NOYW1lfS4ke3Byb3BOYW1lfWAsIGAke2NsYXNzTmFtZX0uJHtyZXBsYWNlbWVudFByb3B9YCkoKTtcbiAgICAgIG5ld1Byb3BzID0gbmV3UHJvcHMgfHwgT2JqZWN0LmFzc2lnbih7fSwgcHJvcHMpO1xuICAgICAgbmV3UHJvcHNbcmVwbGFjZW1lbnRQcm9wXSA9IHByb3BzW3Byb3BOYW1lXTtcbiAgICAgIGRlbGV0ZSBuZXdQcm9wc1twcm9wTmFtZV07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ld1Byb3BzIHx8IHByb3BzO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y2hlY2stcHJvcHMuanMubWFwIiwiZnVuY3Rpb24gZm9ybWF0QXJyYXlWYWx1ZSh2LCBvcHRzKSB7XG4gIGNvbnN0IHtcbiAgICBtYXhFbHRzID0gMTYsXG4gICAgc2l6ZSA9IDFcbiAgfSA9IG9wdHM7XG4gIGxldCBzdHJpbmcgPSAnWyc7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB2Lmxlbmd0aCAmJiBpIDwgbWF4RWx0czsgKytpKSB7XG4gICAgaWYgKGkgPiAwKSB7XG4gICAgICBzdHJpbmcgKz0gYCwke2kgJSBzaXplID09PSAwID8gJyAnIDogJyd9YDtcbiAgICB9XG5cbiAgICBzdHJpbmcgKz0gZm9ybWF0VmFsdWUodltpXSwgb3B0cyk7XG4gIH1cblxuICBjb25zdCB0ZXJtaW5hdG9yID0gdi5sZW5ndGggPiBtYXhFbHRzID8gJy4uLicgOiAnXSc7XG4gIHJldHVybiBgJHtzdHJpbmd9JHt0ZXJtaW5hdG9yfWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRWYWx1ZSh2LCBvcHRzID0ge30pIHtcbiAgY29uc3QgRVBTSUxPTiA9IDFlLTE2O1xuICBjb25zdCB7XG4gICAgaXNJbnRlZ2VyID0gZmFsc2VcbiAgfSA9IG9wdHM7XG5cbiAgaWYgKEFycmF5LmlzQXJyYXkodikgfHwgQXJyYXlCdWZmZXIuaXNWaWV3KHYpKSB7XG4gICAgcmV0dXJuIGZvcm1hdEFycmF5VmFsdWUodiwgb3B0cyk7XG4gIH1cblxuICBpZiAoIU51bWJlci5pc0Zpbml0ZSh2KSkge1xuICAgIHJldHVybiBTdHJpbmcodik7XG4gIH1cblxuICBpZiAoTWF0aC5hYnModikgPCBFUFNJTE9OKSB7XG4gICAgcmV0dXJuIGlzSW50ZWdlciA/ICcwJyA6ICcwLic7XG4gIH1cblxuICBpZiAoaXNJbnRlZ2VyKSB7XG4gICAgcmV0dXJuIHYudG9GaXhlZCgwKTtcbiAgfVxuXG4gIGlmIChNYXRoLmFicyh2KSA+IDEwMCAmJiBNYXRoLmFicyh2KSA8IDEwMDAwKSB7XG4gICAgcmV0dXJuIHYudG9GaXhlZCgwKTtcbiAgfVxuXG4gIGNvbnN0IHN0cmluZyA9IHYudG9QcmVjaXNpb24oMik7XG4gIGNvbnN0IGRlY2ltYWwgPSBzdHJpbmcuaW5kZXhPZignLjAnKTtcbiAgcmV0dXJuIGRlY2ltYWwgPT09IHN0cmluZy5sZW5ndGggLSAyID8gc3RyaW5nLnNsaWNlKDAsIC0xKSA6IHN0cmluZztcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWZvcm1hdC12YWx1ZS5qcy5tYXAiLCJpbXBvcnQgeyBhc3NlcnQgfSBmcm9tICcuLi91dGlscy9hc3NlcnQnO1xubGV0IHBhdGhQcmVmaXggPSAnJztcbmV4cG9ydCBmdW5jdGlvbiBzZXRQYXRoUHJlZml4KHByZWZpeCkge1xuICBwYXRoUHJlZml4ID0gcHJlZml4O1xufVxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRGaWxlKHVybCwgb3B0aW9ucyA9IHt9KSB7XG4gIGFzc2VydCh0eXBlb2YgdXJsID09PSAnc3RyaW5nJyk7XG4gIHVybCA9IHBhdGhQcmVmaXggKyB1cmw7XG4gIGNvbnN0IGRhdGFUeXBlID0gb3B0aW9ucy5kYXRhVHlwZSB8fCAndGV4dCc7XG4gIHJldHVybiBmZXRjaCh1cmwsIG9wdGlvbnMpLnRoZW4ocmVzID0+IHJlc1tkYXRhVHlwZV0oKSk7XG59XG5leHBvcnQgZnVuY3Rpb24gbG9hZEltYWdlKHVybCwgb3B0cykge1xuICBhc3NlcnQodHlwZW9mIHVybCA9PT0gJ3N0cmluZycpO1xuICB1cmwgPSBwYXRoUHJlZml4ICsgdXJsO1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBpbWFnZSA9IG5ldyBJbWFnZSgpO1xuXG4gICAgICBpbWFnZS5vbmxvYWQgPSAoKSA9PiByZXNvbHZlKGltYWdlKTtcblxuICAgICAgaW1hZ2Uub25lcnJvciA9ICgpID0+IHJlamVjdChuZXcgRXJyb3IoYENvdWxkIG5vdCBsb2FkIGltYWdlICR7dXJsfS5gKSk7XG5cbiAgICAgIGltYWdlLmNyb3NzT3JpZ2luID0gb3B0cyAmJiBvcHRzLmNyb3NzT3JpZ2luIHx8ICdhbm9ueW1vdXMnO1xuICAgICAgaW1hZ2Uuc3JjID0gdXJsO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICByZWplY3QoZXJyb3IpO1xuICAgIH1cbiAgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1sb2FkLWZpbGUuanMubWFwIiwiaW1wb3J0IHsgbG9nIH0gZnJvbSAnQGx1bWEuZ2wvZ2x0b29scyc7XG5leHBvcnQgZnVuY3Rpb24gc3R1YlJlbW92ZWRNZXRob2RzKGluc3RhbmNlLCBjbGFzc05hbWUsIHZlcnNpb24sIG1ldGhvZE5hbWVzKSB7XG4gIGNvbnN0IHVwZ3JhZGVNZXNzYWdlID0gYFNlZSBsdW1hLmdsICR7dmVyc2lvbn0gVXBncmFkZSBHdWlkZSBhdCBcXFxuaHR0cHM6Ly9sdW1hLmdsL2RvY3MvdXBncmFkZS1ndWlkZWA7XG4gIGNvbnN0IHByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihpbnN0YW5jZSk7XG4gIG1ldGhvZE5hbWVzLmZvckVhY2gobWV0aG9kTmFtZSA9PiB7XG4gICAgaWYgKHByb3RvdHlwZS5tZXRob2ROYW1lKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcHJvdG90eXBlW21ldGhvZE5hbWVdID0gKCkgPT4ge1xuICAgICAgbG9nLnJlbW92ZWQoYENhbGxpbmcgcmVtb3ZlZCBtZXRob2QgJHtjbGFzc05hbWV9LiR7bWV0aG9kTmFtZX06IGAsIHVwZ3JhZGVNZXNzYWdlKSgpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKG1ldGhvZE5hbWUpO1xuICAgIH07XG4gIH0pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c3R1Yi1tZXRob2RzLmpzLm1hcCIsImltcG9ydCB7IGFzc2VydCB9IGZyb20gJy4vYXNzZXJ0JztcbmNvbnN0IHVpZENvdW50ZXJzID0ge307XG5leHBvcnQgZnVuY3Rpb24gdWlkKGlkID0gJ2lkJykge1xuICB1aWRDb3VudGVyc1tpZF0gPSB1aWRDb3VudGVyc1tpZF0gfHwgMTtcbiAgY29uc3QgY291bnQgPSB1aWRDb3VudGVyc1tpZF0rKztcbiAgcmV0dXJuIGAke2lkfS0ke2NvdW50fWA7XG59XG5leHBvcnQgZnVuY3Rpb24gaXNQb3dlck9mVHdvKG4pIHtcbiAgYXNzZXJ0KHR5cGVvZiBuID09PSAnbnVtYmVyJywgJ0lucHV0IG11c3QgYmUgYSBudW1iZXInKTtcbiAgcmV0dXJuIG4gJiYgKG4gJiBuIC0gMSkgPT09IDA7XG59XG5leHBvcnQgZnVuY3Rpb24gaXNPYmplY3RFbXB0eShvYmopIHtcbiAgbGV0IGlzRW1wdHkgPSB0cnVlO1xuXG4gIGZvciAoY29uc3Qga2V5IGluIG9iaikge1xuICAgIGlzRW1wdHkgPSBmYWxzZTtcbiAgICBicmVhaztcbiAgfVxuXG4gIHJldHVybiBpc0VtcHR5O1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dXRpbHMuanMubWFwIiwiaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSAnLi4vdXRpbHMvYXNzZXJ0JztcbmNvbnN0IEdMX0JZVEUgPSAweDE0MDA7XG5jb25zdCBHTF9VTlNJR05FRF9CWVRFID0gMHgxNDAxO1xuY29uc3QgR0xfU0hPUlQgPSAweDE0MDI7XG5jb25zdCBHTF9VTlNJR05FRF9TSE9SVCA9IDB4MTQwMztcbmNvbnN0IEdMX1BPSU5UUyA9IDB4MDtcbmNvbnN0IEdMX0xJTkVTID0gMHgxO1xuY29uc3QgR0xfTElORV9MT09QID0gMHgyO1xuY29uc3QgR0xfTElORV9TVFJJUCA9IDB4MztcbmNvbnN0IEdMX1RSSUFOR0xFUyA9IDB4NDtcbmNvbnN0IEdMX1RSSUFOR0xFX1NUUklQID0gMHg1O1xuY29uc3QgR0xfVFJJQU5HTEVfRkFOID0gMHg2O1xuY29uc3QgR0xfRkxPQVQgPSAweDE0MDY7XG5jb25zdCBHTF9GTE9BVF9WRUMyID0gMHg4YjUwO1xuY29uc3QgR0xfRkxPQVRfVkVDMyA9IDB4OGI1MTtcbmNvbnN0IEdMX0ZMT0FUX1ZFQzQgPSAweDhiNTI7XG5jb25zdCBHTF9JTlQgPSAweDE0MDQ7XG5jb25zdCBHTF9JTlRfVkVDMiA9IDB4OGI1MztcbmNvbnN0IEdMX0lOVF9WRUMzID0gMHg4YjU0O1xuY29uc3QgR0xfSU5UX1ZFQzQgPSAweDhiNTU7XG5jb25zdCBHTF9VTlNJR05FRF9JTlQgPSAweDE0MDU7XG5jb25zdCBHTF9VTlNJR05FRF9JTlRfVkVDMiA9IDB4OGRjNjtcbmNvbnN0IEdMX1VOU0lHTkVEX0lOVF9WRUMzID0gMHg4ZGM3O1xuY29uc3QgR0xfVU5TSUdORURfSU5UX1ZFQzQgPSAweDhkYzg7XG5jb25zdCBHTF9CT09MID0gMHg4YjU2O1xuY29uc3QgR0xfQk9PTF9WRUMyID0gMHg4YjU3O1xuY29uc3QgR0xfQk9PTF9WRUMzID0gMHg4YjU4O1xuY29uc3QgR0xfQk9PTF9WRUM0ID0gMHg4YjU5O1xuY29uc3QgR0xfRkxPQVRfTUFUMiA9IDB4OGI1YTtcbmNvbnN0IEdMX0ZMT0FUX01BVDMgPSAweDhiNWI7XG5jb25zdCBHTF9GTE9BVF9NQVQ0ID0gMHg4YjVjO1xuY29uc3QgR0xfRkxPQVRfTUFUMngzID0gMHg4YjY1O1xuY29uc3QgR0xfRkxPQVRfTUFUMng0ID0gMHg4YjY2O1xuY29uc3QgR0xfRkxPQVRfTUFUM3gyID0gMHg4YjY3O1xuY29uc3QgR0xfRkxPQVRfTUFUM3g0ID0gMHg4YjY4O1xuY29uc3QgR0xfRkxPQVRfTUFUNHgyID0gMHg4YjY5O1xuY29uc3QgR0xfRkxPQVRfTUFUNHgzID0gMHg4YjZhO1xuY29uc3QgQ09NUE9TSVRFX0dMX1RZUEVTID0ge1xuICBbR0xfRkxPQVRdOiBbR0xfRkxPQVQsIDEsICdmbG9hdCddLFxuICBbR0xfRkxPQVRfVkVDMl06IFtHTF9GTE9BVCwgMiwgJ3ZlYzInXSxcbiAgW0dMX0ZMT0FUX1ZFQzNdOiBbR0xfRkxPQVQsIDMsICd2ZWMzJ10sXG4gIFtHTF9GTE9BVF9WRUM0XTogW0dMX0ZMT0FULCA0LCAndmVjNCddLFxuICBbR0xfSU5UXTogW0dMX0lOVCwgMSwgJ2ludCddLFxuICBbR0xfSU5UX1ZFQzJdOiBbR0xfSU5ULCAyLCAnaXZlYzInXSxcbiAgW0dMX0lOVF9WRUMzXTogW0dMX0lOVCwgMywgJ2l2ZWMzJ10sXG4gIFtHTF9JTlRfVkVDNF06IFtHTF9JTlQsIDQsICdpdmVjNCddLFxuICBbR0xfVU5TSUdORURfSU5UXTogW0dMX1VOU0lHTkVEX0lOVCwgMSwgJ3VpbnQnXSxcbiAgW0dMX1VOU0lHTkVEX0lOVF9WRUMyXTogW0dMX1VOU0lHTkVEX0lOVCwgMiwgJ3V2ZWMyJ10sXG4gIFtHTF9VTlNJR05FRF9JTlRfVkVDM106IFtHTF9VTlNJR05FRF9JTlQsIDMsICd1dmVjMyddLFxuICBbR0xfVU5TSUdORURfSU5UX1ZFQzRdOiBbR0xfVU5TSUdORURfSU5ULCA0LCAndXZlYzQnXSxcbiAgW0dMX0JPT0xdOiBbR0xfRkxPQVQsIDEsICdib29sJ10sXG4gIFtHTF9CT09MX1ZFQzJdOiBbR0xfRkxPQVQsIDIsICdidmVjMiddLFxuICBbR0xfQk9PTF9WRUMzXTogW0dMX0ZMT0FULCAzLCAnYnZlYzMnXSxcbiAgW0dMX0JPT0xfVkVDNF06IFtHTF9GTE9BVCwgNCwgJ2J2ZWM0J10sXG4gIFtHTF9GTE9BVF9NQVQyXTogW0dMX0ZMT0FULCA4LCAnbWF0MiddLFxuICBbR0xfRkxPQVRfTUFUMngzXTogW0dMX0ZMT0FULCA4LCAnbWF0MngzJ10sXG4gIFtHTF9GTE9BVF9NQVQyeDRdOiBbR0xfRkxPQVQsIDgsICdtYXQyeDQnXSxcbiAgW0dMX0ZMT0FUX01BVDNdOiBbR0xfRkxPQVQsIDEyLCAnbWF0MyddLFxuICBbR0xfRkxPQVRfTUFUM3gyXTogW0dMX0ZMT0FULCAxMiwgJ21hdDN4MiddLFxuICBbR0xfRkxPQVRfTUFUM3g0XTogW0dMX0ZMT0FULCAxMiwgJ21hdDN4NCddLFxuICBbR0xfRkxPQVRfTUFUNF06IFtHTF9GTE9BVCwgMTYsICdtYXQ0J10sXG4gIFtHTF9GTE9BVF9NQVQ0eDJdOiBbR0xfRkxPQVQsIDE2LCAnbWF0NHgyJ10sXG4gIFtHTF9GTE9BVF9NQVQ0eDNdOiBbR0xfRkxPQVQsIDE2LCAnbWF0NHgzJ11cbn07XG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJpbWl0aXZlRHJhd01vZGUoZHJhd01vZGUpIHtcbiAgc3dpdGNoIChkcmF3TW9kZSkge1xuICAgIGNhc2UgR0xfUE9JTlRTOlxuICAgICAgcmV0dXJuIEdMX1BPSU5UUztcblxuICAgIGNhc2UgR0xfTElORVM6XG4gICAgICByZXR1cm4gR0xfTElORVM7XG5cbiAgICBjYXNlIEdMX0xJTkVfU1RSSVA6XG4gICAgICByZXR1cm4gR0xfTElORVM7XG5cbiAgICBjYXNlIEdMX0xJTkVfTE9PUDpcbiAgICAgIHJldHVybiBHTF9MSU5FUztcblxuICAgIGNhc2UgR0xfVFJJQU5HTEVTOlxuICAgICAgcmV0dXJuIEdMX1RSSUFOR0xFUztcblxuICAgIGNhc2UgR0xfVFJJQU5HTEVfU1RSSVA6XG4gICAgICByZXR1cm4gR0xfVFJJQU5HTEVTO1xuXG4gICAgY2FzZSBHTF9UUklBTkdMRV9GQU46XG4gICAgICByZXR1cm4gR0xfVFJJQU5HTEVTO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIGFzc2VydChmYWxzZSk7XG4gICAgICByZXR1cm4gMDtcbiAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGdldFByaW1pdGl2ZUNvdW50KHtcbiAgZHJhd01vZGUsXG4gIHZlcnRleENvdW50XG59KSB7XG4gIHN3aXRjaCAoZHJhd01vZGUpIHtcbiAgICBjYXNlIEdMX1BPSU5UUzpcbiAgICBjYXNlIEdMX0xJTkVfTE9PUDpcbiAgICAgIHJldHVybiB2ZXJ0ZXhDb3VudDtcblxuICAgIGNhc2UgR0xfTElORVM6XG4gICAgICByZXR1cm4gdmVydGV4Q291bnQgLyAyO1xuXG4gICAgY2FzZSBHTF9MSU5FX1NUUklQOlxuICAgICAgcmV0dXJuIHZlcnRleENvdW50IC0gMTtcblxuICAgIGNhc2UgR0xfVFJJQU5HTEVTOlxuICAgICAgcmV0dXJuIHZlcnRleENvdW50IC8gMztcblxuICAgIGNhc2UgR0xfVFJJQU5HTEVfU1RSSVA6XG4gICAgY2FzZSBHTF9UUklBTkdMRV9GQU46XG4gICAgICByZXR1cm4gdmVydGV4Q291bnQgLSAyO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIGFzc2VydChmYWxzZSk7XG4gICAgICByZXR1cm4gMDtcbiAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGdldFZlcnRleENvdW50KHtcbiAgZHJhd01vZGUsXG4gIHZlcnRleENvdW50XG59KSB7XG4gIGNvbnN0IHByaW1pdGl2ZUNvdW50ID0gZ2V0UHJpbWl0aXZlQ291bnQoe1xuICAgIGRyYXdNb2RlLFxuICAgIHZlcnRleENvdW50XG4gIH0pO1xuXG4gIHN3aXRjaCAoZ2V0UHJpbWl0aXZlRHJhd01vZGUoZHJhd01vZGUpKSB7XG4gICAgY2FzZSBHTF9QT0lOVFM6XG4gICAgICByZXR1cm4gcHJpbWl0aXZlQ291bnQ7XG5cbiAgICBjYXNlIEdMX0xJTkVTOlxuICAgICAgcmV0dXJuIHByaW1pdGl2ZUNvdW50ICogMjtcblxuICAgIGNhc2UgR0xfVFJJQU5HTEVTOlxuICAgICAgcmV0dXJuIHByaW1pdGl2ZUNvdW50ICogMztcblxuICAgIGRlZmF1bHQ6XG4gICAgICBhc3NlcnQoZmFsc2UpO1xuICAgICAgcmV0dXJuIDA7XG4gIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBkZWNvbXBvc2VDb21wb3NpdGVHTFR5cGUoY29tcG9zaXRlR0xUeXBlKSB7XG4gIGNvbnN0IHR5cGVBbmRTaXplID0gQ09NUE9TSVRFX0dMX1RZUEVTW2NvbXBvc2l0ZUdMVHlwZV07XG5cbiAgaWYgKCF0eXBlQW5kU2l6ZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29uc3QgW3R5cGUsIGNvbXBvbmVudHNdID0gdHlwZUFuZFNpemU7XG4gIHJldHVybiB7XG4gICAgdHlwZSxcbiAgICBjb21wb25lbnRzXG4gIH07XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29tcG9zaXRlR0xUeXBlKHR5cGUsIGNvbXBvbmVudHMpIHtcbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSBHTF9CWVRFOlxuICAgIGNhc2UgR0xfVU5TSUdORURfQllURTpcbiAgICBjYXNlIEdMX1NIT1JUOlxuICAgIGNhc2UgR0xfVU5TSUdORURfU0hPUlQ6XG4gICAgICB0eXBlID0gR0xfRkxPQVQ7XG4gICAgICBicmVhaztcblxuICAgIGRlZmF1bHQ6XG4gIH1cblxuICBmb3IgKGNvbnN0IGdsVHlwZSBpbiBDT01QT1NJVEVfR0xfVFlQRVMpIHtcbiAgICBjb25zdCBbY29tcFR5cGUsIGNvbXBDb21wb25lbnRzLCBuYW1lXSA9IENPTVBPU0lURV9HTF9UWVBFU1tnbFR5cGVdO1xuXG4gICAgaWYgKGNvbXBUeXBlID09PSB0eXBlICYmIGNvbXBDb21wb25lbnRzID09PSBjb21wb25lbnRzKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBnbFR5cGUsXG4gICAgICAgIG5hbWVcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hdHRyaWJ1dGUtdXRpbHMuanMubWFwIiwiaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSAnLi4vdXRpbHMvYXNzZXJ0JztcbmV4cG9ydCBmdW5jdGlvbiBnZXRLZXlWYWx1ZShnbCwgbmFtZSkge1xuICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIG5hbWU7XG4gIH1cblxuICBjb25zdCBudW1iZXIgPSBOdW1iZXIobmFtZSk7XG5cbiAgaWYgKCFpc05hTihudW1iZXIpKSB7XG4gICAgcmV0dXJuIG51bWJlcjtcbiAgfVxuXG4gIG5hbWUgPSBuYW1lLnJlcGxhY2UoL14uKlxcLi8sICcnKTtcbiAgY29uc3QgdmFsdWUgPSBnbFtuYW1lXTtcbiAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQsIGBBY2Nlc3NpbmcgdW5kZWZpbmVkIGNvbnN0YW50IEdMLiR7bmFtZX1gKTtcbiAgcmV0dXJuIHZhbHVlO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldEtleShnbCwgdmFsdWUpIHtcbiAgdmFsdWUgPSBOdW1iZXIodmFsdWUpO1xuXG4gIGZvciAoY29uc3Qga2V5IGluIGdsKSB7XG4gICAgaWYgKGdsW2tleV0gPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm4gYEdMLiR7a2V5fWA7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIFN0cmluZyh2YWx1ZSk7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0S2V5VHlwZShnbCwgdmFsdWUpIHtcbiAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQsICd1bmRlZmluZWQga2V5Jyk7XG4gIHZhbHVlID0gTnVtYmVyKHZhbHVlKTtcblxuICBmb3IgKGNvbnN0IGtleSBpbiBnbCkge1xuICAgIGlmIChnbFtrZXldID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuIGBHTC4ke2tleX1gO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBTdHJpbmcodmFsdWUpO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29uc3RhbnRzLXRvLWtleXMuanMubWFwIiwiaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSAnLi4vdXRpbHMvYXNzZXJ0JztcbmV4cG9ydCBmdW5jdGlvbiBnbEZvcm1hdFRvQ29tcG9uZW50cyhmb3JtYXQpIHtcbiAgc3dpdGNoIChmb3JtYXQpIHtcbiAgICBjYXNlIDY0MDY6XG4gICAgY2FzZSAzMzMyNjpcbiAgICBjYXNlIDY0MDM6XG4gICAgICByZXR1cm4gMTtcblxuICAgIGNhc2UgMzMzMjg6XG4gICAgY2FzZSAzMzMxOTpcbiAgICAgIHJldHVybiAyO1xuXG4gICAgY2FzZSA2NDA3OlxuICAgIGNhc2UgMzQ4Mzc6XG4gICAgICByZXR1cm4gMztcblxuICAgIGNhc2UgNjQwODpcbiAgICBjYXNlIDM0ODM2OlxuICAgICAgcmV0dXJuIDQ7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgYXNzZXJ0KGZhbHNlKTtcbiAgICAgIHJldHVybiAwO1xuICB9XG59XG5leHBvcnQgZnVuY3Rpb24gZ2xUeXBlVG9CeXRlcyh0eXBlKSB7XG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgNTEyMTpcbiAgICAgIHJldHVybiAxO1xuXG4gICAgY2FzZSAzMzYzNTpcbiAgICBjYXNlIDMyODE5OlxuICAgIGNhc2UgMzI4MjA6XG4gICAgICByZXR1cm4gMjtcblxuICAgIGNhc2UgNTEyNjpcbiAgICAgIHJldHVybiA0O1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIGFzc2VydChmYWxzZSk7XG4gICAgICByZXR1cm4gMDtcbiAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Zm9ybWF0LXV0aWxzLmpzLm1hcCIsImV4cG9ydCBmdW5jdGlvbiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY2FsbGJhY2spIHtcbiAgcmV0dXJuIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPyB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGNhbGxiYWNrKSA6IHNldFRpbWVvdXQoY2FsbGJhY2ssIDEwMDAgLyA2MCk7XG59XG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsQW5pbWF0aW9uRnJhbWUodGltZXJJZCkge1xuICByZXR1cm4gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID8gd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRpbWVySWQpIDogY2xlYXJUaW1lb3V0KHRpbWVySWQpO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cmVxdWVzdC1hbmltYXRpb24tZnJhbWUuanMubWFwIiwiaW1wb3J0IFRleHR1cmUyRCBmcm9tICcuLi9jbGFzc2VzL3RleHR1cmUtMmQnO1xuaW1wb3J0IFRleHR1cmVDdWJlIGZyb20gJy4uL2NsYXNzZXMvdGV4dHVyZS1jdWJlJztcbmltcG9ydCBUZXh0dXJlM0QgZnJvbSAnLi4vY2xhc3Nlcy90ZXh0dXJlLTNkJztcbmltcG9ydCBGcmFtZWJ1ZmZlciBmcm9tICcuLi9jbGFzc2VzL2ZyYW1lYnVmZmVyJztcbmltcG9ydCB7IGFzc2VydCB9IGZyb20gJy4uL3V0aWxzL2Fzc2VydCc7XG5leHBvcnQgZnVuY3Rpb24gY2xvbmVUZXh0dXJlRnJvbShyZWZUZXh0dXJlLCBvdmVycmlkZXMpIHtcbiAgYXNzZXJ0KHJlZlRleHR1cmUgaW5zdGFuY2VvZiBUZXh0dXJlMkQgfHwgcmVmVGV4dHVyZSBpbnN0YW5jZW9mIFRleHR1cmVDdWJlIHx8IHJlZlRleHR1cmUgaW5zdGFuY2VvZiBUZXh0dXJlM0QpO1xuICBjb25zdCBUZXh0dXJlVHlwZSA9IHJlZlRleHR1cmUuY29uc3RydWN0b3I7XG4gIGNvbnN0IHtcbiAgICBnbCxcbiAgICB3aWR0aCxcbiAgICBoZWlnaHQsXG4gICAgZm9ybWF0LFxuICAgIHR5cGUsXG4gICAgZGF0YUZvcm1hdCxcbiAgICBib3JkZXIsXG4gICAgbWlwbWFwc1xuICB9ID0gcmVmVGV4dHVyZTtcbiAgY29uc3QgdGV4dHVyZU9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcbiAgICB3aWR0aCxcbiAgICBoZWlnaHQsXG4gICAgZm9ybWF0LFxuICAgIHR5cGUsXG4gICAgZGF0YUZvcm1hdCxcbiAgICBib3JkZXIsXG4gICAgbWlwbWFwc1xuICB9LCBvdmVycmlkZXMpO1xuICByZXR1cm4gbmV3IFRleHR1cmVUeXBlKGdsLCB0ZXh0dXJlT3B0aW9ucyk7XG59XG5leHBvcnQgZnVuY3Rpb24gdG9GcmFtZWJ1ZmZlcih0ZXh0dXJlLCBvcHRzKSB7XG4gIGNvbnN0IHtcbiAgICBnbCxcbiAgICB3aWR0aCxcbiAgICBoZWlnaHQsXG4gICAgaWRcbiAgfSA9IHRleHR1cmU7XG4gIGNvbnN0IGZyYW1lYnVmZmVyID0gbmV3IEZyYW1lYnVmZmVyKGdsLCBPYmplY3QuYXNzaWduKHt9LCBvcHRzLCB7XG4gICAgaWQ6IGBmcmFtZWJ1ZmZlci1mb3ItJHtpZH1gLFxuICAgIHdpZHRoLFxuICAgIGhlaWdodCxcbiAgICBhdHRhY2htZW50czoge1xuICAgICAgWzM2MDY0XTogdGV4dHVyZVxuICAgIH1cbiAgfSkpO1xuICByZXR1cm4gZnJhbWVidWZmZXI7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD10ZXh0dXJlLXV0aWxzLmpzLm1hcCIsImNvbnN0IEVSUl9UWVBFX0RFRFVDVElPTiA9ICdGYWlsZWQgdG8gZGVkdWNlIEdMIGNvbnN0YW50IGZyb20gdHlwZWQgYXJyYXknO1xuZXhwb3J0IGZ1bmN0aW9uIGdldEdMVHlwZUZyb21UeXBlZEFycmF5KGFycmF5T3JUeXBlKSB7XG4gIGNvbnN0IHR5cGUgPSBBcnJheUJ1ZmZlci5pc1ZpZXcoYXJyYXlPclR5cGUpID8gYXJyYXlPclR5cGUuY29uc3RydWN0b3IgOiBhcnJheU9yVHlwZTtcblxuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlIEZsb2F0MzJBcnJheTpcbiAgICAgIHJldHVybiA1MTI2O1xuXG4gICAgY2FzZSBVaW50MTZBcnJheTpcbiAgICAgIHJldHVybiA1MTIzO1xuXG4gICAgY2FzZSBVaW50MzJBcnJheTpcbiAgICAgIHJldHVybiA1MTI1O1xuXG4gICAgY2FzZSBVaW50OEFycmF5OlxuICAgICAgcmV0dXJuIDUxMjE7XG5cbiAgICBjYXNlIFVpbnQ4Q2xhbXBlZEFycmF5OlxuICAgICAgcmV0dXJuIDUxMjE7XG5cbiAgICBjYXNlIEludDhBcnJheTpcbiAgICAgIHJldHVybiA1MTIwO1xuXG4gICAgY2FzZSBJbnQxNkFycmF5OlxuICAgICAgcmV0dXJuIDUxMjI7XG5cbiAgICBjYXNlIEludDMyQXJyYXk6XG4gICAgICByZXR1cm4gNTEyNDtcblxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoRVJSX1RZUEVfREVEVUNUSU9OKTtcbiAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGdldFR5cGVkQXJyYXlGcm9tR0xUeXBlKGdsVHlwZSwge1xuICBjbGFtcGVkID0gdHJ1ZVxufSA9IHt9KSB7XG4gIHN3aXRjaCAoZ2xUeXBlKSB7XG4gICAgY2FzZSA1MTI2OlxuICAgICAgcmV0dXJuIEZsb2F0MzJBcnJheTtcblxuICAgIGNhc2UgNTEyMzpcbiAgICBjYXNlIDMzNjM1OlxuICAgIGNhc2UgMzI4MTk6XG4gICAgY2FzZSAzMjgyMDpcbiAgICAgIHJldHVybiBVaW50MTZBcnJheTtcblxuICAgIGNhc2UgNTEyNTpcbiAgICAgIHJldHVybiBVaW50MzJBcnJheTtcblxuICAgIGNhc2UgNTEyMTpcbiAgICAgIHJldHVybiBjbGFtcGVkID8gVWludDhDbGFtcGVkQXJyYXkgOiBVaW50OEFycmF5O1xuXG4gICAgY2FzZSA1MTIwOlxuICAgICAgcmV0dXJuIEludDhBcnJheTtcblxuICAgIGNhc2UgNTEyMjpcbiAgICAgIHJldHVybiBJbnQxNkFycmF5O1xuXG4gICAgY2FzZSA1MTI0OlxuICAgICAgcmV0dXJuIEludDMyQXJyYXk7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gZGVkdWNlIHR5cGVkIGFycmF5IHR5cGUgZnJvbSBHTCBjb25zdGFudCcpO1xuICB9XG59XG5leHBvcnQgZnVuY3Rpb24gZmxpcFJvd3Moe1xuICBkYXRhLFxuICB3aWR0aCxcbiAgaGVpZ2h0LFxuICBieXRlc1BlclBpeGVsID0gNCxcbiAgdGVtcFxufSkge1xuICBjb25zdCBieXRlc1BlclJvdyA9IHdpZHRoICogYnl0ZXNQZXJQaXhlbDtcbiAgdGVtcCA9IHRlbXAgfHwgbmV3IFVpbnQ4QXJyYXkoYnl0ZXNQZXJSb3cpO1xuXG4gIGZvciAobGV0IHkgPSAwOyB5IDwgaGVpZ2h0IC8gMjsgKyt5KSB7XG4gICAgY29uc3QgdG9wT2Zmc2V0ID0geSAqIGJ5dGVzUGVyUm93O1xuICAgIGNvbnN0IGJvdHRvbU9mZnNldCA9IChoZWlnaHQgLSB5IC0gMSkgKiBieXRlc1BlclJvdztcbiAgICB0ZW1wLnNldChkYXRhLnN1YmFycmF5KHRvcE9mZnNldCwgdG9wT2Zmc2V0ICsgYnl0ZXNQZXJSb3cpKTtcbiAgICBkYXRhLmNvcHlXaXRoaW4odG9wT2Zmc2V0LCBib3R0b21PZmZzZXQsIGJvdHRvbU9mZnNldCArIGJ5dGVzUGVyUm93KTtcbiAgICBkYXRhLnNldCh0ZW1wLCBib3R0b21PZmZzZXQpO1xuICB9XG59XG5leHBvcnQgZnVuY3Rpb24gc2NhbGVQaXhlbHMoe1xuICBkYXRhLFxuICB3aWR0aCxcbiAgaGVpZ2h0XG59KSB7XG4gIGNvbnN0IG5ld1dpZHRoID0gTWF0aC5yb3VuZCh3aWR0aCAvIDIpO1xuICBjb25zdCBuZXdIZWlnaHQgPSBNYXRoLnJvdW5kKGhlaWdodCAvIDIpO1xuICBjb25zdCBuZXdEYXRhID0gbmV3IFVpbnQ4QXJyYXkobmV3V2lkdGggKiBuZXdIZWlnaHQgKiA0KTtcblxuICBmb3IgKGxldCB5ID0gMDsgeSA8IG5ld0hlaWdodDsgeSsrKSB7XG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCBuZXdXaWR0aDsgeCsrKSB7XG4gICAgICBmb3IgKGxldCBjID0gMDsgYyA8IDQ7IGMrKykge1xuICAgICAgICBuZXdEYXRhWyh5ICogbmV3V2lkdGggKyB4KSAqIDQgKyBjXSA9IGRhdGFbKHkgKiAyICogd2lkdGggKyB4ICogMikgKiA0ICsgY107XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBkYXRhOiBuZXdEYXRhLFxuICAgIHdpZHRoOiBuZXdXaWR0aCxcbiAgICBoZWlnaHQ6IG5ld0hlaWdodFxuICB9O1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dHlwZWQtYXJyYXktdXRpbHMuanMubWFwIiwiZXhwb3J0IHsgZGVmYXVsdCBhcyBTdGF0cyB9IGZyb20gJy4vbGliL3N0YXRzJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgU3RhdCB9IGZyb20gJy4vbGliL3N0YXQnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBfZ2V0SGlSZXNUaW1lc3RhbXAgfSBmcm9tICcuL3V0aWxzL2hpLXJlcy10aW1lc3RhbXAnO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwIiwiaW1wb3J0IGdldEhpUmVzVGltZXN0YW1wIGZyb20gJy4uL3V0aWxzL2hpLXJlcy10aW1lc3RhbXAnO1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhdCB7XG4gIGNvbnN0cnVjdG9yKG5hbWUsIHR5cGUpIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgdGhpcy5zYW1wbGVTaXplID0gMTtcbiAgICB0aGlzLnJlc2V0KCk7XG4gIH1cblxuICBzZXRTYW1wbGVTaXplKHNhbXBsZXMpIHtcbiAgICB0aGlzLnNhbXBsZVNpemUgPSBzYW1wbGVzO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgaW5jcmVtZW50Q291bnQoKSB7XG4gICAgdGhpcy5hZGRDb3VudCgxKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGRlY3JlbWVudENvdW50KCkge1xuICAgIHRoaXMuc3VidHJhY3RDb3VudCgxKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGFkZENvdW50KHZhbHVlKSB7XG4gICAgdGhpcy5fY291bnQgKz0gdmFsdWU7XG4gICAgdGhpcy5fc2FtcGxlcysrO1xuXG4gICAgdGhpcy5fY2hlY2tTYW1wbGluZygpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzdWJ0cmFjdENvdW50KHZhbHVlKSB7XG4gICAgdGhpcy5fY291bnQgLT0gdmFsdWU7XG4gICAgdGhpcy5fc2FtcGxlcysrO1xuXG4gICAgdGhpcy5fY2hlY2tTYW1wbGluZygpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBhZGRUaW1lKHRpbWUpIHtcbiAgICB0aGlzLl90aW1lICs9IHRpbWU7XG4gICAgdGhpcy5sYXN0VGltaW5nID0gdGltZTtcbiAgICB0aGlzLl9zYW1wbGVzKys7XG5cbiAgICB0aGlzLl9jaGVja1NhbXBsaW5nKCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHRpbWVTdGFydCgpIHtcbiAgICB0aGlzLl9zdGFydFRpbWUgPSBnZXRIaVJlc1RpbWVzdGFtcCgpO1xuICAgIHRoaXMuX3RpbWVyUGVuZGluZyA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB0aW1lRW5kKCkge1xuICAgIGlmICghdGhpcy5fdGltZXJQZW5kaW5nKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0aGlzLmFkZFRpbWUoZ2V0SGlSZXNUaW1lc3RhbXAoKSAtIHRoaXMuX3N0YXJ0VGltZSk7XG4gICAgdGhpcy5fdGltZXJQZW5kaW5nID0gZmFsc2U7XG5cbiAgICB0aGlzLl9jaGVja1NhbXBsaW5nKCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGdldFNhbXBsZUF2ZXJhZ2VDb3VudCgpIHtcbiAgICByZXR1cm4gdGhpcy5zYW1wbGVTaXplID4gMCA/IHRoaXMubGFzdFNhbXBsZUNvdW50IC8gdGhpcy5zYW1wbGVTaXplIDogMDtcbiAgfVxuXG4gIGdldFNhbXBsZUF2ZXJhZ2VUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLnNhbXBsZVNpemUgPiAwID8gdGhpcy5sYXN0U2FtcGxlVGltZSAvIHRoaXMuc2FtcGxlU2l6ZSA6IDA7XG4gIH1cblxuICBnZXRTYW1wbGVIeigpIHtcbiAgICByZXR1cm4gdGhpcy5sYXN0U2FtcGxlVGltZSA+IDAgPyB0aGlzLnNhbXBsZVNpemUgLyAodGhpcy5sYXN0U2FtcGxlVGltZSAvIDEwMDApIDogMDtcbiAgfVxuXG4gIGdldEF2ZXJhZ2VDb3VudCgpIHtcbiAgICByZXR1cm4gdGhpcy5zYW1wbGVzID4gMCA/IHRoaXMuY291bnQgLyB0aGlzLnNhbXBsZXMgOiAwO1xuICB9XG5cbiAgZ2V0QXZlcmFnZVRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2FtcGxlcyA+IDAgPyB0aGlzLnRpbWUgLyB0aGlzLnNhbXBsZXMgOiAwO1xuICB9XG5cbiAgZ2V0SHooKSB7XG4gICAgcmV0dXJuIHRoaXMudGltZSA+IDAgPyB0aGlzLnNhbXBsZXMgLyAodGhpcy50aW1lIC8gMTAwMCkgOiAwO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy50aW1lID0gMDtcbiAgICB0aGlzLmNvdW50ID0gMDtcbiAgICB0aGlzLnNhbXBsZXMgPSAwO1xuICAgIHRoaXMubGFzdFRpbWluZyA9IDA7XG4gICAgdGhpcy5sYXN0U2FtcGxlVGltZSA9IDA7XG4gICAgdGhpcy5sYXN0U2FtcGxlQ291bnQgPSAwO1xuICAgIHRoaXMuX2NvdW50ID0gMDtcbiAgICB0aGlzLl90aW1lID0gMDtcbiAgICB0aGlzLl9zYW1wbGVzID0gMDtcbiAgICB0aGlzLl9zdGFydFRpbWUgPSAwO1xuICAgIHRoaXMuX3RpbWVyUGVuZGluZyA9IGZhbHNlO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgX2NoZWNrU2FtcGxpbmcoKSB7XG4gICAgaWYgKHRoaXMuX3NhbXBsZXMgPT09IHRoaXMuc2FtcGxlU2l6ZSkge1xuICAgICAgdGhpcy5sYXN0U2FtcGxlVGltZSA9IHRoaXMuX3RpbWU7XG4gICAgICB0aGlzLmxhc3RTYW1wbGVDb3VudCA9IHRoaXMuX2NvdW50O1xuICAgICAgdGhpcy5jb3VudCArPSB0aGlzLl9jb3VudDtcbiAgICAgIHRoaXMudGltZSArPSB0aGlzLl90aW1lO1xuICAgICAgdGhpcy5zYW1wbGVzICs9IHRoaXMuX3NhbXBsZXM7XG4gICAgICB0aGlzLl90aW1lID0gMDtcbiAgICAgIHRoaXMuX2NvdW50ID0gMDtcbiAgICAgIHRoaXMuX3NhbXBsZXMgPSAwO1xuICAgIH1cbiAgfVxuXG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zdGF0LmpzLm1hcCIsImltcG9ydCBTdGF0IGZyb20gJy4vc3RhdCc7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGF0cyB7XG4gIGNvbnN0cnVjdG9yKHtcbiAgICBpZCxcbiAgICBzdGF0c1xuICB9KSB7XG4gICAgdGhpcy5pZCA9IGlkO1xuICAgIHRoaXMuc3RhdHMgPSB7fTtcblxuICAgIHRoaXMuX2luaXRpYWxpemVTdGF0cyhzdGF0cyk7XG5cbiAgICBPYmplY3Quc2VhbCh0aGlzKTtcbiAgfVxuXG4gIGdldChuYW1lLCB0eXBlID0gJ2NvdW50Jykge1xuICAgIHJldHVybiB0aGlzLl9nZXRPckNyZWF0ZSh7XG4gICAgICBuYW1lLFxuICAgICAgdHlwZVxuICAgIH0pO1xuICB9XG5cbiAgZ2V0IHNpemUoKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuc3RhdHMpLmxlbmd0aDtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIGZvciAoY29uc3Qga2V5IGluIHRoaXMuc3RhdHMpIHtcbiAgICAgIHRoaXMuc3RhdHNba2V5XS5yZXNldCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZm9yRWFjaChmbikge1xuICAgIGZvciAoY29uc3Qga2V5IGluIHRoaXMuc3RhdHMpIHtcbiAgICAgIGZuKHRoaXMuc3RhdHNba2V5XSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0VGFibGUoKSB7XG4gICAgY29uc3QgdGFibGUgPSB7fTtcbiAgICB0aGlzLmZvckVhY2goc3RhdCA9PiB7XG4gICAgICB0YWJsZVtzdGF0Lm5hbWVdID0ge1xuICAgICAgICB0aW1lOiBzdGF0LnRpbWUgfHwgMCxcbiAgICAgICAgY291bnQ6IHN0YXQuY291bnQgfHwgMCxcbiAgICAgICAgYXZlcmFnZTogc3RhdC5nZXRBdmVyYWdlVGltZSgpIHx8IDAsXG4gICAgICAgIGh6OiBzdGF0LmdldEh6KCkgfHwgMFxuICAgICAgfTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGFibGU7XG4gIH1cblxuICBfaW5pdGlhbGl6ZVN0YXRzKHN0YXRzID0gW10pIHtcbiAgICBzdGF0cy5mb3JFYWNoKHN0YXQgPT4gdGhpcy5fZ2V0T3JDcmVhdGUoc3RhdCkpO1xuICB9XG5cbiAgX2dldE9yQ3JlYXRlKHN0YXQpIHtcbiAgICBpZiAoIXN0YXQgfHwgIXN0YXQubmFtZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3Qge1xuICAgICAgbmFtZSxcbiAgICAgIHR5cGVcbiAgICB9ID0gc3RhdDtcblxuICAgIGlmICghdGhpcy5zdGF0c1tuYW1lXSkge1xuICAgICAgaWYgKHN0YXQgaW5zdGFuY2VvZiBTdGF0KSB7XG4gICAgICAgIHRoaXMuc3RhdHNbbmFtZV0gPSBzdGF0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zdGF0c1tuYW1lXSA9IG5ldyBTdGF0KG5hbWUsIHR5cGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnN0YXRzW25hbWVdO1xuICB9XG5cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXN0YXRzLmpzLm1hcCIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldEhpUmVzVGltZXN0YW1wKCkge1xuICBsZXQgdGltZXN0YW1wO1xuXG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cucGVyZm9ybWFuY2UpIHtcbiAgICB0aW1lc3RhbXAgPSB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHByb2Nlc3MuaHJ0aW1lKSB7XG4gICAgY29uc3QgdGltZVBhcnRzID0gcHJvY2Vzcy5ocnRpbWUoKTtcbiAgICB0aW1lc3RhbXAgPSB0aW1lUGFydHNbMF0gKiAxMDAwICsgdGltZVBhcnRzWzFdIC8gMWU2O1xuICB9IGVsc2Uge1xuICAgIHRpbWVzdGFtcCA9IERhdGUubm93KCk7XG4gIH1cblxuICByZXR1cm4gdGltZXN0YW1wO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aGktcmVzLXRpbWVzdGFtcC5qcy5tYXAiLCIvKiFcbiAqIEBvdmVydmlldyBlczYtcHJvbWlzZSAtIGEgdGlueSBpbXBsZW1lbnRhdGlvbiBvZiBQcm9taXNlcy9BKy5cbiAqIEBjb3B5cmlnaHQgQ29weXJpZ2h0IChjKSAyMDE0IFllaHVkYSBLYXR6LCBUb20gRGFsZSwgU3RlZmFuIFBlbm5lciBhbmQgY29udHJpYnV0b3JzIChDb252ZXJzaW9uIHRvIEVTNiBBUEkgYnkgSmFrZSBBcmNoaWJhbGQpXG4gKiBAbGljZW5zZSAgIExpY2Vuc2VkIHVuZGVyIE1JVCBsaWNlbnNlXG4gKiAgICAgICAgICAgIFNlZSBodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vc3RlZmFucGVubmVyL2VzNi1wcm9taXNlL21hc3Rlci9MSUNFTlNFXG4gKiBAdmVyc2lvbiAgIHY0LjIuOCsxZTY4ZGNlNlxuICovXG5cbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG5cdHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpIDpcblx0dHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKGZhY3RvcnkpIDpcblx0KGdsb2JhbC5FUzZQcm9taXNlID0gZmFjdG9yeSgpKTtcbn0odGhpcywgKGZ1bmN0aW9uICgpIHsgJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBvYmplY3RPckZ1bmN0aW9uKHgpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgeDtcbiAgcmV0dXJuIHggIT09IG51bGwgJiYgKHR5cGUgPT09ICdvYmplY3QnIHx8IHR5cGUgPT09ICdmdW5jdGlvbicpO1xufVxuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHgpIHtcbiAgcmV0dXJuIHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nO1xufVxuXG5cblxudmFyIF9pc0FycmF5ID0gdm9pZCAwO1xuaWYgKEFycmF5LmlzQXJyYXkpIHtcbiAgX2lzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xufSBlbHNlIHtcbiAgX2lzQXJyYXkgPSBmdW5jdGlvbiAoeCkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gIH07XG59XG5cbnZhciBpc0FycmF5ID0gX2lzQXJyYXk7XG5cbnZhciBsZW4gPSAwO1xudmFyIHZlcnR4TmV4dCA9IHZvaWQgMDtcbnZhciBjdXN0b21TY2hlZHVsZXJGbiA9IHZvaWQgMDtcblxudmFyIGFzYXAgPSBmdW5jdGlvbiBhc2FwKGNhbGxiYWNrLCBhcmcpIHtcbiAgcXVldWVbbGVuXSA9IGNhbGxiYWNrO1xuICBxdWV1ZVtsZW4gKyAxXSA9IGFyZztcbiAgbGVuICs9IDI7XG4gIGlmIChsZW4gPT09IDIpIHtcbiAgICAvLyBJZiBsZW4gaXMgMiwgdGhhdCBtZWFucyB0aGF0IHdlIG5lZWQgdG8gc2NoZWR1bGUgYW4gYXN5bmMgZmx1c2guXG4gICAgLy8gSWYgYWRkaXRpb25hbCBjYWxsYmFja3MgYXJlIHF1ZXVlZCBiZWZvcmUgdGhlIHF1ZXVlIGlzIGZsdXNoZWQsIHRoZXlcbiAgICAvLyB3aWxsIGJlIHByb2Nlc3NlZCBieSB0aGlzIGZsdXNoIHRoYXQgd2UgYXJlIHNjaGVkdWxpbmcuXG4gICAgaWYgKGN1c3RvbVNjaGVkdWxlckZuKSB7XG4gICAgICBjdXN0b21TY2hlZHVsZXJGbihmbHVzaCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNjaGVkdWxlRmx1c2goKTtcbiAgICB9XG4gIH1cbn07XG5cbmZ1bmN0aW9uIHNldFNjaGVkdWxlcihzY2hlZHVsZUZuKSB7XG4gIGN1c3RvbVNjaGVkdWxlckZuID0gc2NoZWR1bGVGbjtcbn1cblxuZnVuY3Rpb24gc2V0QXNhcChhc2FwRm4pIHtcbiAgYXNhcCA9IGFzYXBGbjtcbn1cblxudmFyIGJyb3dzZXJXaW5kb3cgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHVuZGVmaW5lZDtcbnZhciBicm93c2VyR2xvYmFsID0gYnJvd3NlcldpbmRvdyB8fCB7fTtcbnZhciBCcm93c2VyTXV0YXRpb25PYnNlcnZlciA9IGJyb3dzZXJHbG9iYWwuTXV0YXRpb25PYnNlcnZlciB8fCBicm93c2VyR2xvYmFsLldlYktpdE11dGF0aW9uT2JzZXJ2ZXI7XG52YXIgaXNOb2RlID0gdHlwZW9mIHNlbGYgPT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiB7fS50b1N0cmluZy5jYWxsKHByb2Nlc3MpID09PSAnW29iamVjdCBwcm9jZXNzXSc7XG5cbi8vIHRlc3QgZm9yIHdlYiB3b3JrZXIgYnV0IG5vdCBpbiBJRTEwXG52YXIgaXNXb3JrZXIgPSB0eXBlb2YgVWludDhDbGFtcGVkQXJyYXkgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBpbXBvcnRTY3JpcHRzICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgTWVzc2FnZUNoYW5uZWwgIT09ICd1bmRlZmluZWQnO1xuXG4vLyBub2RlXG5mdW5jdGlvbiB1c2VOZXh0VGljaygpIHtcbiAgLy8gbm9kZSB2ZXJzaW9uIDAuMTAueCBkaXNwbGF5cyBhIGRlcHJlY2F0aW9uIHdhcm5pbmcgd2hlbiBuZXh0VGljayBpcyB1c2VkIHJlY3Vyc2l2ZWx5XG4gIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vY3Vqb2pzL3doZW4vaXNzdWVzLzQxMCBmb3IgZGV0YWlsc1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBwcm9jZXNzLm5leHRUaWNrKGZsdXNoKTtcbiAgfTtcbn1cblxuLy8gdmVydHhcbmZ1bmN0aW9uIHVzZVZlcnR4VGltZXIoKSB7XG4gIGlmICh0eXBlb2YgdmVydHhOZXh0ICE9PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICB2ZXJ0eE5leHQoZmx1c2gpO1xuICAgIH07XG4gIH1cblxuICByZXR1cm4gdXNlU2V0VGltZW91dCgpO1xufVxuXG5mdW5jdGlvbiB1c2VNdXRhdGlvbk9ic2VydmVyKCkge1xuICB2YXIgaXRlcmF0aW9ucyA9IDA7XG4gIHZhciBvYnNlcnZlciA9IG5ldyBCcm93c2VyTXV0YXRpb25PYnNlcnZlcihmbHVzaCk7XG4gIHZhciBub2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJycpO1xuICBvYnNlcnZlci5vYnNlcnZlKG5vZGUsIHsgY2hhcmFjdGVyRGF0YTogdHJ1ZSB9KTtcblxuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIG5vZGUuZGF0YSA9IGl0ZXJhdGlvbnMgPSArK2l0ZXJhdGlvbnMgJSAyO1xuICB9O1xufVxuXG4vLyB3ZWIgd29ya2VyXG5mdW5jdGlvbiB1c2VNZXNzYWdlQ2hhbm5lbCgpIHtcbiAgdmFyIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtcbiAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBmbHVzaDtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gY2hhbm5lbC5wb3J0Mi5wb3N0TWVzc2FnZSgwKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gdXNlU2V0VGltZW91dCgpIHtcbiAgLy8gU3RvcmUgc2V0VGltZW91dCByZWZlcmVuY2Ugc28gZXM2LXByb21pc2Ugd2lsbCBiZSB1bmFmZmVjdGVkIGJ5XG4gIC8vIG90aGVyIGNvZGUgbW9kaWZ5aW5nIHNldFRpbWVvdXQgKGxpa2Ugc2lub24udXNlRmFrZVRpbWVycygpKVxuICB2YXIgZ2xvYmFsU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGdsb2JhbFNldFRpbWVvdXQoZmx1c2gsIDEpO1xuICB9O1xufVxuXG52YXIgcXVldWUgPSBuZXcgQXJyYXkoMTAwMCk7XG5mdW5jdGlvbiBmbHVzaCgpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkgKz0gMikge1xuICAgIHZhciBjYWxsYmFjayA9IHF1ZXVlW2ldO1xuICAgIHZhciBhcmcgPSBxdWV1ZVtpICsgMV07XG5cbiAgICBjYWxsYmFjayhhcmcpO1xuXG4gICAgcXVldWVbaV0gPSB1bmRlZmluZWQ7XG4gICAgcXVldWVbaSArIDFdID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgbGVuID0gMDtcbn1cblxuZnVuY3Rpb24gYXR0ZW1wdFZlcnR4KCkge1xuICB0cnkge1xuICAgIHZhciB2ZXJ0eCA9IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCkucmVxdWlyZSgndmVydHgnKTtcbiAgICB2ZXJ0eE5leHQgPSB2ZXJ0eC5ydW5Pbkxvb3AgfHwgdmVydHgucnVuT25Db250ZXh0O1xuICAgIHJldHVybiB1c2VWZXJ0eFRpbWVyKCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gdXNlU2V0VGltZW91dCgpO1xuICB9XG59XG5cbnZhciBzY2hlZHVsZUZsdXNoID0gdm9pZCAwO1xuLy8gRGVjaWRlIHdoYXQgYXN5bmMgbWV0aG9kIHRvIHVzZSB0byB0cmlnZ2VyaW5nIHByb2Nlc3Npbmcgb2YgcXVldWVkIGNhbGxiYWNrczpcbmlmIChpc05vZGUpIHtcbiAgc2NoZWR1bGVGbHVzaCA9IHVzZU5leHRUaWNrKCk7XG59IGVsc2UgaWYgKEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyKSB7XG4gIHNjaGVkdWxlRmx1c2ggPSB1c2VNdXRhdGlvbk9ic2VydmVyKCk7XG59IGVsc2UgaWYgKGlzV29ya2VyKSB7XG4gIHNjaGVkdWxlRmx1c2ggPSB1c2VNZXNzYWdlQ2hhbm5lbCgpO1xufSBlbHNlIGlmIChicm93c2VyV2luZG93ID09PSB1bmRlZmluZWQgJiYgdHlwZW9mIHJlcXVpcmUgPT09ICdmdW5jdGlvbicpIHtcbiAgc2NoZWR1bGVGbHVzaCA9IGF0dGVtcHRWZXJ0eCgpO1xufSBlbHNlIHtcbiAgc2NoZWR1bGVGbHVzaCA9IHVzZVNldFRpbWVvdXQoKTtcbn1cblxuZnVuY3Rpb24gdGhlbihvbkZ1bGZpbGxtZW50LCBvblJlamVjdGlvbikge1xuICB2YXIgcGFyZW50ID0gdGhpcztcblxuICB2YXIgY2hpbGQgPSBuZXcgdGhpcy5jb25zdHJ1Y3Rvcihub29wKTtcblxuICBpZiAoY2hpbGRbUFJPTUlTRV9JRF0gPT09IHVuZGVmaW5lZCkge1xuICAgIG1ha2VQcm9taXNlKGNoaWxkKTtcbiAgfVxuXG4gIHZhciBfc3RhdGUgPSBwYXJlbnQuX3N0YXRlO1xuXG5cbiAgaWYgKF9zdGF0ZSkge1xuICAgIHZhciBjYWxsYmFjayA9IGFyZ3VtZW50c1tfc3RhdGUgLSAxXTtcbiAgICBhc2FwKGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBpbnZva2VDYWxsYmFjayhfc3RhdGUsIGNoaWxkLCBjYWxsYmFjaywgcGFyZW50Ll9yZXN1bHQpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHN1YnNjcmliZShwYXJlbnQsIGNoaWxkLCBvbkZ1bGZpbGxtZW50LCBvblJlamVjdGlvbik7XG4gIH1cblxuICByZXR1cm4gY2hpbGQ7XG59XG5cbi8qKlxuICBgUHJvbWlzZS5yZXNvbHZlYCByZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHdpbGwgYmVjb21lIHJlc29sdmVkIHdpdGggdGhlXG4gIHBhc3NlZCBgdmFsdWVgLiBJdCBpcyBzaG9ydGhhbmQgZm9yIHRoZSBmb2xsb3dpbmc6XG5cbiAgYGBgamF2YXNjcmlwdFxuICBsZXQgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XG4gICAgcmVzb2x2ZSgxKTtcbiAgfSk7XG5cbiAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAvLyB2YWx1ZSA9PT0gMVxuICB9KTtcbiAgYGBgXG5cbiAgSW5zdGVhZCBvZiB3cml0aW5nIHRoZSBhYm92ZSwgeW91ciBjb2RlIG5vdyBzaW1wbHkgYmVjb21lcyB0aGUgZm9sbG93aW5nOlxuXG4gIGBgYGphdmFzY3JpcHRcbiAgbGV0IHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoMSk7XG5cbiAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAvLyB2YWx1ZSA9PT0gMVxuICB9KTtcbiAgYGBgXG5cbiAgQG1ldGhvZCByZXNvbHZlXG4gIEBzdGF0aWNcbiAgQHBhcmFtIHtBbnl9IHZhbHVlIHZhbHVlIHRoYXQgdGhlIHJldHVybmVkIHByb21pc2Ugd2lsbCBiZSByZXNvbHZlZCB3aXRoXG4gIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgQHJldHVybiB7UHJvbWlzZX0gYSBwcm9taXNlIHRoYXQgd2lsbCBiZWNvbWUgZnVsZmlsbGVkIHdpdGggdGhlIGdpdmVuXG4gIGB2YWx1ZWBcbiovXG5mdW5jdGlvbiByZXNvbHZlJDEob2JqZWN0KSB7XG4gIC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovXG4gIHZhciBDb25zdHJ1Y3RvciA9IHRoaXM7XG5cbiAgaWYgKG9iamVjdCAmJiB0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0JyAmJiBvYmplY3QuY29uc3RydWN0b3IgPT09IENvbnN0cnVjdG9yKSB7XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfVxuXG4gIHZhciBwcm9taXNlID0gbmV3IENvbnN0cnVjdG9yKG5vb3ApO1xuICByZXNvbHZlKHByb21pc2UsIG9iamVjdCk7XG4gIHJldHVybiBwcm9taXNlO1xufVxuXG52YXIgUFJPTUlTRV9JRCA9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyKTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnZhciBQRU5ESU5HID0gdm9pZCAwO1xudmFyIEZVTEZJTExFRCA9IDE7XG52YXIgUkVKRUNURUQgPSAyO1xuXG5mdW5jdGlvbiBzZWxmRnVsZmlsbG1lbnQoKSB7XG4gIHJldHVybiBuZXcgVHlwZUVycm9yKFwiWW91IGNhbm5vdCByZXNvbHZlIGEgcHJvbWlzZSB3aXRoIGl0c2VsZlwiKTtcbn1cblxuZnVuY3Rpb24gY2Fubm90UmV0dXJuT3duKCkge1xuICByZXR1cm4gbmV3IFR5cGVFcnJvcignQSBwcm9taXNlcyBjYWxsYmFjayBjYW5ub3QgcmV0dXJuIHRoYXQgc2FtZSBwcm9taXNlLicpO1xufVxuXG5mdW5jdGlvbiB0cnlUaGVuKHRoZW4kJDEsIHZhbHVlLCBmdWxmaWxsbWVudEhhbmRsZXIsIHJlamVjdGlvbkhhbmRsZXIpIHtcbiAgdHJ5IHtcbiAgICB0aGVuJCQxLmNhbGwodmFsdWUsIGZ1bGZpbGxtZW50SGFuZGxlciwgcmVqZWN0aW9uSGFuZGxlcik7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBoYW5kbGVGb3JlaWduVGhlbmFibGUocHJvbWlzZSwgdGhlbmFibGUsIHRoZW4kJDEpIHtcbiAgYXNhcChmdW5jdGlvbiAocHJvbWlzZSkge1xuICAgIHZhciBzZWFsZWQgPSBmYWxzZTtcbiAgICB2YXIgZXJyb3IgPSB0cnlUaGVuKHRoZW4kJDEsIHRoZW5hYmxlLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIGlmIChzZWFsZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgc2VhbGVkID0gdHJ1ZTtcbiAgICAgIGlmICh0aGVuYWJsZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmdWxmaWxsKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICBpZiAoc2VhbGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHNlYWxlZCA9IHRydWU7XG5cbiAgICAgIHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgIH0sICdTZXR0bGU6ICcgKyAocHJvbWlzZS5fbGFiZWwgfHwgJyB1bmtub3duIHByb21pc2UnKSk7XG5cbiAgICBpZiAoIXNlYWxlZCAmJiBlcnJvcikge1xuICAgICAgc2VhbGVkID0gdHJ1ZTtcbiAgICAgIHJlamVjdChwcm9taXNlLCBlcnJvcik7XG4gICAgfVxuICB9LCBwcm9taXNlKTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlT3duVGhlbmFibGUocHJvbWlzZSwgdGhlbmFibGUpIHtcbiAgaWYgKHRoZW5hYmxlLl9zdGF0ZSA9PT0gRlVMRklMTEVEKSB7XG4gICAgZnVsZmlsbChwcm9taXNlLCB0aGVuYWJsZS5fcmVzdWx0KTtcbiAgfSBlbHNlIGlmICh0aGVuYWJsZS5fc3RhdGUgPT09IFJFSkVDVEVEKSB7XG4gICAgcmVqZWN0KHByb21pc2UsIHRoZW5hYmxlLl9yZXN1bHQpO1xuICB9IGVsc2Uge1xuICAgIHN1YnNjcmliZSh0aGVuYWJsZSwgdW5kZWZpbmVkLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHJldHVybiByZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICByZXR1cm4gcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaGFuZGxlTWF5YmVUaGVuYWJsZShwcm9taXNlLCBtYXliZVRoZW5hYmxlLCB0aGVuJCQxKSB7XG4gIGlmIChtYXliZVRoZW5hYmxlLmNvbnN0cnVjdG9yID09PSBwcm9taXNlLmNvbnN0cnVjdG9yICYmIHRoZW4kJDEgPT09IHRoZW4gJiYgbWF5YmVUaGVuYWJsZS5jb25zdHJ1Y3Rvci5yZXNvbHZlID09PSByZXNvbHZlJDEpIHtcbiAgICBoYW5kbGVPd25UaGVuYWJsZShwcm9taXNlLCBtYXliZVRoZW5hYmxlKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAodGhlbiQkMSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBmdWxmaWxsKHByb21pc2UsIG1heWJlVGhlbmFibGUpO1xuICAgIH0gZWxzZSBpZiAoaXNGdW5jdGlvbih0aGVuJCQxKSkge1xuICAgICAgaGFuZGxlRm9yZWlnblRoZW5hYmxlKHByb21pc2UsIG1heWJlVGhlbmFibGUsIHRoZW4kJDEpO1xuICAgIH0gZWxzZSB7XG4gICAgICBmdWxmaWxsKHByb21pc2UsIG1heWJlVGhlbmFibGUpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiByZXNvbHZlKHByb21pc2UsIHZhbHVlKSB7XG4gIGlmIChwcm9taXNlID09PSB2YWx1ZSkge1xuICAgIHJlamVjdChwcm9taXNlLCBzZWxmRnVsZmlsbG1lbnQoKSk7XG4gIH0gZWxzZSBpZiAob2JqZWN0T3JGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICB2YXIgdGhlbiQkMSA9IHZvaWQgMDtcbiAgICB0cnkge1xuICAgICAgdGhlbiQkMSA9IHZhbHVlLnRoZW47XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHJlamVjdChwcm9taXNlLCBlcnJvcik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGhhbmRsZU1heWJlVGhlbmFibGUocHJvbWlzZSwgdmFsdWUsIHRoZW4kJDEpO1xuICB9IGVsc2Uge1xuICAgIGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHB1Ymxpc2hSZWplY3Rpb24ocHJvbWlzZSkge1xuICBpZiAocHJvbWlzZS5fb25lcnJvcikge1xuICAgIHByb21pc2UuX29uZXJyb3IocHJvbWlzZS5fcmVzdWx0KTtcbiAgfVxuXG4gIHB1Ymxpc2gocHJvbWlzZSk7XG59XG5cbmZ1bmN0aW9uIGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpIHtcbiAgaWYgKHByb21pc2UuX3N0YXRlICE9PSBQRU5ESU5HKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgcHJvbWlzZS5fcmVzdWx0ID0gdmFsdWU7XG4gIHByb21pc2UuX3N0YXRlID0gRlVMRklMTEVEO1xuXG4gIGlmIChwcm9taXNlLl9zdWJzY3JpYmVycy5sZW5ndGggIT09IDApIHtcbiAgICBhc2FwKHB1Ymxpc2gsIHByb21pc2UpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlamVjdChwcm9taXNlLCByZWFzb24pIHtcbiAgaWYgKHByb21pc2UuX3N0YXRlICE9PSBQRU5ESU5HKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHByb21pc2UuX3N0YXRlID0gUkVKRUNURUQ7XG4gIHByb21pc2UuX3Jlc3VsdCA9IHJlYXNvbjtcblxuICBhc2FwKHB1Ymxpc2hSZWplY3Rpb24sIHByb21pc2UpO1xufVxuXG5mdW5jdGlvbiBzdWJzY3JpYmUocGFyZW50LCBjaGlsZCwgb25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pIHtcbiAgdmFyIF9zdWJzY3JpYmVycyA9IHBhcmVudC5fc3Vic2NyaWJlcnM7XG4gIHZhciBsZW5ndGggPSBfc3Vic2NyaWJlcnMubGVuZ3RoO1xuXG5cbiAgcGFyZW50Ll9vbmVycm9yID0gbnVsbDtcblxuICBfc3Vic2NyaWJlcnNbbGVuZ3RoXSA9IGNoaWxkO1xuICBfc3Vic2NyaWJlcnNbbGVuZ3RoICsgRlVMRklMTEVEXSA9IG9uRnVsZmlsbG1lbnQ7XG4gIF9zdWJzY3JpYmVyc1tsZW5ndGggKyBSRUpFQ1RFRF0gPSBvblJlamVjdGlvbjtcblxuICBpZiAobGVuZ3RoID09PSAwICYmIHBhcmVudC5fc3RhdGUpIHtcbiAgICBhc2FwKHB1Ymxpc2gsIHBhcmVudCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcHVibGlzaChwcm9taXNlKSB7XG4gIHZhciBzdWJzY3JpYmVycyA9IHByb21pc2UuX3N1YnNjcmliZXJzO1xuICB2YXIgc2V0dGxlZCA9IHByb21pc2UuX3N0YXRlO1xuXG4gIGlmIChzdWJzY3JpYmVycy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgY2hpbGQgPSB2b2lkIDAsXG4gICAgICBjYWxsYmFjayA9IHZvaWQgMCxcbiAgICAgIGRldGFpbCA9IHByb21pc2UuX3Jlc3VsdDtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN1YnNjcmliZXJzLmxlbmd0aDsgaSArPSAzKSB7XG4gICAgY2hpbGQgPSBzdWJzY3JpYmVyc1tpXTtcbiAgICBjYWxsYmFjayA9IHN1YnNjcmliZXJzW2kgKyBzZXR0bGVkXTtcblxuICAgIGlmIChjaGlsZCkge1xuICAgICAgaW52b2tlQ2FsbGJhY2soc2V0dGxlZCwgY2hpbGQsIGNhbGxiYWNrLCBkZXRhaWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjYWxsYmFjayhkZXRhaWwpO1xuICAgIH1cbiAgfVxuXG4gIHByb21pc2UuX3N1YnNjcmliZXJzLmxlbmd0aCA9IDA7XG59XG5cbmZ1bmN0aW9uIGludm9rZUNhbGxiYWNrKHNldHRsZWQsIHByb21pc2UsIGNhbGxiYWNrLCBkZXRhaWwpIHtcbiAgdmFyIGhhc0NhbGxiYWNrID0gaXNGdW5jdGlvbihjYWxsYmFjayksXG4gICAgICB2YWx1ZSA9IHZvaWQgMCxcbiAgICAgIGVycm9yID0gdm9pZCAwLFxuICAgICAgc3VjY2VlZGVkID0gdHJ1ZTtcblxuICBpZiAoaGFzQ2FsbGJhY2spIHtcbiAgICB0cnkge1xuICAgICAgdmFsdWUgPSBjYWxsYmFjayhkZXRhaWwpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHN1Y2NlZWRlZCA9IGZhbHNlO1xuICAgICAgZXJyb3IgPSBlO1xuICAgIH1cblxuICAgIGlmIChwcm9taXNlID09PSB2YWx1ZSkge1xuICAgICAgcmVqZWN0KHByb21pc2UsIGNhbm5vdFJldHVybk93bigpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdmFsdWUgPSBkZXRhaWw7XG4gIH1cblxuICBpZiAocHJvbWlzZS5fc3RhdGUgIT09IFBFTkRJTkcpIHtcbiAgICAvLyBub29wXG4gIH0gZWxzZSBpZiAoaGFzQ2FsbGJhY2sgJiYgc3VjY2VlZGVkKSB7XG4gICAgcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gIH0gZWxzZSBpZiAoc3VjY2VlZGVkID09PSBmYWxzZSkge1xuICAgIHJlamVjdChwcm9taXNlLCBlcnJvcik7XG4gIH0gZWxzZSBpZiAoc2V0dGxlZCA9PT0gRlVMRklMTEVEKSB7XG4gICAgZnVsZmlsbChwcm9taXNlLCB2YWx1ZSk7XG4gIH0gZWxzZSBpZiAoc2V0dGxlZCA9PT0gUkVKRUNURUQpIHtcbiAgICByZWplY3QocHJvbWlzZSwgdmFsdWUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGluaXRpYWxpemVQcm9taXNlKHByb21pc2UsIHJlc29sdmVyKSB7XG4gIHRyeSB7XG4gICAgcmVzb2x2ZXIoZnVuY3Rpb24gcmVzb2x2ZVByb21pc2UodmFsdWUpIHtcbiAgICAgIHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgIH0sIGZ1bmN0aW9uIHJlamVjdFByb21pc2UocmVhc29uKSB7XG4gICAgICByZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICB9KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJlamVjdChwcm9taXNlLCBlKTtcbiAgfVxufVxuXG52YXIgaWQgPSAwO1xuZnVuY3Rpb24gbmV4dElkKCkge1xuICByZXR1cm4gaWQrKztcbn1cblxuZnVuY3Rpb24gbWFrZVByb21pc2UocHJvbWlzZSkge1xuICBwcm9taXNlW1BST01JU0VfSURdID0gaWQrKztcbiAgcHJvbWlzZS5fc3RhdGUgPSB1bmRlZmluZWQ7XG4gIHByb21pc2UuX3Jlc3VsdCA9IHVuZGVmaW5lZDtcbiAgcHJvbWlzZS5fc3Vic2NyaWJlcnMgPSBbXTtcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGlvbkVycm9yKCkge1xuICByZXR1cm4gbmV3IEVycm9yKCdBcnJheSBNZXRob2RzIG11c3QgYmUgcHJvdmlkZWQgYW4gQXJyYXknKTtcbn1cblxudmFyIEVudW1lcmF0b3IgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIEVudW1lcmF0b3IoQ29uc3RydWN0b3IsIGlucHV0KSB7XG4gICAgdGhpcy5faW5zdGFuY2VDb25zdHJ1Y3RvciA9IENvbnN0cnVjdG9yO1xuICAgIHRoaXMucHJvbWlzZSA9IG5ldyBDb25zdHJ1Y3Rvcihub29wKTtcblxuICAgIGlmICghdGhpcy5wcm9taXNlW1BST01JU0VfSURdKSB7XG4gICAgICBtYWtlUHJvbWlzZSh0aGlzLnByb21pc2UpO1xuICAgIH1cblxuICAgIGlmIChpc0FycmF5KGlucHV0KSkge1xuICAgICAgdGhpcy5sZW5ndGggPSBpbnB1dC5sZW5ndGg7XG4gICAgICB0aGlzLl9yZW1haW5pbmcgPSBpbnB1dC5sZW5ndGg7XG5cbiAgICAgIHRoaXMuX3Jlc3VsdCA9IG5ldyBBcnJheSh0aGlzLmxlbmd0aCk7XG5cbiAgICAgIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBmdWxmaWxsKHRoaXMucHJvbWlzZSwgdGhpcy5fcmVzdWx0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubGVuZ3RoID0gdGhpcy5sZW5ndGggfHwgMDtcbiAgICAgICAgdGhpcy5fZW51bWVyYXRlKGlucHV0KTtcbiAgICAgICAgaWYgKHRoaXMuX3JlbWFpbmluZyA9PT0gMCkge1xuICAgICAgICAgIGZ1bGZpbGwodGhpcy5wcm9taXNlLCB0aGlzLl9yZXN1bHQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlamVjdCh0aGlzLnByb21pc2UsIHZhbGlkYXRpb25FcnJvcigpKTtcbiAgICB9XG4gIH1cblxuICBFbnVtZXJhdG9yLnByb3RvdHlwZS5fZW51bWVyYXRlID0gZnVuY3Rpb24gX2VudW1lcmF0ZShpbnB1dCkge1xuICAgIGZvciAodmFyIGkgPSAwOyB0aGlzLl9zdGF0ZSA9PT0gUEVORElORyAmJiBpIDwgaW5wdXQubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuX2VhY2hFbnRyeShpbnB1dFtpXSwgaSk7XG4gICAgfVxuICB9O1xuXG4gIEVudW1lcmF0b3IucHJvdG90eXBlLl9lYWNoRW50cnkgPSBmdW5jdGlvbiBfZWFjaEVudHJ5KGVudHJ5LCBpKSB7XG4gICAgdmFyIGMgPSB0aGlzLl9pbnN0YW5jZUNvbnN0cnVjdG9yO1xuICAgIHZhciByZXNvbHZlJCQxID0gYy5yZXNvbHZlO1xuXG5cbiAgICBpZiAocmVzb2x2ZSQkMSA9PT0gcmVzb2x2ZSQxKSB7XG4gICAgICB2YXIgX3RoZW4gPSB2b2lkIDA7XG4gICAgICB2YXIgZXJyb3IgPSB2b2lkIDA7XG4gICAgICB2YXIgZGlkRXJyb3IgPSBmYWxzZTtcbiAgICAgIHRyeSB7XG4gICAgICAgIF90aGVuID0gZW50cnkudGhlbjtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgZGlkRXJyb3IgPSB0cnVlO1xuICAgICAgICBlcnJvciA9IGU7XG4gICAgICB9XG5cbiAgICAgIGlmIChfdGhlbiA9PT0gdGhlbiAmJiBlbnRyeS5fc3RhdGUgIT09IFBFTkRJTkcpIHtcbiAgICAgICAgdGhpcy5fc2V0dGxlZEF0KGVudHJ5Ll9zdGF0ZSwgaSwgZW50cnkuX3Jlc3VsdCk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBfdGhlbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLl9yZW1haW5pbmctLTtcbiAgICAgICAgdGhpcy5fcmVzdWx0W2ldID0gZW50cnk7XG4gICAgICB9IGVsc2UgaWYgKGMgPT09IFByb21pc2UkMSkge1xuICAgICAgICB2YXIgcHJvbWlzZSA9IG5ldyBjKG5vb3ApO1xuICAgICAgICBpZiAoZGlkRXJyb3IpIHtcbiAgICAgICAgICByZWplY3QocHJvbWlzZSwgZXJyb3IpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGhhbmRsZU1heWJlVGhlbmFibGUocHJvbWlzZSwgZW50cnksIF90aGVuKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl93aWxsU2V0dGxlQXQocHJvbWlzZSwgaSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl93aWxsU2V0dGxlQXQobmV3IGMoZnVuY3Rpb24gKHJlc29sdmUkJDEpIHtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZSQkMShlbnRyeSk7XG4gICAgICAgIH0pLCBpKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fd2lsbFNldHRsZUF0KHJlc29sdmUkJDEoZW50cnkpLCBpKTtcbiAgICB9XG4gIH07XG5cbiAgRW51bWVyYXRvci5wcm90b3R5cGUuX3NldHRsZWRBdCA9IGZ1bmN0aW9uIF9zZXR0bGVkQXQoc3RhdGUsIGksIHZhbHVlKSB7XG4gICAgdmFyIHByb21pc2UgPSB0aGlzLnByb21pc2U7XG5cblxuICAgIGlmIChwcm9taXNlLl9zdGF0ZSA9PT0gUEVORElORykge1xuICAgICAgdGhpcy5fcmVtYWluaW5nLS07XG5cbiAgICAgIGlmIChzdGF0ZSA9PT0gUkVKRUNURUQpIHtcbiAgICAgICAgcmVqZWN0KHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3Jlc3VsdFtpXSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLl9yZW1haW5pbmcgPT09IDApIHtcbiAgICAgIGZ1bGZpbGwocHJvbWlzZSwgdGhpcy5fcmVzdWx0KTtcbiAgICB9XG4gIH07XG5cbiAgRW51bWVyYXRvci5wcm90b3R5cGUuX3dpbGxTZXR0bGVBdCA9IGZ1bmN0aW9uIF93aWxsU2V0dGxlQXQocHJvbWlzZSwgaSkge1xuICAgIHZhciBlbnVtZXJhdG9yID0gdGhpcztcblxuICAgIHN1YnNjcmliZShwcm9taXNlLCB1bmRlZmluZWQsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgcmV0dXJuIGVudW1lcmF0b3IuX3NldHRsZWRBdChGVUxGSUxMRUQsIGksIHZhbHVlKTtcbiAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICByZXR1cm4gZW51bWVyYXRvci5fc2V0dGxlZEF0KFJFSkVDVEVELCBpLCByZWFzb24pO1xuICAgIH0pO1xuICB9O1xuXG4gIHJldHVybiBFbnVtZXJhdG9yO1xufSgpO1xuXG4vKipcbiAgYFByb21pc2UuYWxsYCBhY2NlcHRzIGFuIGFycmF5IG9mIHByb21pc2VzLCBhbmQgcmV0dXJucyBhIG5ldyBwcm9taXNlIHdoaWNoXG4gIGlzIGZ1bGZpbGxlZCB3aXRoIGFuIGFycmF5IG9mIGZ1bGZpbGxtZW50IHZhbHVlcyBmb3IgdGhlIHBhc3NlZCBwcm9taXNlcywgb3JcbiAgcmVqZWN0ZWQgd2l0aCB0aGUgcmVhc29uIG9mIHRoZSBmaXJzdCBwYXNzZWQgcHJvbWlzZSB0byBiZSByZWplY3RlZC4gSXQgY2FzdHMgYWxsXG4gIGVsZW1lbnRzIG9mIHRoZSBwYXNzZWQgaXRlcmFibGUgdG8gcHJvbWlzZXMgYXMgaXQgcnVucyB0aGlzIGFsZ29yaXRobS5cblxuICBFeGFtcGxlOlxuXG4gIGBgYGphdmFzY3JpcHRcbiAgbGV0IHByb21pc2UxID0gcmVzb2x2ZSgxKTtcbiAgbGV0IHByb21pc2UyID0gcmVzb2x2ZSgyKTtcbiAgbGV0IHByb21pc2UzID0gcmVzb2x2ZSgzKTtcbiAgbGV0IHByb21pc2VzID0gWyBwcm9taXNlMSwgcHJvbWlzZTIsIHByb21pc2UzIF07XG5cbiAgUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oZnVuY3Rpb24oYXJyYXkpe1xuICAgIC8vIFRoZSBhcnJheSBoZXJlIHdvdWxkIGJlIFsgMSwgMiwgMyBdO1xuICB9KTtcbiAgYGBgXG5cbiAgSWYgYW55IG9mIHRoZSBgcHJvbWlzZXNgIGdpdmVuIHRvIGBhbGxgIGFyZSByZWplY3RlZCwgdGhlIGZpcnN0IHByb21pc2VcbiAgdGhhdCBpcyByZWplY3RlZCB3aWxsIGJlIGdpdmVuIGFzIGFuIGFyZ3VtZW50IHRvIHRoZSByZXR1cm5lZCBwcm9taXNlcydzXG4gIHJlamVjdGlvbiBoYW5kbGVyLiBGb3IgZXhhbXBsZTpcblxuICBFeGFtcGxlOlxuXG4gIGBgYGphdmFzY3JpcHRcbiAgbGV0IHByb21pc2UxID0gcmVzb2x2ZSgxKTtcbiAgbGV0IHByb21pc2UyID0gcmVqZWN0KG5ldyBFcnJvcihcIjJcIikpO1xuICBsZXQgcHJvbWlzZTMgPSByZWplY3QobmV3IEVycm9yKFwiM1wiKSk7XG4gIGxldCBwcm9taXNlcyA9IFsgcHJvbWlzZTEsIHByb21pc2UyLCBwcm9taXNlMyBdO1xuXG4gIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKGZ1bmN0aW9uKGFycmF5KXtcbiAgICAvLyBDb2RlIGhlcmUgbmV2ZXIgcnVucyBiZWNhdXNlIHRoZXJlIGFyZSByZWplY3RlZCBwcm9taXNlcyFcbiAgfSwgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAvLyBlcnJvci5tZXNzYWdlID09PSBcIjJcIlxuICB9KTtcbiAgYGBgXG5cbiAgQG1ldGhvZCBhbGxcbiAgQHN0YXRpY1xuICBAcGFyYW0ge0FycmF5fSBlbnRyaWVzIGFycmF5IG9mIHByb21pc2VzXG4gIEBwYXJhbSB7U3RyaW5nfSBsYWJlbCBvcHRpb25hbCBzdHJpbmcgZm9yIGxhYmVsaW5nIHRoZSBwcm9taXNlLlxuICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gIEByZXR1cm4ge1Byb21pc2V9IHByb21pc2UgdGhhdCBpcyBmdWxmaWxsZWQgd2hlbiBhbGwgYHByb21pc2VzYCBoYXZlIGJlZW5cbiAgZnVsZmlsbGVkLCBvciByZWplY3RlZCBpZiBhbnkgb2YgdGhlbSBiZWNvbWUgcmVqZWN0ZWQuXG4gIEBzdGF0aWNcbiovXG5mdW5jdGlvbiBhbGwoZW50cmllcykge1xuICByZXR1cm4gbmV3IEVudW1lcmF0b3IodGhpcywgZW50cmllcykucHJvbWlzZTtcbn1cblxuLyoqXG4gIGBQcm9taXNlLnJhY2VgIHJldHVybnMgYSBuZXcgcHJvbWlzZSB3aGljaCBpcyBzZXR0bGVkIGluIHRoZSBzYW1lIHdheSBhcyB0aGVcbiAgZmlyc3QgcGFzc2VkIHByb21pc2UgdG8gc2V0dGxlLlxuXG4gIEV4YW1wbGU6XG5cbiAgYGBgamF2YXNjcmlwdFxuICBsZXQgcHJvbWlzZTEgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIHJlc29sdmUoJ3Byb21pc2UgMScpO1xuICAgIH0sIDIwMCk7XG4gIH0pO1xuXG4gIGxldCBwcm9taXNlMiA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgcmVzb2x2ZSgncHJvbWlzZSAyJyk7XG4gICAgfSwgMTAwKTtcbiAgfSk7XG5cbiAgUHJvbWlzZS5yYWNlKFtwcm9taXNlMSwgcHJvbWlzZTJdKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCl7XG4gICAgLy8gcmVzdWx0ID09PSAncHJvbWlzZSAyJyBiZWNhdXNlIGl0IHdhcyByZXNvbHZlZCBiZWZvcmUgcHJvbWlzZTFcbiAgICAvLyB3YXMgcmVzb2x2ZWQuXG4gIH0pO1xuICBgYGBcblxuICBgUHJvbWlzZS5yYWNlYCBpcyBkZXRlcm1pbmlzdGljIGluIHRoYXQgb25seSB0aGUgc3RhdGUgb2YgdGhlIGZpcnN0XG4gIHNldHRsZWQgcHJvbWlzZSBtYXR0ZXJzLiBGb3IgZXhhbXBsZSwgZXZlbiBpZiBvdGhlciBwcm9taXNlcyBnaXZlbiB0byB0aGVcbiAgYHByb21pc2VzYCBhcnJheSBhcmd1bWVudCBhcmUgcmVzb2x2ZWQsIGJ1dCB0aGUgZmlyc3Qgc2V0dGxlZCBwcm9taXNlIGhhc1xuICBiZWNvbWUgcmVqZWN0ZWQgYmVmb3JlIHRoZSBvdGhlciBwcm9taXNlcyBiZWNhbWUgZnVsZmlsbGVkLCB0aGUgcmV0dXJuZWRcbiAgcHJvbWlzZSB3aWxsIGJlY29tZSByZWplY3RlZDpcblxuICBgYGBqYXZhc2NyaXB0XG4gIGxldCBwcm9taXNlMSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgcmVzb2x2ZSgncHJvbWlzZSAxJyk7XG4gICAgfSwgMjAwKTtcbiAgfSk7XG5cbiAgbGV0IHByb21pc2UyID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICByZWplY3QobmV3IEVycm9yKCdwcm9taXNlIDInKSk7XG4gICAgfSwgMTAwKTtcbiAgfSk7XG5cbiAgUHJvbWlzZS5yYWNlKFtwcm9taXNlMSwgcHJvbWlzZTJdKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCl7XG4gICAgLy8gQ29kZSBoZXJlIG5ldmVyIHJ1bnNcbiAgfSwgZnVuY3Rpb24ocmVhc29uKXtcbiAgICAvLyByZWFzb24ubWVzc2FnZSA9PT0gJ3Byb21pc2UgMicgYmVjYXVzZSBwcm9taXNlIDIgYmVjYW1lIHJlamVjdGVkIGJlZm9yZVxuICAgIC8vIHByb21pc2UgMSBiZWNhbWUgZnVsZmlsbGVkXG4gIH0pO1xuICBgYGBcblxuICBBbiBleGFtcGxlIHJlYWwtd29ybGQgdXNlIGNhc2UgaXMgaW1wbGVtZW50aW5nIHRpbWVvdXRzOlxuXG4gIGBgYGphdmFzY3JpcHRcbiAgUHJvbWlzZS5yYWNlKFthamF4KCdmb28uanNvbicpLCB0aW1lb3V0KDUwMDApXSlcbiAgYGBgXG5cbiAgQG1ldGhvZCByYWNlXG4gIEBzdGF0aWNcbiAgQHBhcmFtIHtBcnJheX0gcHJvbWlzZXMgYXJyYXkgb2YgcHJvbWlzZXMgdG8gb2JzZXJ2ZVxuICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gIEByZXR1cm4ge1Byb21pc2V9IGEgcHJvbWlzZSB3aGljaCBzZXR0bGVzIGluIHRoZSBzYW1lIHdheSBhcyB0aGUgZmlyc3QgcGFzc2VkXG4gIHByb21pc2UgdG8gc2V0dGxlLlxuKi9cbmZ1bmN0aW9uIHJhY2UoZW50cmllcykge1xuICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzO1xuXG4gIGlmICghaXNBcnJheShlbnRyaWVzKSkge1xuICAgIHJldHVybiBuZXcgQ29uc3RydWN0b3IoZnVuY3Rpb24gKF8sIHJlamVjdCkge1xuICAgICAgcmV0dXJuIHJlamVjdChuZXcgVHlwZUVycm9yKCdZb3UgbXVzdCBwYXNzIGFuIGFycmF5IHRvIHJhY2UuJykpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBuZXcgQ29uc3RydWN0b3IoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIGxlbmd0aCA9IGVudHJpZXMubGVuZ3RoO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBDb25zdHJ1Y3Rvci5yZXNvbHZlKGVudHJpZXNbaV0pLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAgYFByb21pc2UucmVqZWN0YCByZXR1cm5zIGEgcHJvbWlzZSByZWplY3RlZCB3aXRoIHRoZSBwYXNzZWQgYHJlYXNvbmAuXG4gIEl0IGlzIHNob3J0aGFuZCBmb3IgdGhlIGZvbGxvd2luZzpcblxuICBgYGBqYXZhc2NyaXB0XG4gIGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICByZWplY3QobmV3IEVycm9yKCdXSE9PUFMnKSk7XG4gIH0pO1xuXG4gIHByb21pc2UudGhlbihmdW5jdGlvbih2YWx1ZSl7XG4gICAgLy8gQ29kZSBoZXJlIGRvZXNuJ3QgcnVuIGJlY2F1c2UgdGhlIHByb21pc2UgaXMgcmVqZWN0ZWQhXG4gIH0sIGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgLy8gcmVhc29uLm1lc3NhZ2UgPT09ICdXSE9PUFMnXG4gIH0pO1xuICBgYGBcblxuICBJbnN0ZWFkIG9mIHdyaXRpbmcgdGhlIGFib3ZlLCB5b3VyIGNvZGUgbm93IHNpbXBseSBiZWNvbWVzIHRoZSBmb2xsb3dpbmc6XG5cbiAgYGBgamF2YXNjcmlwdFxuICBsZXQgcHJvbWlzZSA9IFByb21pc2UucmVqZWN0KG5ldyBFcnJvcignV0hPT1BTJykpO1xuXG4gIHByb21pc2UudGhlbihmdW5jdGlvbih2YWx1ZSl7XG4gICAgLy8gQ29kZSBoZXJlIGRvZXNuJ3QgcnVuIGJlY2F1c2UgdGhlIHByb21pc2UgaXMgcmVqZWN0ZWQhXG4gIH0sIGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgLy8gcmVhc29uLm1lc3NhZ2UgPT09ICdXSE9PUFMnXG4gIH0pO1xuICBgYGBcblxuICBAbWV0aG9kIHJlamVjdFxuICBAc3RhdGljXG4gIEBwYXJhbSB7QW55fSByZWFzb24gdmFsdWUgdGhhdCB0aGUgcmV0dXJuZWQgcHJvbWlzZSB3aWxsIGJlIHJlamVjdGVkIHdpdGguXG4gIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgQHJldHVybiB7UHJvbWlzZX0gYSBwcm9taXNlIHJlamVjdGVkIHdpdGggdGhlIGdpdmVuIGByZWFzb25gLlxuKi9cbmZ1bmN0aW9uIHJlamVjdCQxKHJlYXNvbikge1xuICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzO1xuICB2YXIgcHJvbWlzZSA9IG5ldyBDb25zdHJ1Y3Rvcihub29wKTtcbiAgcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gIHJldHVybiBwcm9taXNlO1xufVxuXG5mdW5jdGlvbiBuZWVkc1Jlc29sdmVyKCkge1xuICB0aHJvdyBuZXcgVHlwZUVycm9yKCdZb3UgbXVzdCBwYXNzIGEgcmVzb2x2ZXIgZnVuY3Rpb24gYXMgdGhlIGZpcnN0IGFyZ3VtZW50IHRvIHRoZSBwcm9taXNlIGNvbnN0cnVjdG9yJyk7XG59XG5cbmZ1bmN0aW9uIG5lZWRzTmV3KCkge1xuICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRmFpbGVkIHRvIGNvbnN0cnVjdCAnUHJvbWlzZSc6IFBsZWFzZSB1c2UgdGhlICduZXcnIG9wZXJhdG9yLCB0aGlzIG9iamVjdCBjb25zdHJ1Y3RvciBjYW5ub3QgYmUgY2FsbGVkIGFzIGEgZnVuY3Rpb24uXCIpO1xufVxuXG4vKipcbiAgUHJvbWlzZSBvYmplY3RzIHJlcHJlc2VudCB0aGUgZXZlbnR1YWwgcmVzdWx0IG9mIGFuIGFzeW5jaHJvbm91cyBvcGVyYXRpb24uIFRoZVxuICBwcmltYXJ5IHdheSBvZiBpbnRlcmFjdGluZyB3aXRoIGEgcHJvbWlzZSBpcyB0aHJvdWdoIGl0cyBgdGhlbmAgbWV0aG9kLCB3aGljaFxuICByZWdpc3RlcnMgY2FsbGJhY2tzIHRvIHJlY2VpdmUgZWl0aGVyIGEgcHJvbWlzZSdzIGV2ZW50dWFsIHZhbHVlIG9yIHRoZSByZWFzb25cbiAgd2h5IHRoZSBwcm9taXNlIGNhbm5vdCBiZSBmdWxmaWxsZWQuXG5cbiAgVGVybWlub2xvZ3lcbiAgLS0tLS0tLS0tLS1cblxuICAtIGBwcm9taXNlYCBpcyBhbiBvYmplY3Qgb3IgZnVuY3Rpb24gd2l0aCBhIGB0aGVuYCBtZXRob2Qgd2hvc2UgYmVoYXZpb3IgY29uZm9ybXMgdG8gdGhpcyBzcGVjaWZpY2F0aW9uLlxuICAtIGB0aGVuYWJsZWAgaXMgYW4gb2JqZWN0IG9yIGZ1bmN0aW9uIHRoYXQgZGVmaW5lcyBhIGB0aGVuYCBtZXRob2QuXG4gIC0gYHZhbHVlYCBpcyBhbnkgbGVnYWwgSmF2YVNjcmlwdCB2YWx1ZSAoaW5jbHVkaW5nIHVuZGVmaW5lZCwgYSB0aGVuYWJsZSwgb3IgYSBwcm9taXNlKS5cbiAgLSBgZXhjZXB0aW9uYCBpcyBhIHZhbHVlIHRoYXQgaXMgdGhyb3duIHVzaW5nIHRoZSB0aHJvdyBzdGF0ZW1lbnQuXG4gIC0gYHJlYXNvbmAgaXMgYSB2YWx1ZSB0aGF0IGluZGljYXRlcyB3aHkgYSBwcm9taXNlIHdhcyByZWplY3RlZC5cbiAgLSBgc2V0dGxlZGAgdGhlIGZpbmFsIHJlc3Rpbmcgc3RhdGUgb2YgYSBwcm9taXNlLCBmdWxmaWxsZWQgb3IgcmVqZWN0ZWQuXG5cbiAgQSBwcm9taXNlIGNhbiBiZSBpbiBvbmUgb2YgdGhyZWUgc3RhdGVzOiBwZW5kaW5nLCBmdWxmaWxsZWQsIG9yIHJlamVjdGVkLlxuXG4gIFByb21pc2VzIHRoYXQgYXJlIGZ1bGZpbGxlZCBoYXZlIGEgZnVsZmlsbG1lbnQgdmFsdWUgYW5kIGFyZSBpbiB0aGUgZnVsZmlsbGVkXG4gIHN0YXRlLiAgUHJvbWlzZXMgdGhhdCBhcmUgcmVqZWN0ZWQgaGF2ZSBhIHJlamVjdGlvbiByZWFzb24gYW5kIGFyZSBpbiB0aGVcbiAgcmVqZWN0ZWQgc3RhdGUuICBBIGZ1bGZpbGxtZW50IHZhbHVlIGlzIG5ldmVyIGEgdGhlbmFibGUuXG5cbiAgUHJvbWlzZXMgY2FuIGFsc28gYmUgc2FpZCB0byAqcmVzb2x2ZSogYSB2YWx1ZS4gIElmIHRoaXMgdmFsdWUgaXMgYWxzbyBhXG4gIHByb21pc2UsIHRoZW4gdGhlIG9yaWdpbmFsIHByb21pc2UncyBzZXR0bGVkIHN0YXRlIHdpbGwgbWF0Y2ggdGhlIHZhbHVlJ3NcbiAgc2V0dGxlZCBzdGF0ZS4gIFNvIGEgcHJvbWlzZSB0aGF0ICpyZXNvbHZlcyogYSBwcm9taXNlIHRoYXQgcmVqZWN0cyB3aWxsXG4gIGl0c2VsZiByZWplY3QsIGFuZCBhIHByb21pc2UgdGhhdCAqcmVzb2x2ZXMqIGEgcHJvbWlzZSB0aGF0IGZ1bGZpbGxzIHdpbGxcbiAgaXRzZWxmIGZ1bGZpbGwuXG5cblxuICBCYXNpYyBVc2FnZTpcbiAgLS0tLS0tLS0tLS0tXG5cbiAgYGBganNcbiAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAvLyBvbiBzdWNjZXNzXG4gICAgcmVzb2x2ZSh2YWx1ZSk7XG5cbiAgICAvLyBvbiBmYWlsdXJlXG4gICAgcmVqZWN0KHJlYXNvbik7XG4gIH0pO1xuXG4gIHByb21pc2UudGhlbihmdW5jdGlvbih2YWx1ZSkge1xuICAgIC8vIG9uIGZ1bGZpbGxtZW50XG4gIH0sIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgIC8vIG9uIHJlamVjdGlvblxuICB9KTtcbiAgYGBgXG5cbiAgQWR2YW5jZWQgVXNhZ2U6XG4gIC0tLS0tLS0tLS0tLS0tLVxuXG4gIFByb21pc2VzIHNoaW5lIHdoZW4gYWJzdHJhY3RpbmcgYXdheSBhc3luY2hyb25vdXMgaW50ZXJhY3Rpb25zIHN1Y2ggYXNcbiAgYFhNTEh0dHBSZXF1ZXN0YHMuXG5cbiAgYGBganNcbiAgZnVuY3Rpb24gZ2V0SlNPTih1cmwpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICAgIGxldCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgICAgeGhyLm9wZW4oJ0dFVCcsIHVybCk7XG4gICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gaGFuZGxlcjtcbiAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnanNvbic7XG4gICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgIHhoci5zZW5kKCk7XG5cbiAgICAgIGZ1bmN0aW9uIGhhbmRsZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09IHRoaXMuRE9ORSkge1xuICAgICAgICAgIGlmICh0aGlzLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICByZXNvbHZlKHRoaXMucmVzcG9uc2UpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdnZXRKU09OOiBgJyArIHVybCArICdgIGZhaWxlZCB3aXRoIHN0YXR1czogWycgKyB0aGlzLnN0YXR1cyArICddJykpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldEpTT04oJy9wb3N0cy5qc29uJykudGhlbihmdW5jdGlvbihqc29uKSB7XG4gICAgLy8gb24gZnVsZmlsbG1lbnRcbiAgfSwgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgLy8gb24gcmVqZWN0aW9uXG4gIH0pO1xuICBgYGBcblxuICBVbmxpa2UgY2FsbGJhY2tzLCBwcm9taXNlcyBhcmUgZ3JlYXQgY29tcG9zYWJsZSBwcmltaXRpdmVzLlxuXG4gIGBgYGpzXG4gIFByb21pc2UuYWxsKFtcbiAgICBnZXRKU09OKCcvcG9zdHMnKSxcbiAgICBnZXRKU09OKCcvY29tbWVudHMnKVxuICBdKS50aGVuKGZ1bmN0aW9uKHZhbHVlcyl7XG4gICAgdmFsdWVzWzBdIC8vID0+IHBvc3RzSlNPTlxuICAgIHZhbHVlc1sxXSAvLyA9PiBjb21tZW50c0pTT05cblxuICAgIHJldHVybiB2YWx1ZXM7XG4gIH0pO1xuICBgYGBcblxuICBAY2xhc3MgUHJvbWlzZVxuICBAcGFyYW0ge0Z1bmN0aW9ufSByZXNvbHZlclxuICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gIEBjb25zdHJ1Y3RvclxuKi9cblxudmFyIFByb21pc2UkMSA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gUHJvbWlzZShyZXNvbHZlcikge1xuICAgIHRoaXNbUFJPTUlTRV9JRF0gPSBuZXh0SWQoKTtcbiAgICB0aGlzLl9yZXN1bHQgPSB0aGlzLl9zdGF0ZSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9zdWJzY3JpYmVycyA9IFtdO1xuXG4gICAgaWYgKG5vb3AgIT09IHJlc29sdmVyKSB7XG4gICAgICB0eXBlb2YgcmVzb2x2ZXIgIT09ICdmdW5jdGlvbicgJiYgbmVlZHNSZXNvbHZlcigpO1xuICAgICAgdGhpcyBpbnN0YW5jZW9mIFByb21pc2UgPyBpbml0aWFsaXplUHJvbWlzZSh0aGlzLCByZXNvbHZlcikgOiBuZWVkc05ldygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICBUaGUgcHJpbWFyeSB3YXkgb2YgaW50ZXJhY3Rpbmcgd2l0aCBhIHByb21pc2UgaXMgdGhyb3VnaCBpdHMgYHRoZW5gIG1ldGhvZCxcbiAgd2hpY2ggcmVnaXN0ZXJzIGNhbGxiYWNrcyB0byByZWNlaXZlIGVpdGhlciBhIHByb21pc2UncyBldmVudHVhbCB2YWx1ZSBvciB0aGVcbiAgcmVhc29uIHdoeSB0aGUgcHJvbWlzZSBjYW5ub3QgYmUgZnVsZmlsbGVkLlxuICAgYGBganNcbiAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uKHVzZXIpe1xuICAgIC8vIHVzZXIgaXMgYXZhaWxhYmxlXG4gIH0sIGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgLy8gdXNlciBpcyB1bmF2YWlsYWJsZSwgYW5kIHlvdSBhcmUgZ2l2ZW4gdGhlIHJlYXNvbiB3aHlcbiAgfSk7XG4gIGBgYFxuICAgQ2hhaW5pbmdcbiAgLS0tLS0tLS1cbiAgIFRoZSByZXR1cm4gdmFsdWUgb2YgYHRoZW5gIGlzIGl0c2VsZiBhIHByb21pc2UuICBUaGlzIHNlY29uZCwgJ2Rvd25zdHJlYW0nXG4gIHByb21pc2UgaXMgcmVzb2x2ZWQgd2l0aCB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBmaXJzdCBwcm9taXNlJ3MgZnVsZmlsbG1lbnRcbiAgb3IgcmVqZWN0aW9uIGhhbmRsZXIsIG9yIHJlamVjdGVkIGlmIHRoZSBoYW5kbGVyIHRocm93cyBhbiBleGNlcHRpb24uXG4gICBgYGBqc1xuICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICByZXR1cm4gdXNlci5uYW1lO1xuICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgcmV0dXJuICdkZWZhdWx0IG5hbWUnO1xuICB9KS50aGVuKGZ1bmN0aW9uICh1c2VyTmFtZSkge1xuICAgIC8vIElmIGBmaW5kVXNlcmAgZnVsZmlsbGVkLCBgdXNlck5hbWVgIHdpbGwgYmUgdGhlIHVzZXIncyBuYW1lLCBvdGhlcndpc2UgaXRcbiAgICAvLyB3aWxsIGJlIGAnZGVmYXVsdCBuYW1lJ2BcbiAgfSk7XG4gICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZvdW5kIHVzZXIsIGJ1dCBzdGlsbCB1bmhhcHB5Jyk7XG4gIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2BmaW5kVXNlcmAgcmVqZWN0ZWQgYW5kIHdlJ3JlIHVuaGFwcHknKTtcbiAgfSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAvLyBuZXZlciByZWFjaGVkXG4gIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAvLyBpZiBgZmluZFVzZXJgIGZ1bGZpbGxlZCwgYHJlYXNvbmAgd2lsbCBiZSAnRm91bmQgdXNlciwgYnV0IHN0aWxsIHVuaGFwcHknLlxuICAgIC8vIElmIGBmaW5kVXNlcmAgcmVqZWN0ZWQsIGByZWFzb25gIHdpbGwgYmUgJ2BmaW5kVXNlcmAgcmVqZWN0ZWQgYW5kIHdlJ3JlIHVuaGFwcHknLlxuICB9KTtcbiAgYGBgXG4gIElmIHRoZSBkb3duc3RyZWFtIHByb21pc2UgZG9lcyBub3Qgc3BlY2lmeSBhIHJlamVjdGlvbiBoYW5kbGVyLCByZWplY3Rpb24gcmVhc29ucyB3aWxsIGJlIHByb3BhZ2F0ZWQgZnVydGhlciBkb3duc3RyZWFtLlxuICAgYGBganNcbiAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgdGhyb3cgbmV3IFBlZGFnb2dpY2FsRXhjZXB0aW9uKCdVcHN0cmVhbSBlcnJvcicpO1xuICB9KS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIC8vIG5ldmVyIHJlYWNoZWRcbiAgfSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAvLyBuZXZlciByZWFjaGVkXG4gIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAvLyBUaGUgYFBlZGdhZ29jaWFsRXhjZXB0aW9uYCBpcyBwcm9wYWdhdGVkIGFsbCB0aGUgd2F5IGRvd24gdG8gaGVyZVxuICB9KTtcbiAgYGBgXG4gICBBc3NpbWlsYXRpb25cbiAgLS0tLS0tLS0tLS0tXG4gICBTb21ldGltZXMgdGhlIHZhbHVlIHlvdSB3YW50IHRvIHByb3BhZ2F0ZSB0byBhIGRvd25zdHJlYW0gcHJvbWlzZSBjYW4gb25seSBiZVxuICByZXRyaWV2ZWQgYXN5bmNocm9ub3VzbHkuIFRoaXMgY2FuIGJlIGFjaGlldmVkIGJ5IHJldHVybmluZyBhIHByb21pc2UgaW4gdGhlXG4gIGZ1bGZpbGxtZW50IG9yIHJlamVjdGlvbiBoYW5kbGVyLiBUaGUgZG93bnN0cmVhbSBwcm9taXNlIHdpbGwgdGhlbiBiZSBwZW5kaW5nXG4gIHVudGlsIHRoZSByZXR1cm5lZCBwcm9taXNlIGlzIHNldHRsZWQuIFRoaXMgaXMgY2FsbGVkICphc3NpbWlsYXRpb24qLlxuICAgYGBganNcbiAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgcmV0dXJuIGZpbmRDb21tZW50c0J5QXV0aG9yKHVzZXIpO1xuICB9KS50aGVuKGZ1bmN0aW9uIChjb21tZW50cykge1xuICAgIC8vIFRoZSB1c2VyJ3MgY29tbWVudHMgYXJlIG5vdyBhdmFpbGFibGVcbiAgfSk7XG4gIGBgYFxuICAgSWYgdGhlIGFzc2ltbGlhdGVkIHByb21pc2UgcmVqZWN0cywgdGhlbiB0aGUgZG93bnN0cmVhbSBwcm9taXNlIHdpbGwgYWxzbyByZWplY3QuXG4gICBgYGBqc1xuICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICByZXR1cm4gZmluZENvbW1lbnRzQnlBdXRob3IodXNlcik7XG4gIH0pLnRoZW4oZnVuY3Rpb24gKGNvbW1lbnRzKSB7XG4gICAgLy8gSWYgYGZpbmRDb21tZW50c0J5QXV0aG9yYCBmdWxmaWxscywgd2UnbGwgaGF2ZSB0aGUgdmFsdWUgaGVyZVxuICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgLy8gSWYgYGZpbmRDb21tZW50c0J5QXV0aG9yYCByZWplY3RzLCB3ZSdsbCBoYXZlIHRoZSByZWFzb24gaGVyZVxuICB9KTtcbiAgYGBgXG4gICBTaW1wbGUgRXhhbXBsZVxuICAtLS0tLS0tLS0tLS0tLVxuICAgU3luY2hyb25vdXMgRXhhbXBsZVxuICAgYGBgamF2YXNjcmlwdFxuICBsZXQgcmVzdWx0O1xuICAgdHJ5IHtcbiAgICByZXN1bHQgPSBmaW5kUmVzdWx0KCk7XG4gICAgLy8gc3VjY2Vzc1xuICB9IGNhdGNoKHJlYXNvbikge1xuICAgIC8vIGZhaWx1cmVcbiAgfVxuICBgYGBcbiAgIEVycmJhY2sgRXhhbXBsZVxuICAgYGBganNcbiAgZmluZFJlc3VsdChmdW5jdGlvbihyZXN1bHQsIGVycil7XG4gICAgaWYgKGVycikge1xuICAgICAgLy8gZmFpbHVyZVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBzdWNjZXNzXG4gICAgfVxuICB9KTtcbiAgYGBgXG4gICBQcm9taXNlIEV4YW1wbGU7XG4gICBgYGBqYXZhc2NyaXB0XG4gIGZpbmRSZXN1bHQoKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCl7XG4gICAgLy8gc3VjY2Vzc1xuICB9LCBmdW5jdGlvbihyZWFzb24pe1xuICAgIC8vIGZhaWx1cmVcbiAgfSk7XG4gIGBgYFxuICAgQWR2YW5jZWQgRXhhbXBsZVxuICAtLS0tLS0tLS0tLS0tLVxuICAgU3luY2hyb25vdXMgRXhhbXBsZVxuICAgYGBgamF2YXNjcmlwdFxuICBsZXQgYXV0aG9yLCBib29rcztcbiAgIHRyeSB7XG4gICAgYXV0aG9yID0gZmluZEF1dGhvcigpO1xuICAgIGJvb2tzICA9IGZpbmRCb29rc0J5QXV0aG9yKGF1dGhvcik7XG4gICAgLy8gc3VjY2Vzc1xuICB9IGNhdGNoKHJlYXNvbikge1xuICAgIC8vIGZhaWx1cmVcbiAgfVxuICBgYGBcbiAgIEVycmJhY2sgRXhhbXBsZVxuICAgYGBganNcbiAgIGZ1bmN0aW9uIGZvdW5kQm9va3MoYm9va3MpIHtcbiAgIH1cbiAgIGZ1bmN0aW9uIGZhaWx1cmUocmVhc29uKSB7XG4gICB9XG4gICBmaW5kQXV0aG9yKGZ1bmN0aW9uKGF1dGhvciwgZXJyKXtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBmYWlsdXJlKGVycik7XG4gICAgICAvLyBmYWlsdXJlXG4gICAgfSBlbHNlIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGZpbmRCb29va3NCeUF1dGhvcihhdXRob3IsIGZ1bmN0aW9uKGJvb2tzLCBlcnIpIHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICBmYWlsdXJlKGVycik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGZvdW5kQm9va3MoYm9va3MpO1xuICAgICAgICAgICAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAgICAgICAgICAgZmFpbHVyZShyZWFzb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgIGZhaWx1cmUoZXJyKTtcbiAgICAgIH1cbiAgICAgIC8vIHN1Y2Nlc3NcbiAgICB9XG4gIH0pO1xuICBgYGBcbiAgIFByb21pc2UgRXhhbXBsZTtcbiAgIGBgYGphdmFzY3JpcHRcbiAgZmluZEF1dGhvcigpLlxuICAgIHRoZW4oZmluZEJvb2tzQnlBdXRob3IpLlxuICAgIHRoZW4oZnVuY3Rpb24oYm9va3Mpe1xuICAgICAgLy8gZm91bmQgYm9va3NcbiAgfSkuY2F0Y2goZnVuY3Rpb24ocmVhc29uKXtcbiAgICAvLyBzb21ldGhpbmcgd2VudCB3cm9uZ1xuICB9KTtcbiAgYGBgXG4gICBAbWV0aG9kIHRoZW5cbiAgQHBhcmFtIHtGdW5jdGlvbn0gb25GdWxmaWxsZWRcbiAgQHBhcmFtIHtGdW5jdGlvbn0gb25SZWplY3RlZFxuICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gIEByZXR1cm4ge1Byb21pc2V9XG4gICovXG5cbiAgLyoqXG4gIGBjYXRjaGAgaXMgc2ltcGx5IHN1Z2FyIGZvciBgdGhlbih1bmRlZmluZWQsIG9uUmVqZWN0aW9uKWAgd2hpY2ggbWFrZXMgaXQgdGhlIHNhbWVcbiAgYXMgdGhlIGNhdGNoIGJsb2NrIG9mIGEgdHJ5L2NhdGNoIHN0YXRlbWVudC5cbiAgYGBganNcbiAgZnVuY3Rpb24gZmluZEF1dGhvcigpe1xuICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkbid0IGZpbmQgdGhhdCBhdXRob3InKTtcbiAgfVxuICAvLyBzeW5jaHJvbm91c1xuICB0cnkge1xuICBmaW5kQXV0aG9yKCk7XG4gIH0gY2F0Y2gocmVhc29uKSB7XG4gIC8vIHNvbWV0aGluZyB3ZW50IHdyb25nXG4gIH1cbiAgLy8gYXN5bmMgd2l0aCBwcm9taXNlc1xuICBmaW5kQXV0aG9yKCkuY2F0Y2goZnVuY3Rpb24ocmVhc29uKXtcbiAgLy8gc29tZXRoaW5nIHdlbnQgd3JvbmdcbiAgfSk7XG4gIGBgYFxuICBAbWV0aG9kIGNhdGNoXG4gIEBwYXJhbSB7RnVuY3Rpb259IG9uUmVqZWN0aW9uXG4gIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgQHJldHVybiB7UHJvbWlzZX1cbiAgKi9cblxuXG4gIFByb21pc2UucHJvdG90eXBlLmNhdGNoID0gZnVuY3Rpb24gX2NhdGNoKG9uUmVqZWN0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbihudWxsLCBvblJlamVjdGlvbik7XG4gIH07XG5cbiAgLyoqXG4gICAgYGZpbmFsbHlgIHdpbGwgYmUgaW52b2tlZCByZWdhcmRsZXNzIG9mIHRoZSBwcm9taXNlJ3MgZmF0ZSBqdXN0IGFzIG5hdGl2ZVxuICAgIHRyeS9jYXRjaC9maW5hbGx5IGJlaGF2ZXNcbiAgXG4gICAgU3luY2hyb25vdXMgZXhhbXBsZTpcbiAgXG4gICAgYGBganNcbiAgICBmaW5kQXV0aG9yKCkge1xuICAgICAgaWYgKE1hdGgucmFuZG9tKCkgPiAwLjUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IEF1dGhvcigpO1xuICAgIH1cbiAgXG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBmaW5kQXV0aG9yKCk7IC8vIHN1Y2NlZWQgb3IgZmFpbFxuICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgIHJldHVybiBmaW5kT3RoZXJBdXRoZXIoKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgLy8gYWx3YXlzIHJ1bnNcbiAgICAgIC8vIGRvZXNuJ3QgYWZmZWN0IHRoZSByZXR1cm4gdmFsdWVcbiAgICB9XG4gICAgYGBgXG4gIFxuICAgIEFzeW5jaHJvbm91cyBleGFtcGxlOlxuICBcbiAgICBgYGBqc1xuICAgIGZpbmRBdXRob3IoKS5jYXRjaChmdW5jdGlvbihyZWFzb24pe1xuICAgICAgcmV0dXJuIGZpbmRPdGhlckF1dGhlcigpO1xuICAgIH0pLmZpbmFsbHkoZnVuY3Rpb24oKXtcbiAgICAgIC8vIGF1dGhvciB3YXMgZWl0aGVyIGZvdW5kLCBvciBub3RcbiAgICB9KTtcbiAgICBgYGBcbiAgXG4gICAgQG1ldGhvZCBmaW5hbGx5XG4gICAgQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAgICBAcmV0dXJuIHtQcm9taXNlfVxuICAqL1xuXG5cbiAgUHJvbWlzZS5wcm90b3R5cGUuZmluYWxseSA9IGZ1bmN0aW9uIF9maW5hbGx5KGNhbGxiYWNrKSB7XG4gICAgdmFyIHByb21pc2UgPSB0aGlzO1xuICAgIHZhciBjb25zdHJ1Y3RvciA9IHByb21pc2UuY29uc3RydWN0b3I7XG5cbiAgICBpZiAoaXNGdW5jdGlvbihjYWxsYmFjaykpIHtcbiAgICAgIHJldHVybiBwcm9taXNlLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBjb25zdHJ1Y3Rvci5yZXNvbHZlKGNhbGxiYWNrKCkpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSk7XG4gICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIHJldHVybiBjb25zdHJ1Y3Rvci5yZXNvbHZlKGNhbGxiYWNrKCkpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHRocm93IHJlYXNvbjtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvbWlzZS50aGVuKGNhbGxiYWNrLCBjYWxsYmFjayk7XG4gIH07XG5cbiAgcmV0dXJuIFByb21pc2U7XG59KCk7XG5cblByb21pc2UkMS5wcm90b3R5cGUudGhlbiA9IHRoZW47XG5Qcm9taXNlJDEuYWxsID0gYWxsO1xuUHJvbWlzZSQxLnJhY2UgPSByYWNlO1xuUHJvbWlzZSQxLnJlc29sdmUgPSByZXNvbHZlJDE7XG5Qcm9taXNlJDEucmVqZWN0ID0gcmVqZWN0JDE7XG5Qcm9taXNlJDEuX3NldFNjaGVkdWxlciA9IHNldFNjaGVkdWxlcjtcblByb21pc2UkMS5fc2V0QXNhcCA9IHNldEFzYXA7XG5Qcm9taXNlJDEuX2FzYXAgPSBhc2FwO1xuXG4vKmdsb2JhbCBzZWxmKi9cbmZ1bmN0aW9uIHBvbHlmaWxsKCkge1xuICB2YXIgbG9jYWwgPSB2b2lkIDA7XG5cbiAgaWYgKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbG9jYWwgPSBnbG9iYWw7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbG9jYWwgPSBzZWxmO1xuICB9IGVsc2Uge1xuICAgIHRyeSB7XG4gICAgICBsb2NhbCA9IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdwb2x5ZmlsbCBmYWlsZWQgYmVjYXVzZSBnbG9iYWwgb2JqZWN0IGlzIHVuYXZhaWxhYmxlIGluIHRoaXMgZW52aXJvbm1lbnQnKTtcbiAgICB9XG4gIH1cblxuICB2YXIgUCA9IGxvY2FsLlByb21pc2U7XG5cbiAgaWYgKFApIHtcbiAgICB2YXIgcHJvbWlzZVRvU3RyaW5nID0gbnVsbDtcbiAgICB0cnkge1xuICAgICAgcHJvbWlzZVRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKFAucmVzb2x2ZSgpKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBzaWxlbnRseSBpZ25vcmVkXG4gICAgfVxuXG4gICAgaWYgKHByb21pc2VUb1N0cmluZyA9PT0gJ1tvYmplY3QgUHJvbWlzZV0nICYmICFQLmNhc3QpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICBsb2NhbC5Qcm9taXNlID0gUHJvbWlzZSQxO1xufVxuXG4vLyBTdHJhbmdlIGNvbXBhdC4uXG5Qcm9taXNlJDEucG9seWZpbGwgPSBwb2x5ZmlsbDtcblByb21pc2UkMS5Qcm9taXNlID0gUHJvbWlzZSQxO1xuXG5yZXR1cm4gUHJvbWlzZSQxO1xuXG59KSkpO1xuXG5cblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZXM2LXByb21pc2UubWFwXG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmlzTW9iaWxlID0gaXNNb2JpbGU7XG5leHBvcnRzLmRlZmF1bHQgPSBnZXRCcm93c2VyO1xuXG52YXIgX2dsb2JhbHMgPSByZXF1aXJlKFwiLi9nbG9iYWxzXCIpO1xuXG52YXIgX2lzQnJvd3NlciA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vaXMtYnJvd3NlclwiKSk7XG5cbnZhciBfaXNFbGVjdHJvbiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vaXMtZWxlY3Ryb25cIikpO1xuXG5mdW5jdGlvbiBpc01vYmlsZSgpIHtcbiAgcmV0dXJuIHR5cGVvZiBfZ2xvYmFscy53aW5kb3cub3JpZW50YXRpb24gIT09ICd1bmRlZmluZWQnO1xufVxuXG5mdW5jdGlvbiBnZXRCcm93c2VyKG1vY2tVc2VyQWdlbnQpIHtcbiAgaWYgKCFtb2NrVXNlckFnZW50ICYmICEoMCwgX2lzQnJvd3Nlci5kZWZhdWx0KSgpKSB7XG4gICAgcmV0dXJuICdOb2RlJztcbiAgfVxuXG4gIGlmICgoMCwgX2lzRWxlY3Ryb24uZGVmYXVsdCkobW9ja1VzZXJBZ2VudCkpIHtcbiAgICByZXR1cm4gJ0VsZWN0cm9uJztcbiAgfVxuXG4gIHZhciBuYXZpZ2F0b3JfID0gdHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgPyBuYXZpZ2F0b3IgOiB7fTtcbiAgdmFyIHVzZXJBZ2VudCA9IG1vY2tVc2VyQWdlbnQgfHwgbmF2aWdhdG9yXy51c2VyQWdlbnQgfHwgJyc7XG5cbiAgaWYgKHVzZXJBZ2VudC5pbmRleE9mKCdFZGdlJykgPiAtMSkge1xuICAgIHJldHVybiAnRWRnZSc7XG4gIH1cblxuICB2YXIgaXNNU0lFID0gdXNlckFnZW50LmluZGV4T2YoJ01TSUUgJykgIT09IC0xO1xuICB2YXIgaXNUcmlkZW50ID0gdXNlckFnZW50LmluZGV4T2YoJ1RyaWRlbnQvJykgIT09IC0xO1xuXG4gIGlmIChpc01TSUUgfHwgaXNUcmlkZW50KSB7XG4gICAgcmV0dXJuICdJRSc7XG4gIH1cblxuICBpZiAoX2dsb2JhbHMud2luZG93LmNocm9tZSkge1xuICAgIHJldHVybiAnQ2hyb21lJztcbiAgfVxuXG4gIGlmIChfZ2xvYmFscy53aW5kb3cuc2FmYXJpKSB7XG4gICAgcmV0dXJuICdTYWZhcmknO1xuICB9XG5cbiAgaWYgKF9nbG9iYWxzLndpbmRvdy5tb3pJbm5lclNjcmVlblgpIHtcbiAgICByZXR1cm4gJ0ZpcmVmb3gnO1xuICB9XG5cbiAgcmV0dXJuICdVbmtub3duJztcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWdldC1icm93c2VyLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuY29uc29sZSA9IGV4cG9ydHMucHJvY2VzcyA9IGV4cG9ydHMuZG9jdW1lbnQgPSBleHBvcnRzLmdsb2JhbCA9IGV4cG9ydHMud2luZG93ID0gZXhwb3J0cy5zZWxmID0gdm9pZCAwO1xuXG52YXIgX3R5cGVvZjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZlwiKSk7XG5cbnZhciBnbG9iYWxzID0ge1xuICBzZWxmOiB0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgJiYgc2VsZixcbiAgd2luZG93OiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3csXG4gIGdsb2JhbDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgJiYgZ2xvYmFsLFxuICBkb2N1bWVudDogdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyAmJiBkb2N1bWVudCxcbiAgcHJvY2VzczogKHR5cGVvZiBwcm9jZXNzID09PSBcInVuZGVmaW5lZFwiID8gXCJ1bmRlZmluZWRcIiA6ICgwLCBfdHlwZW9mMi5kZWZhdWx0KShwcm9jZXNzKSkgPT09ICdvYmplY3QnICYmIHByb2Nlc3Ncbn07XG52YXIgc2VsZl8gPSBnbG9iYWxzLnNlbGYgfHwgZ2xvYmFscy53aW5kb3cgfHwgZ2xvYmFscy5nbG9iYWw7XG5leHBvcnRzLnNlbGYgPSBzZWxmXztcbnZhciB3aW5kb3dfID0gZ2xvYmFscy53aW5kb3cgfHwgZ2xvYmFscy5zZWxmIHx8IGdsb2JhbHMuZ2xvYmFsO1xuZXhwb3J0cy53aW5kb3cgPSB3aW5kb3dfO1xudmFyIGdsb2JhbF8gPSBnbG9iYWxzLmdsb2JhbCB8fCBnbG9iYWxzLnNlbGYgfHwgZ2xvYmFscy53aW5kb3c7XG5leHBvcnRzLmdsb2JhbCA9IGdsb2JhbF87XG52YXIgZG9jdW1lbnRfID0gZ2xvYmFscy5kb2N1bWVudCB8fCB7fTtcbmV4cG9ydHMuZG9jdW1lbnQgPSBkb2N1bWVudF87XG52YXIgcHJvY2Vzc18gPSBnbG9iYWxzLnByb2Nlc3MgfHwge307XG5leHBvcnRzLnByb2Nlc3MgPSBwcm9jZXNzXztcbnZhciBjb25zb2xlXyA9IGNvbnNvbGU7XG5leHBvcnRzLmNvbnNvbGUgPSBjb25zb2xlXztcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWdsb2JhbHMuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG52YXIgX3R5cGVvZiA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZlwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcInNlbGZcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2dsb2JhbHMuc2VsZjtcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJ3aW5kb3dcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2dsb2JhbHMud2luZG93O1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImdsb2JhbFwiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfZ2xvYmFscy5nbG9iYWw7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiZG9jdW1lbnRcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2dsb2JhbHMuZG9jdW1lbnQ7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwicHJvY2Vzc1wiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfZ2xvYmFscy5wcm9jZXNzO1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImNvbnNvbGVcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2dsb2JhbHMuY29uc29sZTtcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJpc0Jyb3dzZXJcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2lzQnJvd3Nlci5kZWZhdWx0O1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImlzQnJvd3Nlck1haW5UaHJlYWRcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2lzQnJvd3Nlci5pc0Jyb3dzZXJNYWluVGhyZWFkO1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImdldEJyb3dzZXJcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2dldEJyb3dzZXIuZGVmYXVsdDtcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJpc01vYmlsZVwiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfZ2V0QnJvd3Nlci5pc01vYmlsZTtcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJpc0VsZWN0cm9uXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9pc0VsZWN0cm9uLmRlZmF1bHQ7XG4gIH1cbn0pO1xuXG52YXIgX2dsb2JhbHMgPSByZXF1aXJlKFwiLi9nbG9iYWxzXCIpO1xuXG52YXIgX2lzQnJvd3NlciA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKHJlcXVpcmUoXCIuL2lzLWJyb3dzZXJcIikpO1xuXG52YXIgX2dldEJyb3dzZXIgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChyZXF1aXJlKFwiLi9nZXQtYnJvd3NlclwiKSk7XG5cbnZhciBfaXNFbGVjdHJvbiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vaXMtZWxlY3Ryb25cIikpO1xuXG5mdW5jdGlvbiBfZ2V0UmVxdWlyZVdpbGRjYXJkQ2FjaGUobm9kZUludGVyb3ApIHsgaWYgKHR5cGVvZiBXZWFrTWFwICE9PSBcImZ1bmN0aW9uXCIpIHJldHVybiBudWxsOyB2YXIgY2FjaGVCYWJlbEludGVyb3AgPSBuZXcgV2Vha01hcCgpOyB2YXIgY2FjaGVOb2RlSW50ZXJvcCA9IG5ldyBXZWFrTWFwKCk7IHJldHVybiAoX2dldFJlcXVpcmVXaWxkY2FyZENhY2hlID0gZnVuY3Rpb24gX2dldFJlcXVpcmVXaWxkY2FyZENhY2hlKG5vZGVJbnRlcm9wKSB7IHJldHVybiBub2RlSW50ZXJvcCA/IGNhY2hlTm9kZUludGVyb3AgOiBjYWNoZUJhYmVsSW50ZXJvcDsgfSkobm9kZUludGVyb3ApOyB9XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKG9iaiwgbm9kZUludGVyb3ApIHsgaWYgKCFub2RlSW50ZXJvcCAmJiBvYmogJiYgb2JqLl9fZXNNb2R1bGUpIHsgcmV0dXJuIG9iajsgfSBpZiAob2JqID09PSBudWxsIHx8IF90eXBlb2Yob2JqKSAhPT0gXCJvYmplY3RcIiAmJiB0eXBlb2Ygb2JqICE9PSBcImZ1bmN0aW9uXCIpIHsgcmV0dXJuIHsgZGVmYXVsdDogb2JqIH07IH0gdmFyIGNhY2hlID0gX2dldFJlcXVpcmVXaWxkY2FyZENhY2hlKG5vZGVJbnRlcm9wKTsgaWYgKGNhY2hlICYmIGNhY2hlLmhhcyhvYmopKSB7IHJldHVybiBjYWNoZS5nZXQob2JqKTsgfSB2YXIgbmV3T2JqID0ge307IHZhciBoYXNQcm9wZXJ0eURlc2NyaXB0b3IgPSBPYmplY3QuZGVmaW5lUHJvcGVydHkgJiYgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjsgZm9yICh2YXIga2V5IGluIG9iaikgeyBpZiAoa2V5ICE9PSBcImRlZmF1bHRcIiAmJiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSB7IHZhciBkZXNjID0gaGFzUHJvcGVydHlEZXNjcmlwdG9yID8gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmosIGtleSkgOiBudWxsOyBpZiAoZGVzYyAmJiAoZGVzYy5nZXQgfHwgZGVzYy5zZXQpKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShuZXdPYmosIGtleSwgZGVzYyk7IH0gZWxzZSB7IG5ld09ialtrZXldID0gb2JqW2tleV07IH0gfSB9IG5ld09iai5kZWZhdWx0ID0gb2JqOyBpZiAoY2FjaGUpIHsgY2FjaGUuc2V0KG9iaiwgbmV3T2JqKTsgfSByZXR1cm4gbmV3T2JqOyB9XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBpc0Jyb3dzZXI7XG5leHBvcnRzLmlzQnJvd3Nlck1haW5UaHJlYWQgPSBpc0Jyb3dzZXJNYWluVGhyZWFkO1xuXG52YXIgX3R5cGVvZjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZlwiKSk7XG5cbnZhciBfaXNFbGVjdHJvbiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vaXMtZWxlY3Ryb25cIikpO1xuXG5mdW5jdGlvbiBpc0Jyb3dzZXIoKSB7XG4gIHZhciBpc05vZGUgPSAodHlwZW9mIHByb2Nlc3MgPT09IFwidW5kZWZpbmVkXCIgPyBcInVuZGVmaW5lZFwiIDogKDAsIF90eXBlb2YyLmRlZmF1bHQpKHByb2Nlc3MpKSA9PT0gJ29iamVjdCcgJiYgU3RyaW5nKHByb2Nlc3MpID09PSAnW29iamVjdCBwcm9jZXNzXScgJiYgIXByb2Nlc3MuYnJvd3NlcjtcbiAgcmV0dXJuICFpc05vZGUgfHwgKDAsIF9pc0VsZWN0cm9uLmRlZmF1bHQpKCk7XG59XG5cbmZ1bmN0aW9uIGlzQnJvd3Nlck1haW5UaHJlYWQoKSB7XG4gIHJldHVybiBpc0Jyb3dzZXIoKSAmJiB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aXMtYnJvd3Nlci5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBpc0VsZWN0cm9uO1xuXG52YXIgX3R5cGVvZjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZlwiKSk7XG5cbmZ1bmN0aW9uIGlzRWxlY3Ryb24obW9ja1VzZXJBZ2VudCkge1xuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgKDAsIF90eXBlb2YyLmRlZmF1bHQpKHdpbmRvdy5wcm9jZXNzKSA9PT0gJ29iamVjdCcgJiYgd2luZG93LnByb2Nlc3MudHlwZSA9PT0gJ3JlbmRlcmVyJykge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiAoMCwgX3R5cGVvZjIuZGVmYXVsdCkocHJvY2Vzcy52ZXJzaW9ucykgPT09ICdvYmplY3QnICYmIEJvb2xlYW4ocHJvY2Vzcy52ZXJzaW9ucy5lbGVjdHJvbikpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHZhciByZWFsVXNlckFnZW50ID0gKHR5cGVvZiBuYXZpZ2F0b3IgPT09IFwidW5kZWZpbmVkXCIgPyBcInVuZGVmaW5lZFwiIDogKDAsIF90eXBlb2YyLmRlZmF1bHQpKG5hdmlnYXRvcikpID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbmF2aWdhdG9yLnVzZXJBZ2VudCA9PT0gJ3N0cmluZycgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudDtcbiAgdmFyIHVzZXJBZ2VudCA9IG1vY2tVc2VyQWdlbnQgfHwgcmVhbFVzZXJBZ2VudDtcblxuICBpZiAodXNlckFnZW50ICYmIHVzZXJBZ2VudC5pbmRleE9mKCdFbGVjdHJvbicpID49IDApIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWlzLWVsZWN0cm9uLmpzLm1hcCIsImltcG9ydCB7IHdpbmRvdyB9IGZyb20gJy4vZ2xvYmFscyc7XG5pbXBvcnQgaXNCcm93c2VyIGZyb20gJy4vaXMtYnJvd3Nlcic7XG5pbXBvcnQgaXNFbGVjdHJvbiBmcm9tICcuL2lzLWVsZWN0cm9uJztcbmV4cG9ydCBmdW5jdGlvbiBpc01vYmlsZSgpIHtcbiAgcmV0dXJuIHR5cGVvZiB3aW5kb3cub3JpZW50YXRpb24gIT09ICd1bmRlZmluZWQnO1xufVxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0QnJvd3Nlcihtb2NrVXNlckFnZW50KSB7XG4gIGlmICghbW9ja1VzZXJBZ2VudCAmJiAhaXNCcm93c2VyKCkpIHtcbiAgICByZXR1cm4gJ05vZGUnO1xuICB9XG5cbiAgaWYgKGlzRWxlY3Ryb24obW9ja1VzZXJBZ2VudCkpIHtcbiAgICByZXR1cm4gJ0VsZWN0cm9uJztcbiAgfVxuXG4gIGNvbnN0IG5hdmlnYXRvcl8gPSB0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyA/IG5hdmlnYXRvciA6IHt9O1xuICBjb25zdCB1c2VyQWdlbnQgPSBtb2NrVXNlckFnZW50IHx8IG5hdmlnYXRvcl8udXNlckFnZW50IHx8ICcnO1xuXG4gIGlmICh1c2VyQWdlbnQuaW5kZXhPZignRWRnZScpID4gLTEpIHtcbiAgICByZXR1cm4gJ0VkZ2UnO1xuICB9XG5cbiAgY29uc3QgaXNNU0lFID0gdXNlckFnZW50LmluZGV4T2YoJ01TSUUgJykgIT09IC0xO1xuICBjb25zdCBpc1RyaWRlbnQgPSB1c2VyQWdlbnQuaW5kZXhPZignVHJpZGVudC8nKSAhPT0gLTE7XG5cbiAgaWYgKGlzTVNJRSB8fCBpc1RyaWRlbnQpIHtcbiAgICByZXR1cm4gJ0lFJztcbiAgfVxuXG4gIGlmICh3aW5kb3cuY2hyb21lKSB7XG4gICAgcmV0dXJuICdDaHJvbWUnO1xuICB9XG5cbiAgaWYgKHdpbmRvdy5zYWZhcmkpIHtcbiAgICByZXR1cm4gJ1NhZmFyaSc7XG4gIH1cblxuICBpZiAod2luZG93Lm1veklubmVyU2NyZWVuWCkge1xuICAgIHJldHVybiAnRmlyZWZveCc7XG4gIH1cblxuICByZXR1cm4gJ1Vua25vd24nO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Z2V0LWJyb3dzZXIuanMubWFwIiwiY29uc3QgZ2xvYmFscyA9IHtcbiAgc2VsZjogdHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnICYmIHNlbGYsXG4gIHdpbmRvdzogdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LFxuICBnbG9iYWw6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnICYmIGdsb2JhbCxcbiAgZG9jdW1lbnQ6IHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgZG9jdW1lbnQsXG4gIHByb2Nlc3M6IHR5cGVvZiBwcm9jZXNzID09PSAnb2JqZWN0JyAmJiBwcm9jZXNzXG59O1xuY29uc3Qgc2VsZl8gPSBnbG9iYWxzLnNlbGYgfHwgZ2xvYmFscy53aW5kb3cgfHwgZ2xvYmFscy5nbG9iYWw7XG5jb25zdCB3aW5kb3dfID0gZ2xvYmFscy53aW5kb3cgfHwgZ2xvYmFscy5zZWxmIHx8IGdsb2JhbHMuZ2xvYmFsO1xuY29uc3QgZ2xvYmFsXyA9IGdsb2JhbHMuZ2xvYmFsIHx8IGdsb2JhbHMuc2VsZiB8fCBnbG9iYWxzLndpbmRvdztcbmNvbnN0IGRvY3VtZW50XyA9IGdsb2JhbHMuZG9jdW1lbnQgfHwge307XG5jb25zdCBwcm9jZXNzXyA9IGdsb2JhbHMucHJvY2VzcyB8fCB7fTtcbmNvbnN0IGNvbnNvbGVfID0gY29uc29sZTtcbmV4cG9ydCB7IHNlbGZfIGFzIHNlbGYsIHdpbmRvd18gYXMgd2luZG93LCBnbG9iYWxfIGFzIGdsb2JhbCwgZG9jdW1lbnRfIGFzIGRvY3VtZW50LCBwcm9jZXNzXyBhcyBwcm9jZXNzLCBjb25zb2xlXyBhcyBjb25zb2xlIH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1nbG9iYWxzLmpzLm1hcCIsImltcG9ydCBpc0VsZWN0cm9uIGZyb20gJy4vaXMtZWxlY3Ryb24nO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaXNCcm93c2VyKCkge1xuICBjb25zdCBpc05vZGUgPSB0eXBlb2YgcHJvY2VzcyA9PT0gJ29iamVjdCcgJiYgU3RyaW5nKHByb2Nlc3MpID09PSAnW29iamVjdCBwcm9jZXNzXScgJiYgIXByb2Nlc3MuYnJvd3NlcjtcbiAgcmV0dXJuICFpc05vZGUgfHwgaXNFbGVjdHJvbigpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzQnJvd3Nlck1haW5UaHJlYWQoKSB7XG4gIHJldHVybiBpc0Jyb3dzZXIoKSAmJiB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aXMtYnJvd3Nlci5qcy5tYXAiLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBpc0VsZWN0cm9uKG1vY2tVc2VyQWdlbnQpIHtcbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiB3aW5kb3cucHJvY2VzcyA9PT0gJ29iamVjdCcgJiYgd2luZG93LnByb2Nlc3MudHlwZSA9PT0gJ3JlbmRlcmVyJykge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgcHJvY2Vzcy52ZXJzaW9ucyA9PT0gJ29iamVjdCcgJiYgQm9vbGVhbihwcm9jZXNzLnZlcnNpb25zLmVsZWN0cm9uKSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgY29uc3QgcmVhbFVzZXJBZ2VudCA9IHR5cGVvZiBuYXZpZ2F0b3IgPT09ICdvYmplY3QnICYmIHR5cGVvZiBuYXZpZ2F0b3IudXNlckFnZW50ID09PSAnc3RyaW5nJyAmJiBuYXZpZ2F0b3IudXNlckFnZW50O1xuICBjb25zdCB1c2VyQWdlbnQgPSBtb2NrVXNlckFnZW50IHx8IHJlYWxVc2VyQWdlbnQ7XG5cbiAgaWYgKHVzZXJBZ2VudCAmJiB1c2VyQWdlbnQuaW5kZXhPZignRWxlY3Ryb24nKSA+PSAwKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pcy1lbGVjdHJvbi5qcy5tYXAiLCJpbXBvcnQgeyBWRVJTSU9OLCBpc0Jyb3dzZXIgfSBmcm9tICcuLi91dGlscy9nbG9iYWxzJztcbmltcG9ydCBMb2NhbFN0b3JhZ2UgZnJvbSAnLi4vdXRpbHMvbG9jYWwtc3RvcmFnZSc7XG5pbXBvcnQgeyBmb3JtYXRJbWFnZSwgZm9ybWF0VGltZSwgbGVmdFBhZCB9IGZyb20gJy4uL3V0aWxzL2Zvcm1hdHRlcnMnO1xuaW1wb3J0IHsgYWRkQ29sb3IgfSBmcm9tICcuLi91dGlscy9jb2xvcic7XG5pbXBvcnQgeyBhdXRvYmluZCB9IGZyb20gJy4uL3V0aWxzL2F1dG9iaW5kJztcbmltcG9ydCBhc3NlcnQgZnJvbSAnLi4vdXRpbHMvYXNzZXJ0JztcbmltcG9ydCBnZXRIaVJlc1RpbWVzdGFtcCBmcm9tICcuLi91dGlscy9oaS1yZXMtdGltZXN0YW1wJztcbmNvbnN0IG9yaWdpbmFsQ29uc29sZSA9IHtcbiAgZGVidWc6IGlzQnJvd3NlciA/IGNvbnNvbGUuZGVidWcgfHwgY29uc29sZS5sb2cgOiBjb25zb2xlLmxvZyxcbiAgbG9nOiBjb25zb2xlLmxvZyxcbiAgaW5mbzogY29uc29sZS5pbmZvLFxuICB3YXJuOiBjb25zb2xlLndhcm4sXG4gIGVycm9yOiBjb25zb2xlLmVycm9yXG59O1xuY29uc3QgREVGQVVMVF9TRVRUSU5HUyA9IHtcbiAgZW5hYmxlZDogdHJ1ZSxcbiAgbGV2ZWw6IDBcbn07XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5jb25zdCBjYWNoZSA9IHt9O1xuY29uc3QgT05DRSA9IHtcbiAgb25jZTogdHJ1ZVxufTtcblxuZnVuY3Rpb24gZ2V0VGFibGVIZWFkZXIodGFibGUpIHtcbiAgZm9yIChjb25zdCBrZXkgaW4gdGFibGUpIHtcbiAgICBmb3IgKGNvbnN0IHRpdGxlIGluIHRhYmxlW2tleV0pIHtcbiAgICAgIHJldHVybiB0aXRsZSB8fCAndW50aXRsZWQnO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiAnZW1wdHknO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMb2cge1xuICBjb25zdHJ1Y3Rvcih7XG4gICAgaWRcbiAgfSA9IHtcbiAgICBpZDogJydcbiAgfSkge1xuICAgIHRoaXMuaWQgPSBpZDtcbiAgICB0aGlzLlZFUlNJT04gPSBWRVJTSU9OO1xuICAgIHRoaXMuX3N0YXJ0VHMgPSBnZXRIaVJlc1RpbWVzdGFtcCgpO1xuICAgIHRoaXMuX2RlbHRhVHMgPSBnZXRIaVJlc1RpbWVzdGFtcCgpO1xuICAgIHRoaXMuTE9HX1RIUk9UVExFX1RJTUVPVVQgPSAwO1xuICAgIHRoaXMuX3N0b3JhZ2UgPSBuZXcgTG9jYWxTdG9yYWdlKFwiX19wcm9iZS1cIi5jb25jYXQodGhpcy5pZCwgXCJfX1wiKSwgREVGQVVMVF9TRVRUSU5HUyk7XG4gICAgdGhpcy51c2VyRGF0YSA9IHt9O1xuICAgIHRoaXMudGltZVN0YW1wKFwiXCIuY29uY2F0KHRoaXMuaWQsIFwiIHN0YXJ0ZWRcIikpO1xuICAgIGF1dG9iaW5kKHRoaXMpO1xuICAgIE9iamVjdC5zZWFsKHRoaXMpO1xuICB9XG5cbiAgc2V0IGxldmVsKG5ld0xldmVsKSB7XG4gICAgdGhpcy5zZXRMZXZlbChuZXdMZXZlbCk7XG4gIH1cblxuICBnZXQgbGV2ZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TGV2ZWwoKTtcbiAgfVxuXG4gIGlzRW5hYmxlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fc3RvcmFnZS5jb25maWcuZW5hYmxlZDtcbiAgfVxuXG4gIGdldExldmVsKCkge1xuICAgIHJldHVybiB0aGlzLl9zdG9yYWdlLmNvbmZpZy5sZXZlbDtcbiAgfVxuXG4gIGdldFRvdGFsKCkge1xuICAgIHJldHVybiBOdW1iZXIoKGdldEhpUmVzVGltZXN0YW1wKCkgLSB0aGlzLl9zdGFydFRzKS50b1ByZWNpc2lvbigxMCkpO1xuICB9XG5cbiAgZ2V0RGVsdGEoKSB7XG4gICAgcmV0dXJuIE51bWJlcigoZ2V0SGlSZXNUaW1lc3RhbXAoKSAtIHRoaXMuX2RlbHRhVHMpLnRvUHJlY2lzaW9uKDEwKSk7XG4gIH1cblxuICBzZXQgcHJpb3JpdHkobmV3UHJpb3JpdHkpIHtcbiAgICB0aGlzLmxldmVsID0gbmV3UHJpb3JpdHk7XG4gIH1cblxuICBnZXQgcHJpb3JpdHkoKSB7XG4gICAgcmV0dXJuIHRoaXMubGV2ZWw7XG4gIH1cblxuICBnZXRQcmlvcml0eSgpIHtcbiAgICByZXR1cm4gdGhpcy5sZXZlbDtcbiAgfVxuXG4gIGVuYWJsZShlbmFibGVkID0gdHJ1ZSkge1xuICAgIHRoaXMuX3N0b3JhZ2UudXBkYXRlQ29uZmlndXJhdGlvbih7XG4gICAgICBlbmFibGVkXG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHNldExldmVsKGxldmVsKSB7XG4gICAgdGhpcy5fc3RvcmFnZS51cGRhdGVDb25maWd1cmF0aW9uKHtcbiAgICAgIGxldmVsXG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGFzc2VydChjb25kaXRpb24sIG1lc3NhZ2UpIHtcbiAgICBhc3NlcnQoY29uZGl0aW9uLCBtZXNzYWdlKTtcbiAgfVxuXG4gIHdhcm4obWVzc2FnZSkge1xuICAgIHJldHVybiB0aGlzLl9nZXRMb2dGdW5jdGlvbigwLCBtZXNzYWdlLCBvcmlnaW5hbENvbnNvbGUud2FybiwgYXJndW1lbnRzLCBPTkNFKTtcbiAgfVxuXG4gIGVycm9yKG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0TG9nRnVuY3Rpb24oMCwgbWVzc2FnZSwgb3JpZ2luYWxDb25zb2xlLmVycm9yLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgZGVwcmVjYXRlZChvbGRVc2FnZSwgbmV3VXNhZ2UpIHtcbiAgICByZXR1cm4gdGhpcy53YXJuKFwiYFwiLmNvbmNhdChvbGRVc2FnZSwgXCJgIGlzIGRlcHJlY2F0ZWQgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiBhIGxhdGVyIHZlcnNpb24uIFVzZSBgXCIpLmNvbmNhdChuZXdVc2FnZSwgXCJgIGluc3RlYWRcIikpO1xuICB9XG5cbiAgcmVtb3ZlZChvbGRVc2FnZSwgbmV3VXNhZ2UpIHtcbiAgICByZXR1cm4gdGhpcy5lcnJvcihcImBcIi5jb25jYXQob2xkVXNhZ2UsIFwiYCBoYXMgYmVlbiByZW1vdmVkLiBVc2UgYFwiKS5jb25jYXQobmV3VXNhZ2UsIFwiYCBpbnN0ZWFkXCIpKTtcbiAgfVxuXG4gIHByb2JlKGxvZ0xldmVsLCBtZXNzYWdlKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldExvZ0Z1bmN0aW9uKGxvZ0xldmVsLCBtZXNzYWdlLCBvcmlnaW5hbENvbnNvbGUubG9nLCBhcmd1bWVudHMsIHtcbiAgICAgIHRpbWU6IHRydWUsXG4gICAgICBvbmNlOiB0cnVlXG4gICAgfSk7XG4gIH1cblxuICBsb2cobG9nTGV2ZWwsIG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0TG9nRnVuY3Rpb24obG9nTGV2ZWwsIG1lc3NhZ2UsIG9yaWdpbmFsQ29uc29sZS5kZWJ1ZywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIGluZm8obG9nTGV2ZWwsIG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0TG9nRnVuY3Rpb24obG9nTGV2ZWwsIG1lc3NhZ2UsIGNvbnNvbGUuaW5mbywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIG9uY2UobG9nTGV2ZWwsIG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0TG9nRnVuY3Rpb24obG9nTGV2ZWwsIG1lc3NhZ2UsIG9yaWdpbmFsQ29uc29sZS5kZWJ1ZyB8fCBvcmlnaW5hbENvbnNvbGUuaW5mbywgYXJndW1lbnRzLCBPTkNFKTtcbiAgfVxuXG4gIHRhYmxlKGxvZ0xldmVsLCB0YWJsZSwgY29sdW1ucykge1xuICAgIGlmICh0YWJsZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2dldExvZ0Z1bmN0aW9uKGxvZ0xldmVsLCB0YWJsZSwgY29uc29sZS50YWJsZSB8fCBub29wLCBjb2x1bW5zICYmIFtjb2x1bW5zXSwge1xuICAgICAgICB0YWc6IGdldFRhYmxlSGVhZGVyKHRhYmxlKVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5vb3A7XG4gIH1cblxuICBpbWFnZSh7XG4gICAgbG9nTGV2ZWwsXG4gICAgcHJpb3JpdHksXG4gICAgaW1hZ2UsXG4gICAgbWVzc2FnZSA9ICcnLFxuICAgIHNjYWxlID0gMVxuICB9KSB7XG4gICAgaWYgKCF0aGlzLl9zaG91bGRMb2cobG9nTGV2ZWwgfHwgcHJpb3JpdHkpKSB7XG4gICAgICByZXR1cm4gbm9vcDtcbiAgICB9XG5cbiAgICByZXR1cm4gaXNCcm93c2VyID8gbG9nSW1hZ2VJbkJyb3dzZXIoe1xuICAgICAgaW1hZ2UsXG4gICAgICBtZXNzYWdlLFxuICAgICAgc2NhbGVcbiAgICB9KSA6IGxvZ0ltYWdlSW5Ob2RlKHtcbiAgICAgIGltYWdlLFxuICAgICAgbWVzc2FnZSxcbiAgICAgIHNjYWxlXG4gICAgfSk7XG4gIH1cblxuICBzZXR0aW5ncygpIHtcbiAgICBpZiAoY29uc29sZS50YWJsZSkge1xuICAgICAgY29uc29sZS50YWJsZSh0aGlzLl9zdG9yYWdlLmNvbmZpZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKHRoaXMuX3N0b3JhZ2UuY29uZmlnKTtcbiAgICB9XG4gIH1cblxuICBnZXQoc2V0dGluZykge1xuICAgIHJldHVybiB0aGlzLl9zdG9yYWdlLmNvbmZpZ1tzZXR0aW5nXTtcbiAgfVxuXG4gIHNldChzZXR0aW5nLCB2YWx1ZSkge1xuICAgIHRoaXMuX3N0b3JhZ2UudXBkYXRlQ29uZmlndXJhdGlvbih7XG4gICAgICBbc2V0dGluZ106IHZhbHVlXG4gICAgfSk7XG4gIH1cblxuICB0aW1lKGxvZ0xldmVsLCBtZXNzYWdlKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldExvZ0Z1bmN0aW9uKGxvZ0xldmVsLCBtZXNzYWdlLCBjb25zb2xlLnRpbWUgPyBjb25zb2xlLnRpbWUgOiBjb25zb2xlLmluZm8pO1xuICB9XG5cbiAgdGltZUVuZChsb2dMZXZlbCwgbWVzc2FnZSkge1xuICAgIHJldHVybiB0aGlzLl9nZXRMb2dGdW5jdGlvbihsb2dMZXZlbCwgbWVzc2FnZSwgY29uc29sZS50aW1lRW5kID8gY29uc29sZS50aW1lRW5kIDogY29uc29sZS5pbmZvKTtcbiAgfVxuXG4gIHRpbWVTdGFtcChsb2dMZXZlbCwgbWVzc2FnZSkge1xuICAgIHJldHVybiB0aGlzLl9nZXRMb2dGdW5jdGlvbihsb2dMZXZlbCwgbWVzc2FnZSwgY29uc29sZS50aW1lU3RhbXAgfHwgbm9vcCk7XG4gIH1cblxuICBncm91cChsb2dMZXZlbCwgbWVzc2FnZSwgb3B0cyA9IHtcbiAgICBjb2xsYXBzZWQ6IGZhbHNlXG4gIH0pIHtcbiAgICBvcHRzID0gbm9ybWFsaXplQXJndW1lbnRzKHtcbiAgICAgIGxvZ0xldmVsLFxuICAgICAgbWVzc2FnZSxcbiAgICAgIG9wdHNcbiAgICB9KTtcbiAgICBjb25zdCB7XG4gICAgICBjb2xsYXBzZWRcbiAgICB9ID0gb3B0cztcbiAgICBvcHRzLm1ldGhvZCA9IChjb2xsYXBzZWQgPyBjb25zb2xlLmdyb3VwQ29sbGFwc2VkIDogY29uc29sZS5ncm91cCkgfHwgY29uc29sZS5pbmZvO1xuICAgIHJldHVybiB0aGlzLl9nZXRMb2dGdW5jdGlvbihvcHRzKTtcbiAgfVxuXG4gIGdyb3VwQ29sbGFwc2VkKGxvZ0xldmVsLCBtZXNzYWdlLCBvcHRzID0ge30pIHtcbiAgICByZXR1cm4gdGhpcy5ncm91cChsb2dMZXZlbCwgbWVzc2FnZSwgT2JqZWN0LmFzc2lnbih7fSwgb3B0cywge1xuICAgICAgY29sbGFwc2VkOiB0cnVlXG4gICAgfSkpO1xuICB9XG5cbiAgZ3JvdXBFbmQobG9nTGV2ZWwpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0TG9nRnVuY3Rpb24obG9nTGV2ZWwsICcnLCBjb25zb2xlLmdyb3VwRW5kIHx8IG5vb3ApO1xuICB9XG5cbiAgd2l0aEdyb3VwKGxvZ0xldmVsLCBtZXNzYWdlLCBmdW5jKSB7XG4gICAgdGhpcy5ncm91cChsb2dMZXZlbCwgbWVzc2FnZSkoKTtcblxuICAgIHRyeSB7XG4gICAgICBmdW5jKCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuZ3JvdXBFbmQobG9nTGV2ZWwpKCk7XG4gICAgfVxuICB9XG5cbiAgdHJhY2UoKSB7XG4gICAgaWYgKGNvbnNvbGUudHJhY2UpIHtcbiAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICB9XG4gIH1cblxuICBfc2hvdWxkTG9nKGxvZ0xldmVsKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNFbmFibGVkKCkgJiYgdGhpcy5nZXRMZXZlbCgpID49IG5vcm1hbGl6ZUxvZ0xldmVsKGxvZ0xldmVsKTtcbiAgfVxuXG4gIF9nZXRMb2dGdW5jdGlvbihsb2dMZXZlbCwgbWVzc2FnZSwgbWV0aG9kLCBhcmdzID0gW10sIG9wdHMpIHtcbiAgICBpZiAodGhpcy5fc2hvdWxkTG9nKGxvZ0xldmVsKSkge1xuICAgICAgb3B0cyA9IG5vcm1hbGl6ZUFyZ3VtZW50cyh7XG4gICAgICAgIGxvZ0xldmVsLFxuICAgICAgICBtZXNzYWdlLFxuICAgICAgICBhcmdzLFxuICAgICAgICBvcHRzXG4gICAgICB9KTtcbiAgICAgIG1ldGhvZCA9IG1ldGhvZCB8fCBvcHRzLm1ldGhvZDtcbiAgICAgIGFzc2VydChtZXRob2QpO1xuICAgICAgb3B0cy50b3RhbCA9IHRoaXMuZ2V0VG90YWwoKTtcbiAgICAgIG9wdHMuZGVsdGEgPSB0aGlzLmdldERlbHRhKCk7XG4gICAgICB0aGlzLl9kZWx0YVRzID0gZ2V0SGlSZXNUaW1lc3RhbXAoKTtcbiAgICAgIGNvbnN0IHRhZyA9IG9wdHMudGFnIHx8IG9wdHMubWVzc2FnZTtcblxuICAgICAgaWYgKG9wdHMub25jZSkge1xuICAgICAgICBpZiAoIWNhY2hlW3RhZ10pIHtcbiAgICAgICAgICBjYWNoZVt0YWddID0gZ2V0SGlSZXNUaW1lc3RhbXAoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gbm9vcDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBtZXNzYWdlID0gZGVjb3JhdGVNZXNzYWdlKHRoaXMuaWQsIG9wdHMubWVzc2FnZSwgb3B0cyk7XG4gICAgICByZXR1cm4gbWV0aG9kLmJpbmQoY29uc29sZSwgbWVzc2FnZSwgLi4ub3B0cy5hcmdzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbm9vcDtcbiAgfVxuXG59XG5Mb2cuVkVSU0lPTiA9IFZFUlNJT047XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZUxvZ0xldmVsKGxvZ0xldmVsKSB7XG4gIGlmICghbG9nTGV2ZWwpIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIGxldCByZXNvbHZlZExldmVsO1xuXG4gIHN3aXRjaCAodHlwZW9mIGxvZ0xldmVsKSB7XG4gICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgIHJlc29sdmVkTGV2ZWwgPSBsb2dMZXZlbDtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgIHJlc29sdmVkTGV2ZWwgPSBsb2dMZXZlbC5sb2dMZXZlbCB8fCBsb2dMZXZlbC5wcmlvcml0eSB8fCAwO1xuICAgICAgYnJlYWs7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIDA7XG4gIH1cblxuICBhc3NlcnQoTnVtYmVyLmlzRmluaXRlKHJlc29sdmVkTGV2ZWwpICYmIHJlc29sdmVkTGV2ZWwgPj0gMCk7XG4gIHJldHVybiByZXNvbHZlZExldmVsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplQXJndW1lbnRzKG9wdHMpIHtcbiAgY29uc3Qge1xuICAgIGxvZ0xldmVsLFxuICAgIG1lc3NhZ2VcbiAgfSA9IG9wdHM7XG4gIG9wdHMubG9nTGV2ZWwgPSBub3JtYWxpemVMb2dMZXZlbChsb2dMZXZlbCk7XG4gIGNvbnN0IGFyZ3MgPSBvcHRzLmFyZ3MgPyBBcnJheS5mcm9tKG9wdHMuYXJncykgOiBbXTtcblxuICB3aGlsZSAoYXJncy5sZW5ndGggJiYgYXJncy5zaGlmdCgpICE9PSBtZXNzYWdlKSB7fVxuXG4gIG9wdHMuYXJncyA9IGFyZ3M7XG5cbiAgc3dpdGNoICh0eXBlb2YgbG9nTGV2ZWwpIHtcbiAgICBjYXNlICdzdHJpbmcnOlxuICAgIGNhc2UgJ2Z1bmN0aW9uJzpcbiAgICAgIGlmIChtZXNzYWdlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgYXJncy51bnNoaWZ0KG1lc3NhZ2UpO1xuICAgICAgfVxuXG4gICAgICBvcHRzLm1lc3NhZ2UgPSBsb2dMZXZlbDtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgIE9iamVjdC5hc3NpZ24ob3B0cywgbG9nTGV2ZWwpO1xuICAgICAgYnJlYWs7XG5cbiAgICBkZWZhdWx0OlxuICB9XG5cbiAgaWYgKHR5cGVvZiBvcHRzLm1lc3NhZ2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICBvcHRzLm1lc3NhZ2UgPSBvcHRzLm1lc3NhZ2UoKTtcbiAgfVxuXG4gIGNvbnN0IG1lc3NhZ2VUeXBlID0gdHlwZW9mIG9wdHMubWVzc2FnZTtcbiAgYXNzZXJ0KG1lc3NhZ2VUeXBlID09PSAnc3RyaW5nJyB8fCBtZXNzYWdlVHlwZSA9PT0gJ29iamVjdCcpO1xuICByZXR1cm4gT2JqZWN0LmFzc2lnbihvcHRzLCBvcHRzLm9wdHMpO1xufVxuXG5mdW5jdGlvbiBkZWNvcmF0ZU1lc3NhZ2UoaWQsIG1lc3NhZ2UsIG9wdHMpIHtcbiAgaWYgKHR5cGVvZiBtZXNzYWdlID09PSAnc3RyaW5nJykge1xuICAgIGNvbnN0IHRpbWUgPSBvcHRzLnRpbWUgPyBsZWZ0UGFkKGZvcm1hdFRpbWUob3B0cy50b3RhbCkpIDogJyc7XG4gICAgbWVzc2FnZSA9IG9wdHMudGltZSA/IFwiXCIuY29uY2F0KGlkLCBcIjogXCIpLmNvbmNhdCh0aW1lLCBcIiAgXCIpLmNvbmNhdChtZXNzYWdlKSA6IFwiXCIuY29uY2F0KGlkLCBcIjogXCIpLmNvbmNhdChtZXNzYWdlKTtcbiAgICBtZXNzYWdlID0gYWRkQ29sb3IobWVzc2FnZSwgb3B0cy5jb2xvciwgb3B0cy5iYWNrZ3JvdW5kKTtcbiAgfVxuXG4gIHJldHVybiBtZXNzYWdlO1xufVxuXG5mdW5jdGlvbiBsb2dJbWFnZUluTm9kZSh7XG4gIGltYWdlLFxuICBtZXNzYWdlID0gJycsXG4gIHNjYWxlID0gMVxufSkge1xuICBsZXQgYXNjaWlmeSA9IG51bGw7XG5cbiAgdHJ5IHtcbiAgICBhc2NpaWZ5ID0gbW9kdWxlLnJlcXVpcmUoJ2FzY2lpZnktaW1hZ2UnKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHt9XG5cbiAgaWYgKGFzY2lpZnkpIHtcbiAgICByZXR1cm4gKCkgPT4gYXNjaWlmeShpbWFnZSwge1xuICAgICAgZml0OiAnYm94JyxcbiAgICAgIHdpZHRoOiBcIlwiLmNvbmNhdChNYXRoLnJvdW5kKDgwICogc2NhbGUpLCBcIiVcIilcbiAgICB9KS50aGVuKGRhdGEgPT4gY29uc29sZS5sb2coZGF0YSkpO1xuICB9XG5cbiAgcmV0dXJuIG5vb3A7XG59XG5cbmZ1bmN0aW9uIGxvZ0ltYWdlSW5Ccm93c2VyKHtcbiAgaW1hZ2UsXG4gIG1lc3NhZ2UgPSAnJyxcbiAgc2NhbGUgPSAxXG59KSB7XG4gIGlmICh0eXBlb2YgaW1hZ2UgPT09ICdzdHJpbmcnKSB7XG4gICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XG5cbiAgICBpbWcub25sb2FkID0gKCkgPT4ge1xuICAgICAgY29uc3QgYXJncyA9IGZvcm1hdEltYWdlKGltZywgbWVzc2FnZSwgc2NhbGUpO1xuICAgICAgY29uc29sZS5sb2coLi4uYXJncyk7XG4gICAgfTtcblxuICAgIGltZy5zcmMgPSBpbWFnZTtcbiAgICByZXR1cm4gbm9vcDtcbiAgfVxuXG4gIGNvbnN0IGVsZW1lbnQgPSBpbWFnZS5ub2RlTmFtZSB8fCAnJztcblxuICBpZiAoZWxlbWVudC50b0xvd2VyQ2FzZSgpID09PSAnaW1nJykge1xuICAgIGNvbnNvbGUubG9nKC4uLmZvcm1hdEltYWdlKGltYWdlLCBtZXNzYWdlLCBzY2FsZSkpO1xuICAgIHJldHVybiBub29wO1xuICB9XG5cbiAgaWYgKGVsZW1lbnQudG9Mb3dlckNhc2UoKSA9PT0gJ2NhbnZhcycpIHtcbiAgICBjb25zdCBpbWcgPSBuZXcgSW1hZ2UoKTtcblxuICAgIGltZy5vbmxvYWQgPSAoKSA9PiBjb25zb2xlLmxvZyguLi5mb3JtYXRJbWFnZShpbWcsIG1lc3NhZ2UsIHNjYWxlKSk7XG5cbiAgICBpbWcuc3JjID0gaW1hZ2UudG9EYXRhVVJMKCk7XG4gICAgcmV0dXJuIG5vb3A7XG4gIH1cblxuICByZXR1cm4gbm9vcDtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWxvZy5qcy5tYXAiLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBhc3NlcnQoY29uZGl0aW9uLCBtZXNzYWdlKSB7XG4gIGlmICghY29uZGl0aW9uKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UgfHwgJ0Fzc2VydGlvbiBmYWlsZWQnKTtcbiAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXNzZXJ0LmpzLm1hcCIsImV4cG9ydCBmdW5jdGlvbiBhdXRvYmluZChvYmosIHByZWRlZmluZWQgPSBbJ2NvbnN0cnVjdG9yJ10pIHtcbiAgY29uc3QgcHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKTtcbiAgY29uc3QgcHJvcE5hbWVzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMocHJvdG8pO1xuXG4gIGZvciAoY29uc3Qga2V5IG9mIHByb3BOYW1lcykge1xuICAgIGlmICh0eXBlb2Ygb2JqW2tleV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGlmICghcHJlZGVmaW5lZC5maW5kKG5hbWUgPT4ga2V5ID09PSBuYW1lKSkge1xuICAgICAgICBvYmpba2V5XSA9IG9ialtrZXldLmJpbmQob2JqKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWF1dG9iaW5kLmpzLm1hcCIsImltcG9ydCB7IGlzQnJvd3NlciB9IGZyb20gJy4vZ2xvYmFscyc7XG5leHBvcnQgY29uc3QgQ09MT1IgPSB7XG4gIEJMQUNLOiAzMCxcbiAgUkVEOiAzMSxcbiAgR1JFRU46IDMyLFxuICBZRUxMT1c6IDMzLFxuICBCTFVFOiAzNCxcbiAgTUFHRU5UQTogMzUsXG4gIENZQU46IDM2LFxuICBXSElURTogMzcsXG4gIEJSSUdIVF9CTEFDSzogOTAsXG4gIEJSSUdIVF9SRUQ6IDkxLFxuICBCUklHSFRfR1JFRU46IDkyLFxuICBCUklHSFRfWUVMTE9XOiA5MyxcbiAgQlJJR0hUX0JMVUU6IDk0LFxuICBCUklHSFRfTUFHRU5UQTogOTUsXG4gIEJSSUdIVF9DWUFOOiA5NixcbiAgQlJJR0hUX1dISVRFOiA5N1xufTtcblxuZnVuY3Rpb24gZ2V0Q29sb3IoY29sb3IpIHtcbiAgcmV0dXJuIHR5cGVvZiBjb2xvciA9PT0gJ3N0cmluZycgPyBDT0xPUltjb2xvci50b1VwcGVyQ2FzZSgpXSB8fCBDT0xPUi5XSElURSA6IGNvbG9yO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYWRkQ29sb3Ioc3RyaW5nLCBjb2xvciwgYmFja2dyb3VuZCkge1xuICBpZiAoIWlzQnJvd3NlciAmJiB0eXBlb2Ygc3RyaW5nID09PSAnc3RyaW5nJykge1xuICAgIGlmIChjb2xvcikge1xuICAgICAgY29sb3IgPSBnZXRDb2xvcihjb2xvcik7XG4gICAgICBzdHJpbmcgPSBcIlxceDFCW1wiLmNvbmNhdChjb2xvciwgXCJtXCIpLmNvbmNhdChzdHJpbmcsIFwiXFx4MUJbMzltXCIpO1xuICAgIH1cblxuICAgIGlmIChiYWNrZ3JvdW5kKSB7XG4gICAgICBjb2xvciA9IGdldENvbG9yKGJhY2tncm91bmQpO1xuICAgICAgc3RyaW5nID0gXCJcXHgxQltcIi5jb25jYXQoYmFja2dyb3VuZCArIDEwLCBcIm1cIikuY29uY2F0KHN0cmluZywgXCJcXHgxQls0OW1cIik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHN0cmluZztcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvbG9yLmpzLm1hcCIsImV4cG9ydCBmdW5jdGlvbiBmb3JtYXRUaW1lKG1zKSB7XG4gIGxldCBmb3JtYXR0ZWQ7XG5cbiAgaWYgKG1zIDwgMTApIHtcbiAgICBmb3JtYXR0ZWQgPSBcIlwiLmNvbmNhdChtcy50b0ZpeGVkKDIpLCBcIm1zXCIpO1xuICB9IGVsc2UgaWYgKG1zIDwgMTAwKSB7XG4gICAgZm9ybWF0dGVkID0gXCJcIi5jb25jYXQobXMudG9GaXhlZCgxKSwgXCJtc1wiKTtcbiAgfSBlbHNlIGlmIChtcyA8IDEwMDApIHtcbiAgICBmb3JtYXR0ZWQgPSBcIlwiLmNvbmNhdChtcy50b0ZpeGVkKDApLCBcIm1zXCIpO1xuICB9IGVsc2Uge1xuICAgIGZvcm1hdHRlZCA9IFwiXCIuY29uY2F0KChtcyAvIDEwMDApLnRvRml4ZWQoMiksIFwic1wiKTtcbiAgfVxuXG4gIHJldHVybiBmb3JtYXR0ZWQ7XG59XG5leHBvcnQgZnVuY3Rpb24gbGVmdFBhZChzdHJpbmcsIGxlbmd0aCA9IDgpIHtcbiAgY29uc3QgcGFkTGVuZ3RoID0gTWF0aC5tYXgobGVuZ3RoIC0gc3RyaW5nLmxlbmd0aCwgMCk7XG4gIHJldHVybiBcIlwiLmNvbmNhdCgnICcucmVwZWF0KHBhZExlbmd0aCkpLmNvbmNhdChzdHJpbmcpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHJpZ2h0UGFkKHN0cmluZywgbGVuZ3RoID0gOCkge1xuICBjb25zdCBwYWRMZW5ndGggPSBNYXRoLm1heChsZW5ndGggLSBzdHJpbmcubGVuZ3RoLCAwKTtcbiAgcmV0dXJuIFwiXCIuY29uY2F0KHN0cmluZykuY29uY2F0KCcgJy5yZXBlYXQocGFkTGVuZ3RoKSk7XG59XG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0VmFsdWUodiwgb3B0cyA9IHt9KSB7XG4gIGNvbnN0IEVQU0lMT04gPSAxZS0xNjtcbiAgY29uc3Qge1xuICAgIGlzSW50ZWdlciA9IGZhbHNlXG4gIH0gPSBvcHRzO1xuXG4gIGlmIChBcnJheS5pc0FycmF5KHYpIHx8IEFycmF5QnVmZmVyLmlzVmlldyh2KSkge1xuICAgIHJldHVybiBmb3JtYXRBcnJheVZhbHVlKHYsIG9wdHMpO1xuICB9XG5cbiAgaWYgKCFOdW1iZXIuaXNGaW5pdGUodikpIHtcbiAgICByZXR1cm4gU3RyaW5nKHYpO1xuICB9XG5cbiAgaWYgKE1hdGguYWJzKHYpIDwgRVBTSUxPTikge1xuICAgIHJldHVybiBpc0ludGVnZXIgPyAnMCcgOiAnMC4nO1xuICB9XG5cbiAgaWYgKGlzSW50ZWdlcikge1xuICAgIHJldHVybiB2LnRvRml4ZWQoMCk7XG4gIH1cblxuICBpZiAoTWF0aC5hYnModikgPiAxMDAgJiYgTWF0aC5hYnModikgPCAxMDAwMCkge1xuICAgIHJldHVybiB2LnRvRml4ZWQoMCk7XG4gIH1cblxuICBjb25zdCBzdHJpbmcgPSB2LnRvUHJlY2lzaW9uKDIpO1xuICBjb25zdCBkZWNpbWFsID0gc3RyaW5nLmluZGV4T2YoJy4wJyk7XG4gIHJldHVybiBkZWNpbWFsID09PSBzdHJpbmcubGVuZ3RoIC0gMiA/IHN0cmluZy5zbGljZSgwLCAtMSkgOiBzdHJpbmc7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdEFycmF5VmFsdWUodiwgb3B0cykge1xuICBjb25zdCB7XG4gICAgbWF4RWx0cyA9IDE2LFxuICAgIHNpemUgPSAxXG4gIH0gPSBvcHRzO1xuICBsZXQgc3RyaW5nID0gJ1snO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdi5sZW5ndGggJiYgaSA8IG1heEVsdHM7ICsraSkge1xuICAgIGlmIChpID4gMCkge1xuICAgICAgc3RyaW5nICs9IFwiLFwiLmNvbmNhdChpICUgc2l6ZSA9PT0gMCA/ICcgJyA6ICcnKTtcbiAgICB9XG5cbiAgICBzdHJpbmcgKz0gZm9ybWF0VmFsdWUodltpXSwgb3B0cyk7XG4gIH1cblxuICBjb25zdCB0ZXJtaW5hdG9yID0gdi5sZW5ndGggPiBtYXhFbHRzID8gJy4uLicgOiAnXSc7XG4gIHJldHVybiBcIlwiLmNvbmNhdChzdHJpbmcpLmNvbmNhdCh0ZXJtaW5hdG9yKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdEltYWdlKGltYWdlLCBtZXNzYWdlLCBzY2FsZSwgbWF4V2lkdGggPSA2MDApIHtcbiAgY29uc3QgaW1hZ2VVcmwgPSBpbWFnZS5zcmMucmVwbGFjZSgvXFwoL2csICclMjgnKS5yZXBsYWNlKC9cXCkvZywgJyUyOScpO1xuXG4gIGlmIChpbWFnZS53aWR0aCA+IG1heFdpZHRoKSB7XG4gICAgc2NhbGUgPSBNYXRoLm1pbihzY2FsZSwgbWF4V2lkdGggLyBpbWFnZS53aWR0aCk7XG4gIH1cblxuICBjb25zdCB3aWR0aCA9IGltYWdlLndpZHRoICogc2NhbGU7XG4gIGNvbnN0IGhlaWdodCA9IGltYWdlLmhlaWdodCAqIHNjYWxlO1xuICBjb25zdCBzdHlsZSA9IFsnZm9udC1zaXplOjFweDsnLCBcInBhZGRpbmc6XCIuY29uY2F0KE1hdGguZmxvb3IoaGVpZ2h0IC8gMiksIFwicHggXCIpLmNvbmNhdChNYXRoLmZsb29yKHdpZHRoIC8gMiksIFwicHg7XCIpLCBcImxpbmUtaGVpZ2h0OlwiLmNvbmNhdChoZWlnaHQsIFwicHg7XCIpLCBcImJhY2tncm91bmQ6dXJsKFwiLmNvbmNhdChpbWFnZVVybCwgXCIpO1wiKSwgXCJiYWNrZ3JvdW5kLXNpemU6XCIuY29uY2F0KHdpZHRoLCBcInB4IFwiKS5jb25jYXQoaGVpZ2h0LCBcInB4O1wiKSwgJ2NvbG9yOnRyYW5zcGFyZW50OyddLmpvaW4oJycpO1xuICByZXR1cm4gW1wiXCIuY29uY2F0KG1lc3NhZ2UsIFwiICVjK1wiKSwgc3R5bGVdO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Zm9ybWF0dGVycy5qcy5tYXAiLCJpbXBvcnQgY2hlY2tJZkJyb3dzZXIgZnJvbSAnLi4vZW52L2lzLWJyb3dzZXInO1xuZXhwb3J0IHsgc2VsZiwgd2luZG93LCBnbG9iYWwsIGRvY3VtZW50LCBwcm9jZXNzLCBjb25zb2xlIH0gZnJvbSAnLi4vZW52L2dsb2JhbHMnO1xuZXhwb3J0IGNvbnN0IFZFUlNJT04gPSB0eXBlb2YgX19WRVJTSU9OX18gIT09ICd1bmRlZmluZWQnID8gX19WRVJTSU9OX18gOiAndW50cmFuc3BpbGVkIHNvdXJjZSc7XG5leHBvcnQgY29uc3QgaXNCcm93c2VyID0gY2hlY2tJZkJyb3dzZXIoKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWdsb2JhbHMuanMubWFwIiwiaW1wb3J0IHsgd2luZG93LCBwcm9jZXNzLCBpc0Jyb3dzZXIgfSBmcm9tICcuL2dsb2JhbHMnO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0SGlSZXNUaW1lc3RhbXAoKSB7XG4gIGxldCB0aW1lc3RhbXA7XG5cbiAgaWYgKGlzQnJvd3NlciAmJiB3aW5kb3cucGVyZm9ybWFuY2UpIHtcbiAgICB0aW1lc3RhbXAgPSB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCk7XG4gIH0gZWxzZSBpZiAocHJvY2Vzcy5ocnRpbWUpIHtcbiAgICBjb25zdCB0aW1lUGFydHMgPSBwcm9jZXNzLmhydGltZSgpO1xuICAgIHRpbWVzdGFtcCA9IHRpbWVQYXJ0c1swXSAqIDEwMDAgKyB0aW1lUGFydHNbMV0gLyAxZTY7XG4gIH0gZWxzZSB7XG4gICAgdGltZXN0YW1wID0gRGF0ZS5ub3coKTtcbiAgfVxuXG4gIHJldHVybiB0aW1lc3RhbXA7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1oaS1yZXMtdGltZXN0YW1wLmpzLm1hcCIsImZ1bmN0aW9uIGdldFN0b3JhZ2UodHlwZSkge1xuICB0cnkge1xuICAgIGNvbnN0IHN0b3JhZ2UgPSB3aW5kb3dbdHlwZV07XG4gICAgY29uc3QgeCA9ICdfX3N0b3JhZ2VfdGVzdF9fJztcbiAgICBzdG9yYWdlLnNldEl0ZW0oeCwgeCk7XG4gICAgc3RvcmFnZS5yZW1vdmVJdGVtKHgpO1xuICAgIHJldHVybiBzdG9yYWdlO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9jYWxTdG9yYWdlIHtcbiAgY29uc3RydWN0b3IoaWQsIGRlZmF1bHRTZXR0aW5ncywgdHlwZSA9ICdzZXNzaW9uU3RvcmFnZScpIHtcbiAgICB0aGlzLnN0b3JhZ2UgPSBnZXRTdG9yYWdlKHR5cGUpO1xuICAgIHRoaXMuaWQgPSBpZDtcbiAgICB0aGlzLmNvbmZpZyA9IHt9O1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5jb25maWcsIGRlZmF1bHRTZXR0aW5ncyk7XG5cbiAgICB0aGlzLl9sb2FkQ29uZmlndXJhdGlvbigpO1xuICB9XG5cbiAgZ2V0Q29uZmlndXJhdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5jb25maWc7XG4gIH1cblxuICBzZXRDb25maWd1cmF0aW9uKGNvbmZpZ3VyYXRpb24pIHtcbiAgICB0aGlzLmNvbmZpZyA9IHt9O1xuICAgIHJldHVybiB0aGlzLnVwZGF0ZUNvbmZpZ3VyYXRpb24oY29uZmlndXJhdGlvbik7XG4gIH1cblxuICB1cGRhdGVDb25maWd1cmF0aW9uKGNvbmZpZ3VyYXRpb24pIHtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMuY29uZmlnLCBjb25maWd1cmF0aW9uKTtcblxuICAgIGlmICh0aGlzLnN0b3JhZ2UpIHtcbiAgICAgIGNvbnN0IHNlcmlhbGl6ZWQgPSBKU09OLnN0cmluZ2lmeSh0aGlzLmNvbmZpZyk7XG4gICAgICB0aGlzLnN0b3JhZ2Uuc2V0SXRlbSh0aGlzLmlkLCBzZXJpYWxpemVkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIF9sb2FkQ29uZmlndXJhdGlvbigpIHtcbiAgICBsZXQgY29uZmlndXJhdGlvbiA9IHt9O1xuXG4gICAgaWYgKHRoaXMuc3RvcmFnZSkge1xuICAgICAgY29uc3Qgc2VyaWFsaXplZENvbmZpZ3VyYXRpb24gPSB0aGlzLnN0b3JhZ2UuZ2V0SXRlbSh0aGlzLmlkKTtcbiAgICAgIGNvbmZpZ3VyYXRpb24gPSBzZXJpYWxpemVkQ29uZmlndXJhdGlvbiA/IEpTT04ucGFyc2Uoc2VyaWFsaXplZENvbmZpZ3VyYXRpb24pIDoge307XG4gICAgfVxuXG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLmNvbmZpZywgY29uZmlndXJhdGlvbik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bG9jYWwtc3RvcmFnZS5qcy5tYXAiLCIvKiAoaWdub3JlZCkgKi8iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5nID0gKGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIGdsb2JhbFRoaXMgPT09ICdvYmplY3QnKSByZXR1cm4gZ2xvYmFsVGhpcztcblx0dHJ5IHtcblx0XHRyZXR1cm4gdGhpcyB8fCBuZXcgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JykgcmV0dXJuIHdpbmRvdztcblx0fVxufSkoKTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgQW5pbWF0aW9uTG9vcCwgTW9kZWwgfSBmcm9tICdAbHVtYS5nbC9lbmdpbmUnO1xuaW1wb3J0IHsgQnVmZmVyLCBjbGVhciwgVGV4dHVyZTJEIH0gZnJvbSAnQGx1bWEuZ2wvd2ViZ2wnO1xuY29uc3QgbG9vcCA9IG5ldyBBbmltYXRpb25Mb29wKHtcbiAgICAvL0B0cy1pZ25vcmVcbiAgICBvbkluaXRpYWxpemUoeyBnbCB9KSB7XG4gICAgICAgIGNvbnN0IHRleHR1cmUgPSBuZXcgVGV4dHVyZTJEKGdsLCB7XG4gICAgICAgICAgICBkYXRhOiAnZnVqaXJnYi5wbmcnLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgbW9kZWwgPSBuZXcgTW9kZWwoZ2wsIHtcbiAgICAgICAgICAgIHZzOiBgXG4gICAgICAgICAgICAgICAgYXR0cmlidXRlIHZlYzIgcG9zaXRpb247XG4gICAgICAgICAgICAgICAgdmFyeWluZyB2ZWMyIHV2O1xuICAgICAgICAgICAgICAgIHVuaWZvcm0gc2FtcGxlcjJEIHRleHR1cmU7XG5cbiAgICAgICAgICAgICAgICB2ZWMyIGdldHV2KHZlYzIgeHkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZlYzIoKHh5LnggKyAxLjApICogMC41LCAgMS4wIC0gMC41ICogKHh5LnkgKyAxLjApKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgICAgICAgICAgICAgIHV2ID0gZ2V0dXYocG9zaXRpb24pO1xuICAgICAgICAgICAgICAgICAgICBnbF9Qb3NpdGlvbiA9IHZlYzQocG9zaXRpb24ueHksIDAuMCwgMS4wKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBgLFxuICAgICAgICAgICAgZnM6IGBcbiAgICAgICAgICAgICAgICB1bmlmb3JtIHNhbXBsZXIyRCB0ZXh0dXJlO1xuICAgICAgICAgICAgICAgIHZhcnlpbmcgdmVjMiB1djtcblxuICAgICAgICAgICAgICAgIGZsb2F0IHJnYjJoZWlnaHQodmVjMyByZ2IpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC0xMDAwMC4wICsgKHJnYi5yICogNjU1My42ICsgcmdiLmcgKiAyNS42ICsgcmdiLmIgKiAwLjEpICogMjU1LjA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZmxvYXQgc2xvcGUoKSB7XG4gICAgICAgICAgICAgICAgICAgIGZsb2F0IGNhbnZhc19weF94ID0gMS4wIC8gMTAyNC4wO1xuICAgICAgICAgICAgICAgICAgICBmbG9hdCBjYW52YXNfcHhfeSA9IDEuMCAvIDEwMjQuMDtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vMTIzXG4gICAgICAgICAgICAgICAgICAgIC8vNDU2XG4gICAgICAgICAgICAgICAgICAgIC8vNzg5XG4gICAgICAgICAgICAgICAgICAgIC8vdmVjNCBwMSA9IHRleHR1cmUyRCh0ZXh0dXJlLCB1diArIHZlYzIoLWNhbnZhc19weF94LCAtY2FudmFzX3B4X3kpKTtcbiAgICAgICAgICAgICAgICAgICAgdmVjNCBwMiA9IHRleHR1cmUyRCh0ZXh0dXJlLCB1diArIHZlYzIoMCwgLWNhbnZhc19weF95KSk7XG4gICAgICAgICAgICAgICAgICAgIC8vdmVjNCBwMyA9IHRleHR1cmUyRCh0ZXh0dXJlLCB1diArIHZlYzIoY2FudmFzX3B4X3gsIC1jYW52YXNfcHhfeSkpO1xuICAgICAgICAgICAgICAgICAgICB2ZWM0IHA0ID0gdGV4dHVyZTJEKHRleHR1cmUsIHV2ICsgdmVjMigtY2FudmFzX3B4X3gsIDApKTtcbiAgICAgICAgICAgICAgICAgICAgLy92ZWM0IHA1ID0gdGV4dHVyZTJEKHRleHR1cmUsIHV2ICsgdmVjMigwLCAwKSk7XG4gICAgICAgICAgICAgICAgICAgIHZlYzQgcDYgPSB0ZXh0dXJlMkQodGV4dHVyZSwgdXYgKyB2ZWMyKGNhbnZhc19weF94LCAwKSk7XG4gICAgICAgICAgICAgICAgICAgIC8vdmVjNCBwNyA9IHRleHR1cmUyRCh0ZXh0dXJlLCB1diArIHZlYzIoLWNhbnZhc19weF94LCBjYW52YXNfcHhfeSkpO1xuICAgICAgICAgICAgICAgICAgICB2ZWM0IHA4ID0gdGV4dHVyZTJEKHRleHR1cmUsIHV2ICsgdmVjMigwLCBjYW52YXNfcHhfeSkpO1xuICAgICAgICAgICAgICAgICAgICAvL3ZlYzQgcDkgPSB0ZXh0dXJlMkQodGV4dHVyZSwgdXYgKyB2ZWMyKGNhbnZhc19weF94LCBjYW52YXNfcHhfeSkpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgZmxvYXQgaDIgPSByZ2IyaGVpZ2h0KHAyLnJnYik7XG4gICAgICAgICAgICAgICAgICAgIGZsb2F0IGg0ID0gcmdiMmhlaWdodChwNC5yZ2IpO1xuICAgICAgICAgICAgICAgICAgICBmbG9hdCBoNiA9IHJnYjJoZWlnaHQocDYucmdiKTtcbiAgICAgICAgICAgICAgICAgICAgZmxvYXQgaDggPSByZ2IyaGVpZ2h0KHA4LnJnYik7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBmbG9hdCBkaXN0UGVyUGl4ZWwgPSAzOC4wO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKChhYnMoaDYtaDQpICsgYWJzKGg4LWgyKSkgKiAwLjUpIC8gZGlzdFBlclBpeGVsO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZsb2F0IHNoYWRlKCkge1xuICAgICAgICAgICAgICAgICAgICBmbG9hdCBjYW52YXNfcHggPSAxLjAgLyAxMDI0LjA7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvLzEyMzQ1Njc4OVxuICAgICAgICAgICAgICAgICAgICB2ZWM0IHAxID0gdGV4dHVyZTJEKHRleHR1cmUsIHV2KTtcbiAgICAgICAgICAgICAgICAgICAgdmVjNCBwMiA9IHRleHR1cmUyRCh0ZXh0dXJlLCB1diArIHZlYzIoY2FudmFzX3B4ICogMS4wKSk7XG4gICAgICAgICAgICAgICAgICAgIHZlYzQgcDMgPSB0ZXh0dXJlMkQodGV4dHVyZSwgdXYgKyB2ZWMyKGNhbnZhc19weCAqIDIuMCkpO1xuICAgICAgICAgICAgICAgICAgICB2ZWM0IHA0ID0gdGV4dHVyZTJEKHRleHR1cmUsIHV2ICsgdmVjMihjYW52YXNfcHggKiAzLjApKTtcbiAgICAgICAgICAgICAgICAgICAgdmVjNCBwNSA9IHRleHR1cmUyRCh0ZXh0dXJlLCB1diArIHZlYzIoY2FudmFzX3B4ICogNC4wKSk7XG4gICAgICAgICAgICAgICAgICAgIHZlYzQgcDYgPSB0ZXh0dXJlMkQodGV4dHVyZSwgdXYgKyB2ZWMyKGNhbnZhc19weCAqIDUuMCkpO1xuICAgICAgICAgICAgICAgICAgICB2ZWM0IHA3ID0gdGV4dHVyZTJEKHRleHR1cmUsIHV2ICsgdmVjMihjYW52YXNfcHggKiA2LjApKTtcbiAgICAgICAgICAgICAgICAgICAgdmVjNCBwOCA9IHRleHR1cmUyRCh0ZXh0dXJlLCB1diArIHZlYzIoY2FudmFzX3B4ICogNy4wKSk7XG4gICAgICAgICAgICAgICAgICAgIHZlYzQgcDkgPSB0ZXh0dXJlMkQodGV4dHVyZSwgdXYgKyB2ZWMyKGNhbnZhc19weCAqIDguMCkpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgZmxvYXQgaDEgPSByZ2IyaGVpZ2h0KHAxLnJnYik7XG4gICAgICAgICAgICAgICAgICAgIGZsb2F0IGgyID0gcmdiMmhlaWdodChwMi5yZ2IpO1xuICAgICAgICAgICAgICAgICAgICBmbG9hdCBoMyA9IHJnYjJoZWlnaHQocDMucmdiKTtcbiAgICAgICAgICAgICAgICAgICAgZmxvYXQgaDQgPSByZ2IyaGVpZ2h0KHA0LnJnYik7XG4gICAgICAgICAgICAgICAgICAgIGZsb2F0IGg1ID0gcmdiMmhlaWdodChwNS5yZ2IpO1xuICAgICAgICAgICAgICAgICAgICBmbG9hdCBoNiA9IHJnYjJoZWlnaHQocDYucmdiKTtcbiAgICAgICAgICAgICAgICAgICAgZmxvYXQgaDcgPSByZ2IyaGVpZ2h0KHA3LnJnYik7XG4gICAgICAgICAgICAgICAgICAgIGZsb2F0IGg4ID0gcmdiMmhlaWdodChwOC5yZ2IpO1xuICAgICAgICAgICAgICAgICAgICBmbG9hdCBoOSA9IHJnYjJoZWlnaHQocDkucmdiKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGZsb2F0IGludGVuc2l0eSA9IDAuMDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGgxID4gaDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVuc2l0eSArPSAwLjEyNTtcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoaDEgPiBoMykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZW5zaXR5ICs9IDAuMTI1O1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChoMSA+IGg0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRlbnNpdHkgKz0gMC4xMjU7XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGgxID4gaDUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVuc2l0eSArPSAwLjEyNTtcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoaDEgPiBoNikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZW5zaXR5ICs9IDAuMTI1O1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChoMSA+IGg3KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRlbnNpdHkgKz0gMC4xMjU7XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGgxID4gaDgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVuc2l0eSArPSAwLjEyNTtcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoaDEgPiBoOSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZW5zaXR5ICs9IDAuMTI1O1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGludGVuc2l0eTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZlYzQgdGV4VmFsdWUgPSB0ZXh0dXJlMkQodGV4dHVyZSwgdXYpO1xuICAgICAgICAgICAgICAgICAgICBmbG9hdCBoZWlnaHQgPSByZ2IyaGVpZ2h0KHRleFZhbHVlLnJnYik7XG4gICAgICAgICAgICAgICAgICAgIGZsb2F0IHNsb3BlID0gc2xvcGUoKTtcbiAgICAgICAgICAgICAgICAgICAgZmxvYXQgc2hhZGUgPSBzaGFkZSgpO1xuICAgICAgICAgICAgICAgICAgICBnbF9GcmFnQ29sb3IgPSB2ZWM0KHZlYzMoMC40ICogaGVpZ2h0IC8gNDAwMC4wICsgc2xvcGUgKiAwLjMgKyBzaGFkZSAqIDAuMyksIDEuMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgYCxcbiAgICAgICAgICAgIHVuaWZvcm1zOiB7XG4gICAgICAgICAgICAgICAgdGV4dHVyZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb246IG5ldyBCdWZmZXIoZ2wsIG5ldyBGbG9hdDMyQXJyYXkoW1xuICAgICAgICAgICAgICAgICAgICAtMSwgLTEsIC0xLCAxLCAxLCAxLCAxLCAxLCAxLCAtMSwgLTEsIC0xLFxuICAgICAgICAgICAgICAgIF0pKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB2ZXJ0ZXhDb3VudDogNixcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB7IG1vZGVsLCB0ZXh0dXJlIH07XG4gICAgfSxcbiAgICAvL0B0cy1pZ25vcmVcbiAgICBvblJlbmRlcih7IGdsLCBtb2RlbCB9KSB7XG4gICAgICAgIGNsZWFyKGdsLCB7IGNvbG9yOiBbMCwgMCwgMCwgMV0gfSk7XG4gICAgICAgIG1vZGVsLmRyYXcoKTtcbiAgICB9LFxufSk7XG5sb29wLnN0YXJ0KHsgY2FudmFzOiAnY2FudmFzJyB9KTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==