import { useTranslation } from 'react-i18next';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { FaInfoCircle } from 'react-icons/fa'; // Font Awesome for the tooltip icon

export default function Card({ title, ActionComponent, children, SideComponent, tooltip }) {
  const { t } = useTranslation();

  if (SideComponent) {
    return (
      <section className="card-side-comp-container">
        <div className="card-side-comp-content">
          <div className="row">
            <div className="col d-flex flex-row justify-content-between align-items-start">
              <div className="section-title">
                <h4 className="title">
                  {title ? t(title) : ''}
                  {tooltip && (
                    <>
                      <FaInfoCircle
                        style={{ marginLeft: '8px', marginRight: '8px', cursor: 'pointer' }}
                        data-tooltip-id={tooltip}
                        data-tooltip-content={t(tooltip)}
                      />
                      <ReactTooltip id={tooltip} place="top" effect="solid" className="card-tooltip" />
                    </>
                  )}
                </h4>
              </div>
            </div>
          </div>
          <div style={{ flex: 1 }}>{children}</div>
        </div>
        <div className="card-side-comp">
          <SideComponent />
        </div>
      </section>
    );
  }

  return (
    <section>
      {(title || tooltip || ActionComponent) && (
        <div className="row">
          <div className="col d-flex flex-row justify-content-between align-items-start">
            <div className="section-title">
              <h4 className="title">
                {title ? t(title) : ''}
                {tooltip && (
                  <>
                    <FaInfoCircle
                      style={{ marginLeft: '8px', marginRight: '8px', cursor: 'pointer' }}
                      data-tooltip-id={tooltip}
                      data-tooltip-content={t(tooltip)}
                    />
                    <ReactTooltip id={tooltip} place="top" effect="solid" className="card-tooltip" />
                  </>
                )}
              </h4>
            </div>
            {ActionComponent ? <ActionComponent /> : null}
          </div>
        </div>
      )}
      <div style={{ flex: 1 }}>{children}</div>
    </section>
  );
}
