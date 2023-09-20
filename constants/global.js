// 배포 uncomment line 16-22  in _app.js 


// const PORT = dev ? "3000" : "80"
// [dev] 개발   
const development = {
  PROTOCOL: "http",
  HOST: "localhost",
  PORT: 3000,
  PROTOCOL_ORTHANC: "http",
  HOST_ORTHANC: "10.2.52.209", //"10.2.52.209",
  PORT_ORTHANC: "80",
  SESSION_ORTHANC: "orthanc:orthanc",
  PROTOCOL_AVIEW_SYNC_API: "http",
  HOST_AVIEW_SYNC_API: "10.2.52.209",
  PORT_AVIEW_SYNC_API: "80",
  GPU_SERVER: "10.2.52.54:8080",
};

const production = {
    PROTOCOL: "http",
    HOST: "10.2.52.209",
    PORT: "3000",
    PROTOCOL_ORTHANC: "http",
    HOST_ORTHANC: "10.2.52.209",
    PORT_ORTHANC: "80",
    SESSION_ORTHANC: "orthanc:orthanc",
    PROTOCOL_AVIEW_SYNC_API: 'http',
    HOST_AVIEW_SYNC_API: 'localhost',
    PORT_AVIEW_SYNC_API: '8089',
    GPU_SERVER: "10.2.52.54:8080"
}

module.exports = process.env.NODE_ENV === 'production' ? production : development