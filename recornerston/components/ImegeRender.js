// import initDemo from './initDemo'; 아직
import Enums from "@cornerstonejs/core";
import setTitleAndDescription from "./Mmodule/setTitleAndDescription";


// This is for debugging purposes
console.warn(
  "Click on index.ts to open source code for this example --------->"
);

// ======== Set up page ======== //
setTitleAndDescription(
  'Tutorial Playground',
  'The playground for you to copy paste the codes in the tutorials and run it'
);

const { ViewportType } = Enums;

/* async function run() {
  await initDemo();
} */

run();

export { Enums, setTitleAndDescription, ViewportType };