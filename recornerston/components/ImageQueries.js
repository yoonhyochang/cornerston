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

export default function SeriesAndStudiesComponent() {
  const [studyId, setStudyId] = useState(""); // 저장할 값의 타입을 문자열로 변경
  const [seriesId, setseriesId] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const dicomData = await getDICOMStudiesData();
      //console.log("StudiesdicomData:", dicomData);
      const firstStudyId = dicomData[1]["0020000D"].Value[0]; // 첫 번째 객체의 '0020000D' 키의 첫 번째 값을 가져옴
      setStudyId(firstStudyId);
    };

    fetchData();
  }, []);

    useEffect(() => {
      const fetchData = async () => {
        const dicomData = await getDICOMSeriesData();
        //console.log("SeriesdicomData:", dicomData);
        const firstseriesId = dicomData[0]["0020000E"].Value[0]; // 첫 번째 객체의 '0020000D' 키의 첫 번째 값을 가져옴
        setseriesId(firstseriesId);
      };

      fetchData();
    }, []);

  //console.log("StudyInstanceUID:", studyId);

  return (
    <div>
      <h1>CornerstoneViewer</h1>
      <p>Study ID: {studyId}</p> {/* Study ID를 출력 */}
      <h1>SeriesViewer</h1>
      <p>SeriesInstanceUID: {seriesId}</p> {/* Study ID를 출력 */}
    </div>
  );
}
