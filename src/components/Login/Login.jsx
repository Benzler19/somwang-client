import React from "react";
import { Button, InputText } from "primereact";
import { AuthConsumer } from "../../role-access/authContext";
import Loading from "../../components/customComponent/loading";
import { motion, AnimatePresence } from "framer-motion";

const Login = () => {
  const [state, setState] = React.useState({
    username: "",
    password: "",
    loading: false,
  });

  return (
    <div>
      {state.loading ? (
        <Loading />
      ) : (
        <AuthConsumer>
          {({ _handleLogin }) => (
            <AnimatePresence mode="wait">
              <motion.form
                key="login-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  _handleLogin(state);
                }}
                className="w-full h-screen bg-no-repeat bg-cover bg-center"
                style={{ backgroundImage: `url("/img/background_somwang.jpg")` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex justify-center items-center min-h-screen backdrop-blur-[1px] opacity-95">
                  <motion.div
                    className="bg-gray-50 rounded-3xl sm:w-[25rem] sm:h-[40rem] opacity-80 shadow-xl"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <div className="sm:p-10">
                      {/* Logo */}
                      <motion.div
                        className="flex justify-center items-center"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                      >
                        <img
                          src="/img/logo_somwang-removebg.png"
                          alt="Logo"
                          className="w-64 sm:w-[25rem] rounded-full -translate-y-10"
                        />
                      </motion.div>

                      {/* Input fields */}
                      <motion.div
                        className="flex flex-col gap-4 -translate-y-16"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                      >
                        <label className="font-semibold">ชื่อผู้ใช้งาน</label>
                        <div className="relative">
                          <i className="pi pi-user absolute translate-y-1.5"></i>
                          <InputText
                            className="h-8 bg-transparent border-b-2 border-slate-500 outline-none w-full pl-6"
                            placeholder="Username"
                            unstyled={true}
                            onChange={(e) =>
                              setState({ ...state, username: e.target.value })
                            }
                          />
                        </div>

                        <label className="font-semibold">รหัสผ่าน</label>
                        <div className="relative">
                          <i className="pi pi-key absolute translate-y-1.5"></i>
                          <input
                            type="password"
                            className="h-8 bg-transparent border-b-2 border-slate-500 outline-none pl-6 w-full
                            "
                            placeholder="Password"
                            onChange={(e) =>
                              setState({ ...state, password: e.target.value })
                            }
                          />
                        </div>
                      </motion.div>

                      {/* Button */}
                      <motion.div
                        className="flex mt-10 -translate-y-16"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                      >
                        <Button
                          label="เข้าสู่ระบบ"
                          type="submit"
                          className="mt-5 m-auto rounded-full w-full h-[2.5rem] border-none"
                          style={{ backgroundColor: "oklch(64.6% 0.222 41.116)" }}
                        />
                      </motion.div>
                    </div>
                  </motion.div> 
                </div>
              </motion.form>
            </AnimatePresence>
          )}
        </AuthConsumer>
      )}
    </div>
  );
};

export default Login;
