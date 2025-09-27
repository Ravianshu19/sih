import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { faker } from '@faker-js/faker'
import { addMinutes, format, parseISO } from 'date-fns'

const RailwayContext = createContext()

// Sample data generation
const generateSampleData = () => {
  const sections = [
    { id: 'SEC_001', name: 'Platform A', type: 'Platform', capacity: 2, length: 0.5, maxSpeed: 30, signalBlocks: 1 },
    { id: 'SEC_002', name: 'Main Line North', type: 'Main Line', capacity: 2, length: 5.0, maxSpeed: 120, signalBlocks: 3 },
    { id: 'SEC_003', name: 'Junction X', type: 'Junction', capacity: 1, length: 0.2, maxSpeed: 60, signalBlocks: 2 },
    { id: 'SEC_004', name: 'Main Line South', type: 'Main Line', capacity: 1, length: 8.0, maxSpeed: 140, signalBlocks: 4 },
    { id: 'SEC_005', name: 'Platform B', type: 'Platform', capacity: 2, length: 0.5, maxSpeed: 30, signalBlocks: 1 },
  ]

  const now = Date.now();
  const trains = [
    {
      id: 'train_001',
      number: '12345',
      type: 'Express',
      priority: 4,
      scheduledArrival: new Date(now + 10 * 1000), // Arrives in 10 seconds
      scheduledDeparture: new Date(now + 130 * 1000), // Departs in 130 seconds
      currentDelay: 0,
      maxSpeed: 160,
      route: ['SEC_001', 'SEC_002', 'SEC_003', 'SEC_004', 'SEC_005']
    },
    {
      id: 'train_002',
      number: '56789',
      type: 'Local',
      priority: 2,
      scheduledArrival: new Date(now + 30 * 1000),
      scheduledDeparture: new Date(now + 180 * 1000),
      currentDelay: 0,
      maxSpeed: 100,
      route: ['SEC_005', 'SEC_004', 'SEC_003', 'SEC_002', 'SEC_001']
    },
    {
      id: 'train_003',
      number: 'FR001',
      type: 'Freight',
      priority: 1,
      scheduledArrival: new Date(now + 20 * 1000),
      scheduledDeparture: new Date(now + 200 * 1000),
      currentDelay: 0,
      maxSpeed: 80,
      route: ['SEC_002', 'SEC_003', 'SEC_004']
    }
  ]

  return { sections, trains, conflicts: [], optimizationMetrics: null, liveTime: new Date(now) }
}

const railwayReducer = (state, action) => {
  switch (action.type) {
    case 'INITIALIZE_DATA':
      return { ...state, ...generateSampleData() }
    
    case 'ADD_TRAIN':
      return {
        ...state,
        trains: [...state.trains, { ...action.payload, id: `train_${Date.now()}` }]
      }
    
    case 'UPDATE_TRAIN':
      return {
        ...state,
        trains: state.trains.map(train => 
          train.id === action.payload.id ? { ...train, ...action.payload } : train
        )
      }
    
    case 'DELETE_TRAIN':
      return {
        ...state,
        trains: state.trains.filter(train => train.id !== action.payload)
      }
    
    case 'DETECT_CONFLICTS':
      const conflicts = detectConflicts(state.trains, state.sections, state.liveTime)
      return { ...state, conflicts }
    
    case 'OPTIMIZE_SCHEDULE':
      const optimized = optimizeSchedule(state.trains, state.conflicts)
      return {
        ...state,
        trains: optimized.trains,
        conflicts: optimized.conflicts,
        optimizationMetrics: optimized.metrics
      }
    
    case 'ANALYZE_SCENARIO':
      return {
        ...state,
        scenarioAnalysis: action.payload
      }
    
    case 'RESET_DATA':
      const resetState = generateSampleData()
      return { ...state, ...resetState }

    case 'SET_LIVE_TIME':
      return { ...state, liveTime: action.payload }
    
    default:
      return state
  }
}

