export const DashboardGrid = ({ children }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {children}
    </div>
  );
};