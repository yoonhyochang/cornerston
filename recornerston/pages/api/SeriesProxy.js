import axios from "axios";

export default async function handler(req, res) {
  try {
    const response = await axios.get(
      "http://localhost:8042/dicom-web/studies/1.400.20.81.610.201712061281/series/1.3.46.670589.30.1.6.1.1625523293.1512518914734.3/instances/"
    );
    console.log("response :", response);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || {});
  }
}
