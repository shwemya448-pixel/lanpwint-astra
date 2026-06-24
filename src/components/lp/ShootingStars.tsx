export function ShootingStars() {
  const stars = [
    { top: "-8%", left: "12%", delay: "0s", dur: "2.8s", dx: "220px", dy: "900px", angle: "76deg" },
    { top: "-10%", left: "38%", delay: "1.6s", dur: "3.2s", dx: "180px", dy: "1100px", angle: "81deg" },
    { top: "-6%", left: "62%", delay: "3.1s", dur: "2.6s", dx: "260px", dy: "880px", angle: "73deg" },
    { top: "-12%", left: "82%", delay: "4.7s", dur: "3.4s", dx: "140px", dy: "1050px", angle: "82deg" },
    { top: "-9%", left: "24%", delay: "6.4s", dur: "3.0s", dx: "300px", dy: "950px", angle: "72deg" },
  ];
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {stars.map((s, i) => (
        <span
          key={i}
          className="lp-shooting-star"
          style={{
            top: s.top,
            left: s.left,
            animationDelay: s.delay,
            animationDuration: s.dur,
            ["--dx" as never]: s.dx,
            ["--dy" as never]: s.dy,
            ["--angle" as never]: s.angle,
          }}
        />
      ))}
    </div>
  );
}
