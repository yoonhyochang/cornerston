import { getAnnotationState } from "@cornerstonejs/tools/dist/esm/stateManagement/annotation/annotationState";
import { adaptersSR } from "@cornerstonejs/adapters";
import dcmjs from "dcmjs";
import { metaData, getEnabledElementByIds, getEnabledElement } from "@cornerstonejs/core";
import { vec3 } from "gl-matrix";
import { api } from "dicomweb-client";
import {
  processSeriesResults,
  seriesInStudy,
} from "../DicomWebDataSource/qido";
import { HOST_ORTHANC, PROTOCOL_ORTHANC } from "../../constants/global";
import { annotation, drawing } from "@cornerstonejs/tools";
import { _getMeasurements } from "./getMeasurements";
import addMeasurement from "../cornerstone-dicom-sr/src/utils/addMeasurement";
import getSvgDrawingHelper from "../getSvgDrawingHelper";
import DICOMSRDisplayTool from "../cornerstone-dicom-sr/src/tools/DICOMSRDisplayTool";
import { setTrackingUniqueIdentifiersForElement } from "utils/cornerstone-dicom-sr/src/tools/modules/dicomSRModule";

let request;
const URL = `${PROTOCOL_ORTHANC}://${HOST_ORTHANC}/orthanc`;
let apiClient;

const { MeasurementReport } = adaptersSR.Cornerstone3D;

/**
 * Retrieves an annotation for a given FrameOfReferenceUID from the annotation manager.
 *
 * This function looks up the annotation manager to find an annotation corresponding to the given FrameOfReferenceUID.
 * 
 * @param {string} FrameOfReferenceUID - The Frame of Reference UID for the annotation.
 * @returns {object|null} The annotation object if found, otherwise null.
 */

const getAnnotation = (FrameOfReferenceUID) => {
  // Retrieve annotations from the annotation manager
  const { annotations } = annotation.state.getAnnotationManager();
  
  // Return the annotation corresponding to the given FrameOfReferenceUID
  return annotations[FrameOfReferenceUID];
};

/**
 * Asynchronously saves an annotation for a given FrameOfReferenceUID.
 *
 * This function generates a measurement report based on the annotation's tool state.
 * The report is then sent to a server as a DICOM object.
 * 
 * @async
 * @param {string} FrameOfReferenceUID - The Frame of Reference UID for the annotation.
 * @returns {Promise<void>} A promise that resolves when the annotation is successfully saved.
 * @throws {Error} Throws an error if the report generation or request fails.
 */

const saveAnnotation = async (FrameOfReferenceUID) => {
  return new Promise((resolve, reject) => {
    // Retrieve annotations from the annotation manager
    const { annotations } = annotation.state.getAnnotationManager();
    
    // Get the annotation corresponding to the given FrameOfReferenceUID
    const frameAnnotation = annotations[FrameOfReferenceUID];
    
    // Check if there is any annotation to save
    if (!frameAnnotation) {
      alert("No annotation to save");
      reject();
      return;
    }
    
    // Prepare data for the report
    const toolTypes = Object.keys(frameAnnotation);
    const data = frameAnnotation[toolTypes[0]];
    const imageId = data[0]?.metadata?.referencedImageId;
    const toolState = {};
    toolState[imageId] = { [toolTypes[0]]: { data: data } };
    const options = {};
    
    // Generate the report
    const report = MeasurementReport.generateReport(
      toolState,
      metaData,
      worldToImageCoords,
      options
    );

    // Validate the report
    if (!report || !report.dataset) {
      reject(new Error("Failed to generate report"));
      return;
    }

    // Set DICOM metadata
    const { dataset } = report;
    if (typeof dataset.SpecificCharacterSet === "undefined") {
      dataset.SpecificCharacterSet = "ISO_IR 192";
    }
    dataset.PatientID = "00025986"; // TODO get from DICOM

    // Convert dataset to buffer
    const buffer = dcmjs.data.datasetToBuffer(dataset);

    // Validate the buffer
    if (!buffer) {
      reject(new Error("Failed to generate report"));
      return;
    }

    // Prepare and send the request
    request = getXMLHttpRequest();
    request.open("POST", `${URL}/instances`, true);
    request.setRequestHeader("Content-Type", "application/dicom");

    // Handle request response
    request.onload = function (res) {
      if (this.status === 200) {
        console.log("saved success");
        resolve();
      } else {
        reject(new Error("Request failed with status " + this.status));
      }
    };
    
    // Send the buffer
    request.send(buffer.buffer);
  });
};


