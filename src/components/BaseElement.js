import { LitElement, html, css } from 'lit-element';

export default class BaseElement extends LitElement {

  static get styles() {
    return css`
      button {
        border-radius: var(--border-radius-lvl2);
        min-width: 45px;
        height: 45px;
        padding: 0;
        margin: 0;
        border: none;
        background: var(--forground);
        outline: none;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: box-shadow .05s ease-out;
      }
      button:active {
        box-shadow: 0px 1px 6px rgba(0, 0, 0, 0.1);
      }
      svg {
        width: var(--global-icon-size);
        height: var(--global-icon-size);
        fill: var(--text-color);
      }
      :host {
        display: block;
      }
    `;
  }

}
