import React, { useState, useEffect } from "react";
import axios from "axios";

const getDICOMData = async () => {
  try {
    const response = await axios.get("/api/orthancProxy");
    return response.data;
  } catch (error) {
    console.error("Error fetching data from Orthanc:", error);
  }
};

export default function MyComponent() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const dicomData = await getDICOMData();
      setData(dicomData);
    };

    fetchData();
  }, []);

  console.log("data :", data);

  return (
    <div>
      {data &&
        Array.isArray(data) &&
        data.map((item) => (
          <div key={item.ID}>
            <p>Patient Name: {item.PatientName}</p>
            <p>Study Date: {item.StudyDate}</p>
            <p>Modality: {item.Modality}</p>
          </div>
        ))}
    </div>
  );
}
