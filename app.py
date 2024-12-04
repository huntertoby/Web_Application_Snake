from flask import Flask, render_template, request, redirect, url_for, session, jsonify, flash
from flask_session import Session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'your_secret_key'
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
Session(app)
db = SQLAlchemy(app)

# 資料表定義
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)

class Leaderboard(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    score = db.Column(db.Integer, nullable=False)

# 初始化資料庫
@app.before_request
def initialize_db():
    db.create_all()

# 登入頁面
@app.route('/', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password, password):
            session['user_id'] = user.id
            session['user_name'] = user.name
            return redirect(url_for('game'))
        else:
            flash("帳號或密碼錯誤", 'error')
            return render_template('login.html')
    return render_template('login.html')

# 註冊頁面
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form['name']
        username = request.form['username']
        password = generate_password_hash(request.form['password'])
        if User.query.filter_by(username=username).first():
            flash("帳號已存在", 'error')
            return render_template('register.html')
        new_user = User(name=name, username=username, password=password)
        db.session.add(new_user)
        db.session.commit()
        flash("註冊成功，請登入", 'success')
        return redirect(url_for('login'))
    return render_template('register.html')

# 遊戲頁面
@app.route('/game')
def game():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('game.html', player_name=session['user_name'])

# 分數提交
@app.route('/submit_score', methods=['POST'])
def submit_score():
    if 'user_id' not in session:
        return jsonify({"error": "未登入"}), 403

    data = request.get_json()
    score = data['score']

    leaderboard_entry = Leaderboard.query.filter_by(user_id=session['user_id']).first()
    if leaderboard_entry:
        if score > leaderboard_entry.score:
            leaderboard_entry.score = score
    else:
        new_entry = Leaderboard(user_id=session['user_id'], score=score)
        db.session.add(new_entry)
    db.session.commit()

    return jsonify(success=True)

# 獲取排行榜
@app.route('/get_leaderboard')
def get_leaderboard():
    leaderboard_entries = Leaderboard.query.order_by(Leaderboard.score.desc()).limit(10).all()
    leaderboard_list = []
    for entry in leaderboard_entries:
        user = User.query.get(entry.user_id)
        leaderboard_list.append({'name': user.name, 'score': entry.score})

    return jsonify(leaderboard=leaderboard_list)

# 登出
@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True)
