import { LitElement, html, css } from 'lit-element';
import State from '../State.js';

class TimerList extends LitElement {

  static get styles() {
    return css`
      :host {
        display: block;
        box-sizing: border-box;
        height: 100%;
        overflow: overlay;
        padding: 85px 15px 0px;
        overscroll-behavior-y: contain;
      }
      .timer-list {
        display: grid;
        grid-gap: 10px;
      }
      app-timer-card {
        flex: none;
      }
    `;
  }

  constructor() {
    super();

    this.timers = [];

    window.addEventListener('statechange', async e => {
      const state = await State.getState();

      const deletedTimers = [];
      const addedTimers = [];

      for(let timer of state.timers) {
        const lokalTimer = this.timers.find(t => t.id === timer.id);
        if(!lokalTimer) {
          addedTimers.push(timer);
        }
      }
      for(let timer of this.timers) {
        const stateTimer = state.timers.find(t => t.id === timer.id);
        if(!stateTimer) {
          deletedTimers.push(timer);
        }
      }

      this.timers = [...state.timers];
      this.update();
    });
  }

  async openTimer(timer) {
    const state = await State.getState();
    state.currentTimer = timer.id;
    State.setState(state);
  }

  render() {
    return html`
      <div class="timer-list">
        ${this.timers.map(timer => {
          return html`
            <app-timer-card data-id="${timer.id}"
                            .timer="${timer}"
                            @click="${e => this.openTimer(timer)}">
            </app-timer-card>
          `;
        })}
      </div>
    `;
  }
}

customElements.define('app-timer-list', TimerList);
