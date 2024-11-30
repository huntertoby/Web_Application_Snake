from flask import Flask, render_template, request, jsonify, session
from game_logic import SnakeGame
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


@app.route('/start_game', methods=['POST'])
def start_game():
    game = SnakeGame()
    state = game.reset()
    session['game_state'] = {
        "snake": state["snake"],
        "food": state["food"],
        "direction": game.snake_direction
    }
    return jsonify(state=state)

@app.route('/move', methods=['POST'])
def move():
    data = request.get_json()
    action = data['action']
    game_state = session.get('game_state')
    if not game_state:
        return jsonify(error="Game not found"), 400

    game = SnakeGame()
    game.snake_pos = game_state["snake"]
    game.snake_direction = game_state["direction"]
    game.food_pos = game_state["food"]

    state, reward, done = game.step(action)

    session['game_state'] = {
        "snake": state["snake"],
        "food": state["food"],
        "direction": game.snake_direction
    }
    return jsonify(state=state, reward=reward, done=done)

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
