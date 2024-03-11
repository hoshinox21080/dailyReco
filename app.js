const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const multer  = require('multer');
const path = require('path');
const bodyParser = require('body-parser');

const router = express.Router();
const db = new sqlite3.Database('schedule_data.db');

const app = express();
const port = 3001;
let renderData = {};

// ファイルのアップロード先のディレクトリを指定
const uploadDir = path.join(__dirname, 'public', 'images');

// 静的ファイルの提供設定
app.use(express.static(path.join(__dirname, 'public')));

// body-parserの設定
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// キャッシュを無効化するミドルウェアを追加
app.use((req, res, next) => {
    // キャッシュを無効化する
    res.setHeader('Cache-Control', 'no-store');

    // 次のミドルウェアへ処理を渡す
    next();
});

// 静的ファイルの提供設定
app.use(express.static(path.join(__dirname, 'public')));

// EJSを使ってデータをHTMLにレンダリング
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/schedule', (req, res) => {
    const yearParam = req.query.year;
    const monthParam = req.query.month;
    const dayParam = req.query.day;
    const dateParam = `${yearParam}/${monthParam}/${dayParam}`;
    const dailyEmpty = 1;

    // スケジュールの取得
    db.all('SELECT * FROM schedule_content WHERE date = ?', [dateParam], (err, scheduleRows) => {
        if (err) {
            console.error('スケジュールの取得に失敗しました:', err);
            res.status(500).send('スケジュールの取得に失敗しました');
            return;
        }

        // 日記の取得
        db.all('SELECT * FROM daily_content WHERE date = ?', [dateParam], (err, dailyRows) => {
            if (err) {
                console.error('日記の取得に失敗しました:', err);
                res.status(500).send('日記の取得に失敗しました');
                return;
            }

            // 日記が存在するかどうかを判定し、isDiaryEmptyを設定する
            const isDiaryEmpty = dailyRows.length === 0;
            if(isDiaryEmpty){
                console.log("日記データなし");
            }else{
                console.log("日記データあり");
            }

            // スケジュールと日記をまとめてレンダリングする
            const renderData = {
                scheduleRows: scheduleRows,
                dailyRows: dailyRows,
                isDiaryEmpty: isDiaryEmpty  // 日記が空かどうかを示すフラグ
            };

            res.render('schedule', renderData);
        });
    });
});

app.get('/', (req, res) => {
    res.render('index');
});

router.post('/schedule/add_1', (req, res) => {
    const { date, title, allDay, start, end, color, memo } = req.body;

    db.run('INSERT INTO schedule_content (date, title, allDay, timeStart, timeEnd, color, memo) VALUES (?, ?, ?, ?, ?, ?, ?)', [date, title, allDay, start, end, color, memo], function(err) {
        if (err) {
            console.error('データの挿入に失敗しました:', err);
            res.status(500).send('データの挿入に失敗しました');
        } else {
            // レスポンス
            res.status(200).send('データが正常に挿入されました');
        }
    });
});

router.post('/schedule/add_2', (req, res) => {
    const { date, fileName, daily } = req.body;

    db.run('INSERT INTO daily_content (date, image, daily) VALUES (?, ?, ?)', [date, fileName, daily], function(err) {
        if (err) {
            console.error('データの挿入に失敗しました:', err);
            res.status(500).send('データの挿入に失敗しました');
        } else {
            // レスポンス
            res.status(200).send('データが正常に挿入されました');
        }
    });
});

app.use('/', router);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // 保存先ディレクトリを指定
    },
    filename: function (req, file, cb) {
        console.log(file.originalname);
        const ext = path.extname(file.originalname); // ファイルの拡張子を取得
        const fileName = file.originalname.replace(/\s+/g, ''); // 空白を除去
        cb(null, fileName); // 元のファイル名を使って保存
    }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('image'), (req, res) => {
    // アップロードされたファイルの情報はreq.fileに格納されています
    const imagePath = req.file.path; // 保存された画像のパス
    console.log('サーバーで画像がアップロードされました:', imagePath);

    // 画像の保存先パスをクライアントに返す
    res.json({ imagePath: imagePath });
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
