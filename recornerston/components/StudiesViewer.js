import React, { useState, useEffect } from "react";
import axios from "axios";

const getDICOMData = async () => {
    try {
        const response = await axios.get("/api/studiesProxy");
      
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
      <h1>Studies</h1>

      {data &&
        Array.isArray(data) &&
        data.map((itemId, index) => (
          <div key={itemId}>
            <p>{itemId}</p>
          </div>
        ))}
    </div>
  );
}
