import { useApp } from '../context/AppContext';

export default function Modal() {
  const { modal, setModal } = useApp();
  if (!modal) return null;

  return (
    <div className="overlay" onClick={() => setModal(null)} role="presentation">
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <h3>{modal.title}</h3>
        <p className="muted">{modal.message}</p>
        <div className="modal-actions">
          <button className="btn btn-ghost" type="button" onClick={() => setModal(null)}>
            {modal.cancelText || 'No'}
          </button>
          <button
            className="btn btn-danger"
            type="button"
            onClick={() => {
              modal.onConfirm?.();
              setModal(null);
            }}
          >
            {modal.confirmText || 'Yes, cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}
