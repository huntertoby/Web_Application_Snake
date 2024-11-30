from flask import Flask, render_template, request, jsonify, session
from flask_session import Session

app = Flask(__name__)
app.secret_key = 'your_secret_key'
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

leaderboard = {}


@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        player_name = request.form['player_name']
        session['player_name'] = player_name
        return render_template('game.html', player_name=player_name)
    return render_template('index.html')





@app.route('/submit_score', methods=['POST'])
def submit_score():
    data = request.get_json()
    name = data['name']
    score = data['score']

    if name in leaderboard:
        if score > leaderboard[name]:
            leaderboard[name] = score
    else:
        leaderboard[name] = score

    return jsonify(success=True)


@app.route('/get_leaderboard')
def get_leaderboard():
    sorted_leaderboard = sorted(leaderboard.items(), key=lambda x: x[1], reverse=True)
    leaderboard_list = [{'name': name, 'score': score} for name, score in sorted_leaderboard]
    return jsonify(leaderboard=leaderboard_list)


if __name__ == '__main__':
    app.run(debug=True)