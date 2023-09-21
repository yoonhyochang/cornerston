import React, { useState, useEffect } from "react";
import axios from "axios";

const getDICOMData = async () => {
    try {
        const response = await axios.get("/api/studiesProxy");
        const StudiesArray = response.data;
        const Studie = StudiesArray[0];
        
        console.log("Studie :", Studie); 
    return response.data;
  } catch (error) {
    console.error("Error fetching data from Orthanc:", error);
  }
};

export default function MyComponent() {
  const [studie, setStudie] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const dicomData = await getDICOMData();
        setStudie(dicomData[0]);
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Studie Id</h1>
      <p>{studie}</p>
    </div>
  );
}
