import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Summary from './pages/Summary';
import Quiz from './pages/Quiz';
import Assistant from './pages/Assistant';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/summary" element={<Summary />} />
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/assistant" element={<Assistant />} />
    </Routes>
  );
}

export default App
