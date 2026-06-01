import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  // Ensure locale is always a string (fallback to 'en')
  const resolvedLocale = locale ?? 'en';
  const messages = (await import(`./messages/${resolvedLocale}.json`)).default;
  return {
    locale: resolvedLocale,
    messages,
  };
});