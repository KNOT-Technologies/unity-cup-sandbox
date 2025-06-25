import { useState } from 'react';
import { motion } from 'framer-motion';
import { Headphones } from 'lucide-react';

const TOP_20_LANGUAGES = [
  'English',
  'Mandarin Chinese',
  'Hindi',
  'Spanish',
  'French',
  'Modern Arabic',
  'Bengali',
  'Portuguese',
  'Russian',
  'Urdu',
  'Indonesian',
  'German',
  'Japanese',
  'Swahili',
  'Turkish',
  'Korean',
  'Vietnamese',
  'Tamil',
  'Italian',
  'Thai'
];

interface TranslationSelectorProps {
  onTranslationChange: (needsTranslation: boolean, language?: string) => void;
  className?: string;
}

const TranslationSelector: React.FC<TranslationSelectorProps> = ({ onTranslationChange, className = '' }) => {
  const [needsTranslation, setNeedsTranslation] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');

  const handleTranslationToggle = (value: boolean) => {
    setNeedsTranslation(value);
    onTranslationChange(value, value ? selectedLanguage : undefined);
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    onTranslationChange(needsTranslation, language);
  };

  return (
    <div className={`bg-gray-800/20 backdrop-blur-xl rounded-xl p-5 
      border border-gray-700/20 
      hover:border-amber-500/20 transition-all duration-500 
      hover:shadow-2xl hover:shadow-amber-500/5
      relative before:absolute before:inset-0 
      before:bg-gradient-to-b before:from-amber-500/5 before:to-transparent 
      before:rounded-xl before:opacity-0 hover:before:opacity-100 
      before:transition-opacity before:duration-500 ${className}`}>
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-full blur-xl opacity-50"></div>
            <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-2 relative
              backdrop-blur-xl border border-amber-500/20 group-hover:border-amber-500/30 transition-colors duration-300">
              <Headphones className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <h3 className="text-base font-medium bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
            Translation Headphones
          </h3>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent mb-4"></div>
      
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => handleTranslationToggle(true)}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-300 
                relative overflow-hidden group ${
                needsTranslation
                  ? 'bg-gradient-to-br from-amber-500 to-amber-400 text-gray-900 shadow-lg shadow-amber-500/20'
                  : 'bg-gray-800/30 text-white hover:bg-gray-700/30 hover:shadow-lg hover:shadow-amber-500/5'
                }`}
            >
              {needsTranslation && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                  translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              )}
              Yes, I need translation
            </button>
            <button
              onClick={() => handleTranslationToggle(false)}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-300 
                relative overflow-hidden group ${
                !needsTranslation
                  ? 'bg-gradient-to-br from-amber-500 to-amber-400 text-gray-900 shadow-lg shadow-amber-500/20'
                  : 'bg-gray-800/30 text-white hover:bg-gray-700/30 hover:shadow-lg hover:shadow-amber-500/5'
                }`}
            >
              {!needsTranslation && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                  translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              )}
              No, I don't need translation
            </button>
          </div>

          {needsTranslation && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              <label className="block text-sm font-medium text-white/60">
                Select your preferred language:
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full bg-gray-800/20 backdrop-blur-sm text-white py-2.5 px-4 rounded-lg 
                  border border-gray-700/30 hover:border-amber-500/20
                  focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/20 
                  font-medium transition-all duration-300 appearance-none
                  bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCA2TDggMTBMMTIgNiIgc3Ryb2tlPSIjZDk3NzA2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] 
                  bg-[length:16px] bg-no-repeat bg-[center_right_1rem]
                  hover:bg-gray-800/30 shadow-sm shadow-amber-500/5
                  hover:shadow-md hover:shadow-amber-500/10"
              >
                {TOP_20_LANGUAGES.map((language) => (
                  <option 
                    key={language} 
                    value={language} 
                    className="font-medium bg-gray-800"
                  >
                    {language}
                  </option>
                ))}
              </select>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranslationSelector; 