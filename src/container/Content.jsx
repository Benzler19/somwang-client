import React, { Suspense, createContext } from "react";
import { Route, Switch } from "react-router-dom";
import routes from "../routes";

const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
);
export const userContext = createContext(1);
const TheContent = (props) => {
  const { PERMISSIONS, USER } = props;
  const _generatePermission = (data) =>
    PERMISSIONS.find((item) => item.menu_name_en === data.key) || {
      permission_view: false,
      permission_manage: false,
    };
  return (
    <div className="flex-grow pl-4 pr-4 pt-4 xl:w-[calc(100% - 230px)] xl:ml-[230px]">
      <Suspense fallback={loading}>
        <Switch>
          {routes.map((route, idx) => {
            let PERMISSION = _generatePermission({ key: route.key });
            if (!PERMISSION.permission_view && false) {
              return (
                <Route
                  key={idx}
                  path={route.path}
                  exact={route.exact}
                  name={route.name}
                  render={() => {
                    history.push("/");
                    return null;
                  }}
                />
              );
            }
            return (
              route.component && (
                <Route
                  key={idx}
                  path={route.path}
                  exact={route.exact}
                  name={route.name}
                  render={(props) => (
                    <route.component
                      {...props}
                      SESSION={{ USER, PERMISSION }}
                    />
                  )}
                />
              )
            );
          })}
          {/* <Route component={Page401} /> */}
        </Switch>
      </Suspense>
    </div>
  );
};

export default React.memo(TheContent);
