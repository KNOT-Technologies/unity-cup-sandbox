import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Headphones, AlertCircle, Info } from "lucide-react";
import { getAddons } from "../../api/knot";
import type { Addon, AddonOption } from "../../types/tickets";

const TOP_20_LANGUAGES = [
    "French",
    "German",
    "Italian",
    "Portuguese",
    "Russian",
    "Spanish",
    "Turkish",
    "Bengali",
    "Hindi",
    "Indonesian",
    "Japanese",
    "Korean",
    "Mandarin Chinese",
    "Swahili",
    "Tamil",
    "Thai",
    "Urdu",
    "Vietnamese",
];

interface TranslationSelectorProps {
    onTranslationChange: (
        needsTranslation: boolean,
        language?: string,
        addonId?: string
    ) => void;
    occurrenceId?: string;
    className?: string;
    currency?: "EGP" | "USD";
}

const TranslationSelector: React.FC<TranslationSelectorProps> = ({
    onTranslationChange,
    occurrenceId,
    className = "",
    currency = "EGP",
}) => {
    const [needsTranslation, setNeedsTranslation] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState<string>("English");
    const [addons, setAddons] = useState<Addon[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset translation preferences when occurrence changes
    useEffect(() => {
        if (occurrenceId) {
            loadAddons();
        } else {
            // Reset addons when occurrence is cleared
            setAddons([]);

            // Reset translation preferences
            setNeedsTranslation(false);
            onTranslationChange(false);
        }
    }, [occurrenceId]);

    const loadAddons = async () => {
        if (!occurrenceId) return;

        setLoading(true);
        setError(null);
        try {
            const addonData = await getAddons(occurrenceId);
            setAddons(addonData);
        } catch (err: unknown) {
            const error = err as { error?: string };
            setError(error.error || "Failed to load add-ons");
        } finally {
            setLoading(false);
        }
    };

    const handleTranslationToggle = (value: boolean) => {
        setNeedsTranslation(value);

        // Get price information from the selected addon option
        let prices = null;
        if (value && translationAddon && translationAddon.options.length > 0) {
            const option =
                translationAddon.options.find(
                    (opt) => opt.label === selectedLanguage
                ) || translationAddon.options[0];
            prices = option.prices || { USD: 3, EGP: 50 };
        }

        // Save translation preference with price information
        sessionStorage.setItem(
            "translationPreference",
            JSON.stringify({
                needed: value,
                language: value ? selectedLanguage : undefined,
                prices: prices,
            })
        );

        onTranslationChange(
            value,
            value ? selectedLanguage : undefined,
            value ? translationAddon?._id : undefined
        );
    };

    const handleLanguageChange = (language: string) => {
        setSelectedLanguage(language);

        // Get price information for the selected language
        let prices = null;
        if (
            needsTranslation &&
            translationAddon &&
            translationAddon.options.length > 0
        ) {
            const option =
                translationAddon.options.find(
                    (opt) => opt.label === language
                ) || translationAddon.options[0];
            prices = option.prices || { USD: 3, EGP: 50 };
        }

        // Save translation preference with updated language and price
        sessionStorage.setItem(
            "translationPreference",
            JSON.stringify({
                needed: needsTranslation,
                language: language,
                prices: prices,
            })
        );

        onTranslationChange(
            needsTranslation,
            language,
            needsTranslation ? translationAddon?._id : undefined
        );
    };

    // Get translation addon and check availability
    const translationAddon = addons.find(
        (addon) => addon.type === "translation-headphone"
    );
    const hasQuota = translationAddon && (translationAddon.quota || 0) > 0;
    const isAvailable = !loading && !error && hasQuota;
    const noOccurrenceSelected = !occurrenceId;

    // Get currency symbol
    const getCurrencySymbol = (curr: "EGP" | "USD" = currency) => {
        return curr === "USD" ? "$" : "£";
    };

    // Format price for display with both currencies
    const formatPriceDisplay = (option: AddonOption) => {
        if (!option?.prices) {
            return `${getCurrencySymbol()}${option?.extraCost || 0}`;
        }

        return `${getCurrencySymbol("USD")}${option.prices.USD} for tourists`;
    };

    return (
        <div
            className={`bg-gray-800/20 backdrop-blur-xl rounded-xl p-3 sm:p-6 
      border border-gray-700/20 
      hover:border-amber-500/20 transition-all duration-500 
      hover:shadow-2xl hover:shadow-amber-500/5
      relative before:absolute before:inset-0 
      before:bg-gradient-to-b before:from-amber-500/5 before:to-transparent 
      before:rounded-xl before:opacity-0 hover:before:opacity-100 
      before:transition-opacity before:duration-500 ${className}`}
        >
            <div className="relative">
                <div className="flex items-center gap-3 mb-3 sm:mb-6">
                    <div className="relative">
                        <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-full blur-xl opacity-50"></div>
                        <div
                            className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg sm:rounded-xl p-2 sm:p-2.5 relative
              backdrop-blur-xl border border-amber-500/20 group-hover:border-amber-500/30 transition-colors duration-300"
                        >
                            <Headphones className="w-4 h-4 sm:w-6 sm:h-6 text-amber-400" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm sm:text-lg font-medium bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                            Translation Headphones
                        </h3>
                        {loading && (
                            <p className="text-xs text-white/60">
                                Loading availability...
                            </p>
                        )}
                        {error && (
                            <div className="flex items-center gap-1 mt-1">
                                <AlertCircle className="w-3 h-3 text-red-400" />
                                <p className="text-xs text-red-400">
                                    Service unavailable
                                </p>
                            </div>
                        )}
                        {noOccurrenceSelected && (
                            <div className="flex items-center gap-1 mt-1">
                                <Info className="w-3 h-3 text-blue-400" />
                                <p className="text-xs text-blue-400">
                                    Select a show time to check availability
                                </p>
                            </div>
                        )}
                        {!loading &&
                            !error &&
                            !noOccurrenceSelected &&
                            !hasQuota && (
                                <div className="flex items-center gap-1 mt-1">
                                    <AlertCircle className="w-3 h-3 text-red-400" />
                                    <p className="text-xs text-red-400">
                                        Sold out
                                    </p>
                                </div>
                            )}
                        {isAvailable && translationAddon && (
                            <p className="text-xs text-amber-400 mt-1">
                                Available
                            </p>
                        )}
                    </div>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent mb-3 sm:mb-6"></div>

                <div className="space-y-3 sm:space-y-4">
                    <div className="flex gap-1.5 sm:gap-2">
                        <button
                            onClick={() => handleTranslationToggle(true)}
                            disabled={!isAvailable || noOccurrenceSelected}
                            className={`flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-medium transition-all duration-300 
                relative overflow-hidden group ${
                    needsTranslation
                        ? "bg-gradient-to-br from-amber-500 to-amber-400 text-gray-900 shadow-lg shadow-amber-500/20"
                        : `${
                              isAvailable && !noOccurrenceSelected
                                  ? "bg-gray-800/30 text-white hover:bg-gray-700/30 hover:shadow-lg hover:shadow-amber-500/5"
                                  : "bg-gray-800/20 text-gray-500 cursor-not-allowed"
                          }`
                } ${!isAvailable || noOccurrenceSelected ? "opacity-50" : ""}`}
                        >
                            {needsTranslation && (
                                <div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                  translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"
                                ></div>
                            )}
                            Yes, I need translation
                        </button>
                        <button
                            onClick={() => handleTranslationToggle(false)}
                            className={`flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-medium transition-all duration-300 
                relative overflow-hidden group ${
                    !needsTranslation
                        ? "bg-gradient-to-br from-amber-500 to-amber-400 text-gray-900 shadow-lg shadow-amber-500/20"
                        : "bg-gray-800/30 text-white hover:bg-gray-700/30 hover:shadow-lg hover:shadow-amber-500/5"
                }`}
                        >
                            {!needsTranslation && (
                                <div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                  translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"
                                ></div>
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
                            className="space-y-3 sm:space-y-4"
                        >
                            <div className="space-y-1.5 sm:space-y-2">
                                <label className="block text-xs sm:text-sm font-medium text-white/60">
                                    Select your preferred language:
                                </label>
                                <select
                                    value={selectedLanguage}
                                    onChange={(e) =>
                                        handleLanguageChange(e.target.value)
                                    }
                                    className="w-full bg-gray-800/20 backdrop-blur-sm text-white py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg 
                  border border-gray-700/30 hover:border-amber-500/20
                  focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/20 
                  font-medium transition-all duration-300 appearance-none text-sm sm:text-base
                  bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCA2TDggMTBMMTIgNiIgc3Ryb2tlPSIjZDk3NzA2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] 
                  bg-[length:16px] bg-no-repeat bg-[center_right_1rem]
                  hover:bg-gray-800/30 shadow-sm shadow-amber-500/5
                  hover:shadow-md hover:shadow-amber-500/10"
                                >
                                    {translationAddon &&
                                    translationAddon.options.length > 0
                                        ? translationAddon.options.map(
                                              (option) => (
                                                  <option
                                                      key={option.code}
                                                      value={option.label}
                                                      className="font-medium bg-gray-800"
                                                  >
                                                      {option.label}
                                                  </option>
                                              )
                                          )
                                        : TOP_20_LANGUAGES.map((language) => (
                                              <option
                                                  key={language}
                                                  value={language}
                                                  className="font-medium bg-gray-800"
                                              >
                                                  {language}
                                              </option>
                                          ))}
                                </select>
                                <p className="text-xs text-white/40 mt-1">
                                    One headphone will be provided for each seat
                                </p>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TranslationSelector;
