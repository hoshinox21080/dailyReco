// schedule.js

// URLからクエリパラメータを取得する関数
function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// URLから年月日を取得
const yearParam = getQueryParam('year');
const monthParam = getQueryParam('month');
const dayParam = getQueryParam('day');
const date = `${yearParam}/${monthParam}/${dayParam}`;

const parsedMonth = parseInt(monthParam, 10);
const displayMonth = isNaN(parsedMonth) ? '' : parsedMonth + 1;

console.log(`年: ${yearParam}, 月: ${displayMonth}, 日: ${dayParam}`);
document.getElementById('scheduleYear').innerHTML = yearParam + '年';
document.getElementById('scheduleDate').innerHTML = `${displayMonth}月 ${dayParam}日`;

// スケジュール送信ボタンの取得
const addButton_schedule = document.getElementById('add_buttonSchedule');
// ボタンがクリックされたときの処理を追加
addButton_schedule.addEventListener('click', function() {
    console.log("スケジュール送信ボタン");

    //タイトル
    const titleInput = document.querySelector('input[name="title"]');
    const title = titleInput.value;

    //終日
    const allDayInput = document.getElementById('allDayInput');
    const allDay = allDayInput.checked ? 1 : 0;

    //時間
    const startInput = document.querySelector('input[name="startTime"]');
    const start = startInput.value;
    const endInput = document.querySelector('input[name="endTime"]');
    const end = endInput.value;

    //色
    const colorInput = document.querySelector('input[name="color"]');
    const color = colorInput.value;

    //メモ
    const memoInput = document.querySelector('textarea[name="memo"]');
    const memo = memoInput.value;

    fetch('/schedule/add_1', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ date: date, title: title, allDay: allDay, start: start, end: end, color: color, memo: memo })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('サーバーエラーが発生しました');
        }
        return response.text(); // レスポンスをテキスト形式で解析
    })
    .then(data => {
        console.log('送信したデータ:', data); // 送信したデータをコンソールに出力
        window.location.reload(); // ページをリロードする
    })
    .catch(error => {
        console.error('エラーが発生しました:', error);
    });
});

// 写真選択ボタンにイベントリスナーを追加
var photoButtons = document.querySelectorAll('.photo_button');
photoButtons.forEach(function(button) {
    button.addEventListener('click', photoButtonClickHandler);
});

// 写真選択ボタンがクリックされたときの処理
function photoButtonClickHandler(event) {
    console.log("photo_buttonがクリックされた");
    var inputFile = this.parentElement.querySelector('.imageInput');
    console.log("ファイル", inputFile);
    inputFile.click(); // ファイル選択ダイアログを表示
}

// 画像ファイルが選択されたときの処理
var imageInputs = document.getElementsByClassName('imageInput');
for (var i = 0; i < imageInputs.length; i++) {
    imageInputs[i].addEventListener('change', function(event) {
        console.log("画像ファイルが選択されました");
        const file = event.target.files[0]; // 選択されたファイルを取得

        // FileReaderオブジェクトを使用して画像ファイルを読み込む
        const reader = new FileReader();
        reader.onload = function(e) {
            // .no_imgクラスを持つ要素を非表示にする
            var noImgElements = document.querySelectorAll('.no_img');
            noImgElements.forEach(function(element) {
                element.style.display = 'none';
            });

            // 読み込んだ画像を背景画像として設定する
            var photoButtons = document.querySelectorAll('.photo_button');
            photoButtons.forEach(function(photoButton) {
                photoButton.style.backgroundImage = `url('${e.target.result}')`;
            });
        };
        reader.readAsDataURL(file); // 画像ファイルを読み込む

        // ここでファイルを確認する
        if (!file.type.startsWith('image/')) {
            alert('選択されたファイルは画像ではありません');
            return;
        }
    });
}

// 日記送信ボタン
const addButton_daily = document.getElementById('add_buttonDaily');
addButton_daily.addEventListener('click', function() {

    // 日記の内容
    const dailyInput = document.querySelector('textarea[name="dailyContent"]');
    const daily = dailyInput.value;

    // 選択された画像ファイルを取得
    const imageFile = document.querySelector('.imageInput').files[0];
    // ファイルが画像形式かどうかを確認する
    if (!imageFile.type.startsWith('image/')) {
        alert('選択されたファイルは画像ではありません');
        return;
    }

    // 画像ファイルをFormDataに追加
    const formData = new FormData();
    formData.append('image', imageFile, imageFile.name);
    const fileName = imageFile.name;

    // 画像ファイルをサーバーにアップロード
    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to upload image');
        }
        return response.json();
    })
    .then(data => {
        // 日記の内容と画像の保存先パスをサーバーに送信
        fetch('/schedule/add_2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ date: date, daily: daily, fileName: fileName })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to send diary data');
            }
            return response.text();
        })
        .then(data => {
            console.log('送信したデータ:', data);
            window.location.reload(); // ページをリロードする
        })
        .catch(error => {
            console.error('エラーが発生しました:', error);
        });
    })
    .catch(error => {
        console.error('画像のアップロードに失敗しました:', error);
    });
});
