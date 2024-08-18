import { useTranslation } from 'react-i18next';
import { FaExclamationTriangle } from 'react-icons/fa';

function FormNotes({ notes }) {
  const { t } = useTranslation();
  const colorClassEnum = {
    1: 'text-green',
    2: 'text-orange',
    3: 'text-red',
  };
  return (
    <div className="row">
      <div className="col-md-12">
        {notes &&
          notes.length > 0 &&
          notes.map(note => {
            return (
              <p key={note} className={note?.type ? `form-note ${colorClassEnum[note.type]}` : 'form-note'}>
                <span className="mr-2">
                  <FaExclamationTriangle />
                </span>
                {t(note.title)}
              </p>
            );
          })}
      </div>
    </div>
  );
}

export default FormNotes;
