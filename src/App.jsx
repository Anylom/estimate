import './App.css';
import { useState } from 'react';

function App() {
    const [file, setFile] = useState(null);
    const [score, setScore] = useState('');
    const [questions, setQuestions] = useState([]);
    
    const FileCheck = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile); // Сохранение выбранного файла в состоянии
            readFileAsObject(selectedFile);
        } else {
            alert('Пожалуйста, выберите файл для загрузки.');
        }   
    };

  function readFileAsObject(file) {
    const reader = new FileReader();
    reader.onload = function() {
        const content = reader.result;
        try {
            const testData = parseContent(content);

            let mistakes = 0;// Переменная для подсчета ошибок
            let count = 0; // Общее число вопросов для проверки работы
            const result = [];

            // Перебор данных
            for (const questionNumber in testData.Test.test_data) {
                const studentAnswer = testData.Test.test_data[questionNumber]?.answ; 
                const correctAnswer = testData.Test.test_answers[questionNumber]?.answ; 
                const questionText = testData.Test.test_data[questionNumber]?.question;

                result.push({ questionText, correctAnswer, studentAnswer });
                count++;

                const StudentAnswerLower = (typeof studentAnswer === 'string') ? studentAnswer.toLowerCase() : '';
                const CorrectAnswerLower = (typeof correctAnswer === 'string') ? correctAnswer.toLowerCase() : '';

                if (StudentAnswerLower !== CorrectAnswerLower) {
                    mistakes++;
                }
            }
            setQuestions(result); 

            const score = Math.ceil((count-mistakes)/count*5);
            setScore("Оценка: " + score);
            // console.log(`Количество ошибок: ${mistakes}/${count}`);
            // console.log(`Оценка: ${score}`);
        } catch (error) {
            console.error('Ошибка при парсинге файла:', error);
            alert('Произошла ошибка при обработке файла. Пожалуйста, проверьте формат.');
        }
    };
    
    reader.onerror = function() {
        console.error('Ошибка при чтении файла:', reader.error);
        alert('Произошла ошибка при чтении файла.');
    };
    
    reader.readAsText(file, 'windows-1251');
}

  function parseContent(content) {
    const lines = content.split('\n');
    const result = {
        Test: {
            test_data: {}, // контейнер для тестовых данных
            test_answers : {} // контейнер для ответов на тест
        }
    };

    let currentQuestionNumber = null; // Переменная для отслеживания номера вопроса
    let isAnswerTest = false; // Переменная для отслеживания, находимся ли мы в секции ответов на тест
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine.toLowerCase().startsWith("answer test")) {
            isAnswerTest = true;
            continue; 
        }
   
        const questionMatch = trimmedLine.match(/(\d+)\.\s*(.+)/);
        const answerMatch = trimmedLine.match(/Answer:\s*(.+)/);
        
        if (questionMatch) {
            currentQuestionNumber = questionMatch[1]; // Получаем номер вопроса
            const questionText = questionMatch[2];

            // Сохраняем вопрос в нужной структуре
            if (!isAnswerTest) {
                // Секция тестовых данных
                result.Test.test_data[currentQuestionNumber] = {
                    question: questionText
                };
            } else {
                // Секция ответов на тест
                result.Test.test_answers[currentQuestionNumber] = {
                    question: questionText
                };
            }
        }

        if (answerMatch && currentQuestionNumber) {
            const answer = answerMatch[1];

            if (!isAnswerTest) {
                if (result.Test.test_data[currentQuestionNumber]) {
                    result.Test.test_data[currentQuestionNumber].answ = answer; 
                }
            } else {
                if (result.Test.test_answers[currentQuestionNumber]) {
                    result.Test.test_answers[currentQuestionNumber].answ = answer; 
                }
            }
        }
    }

    return result;
}

  return (
    <>
        <label htmlFor="txt">Загрузите файл  </label>
        <input type="file" id="txt" accept=".txt, .doc" onChange={FileCheck} />
        <div>
            {questions.map(({ questionText, correctAnswer, studentAnswer }, index) => (
                <div key={index}>
                    <p>{index+1} . {questionText}</p>
                    <p>Правильный ответ: {correctAnswer || 'Не указан'}</p>
                    <p>Ваш ответ: {studentAnswer || 'Не указан'}</p>
                </div>
            ))}
        </div>
        <div>{score}</div>
    </>
  );
}

export default App;