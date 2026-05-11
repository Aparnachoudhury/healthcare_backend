const BASE = "https://healthcare-backend-1luc.onrender.com/api";

const get = (url) => fetch(url).then((r) => r.json());

export const getHealthData    = ()           => get(`${BASE}/health-data`);
export const getAlarms        = ()           => get(`${BASE}/alarms`);

export const getOverview      = (deviceId)   => get(`${BASE}/device/${deviceId}/overview`);
export const getHeartRate     = (deviceId)   => get(`${BASE}/device/${deviceId}/heartrate`);
export const getSleep         = (deviceId)   => get(`${BASE}/device/${deviceId}/sleep`);
export const getBloodPressure = (deviceId)   => get(`${BASE}/device/${deviceId}/bloodpressure`);
export const getBloodOxygen   = (deviceId)   => get(`${BASE}/device/${deviceId}/bloodoxygen`);
export const getBodyTemp      = (deviceId)   => get(`${BASE}/device/${deviceId}/bodytemp`);
export const getHeartHealth   = (deviceId)   => get(`${BASE}/device/${deviceId}/hearthealth`);
export const getECG           = (deviceId)   => get(`${BASE}/device/${deviceId}/ecg`);
export const getPressure      = (deviceId)   => get(`${BASE}/device/${deviceId}/pressure`);
export const getBloodSugar    = (deviceId)   => get(`${BASE}/device/${deviceId}/bloodsugar`);
export const getBloodKetone   = (deviceId)   => get(`${BASE}/device/${deviceId}/bloodketone`);
export const getUricAcid      = (deviceId)   => get(`${BASE}/device/${deviceId}/uricacid`);
export const getLocationTrack = (deviceId)   => get(`${BASE}/device/${deviceId}/locationtrack`);