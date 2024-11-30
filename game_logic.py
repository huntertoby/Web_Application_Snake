# import random
#
#
# class SnakeGame:
#
#     def __init__(self):
#         self.screen_width = 400
#         self.screen_height = 400
#         self.cell_size = 40
#         self.ACTION_SPACE = ['up', 'right', 'down', 'left']
#
#     def reset(self):
#         self.snake_pos = [[5 * self.cell_size, 3 * self.cell_size],
#                           [4 * self.cell_size, 3 * self.cell_size],
#                           [3 * self.cell_size, 3 * self.cell_size]]
#         self.snake_direction = 'right'
#         self.food_pos = self.spawn_food()
#         return self.get_simple_state()
#
#     def spawn_food(self):
#         while True:
#             pos = [random.randrange(0, self.screen_width // self.cell_size) * self.cell_size,
#                    random.randrange(0, self.screen_height // self.cell_size) * self.cell_size]
#             if pos not in self.snake_pos:
#                 return pos
#
#     def get_simple_state(self):
#         return {
#             "snake": self.snake_pos,
#             "food": self.food_pos
#         }