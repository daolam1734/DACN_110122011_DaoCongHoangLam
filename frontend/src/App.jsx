import React, { useState } from 'react'
import Dashboard from './pages/dashboard'
import Settings from './pages/settings'
import HoSoList from './components/HoSoList'
import HoSoForm from './components/HoSoForm'
import Login from './components/Login'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import SubmitReport from './pages/reports/SubmitReport'
import ReportList from './pages/reports/ReportList'
import OrgUnits from './pages/org/OrgUnits'
import OrgPositions from './pages/org/OrgPositions'
import Party from './pages/org/Party'
import Profile from './pages/Profile'

export default function App() {
    const [user, setUser] = useState(null)
    const [route, setRoute] = useState('dashboard')
    if (!user) return (
        <AuthLayout>
            <Login onSuccess={(u) => { setUser(u); setRoute('dashboard') }} />
        </AuthLayout>
    )

    const handleMenuSelect = (key) => {
        setRoute(key)
    }

    return (
        <MainLayout user={user} onMenuSelect={handleMenuSelect}>
            {route === 'dashboard' && <Dashboard user={user} />}
            {route === 'hoso:create' && <HoSoForm onCreated={(h) => { setRoute('dashboard') }} />}
            {route === 'hoso:mine' && <HoSoList mine />}
            {route === 'hoso:todo' && <HoSoList todo />}
            {route === 'bao-cao:submit' && <SubmitReport />}
            {route === 'bao-cao:my' && <ReportList />}
            {route === 'org:units' && <OrgUnits />}
            {route === 'org:positions' && <OrgPositions />}
            {route === 'org:party' && <Party />}
            {route && route.startsWith('config:') && <Settings user={user} initialTab={route.split(':')[1]} />}
            {route === 'profile:info' && <Profile user={user} onLogout={() => setUser(null)} />}
            {route === 'profile:logout' && (() => { setUser(null); return <div /> })()}
        </MainLayout>
    )
}