/**
 * Retrieves an existing XMLHttpRequest object if it's not done, or creates a new one.
 * 
 * This function checks if a global `request` object exists and whether it is in a state other than 'DONE'.
 * If those conditions are met, it returns the existing request object.
 * Otherwise, it creates and returns a new XMLHttpRequest object.
 * 
 * @returns {XMLHttpRequest} The XMLHttpRequest object.
 */

function getXMLHttpRequest() {
  if (request && request.readyState !== XMLHttpRequest.DONE) {
    return request;
  }
  request = new XMLHttpRequest();
  return request;
}

/**
 * Asynchronously retrieves or creates an API client for DICOM web services.
 * 
 * This function checks if an `apiClient` already exists. If it does, it resolves the Promise with that client.
 * Otherwise, it creates a new DICOMwebClient and resolves the Promise with the new client.
 * 
 * @async
 * @returns {Promise<object>} A promise that resolves with the API client.
 * @throws {Error} Throws an error if the API client creation fails.
 */

async function getApiClient() {
  return new Promise((resolve, reject) => {
    if (apiClient) {
      resolve(apiClient);
    }
    apiClient = new api.DICOMwebClient({
      url: URL + "/dicom-web",
    });
    resolve(apiClient);
  });
}

/**
 * Asynchronously fetches Structured Reports (SR) from the Orthanc server.
 * 
 * This function sends a GET request to a specified URL to retrieve a list of series.
 * If the request is successful, it resolves the Promise with the series list;
 * otherwise, it rejects the Promise with an error.
 * 
 * @async
 * @param {object} client - The DICOMweb client.
 * @param {string} studyInstanceUID - The StudyInstanceUID of the study to be retrieved.
 * @returns {Promise<Array>} A promise that resolves with the series list.
 * @throws {Error} Throws an error if the request fails.
 */

const fetchSR = async (client, studyInstanceUID) => {
  const result = await seriesInStudy(client, studyInstanceUID);
  const series = processSeriesResults(result);
  const annotations = series.filter((item) => item.modality === "SR");
  return annotations;
};

/**
 * Asynchronously deletes a Structured Report (SR) instance from the Orthanc server.
 * 
 * This function sends a DELETE request to a specified URL to remove a series.
 * If the request is successful, it resolves the Promise; otherwise, it rejects the Promise with an error.
 * 
 * @async
 * @param {string} SeriesInstanceUID - The SeriesInstanceUID of the SR instance to be deleted.
 * @returns {Promise<void>} A promise that resolves when the SR instance is successfully deleted.
 * @throws {Error} Throws an error if the request fails. 
 */

const deleteSRInstance = async (SeriesInstanceUID) => {
  request = getXMLHttpRequest();
  const seriesIds = await findSeriesIds(SeriesInstanceUID);
  deleteSeries(seriesIds[0]).then(() => {
    console.log("deleted success");
  });
};

/**
 * Finds series IDs from the Orthanc server using SeriesInstanceUID.
 * 
 * This function sends a POST request to search for series based on their SeriesInstanceUID.
 * If the request is successful, it resolves the Promise with the series IDs; 
 * otherwise, it rejects the Promise with an error.
 * 
 * @param {string} SeriesInstanceUID - The SeriesInstanceUID to search for.
 * @returns {Promise<Array|string|null>} A promise that resolves with the series IDs or null if no series is found.
 * @throws {Error} Throws an error if the request fails.
 */

