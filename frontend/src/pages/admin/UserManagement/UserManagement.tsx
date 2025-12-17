import AdminUserService from '@/api/services/admin/user.admin.service'
import type { User } from '@/interfaces/user.interface'
import { useEffect, useState } from 'react'
import { DataTable } from '../../../components/common/table/DataTable'
import { userColumns } from './Columns'

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await AdminUserService.getAll()
      const { success, data } = res

      if (success && data) {
        setUsers(data)
      }
    }

    fetchUsers()
  }, [])

  return <DataTable columns={userColumns} data={users} />
}

export default UserManagement
