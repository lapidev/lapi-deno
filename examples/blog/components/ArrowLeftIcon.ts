import { html } from "../lib/html.ts";

export interface ArrowLeftIconProps {
  class?: string;
}

function ArrowLeftIcon({ class: clazz }: ArrowLeftIconProps) {
  return html`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="${clazz} h-6 w-6"
      fill="none"
      view-box="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M11 17l-5-5m0 0l5-5m-5 5h12"
      />
    </svg>
  `;
}

export default ArrowLeftIcon;
