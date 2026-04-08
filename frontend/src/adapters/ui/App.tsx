import { useMemo } from 'react';
import { GetAppMetadataUseCase } from '../../core/application/get-app-metadata.use-case';
import { StaticAppConfigAdapter } from '../infrastructure/static-app-config.adapter';

export function App() {
  const title = useMemo(() => {
    const config = new StaticAppConfigAdapter();
    const useCase = new GetAppMetadataUseCase(config);
    return useCase.execute().title;
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-8 text-slate-100">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-4 max-w-md text-center text-slate-400">
        Hexagonal frontend scaffold (Phase 1). Core logic lives in{' '}
        <code className="text-violet-300">src/core</code>; UI in{' '}
        <code className="text-violet-300">src/adapters/ui</code>.
      </p>
    </div>
  );
}
