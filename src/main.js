import State from './State.js';
import './components/Timer.js';
import './components/TimerCard.js';
import './components/TimerList.js';

window.addEventListener('DOMContentLoaded', init);

let mainElement;

function toggleDrawer() {
  if (mainElement.getAttribute('drawer') == "open") {
    closeDrawer();
  } else {
    openDrawer();
  }
}

async function closeDrawer() {
  mainElement.setAttribute('drawer', 'closed');
  const state = await State.getState();
  if(state.currentTimer) {
    state.currentTimer = null;
    State.setState(state);
  }
}

function openDrawer() {
  mainElement.setAttribute('drawer', 'open');
}

async function init() {
  mainElement = document.querySelector('main');

  mainElement.querySelector('[toggle-drawer]')
    .addEventListener('click', e => closeDrawer());

  mainElement.querySelector('[create-timer]')
    .addEventListener('click', e => State.createTimer());

  window.addEventListener('statechange', async e => {
    const state = await State.getState();
    const currentTimer = await State.getTimerById(state.currentTimer);
    if(currentTimer) {
      openDrawer();
    } else {
      closeDrawer();
    }
  });

  const sw = await navigator.serviceWorker.register('./sw.js');

  navigator.serviceWorker.addEventListener('message', e => {
    console.log(e);
  });
}
