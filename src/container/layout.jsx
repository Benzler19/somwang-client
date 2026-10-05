import React, { useState } from "react";
import { Header, Content, Sidebar } from "./index";
import { AuthConsumer } from "../role-access/authContext"
const Login = React.lazy(() => import("../components/Login/Login"))

function Layout(props) {
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleSidebarToggle = () => {
      setMobileOpen(!mobileOpen);
    };

    return (
      <AuthConsumer>
        {({ authenticated, user, permissions, _handleLogout }) =>
          authenticated ? (
            <div>
              <Header handleSidebarToggle={handleSidebarToggle} />
              <Sidebar mobileOpen={mobileOpen} handleSidebarToggle={handleSidebarToggle} USER={user} PERMISSIONS={permissions} handleLogout={_handleLogout} />
              <Content USER={user} PERMISSIONS={permissions} handleLogout={_handleLogout} />
            </div>
          ) : (
            <Login />
          )
        }
      </AuthConsumer>
    )
  }

export default Layout;
