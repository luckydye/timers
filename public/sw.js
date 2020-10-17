// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"utils.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.timeToString = timeToString;
exports.uuidv4 = uuidv4;
exports.getTimerTime = getTimerTime;
exports.getArrayDiff = getArrayDiff;

function timeToString(ms) {
  const secs = Math.floor(ms / 1000) % 60;
  const min = Math.floor(ms / 60 / 1000) % 60;
  const h = Math.floor(ms / 60 / 60 / 1000);
  return `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
}

function getTimerTime(timer) {
  let time = timer.length;

  if (timer.state === 1) {
    time = timer.length - (Date.now() - timer.timestamp + timer.duration);
  }

  if (timer.state === 0 && timer.duration > 0) {
    time = timer.length - timer.duration;
  }

  time = Math.max(time, 0);
  return time;
}

function getArrayDiff(oldArray, newArray) {
  const deletedTimers = [];
  const addedTimers = [];

  for (let timer of oldArray) {
    const lokalTimer = newArray.find(t => t.id === timer.id);

    if (!lokalTimer) {
      addedTimers.push(timer);
    }
  }

  for (let timer of newArray) {
    const stateTimer = oldArray.find(t => t.id === timer.id);

    if (!stateTimer) {
      deletedTimers.push(timer);
    }
  }

  return [deletedTimers, addedTimers];
}
},{}],"State.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _utils = require("./utils.js");

class DB {
  onready() {}

  constructor(stateObject) {
    this.state = stateObject;
    this.dbName = "Timers";
    this.storeName = "timers";
    this.version = 1;
    this.db = null;
    this.initDatabase();
  }

  initDatabase() {
    const request = globalThis.indexedDB.open(this.dbName, this.version);

    request.onerror = event => {
      console.error("Database error:", event.target.error.name + ':', event.target.error.message);
    };

    request.onupgradeneeded = event => {
      const db = event.target.result;
      const objectStore = db.createObjectStore(this.storeName, {
        keyPath: "id"
      });
      const scheme = {
        length: "length",
        // ms
        title: "title",
        timestamp: "timestamp",
        state: "state",
        duration: "duration"
      };
      objectStore.createIndex("id", "id", {
        unique: true
      });

      for (let key in scheme) {
        objectStore.createIndex(key, scheme[key], {
          unique: false
        });
      }

      objectStore.transaction.oncomplete = event => {
        const bjectStore = db.transaction(this.storeName, "readwrite").objectStore(this.storeName);
        this.state.timers.forEach(timer => {
          bjectStore.add(timer);
        });
      };
    };

    request.onsuccess = event => {
      this.db = event.target.result;

      db.onerror = event => {
        console.error("Database error: " + event.target.errorCode);
      };

      this.onready();
    };
  }

  startTransation(callback = () => {}) {
    const transaction = this.db.transaction([this.storeName], "readwrite");

    transaction.oncomplete = event => {
      callback();
    };

    transaction.onerror = event => {
      callback(event);
    };

    return transaction;
  }

  async getTimers() {
    return new Promise((resolve, reject) => {
      const transaction = this.startTransation();
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.getAll();

      request.onerror = event => {
        reject(event);
      };

      request.onsuccess = event => {
        resolve(request.result);
      };
    });
  }

  async deleteTimer(id, callback) {
    return new Promise((resolve, reject) => {
      const request = this.startTransation().objectStore(this.storeName).delete(id);

      request.onsuccess = event => {
        resolve();
      };

      request.onerror = event => {
        reject(event);
      };
    });
  }

  addTimer(timer) {
    const transaction = this.startTransation();
    const objectStore = transaction.objectStore(this.storeName);
    objectStore.add(timer);
  }

  async saveTimers() {
    return new Promise(async (resolve, reject) => {
      const transaction = this.startTransation();
      const objectStore = transaction.objectStore(this.storeName);

      for (let timer of this.state.timers) {
        const requestUpdate = objectStore.put(timer);

        requestUpdate.onerror = event => {
          console.error(event.target.error);
        };

        requestUpdate.onsuccess = event => {};
      }
    });
  }

}

const stateObject = {
  currentTimer: null,
  timers: []
};
const db = new DB(stateObject);

db.onready = () => {
  globalThis.addEventListener('statechange', e => {
    db.getTimers().then(dbTimers => {
      const diff = (0, _utils.getArrayDiff)(stateObject.timers, dbTimers);
      const deletedTimers = diff[0];
      const addedTimers = diff[1];

      for (let timer of deletedTimers) {
        db.deleteTimer(timer.id);
      }

      for (let timer of addedTimers) {
        db.addTimer(timer);
      }
    });
  });
  db.getTimers().then(timers => {
    stateObject.timers = timers;
    State.setState(stateObject);
  });
};

class TimerEvent extends Event {
  constructor(timer) {
    super('timer.finished');
    this.timer = timer;
  }

}

setInterval(async () => {
  const state = await State.getState();

  for (let timer of state.timers) {
    const time = (0, _utils.getTimerTime)(timer);

    if (time <= 0 && timer.state == 1) {
      timer.state = 0;
      State.setState(stateObject);
      const evnt = new TimerEvent(timer);
      globalThis.dispatchEvent(evnt);
    }
  }

  globalThis.dispatchEvent(new Event('tick'));
}, 1000);

class State {
  static setState(state) {
    if (globalThis.parent == globalThis.parent) {
      db.saveTimers();
    }

    globalThis.dispatchEvent(new Event('statechange'));
  }

  static async getState() {
    const state = Object.assign(stateObject, {
      timers: await db.getTimers()
    });
    return state;
  }

  static async createTimer(options = {
    length: 1000 * 60,
    // ms
    title: "Timer",
    timestamp: 0,
    state: 0,
    duration: 0
  }) {
    const state = await this.getState();
    options.id = (0, _utils.uuidv4)();
    state.timers.push(options);
    this.setState(state);
  }

  static async updateTimer(timerId, options) {
    const state = await this.getState();
    const timer = await this.getTimerById(timerId);
    const index = state.timers.indexOf(timer);
    state.timers[index] = Object.assign(timer, options);
    this.setState(state);
  }

  static async deleteTimer(timerId) {
    const timer = await this.getTimerById(timerId);
    const state = await this.getState();
    state.timers.splice(state.timers.indexOf(timer), 1);
    this.setState(state);
  }

  static async startTimer(timerId) {
    const timer = await this.getTimerById(timerId);
    timer.timestamp = Date.now();
    timer.state = 1;
    this.setState(stateObject);
  }

  static async stopTimer(timerId) {
    const timer = await this.getTimerById(timerId);
    timer.duration = Date.now() - timer.timestamp;
    timer.state = 0;
    this.setState(stateObject);
  }

  static async resetTimer(timerId) {
    const timer = await this.getTimerById(timerId);
    timer.duration = 0;
    timer.timestamp = Date.now();
    this.setState(stateObject);
  }

  static async getTimerById(id) {
    const state = await this.getState();
    return state.timers.find(timer => {
      return timer.id == id;
    });
  }

}

exports.default = State;
},{"./utils.js":"utils.js"}],"sw.js":[function(require,module,exports) {
"use strict";

var _State = _interopRequireDefault(require("./State.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

self.addEventListener('install', e => {
  e.waitUntil(caches.open('timers-cache').then(cache => cache.addAll(['./', './index.html', './main.css', './main.js'])));
});
self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
});
self.addEventListener('activate', event => {
  globalThis.addEventListener('timer.finished', event => {
    console.log(event);
    sendTimerNotification(event.timer);
  });
});

function sendTimerNotification(timer) {
  self.registration.showNotification("Timers", {
    body: `Timer "${timer.title}" is done.`,
    vibrate: true,
    requireInteraction: true,
    actions: [{
      action: 'stop',
      title: 'Stop'
    }]
  });
  self.addEventListener('notificationclick', event => {
    event.notification.close();
  }, false);
}
},{"./State.js":"State.js"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "56945" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","sw.js"], null)
//# sourceMappingURL=sw.js.map