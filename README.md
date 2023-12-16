# Inklink

說明影片: []("")

## 專案簡介


## 開啟流程

### 一、 建立資料庫

#### DB setup(restore)
在 Restore 資料庫之前請先不要連接後端！
1. 在自己的 PostgreSQL 建立一個新的 database，名稱叫做 inklink 
2. 先刪除（Delete）inklink/Schemas/public
3. 點擊 Extensions 右鍵，選擇 "Create"，在 General 的 Name 選擇 pg_trgm，在 Definition 的 Schema 選擇 public
4. 點擊 inklink/Schemas/public 右鍵，並點選 "Restore"
5. 請至此 Google Drive [連結](https://drive.google.com/drive/u/1/folders/10msQt28FuGNneAZSvCrWcrA6wZDx2h4b) 下載 inklink_backup_final.sql，並 Restore 此備份檔
6. 最後按下 "Restore" 這個按鈕就可以成功建立所有 table、index 等等（Restore 時間約 5 - 10 分鐘，如果跳錯請看[下方](###如果點擊"Restore"時跳錯要怎麼解)）

#### 如果點擊 "Restore" 時跳錯要怎麼解

1. 請參考這個[網站](https://dba.stackexchange.com/questions/149169/binary-path-in-the-pgadmin-preferences)
2. 因為 PostgreSQL 有更改過頁面，所以可以參考下方設定，另外，要記得將版本號更改為 16
   <img src="https://i.imgur.com/Wrcy1Bh.png" data-canonical-src="https://i.imgur.com/Wrcy1Bh.png" height="400" />

### 二、 啟動後端

#### Setup

進入 src/Inklink_server 後：
若有用 conda 的話請先 conda deactivate
1. 創建虛擬環境
   - （Windows）：python3 -m venv .venv
   - （MacOS）：python3 -m venv .venv
   - 替代方法（VSCode）：在 VSCode 裡打開 Command Palette，用 Python: Create Environment 選擇 venv，否則 VSCode 可能會找不到對應的 intepreter
2. 進入虛擬環境
   - （Windows）： .venv/Scripts/activate
   - （MacOS）：source .venv/bin/activate
3. 安裝所需套件：pip install -r requirements.txt

#### 連接資料庫

1. 將 src/Inklink_server/app/database.py 中的 URL_DATABASE = 'postgresql://YOUR_POSTGRESQL_USERNAME:YOUR_POSTGRESQL_PASSWORD@localhost:5432/inklink' 的 YOUR_POSTGRESQL_USERNAME 和 YOUR_POSTGRESQL_PASSWORD 分別改成自己的 PostgreSQL 帳號與密碼。（若 PostgreSQL 不是在 port 5432，也請改為自己使用的 port）

#### Run the server

進入 src/Inklink_server 後：

1. 進入虛擬環境
   - （Windows）： .venv/Scripts/activate
   - （MacOS）：source .venv/bin/activate
2. cd app
3. uvicorn main:app --reload
4. uvicorn 會替 FastAPI 開啟 server，接著上 localhost:8000/docs，如果可以看到 APIs 就成功了！

### 三、 啟動前端

### Run the server

1. cd src/Inklink_client
2. yarn/npm install
3. npm run dev
4. 開啟 http://localhost:5173
