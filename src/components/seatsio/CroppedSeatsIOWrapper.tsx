import React from "react";

interface CroppedSeatsIOWrapperProps {
    children: React.ReactNode;
    cropTop?: number;
    cropRight?: number;
    cropBottom?: number;
    cropLeft?: number;
    className?: string;
}

const CroppedSeatsIOWrapper: React.FC<CroppedSeatsIOWrapperProps> = ({
    children,
    cropTop = 20,
    cropRight = 20,
    cropBottom = 20,
    cropLeft = 20,
    className = "",
}) => {
    return (
        <div
            className={`relative overflow-hidden ${className}`}
            style={{
                // Create the cropping container
                position: "relative",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    // Position the content so the cropped areas are hidden
                    position: "relative",
                    top: `-${cropTop}px`,
                    left: `-${cropLeft}px`,
                    right: `-${cropRight}px`,
                    bottom: `-${cropBottom}px`,
                    width: `calc(100% + ${cropLeft + cropRight}px)`,
                    height: `calc(100% + ${cropTop + cropBottom}px)`,
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default CroppedSeatsIOWrapper;
