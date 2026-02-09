import { Language } from '@/contexts/LanguageContext';
import { en } from './en';
import { fr } from './fr';
import { sw } from './sw';
import { ar } from './ar';
import { pt } from './pt';
import { ha } from './ha';
import { yo } from './yo';
import { ig } from './ig';
import { am } from './am';
import { zu } from './zu';

export const translations = {
    en,
    fr,
    sw,
    ar,
    pt,
    ha,
    yo,
    ig,
    am,
    zu,
};

export const getTranslation = (lang: Language) => {
    return translations[lang] || translations.en;
};
