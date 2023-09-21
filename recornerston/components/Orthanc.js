import axios from 'axios';

export const getDICOMData = async () => {
  try {
    const response = await axios.get('http://localhost:8042/instances');
    
      console.log("response :", response);
    return response.data;
  } catch (error) {
    console.error("Error fetching data from Orthanc:", error);
  }
};
