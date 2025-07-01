import { motion } from "framer-motion";
import {
    Upload,
    X,
    FileSpreadsheet,
    Check,
    Loader2,
    Shield,
    Zap,
} from "lucide-react";
import Portal from "./Portal";
import { useState } from "react";

interface GuestUploadModalProps {
    onClose: () => void;
    onUpload: (file: File) => Promise<number>;
    occurrenceId?: string;
}

type ProcessStep = "uploading" | "validating" | "optimizing" | "complete";

const GuestUploadModal = ({
    onClose,
    onUpload,
    occurrenceId,
}: GuestUploadModalProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [guestsUploaded, setGuestsUploaded] = useState(0);
    const [currentStep, setCurrentStep] = useState<ProcessStep>("uploading");
    const [stepProgress, setStepProgress] = useState(0);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (
            selectedFile &&
            (selectedFile.type === "application/vnd.ms-excel" ||
                selectedFile.type ===
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                selectedFile.type === "text/csv")
        ) {
            setFile(selectedFile);
        }
    };

    const simulateStep = async (step: ProcessStep, duration: number) => {
        setCurrentStep(step);
        setStepProgress(0);

        const interval = setInterval(() => {
            setStepProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 2;
            });
        }, duration / 50);

        await new Promise((resolve) => setTimeout(resolve, duration));
        clearInterval(interval);
        setStepProgress(100);
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        try {
            // Step 1: Uploading guest details
            await simulateStep("uploading", 2000);

            // Step 2: Validating ticket restrictions
            await simulateStep("validating", 1500);

            // Step 3: Optimizing seat allocations
            await simulateStep("optimizing", 1800);

            // Step 4: Complete
            setCurrentStep("complete");

            const count = await onUpload(file);
            setGuestsUploaded(count);
            setUploadSuccess(true);

            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const getStepIcon = (step: ProcessStep) => {
        switch (step) {
            case "uploading":
                return <Upload className="w-5 h-5" />;
            case "validating":
                return <Shield className="w-5 h-5" />;
            case "optimizing":
                return <Zap className="w-5 h-5" />;
            case "complete":
                return <Check className="w-5 h-5" />;
        }
    };

    const getStepTitle = (step: ProcessStep) => {
        switch (step) {
            case "uploading":
                return "Uploading Guest Details";
            case "validating":
                return "Validating Ticket Restrictions";
            case "optimizing":
                return "Optimizing Seat Allocations";
            case "complete":
                return "Processing Complete";
        }
    };

    const getStepDescription = (step: ProcessStep) => {
        switch (step) {
            case "uploading":
                return "Reading and processing guest information from file...";
            case "validating":
                return "Checking age restrictions and ticket type requirements...";
            case "optimizing":
                return "Finding optimal seating arrangements for your group...";
            case "complete":
                return "All guests have been successfully processed!";
        }
    };

    return (
        <Portal>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center"
                onClick={onClose}
            >
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{
                        type: "spring",
                        bounce: 0.1,
                        duration: 0.4,
                        opacity: { duration: 0.2 },
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-gray-800/95 backdrop-blur-xl rounded-xl border border-gray-700/20 
            motion-safe:animate-fade-in motion-safe:animate-duration-500
            hover:border-purple-500/20 transition-[border,shadow] duration-300 delay-200
            hover:shadow-2xl hover:shadow-purple-500/5 p-6 w-[500px]
            relative before:absolute before:inset-0 
            before:bg-gradient-to-b before:from-purple-500/5 before:to-transparent 
            before:rounded-xl before:opacity-0 hover:before:opacity-100 
            before:transition-opacity before:duration-300 before:delay-200
            relative z-10"
                >
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/30 to-purple-500/0 rounded-full blur-xl opacity-50"></div>
                                    <div
                                        className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-lg p-2 relative
                    backdrop-blur-xl border border-purple-500/20 transition-[border,background] duration-300 delay-200"
                                    >
                                        <FileSpreadsheet className="w-5 h-5 text-purple-400" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-base font-medium bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                                        Upload Guest Details
                                    </h3>
                                    <p className="text-sm font-medium text-white/60">
                                        Select an Excel or CSV file
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-white/60 hover:text-white/80 transition-colors duration-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="h-px w-full bg-gradient-to-r from-purple-500/20 via-purple-500/10 to-transparent mb-6"></div>

                        {!uploadSuccess ? (
                            <>
                                {!isUploading ? (
                                    <>
                                        <input
                                            type="file"
                                            accept=".xlsx,.xls,.csv"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="guest-file-upload"
                                        />
                                        <label
                                            htmlFor="guest-file-upload"
                                            className="block w-full border-2 border-dashed border-purple-500/20 rounded-lg p-6
                        hover:border-purple-500/40 transition-all duration-300 cursor-pointer
                        text-center"
                                        >
                                            <Upload className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                                            <p className="text-white/80 mb-1">
                                                {file
                                                    ? file.name
                                                    : "Click to select file"}
                                            </p>
                                            <p className="text-white/60 text-sm">
                                                Supports Excel and CSV files
                                            </p>
                                        </label>

                                        {!occurrenceId && (
                                            <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                                <p className="text-amber-400 text-sm text-center">
                                                    Please select a date and
                                                    show time before uploading
                                                    guest details.
                                                </p>
                                            </div>
                                        )}

                                        <button
                                            onClick={handleUpload}
                                            disabled={
                                                !file ||
                                                isUploading ||
                                                !occurrenceId
                                            }
                                            className={`w-full mt-6 px-4 py-3 rounded-lg flex items-center justify-center gap-2
                        transition-all duration-300 ${
                            file && !isUploading && occurrenceId
                                ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg hover:shadow-purple-500/20"
                                : "bg-gray-700/50 text-white/50 cursor-not-allowed"
                        }`}
                                        >
                                            <Upload className="w-5 h-5" />
                                            <span>Upload File</span>
                                        </button>
                                    </>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Progress Steps */}
                                        <div className="space-y-4">
                                            {(
                                                [
                                                    "uploading",
                                                    "validating",
                                                    "optimizing",
                                                ] as ProcessStep[]
                                            ).map((step) => {
                                                const stepIndex = [
                                                    "uploading",
                                                    "validating",
                                                    "optimizing",
                                                ].indexOf(step);
                                                const currentStepIndex = [
                                                    "uploading",
                                                    "validating",
                                                    "optimizing",
                                                ].indexOf(currentStep);
                                                const isCompleted =
                                                    stepIndex <
                                                    currentStepIndex;
                                                const isCurrent =
                                                    stepIndex ===
                                                    currentStepIndex;

                                                return (
                                                    <div
                                                        key={step}
                                                        className="flex items-center gap-4"
                                                    >
                                                        <div className="relative">
                                                            <div
                                                                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                                                                    isCurrent
                                                                        ? "bg-purple-500/20 border border-purple-500/40"
                                                                        : isCompleted
                                                                        ? "bg-green-500/20 border border-green-500/40"
                                                                        : "bg-gray-700/30 border border-gray-700/50"
                                                                }`}
                                                            >
                                                                {isCurrent &&
                                                                stepProgress <
                                                                    100 ? (
                                                                    <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                                                                ) : isCompleted ? (
                                                                    <Check className="w-5 h-5 text-green-400" />
                                                                ) : (
                                                                    getStepIcon(
                                                                        step
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4
                                                                className={`text-sm font-medium transition-colors duration-300 ${
                                                                    isCurrent
                                                                        ? "text-purple-400"
                                                                        : isCompleted
                                                                        ? "text-green-400"
                                                                        : "text-white/60"
                                                                }`}
                                                            >
                                                                {getStepTitle(
                                                                    step
                                                                )}
                                                            </h4>
                                                            <p className="text-xs text-white/40 mt-0.5">
                                                                {getStepDescription(
                                                                    step
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs text-white/60">
                                                <span>Processing...</span>
                                                <span>{stepProgress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-700/30 rounded-full h-2">
                                                <motion.div
                                                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
                                                    initial={{ width: 0 }}
                                                    animate={{
                                                        width: `${stepProgress}%`,
                                                    }}
                                                    transition={{
                                                        duration: 0.3,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-4">
                                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                                    <Check className="w-6 h-6 text-green-400" />
                                </div>
                                <p className="text-white font-medium mb-1">
                                    Upload Successful!
                                </p>
                                <p className="text-white/60">
                                    {guestsUploaded} guest
                                    {guestsUploaded !== 1 ? "s" : ""} uploaded
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </Portal>
    );
};

export default GuestUploadModal;
