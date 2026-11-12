// import { useState } from 'react'
// import heroImg from './assets/hero.png'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'

import { Outlet } from "react-router-dom";
import Header from "./components/layout/Header";

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 justify-center w-full p-5">
        <Outlet />
      </main>
    </div>
  );
}
export default App
