import { useMemo } from 'react';

export default function BulletSteps({ total, step, failedStep }) {
  const path = useMemo(() => {
    let paths = [];

    for (let i = 1; i <= total; i++) {
      paths.push(
        <div
          className={`path__dot ${i <= step && (failedStep ? i <= failedStep : true) ? 'path__dot--past path__dot--active' : ''} ${
            failedStep === i ? 'fail path-fail' : ''
          }`}
        ></div>
      );
    }

    return paths;
  }, [total, step, failedStep]);

  return <div className="path">{path}</div>;
}
