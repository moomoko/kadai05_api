// Firebase設定
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
  import { update } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";
  import { getDatabase, ref, push, set, onChildAdded, remove, onChildRemoved } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);

  

const apiKey = '';


// HTML要素の取得
const todoList = document.getElementById('todo-list');
const addTaskButton = document.getElementById('add-task-btn');
const taskInput = document.getElementById('task-input');
const challengeContainer = document.getElementById('challenge-container');

const topScreen = document.getElementById('top-screen');
const mainScreen = document.getElementById('main-screen');
const challengeList = document.getElementById('challenge-list');
const footer = document.querySelector('footer');
const momoDai = document.getElementById('momo-dai');
const heartContainer = document.getElementById('heart-container');
const deleteTaskButton = document.getElementById('delete-task-btn'); 
const deleteChallengeButton = document.getElementById('delete-challenge-btn'); 
const weatherSection = document.getElementById('weather-section');
const weatherBtn = document.getElementById('weather-btn'); 
const todoBtn = document.getElementById('todo-btn');

let totalPoints = 0;

footer.style.display = 'none';
    weatherSection.style.display = 'none';

    // 「天気を見る」ボタンが押された時
    weatherBtn.addEventListener('click', function() {
        topScreen.style.display = 'none';  
        weatherSection.style.display = 'block'; 
        mainScreen.style.display = 'none';  
        footer.style.display = 'none';  
    });

    // 「リストを作る」ボタンが押された時
    todoBtn.addEventListener('click', function() {
        topScreen.style.display = 'none';  
        mainScreen.style.display = 'block';  
        weatherSection.style.display = 'none';  
        footer.style.display = 'flex'; 
    });

// 天気情報を取得する関数
async function fetchWeather() {
    const lat = 35.663855411964626;
    const lon = 139.78546870908337;
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ja`);
    const weatherData = await response.json();

    // 天気アイコンコードを取得
    const iconCode = weatherData.weather[0].icon;
    const iconUrl = `http://openweathermap.org/img/wn/${iconCode}.png`;

    // アイコンを表示
    document.getElementById('weather-icon').src = iconUrl;

    // 天気の概要
    const weatherDescription = weatherData.weather[0].description;

    // 気温
    const temperature = weatherData.main.temp;

    // 天気に応じたメッセージを表示
    displayWeatherMessage(weatherDescription, temperature);
}

// 天気に応じたメッセージを表示する関数
function displayWeatherMessage(description, temp) {
    let weatherMessage = ` ${description} だよ。`;
    let customMessage = '';

    if (description.includes('晴')) {
        customMessage = 'お散歩に出かけるのにぴったりだね！';
    } else if (description.includes('雨')) {
        customMessage = '家でリラックスしよう！';
    } else if (description.includes('曇')) {
        customMessage = '少し外の空気を吸ってリフレッシュしよう！';
    } else {
        customMessage = `お天気情報: ${description}`;
    }

    // 天気に関するメッセージをUIに表示
    document.getElementById('weather-message').textContent = weatherMessage;
    document.getElementById('weather-custom-message').textContent = customMessage;
    document.getElementById('weather-temp').textContent = `気温: ${temp}℃`;
}

// ボタンを押した時に天気を取得して表示
document.getElementById('get-weather-btn').addEventListener('click', fetchWeather);

// ページが読み込まれたら天気を取得
window.onload = fetchWeather;

// 背景変更用のセレクタ要素
const backgroundSelector = document.querySelectorAll('.background-option');

// 背景変更の処理
backgroundSelector.forEach(option => {
    option.addEventListener('click', function() {
        const selectedBg = this.dataset.bg;
        document.body.style.backgroundImage = `url('./img/${selectedBg}')`;
    });
});

// ポイントを加算する関数
function updatePoints(points) {
    totalPoints += points;
    document.getElementById('points').textContent = totalPoints;
}


// タスクを追加ボタンをクリックすると、入力フィールドが表示される
addTaskButton.addEventListener('click', function() {
    taskInput.style.display = 'block';  // タスク入力フィールドを表示
    taskInput.focus(); // フォーカスを入力フィールドに
});

// タスクを入力してエンターキーで追加する処理
taskInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const taskText = taskInput.value;
        if (taskText) {
            const tasksRef = ref(database, 'tasks');
            const newTaskRef = push(tasksRef);
            set(newTaskRef, {
                task: taskText,
                completed: false
            });
            taskInput.value = '';  
            taskInput.style.display = 'none';  
        }
    }
});

// Firebaseからタスクを取得して表示
onChildAdded(ref(database, 'tasks'), (snapshot) => {
    const taskData = snapshot.val();
    const taskId = snapshot.key;
    const li = document.createElement('li');
    li.setAttribute('data-id', taskId); 

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = taskData.completed;

    // チェック状態に応じてクラスを追加
    if (taskData.completed) {
        li.classList.add('completed');
    }

    checkbox.addEventListener('change', function() {
        const taskUpdate = {};
        taskUpdate['tasks/' + taskId + '/completed'] = checkbox.checked;
        update(ref(database), taskUpdate);

        // チェックが入っている場合は線を引く
        if (checkbox.checked) {
            li.classList.add('completed');
            checkAllTasksCompleted();
        } else {
            li.classList.remove('completed');
        }
    });

    // タスクのテキスト
    const taskText = document.createElement('span');
    taskText.textContent = taskData.task;

    // リスト要素に追加
    li.appendChild(checkbox);
    li.appendChild(taskText);
    todoList.appendChild(li);
});

