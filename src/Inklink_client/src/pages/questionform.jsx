import React, { useState, useEffect } from 'react';

function App() {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const apiUrl = 'http://127.0.0.1:8000/questions/';

  useEffect(() => {
    // 在組件載入時發出 GET 請求以獲取問題列表
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => setQuestions(data))
      .catch((error) => console.error(error));
  }, []);

  const handleQuestionClick = (question) => {
    // 設定選定的問題
    setSelectedQuestion(question);
  };

  return (
    <div>
      <h1>問題列表</h1>
      <ul>
        {questions.map((question) => (
          <li key={question.id} onClick={() => handleQuestionClick(question)}>
            {question.question_text}
          </li>
        ))}
      </ul>

      {selectedQuestion && (
        <div>
          <h2>選定的問題：</h2>
          <p>{selectedQuestion.question_text}</p>
          <h3>回答選項：</h3>
          <ul>
            {selectedQuestion.choices.map((choice) => (
              <li key={choice.id}>
                {choice.choice_text} (正確: {choice.is_correct ? '是' : '否'})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
