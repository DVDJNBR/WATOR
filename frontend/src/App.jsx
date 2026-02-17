import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Grid from './Grid'

function App() {
  const [grid, setGrid] = useState(null)
  const [running, setRunning] = useState(false)
  const [stats, setStats] = useState({ fish: 0, shark: 0, steps: 0 })
  const intervalRef = useRef(null)
  const [speed, setSpeed] = useState(100)

  // Simulation Parameters
  const [params, setParams] = useState({
      width: 50,
      height: 30,
      num_fish: 200,
      num_sharks: 20,
      fish_breed_time: 3,
      shark_breed_time: 10,
      shark_starve_time: 3
  })

  // Use relative path for production (proxied by Nginx)
  // For development, Vite proxy handles /api -> localhost:8000
  const apiUrl = '/api';

  const fetchState = async () => {
    try {
      const res = await axios.get(`${apiUrl}/state`)
      setGrid(res.data.state)
      calculateStats(res.data.state)
    } catch (err) {
      console.error(err)
    }
  }

  const calculateStats = (gridData) => {
      let f = 0, s = 0;
      gridData.forEach(row => {
          row.forEach(cell => {
              if (cell === 'fish') f++;
              if (cell === 'shark') s++;
          })
      })
      setStats(prev => ({ ...prev, fish: f, shark: s }))
  }

  const initSim = async () => {
      try {
          await axios.post(`${apiUrl}/init`, params)
          await fetchState()
          setStats(prev => ({...prev, steps: 0}))
      } catch (err) {
          console.error(err)
      }
  }

  const stepSim = async () => {
      try {
          const res = await axios.post(`${apiUrl}/step`)
          setGrid(res.data.state)
          calculateStats(res.data.state)
          setStats(prev => ({...prev, steps: prev.steps + 1}))
      } catch (err) {
          console.error(err)
      }
  }

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(stepSim, speed)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, speed])

  useEffect(() => {
      initSim()
  }, [])

  return (
    <div className="min-h-screen bg-slate-100 p-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-6 text-slate-800">🌊 Wa-Tor Simulation</h1>

      <div className="flex gap-8 w-full max-w-6xl">
          {/* Controls Panel */}
          <div className="w-1/4 bg-white p-6 rounded-xl shadow-lg h-fit">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Controls</h2>

              <div className="space-y-4">
                  <div className="flex gap-2">
                      <button
                        onClick={() => setRunning(!running)}
                        className={`flex-1 py-2 px-4 rounded font-bold text-white transition
                            ${running ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                      >
                          {running ? 'Stop 🛑' : 'Start ▶️'}
                      </button>
                      <button
                        onClick={() => { setRunning(false); initSim(); }}
                        className="flex-1 py-2 px-4 bg-blue-500 text-white rounded font-bold hover:bg-blue-600 transition"
                      >
                          Reset 🔄
                      </button>
                  </div>

                  <div>
                      <label className="block text-sm font-medium text-gray-700">Speed ({speed}ms)</label>
                      <input
                        type="range" min="50" max="1000" step="50"
                        value={speed} onChange={(e) => setSpeed(Number(e.target.value))}
                        className="w-full"
                      />
                  </div>

                  <div className="pt-4 border-t">
                      <h3 className="font-semibold mb-2">Parameters</h3>
                      <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                             <span>Fish:</span>
                             <input type="number" value={params.num_fish}
                                onChange={e => setParams({...params, num_fish: parseInt(e.target.value)})}
                                className="w-16 border rounded px-1" />
                          </div>
                          <div className="flex justify-between items-center">
                             <span>Sharks:</span>
                             <input type="number" value={params.num_sharks}
                                onChange={e => setParams({...params, num_sharks: parseInt(e.target.value)})}
                                className="w-16 border rounded px-1" />
                          </div>
                           <div className="flex justify-between items-center">
                             <span>Size (WxH):</span>
                             <div className="flex gap-1">
                                <input type="number" value={params.width}
                                    onChange={e => setParams({...params, width: parseInt(e.target.value)})}
                                    className="w-12 border rounded px-1" />
                                <span className="text-gray-400">x</span>
                                <input type="number" value={params.height}
                                    onChange={e => setParams({...params, height: parseInt(e.target.value)})}
                                    className="w-12 border rounded px-1" />
                             </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          {/* Grid Panel */}
          <div className="flex-1 flex flex-col items-center">
             <div className="bg-white px-6 py-3 rounded-full shadow-md mb-4 flex gap-8 font-mono text-lg font-bold text-slate-700">
                 <span>🐟 Fish: {stats.fish}</span>
                 <span>🦈 Sharks: {stats.shark}</span>
                 <span>⏱️ Steps: {stats.steps}</span>
             </div>

             <div className="overflow-auto max-w-full max-h-[80vh] border-4 border-slate-200 rounded-lg">
                 <Grid grid={grid} />
             </div>
          </div>
      </div>
    </div>
  )
}

export default App
