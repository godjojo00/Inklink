# 後端
進入 Inklink_server
# Setup
若有用 conda 的話要先 conda deactivate
1. python3 -m venv .venv（但我是在 VSCode 裡用 Python: Create Environment，不然它好像找不到 intepreter）
2. source .venv/bin/activate（Windows：.venv/Scripts/activate）
3. pip install -r requirements.txt

# 建立資料庫
1. 在自己的 PostgreSQL 建立一個新的 database，名稱叫做 inklink
2. 將 app/database.py 中的 URL_DATABASE = 'postgresql://YOUR_POSTGRESQL_USERNAME:YOUR_POSTGRESQL_PASSWORD@localhost:5432/inklink' 的 YOUR_POSTGRESQL_USERNAME 和 YOUR_POSTGRESQL_PASSWORD 分別改成自己的 PostgreSQL 帳號與密碼。

# 開啟後端
1. cd app
2. uvicorn main:app --reload
3. uvicorn 會替 FastAPI 開啟 server，接著上 localhost:8000/docs，如果可以看到 APIs 就成功了！