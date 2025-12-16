import React from 'react'
import HoSoForm from '../../components/HoSoForm'

export default function HoSoCreatePage(props) {
    return <HoSoForm onCreated={props.onCreated} />
}
