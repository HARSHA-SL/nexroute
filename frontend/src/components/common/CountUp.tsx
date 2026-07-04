import { useEffect, useState } from "react";

type CountUpProps = {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
};

export default function CountUp({
  end,
  duration = 1200,
  suffix = "",
  prefix = "",
}: CountUpProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;

    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;

      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration]);

  return (
    <>
      {prefix}
      {count}
      {suffix}
    </>
  );
}