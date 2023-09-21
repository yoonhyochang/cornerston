import React, { useState, useEffect } from "react";
import axios from "axios";

const getDICOMData = async () => {
  try {
    const response = await axios.get("/api/SeriesProxy");
    return response.data;
  } catch (error) {
    console.error("Error fetching data from Orthanc:", error);
  }
};

export default function MyComponent() {
  const [seriesId, setseriesId] = useState(""); // 저장할 값의 타입을 문자열로 변경

  useEffect(() => {
    const fetchData = async () => {
      const dicomData = await getDICOMData();
      //console.log("SeriesdicomData:", dicomData);
      const firstseriesId = dicomData[0]["0020000E"].Value[0]; // 첫 번째 객체의 '0020000D' 키의 첫 번째 값을 가져옴
      setseriesId(firstseriesId);
    };

    fetchData();
  }, []);

  //console.log("SeriesInstanceUID:", seriesId);

  return (
    <div>
      <h1>SeriesViewer</h1>
      <p>SeriesInstanceUID: {seriesId}</p> {/* Study ID를 출력 */}
    </div>
  );
}
