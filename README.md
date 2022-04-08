# mark-the-mines

A vanilla JS version of Minesweeper. It was a little slow to load at the highest difficulty level, so I refactored things so that the adjacency calculations happen on the fly instead of all at build time. I also added storing the current difficulty level in localStorage, so that when you come back to (or reload) the page, it doesn't just default to the beginner level every time.

TODO:
1. Adding a timer / best time feature, to be kept in localStorage too?
2. Keep track of the number of games won at each difficulty level / average percentages?
3. Maybe a more dynamic difficulty level chooser than just the three?
4. Accessibility stuff