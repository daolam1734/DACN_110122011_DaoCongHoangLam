import * as roleRepo from '../repositories/role.repository.js'

export const getAllRoles = async () => {
    return roleRepo.findAll()
}

export const getRoleById = async (id) => {
    return roleRepo.findById(id)
}

export const updateRole = async (id, data) => {
    return roleRepo.updateRole(id, data)
}

export const createRole = async (data) => {
    return roleRepo.createRole(data)
}

export default { getAllRoles, getRoleById, updateRole, createRole }
