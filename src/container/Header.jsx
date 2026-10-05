import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Button } from "primereact";
import "../container/";
function Header(props) {
  const [dateTime, setDateTime] = useState({
    currentDate: "",
    currentTime: "",
  });
  const updateDateTime = () => {
    const now = new Date();
    const currentDate = now.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const currentTime = now.toLocaleTimeString("th-TH", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit", // add seconds if you want
    });
    setDateTime({ currentDate, currentTime });
  };

  useEffect(() => {
    updateDateTime(); // set initial
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  return (
    <div>
      <div className="h-[3.8rem] ml-[0px] xl:ml-[175px] flex flex-wrap justify-between items-center z-[800] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-lg">
        <div className="xl:hidden">
          <button
            onClick={() => {
              props.handleSidebarToggle();
            }}
            className="text-white h-full pi pi-bars bg-slate-900 px-5"
          />
        </div>
        
        {/* Logo */}
        <div className="hidden xl:flex items-center pl-6">
          {/* <img 
            src="/img/somwang_head1.jpg" 
            alt="Somwang Logo" 
            className="h-12 rounded-lg shadow-md object-contain"
          /> */}
        </div>

        {/* Clock and Date Display */}
        <div className="flex items-center gap-6 pr-8">
          <div className="hidden sm:flex items-center gap-4">
            {/* Date */}
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">วันที่</div>
              <div className="text-sm font-bold text-white">
                {dateTime.currentDate}
              </div>
            </div>
            
            {/* Divider */}
            <div className="h-8 w-px bg-gradient-to-b from-slate-600 to-slate-400"></div>
            
            {/* Time */}
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">เวลา</div>
              <div className="text-xl font-mono font-bold text-blue-300">
                {dateTime.currentTime}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Header;
