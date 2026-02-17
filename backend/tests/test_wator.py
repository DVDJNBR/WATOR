import pytest
from app.wator import WatorSimulation, Fish, Shark

def test_initialization():
    sim = WatorSimulation(width=10, height=10, num_fish=5, num_sharks=5)
    state = sim.get_state()
    fish_count = sum(row.count("fish") for row in state)
    shark_count = sum(row.count("shark") for row in state)
    assert fish_count == 5
    assert shark_count == 5

def test_fish_movement():
    sim = WatorSimulation(width=10, height=10, num_fish=1, num_sharks=0)
    # Find fish
    start_pos = None
    for y in range(10):
        for x in range(10):
            if isinstance(sim.grid[y][x], Fish):
                start_pos = (x, y)
                break

    sim.step()

    # Check if fish moved (it should unless trapped, which is impossible with 1 fish)
    new_pos = None
    for y in range(10):
        for x in range(10):
            if isinstance(sim.grid[y][x], Fish):
                new_pos = (x, y)
                break

    # It might have moved or stayed (if random choice was valid but blocked? No, empty neighbors ensures move)
    # Since grid is empty, it MUST move.
    assert new_pos is not None
    # Note: It's theoretically possible it moved back to start if it reproduced?
    # But reproduction takes time. Age starts at 0.
    assert start_pos != new_pos

def test_shark_eating():
    sim = WatorSimulation(width=3, height=1, num_fish=0, num_sharks=0)
    # Force placement: Shark at 0, Fish at 1
    sim.grid[0][0] = Shark(breed_time=10, starve_time=5)
    sim.grid[0][1] = Fish(breed_time=10)

    sim.step()

    # Shark should eat fish at (1,0)
    # Shark moves to (1,0)
    assert isinstance(sim.grid[0][1], Shark)
    assert sim.grid[0][0] is None # Old spot empty
    # Check energy reset (default 5)
    assert sim.grid[0][1].energy == 5

def test_shark_starvation():
    sim = WatorSimulation(width=10, height=10, num_fish=0, num_sharks=1, shark_starve_time=1)
    # Shark has energy 1.
    # Step 1: Energy 0.
    # Step 2: Energy -1 (Die).

    # Wait, implementation says:
    # shark.energy -= 1
    # if shark.energy < 0: die

    # Initial energy = starve_time = 1.
    # Step 1: energy becomes 0. Alive.
    # Step 2: energy becomes -1. Die.

    sim.step() # Energy 0
    state = sim.get_state()
    assert sum(row.count("shark") for row in state) == 1

    sim.step() # Energy -1 -> Die
    state = sim.get_state()
    assert sum(row.count("shark") for row in state) == 0

def test_reproduction():
    # Fish reproduction
    sim = WatorSimulation(width=10, height=10, num_fish=1, num_sharks=0, fish_breed_time=1)
    # Age 0.
    sim.step() # Age 1. Moves. Reproduces (since age >= breed_time).

    state = sim.get_state()
    assert sum(row.count("fish") for row in state) == 2
