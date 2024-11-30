import random
import numpy as np

class SnakeGame:

    def __init__(self):
        self.screen_width = 400
        self.screen_height = 400
        self.cell_size = 40
        self.ACTION_SPACE = ['up', 'right', 'down', 'left']

    def reset(self):
        self.snake_pos = [[5 * self.cell_size, 3 * self.cell_size],
                          [4 * self.cell_size, 3 * self.cell_size],
                          [3 * self.cell_size, 3 * self.cell_size]]
        self.snake_direction = 'right'
        self.food_pos = self.spawn_food()
        return self.get_simple_state()

    def spawn_food(self):
        while True:
            pos = [random.randrange(0, self.screen_width // self.cell_size) * self.cell_size,
                   random.randrange(0, self.screen_height // self.cell_size) * self.cell_size]
            if pos not in self.snake_pos:
                return pos

    def change_direction(self, direction):
        if direction == 0 and self.snake_direction != 'down':
            self.snake_direction = 'up'
        elif direction == 1 and self.snake_direction != 'left':
            self.snake_direction = 'right'
        elif direction == 2 and self.snake_direction != 'up':
            self.snake_direction = 'down'
        elif direction == 3 and self.snake_direction != 'right':
            self.snake_direction = 'left'

    def update_snake_position(self):
        x, y = self.snake_pos[0]
        if self.snake_direction == 'right':
            x += self.cell_size
        elif self.snake_direction == 'left':
            x -= self.cell_size
        elif self.snake_direction == 'up':
            y -= self.cell_size
        elif self.snake_direction == 'down':
            y += self.cell_size
        self.snake_pos.insert(0, [x, y])

    def is_collision(self):
        head = self.snake_pos[0]
        max_x = self.screen_width - self.cell_size
        max_y = self.screen_height - self.cell_size
        return (head[0] < 0 or head[0] > max_x or
                head[1] < 0 or head[1] > max_y or
                head in self.snake_pos[1:])

    def step(self, action):
        reward = 0
        self.change_direction(action)
        self.update_snake_position()
        done = False

        # 檢查碰撞
        if self.is_collision():
            done = True
            return self.get_simple_state(), reward, done

        if self.snake_pos[0] == self.food_pos:
            self.food_pos = self.spawn_food()
            reward = 10
        else:
            self.snake_pos.pop()

        return self.get_simple_state(), reward, done

    def get_simple_state(self):
        return {
            "snake": self.snake_pos,
            "food": self.food_pos
        }
