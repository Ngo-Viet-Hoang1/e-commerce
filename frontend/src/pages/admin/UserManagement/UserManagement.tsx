import AdminUserService from '@/api/services/admin/user.admin.service'
import type { PaginationParams } from '@/interfaces/pagination.interface'
import { useCallback, useRef } from 'react'
import {
  DataTable,
  type DataTableRef,
} from '../../../components/common/table/DataTable'
import { userColumns } from './Columns'

const UserManagement = () => {
  const tableRef = useRef<DataTableRef>(null)

  const fetchData = useCallback((params: PaginationParams) => {
    return AdminUserService.getPaginated(params)
  }, [])

  return (
    <DataTable
      ref={tableRef}
      fetchData={fetchData}
      columns={userColumns}
      searchPlaceholder="Search by email or name..."
    />
  )
}

export default UserManagement
