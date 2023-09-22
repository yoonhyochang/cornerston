import React, { useState, useEffect } from "react";
import axios from "axios";

const getDICOMStudiesData = async () => {
  try {
    const response = await axios.get("/api/StudiesProxy");
    return response.data;
  } catch (error) {
    console.error("Error fetching data from Orthanc:", error);
  }
};

const getDICOMSeriesData = async () => {
  try {
    const response = await axios.get("/api/SeriesProxy");
    return response.data;
  } catch (error) {
    console.error("Error fetching data from Orthanc:", error);
  }
};

export const useStudyAndSeriesId = () => {
  const [studyId, setStudyId] = useState("");
  const [seriesId, setseriesId] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const dicomData = await getDICOMStudiesData();
      const firstStudyId = dicomData[1]["0020000D"].Value[0];
      setStudyId(firstStudyId);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const dicomData = await getDICOMSeriesData();
      const firstseriesId = dicomData[0]["0020000E"].Value[0];
      setseriesId(firstseriesId);
    };
    fetchData();
  }, []);

  return { studyId, seriesId };
};

export default function SeriesAndStudiesComponent() {
  const { studyId, seriesId } = useStudyAndSeriesId();

  return (
    <div>
      <h1>CornerstoneViewer</h1>
      <p>Study ID: {studyId}</p>
      <h1>SeriesViewer</h1>
      <p>SeriesInstanceUID: {seriesId}</p>
    </div>
  );
}