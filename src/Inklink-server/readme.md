1. Fork the repo
2. Go into the repo
```sh
cd Inklink_server
```
3. 創建虛擬環境
```sh
python3 -m venv venv
source venv/bin/activate  # 在 Windows 上使用 venv\Scripts\activate
```
4. 安裝套件
```sh
pip install -r requirements.txt
```
5. 啟動
```sh
uvicorn app.main:app --reload
```
6. Open http://localhost:8000/docs
