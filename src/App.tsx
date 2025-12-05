import { BrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar/navbar";
import PagesRoutes from './routes/routes'

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar/>
        <PagesRoutes/>
      </BrowserRouter>
    </>
  )
}

export default App