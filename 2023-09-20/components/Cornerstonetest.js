import {
  RenderingEngine,
  Enums,
  getEnabledElementByIds,
  eventTarget,
} from "@cornerstonejs/core";
import {
  createImageIdsAndCacheMetaData,
  initCornerstone,
} from "../utils/cornerstone3D/";
import { forwardRef, useEffect, useRef, useState } from "react";
import { Cornerstone } from "../styles/components/tool/seriescornerstoneviewer";
import { ToolGroupManager } from "@cornerstonejs/tools";
import {
  addTools,
  setToolsMode,
  tools,
} from "../utils/cornerstone3D/ToolGroup";
import React, { useImperativeHandle } from "react";
import { Enums as csToolsEnums } from "@cornerstonejs/tools";
import { api } from "dicomweb-client";
import { isEqual } from "@cornerstonejs/core/dist/esm/utilities";
import {
  getAnnotation,
  saveAnnotation,
  fetchSR,
  deleteSRInstance,
  test,
  loadSRToAnnotationState,
  deleteAnnotation,
} from "../utils/cornerstone3D/roiAnnotation";
import { useCallback } from "react";
import { HOST_ORTHANC } from "../constants/global";

export const renderingEngineId = "myRenderingEngine";
export const viewportId = "CT_AXIAL_STACK";
export const toolGroupId = "CT_TOOLGROUP";

const csToolsEvents = csToolsEnums.Events;

const { ViewportType } = Enums;

async function runViewport(
  element,
  studyInstanceUID,
  seriesInstanceUID,
  wadoRsRoot,
  setPatientState
) {
  // Init Cornerstone and related libraries
    await initCornerstone();
    console.log('image', studyInstanceUID, seriesInstanceUID)
  // Get Cornerstone imageIds and fetch metadata into RAM
  const imageDatas = await createImageIdsAndCacheMetaData({
    StudyInstanceUID: studyInstanceUID,
    SeriesInstanceUID: seriesInstanceUID,
    wadoRsRoot: wadoRsRoot,
      //type: 'VOLUME',
    
  });
    console.log("imageDatas :", imageDatas);
    
  const { imageIds, instanceInfo } = imageDatas;
  setPatientState(instanceInfo);
  console.log("imageIds", imageIds);
  // Instantiate a rendering engine

  const renderingEngine = new RenderingEngine(renderingEngineId);
  // Create a stack viewport
  const viewportInput = {
    viewportId,
    element,
    type: ViewportType.STACK,
  };

  renderingEngine.enableElement(viewportInput);

  // Get the stack viewport that was created
  const viewport = renderingEngine.getViewport(viewportId);

  // Define tool groups to add the segmentation display tool to
  const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);

  if (toolGroup) {
    addTools(toolGroup, tools);
    setToolsMode(toolGroup, tools);
    toolGroup.addViewport(viewportId, renderingEngineId);
  }
  viewport.setStack(imageIds, imageIds.length - 1);
  
  viewport.render();

  // windows resize listener
  const handleResize = () => {
    renderingEngine.resize(true, true); // This assumes that your viewport object has a resize method
  };

  window.addEventListener("resize", handleResize);
  return () => {
    window.removeEventListener("resize", handleResize);
  
  };
}

