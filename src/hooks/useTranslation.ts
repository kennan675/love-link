import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/translations';

export const useTranslation = () => {
    const { language, setLanguage } = useLanguage();
    const t = getTranslation(language);

    return {
        t,
        language,
        setLanguage,
    };
};
