import './App.css';

function App() {

  const FileCheck = () => {
    const fileInput = document.getElementById('txt');
    const file = fileInput.files[0];
    
    if (file) {
      readFileAsObject(file);
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
            // console.log(JSON.stringify(testData, null, 2)); 

            let mistakes = 0;// Переменная для подсчета ошибок
            let count = 0; // Общее число вопросов для проверки работы

            // Перебор тестовых данных
            for (const questionNumber in testData.Тест.Тестовые_данные) {
                const studentAnswer = testData.Тест.Тестовые_данные[questionNumber].ответ; // Ответ студента
                const correctAnswer = testData.Тест.Ответы_на_тест[questionNumber].ответ; // Правильный ответ
                
                const StudentAnswerLower = typeof studentAnswer === 'string' ? studentAnswer.toLowerCase() : '';
                const CorrectAnswerLower = typeof correctAnswer === 'string' ? correctAnswer.toLowerCase() : '';
                count +=1;

                // Сравнение ответов
                if (StudentAnswerLower !== CorrectAnswerLower) {
                    mistakes += 1; 
                }
            }
            const score = Math.ceil((count-mistakes)/count*5);
            document.getElementById("score").innerHTML = "Оценка: " + score;
            console.log(`Количество ошибок: ${mistakes}/${count}`);
            console.log(`Оценка: ${score}`);
        } catch (error) {
            console.error('Ошибка при парсинге файла:', error);
            alert('Произошла ошибка при обработке файла. Пожалуйста, проверьте формат.');
        }
    };
    
    reader.onerror = function() {
        console.error('Ошибка при чтении файла:', reader.error);
        alert('Произошла ошибка при чтении файла.');
    };
    
    reader.readAsText(file);
}

  function parseContent(content) {
    const lines = content.split('\n');
    const result = {
        Тест: {
            Тестовые_данные: {}, // контейнер для тестовых данных
            Ответы_на_тест: {} // контейнер для ответов на тест
        }
    };

    let currentQuestionNumber = null; // Переменная для отслеживания номера вопроса
    let isAnswerTest = false; // Переменная для отслеживания, находимся ли мы в секции ответов на тест
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        // console.log(trimmedLine); // Для отладки

        
        if (trimmedLine.toLowerCase().startsWith("answer test")) {
            isAnswerTest = true;
            continue; 
        }
   
        const questionMatch = trimmedLine.match(/(\d+)\.\s*(.+)/);
        const answerMatch = trimmedLine.match(/Answer:\s*(\w)/);
        
        if (questionMatch) {
            currentQuestionNumber = questionMatch[1]; // Получаем номер вопроса
            const questionText = questionMatch[2];

            // Сохраняем вопрос в нужной структуре
            if (!isAnswerTest) {
                // Секция тестовых данных
                result.Тест.Тестовые_данные[currentQuestionNumber] = {
                    вопрос: questionText
                };
            } else {
                // Секция ответов на тест
                result.Тест.Ответы_на_тест[currentQuestionNumber] = {
                    вопрос: questionText
                };
            }
        }

        if (answerMatch && currentQuestionNumber) {
            const answer = answerMatch[1];

            if (!isAnswerTest) {
                if (result.Тест.Тестовые_данные[currentQuestionNumber]) {
                    result.Тест.Тестовые_данные[currentQuestionNumber].ответ = answer; 
                }
            } else {
                if (result.Тест.Ответы_на_тест[currentQuestionNumber]) {
                    result.Тест.Ответы_на_тест[currentQuestionNumber].ответ = answer; 
                }
            }
        }
    }

    return result;
}

  return (
    <>
      <label htmlFor="txt">Загрузите файл</label>
      <input type="file" id="txt" accept=".txt, .doc" />

      <button onClick={FileCheck}>Проверить</button>
      <div id="score"></div>
    </>
  );
}

export default App;