const Viewport = forwardRef(
  (
    {
      children,
    },
    ref
  ) => {
    const viewer = useRef(null); // ref to the viewer div
    const [isShowPatientInfo, setIsShowPatientInfo] = useState("Active");
    const [toolGroup, setToolGroup] = useState(null);
    const [viewport, setViewport] = useState(null);
    const studyInstanceUID = '1.400.20.81.610.201712061281'
    const seriesInstanceUID =
            "1.3.46.670589.30.1.6.1.1625523293.1512518914734.3";
    const wadoRsRoot = "http://localhost/orthanc/dicom-web";
    const client = new api.DICOMwebClient({
      url: `http://${HOST_ORTHANC}/orthanc/dicom-web`, // TODO get from env
    });
        const setPatientState = () => { }
        const setToolState = () => { }
    // set tool state after viewport is initialized
        useEffect(() => {
     
      if (window !== undefined) {
        runViewport(
          viewer.current,
          studyInstanceUID,
          seriesInstanceUID,
          wadoRsRoot,
          setPatientState
        ).then(() => {
          const tool = ToolGroupManager.getToolGroup(toolGroupId);
          const element = getEnabledElementByIds(viewportId, renderingEngineId);
          if (element) {
            const viewport = element.viewport;
            setViewport(viewport);
          }
          tool &&
            setToolState({
              ...tool.toolOptions,
              PatientInfo: { mode: isShowPatientInfo },
            });
          setToolGroup(tool);
        });
      }
    }, []);

    let FrameOfReferenceUID, imageId;
    if (viewport) {
      FrameOfReferenceUID = viewport.getFrameOfReferenceUID();
      imageId = viewport?.csImage?.imageId;
    }

    // get annotation from annotation manager
    const annotationHandler = useCallback((FrameOfReferenceUID) => {
      if (!FrameOfReferenceUID) return;
      setRoiState((old) => {
        const annotatons = getAnnotation(FrameOfReferenceUID);
        if (isEqual(old, annotatons) || !annotatons) {
          return old;
        } else {
          return { ...annotatons };
        }
      });
    }, []);

    // add event listener for annotation added
    useEffect(() => {
      // Define the event handler that calls annotationHandler with the current FrameOfReferenceUID
      const handler = () => annotationHandler(FrameOfReferenceUID);
      // Add the event listener to listen for 'ANNOTATION_ADDED' events
      eventTarget.addEventListener(csToolsEvents.ANNOTATION_ADDED, handler);
      // Cleanup: Remove the event listener when the component unmounts or the dependency changes
      return () => {
        eventTarget.removeEventListener(
          csToolsEvents.ANNOTATION_ADDED,
          handler
        );
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [annotationHandler]);

    // bind tool to mouse button
    const getMouseButton = (toolName) => {
      switch (toolName) {
        //  case "WindowLevel":
        //    return [{ mouseButton: csToolsEnums.MouseBindings.Secondary }];
        case "StackScrollMouseWheel":
          return [];
        default:
          return [{ mouseButton: csToolsEnums.MouseBindings.Primary }];
      }
    };

    // handle button click
    const handleClickCornerstoneTool = (params) => {
      // check if toolGroup is initialized
      if (toolGroup) {
        setToolsMode(toolGroup, tools);
        // handle patient info button
        let patientInfo = isShowPatientInfo; // default mode
        if (params.name === "PatientInfo") {
          patientInfo = isShowPatientInfo === "Active" ? "Passive" : "Active";
          setIsShowPatientInfo(patientInfo);
        }
        // handle cornerstone tool button
        else if (params.mode === "Passive") {
          toolGroup.setToolActive(params.name, {
            bindings: getMouseButton(params.name),
          });
        } else if (params.mode === "Active") {
          toolGroup.setToolPassive(params.name);
        } else if (params.mode === "Enabled") {
          toolGroup.setToolDisabled(params.name);
        } else if (params.mode === "Disabled") {
          toolGroup.setToolEnabled(params.name);
        }

        setToolState({
          ...toolGroup.toolOptions,
          PatientInfo: { mode: patientInfo },
        });
      }
    };

    const loadSR = async () => {
      if (!client) {
        alert("Please select a server first");
        return;
      }
      const report = await fetchSR(client, studyInstanceUID);
      setRsImageIdState(report);
      console.log("report", report);
    };

    const saveAnnotationToSR = async () => {
      await saveAnnotation(FrameOfReferenceUID);
      loadSR();
    };

    const deleteSR = async (seriesInstanceUID) => {
      deleteSRInstance(seriesInstanceUID);
      loadSR();
    };

    const loadSRToAnnotation = (srSeries) => {
      if (!viewport) {
        alert("viewport not defined");
        return;
      }
      const imageId = viewport?.csImage?.imageId;
      if (!imageId) {
        alert("No imageId");
        return;
      }
      loadSRToAnnotationState(
        imageId,
        srSeries,
        viewer.current,
        FrameOfReferenceUID
      );
      annotationHandler(FrameOfReferenceUID);
      // test(viewportId, renderingEngineId)
    };

    // Using React's useImperativeHandle to expose specific methods to the parent component.
    // This allows for imperative calls to these methods from the parent.
    useImperativeHandle(ref, () => ({
      handleClickCornerstoneTool,
      loadSR,
      saveAnnotationToSR,
      deleteSR,
      test: () => test(viewportId, renderingEngineId),
      loadSRToAnnotation,
      deleteAnnotation: (uid) => deleteAnnotation(uid),
    }));

    return (
      <Cornerstone id="cornerstone-element" ref={viewer}>
        {children}
      </Cornerstone>
    );
  }
);

export default Viewport;
