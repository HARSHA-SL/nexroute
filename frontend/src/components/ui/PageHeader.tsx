type Props = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export default function PageHeader({
  title,
  description,
  action,
}: Props) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

      <div>
        <h1 className="text-4xl font-bold tracking-tight">
          {title}
        </h1>

        <p className="mt-2 text-zinc-400">
          {description}
        </p>
      </div>

      {action && (
        <div>
          {action}
        </div>
      )}

    </div>
  );
}