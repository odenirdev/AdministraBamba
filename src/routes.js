import React, { useContext } from "react";

import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Boards from "./pages/Boards";
import Board from "./pages/Board";
import School from "./pages/School";
import RegisterSchool from "./pages/RegisterSchool";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import AuthContext from "./components/AuthContext";

const Authenticated = ({ component: Component, ...rest }) => {
    const { auth } = useContext(AuthContext);

    return (
        <Route
            {...rest}
            render={(props) =>
                auth.isAuthenticated ? (
                    <Component {...props} />
                ) : (
                    <Redirect
                        to={{
                            pathname: "/auth",
                            state: { from: props.location },
                        }}
                    />
                )
            }
        />
    );
};

const Index = () => {
    return (
        <BrowserRouter>
            <Switch>
                <Route exact path="/register" component={Register} />
                <Route
                    exact
                    path="/forgot-password"
                    component={ForgotPassword}
                />
                <Route exact path="/reset-password" component={ResetPassword} />
                <Authenticated exact path="/" component={Home} />
                <Route exact path="/auth" component={Login} />
                <Authenticated exact path="/boards" component={Boards} />
                <Authenticated exact path="/board/:id" component={Board} />
                <Authenticated exact path="/school" component={School} />
                <Authenticated
                    exact
                    path="/register-school"
                    component={RegisterSchool}
                />
            </Switch>
        </BrowserRouter>
    );
};

export default Index;
