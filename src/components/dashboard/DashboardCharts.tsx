import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const monthlyTicketData = [
    { month: "Jan 2024", tickets: 150 },
    { month: "Feb 2024", tickets: 450 },
    { month: "Mar 2024", tickets: 950 },
    { month: "Apr 2024", tickets: 650 },
    { month: "May 2024", tickets: 850 },
    { month: "Jun 2024", tickets: 550 },
];

const monthlyCreditData = [
    { month: "Jan 2024", credits: 500 },
    { month: "Feb 2024", credits: 1800 },
    { month: "Mar 2024", credits: 3800 },
    { month: "Apr 2024", credits: 2600 },
    { month: "May 2024", credits: 3400 },
    { month: "Jun 2024", credits: 2200 },
];

const DashboardCharts = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Monthly Ticket Sales Chart */}
            <div
                className="bg-black/20 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden
        hover:border-amber-500/20 transition-all duration-500 
        hover:shadow-2xl hover:shadow-amber-500/5 p-6"
            >
                <h3 className="text-xl font-semibold text-amber-400 mb-6">
                    Monthly Ticket Purchases
                </h3>
                <div className="h-px w-full bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent mb-6"></div>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={monthlyTicketData}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 20,
                            }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(255,255,255,0.1)"
                            />
                            <XAxis
                                dataKey="month"
                                tick={{ fill: "rgba(255,255,255,0.6)" }}
                                tickFormatter={(value) => value.split(" ")[0]}
                                interval={1}
                            />
                            <YAxis
                                tick={{ fill: "rgba(255,255,255,0.6)" }}
                                domain={[0, 1000]}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "rgba(0,0,0,0.8)",
                                    border: "1px solid rgba(245,158,11,0.2)",
                                    borderRadius: "8px",
                                }}
                                itemStyle={{ color: "#f59e0b" }}
                                labelStyle={{ color: "white" }}
                            />
                            <Bar
                                dataKey="tickets"
                                fill="#f59e0b"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Monthly Credit Purchases Chart */}
            <div
                className="bg-black/20 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden
        hover:border-amber-500/20 transition-all duration-500 
        hover:shadow-2xl hover:shadow-amber-500/5 p-6"
            >
                <h3 className="text-xl font-semibold text-amber-400 mb-6">
                    Monthly Credit Purchases
                </h3>
                <div className="h-px w-full bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent mb-6"></div>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={monthlyCreditData}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 20,
                            }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(255,255,255,0.1)"
                            />
                            <XAxis
                                dataKey="month"
                                tick={{ fill: "rgba(255,255,255,0.6)" }}
                                tickFormatter={(value) => value.split(" ")[0]}
                                interval={1}
                            />
                            <YAxis
                                tick={{ fill: "rgba(255,255,255,0.6)" }}
                                domain={[0, 4000]}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "rgba(0,0,0,0.8)",
                                    border: "1px solid rgba(245,158,11,0.2)",
                                    borderRadius: "8px",
                                }}
                                itemStyle={{ color: "#f59e0b" }}
                                labelStyle={{ color: "white" }}
                            />
                            <Bar
                                dataKey="credits"
                                fill="#f59e0b"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default DashboardCharts;
