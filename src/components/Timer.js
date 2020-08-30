import { html, css } from 'lit-element';
import State from '../State.js';
import { getTimerTime, timeToString } from '../utils.js';
import BaseElement from './BaseElement.js';

class Timer extends BaseElement {

  static get styles() {
    return css`
      ${super.styles}
      input {
        border: none;
        height: auto;
        width: 90px;
        margin: 0;
        padding: 0;
        outline: none;
      }
      :host {
        padding: 15px;
        padding-bottom: 80px;
      }
      .header {
        display: grid;
        grid-template-columns: auto 1fr auto;
        justify-items: center;
        align-items: center;
      }
      .controls {
        display: flex;
        justify-content: center;
      }
      button.big {
        border-radius: 100%;
        background: var(--text-color);
        color: var(--background);
        width: 85px;
        height: 85px;
        margin: 0 10px;
        transition: box-shadow .15s ease-out;
      }
      button.big:active {
        box-shadow: 0px 1px 12px rgba(0, 0, 0, 0.5);
      }
      .timer {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin: 40px 20px;
      }
      .timer .time {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 75px;
        font-weight: 500;
      }
      .timer input {
        color: var(--text-color);
        background: none;
        font-family: var(--global-font-family);
        font-size: inherit;
        font-weight: inherit;
      }
      .timer .time span.dots {

      }
      .timer .title {
        font-size: 18px;
        font-weight: 500;
        color: var(--sub-text-color);
        width: 100%;
        padding: 5px 0;
        text-align: center;
      }
      .timer .time .dots {
        margin: -12px 2px 0px;
      }
      .timer .time .edit-field {
        padding: 0 5px;
      }
      .edit-field br {
        display: none;
      }
      .edit-field:not(:disabled):focus {
        outline: none;
        border-radius: var(--border-radius-lvl2);
        background: var(--forground);
        box-shadow: 0px 1px 6px rgba(0, 0, 0, 0.1);
      }
    `;
  }

  constructor() {
    super();

    this.timer = null;
    this.editing = false;
    
    window.addEventListener('statechange', async e => {
      const state = await State.getState();
      if(state.currentTimer) {
        this.timer = await State.getTimerById(state.currentTimer);
        this.update();
      }
    });

    window.addEventListener('tick', e => {
      if(!this.editing) {
        this.update();
      }
    });

    this.addEventListener('blur', e => {
      this.saveTimer();
    });
  }
    
  deleteTimer() {
    State.deleteTimer(this.timer.id);
  }

  editTimer() {
    this.editing = true;
    this.update();
    const eles = this.shadowRoot.querySelectorAll('.edit-field');
    eles[0].focus();
  }

  saveTimer() {
    this.editing = false;
    this.update();
  }

  playPauseTimer(timer) {
    if(timer.state == 0) {  
      State.startTimer(timer.id);
    } else if(timer.state == 1) {
      State.stopTimer(timer.id);
    }
  }

  resetTimer(timer) {
   State.resetTimer(timer.id); 
  }

  updateTimer(timer, update) {
    const title = update.title || timer.title;
    const newSecs = update.seconds || Math.floor(timer.length / 1000) % 60;
    const newMins = update.minutes || Math.floor(timer.length / 60 / 1000) % 60;
    const newHours = update.hours || Math.floor(timer.length / 60 / 60 / 1000);

    State.updateTimer(timer.id, {
      title: title,
      length: (
        (newSecs * 1000) +
        (newMins * 60 * 1000) +
        (newHours * 60 * 60 * 1000)
      )
    });
  }

  render() {
    const timer = this.timer;

    if(!timer) {
      return html`
        <div class="header">
          <div class="header-left">
            <button></button>
          </div>
          <div></div>
          <div class="header-left">
            <button></button>
          </div>
        </div>
        <div class="timer"></div>
        <div class="controls"></div>
      `;
    }

    let time = timer.length;

    if(!this.editing) {
      time = getTimerTime(timer);
    }

    const secs = Math.floor(time / 1000) % 60;
    const mins = Math.floor(time / 60 / 1000) % 60;
    const hours = Math.floor(time / 60 / 60 / 1000);

    return html`
      <div class="header">
        <div class="header-left">
          <button @click="${e => this.deleteTimer()}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
          </button>
        </div>
        <div></div>
        <div class="header-left">
          <button @click="${e => this.editTimer()}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
          </button>
        </div>
      </div>
      <div class="timer">
        <div class="time">
          <input class="edit-field" 
            type="number"
            maxlength="2"
            ?disabled="${!this.editing}"
            @input="${e => this.updateTimer(timer, { hours: +e.target.value })}"
            .value="${hours.toString().padStart(2, "0")}"/>
          <span class="dots">:</span>
          <input class="edit-field" 
            type="number"
            maxlength="2"
            ?disabled="${!this.editing}"
            @input="${e => this.updateTimer(timer, { minutes: +e.target.value })}"
            .value="${mins.toString().padStart(2, "0")}"/>
          <span class="dots">:</span>
          <input class="edit-field" 
            type="number"
            maxlength="2"
            ?disabled="${!this.editing}"
            @input="${e => this.updateTimer(timer, { seconds: +e.target.value })}"
            .value="${secs.toString().padStart(2, "0")}"/>
        </div>
        <input class="title edit-field" 
          ?disabled="${!this.editing}"
          @input="${e => this.updateTimer(timer, { title: e.target.value })}"
          .value="${timer.title}"/>
        </div>
      </div>
      <div class="controls">
        <button class="big" @click="${e => this.resetTimer(timer)}">
          <svg xmlns="http://www.w3.org/2000/svg" width="89.869" height="80.958" viewBox="0 0 89.869 80.958"><g transform="translate(-0.459 7.5)"><path d="M33,65.958c20.531,0,33.369-18.831,33.369-33.368S53.115,0,33,0A32.591,32.591,0,0,0,0,32.589" transform="translate(16.457)" fill="none" stroke="#fff" stroke-width="15"/><path d="M16,0,32,23H0Z" transform="translate(32.459 54.735) rotate(180)" fill="#fff"/></g></svg>
        </button>
        <button class="big" @click="${e => this.playPauseTimer(timer)}">
          ${timer.state === 1 ? 
            html`<svg xmlns="http://www.w3.org/2000/svg" style="fill:#fff" width="55" height="66" viewBox="0 0 55 66"><g transform="translate(-0.056 -0.219)"><rect width="20" height="66" transform="translate(0.056 0.219)"/><rect width="20" height="66" transform="translate(35.056 0.219)"/></g></svg>` : 
            html`<svg xmlns="http://www.w3.org/2000/svg" style="fill:#fff" width="50" height="60" viewBox="0 0 50 60"><g transform="translate(-692.714 -1280.057)"><path d="M0,0,50,30h0L0,60Z" transform="translate(692.714 1280.057)"/></g></svg>`}          
        </button>
      </div>
    `;
  }
}

customElements.define('app-timer', Timer);