// ゴミ箱ボタンがクリックされたときの処理
deleteTaskButton.addEventListener('click', function() {
    const checkedTasks = todoList.querySelectorAll('li.completed'); // 完了済みのタスクを取得
    checkedTasks.forEach(task => {
        const taskId = task.getAttribute('data-id'); // 'data-id' を取得
        remove(ref(database, 'tasks/' + taskId)); // Firebase からタスクを削除
        task.remove(); // UI からタスクを削除
    });
});

// フッターの中央にメッセージを表示する関数
function showFooterMessage(messageText) {
    const footerMessage = document.getElementById('footer-message');
    
    footerMessage.textContent = messageText;

    setTimeout(() => {
        footerMessage.textContent = ''; 
    }, 5000); 
}

// 全タスクが完了した時のメッセージ表示
function checkAllTasksCompleted() {
    let allCompleted = true;
    todoList.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        if (!checkbox.checked) {
            allCompleted = false;
        }
    });
    if (allCompleted) {
        showFooterMessage("お疲れさま！すべてのタスクが完了したよ！すごい！");
        updatePoints(30); // 30ポイント加算
    }
}


// トップ画面のももだいをクリックしてハートを出す機能
momoDai.addEventListener('click', function() {
    createHeart(); // ハートを表示
});

// ハートをランダムに表示する関数
function createHeart() {
    const heart = document.createElement('img');
    heart.src = './img/heart.png';
    heart.classList.add('heart-icon');

    // ランダムな位置にハートを表示
    const xPos = Math.random() * 80 + 10;
    const yPos = Math.random() * 80 + 10;

    heart.style.left = `${xPos}%`;
    heart.style.top = `${yPos}%`;
    heart.style.width = '60px'; 
    heart.style.height = '60px';

    heartContainer.appendChild(heart);

    // 数秒後にハートを消す
    setTimeout(() => {
        heart.remove();
    }, 3000);
}


// チャレンジを選択
document.getElementById('select-challenge-btn').addEventListener('click', function() {
    mainScreen.style.display = 'none'; 
    
    document.getElementById('challenge-selection-screen').style.display = 'block'; // チャレンジ選択画面を表示

    const challengeOptions = [
        'コンビニにいく', 'ゴミを出す', '花を買いに行く', '本を読む',
        'ストレッチをする', 'レシートを捨てる', '朝ご飯を変える', 'ネイルをする', 'お菓子を買いに行く',
        'お布団を洗う', 'お昼寝する', '1本早い電車に乗る'
    ];

    challengeList.innerHTML = ''; 

    challengeOptions.forEach(challenge => {
        const card = document.createElement('div');
        card.textContent = challenge;
        card.classList.add('challenge-card'); // スタイル用のクラス
        card.addEventListener('click', function() {
            // チャレンジが選ばれたときの動作
            challengeContainer.textContent = ''; 
            document.getElementById('challenge-selection-screen').style.display = 'none'; // 選択画面を非表示
            mainScreen.style.display = 'block'; 
            
            // チャレンジを「日替わりチャレンジ」の下に同じ形式で表示
            const challengeLi = document.createElement('li');
            challengeLi.textContent = challenge;
            challengeLi.setAttribute('data-id', challenge); // チャレンジに 'data-id' を設定

            const challengeCheckbox = document.createElement('input');
            challengeCheckbox.type = 'checkbox';
            challengeCheckbox.classList.add('challenge-checkbox');

            // チャレンジのチェック状態に応じてクラスを追加
            challengeCheckbox.addEventListener('change', function() {
                if (challengeCheckbox.checked) {
                    challengeLi.classList.add('completed'); // 完了時にクラス追加（横線引く）
                    showFooterMessage('チャレンジ達成！お疲れさま！');
                    updatePoints(10); // 10ポイント加算
                } else {
                    challengeLi.classList.remove('completed'); // チェック外した時にクラス削除
                }
            });

            // リスト要素に追加
            challengeLi.prepend(challengeCheckbox); // チャレンジにチェックボックスを追加
            challengeContainer.appendChild(challengeLi); // 「日替わりチャレンジ」セクションに追加
        });
        challengeList.appendChild(card);
    });
});

// ゴミ箱ボタンがクリックされたときのチャレンジ削除処理
deleteChallengeButton.addEventListener('click', function() {
    const checkedChallenges = challengeContainer.querySelectorAll('li.completed'); // 完了済みのチャレンジを取得
    checkedChallenges.forEach(challenge => {
        challenge.remove(); // UIから削除
    });
});


// 戻るボタンの動作
document.getElementById('back-to-main').addEventListener('click', function() {
    document.getElementById('challenge-selection-screen').style.display = 'none';
    mainScreen.style.display = 'block';
});