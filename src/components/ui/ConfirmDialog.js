import { Button } from "./Button";
import { Modal } from "./Modal";

export function ConfirmDialog({ isOpen, title = "Confirmar acción", description, onCancel, onConfirm }) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <p className="text-sm text-slate-600">{description}</p>
      <div className="mt-6 flex justify-end gap-3">
        <Button onClick={onCancel} variant="secondary">Cancelar</Button>
        <Button onClick={onConfirm} variant="danger">Confirmar</Button>
      </div>
    </Modal>
  );
}
