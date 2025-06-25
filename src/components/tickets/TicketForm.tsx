import { useState } from 'react';

interface TicketFormProps {
  seatId: string;
  onClose: () => void;
  onSubmit: (formData: TicketFormData) => void;
}

export interface TicketFormData {
  audienceType: 'tourist' | 'local';
  ticketType: 'adult' | 'student';
  seatId: string;
}

const TicketForm = ({ seatId, onClose, onSubmit }: TicketFormProps) => {
  const [formData, setFormData] = useState<TicketFormData>({
    audienceType: 'tourist',
    ticketType: 'adult',
    seatId
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full mx-4 border border-gray-700/50
        transform transition-all duration-300 scale-100 opacity-100 shadow-[0_0_25px_rgba(0,0,0,0.3)]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium text-white">Select Ticket Type</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-yellow-400 transition-colors duration-300"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Audience Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className={`py-3 px-4 rounded-xl border-2 transition-all duration-300 ${
                  formData.audienceType === 'tourist'
                    ? 'bg-yellow-400/20 border-yellow-400 text-yellow-400'
                    : 'border-gray-700 text-gray-400 hover:border-yellow-500/50 hover:bg-yellow-400/10'
                }`}
                onClick={() => setFormData({ ...formData, audienceType: 'tourist' })}
              >
                Tourist
              </button>
              <button
                type="button"
                className={`py-3 px-4 rounded-xl border-2 transition-all duration-300 ${
                  formData.audienceType === 'local'
                    ? 'bg-yellow-400/20 border-yellow-400 text-yellow-400'
                    : 'border-gray-700 text-gray-400 hover:border-yellow-500/50 hover:bg-yellow-400/10'
                }`}
                onClick={() => setFormData({ ...formData, audienceType: 'local' })}
              >
                Local
              </button>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Ticket Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className={`py-3 px-4 rounded-xl border-2 transition-all duration-300 ${
                  formData.ticketType === 'adult'
                    ? 'bg-yellow-400/20 border-yellow-400 text-yellow-400'
                    : 'border-gray-700 text-gray-400 hover:border-yellow-500/50 hover:bg-yellow-400/10'
                }`}
                onClick={() => setFormData({ ...formData, ticketType: 'adult' })}
              >
                Adult
              </button>
              <button
                type="button"
                className={`py-3 px-4 rounded-xl border-2 transition-all duration-300 ${
                  formData.ticketType === 'student'
                    ? 'bg-yellow-400/20 border-yellow-400 text-yellow-400'
                    : 'border-gray-700 text-gray-400 hover:border-yellow-500/50 hover:bg-yellow-400/10'
                }`}
                onClick={() => setFormData({ ...formData, ticketType: 'student' })}
              >
                Student
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-700 rounded-lg text-gray-400 
                hover:bg-gray-700/50 hover:text-yellow-400 hover:border-yellow-400/50 
                transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-yellow-400 text-gray-900 rounded-lg font-medium
                hover:bg-yellow-500 transition-all duration-300 transform hover:scale-105
                hover:shadow-[0_0_15px_rgba(250,204,21,0.4)]
                focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketForm; 