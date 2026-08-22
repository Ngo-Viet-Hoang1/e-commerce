export type ModalState<T> =
  | { mode: 'create' }
  | { mode: 'view'; data: T }
  | { mode: 'edit'; data: T }
  | { mode: 'delete'; data: T }
  | null

export const createModalState = {
  create: <T>(): ModalState<T> => ({ mode: 'create' }),
  view: <T>(data: T): ModalState<T> => ({ mode: 'view', data }),
  edit: <T>(data: T): ModalState<T> => ({ mode: 'edit', data }),
  delete: <T>(data: T): ModalState<T> => ({ mode: 'delete', data }),
  close: <T>(): ModalState<T> => null,
}

export const isModalOpen = <T>(
  state: ModalState<T>,
): state is Exclude<ModalState<T>, null> => {
  return state !== null
}

export const isCreateMode = <T>(
  state: ModalState<T>,
): state is { mode: 'create' } => {
  return state?.mode === 'create'
}

export const isViewMode = <T>(
  state: ModalState<T>,
): state is { mode: 'view'; data: T } => {
  return state?.mode === 'view'
}

export const isEditMode = <T>(
  state: ModalState<T>,
): state is { mode: 'edit'; data: T } => {
  return state?.mode === 'edit'
}

export const isDeleteMode = <T>(
  state: ModalState<T>,
): state is { mode: 'delete'; data: T } => {
  return state?.mode === 'delete'
}