function findSeriesIds(SeriesInstanceUID) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", `${URL}/tools/find`, true);
    request.onload = function (res) {
      if (this.status === 200) {
        if (!res.currentTarget.response) {
          resolve(null);
          return;
        }
        const seriesIds = JSON.parse(res.currentTarget.response);
        resolve(seriesIds);
      } else {
        reject(new Error("Request failed with status " + this.status));
      }
    };
    request.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    const query = {
      Level: "Series",
      Query: {
        SeriesInstanceUID: SeriesInstanceUID,
      },
    };
    request.send(JSON.stringify(query));
  });
}

/**
 * Deletes a series by its ID using an XMLHttpRequest.
 * 
 * This function sends a DELETE request to a specified URL to remove a series.
 * If the request is successful, it resolves the Promise; otherwise, it rejects the Promise with an error.
 * 
 * @param {string} seriesId - The ID of the series to be deleted.
 * @returns {Promise<void>} A promise that resolves when the series is successfully deleted.
 * @throws {Error} Throws an error if the request fails.
 */

function deleteSeries(seriesId) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("DELETE", `${URL}/series/${seriesId}`, true);
    request.onload = function (res) {
      if (this.status === 200) {
        resolve();
      } else {
        reject(new Error("Request failed with status " + this.status));
      }
    };
    request.send();
  });
}

function test(viewportId, renderingEngineId) {
 // console.log(annotation.state.getAnnotationManager());
  // const enabledElement = getEnabledElementByIds(viewportId, renderingEngineId);
  // const { viewport } = enabledElement;
  // const { element } = viewport;
  // let annotations = annotation.state.getAnnotations("DICOMSRDisplay", element);
  // const svgDrawingHelper = getSvgDrawingHelper(element);
  //setTrackingUniqueIdentifiersForElement(enabledElement);
    // const drawingOptions = {};
    // annotations.forEach((annotation) => {
    //   const { renderableData } = annotation?.data?.cachedStats;
    //   const annotationUID = annotation.annotationUID;
    //   renderableData.POLYLINE.map((data, index) => {
    //     const canvasCoordinates = data.map((p) => viewport.worldToCanvas(p));
    //     const lineUID = `${index}`;

    //     if (canvasCoordinates.length === 2) {
    //       drawing.drawLine(
    //         svgDrawingHelper,
    //         annotationUID,
    //         lineUID,
    //         canvasCoordinates[0],
    //         canvasCoordinates[1],
    //         drawingOptions
    //       );
    //     } else {
    //       console.log("drawPolyline");
    //       drawing.drawPolyline(
    //         svgDrawingHelper,
    //         annotationUID,
    //         lineUID,
    //         canvasCoordinates,
    //         drawingOptions
    //       );
    //     }
    //   });
    // });
}
/**
 * Asynchronously loads Structured Reports (SR) to the annotation state.
 * 
 * This function retrieves the series data from the DICOM server and parses
 * it to add measurements to the annotation state. If a measurement with the
 * same TrackingUniqueIdentifier already exists in the annotation state,
 * it will not be added again.
 * 
 * @async
 * @param {string} imageId - The ID of the image to which the annotation is related.
 * @param {object} srSeries - The Structured Report series data.
 * @param {HTMLElement} divElement - The HTML element where the annotation will be displayed.
 * @param {string} [FrameOfReferenceUID=undefined] - The Frame of Reference UID.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 * @throws {Error} Throws an error if any issue occurs during the process.
 */

