import type React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        src?: string;
        alt?: string;
        poster?: string;
        "auto-rotate"?: boolean | string;
        "rotation-per-second"?: string;
        "camera-controls"?: boolean | string;
        "disable-zoom"?: boolean | string;
        exposure?: string | number;
        "shadow-intensity"?: string | number;
        "environment-image"?: string;
        "touch-action"?: string;
        [key: string]: any;
      };
    }
  }
}

export {};

