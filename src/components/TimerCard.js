import { LitElement, html, css } from 'lit-element';
import { getTimerTime, timeToString, timeToStringSeconds } from '../utils.js';

class TimerCard extends LitElement {

  static get styles() {
    return css`
      :host {
        display: block;
        padding: 15px;
        border-radius: var(--border-radius-lvl1);
        background: var(--forground);
        height: 100px;
        transition: box-shadow .05s ease-out;
      }
      :host(:active) {
        box-shadow: 0px 1px 6px rgba(0, 0, 0, 0.1);
      }

      .card-wrapper {
        height: 100%;
        display: grid;
        grid-template-columns: 1fr auto;
        grid-template-rows: 1fr auto;
        grid-template-areas:
            "timer state"
            "title none";
      }

      .timer {
        grid-area: timer;
        font-size: 16px;
        font-weight: 500;
        color: var(--text-color);
      }

      .length {
        font-size: 40px;
      }

      .current {
        display: none; 
        font-weight: 500;
        font-size: 40px;
      }

      :host([state="running"]) .current {
        display: block;
      }

      :host([state="running"]) .length {
        font-size: 18px;
        font-weight: 100;
        color: var(--sub-text-color);
        margin-left: 2px;
      }

      .title {
        grid-area: title;
        color: var(--sub-text-color);
        max-width: 100%;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        font-size: 18px;
      }

      .state {
        grid-area: state;
      }

      svg {
        width: 24px;
        height: 24px;
        fill: var(--sub-text-color);
      }
    `;
  }

  get timer() {
    return this._timer;
  }

  set timer(val) {
    this._timer = val;

    if(this._timer.state == 0 && this._timer.duration == 0) {
      this.setAttribute('state', 'stopped');
    } else if(this._timer.state == 1) {
      this.setAttribute('state', 'running');
    }

    this.update();
  }

  constructor() {
    super();

    this._timer = null;

    window.addEventListener('tick', e => {
      this.update();
    });
  }

  render() {
    const timer = this.timer;
    const time = getTimerTime(timer);

    return html`
      <div class="card-wrapper">
        <div class="timer">
          <div class="length">${timeToString(timer.length)}</div>
          <div class="current">${timeToString(time)}</div>
        </div>
        <div class="title">${timer.title}</div>
        <div class="state">
          ${timer.state === 0 ? 
            html`<svg xmlns="http://www.w3.org/2000/svg" width="55" height="66" viewBox="0 0 55 66"><g transform="translate(-0.056 -0.219)"><rect width="20" height="66" transform="translate(0.056 0.219)"/><rect width="20" height="66" transform="translate(35.056 0.219)"/></g></svg>` : 
            html`<svg xmlns="http://www.w3.org/2000/svg" width="50" height="60" viewBox="0 0 50 60"><g transform="translate(-692.714 -1280.057)"><path d="M0,0,50,30h0L0,60Z" transform="translate(692.714 1280.057)"/></g></svg>`}          
        </div>
      </div>
    `;
  }
}

customElements.define('app-timer-card', TimerCard);