// Conflict detection logic
const detectConflicts = (trains, sections, currentTime) => {
  const conflicts = []
  
  for (let i = 0; i < trains.length; i++) {
    for (let j = i + 1; j < trains.length; j++) {
      const train1 = trains[i]
      const train2 = trains[j]
      
      const sharedSections = train1.route.filter(section => train2.route.includes(section))
      
      sharedSections.forEach(sectionId => {
        const section = sections.find(s => s.id === sectionId)
        if (!section) return
        
        const getTrainTimeWindows = (train) => {
            const windows = {};
            const journeyDuration = (train.scheduledDeparture.getTime() - train.scheduledArrival.getTime());
            if (journeyDuration <= 0) return windows;

            const timePerSection = journeyDuration / train.route.length;
            train.route.forEach((secId, index) => {
                const startTime = new Date(train.scheduledArrival.getTime() + train.currentDelay * 60000 + index * timePerSection);
                const endTime = new Date(startTime.getTime() + timePerSection);
                windows[secId] = { start: startTime, end: endTime };
            });
            return windows;
        };

        const train1Windows = getTrainTimeWindows(train1);
        const train2Windows = getTrainTimeWindows(train2);

        if (train1Windows[sectionId] && train2Windows[sectionId]) {
            const t1Start = train1Windows[sectionId].start;
            const t1End = train1Windows[sectionId].end;
            const t2Start = train2Windows[sectionId].start;
            const t2End = train2Windows[sectionId].end;
            
            if (t1Start < t2End && t2Start < t1End) {
                const severity = Math.min(5, Math.max(1, Math.abs(train1.priority - train2.priority) + 2));
                
                const conflictStart = t1Start > t2Start ? t1Start : t2Start;
                const conflictEnd = t1End < t2End ? t1End : t2End;

                conflicts.push({
                    id: `conflict_${i}_${j}_${sectionId}`,
                    train1: train1,
                    train2: train2,
                    sectionId: sectionId,
                    startTime: conflictStart,
                    endTime: conflictEnd,
                    severity: severity,
                    duration: (conflictEnd - conflictStart) / (1000 * 60)
                });
            }
        }
      })
    }
  }
  
  return conflicts
}

// Schedule optimization logic
const optimizeSchedule = (trains, conflicts) => {
  let optimizedTrains = JSON.parse(JSON.stringify(trains)).map(t => ({
      ...t,
      scheduledArrival: new Date(t.scheduledArrival),
      scheduledDeparture: new Date(t.scheduledDeparture),
  }));
  let totalDelayAdded = 0
  let conflictsResolved = 0
  
  conflicts.forEach(conflict => {
    const { train1, train2 } = conflict
    
    let trainToDelay;
    if (train1.priority < train2.priority) {
      trainToDelay = train1;
    } else if (train2.priority < train1.priority) {
      trainToDelay = train2;
    } else {
      // If priorities are equal, delay the one that starts later
      trainToDelay = train1.scheduledArrival > train2.scheduledArrival ? train1 : train2;
    }

    const trainIndex = optimizedTrains.findIndex(t => t.id === trainToDelay.id)
    if (trainIndex !== -1) {
      const delayToAdd = 15;
      optimizedTrains[trainIndex].currentDelay += delayToAdd
      totalDelayAdded += delayToAdd
      conflictsResolved++
    }
  })
  
  const remainingConflicts = detectConflicts(optimizedTrains, [])
  
  const metrics = {
    originalConflicts: conflicts.length,
    optimizedConflicts: remainingConflicts.length,
    conflictsResolved: conflictsResolved,
    additionalDelayIntroduced: totalDelayAdded,
    optimizationEffectiveness: conflicts.length > 0 ? ((conflicts.length - remainingConflicts.length) / conflicts.length * 100).toFixed(1) : 100
  }
  
  return {
    trains: optimizedTrains,
    conflicts: remainingConflicts,
    metrics
  }
}

export const RailwayProvider = ({ children }) => {
  const [state, dispatch] = useReducer(railwayReducer, {
    trains: [],
    sections: [],
    conflicts: [],
    optimizationMetrics: null,
    scenarioAnalysis: null,
    liveTime: new Date()
  })

  useEffect(() => {
    dispatch({ type: 'INITIALIZE_DATA' })
  }, [])

  useEffect(() => {
    if (state.trains.length > 0) {
      dispatch({ type: 'DETECT_CONFLICTS' })
    }
  }, [state.trains, state.liveTime])

  const value = {
    ...state,
    dispatch,
    addTrain: (train) => dispatch({ type: 'ADD_TRAIN', payload: train }),
    updateTrain: (train) => dispatch({ type: 'UPDATE_TRAIN', payload: train }),
    deleteTrain: (trainId) => dispatch({ type: 'DELETE_TRAIN', payload: trainId }),
    optimizeSchedule: () => dispatch({ type: 'OPTIMIZE_SCHEDULE' }),
    resetData: () => dispatch({ type: 'RESET_DATA' }),
    analyzeScenario: (analysis) => dispatch({ type: 'ANALYZE_SCENARIO', payload: analysis }),
    setLiveTime: (time) => dispatch({ type: 'SET_LIVE_TIME', payload: time })
  }

  return (
    <RailwayContext.Provider value={value}>
      {children}
    </RailwayContext.Provider>
  )
}

export const useRailway = () => {
  const context = useContext(RailwayContext)
  if (!context) {
    throw new Error('useRailway must be used within a RailwayProvider')
  }
  return context
}
