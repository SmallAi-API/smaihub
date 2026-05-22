import { DEFAULT_MODEL_PROVIDER_LIST } from 'model-bank/modelProviders';
import SMAIProvider from 'model-bank/modelProviders/smai';

const locales: Record<`${string}.description`, string> = {};

const providers = [SMAIProvider, ...DEFAULT_MODEL_PROVIDER_LIST];

providers.forEach((provider) => {
  if (!provider.description) return;
  locales[`${provider.id}.description`] = provider.description;
});

export default locales;
