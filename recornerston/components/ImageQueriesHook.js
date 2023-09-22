import React, { useState, useEffect } from "react";
import axios from "axios";

const getDICOMStudiesData = async () => {
  try {
    const response = await axios.get("/api/StudiesProxy");
    if (!response.data || response.data.length === 0)
      throw new Error("No study data returned.");
    return response.data;
  } catch (error) {
    console.error("Error fetching data from Orthanc:", error);
    return [];
  }
};

const getDICOMSeriesData = async () => {
  try {
    const response = await axios.get("/api/SeriesProxy");
    if (!response.data || response.data.length === 0)
      throw new Error("No series data returned.");
    return response.data;
  } catch (error) {
    console.error("Error fetching data from Orthanc:", error);
    return [];
  }
};

export const useStudyAndSeriesId = () => {
  const [studyId, setStudyId] = useState(null);
  const [seriesId, setSeriesId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const dicomData = await getDICOMStudiesData();
      if (
        dicomData.length > 0 &&
        dicomData[1]["0020000D"] &&
        dicomData[1]["0020000D"].Value[0]
      ) {
        setStudyId(dicomData[1]["0020000D"].Value[0]);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const dicomData = await getDICOMSeriesData();
      if (
        dicomData.length > 0 &&
        dicomData[0]["0020000E"] &&
        dicomData[0]["0020000E"].Value[0]
      ) {
        setSeriesId(dicomData[0]["0020000E"].Value[0]);
      }
    };
    fetchData();
  }, []);

  return { studyId, seriesId };
};

export default function SeriesAndStudiesComponent() {
  const { studyId, seriesId } = useStudyAndSeriesId();

  return (
    <div onContextMenu={(event) => event.preventDefault()}>
      <h1>CornerstoneViewer</h1>
      <p>Study ID: {studyId ? studyId : "Loading..."}</p>
      <h1>SeriesViewer</h1>
      <p>SeriesInstanceUID: {seriesId ? seriesId : "Loading..."}</p>
    </div>
  );
}
