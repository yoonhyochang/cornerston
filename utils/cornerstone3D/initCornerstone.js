import initProviders from "./initProviders";
import initCornerstoneDICOMImageLoader from "./initCornerstoneDICOMImageLoader";
import initVolumeLoader from "./initVolumeLoader";
import { init as csRenderInit } from "@cornerstonejs/core";
import initCornerstoneTools from "./initCornerstoneTools";

export default async function initDemo() {
  try {
      initProviders();
      initCornerstoneDICOMImageLoader();
      initVolumeLoader();
      await csRenderInit();
      initCornerstoneTools();
  } catch (error) {
    console.error("initCornerstone 오류 발생:", error);
  }

}
