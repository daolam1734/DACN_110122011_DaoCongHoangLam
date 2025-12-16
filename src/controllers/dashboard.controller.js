import * as DashboardService from '../services/dashboard.service.js'

export const getDashboard = async (req, res) => {
  try {
    const data = await DashboardService.getDashboardForUser(req.user || {})
    res.json(data)
  } catch (err) {
    console.error('[dashboard.controller] error', err && err.message ? err.message : err)
    res.status(400).json({ message: err.message })
  }
}

export default { getDashboard }
