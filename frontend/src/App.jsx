import { useState } from 'react';

import Header from './Components/Header/Header';
import HeadingLayout from './Components/HeadingLayout/HeadingLayout';
import MainLayout from './Components/MainLayout/MainLayout';
import Footer from './Components/Footer/Footer';

import SummaryPage from './pages/SummaryPage';
import RecommendedPage from './pages/RecommendedPage';
import QuizPage from './pages/QuizPage';
import AssistantPage from './pages/AssistantPage';

function App() {
  const [currentView, setCurrentView] = useState('home');

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const handleBack = () => {
    setCurrentView('home');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <>
            <HeadingLayout />
            <MainLayout onNavigate={handleNavigate} />
            <Footer />
          </>
        );

      case 'summary':
        return <SummaryPage onBack={handleBack} />;

      case 'recommended':
        return <RecommendedPage onBack={handleBack} />;

      case 'quiz':
        return <QuizPage onBack={handleBack} />;

      case 'assistant':
        return <AssistantPage onBack={handleBack} />;

      default:
        return (
          <>
            <HeadingLayout />
            <MainLayout onNavigate={handleNavigate} />
            <Footer />
          </>
        );
    }
  };

  return (
    <>
      <Header
        onNavigate={handleNavigate}
        currentView={currentView}
      />

      {renderContent()}
    </>
  );
}

export default App;