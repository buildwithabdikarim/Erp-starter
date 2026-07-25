import { useState } from 'react'
import { UseModalState } from '@/types'

export const useModal = (initialState: Partial<UseModalState> = {}) => {
  const [state, setState] = useState<UseModalState>({
    isOpen: false,
    mode: 'create',
    data: undefined,
    ...initialState,
  })

  const open = (mode: 'create' | 'edit' | 'view' = 'create', data?: any) => {
    setState({
      isOpen: true,
      mode,
      data,
    })
  }

  const close = () => {
    setState({
      isOpen: false,
      mode: 'create',
      data: undefined,
    })
  }

  const toggle = () => {
    setState((prev) => ({
      ...prev,
      isOpen: !prev.isOpen,
    }))
  }

  return {
    ...state,
    open,
    close,
    toggle,
  }
}
