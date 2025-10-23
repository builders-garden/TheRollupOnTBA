export const StatsCard = ({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) => (
  <div className="flex flex-col items-center justify-center p-4 rounded-lg border border-border/50 bg-card text-card-foreground shadow">
    <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);
