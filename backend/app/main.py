from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.wator import WatorSimulation

app = FastAPI()

# Allow all origins for simplicity in this project
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

simulation = WatorSimulation(width=50, height=30, num_fish=200, num_sharks=20)

class InitParams(BaseModel):
    width: int
    height: int
    num_fish: int
    num_sharks: int
    fish_breed_time: int = 3
    shark_breed_time: int = 10
    shark_starve_time: int = 3

@app.post("/init")
def init_simulation(params: InitParams):
    global simulation
    simulation = WatorSimulation(
        width=params.width,
        height=params.height,
        num_fish=params.num_fish,
        num_sharks=params.num_sharks,
        fish_breed_time=params.fish_breed_time,
        shark_breed_time=params.shark_breed_time,
        shark_starve_time=params.shark_starve_time
    )
    return {"message": "Simulation initialized"}

@app.post("/step")
def step_simulation():
    global simulation
    simulation.step()
    return {"state": simulation.get_state()}

@app.get("/state")
def get_state():
    global simulation
    return {"state": simulation.get_state()}
