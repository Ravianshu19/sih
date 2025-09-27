import React, { useState, useEffect, useRef } from 'react'
import { useRailway } from '../context/RailwayContext'
import { Train, Play, Pause, FastForward, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'

const TrainVisual = ({ train, position, inConflict }) => {
  const getPriorityColor = (priority) => {
    if (priority >= 4) return 'bg-red-500'
    if (priority >= 3) return 'bg-yellow-500'
    if (priority >= 2) return 'bg-blue-500'
    return 'bg-gray-500'
  }

  return (
    <motion.div
      key={train.id}
      className="absolute top-1/2 -translate-y-1/2 h-12 flex items-center group"
      initial={{ x: position }}
      animate={{ x: position }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      <div className={`relative w-10 h-10 rounded-full flex items-center justify-center shadow-lg transform -translate-x-1/2 ${inConflict ? 'animate-glow' : getPriorityColor(train.priority)}`}>
        <Train className="h-5 w-5 text-white" />
        <span className="absolute -bottom-5 text-xs font-semibold text-gray-700 bg-white bg-opacity-75 px-1 rounded">
          {train.number}
        </span>
      </div>
      {/* Tooltip */}
      <div className="absolute bottom-full mb-6 w-48 bg-gray-800 text-white text-xs rounded py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-x-1/2 left-1/2 z-10">
        <p className="font-bold">{train.number}</p>
        <p>Type: {train.type}</p>
        <p>Priority: {train.priority}</p>
        {inConflict && <p className="text-red-400 font-bold">IN CONFLICT</p>}
        <div className="absolute w-2 h-2 bg-gray-800 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
      </div>
    </motion.div>
  )
}

const LiveView = () => {
  const { sections, trains, conflicts, liveTime, setLiveTime } = useRailway()
  const [isPlaying, setIsPlaying] = useState(true)
  const [speed, setSpeed] = useState(50) // 50x speed
  const intervalRef = useRef(null)

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setLiveTime(new Date(liveTime.getTime() + 100 * speed))
      }, 100)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [isPlaying, speed, liveTime, setLiveTime])

  const getTrainPosition = (train, trackWidth) => {
    const actualArrival = new Date(train.scheduledArrival.getTime() + train.currentDelay * 60000)
    const actualDeparture = new Date(train.scheduledDeparture.getTime() + train.currentDelay * 60000)
    
    const journeyDuration = actualDeparture.getTime() - actualArrival.getTime()
    
    if (liveTime < actualArrival || liveTime > actualDeparture || journeyDuration <= 0) return -100 // Off-screen

    const elapsedTime = liveTime.getTime() - actualArrival.getTime()
    const progress = Math.min(1, Math.max(0, elapsedTime / journeyDuration))

    return progress * trackWidth
  }
  
  const trackRef = useRef(null)
  const [trackWidth, setTrackWidth] = useState(0)

  useEffect(() => {
    if (trackRef.current) {
      setTrackWidth(trackRef.current.offsetWidth)
    }
    const handleResize = () => {
        if (trackRef.current) {
            setTrackWidth(trackRef.current.offsetWidth)
        }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isTrainInConflict = (trainId) => {
    return conflicts.some(c => (c.train1.id === trainId || c.train2.id === trainId) && liveTime >= c.startTime && liveTime <= c.endTime)
  }

  const getTimelinePosition = () => {
    const startOfDay = new Date(liveTime);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(liveTime);
    endOfDay.setHours(23, 59, 59, 999);
    const totalDayMillis = endOfDay.getTime() - startOfDay.getTime();
    const elapsedMillis = liveTime.getTime() - startOfDay.getTime();
    return (elapsedMillis / totalDayMillis) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Live Network View</h1>
        <p className="mt-2 text-gray-600">A real-time visual demonstration of the railway network.</p>
      </div>

      {/* Controls and Timeline */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
              {isPlaying ? <Pause className="h-5 w-5 text-gray-700" /> : <Play className="h-5 w-5 text-gray-700" />}
            </button>
            <div className="flex items-center space-x-2">
              <FastForward className="h-5 w-5 text-gray-600" />
              <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="bg-white border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-primary-500">
                <option value="1">1x</option>
                <option value="10">10x</option>
                <option value="50">50x</option>
                <option value="100">100x</option>
              </select>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center font-mono text-lg font-semibold text-gray-800 bg-gray-100 px-4 py-2 rounded-lg">
            <Clock className="h-5 w-5 mr-3 text-primary-600" />
            {format(liveTime, 'HH:mm:ss')}
          </div>
        </div>
        {/* 24h Timeline */}
        <div>
          <div className="relative h-2 bg-gray-200 rounded-full">
            <div className="absolute h-2 bg-primary-500 rounded-full" style={{ width: `${getTimelinePosition()}%` }}></div>
            <div className="absolute h-4 w-4 bg-white border-2 border-primary-600 rounded-full -top-1" style={{ left: `calc(${getTimelinePosition()}% - 8px)` }}></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>24:00</span>
          </div>
        </div>
      </div>

      {/* Track Visualization */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="relative py-8" ref={trackRef}>
          {/* Track background */}
          <div className="absolute inset-y-1/2 h-8 -translate-y-1/2 w-full bg-gray-300 rounded-lg" 
               style={{
                 backgroundImage: 'repeating-linear-gradient(90deg, #a0aec0, #a0aec0 2px, transparent 2px, transparent 10px)'
               }}>
            <div className="absolute top-1 h-0.5 w-full bg-gray-500"></div>
            <div className="absolute bottom-1 h-0.5 w-full bg-gray-500"></div>
          </div>

          {/* Track Sections */}
          <div className="relative flex h-24">
            {sections.map(section => (
              <div key={section.id} className="flex-grow border-r-2 border-dashed border-gray-400 last:border-r-0 flex items-center justify-center" style={{ flexBasis: `${section.length * 10}%`}}>
                <div className="bg-white bg-opacity-75 px-2 py-1 rounded-md text-xs font-semibold text-gray-700">
                  {section.name}
                </div>
              </div>
            ))}
          </div>

          {/* Trains */}
          <div className="absolute top-0 left-0 w-full h-full">
            {trackWidth > 0 && trains.map(train => {
              const position = getTrainPosition(train, trackWidth)
              if (position < 0) return null
              const inConflict = isTrainInConflict(train.id)
              return <TrainVisual key={train.id} train={train} position={position} inConflict={inConflict} />
            })}
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-700">
            <span className="font-bold">Priority Legend:</span>
            <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>Critical (4+)</div>
            <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>High (3)</div>
            <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>Medium (2)</div>
            <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-gray-500 mr-2"></div>Low (1)</div>
            <div className="flex items-center ml-4"><div className="w-4 h-4 rounded-full animate-glow mr-2"></div>In Conflict</div>
        </div>
      </div>
    </div>
  )
}

export default LiveView
