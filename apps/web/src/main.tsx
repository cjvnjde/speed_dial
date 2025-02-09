import { StrictMode } from "react";
import * as ReactDOM from "react-dom/client";
import { SpeedDial } from "./components/speed-dial/speed-dial";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <StrictMode>
    <div className="min-h-screen bg-background w-full">
      <SpeedDial />
    </div>
  </StrictMode>
);
