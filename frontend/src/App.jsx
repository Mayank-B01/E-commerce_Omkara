import {Route, Routes} from 'react-router-dom'
import Homepage from "./pages/Homepage.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Policy from "./pages/Policy.jsx";
import PagenotFound from "./pages/PagenotFound.jsx";

function App() {
  return (
    <>
       <Routes>
           <Route path ='/' element={<Homepage />} />
           <Route path ='/about' element={<About />} />
           <Route path ='/contact' element={<Contact />} />
           <Route path ='/policy' element={<Policy />}/>
           <Route path ='*' element={<PagenotFound />}/>
       </Routes>
    </>
  )
}

export default App
