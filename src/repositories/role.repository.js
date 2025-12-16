import Role from '../models/Role.js'

export const findAll = async () => {
    return Role.findAll({ order: [['name', 'ASC']] })
}

export const findById = async (id) => {
    return Role.findByPk(id)
}

export const findByName = async (name) => {
    return Role.findOne({ where: { name } })
}

export const createRole = async (data) => {
    return Role.create(data)
}

export const updateRole = async (id, data) => {
    const r = await Role.findByPk(id)
    if (!r) return null
    return r.update(data)
}

export default { findAll, findById, findByName, createRole, updateRole }
