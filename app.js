import React, { useState } from 'react';
import './App.css';

// --- БАЗА ЗАГОТОВОК ДЛЯ ВОПРОСОВ ---
// Мы берем случайное начало фразы и отправляем его на сервер,
// чтобы узнать, как Google продолжает эту фразу.
const QUESTIONS_DB = {
  culture: [
    "Кто убил", "Почему Гарри Поттер", "В каком году", "Смысл фильма", 
    "Цитаты из", "Как зовут актера", "Почему распались", "Самый популярный"
  ],
  people: [
    "Сколько лет", "Где живет", "Кем работает", "Почему Путин", 
    "Жена", "Муж", "Рост и вес", "Сколько зарабатывает", "Илон Маск"
  ],
  names: [
    "Значение имени", "Имя Иван", "Характер имени", "Тайна имени", 
    "Совместимость имени", "Почему меня назвали", "Имя для кота"
  ],
  questions: [
    "Как правильно", "Почему я", "Зачем нужно", "Что будет если", 
    "Как варить", "Почему нельзя", "Откуда берется", "Как починить"
  ]
};

function App() {
  // --- СОСТОЯНИЕ (STATE) ---
  const [gameState, setGameState] = useState('menu'); // menu, loading, playing, roundover
  // eslint-disable-next-line
  const [category, setCategory] = useState(null);
  const [currentData, setCurrentData] = useState(null);
  const [guesses, setGuesses] = useState([]); // Индексы угаданных ответов
  const [strikes, setStrikes] = useState(0);  // Количество ошибок
  const [score, setScore] = useState(0);      // Общий счет
  const [inputValue, setInputValue] = useState('');
  const [message, setMessage] = useState('');

  // --- ЛОГИКА ---

  // 1. Начало игры: выбор категории и запрос к API
  const startGame = async (catKey) => {
    setCategory(catKey);
    setGameState('loading'); // Включаем анимацию загрузки
    setMessage('Спрашиваем у Google...');

    // Выбираем случайную фразу из списка
    const prefixes = QUESTIONS_DB[catKey];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];

    try {
      // Запрос к нашей Vercel функции (Serverless Function)
      // Мы используем относительный путь, это будет работать и локально (через vercel dev), и на сайте
      const response = await fetch(`/api/feud?q=${encodeURIComponent(randomPrefix)}`);
      
      if (!response.ok) throw new Error('Ошибка сети');
      
      const data = await response.json();

      // Если Google вернул мало ответов, пробуем другую фразу (рекурсия)
      if (!data.answers || data.answers.length < 3) {
        console.log("Мало ответов, ищем другой вопрос...");
        startGame(catKey); 
        return;
      }

      // Успех! Настраиваем игру
      setCurrentData(data);
      setGuesses([]);
      setStrikes(0);
      setInputValue('');
      setMessage('');
      setGameState('playing');
      
    } catch (err) {
      console.error(err);
      setMessage('Ошибка: не удалось загрузить данные. Попробуйте еще раз.');
      setGameState('menu');
    }
  };

  // 2. Обработка ответа игрока
  const handleGuess = (e) => {
    e.preventDefault();
    // Игнорируем пустой ввод или если игра не идет
    if (!inputValue.trim() || gameState !== 'playing') return;

    const userGuess = inputValue.toLowerCase().trim();
    let found = false;
    let newScore = score;
    let newGuesses = [...guesses];

    // Ищем совпадения в ответах
    currentData.answers.forEach((ans, index) => {
      // Проверяем:
      // 1. Входит ли введенное слово в ответ (например "гречку" входит в "как варить гречку")
      // 2. Не был ли этот ответ уже угадан
      if (ans.text.toLowerCase().includes(userGuess) && !guesses.includes(index)) {
        newGuesses.push(index);
        newScore += ans.points;
        found = true;
      }
    });

    if (found) {
      setGuesses(newGuesses);
      setScore(newScore);
      setMessage('В точку! +Очки');
      
      // Проверка: Угаданы ли ВСЕ ответы?
      if (newGuesses.length === currentData.answers.length) {
        setGameState('roundover');
        setMessage('ПОБЕДА! Вы нашли все ответы.');
      }
    } else {
      // Ошибка
      const newStrikes = strikes + 1;
      setStrikes(newStrikes);
      setMessage(`Мимо! (${newStrikes}/3)`);
      
      // Проверка: 3 ошибки?
      if (newStrikes >= 3) {
        setGameState('roundover');
        setMessage('ВЫ ПРОИГРАЛИ РАУНД');
      }
    }
    
    // Очищаем поле ввода
    setInputValue('');
  };

  // --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

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

  // --- ОТРИСОВКА (RENDER) ---
  return (
    <div className="app-container">
      {/* Логотип-кнопка "Домой" */}
      <div className="logo" onClick={() => setGameState('menu')}>
        <span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span> Feud
      </div>
      <div className="subtitle">Русская Версия</div>

      {/* 1. ГЛАВНОЕ МЕНЮ */}
      {gameState === 'menu' && (
        <div className="category-menu">
          {Object.keys(QUESTIONS_DB).map((key) => (
            <div key={key} className="category-card" onClick={() => startGame(key)}>
              <div className="icon">{getCategoryIcon(key)}</div>
              <div>{getCategoryName(key)}</div>
            </div>
          ))}
        </div>
      )}

      {/* 2. ЭКРАН ЗАГРУЗКИ (АНИМАЦИЯ) */}
      {gameState === 'loading' && (
        <div className="game-board">
           <div className="search-box" style={{justifyContent: 'center', color: '#777'}}>
              Загрузка данных...
           </div>
           {/* Эти классы должны быть в App.css */}
           <div className="loading-container">
             <div className="dot"></div>
             <div className="dot"></div>
             <div className="dot"></div>
             <div className="dot"></div>
           </div>
        </div>
      )}

      {/* 3. ИГРОВОЕ ПОЛЕ */}
      {(gameState === 'playing' || gameState === 'roundover') && currentData && (
        <div className="game-board">
          
          {/* Поисковая строка */}
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

          {/* Сообщение о статусе */}
          <div style={{
            color: message.includes('Мимо') || message.includes('ПРОИГРАЛИ') ? '#EA4335' : '#34A853', 
            marginBottom: '10px', 
            height: '20px',
            fontWeight: 'bold'
          }}>
            {message}
          </div>

          {/* Сетка ответов */}
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

          {/* Статистика и Страйки */}
          <div className="game-info">
            <div className="total-score">Счет: {score}</div>
            <div className="strikes">
              {[...Array(3)].map((_, i) => (
                <span key={i} style={{opacity: i < strikes ? 1 : 0.2}}>X</span>
              ))}
            </div>
          </div>

          {/* Кнопка "Дальше" (только если раунд окончен) */}
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
