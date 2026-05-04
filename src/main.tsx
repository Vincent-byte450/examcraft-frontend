import React from 'react'
import ReactDOM from 'react-dom/client'
import ExamGeneratorPlatform from './components/ExamGeneratorPlatform'
import './index.css'
import { GlobalsProvider } from "./components/Globals";

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <GlobalsProvider>
      <ExamGeneratorPlatform />
    </GlobalsProvider>
  </React.StrictMode>,
)
