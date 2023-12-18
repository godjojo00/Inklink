# Inklink

展示影片: []("")

## 專案簡介
「InkLink」是一個二手書交易平台，旨在創造一個書籍流通的社群空間。用戶可出售、交換、購買書籍，並能記錄所擁有的書籍數量，確保交易順利。除一般用戶外，管理員可分析請求與優化系統。平台注重使用者間的互動與評價，但不涉及付款與交貨。

## 開啟流程

### 一、 建立資料庫

#### DB setup(restore)
在 Restore 資料庫之前請先不要連接後端！
1. 在自己的 PostgreSQL 建立一個新的 database，名稱叫做 inklink 
2. 在 inklink/Schemas/public 內執行 `Create Extension pg_trgm;`，重整後會在 inklink/Extensions 看到 pg_trgm
3. 點擊 inklink/Schemas/public 右鍵，並點選 "Restore"
4. 點擊 filename 右方資料夾，找到此資料夾，選擇 data/inklink_backup_final.sql
5. 最後按下 "Restore" 這個按鈕就可以成功建立所有 table、index 等等（Restore 時間約 5 - 10 分鐘，如果跳錯請看[下方](###如果點擊"Restore"時跳錯要怎麼解)）

#### 如果點擊"Restore"時跳錯要怎麼解

1. 請參考這個[網站](https://dba.stackexchange.com/questions/149169/binary-path-in-the-pgadmin-preferences)
2. 因為 PostgreSQL 有更改過頁面，所以可以參考下方設定，另外，要記得將版本號更改為 16
   <img src="https://i.imgur.com/Wrcy1Bh.png" data-canonical-src="https://i.imgur.com/Wrcy1Bh.png" height="400" />

### 二、 啟動後端

#### Setup

`cd src/Inklink_server` 後：
若有用 conda 的話請先 `conda deactivate`
1. 創建虛擬環境
    ```sh
    python3 -m venv .venv
    ```
   - 替代方法（VSCode）：在 VSCode 裡打開 Command Palette，用 Python: Create Environment 選擇 venv，否則 VSCode 可能會找不到對應的 intepreter
2. 進入虛擬環境
   - （Windows）：
     ```sh
     .venv/Scripts/activate
     ```
   - （MacOS）：
     ```sh
     source .venv/bin/activate
     ```
3. 安裝所需套件
   ```sh
   pip install -r requirements.txt
   ```

#### 連接資料庫

1. 將 src/Inklink_server/app/database.py 中的
   ```python
   URL_DATABASE = 'postgresql://YOUR_POSTGRESQL_USERNAME:YOUR_POSTGRESQL_PASSWORD@localhost:5432/inklink'
   ```
    的 `YOUR_POSTGRESQL_USERNAME` 和 `YOUR_POSTGRESQL_PASSWORD` 分別改成自己的 PostgreSQL 帳號與密碼。（若 PostgreSQL 不是在 port 5432，也請改為自己使用的 port）

#### Run the server

進入 src/Inklink_server 與虛擬環境後：

1. ```sh
   cd app
   ```
2. 用 uvicorn 替 FastAPI 開啟 server
   ```sh
   uvicorn main:app --reload
   ```
4. 接著上 http://localhost:8000/docs ，如果可以看到 APIs 就成功了！

### 三、 啟動前端

### Run the server

1. 再開一個 terminal
2. ```sh
   cd src/Inklink_client
   ```
3. 安裝 dependencies，下面指令二擇一執行即可
   ```sh
   yarn install
   ```
   ```sh
   npm install
   ```
4. 開啟 server
   ```sh
   npm run dev
   ```
5. 開啟 http://localhost:5173 （建議使用 Google Chrome），就可以使用網站啦！

## 簡短示例
### User
Username: changlei  
Password: *g$V#&xWTed3E8q
1. 註冊、登入：以上述帳密（或是以自己註冊的新帳號，或至資料庫查詢）登入系統
2. 搜尋出售、交換請求：至 Search Requests 頁面（主頁）搜尋、瀏覽其他使用者發布且仍開放的出售與交換請求
3. 搜尋書籍：至 Search Books 頁面搜尋本系統所有的書籍（因資料量龐大，有些搜尋可能會花上十多秒，如果還是卡住，可以參考 [issues/72](https://github.com/godjojo00/Inklink/issues/72) ）
4. 新增、修改自己擁有的書籍：至 My Books 頁面新增（或修改）自己擁有的書籍（僅能新增本系統已記載的書籍）
5. 發布出售、交換請求：至 Post Requests 頁面發布出售或交換請求（請求內的各書本數量不得超過 My Books 中自己所擁有的，且發布後 My Books 會扣除相對應的書本數量）
6. 查看自己曾發布的請求：至 My Requests 確認自己曾發布的所有請求
7. 購買出售請求：至 Search Requests 頁面選擇並購買一則出售請求（點選 Detail 後點選 Confirm Purchase。成功後可以至 My Books 確認已自動增加購買的書籍）
8. 查看自己曾購買的出售請求：至 Purchase Record 頁面查看自己曾購買的出售請求
9. 評分、查詢使用者評分：至 Rating 頁面針對自己參與的出售或交換請求評分，也可以查詢其他使用者的平均評分
10. 提出交換提案：至 Search Requests 頁面選擇向一則交換請求提出交換提案（點選 Detail、輸入交換書籍後，點選 Confirm Purchase。My Books 也會扣除相對應的書本數量）
   註：一位使用者在一則交換請求中僅能提出一則交換提案
11. 查看自己的交換提案：至 My Responses 頁面查看自己曾提出的交換提案

接著，可以切換到不同帳號測試確認交換提案的功能
1. 登出原帳號，以上述第 10 點的交換請求發布者帳號登入（帳號密碼可至資料庫查詢）
2. 在 My Requests 頁面或 Search Requests 頁面選擇該交換請求，選擇想要的提案（點選 Detail 後點選欲選擇的提案對應的 Confirm Exchange）

### Admin
Username: admin  
Password: dbmsfinal

以下僅列出管理員獨有的功能
1. 分析出售請求：至 Analyze Sells 頁面輸入書籍與出售請求的篩選條件，查看目標書籍在篩選後的出售請求中售出多少本，該請求平均售價為何
2. 分析交換請求：至 Analyze Exchanges 頁面輸入書籍與交換請求的篩選條件，查看目標書籍在篩選後的交換請求中交換了多少本
3. 新增書籍至資料庫：至 Add Books 頁面輸入書籍相關資訊，將書籍資料新增至系統
4. 查看已成功或已刪除的所有請求
