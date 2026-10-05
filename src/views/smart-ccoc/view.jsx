import React, { useState, useEffect, useRef } from "react";
import { DataTable, Column, Card } from "primereact";
import Camera from "../../assets/trafficlight/camera.png";
import Camerared from "../../assets/trafficlight/camerared.png";
import Eyes from "../../assets/trafficlight/eyes.png";
import CloseEyes from "../../assets/trafficlight/close-eyes.png";
import { DeviceModel } from "../../models";
import Map from "./map.component";
import axios from "axios";
import md5 from "md5";
import { classNames } from "primereact/utils";
const device_model = new DeviceModel();

const CCTV = (props) => {
  const [state, setState] = useState({
    deviceData: [],
    defaultCenter: { lat: 14.9788739, lng: 102.0846441 },
    markerPosition: { lat: 14.9788739, lng: 102.0846441 },
    showAlert: false,
    online: 0,
    offline: 0,
    expandedRows: "",
    showQuantityColumn: false,
  });

  useEffect(() => {
    _fetchData();
  }, []);

  const _fetchData = async () => {
    let data = await device_model.getDeviceBySite();
    let device = data.flatMap((item) => item.deviceData);
    let online = device.filter((item) => item.active_device == 1);
    let offline = device.filter((item) => item.active_device != 1);
    setState({
      ...state,
      deviceData: device,
      data: data,
      online: online.length,
      offline: offline.length,
    });
  };

  const initPlayer = (cameraURL) => {
    const video = document.getElementById("video");
    while (video.firstChild) {
      video.removeChild(video.firstChild);
    }
    const source = document.createElement("source");
    source.src = cameraURL;
    source.type = "video/webm";
    video.appendChild(source);
    video.load();
    video.play();
  };

  const generateKey = async (data) => {
    const deviceId = data.mac_address;
    const username = "devteam@thaiakitech.com";
    const password = "@dm1nt@Dev";
    const maxRetries = 3;
    const retryDelay = 2000;

    const fetchNonceWithRetry = async (retryCount = 0) => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_SERVER_NX_CLOUD_URL}/api/getNonce`, { withCredentials: true });
        return response.data.reply;
      } catch (error) {
        if (error.response && error.response.status === 503 && retryCount < maxRetries) {
          console.warn(`503 error, retrying... (${maxRetries - retryCount} retries left)`);
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          return fetchNonceWithRetry(retryCount + 1);
        } else {
          console.error("Error generating key:", error);
          throw error;
        }
      }
    };

    try {
      const { realm, nonce } = await fetchNonceWithRetry();
      const digest = md5(`${username}:${realm}:${password}`);
      const partial_ha2 = md5(`GET:`);
      const simplified_ha2 = md5(`${digest}:${nonce}:${partial_ha2}`);
      const authKey = btoa(`${username}:${nonce}:${simplified_ha2}`);
      generateVideoUrl(authKey, deviceId, import.meta.env.VITE_APP_SERVER_NX_CLOUD_URL);
    } catch (error) {
      console.error("Failed to generate key after retries:", error);
      alert("Failed to generate key. Please try again later.");
    }
  };
  const generateVideoUrl = (authKey, deviceId, serverAddress) => {
    const cameraURL = `${serverAddress}/media/${deviceId}.webm?lo&auth=${authKey}`;
    initPlayer(cameraURL);
  };

  const rowExpansionTemplate = (data) => {
    return (
      <div>
        {data.deviceData.map((device, index) => {
          const device_active = device.active_device;
          const device_name = device.device_name;
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="basis-8/12 text-sm ml-3 text-black">{device_name}</div>
              <div className="basis-2/12 text-center">
                <img src={device_active === 0 ? Camerared : Camera} alt="device_active" className="h-5 inline" />
              </div>
              <div className="basis-2/12 text-center">
                <img src={device_active === 0 ? CloseEyes : Eyes} className="h-8  inline cursor-pointer" alt="eyes" onClick={() => generateKey(device)}/>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const onRowToggle = (event) => {
    setState({ ...state, expandedRows: event.data, showQuantityColumn: Object.keys(event.data).length > 0 });
  };

  return (
    <div className="lg:fixed lg:h-[calc(100vh_-_90px)] lg:w-[calc(100vw_-_270px)] max-lg:pb-4">
      <div className="grid grid-cols-1 lg:grid-cols-10 lg:grid-rows-[30%_62%_6%] gap-2 h-full">
        <div className="col-span-1 lg:col-span-7 lg:row-span-3 h-full max-lg:h-[50vh] w-full">
          <Map marker={state.deviceData} show={initPlayer}></Map>
        </div>
        <div className="col-span-1 lg:col-span-3 h-full">
          <video id="video" className="h-full w-full" controls></video>
        </div>
        <div className="col-span-1 lg:col-span-3 h-[60vh] lg:h-full overflow-y-scroll scrollbar">
          <div>
            <Card
              pt={{
                root: { className: "bg-[#F8F8FF] h-full" },
                body: { className: "h-full p-4" },
                content: { className: "lg:h-full p-0" },
              }}
            >
              <DataTable
                value={state.data}
                dataKey="site_table_uuid"
                expandedRows={state.expandedRows}
                onRowToggle={onRowToggle}
                rowExpansionTemplate={rowExpansionTemplate}
              >
                <Column
                  header="ชื่อไซต์"
                  headerClassName="p-1 text-sm"
                  className="text-sm text-black"
                  field="site_name"
                  pt={{ headerContent: { className: "flex justify-center" } }}
                />
                <Column
                  field="status"
                  body={(rowData) => {
                    return (
                      <div className="flex justify-center">
                        <img src={rowData.offline === true ? Camerared : Camera} alt="status" className="h-6" />
                      </div>
                    );
                  }}
                  bodyClassName="p-0"
                  header="สถานะ"
                  headerClassName="p-1 text-sm"
                  pt={{ headerContent: { className: "flex justify-center" } }}
                />
                <Column
                  header="ออฟไลน์"
                  headerClassName="p-1 text-sm pl-1"
                  field="quantity"
                  body={(rowData) => {
                    return (
                      <div className="flex justify-center">
                        <div className="border-2 rounded-full border-red-600 text-black text-center flex items-center justify-center text-xs w-6 h-6">
                          {rowData.offlineCount}
                        </div>
                      </div>
                    );
                  }}
                  pt={{ headerContent: { className: "flex justify-center" } }}
                />
                <Column
                  expander
                  header="View"
                  headerClassName="p-1 text-sm"
                  pt={{ headerContent: { className: "flex justify-center" }, bodyCell: { className: "text-center" } }}
                />
              </DataTable>
            </Card>
          </div>
        </div>
        <div className="col-span-1 lg:col-span-3 h-full ">
          <div className="grid grid-cols-2 h-full">
            <div className="flex justify-center items-center">
              <img src={Camera} alt="Camera" className="h-[4vh]" />
              <div className="flex flex-col items-center">
                <label className="text-sm ml-5 ">ทำงาน</label>
                <label className="text-xs ml-5 text-blue-600">{state.online}</label>
              </div>
            </div>
            <div className="flex justify-center items-center">
              <img src={Camerared} alt="Camerared" className="h-[4vh]" />
              <div className="flex flex-col items-center">
                <label className="text-sm ml-5 ">ไม่ทำงาน</label>
                <label className="text-xs ml-5 text-red-600">{state.offline}</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CCTV;
