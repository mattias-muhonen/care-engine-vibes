import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navigation from "@/components/Navigation"
import Home from "@/pages/Home"
import About from "@/pages/About"
import Components from "@/pages/Components"

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/components" element={<Components />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
