import React from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";

import UserComponent from "./views/userComponent";
import UserListComponent from "./views/userListComponent";
import ProjectListComponent from "./views/projectListComponent";
import LoginComponent from "./views/loginComponent";
import SplashComponent from "./views/splashComponent";



const SoraRoutes = () => {
   return(
        <BrowserRouter>
            <Routes>
                <Route path = {"/"} element={<SplashComponent/>}/>
                <Route path = {"/splash"} element={<SplashComponent/>}/>
                <Route path={"/login"} element={<LoginComponent/>}/>
                <Route path={"/registrar"} element={<UserComponent id="new"/>}/>
                <Route path={"/user"} element={<UserListComponent/>}/>
                <Route exact path="/user/:id" element={<UserComponent/>}/>
                <Route path={"/project"} element={<ProjectListComponent/>}/> 
            </Routes>
        </BrowserRouter>
   )
}

export default SoraRoutes;