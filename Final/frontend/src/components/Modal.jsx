import { useEffect } from 'react'

export const Modal = ({ isOpen, onClose, title, children, maxWidth = '520px' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, loading }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="400px">
      <div className="confirm-body">
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚠</div>
        <p>{message}</p>
      </div>
      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? <span className="spinner" /> : 'Confirm Delete'}
        </button>
      </div>
    </Modal>
  )
}