import { useState } from 'react';
import SeanceModal from './SeanceModal';

// Wrapper pour la création : pré-remplit la date
export default function NouvelleSeanceModal({ date, coaches, coursTypes, onSave, onClose }) {
  function handleSave(_, payload) {
    onSave({ ...payload, date });
  }

  return (
    <SeanceModal
      seance={null}
      coaches={coaches}
      coursTypes={coursTypes}
      onSave={handleSave}
      onClose={onClose}
    />
  );
}
