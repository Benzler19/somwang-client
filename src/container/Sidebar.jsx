import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import accessMenu from "./menu"
import { Button } from "primereact/button"
import { useHistory } from "react-router-dom"

function Sidebar(props) {
  const [menu, setMenu] = useState([])
  const { menuItems, menuprojectItems } = accessMenu({ PERMISSIONS: props.PERMISSIONS });
  const [openDashboard, setOpenDashboard] = useState(false)
  const history = useHistory()

  useEffect(() => {
    const fetchData = () => {
      setMenu(accessMenu({ PERMISSIONS: props.PERMISSIONS }))
    }
    fetchData() 
  }, [])

  const logout = async () => {
    localStorage.clear()
    window.location.reload()
  }
  useEffect(() => {}, [props.mobileOpen])
  const Sidebar = `
      z-[10] fixed  h-screen bg-[#F8F8FF] w-[230px]  ease-in-out duration-300 xl:duration-50 xl:-translate-x-0  overflow-auto top-0 bottom-0${
        props.mobileOpen ? "-translate-x-0" : " -translate-x-full"
      }`

  const drawer = (
    <div className="flex flex-col justify-center mt-4">
      {menuItems?.map((item, idx) => (
        <div
          key={idx}
          className="flex flex-col justify-center m-auto py-2 w-full hover:bg-blue-400 cursor-pointer hover:font-bold"
          onClick={() => {
            history.push(item.to)
          }}
        >
          <div className="flex justify-start items-center px-2 gap-4 ml-4 font-normal">
            <i className={`text-black ${item.icon}`}></i>
            <label className=" text-center cursor-pointer text-black text-lg">{item.name}</label>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className={Sidebar}>
      <div className="relative h-full">
        {props.mobileOpen ? (
          <div
            className="fixed inset-0  ml-[230px] w-screen flex items-center bg-black justify-center  bg-opacity-50 "
            onClick={props.handleSidebarToggle}
          ></div>
        ) : (
          ""
        )}
        <Link to="/">
          <div className="flex w-full lg:h-20 sm:h-12 rounded-none justify-center items-center text-black box-border border-b-2">
            <img src="/img/logo_somwang-removebg.png" alt="Menu" className="h-12 sm:h-14 lg:h-16 xl:h-20 object-contain" />
          </div>
        </Link>

        <div>
          <div>{drawer}</div>
          <div className="absolute bottom-10 px-10 text-black">
            <button className="w-full h-full flex items-center justify-center " onClick={logout}>
              <label className="text-base font-normal cursor-pointer">ออกจากระบบ</label>
              <i className="pi pi-sign-out ml-2"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
