import React, { useState, useEffect } from "react";
import axios from "axios";

const getDICOMData = async () => {
  try {
    const response = await axios.get("/api/StudiesProxy");
    return response.data;
  } catch (error) {
    console.error("Error fetching data from Orthanc:", error);
  }
};

export default function MyComponent() {
  const [studyId, setStudyId] = useState(""); // 저장할 값의 타입을 문자열로 변경

  useEffect(() => {
    const fetchData = async () => {
      const dicomData = await getDICOMData();
      //console.log("StudiesdicomData:", dicomData);
      const firstStudyId = dicomData[1]["0020000D"].Value[0]; // 첫 번째 객체의 '0020000D' 키의 첫 번째 값을 가져옴
      setStudyId(firstStudyId);
    };

    fetchData();
  }, []);

  //console.log("StudyInstanceUID:", studyId);

  return (
    <div>
      <h1>CornerstoneViewer</h1>
      <p>Study ID: {studyId}</p> {/* Study ID를 출력 */}
    </div>
  );
}
