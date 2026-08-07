interface Props {
  total: number;
  unread: number;
  high: number;
}

export default function NotificationStats({
  total,
  unread,
  high,
}: Props) {
  const cards = [
    {
      title: "Total",
      value: total,
    },
    {
      title: "Unread",
      value: unread,
    },
    {
      title: "High Priority",
      value: high,
    },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-xl border border-[#262B34] bg-[#171B22] p-6"
        >
          <p className="text-sm text-gray-400">
            {card.title}
          </p>

          <h2 className="mt-2 text-3xl font-bold text-white">
            {card.value}
          </h2>
        </div>
      ))}
    </div>
  );
}