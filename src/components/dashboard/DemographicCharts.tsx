import { ResponsivePie } from '@nivo/pie';
import { Users, Globe, Calendar } from 'lucide-react';

const ageData = [
  { id: '18-24', label: '18-24', value: 15 },
  { id: '25-34', label: '25-34', value: 30 },
  { id: '35-44', label: '35-44', value: 25 },
  { id: '45-54', label: '45-54', value: 20 },
  { id: '55+', label: '55+', value: 10 },
];

const countryData = [
  { id: 'Germany', label: 'Germany', value: 35 },
  { id: 'Russia', label: 'Russia', value: 25 },
  { id: 'France', label: 'France', value: 15 },
  { id: 'UK', label: 'UK', value: 12 },
  { id: 'Others', label: 'Others', value: 13 },
];

const monthData = [
  { id: 'December', label: 'December', value: 25 },
  { id: 'January', label: 'January', value: 22 },
  { id: 'February', label: 'February', value: 18 },
  { id: 'November', label: 'November', value: 12 },
  { id: 'March', label: 'March', value: 10 },
  { id: 'October', label: 'October', value: 8 },
  { id: 'Others', label: 'Others', value: 5 }
];

interface DemographicBoxProps {
  title: string;
  icon: React.ReactNode;
  data: Array<{ id: string; label: string; value: number }>;
}

const DemographicBox = ({ title, icon, data }: DemographicBoxProps) => (
  <div className="bg-black/20 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden
    hover:border-amber-500/20 transition-all duration-500 
    hover:shadow-2xl hover:shadow-amber-500/5 p-6"
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="relative">
        <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-full blur-xl opacity-50"></div>
        <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-2 relative
          backdrop-blur-xl border border-amber-500/20 transition-[border,background] duration-300 delay-200">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-semibold text-amber-400">{title}</h3>
    </div>

    <div className="h-px w-full bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent mb-6"></div>

    <div className="h-[400px]">
      <ResponsivePie
        data={data}
        margin={{ top: 20, right: 80, bottom: 80, left: 80 }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        borderWidth={1}
        borderColor={{
          from: 'color',
          modifiers: [['darker', 0.2]],
        }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="rgba(255,255,255,0.8)"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: 'color' }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor="rgba(255,255,255,0.9)"
        colors={[
          'rgba(245,158,11,0.8)',
          'rgba(245,158,11,0.7)',
          'rgba(245,158,11,0.6)',
          'rgba(245,158,11,0.5)',
          'rgba(245,158,11,0.4)',
        ]}
        theme={{
          background: 'transparent',
          text: {
            color: 'rgba(255,255,255,0.8)',
            fontSize: 12,
          },
          axis: {
            domain: {
              line: {
                stroke: 'rgba(255,255,255,0.2)',
              },
            },
            ticks: {
              line: {
                stroke: 'rgba(255,255,255,0.2)',
              },
            },
          },
          tooltip: {
            container: {
              background: 'rgba(0,0,0,0.8)',
              color: 'white',
              fontSize: '12px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
            },
          },
        }}
      />
    </div>
  </div>
);

const DemographicCharts = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
      <DemographicBox
        title="Age Distribution"
        icon={<Users className="w-5 h-5 text-amber-400" />}
        data={ageData}
      />
      <DemographicBox
        title="Top Countries"
        icon={<Globe className="w-5 h-5 text-amber-400" />}
        data={countryData}
      />
      <DemographicBox
        title="Top Months"
        icon={<Calendar className="w-5 h-5 text-amber-400" />}
        data={monthData}
      />
    </div>
  );
};

export default DemographicCharts; 