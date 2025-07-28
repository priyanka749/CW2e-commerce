// DashboardCard component for dashboard overview
function DashboardCard({ icon, label, description, onClick, bg, text }) {
  return (
    <div
      className={`glass-card cursor-pointer rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center transition-transform duration-200 hover:scale-105 hover:shadow-3xl bg-gradient-to-br ${bg} backdrop-blur-md border border-white/30`}
      onClick={onClick}
      style={{ minHeight: 200 }}
    >
      <div className="mb-4">{icon}</div>
      <div className={`text-2xl font-bold mb-2 drop-shadow-lg ${text}`}>{label}</div>
      <div className={`text-center font-medium drop-shadow ${text}`}>{description}</div>
    </div>
  );
}
export default DashboardCard;
