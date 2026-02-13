import React from 'react';
import LoanIntake from './pages/LoanIntake';
import './index.css';
import './styles/components.css';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function App() {

  return <>
  <ToastContainer position="top-right" autoClose={4000} />
  <LoanIntake />;
</>
}

export default App;
