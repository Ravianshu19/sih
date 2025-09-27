import React from 'react'
import { useRailway } from '../context/RailwayContext'
import { MapPin, Gauge, Clock, Users } from 'lucide-react'
import { motion } from 'framer-motion'

const Sections = () => {
  const { sections, trains } = useRailway()

  const getSectionUtilization = (section) => {
    // Calculate utilization based on trains currently using this section
    const trainsInSection = trains.filter(train => train.route.includes(section.id))
    return Math.min(100, (trainsInSection.length / section.capacity) * 100)
  }

  const getUtilizationColor = (utilization) => {
    if (utilization >= 100) return 'text-red-600'
    if (utilization >= 75) return 'text-orange-600'
    if (utilization >= 50) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getUtilizationBgColor = (utilization) => {
    if (utilization >= 100) return 'bg-red-500'
    if (utilization >= 75) return 'bg-orange-500'
    if (utilization >= 50) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <MapPin className="h-8 w-8 mr-3 text-primary-600" />
          Track Sections
        </h1>
        <p className="mt-2 text-gray-600">Monitor track section utilization and current occupancy</p>
      </div>

      {/* Section Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {sections.map((section) => {
          const utilization = getSectionUtilization(section)
          const trainsInSection = trains.filter(train => train.route.includes(section.id))
          
          return (
            <motion.div
              key={section.id}
              variants={itemVariants}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{section.name}</h3>
                    <p className="text-sm text-gray-600">{section.id} • {section.type}</p>
                  </div>
                  <div className="flex space-x-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                      {section.capacity} capacity
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                      {section.length}km
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Section Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Gauge className="h-5 w-5 text-primary-600 mr-1" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{section.maxSpeed}</div>
                    <div className="text-xs text-gray-600">Max Speed (km/h)</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Users className={`h-5 w-5 mr-1 ${getUtilizationColor(utilization)}`} />
                    </div>
                    <div className={`text-2xl font-bold ${getUtilizationColor(utilization)}`}>
                      {utilization.toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-600">Current Utilization</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Clock className="h-5 w-5 text-blue-600 mr-1" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{section.signalBlocks}</div>
                    <div className="text-xs text-gray-600">Signal Blocks</div>
                  </div>
                </div>

                {/* Utilization Bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Capacity Utilization</span>
                    <span className="text-sm text-gray-600">
                      {trainsInSection.length}/{section.capacity} trains
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${getUtilizationBgColor(utilization)}`}
                      style={{ width: `${Math.min(100, utilization)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Current Occupancy */}
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-700">Current Occupancy:</span>
                  {trainsInSection.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {trainsInSection.map((train) => (
                        <span
                          key={train.id}
                          className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded"
                        >
                          {train.number}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm ml-2">No trains currently in section</span>
                  )}
                </div>

                {/* Section Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Length:</span>
                    <span className="ml-2 font-medium">{section.length} km</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <span className="ml-2 font-medium">{section.type}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Network Overview */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-lg shadow-sm border border-gray-200"
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Network Overview</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Network Diagram */}
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-4">Railway Network Layout</h4>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between space-x-4">
                  {sections.map((section, index) => {
                    const utilization = getSectionUtilization(section);
                    const trainsInSection = trains.filter(train => train.route.includes(section.id));
                    return (
                      <React.Fragment key={section.id}>
                        <div className="text-center">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all duration-300 ${getUtilizationBgColor(utilization)}`}
                          >
                            {section.id.split('_')[1]}
                          </div>
                          <div className="mt-2 text-xs text-gray-600">{section.name}</div>
                          <div className="text-xs text-gray-500">
                            {trainsInSection.length}/{section.capacity}
                          </div>
                        </div>
                        {index < sections.length - 1 && (
                          <div className="flex-1 border-t-2 border-gray-300"></div>
                        )}
                      </React.Fragment>
                    )
                  })}
                </div>
              </div>
              
              {/* Legend */}
              <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Legend:</h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span>Available (&lt; 50%)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    <span>Busy (50-75%)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                    <span>High Load (75-100%)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span>At Capacity (100%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Network Statistics */}
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-4">Network Statistics</h4>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Sections:</span>
                    <span className="font-semibold text-gray-900">{sections.length}</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sections with Trains:</span>
                    <span className="font-semibold text-gray-900">
                      {sections.filter(section => 
                        trains.some(train => train.route.includes(section.id))
                      ).length}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Network Length:</span>
                    <span className="font-semibold text-gray-900">
                      {sections.reduce((sum, section) => sum + section.length, 0).toFixed(1)} km
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Utilization:</span>
                    <span className="font-semibold text-gray-900">
                      {(sections.reduce((sum, section) => sum + getSectionUtilization(section), 0) / sections.length).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Sections
