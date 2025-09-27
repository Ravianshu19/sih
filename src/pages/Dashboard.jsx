import React from 'react'
import { useRailway } from '../context/RailwayContext'
import { Train, AlertTriangle, Clock, TrendingUp, Zap, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'

const Dashboard = () => {
  const { trains, conflicts, sections, optimizationMetrics, optimizeSchedule } = useRailway()

  const metrics = {
    totalTrains: trains.length,
    totalConflicts: conflicts.length,
    averageDelay: trains.reduce((sum, train) => sum + train.currentDelay, 0) / trains.length || 0,
    punctuality: trains.filter(train => train.currentDelay <= 5).length / trains.length * 100 || 0
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Control Dashboard</h1>
          <p className="mt-2 text-gray-600">Real-time overview of railway operations</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={optimizeSchedule}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center"
          >
            <Zap className="h-5 w-5 mr-2" />
            Optimize Schedule
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={itemVariants} className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="metric-value">{metrics.totalTrains}</div>
              <div className="metric-label">Active Trains</div>
            </div>
            <Train className="h-8 w-8 text-blue-500" />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="metric-value text-red-600">{metrics.totalConflicts}</div>
              <div className="metric-label">Total Conflicts</div>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="metric-value text-yellow-600">{metrics.averageDelay.toFixed(1)}</div>
              <div className="metric-label">Avg Delay (min)</div>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="metric-value text-green-600">{metrics.punctuality.toFixed(0)}%</div>
              <div className="metric-label">On-Time Performance</div>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </motion.div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section Status */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-gray-600" />
              Section Status
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {sections.map((section) => (
              <div key={section.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{section.name}</div>
                  <div className="text-sm text-gray-600">{section.type}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                    {section.capacity} capacity
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                    {section.length}km
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Current Conflicts */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
              Current Conflicts
            </h3>
          </div>
          <div className="p-6">
            {conflicts.length > 0 ? (
              <div className="space-y-3">
                {conflicts.slice(0, 3).map((conflict) => (
                  <div
                    key={conflict.id}
                    className={`p-3 rounded-lg border-l-4 severity-${conflict.severity} bg-yellow-50`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">
                          {conflict.train1.number} vs {conflict.train2.number}
                        </div>
                        <div className="text-sm text-gray-600">
                          {conflict.sectionId} • {conflict.duration.toFixed(0)} min overlap
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs font-medium rounded">
                        Severity {conflict.severity}
                      </span>
                    </div>
                  </div>
                ))}
                {conflicts.length > 3 && (
                  <div className="text-center text-gray-500 text-sm">
                    ... and {conflicts.length - 3} more conflicts
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-green-500 mb-2">
                  <svg className="mx-auto h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-900 font-medium">No conflicts detected!</p>
                <p className="text-gray-600 text-sm">All trains are operating smoothly</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Train Overview */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-lg shadow-sm border border-gray-200"
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Train className="h-5 w-5 mr-2 text-gray-600" />
            Train Overview
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Train
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scheduled
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trains.map((train) => (
                <tr key={train.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{train.number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                      {train.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded priority-${train.priority >= 4 ? 'HIGH' : train.priority >= 2 ? 'MEDIUM' : 'LOW'}`}>
                      Priority {train.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {format(train.scheduledArrival, 'HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {train.currentDelay > 0 ? (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                        +{train.currentDelay} min
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                        On time
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

export default Dashboard
