import { uuidv4 } from "./utils.js";

const stateObject = {
    currentTimer: null,
    timers: []
};

setInterval(async () => {
    const state = await State.getState();

    for(let timer of state.timers) {
        const time = timer.length - ((Date.now() - timer.timestamp) + timer.duration);

        if(time <= 0) {
            timer.state = 0;
            
        }
    }

    window.dispatchEvent(new Event('tick'));
}, 1000);

export default class State {

    static setState(state) {
        window.dispatchEvent(new Event('statechange'));
    }

    static async getState() {
        return stateObject;
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
        console.log(timer);
        this.setState(await this.getState());
    }

    static async stopTimer(timerId) {
        const timer = await this.getTimerById(timerId);
        timer.duration = Date.now() - timer.timestamp;
        timer.state = 0;
        this.setState(await this.getState());
    }

    static async resetTimer(timerId) {
        const timer = await this.getTimerById(timerId);
        timer.duration = 0;
        timer.timestamp = Date.now();
        this.setState(await this.getState());
    }

    static async getTimerById(id) {
        const state = await this.getState();
        return state.timers.find(timer => {
            return timer.id == id;
        });
    }

}
