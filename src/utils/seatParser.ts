// Utility function to parse seat information for better UX
export const parseSeatInfo = (seatLabel: string) => {
    // Common patterns: "A-1", "Section A Row 1 Seat 6", "h3-X-6", etc.

    // Try pattern: "h3-X-6" (section-row-seat)
    const pattern1 = seatLabel.match(
        /^([a-zA-Z0-9]+)-([a-zA-Z0-9]+)-([a-zA-Z0-9]+)$/
    );
    if (pattern1) {
        return {
            section: pattern1[1],
            row: pattern1[2],
            seat: pattern1[3],
        };
    }

    // Try pattern: "A-1" (row-seat)
    const pattern2 = seatLabel.match(/^([a-zA-Z]+)-?(\d+)$/);
    if (pattern2) {
        return {
            section: null,
            row: pattern2[1],
            seat: pattern2[2],
        };
    }

    // Try pattern: "Section A Row 1 Seat 6"
    const pattern3 = seatLabel.match(
        /Section\s+([a-zA-Z0-9]+)\s+Row\s+([a-zA-Z0-9]+)\s+Seat\s+([a-zA-Z0-9]+)/i
    );
    if (pattern3) {
        return {
            section: pattern3[1],
            row: pattern3[2],
            seat: pattern3[3],
        };
    }

    // Try to extract row and seat from simple formats
    const pattern4 = seatLabel.match(/^([a-zA-Z]+)(\d+)$/);
    if (pattern4) {
        return {
            section: null,
            row: pattern4[1],
            seat: pattern4[2],
        };
    }

    // Default: treat the whole label as seat
    return {
        section: null,
        row: null,
        seat: seatLabel,
    };
};

// Format seat information for display
export const formatSeatDisplay = (seatLabel: string) => {
    const seatInfo = parseSeatInfo(seatLabel);
    
    const parts = [];
    if (seatInfo.section) {
        parts.push(`Section ${seatInfo.section}`);
    }
    if (seatInfo.row) {
        parts.push(`Row ${seatInfo.row}`);
    }
    parts.push(`Seat ${seatInfo.seat}`);
    
    return parts.join(' • ');
}; 
