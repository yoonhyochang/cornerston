import axios from "axios";

export default async function handler(req, res) {
  try {
    const response = await axios.get(
      "http://localhost:8042/dicom-web/studies/"
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || {});
  }
}
