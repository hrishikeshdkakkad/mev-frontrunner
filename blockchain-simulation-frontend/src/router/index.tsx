import React from "react";
import { Route, Routes } from "react-router-dom";
import SocketEvents from "../App";


export function Router() {
  return (
    <Routes>
      <Route path="/" element={<SocketEvents />} />
    </Routes>
  );
}
