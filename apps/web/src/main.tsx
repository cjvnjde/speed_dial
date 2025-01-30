import { StrictMode } from "react";
import * as ReactDOM from "react-dom/client";
import { Container } from "./components/container";
import { SpeedDial } from "./components/speed-dial";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <StrictMode>
    <Container>
      <SpeedDial />
    </Container>
  </StrictMode>
);