async function loadSRToAnnotationState(
  imageId,
  srSeries,
  divElement,
  FrameOfReferenceUID = undefined
) {
  /**
   * Parses the ContentSequence from the instance to add measurements to the annotation state.
   *
   * This function iterates through the ContentSequence to create measurements. It then checks
   * whether a measurement with the same TrackingUniqueIdentifier already exists in the annotation state.
   * If it doesn't, the new measurement is added.
   *
   * @function
   * @param {object} instance - The DICOM instance containing the ContentSequence for measurements.
   * @returns {void}
   * @throws {Error} Throws an error if the ContentSequence is not present or if any issue occurs during the process.
  */
  
  const parseCoordinates = (instance) => {
    const { ContentSequence } = instance;
    const { annotations } = annotation.state.getAnnotationManager();
    const frameAnnotation = annotations[FrameOfReferenceUID] || {};
    const srAnnotation = frameAnnotation[DICOMSRDisplayTool.toolName] || [];
    const measurements = _getMeasurements(ContentSequence); // TODO change to getSopClassHandlerModule({ servicesManager, extensionManager })
    measurements.map((measurement) => {
      // check if measurement already exist
      const exist = srAnnotation.some((item) => {
        return (
          item?.data?.cachedStats?.TrackingUniqueIdentifier ===
          measurement?.TrackingUniqueIdentifier
        );
      });

      if (exist) return;

      addMeasurement(measurement, imageId);
      setTrackingUniqueIdentifiersForElement(
        divElement,
        measurement.TrackingUniqueIdentifier
      );
    });
  };

  const client = await getApiClient();
  const instance = {
    studyInstanceUID: srSeries.StudyInstanceUID,
    seriesInstanceUID: srSeries.SeriesInstanceUID,
  };
  client.retrieveSeries(instance).then((dataSet) => {
    const dicomData = dcmjs.data.DicomMessage.readFile(dataSet[0]);
    const dataset = dcmjs.data.DicomMetaDictionary.naturalizeDataset(
      dicomData.dict
    );
    parseCoordinates(dataset);
  });
}

/**
 * Convert world coordinates to image coordinates.
 * 
 * The original function from Cornerstone returns an error in case of 
 * missing rowCosines, origin, and columnCosines. This function adds default values
 * to handle such cases.
 * 
 * @param {string} imageId - The ID of the image.
 * @param {array} worldCoords - The world coordinates to be converted.
 * @returns {array} The converted image coordinates.
 * @throws {Error} Throws an error if no imagePlaneModule is found for the given imageId.
 */

function worldToImageCoords(imageId, worldCoords) {
  const imagePlaneModule = metaData.get("imagePlaneModule", imageId);

  if (!imagePlaneModule) {
    throw new Error(`No imagePlaneModule found for imageId: ${imageId}`);
  }

  // For the image coordinates we need to calculate the transformation matrix
  // from the world coordinates to the image coordinates.

  let {
    columnCosines,
    rowCosines,
    imagePositionPatient: origin,
  } = imagePlaneModule;
  rowCosines ||= [1, 0, 0]; // add default values
  origin ||= [0, 0, 0]; // add default values
  columnCosines ||= [0, 1, 0]; // add default values
  let { columnPixelSpacing, rowPixelSpacing } = imagePlaneModule;
  // Use ||= to convert null and 0 as well as undefined to 1
  columnPixelSpacing ||= 1;
  rowPixelSpacing ||= 1;

  // The origin is the image position patient, but since image coordinates start
  // from [0,0] for the top left hand of the first pixel, and the origin is at the
  // center of the first pixel, we need to account for this.
  const newOrigin = vec3.create();

  vec3.scaleAndAdd(newOrigin, origin, columnCosines, -columnPixelSpacing / 2);
  vec3.scaleAndAdd(newOrigin, newOrigin, rowCosines, -rowPixelSpacing / 2);

  // Get the subtraction vector from the origin to the world coordinates
  const sub = vec3.create();
  vec3.sub(sub, worldCoords, newOrigin);

  // Projected distance of the sub vector onto the rowCosines
  const rowDistance = vec3.dot(sub, rowCosines);

  // Projected distance of the sub vector onto the columnCosines
  const columnDistance = vec3.dot(sub, columnCosines);

  const imageCoords = [
    rowDistance / rowPixelSpacing,
    columnDistance / columnPixelSpacing,
  ];

  return imageCoords;
}
/**
 * Delete annotation by annotationUID from annotation state
 * @param {string} annotationUID - annotationUID.
 * @returns {void} 
 */

function deleteAnnotation(annotationUID) {
  annotation.state.removeAnnotation(annotationUID);
}

export {
  getAnnotation,
  saveAnnotation,
  fetchSR,
  deleteSRInstance,
  test,
  loadSRToAnnotationState,
  deleteAnnotation,
};
