import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import BookExchange from './pages/bookexchange'; // 請確保路徑是正確的
import Home from './pages/Home'; // 請替換路徑為您的 Home 組件的正確路徑
import IdVerify from './pages/IdVerify';
import QuestionForm from './pages/questionform';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route>
            <Route element={<IdVerify/>} path='/Id' />
            <Route element={<Home/>} path="/" exact />
            <Route element={<BookExchange/>} path="/book-exchange" />
            <Route element={<QuestionForm/>} path='/questionform' />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
