import React, { useState, useEffect } from 'react';
import './App.css';

// --- БАЗА ДАННЫХ ВОПРОСОВ (Имитация Google API) ---
const database = {
  culture: [
    {
      prefix: "Почему Гарри Поттер",
      answers: [
        { text: "не умер", points: 9000 },
        { text: "выжил", points: 8000 },
        { text: "сломал палочку", points: 7000 },
        { text: "назвал сына альбус", points: 6000 },
        { text: "богат", points: 5000 },
        { text: "избранный", points: 4000 },
      ]
    },
    {
      prefix: "Кто убил",
      answers: [
        { text: "лору палмер", points: 9000 },
        { text: "пушкина", points: 8000 },
        { text: "кеннеди", points: 7000 },
        { text: "муфасу", points: 6000 },
        { text: "каина", points: 5000 },
      ]
    }
  ],
  people: [
    {
      prefix: "Илон Маск",
      answers: [
        { text: "состояние", points: 10000 },
        { text: "жена", points: 9000 },
        { text: "дети", points: 8000 },
        { text: "твиттер", points: 7000 },
        { text: "ракета", points: 6000 },
        { text: "возраст", points: 5000 },
      ]
    },
    {
      prefix: "Почему Пушкин",
      answers: [
        { text: "наше все", points: 9000 },
        { text: "умер", points: 8000 },
        { text: "стрелялся", points: 7000 },
        { text: "негр", points: 6000 },
        { text: "гений", points: 5000 },
      ]
    }
  ],
  questions: [
    {
      prefix: "Как варить",
      answers: [
        { text: "гречку", points: 10000 },
        { text: "рис", points: 9000 },
        { text: "яйца всмятку", points: 8000 },
        { text: "пельмени", points: 7000 },
        { text: "макароны", points: 6000 },
        { text: "борщ", points: 5000 },
      ]
    },
    {
      prefix: "Почему я такой",
      answers: [
        { text: "дурак", points: 10000 },
        { text: "ленивый", points: 9000 },
        { text: "урод", points: 8000 },
        { text: "злой", points: 7000 },
        { text: "умный", points: 6000 },
      ]
    }
  ],
  names: [
    {
      prefix: "Имя Иван означает",
      answers: [
        { text: "помилованный богом", points: 9000 },
        { text: "русский", points: 8000 },
        { text: "дурак", points: 5000 },
        { text: "царевич", points: 4000 },
      ]
    },
    {
      prefix: "Характеристика имени",
      answers: [
        { text: "александр", points: 10000 },
        { text: "анастасия", points: 9000 },
        { text: "дмитрий", points: 8000 },
        { text: "елена", points: 7000 },
      ]
    }
  ]
};

// --- КОМПОНЕНТЫ ---

function App() {
  const [gameState, setGameState] = useState('menu'); // menu, playing, roundover
  const [category, setCategory] = useState(null);
  const [currentData, setCurrentData] = useState(null);
  const [guesses, setGuesses] = useState([]); // Индексы угаданных
  const [strikes, setStrikes] = useState(0);
  const [score, setScore] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [message, setMessage] = useState('');

  // Начать игру в категории
  const startGame = (catKey) => {
    const questions = database[catKey];
    const randomQ = questions[Math.floor(Math.random() * questions.length)];
    
    setCategory(catKey);
    setCurrentData(randomQ);
    setGameState('playing');
    setGuesses([]);
    setStrikes(0);
    setInputValue('');
    setMessage('');
  };

  // Обработка ввода
  const handleGuess = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || gameState !== 'playing') return;

    const userGuess = inputValue.toLowerCase().trim();
    let found = false;

    // Проверяем, есть ли ответ в списке
    currentData.answers.forEach((ans, index) => {
      // Упрощенная проверка (входит ли введенное слово в ответ)
      if (ans.text.includes(userGuess) && !guesses.includes(index)) {
        setGuesses([...guesses, index]);
        setScore(score + ans.points);
        found = true;
      }
    });

    if (!found) {
      const newStrikes = strikes + 1;
      setStrikes(newStrikes);
      setMessage(`Нет такого варианта! (${newStrikes}/3)`);
      if (newStrikes >= 3) {
        setGameState('roundover');
        setMessage('Вы проиграли раунд! Попробуйте снова.');
      }
    } else {
      setMessage('В точку!');
      // Проверка на полную победу в раунде
      const newGuesses = [...guesses]; // (здесь state еще не обновился, нужна логика сложнее, но для простоты оставим так)
      if (newGuesses.length + 1 >= currentData.answers.length) { // +1 для текущего
         setGameState('roundover');
         setMessage('Раунд пройден! Все ответы найдены.');
      }
    }
    
    setInputValue('');
  };

  const getCategoryIcon = (cat) => {
    switch(cat) {
      case 'culture': return '🎬';
      case 'people': return '👤';
      case 'names': return '🏷️';
      case 'questions': return '❓';
      default: return '🎲';
    }
  };

  const getCategoryName = (cat) => {
    switch(cat) {
      case 'culture': return 'Культура';
      case 'people': return 'Люди';
      case 'names': return 'Имена';
      case 'questions': return 'Вопросы';
      default: return 'Разное';
    }
  };

  return (
    <div className="app-container">
      <div className="logo" onClick={() => setGameState('menu')}>
        <span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span> Feud
      </div>
      <div className="subtitle">Русская Версия</div>

      {/* МЕНЮ ВЫБОРА */}
      {gameState === 'menu' && (
        <div className="category-menu">
          {Object.keys(database).map((key) => (
            <div key={key} className="category-card" onClick={() => startGame(key)}>
              <div className="icon">{getCategoryIcon(key)}</div>
              <div>{getCategoryName(key)}</div>
            </div>
          ))}
        </div>
      )}

      {/* ИГРОВОЙ ПРОЦЕСС */}
      {(gameState === 'playing' || gameState === 'roundover') && currentData && (
        <div className="game-board">
          
          <form className="search-box" onSubmit={handleGuess}>
            <span className="prefix">{currentData.prefix}</span>
            <input 
              autoFocus
              className="guess-input"
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="..."
              disabled={gameState === 'roundover'}
            />
            <span style={{color:'#999'}}>🔍</span>
          </form>

          <div style={{color: message.includes('Нет') ? 'red' : 'green', marginBottom: '10px', height: '20px'}}>
            {message}
          </div>

          <div className="answers-grid">
            {currentData.answers.map((ans, index) => {
              const isRevealed = guesses.includes(index) || gameState === 'roundover';
              return (
                <div key={index} className={`answer-card ${isRevealed ? '' : 'hidden'}`}>
                  {isRevealed && (
                    <>
                      <span>{ans.text}</span>
                      <span className="score-badge">{ans.points}</span>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div className="game-info">
            <div className="total-score">Счет: {score}</div>
            <div className="strikes">
              {[...Array(3)].map((_, i) => (
                <span key={i} style={{opacity: i < strikes ? 1 : 0.2}}>X</span>
              ))}
            </div>
          </div>

          {gameState === 'roundover' && (
            <button className="next-btn" onClick={() => setGameState('menu')}>
              Выбрать новую категорию
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
