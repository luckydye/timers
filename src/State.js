import { getArrayDiff, getTimerTime, uuidv4 } from "./utils.js";

class DB {

  onready() { }

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
      const objectStore = db.createObjectStore(this.storeName, { keyPath: "id" });

      const scheme = {
          length: "length", // ms
          title: "title",
          timestamp: "timestamp",
          state: "state",
          duration: "duration"
      }

      objectStore.createIndex("id", "id", { unique: true });
      for(let key in scheme) {
        objectStore.createIndex(key, scheme[key], { unique: false });
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

  startTransation(callback = () => { }) {
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
    })
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
    })
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

      for(let timer of this.state.timers) {
        const requestUpdate = objectStore.put(timer);
        requestUpdate.onerror = event => {
          console.error(event.target.error);
        };
        requestUpdate.onsuccess = event => {};
      }
    })
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
      const diff = getArrayDiff(stateObject.timers, dbTimers);
      const deletedTimers = diff[0];
      const addedTimers = diff[1];

      for (let timer of deletedTimers) {
        db.deleteTimer(timer.id);
      }
      for (let timer of addedTimers) {
        db.addTimer(timer);
      }
    })
  });
  db.getTimers().then(timers => {
    stateObject.timers = timers;
    State.setState(stateObject);
  });
}

class TimerEvent extends Event {
  constructor(timer) {
    super('timer.finished');
    this.timer = timer;
  }
}

setInterval(async () => {
  const state = await State.getState();

  for (let timer of state.timers) {
    const time = getTimerTime(timer);

    if (time <= 0 && timer.state == 1) {
      timer.state = 0;
      State.setState(stateObject);
      const evnt = new TimerEvent(timer);
      globalThis.dispatchEvent(evnt);
    }
  }

  globalThis.dispatchEvent(new Event('tick'));
}, 1000);

export default class State {

  static setState(state) {
    if(globalThis.parent == globalThis.parent) {
      db.saveTimers();
    }
    globalThis.dispatchEvent(new Event('statechange'));
  }

  static async getState() {
    const state = Object.assign(stateObject, { timers: await db.getTimers() });
    return state;
  }

  static async createTimer(options = {
    length: 1000 * 60, // ms
    title: "Timer",
    timestamp: 0,
    state: 0,
    duration: 0,
  }) {
    const state = await this.getState();
    options.id = uuidv4();
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
