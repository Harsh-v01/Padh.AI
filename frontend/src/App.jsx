import Header from './Components/Header/Header';
import HeadingLayout from './Components/HeadingLayout/HeadingLayout';
import MainLayout from './Components/MainLayout/MainLayout';

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
